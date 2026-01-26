'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  ChatCircle,
  MagnifyingGlass,
  PaperPlaneTilt,
  X,
  Circle,
  User,
  Clock,
  CheckCircle,
  Image,
  Lock,
} from '@phosphor-icons/react'
import { useAdminTheme } from '../hooks/useTheme'
import { getThemeClasses } from '../utils/theme'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'
import { socketManager, Message } from '@/lib/socket'
import { getAuthToken } from '@/lib/auth'
import { formatMessageTime } from '@/lib/dateUtils'
import { playNotificationSound, enableAudio } from '@/lib/soundUtils'

interface Conversation {
  id: string
  userId?: string | null
  guestId?: string | null
  adminId?: string | null
  type: 'general' | 'onboarding' | 'call_request'
  subject?: string | null
  status: 'open' | 'closed' | 'resolved'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  lastMessageAt?: string | null
  unreadCount?: number  // Backend-provided unread count
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    email: string
    firstName?: string
    lastName?: string
  }
}

function AdminSupportPageContent() {
  const searchParams = useSearchParams()
  const isDark = useAdminTheme()
  const theme = getThemeClasses(isDark)
  const toast = useToast()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [standardMessages, setStandardMessages] = useState<any>(null)
  const [showStandardMessages, setShowStandardMessages] = useState(false)
  const [messageInput, setMessageInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [forceUpdate, setForceUpdate] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [closingConversation, setClosingConversation] = useState(false)
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const conversationIdRef = useRef<string | null>(null)
  const reconnectIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastMessageIdRef = useRef<string | null>(null) // Track last message to detect new ones
  const fileInputRef = useRef<HTMLInputElement>(null)
  const userIdHandledRef = useRef<string | null>(null) // Track if we've already handled userId from URL

  // Update unread count in localStorage (shared with admin layout)
  const updateUnreadCount = (count: number) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminSupportUnreadCount', count.toString())
      // Dispatch custom event to notify admin layout
      window.dispatchEvent(new CustomEvent('adminSupportUnreadCountChanged', { detail: count }))
    }
  }

  // Calculate total unread count from conversations (using backend-provided unreadCount)
  const calculateTotalUnreadCount = (): number => {
    return conversations.reduce((total, conv) => {
      return total + (conv.unreadCount || 0)
    }, 0)
  }

  // Update total unread count and notify other components
  const updateTotalUnreadCount = () => {
    const total = calculateTotalUnreadCount()
    updateUnreadCount(total)
  }

  // Update unread count for a specific conversation
  const updateConversationUnreadCount = (conversationId: string, count: number) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId ? { ...conv, unreadCount: count } : conv
    ))
    // Update total unread count after updating individual conversation
    setTimeout(() => {
      updateTotalUnreadCount()
    }, 0)
  }

  // Load standard messages
  const loadStandardMessages = async () => {
    try {
      const response = await api.support.getStandardMessages()
      if (response.success && response.data) {
        const data = response.data as any
        setStandardMessages(data.messages || {})
      }
    } catch (error) {
      console.error('Failed to load standard messages:', error)
    }
  }

  useEffect(() => {
    // Enable audio on page load
    enableAudio()
    
    // Load standard messages
    loadStandardMessages()
    
    // Initialize unread count from localStorage (in case page was refreshed)
    const savedCount = parseInt(localStorage.getItem('adminSupportUnreadCount') || '0', 10)
    if (savedCount > 0) {
      updateUnreadCount(savedCount)
    }
    
    // Reset userId handled ref when component mounts
    userIdHandledRef.current = null
    
    // Fetch conversations with userId from URL if present
    const userId = searchParams?.get('userId')
    fetchConversations(userId)
    connectSocket()
    
    // Set up reconnection handler
    const handleReconnect = () => {
      console.log('Socket reconnected, rejoining conversation')
      if (selectedConversation) {
        // Wait a bit for connection to stabilize
        setTimeout(() => {
          joinConversation(selectedConversation.id)
          // Reload messages to ensure we have latest
          fetchMessages(selectedConversation.id)
        }, 500)
      }
      // Refresh conversation list (without auto-selecting)
      fetchConversations(null)
    }
    
    socketManager.onConnect(handleReconnect)
    
    return () => {
      // Clear reconnect interval
      if (reconnectIntervalRef.current) {
        clearInterval(reconnectIntervalRef.current)
        reconnectIntervalRef.current = null
      }
      
      // Remove event listeners
      socketManager.offMessageReceived(handleNewMessage)
      socketManager.offConversationNewMessage(handleConversationNewMessage)
      socketManager.offTypingStart(handleTypingStart)
      socketManager.offTypingStop(handleTypingStop)
      socketManager.offError(handleSocketError)
      socketManager.offUnreadCountUpdated(handleUnreadCountUpdated)
      socketManager.offConnect(handleReconnect)
      socketManager.offConnect(() => {}) // Also remove the one in setupSocketListeners
      socketManager.offDisconnect(() => {})
      
      // Leave conversation if connected
      if (selectedConversation && socketManager.isConnected()) {
        socketManager.leaveConversation(selectedConversation.id)
      }
      
      // Don't disconnect - keep connection alive for reconnection
    }
  }, [])

  // Reset unread count when conversation is selected (admin is viewing messages)
  useEffect(() => {
    if (selectedConversation) {
      // Mark all unread messages in selected conversation as read
      setMessages(prev => {
        const unreadMessages = prev.filter(m => 
          (m.senderType === 'user' || m.senderType === 'guest') && !m.isRead
        )
        
        // Mark all unread messages as read
        unreadMessages.forEach(m => {
          socketManager.markMessageRead(m.id)
        })
        
        const updated = prev.map(m => {
          if ((m.senderType === 'user' || m.senderType === 'guest') && !m.isRead) {
            return { ...m, isRead: true }
          }
          return m
        })
        
        // Refresh conversations to get updated unreadCount from backend
        setTimeout(() => {
          fetchConversations(null)
        }, 500)
        
        return updated
      })
    }
  }, [selectedConversation])

  useEffect(() => {
    if (selectedConversation) {
      conversationIdRef.current = selectedConversation.id
      fetchMessages(selectedConversation.id)
      // Ensure socket is connected before joining
      if (socketManager.isConnected()) {
        joinConversation(selectedConversation.id)
      } else {
        // Connect first, then join
        connectSocket().then(() => {
          joinConversation(selectedConversation.id)
        })
      }
    } else {
      conversationIdRef.current = null
    }
    return () => {
      if (selectedConversation && socketManager.isConnected()) {
        socketManager.leaveConversation(selectedConversation.id)
      }
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const connectSocket = async () => {
    try {
      // Check if already connected
      if (socketManager.isConnected()) {
        setIsConnected(true)
        // Just set up listeners
        setupSocketListeners()
        return
      }
      
      const token = getAuthToken()
      if (!token) {
        toast.error('Not authenticated')
        return
      }
      await socketManager.connect(token)
      setIsConnected(true)
      setupSocketListeners()
    } catch (error) {
      console.error('Socket connection error:', error)
      setIsConnected(false)
      toast.error('Failed to connect to chat server')
    }
  }

  // Listen for unread count updates from backend
  const handleUnreadCountUpdated = (data: { conversationId: string; unreadCount: number; totalUnreadCount?: number }) => {
    // Update conversation in list
    setConversations(prev => prev.map(conv => 
      conv.id === data.conversationId 
        ? { ...conv, unreadCount: data.unreadCount }
        : conv
    ))
    
    // Update total unread count (use backend-provided total if available, otherwise calculate)
    if (data.totalUnreadCount !== undefined) {
      updateUnreadCount(data.totalUnreadCount)
    } else {
      updateTotalUnreadCount()
    }
  }

  const setupSocketListeners = () => {
    // Remove old listeners first to avoid duplicates
    socketManager.offMessageReceived(handleNewMessage)
    socketManager.offConversationNewMessage(handleConversationNewMessage)
    socketManager.offTypingStart(handleTypingStart)
    socketManager.offTypingStop(handleTypingStop)
    socketManager.offError(handleSocketError)
    socketManager.offUnreadCountUpdated(handleUnreadCountUpdated)
    socketManager.offConnect(() => {})
    socketManager.offDisconnect(() => {})
    
    // Add listeners
    socketManager.onMessageReceived(handleNewMessage)
    socketManager.onConversationNewMessage(handleConversationNewMessage)
    socketManager.onTypingStart(handleTypingStart)
    socketManager.onTypingStop(handleTypingStop)
    socketManager.onError(handleSocketError)
    socketManager.onUnreadCountUpdated(handleUnreadCountUpdated)
    
    // Connection status listeners
    socketManager.onConnect(() => {
      console.log('Socket connected')
      setIsConnected(true)
      // Rejoin conversation if one is selected
      if (selectedConversation) {
        setTimeout(() => {
          joinConversation(selectedConversation.id)
          fetchMessages(selectedConversation.id)
        }, 500)
      }
    })
    
    socketManager.onDisconnect(() => {
      console.log('Socket disconnected')
      setIsConnected(false)
      // Try to reconnect
      if (reconnectIntervalRef.current) {
        clearInterval(reconnectIntervalRef.current)
      }
      reconnectIntervalRef.current = setInterval(() => {
        if (!socketManager.isConnected()) {
          console.log('Attempting to reconnect...')
          connectSocket()
        } else {
          if (reconnectIntervalRef.current) {
            clearInterval(reconnectIntervalRef.current)
            reconnectIntervalRef.current = null
          }
        }
      }, 3000)
    })
  }

  const fetchConversations = async (autoSelectUserId?: string | null) => {
    setIsLoading(true)
    try {
      const userId = autoSelectUserId || searchParams?.get('userId')
      const response = await api.support.getConversations({
        page: 1,
        limit: 50,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(userId && { userId }),
      })
      if (response.success && response.data) {
        const data = response.data as any
        const convs = data.conversations || data || []
        setConversations(convs)
        
        // If userId is provided and we haven't handled it yet, select the conversation
        if (userId && userId !== userIdHandledRef.current && convs.length > 0) {
          // Find conversation for this user
          const userConversation = convs.find((conv: any) => conv.userId === userId)
          if (userConversation && selectedConversation?.id !== userConversation.id) {
            setSelectedConversation(userConversation)
            userIdHandledRef.current = userId
          } else if (convs.length > 0 && !selectedConversation) {
            // If no exact match and no conversation selected, select first one
            setSelectedConversation(convs[0])
            userIdHandledRef.current = userId
          }
        }
        
        // Update total unread count from backend-provided counts
        updateTotalUnreadCount()
      }
    } catch (error) {
      if (error instanceof ApiError) {
        // 401 errors are handled by API layer (redirects to login)
        if (error.status !== 401) {
          toast.error(error.message || 'Failed to load conversations')
        }
      } else {
        toast.error('Failed to load conversations')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMessages = async (conversationId: string, pageNum: number = 1) => {
    setIsLoadingMessages(true)
    try {
      const response = await api.support.getConversationMessages(conversationId, {
        page: pageNum,
        limit: 50,
      })
      if (response.success && response.data) {
        const data = response.data as any
        const newMessages = data.messages || []
        
        // Normalize all timestamps to ensure they're in UTC format
        // This handles cases where backend might send timestamps without 'Z' or in wrong format
        const normalizedMessages = newMessages.map((msg: Message) => {
          if (msg.createdAt) {
            // Ensure createdAt is in UTC ISO format
            const date = new Date(msg.createdAt)
            if (!isNaN(date.getTime())) {
              return {
                ...msg,
                createdAt: date.toISOString(), // Force UTC ISO string
              }
            }
          }
          return msg
        })
        
        // Sort messages by createdAt (oldest first for display)
        const sortedMessages = normalizedMessages.sort((a: Message, b: Message) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
        
        if (pageNum === 1) {
          console.log('📥 Loaded messages from REST API (page 1):', {
            count: sortedMessages.length,
            sampleTimestamps: sortedMessages.slice(0, 3).map((m: Message) => ({
              id: m.id,
              original: m.createdAt,
              normalized: new Date(m.createdAt).toISOString(),
              display: formatMessageTime(m.createdAt)
            }))
          })
          setMessages(sortedMessages)
          
          // Set last message ID
          if (sortedMessages.length > 0) {
            lastMessageIdRef.current = sortedMessages[sortedMessages.length - 1].id
          }
          
          // Refresh conversations to get updated unreadCount from backend
          fetchConversations(null)
        } else {
          setMessages(prev => {
            const combined = [...sortedMessages, ...prev]
            // Re-sort combined array
            return combined.sort((a, b) => 
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            )
          })
        }
        setHasMore((data.pagination?.totalPages || 1) > pageNum)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message || 'Failed to load messages')
      }
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const joinConversation = (conversationId: string) => {
    if (!socketManager.isConnected()) {
      // Try to reconnect
      connectSocket().then(() => {
        socketManager.joinConversation(conversationId)
      })
      return
    }
    socketManager.joinConversation(conversationId)
  }

  const handleNewMessage = (message: Message) => {
    console.log('Admin received message:', message)
    // Debug timestamp issue
    if (message.createdAt) {
      const receivedTime = new Date(message.createdAt)
      const now = new Date()
      const timeDiff = Math.abs(receivedTime.getTime() - now.getTime()) / 1000 / 60 // minutes
      console.log('🔍 Timestamp Debug:', {
        received: message.createdAt,
        parsed: receivedTime.toISOString(),
        localDisplay: formatMessageTime(message.createdAt),
        currentTime: now.toISOString(),
        timeDiffMinutes: timeDiff,
        senderType: message.senderType,
        isOwnMessage: message.senderType === 'admin'
      })
    }
    console.log('Current conversation ID:', conversationIdRef.current)
    console.log('Message conversation ID:', message.conversationId)
    console.log('Selected conversation:', selectedConversation?.id)
    
    // Check against both ref and state to handle async updates
    const currentConvId = conversationIdRef.current || selectedConversation?.id
    
    if (currentConvId && message.conversationId === currentConvId) {
      console.log('✅ Message matches conversation, adding to state')
      setMessages(prev => {
        // Check if message already exists to avoid duplicates
        const exists = prev.some(m => m.id === message.id)
        if (exists) {
          console.log('⚠️ Message already exists, skipping')
          return prev
        }
        
        // Check if this is a server response to our temp message
        // Match by: same text, same sender type, and temp message was created recently
        // DON'T match by timestamp because backend might send wrong timestamp
        const tempMessageIndex = prev.findIndex(m => {
          if (!m.id.startsWith('temp_')) return false
          if (m.message.trim() !== message.message.trim()) return false
          if (m.senderType !== message.senderType) return false
          // Check if temp message was created recently (within last 30 seconds)
          // This is more lenient to handle backend timestamp issues
          const tempTime = new Date(m.createdAt).getTime()
          const now = Date.now()
          const timeSinceTemp = now - tempTime
          return timeSinceTemp < 30000 // 30 seconds - enough time even if backend is slow
        })
        
        let newMessages = [...prev]
        if (tempMessageIndex !== -1) {
          const tempMsg = prev[tempMessageIndex]
          console.log('✅ Replacing temp message with server message', {
            tempId: tempMsg.id,
            tempTime: tempMsg.createdAt,
            tempDisplay: formatMessageTime(tempMsg.createdAt),
            serverId: message.id,
            serverTime: message.createdAt,
            serverDisplay: formatMessageTime(message.createdAt),
            timeDiff: Math.abs(new Date(tempMsg.createdAt).getTime() - new Date(message.createdAt).getTime()) / 1000,
            messageText: message.message
          })
          newMessages[tempMessageIndex] = message
        } else {
          console.log('✅ Adding new message, previous count:', prev.length, {
            messageId: message.id,
            messageText: message.message,
            senderType: message.senderType,
            timestamp: message.createdAt,
            displayTime: formatMessageTime(message.createdAt)
          })
          newMessages = [...prev, message]
        }
        
        // Sort by timestamp
        newMessages = newMessages.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
        
        // Check if this is a new message (not from current admin)
        const isNewMessage = message.id !== lastMessageIdRef.current && 
                            (message.senderType === 'user' || message.senderType === 'guest')
        
        if (isNewMessage) {
          lastMessageIdRef.current = message.id
          
          // Play sound notification (only if not viewing this conversation)
          if (message.conversationId !== selectedConversation?.id) {
            playNotificationSound()
          }
          
          // Update unread count for this conversation
          const conversationUnreadCount = newMessages.filter(m => 
            (m.senderType === 'user' || m.senderType === 'guest') && !m.isRead
          ).length
          updateConversationUnreadCount(message.conversationId, conversationUnreadCount)
        } else if (currentConvId && message.conversationId === currentConvId) {
          // Message is in current conversation, update count
          const conversationUnreadCount = newMessages.filter(m => 
            (m.senderType === 'user' || m.senderType === 'guest') && !m.isRead
          ).length
          updateConversationUnreadCount(message.conversationId, conversationUnreadCount)
        }
        
        console.log('✅ New message count:', newMessages.length)
        // Force re-render
        setForceUpdate(prev => prev + 1)
        return newMessages
      })
      // Mark as read if from user/guest and conversation is selected
      if ((message.senderType === 'user' || message.senderType === 'guest') && selectedConversation && message.conversationId === selectedConversation.id) {
        socketManager.markMessageRead(message.id)
        // Backend will update unreadCount, refresh conversations
        // We'll refresh after a short delay to allow backend to process
        setTimeout(() => {
          fetchConversations(null)
        }, 500)
      }
      // Scroll to bottom after a brief delay
      setTimeout(() => {
        scrollToBottom()
      }, 100)
    } else {
      console.log('❌ Message conversation mismatch:', {
        currentConvId,
        messageConvId: message.conversationId,
        selectedConvId: selectedConversation?.id
      })
    }
  }

  const handleConversationNewMessage = (data: { conversationId: string; message: Message }) => {
    // This is a new message in a conversation we're not currently viewing
    if (data.conversationId !== selectedConversation?.id) {
      // Play sound notification
      playNotificationSound()
      
      // Refresh conversations to get updated unreadCount from backend
      fetchConversations()
    }
  }

  const handleTypingStart = (data: { conversationId: string; senderId: string }) => {
    if (selectedConversation && data.conversationId === selectedConversation.id) {
      setTypingUsers(prev => new Set(prev).add(data.senderId))
    }
  }

  const handleTypingStop = (data: { conversationId: string; senderId: string }) => {
    if (selectedConversation && data.conversationId === selectedConversation.id) {
      setTypingUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(data.senderId)
        return newSet
      })
    }
  }

  const handleSocketError = (error: { error: string }) => {
    toast.error(error.error || 'Socket error occurred')
  }

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return

    const messageText = messageInput.trim()
    const tempId = `temp_${Date.now()}`
    setMessageInput('')
    stopTyping()

    // Optimistically add message to UI (will be replaced by server message)
    const tempMessage: Message = {
      id: tempId,
      conversationId: selectedConversation.id,
      senderId: null,
      senderType: 'admin',
      message: messageText,
      messageType: 'text',
      isRead: false,
      createdAt: new Date().toISOString(),
    }
    setMessages(prev => {
      const newMessages = [...prev, tempMessage]
      // Sort by timestamp
      return newMessages.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    })

    const success = socketManager.sendMessage(selectedConversation.id, messageText)
    if (!success) {
      // Remove temp message if send failed
      setMessages(prev => prev.filter(m => m.id !== tempId))
      toast.error('Failed to send message. Please check your connection.')
    }
  }

  const handleInputChange = (value: string) => {
    setMessageInput(value)
    if (!isTyping && value.trim() && selectedConversation && socketManager.isConnected()) {
      setIsTyping(true)
      socketManager.startTyping(selectedConversation.id)
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping()
    }, 3000)
  }

  const stopTyping = () => {
    if (isTyping && selectedConversation && socketManager.isConnected()) {
      socketManager.stopTyping(selectedConversation.id)
      setIsTyping(false)
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleFileUpload = async (file: File) => {
    if (!selectedConversation) {
      toast.error('No conversation selected')
      return
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload jpg, jpeg, png, or webp images only.')
      return
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      toast.error('File size exceeds 10MB limit')
      return
    }

    setUploadingFile(true)
    try {
      const response = await api.support.uploadFile(selectedConversation.id, file, messageInput.trim() || undefined)
      if (response.success) {
        setMessageInput('')
        toast.success('Image uploaded successfully')
        // Message will be received via WebSocket
      } else {
        toast.error(response.message || 'Failed to upload image')
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message || 'Failed to upload image')
      } else {
        toast.error('Failed to upload image')
      }
    } finally {
      setUploadingFile(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleCloseConversation = async () => {
    if (!selectedConversation) return

    setClosingConversation(true)
    try {
      const response = await api.support.updateConversationStatus(selectedConversation.id, 'closed')
      if (response.success) {
        toast.success('Conversation closed successfully')
        // Update selected conversation status immediately
        setSelectedConversation(prev => prev ? { ...prev, status: 'closed' } : null)
        // Update in conversations list
        setConversations(prev => prev.map(conv => 
          conv.id === selectedConversation.id ? { ...conv, status: 'closed' } : conv
        ))
        // Refresh conversations list to get updated data
        await fetchConversations(null)
        setShowCloseConfirm(false)
      } else {
        toast.error(response.message || 'Failed to close conversation')
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message || 'Failed to close conversation')
      } else {
        toast.error('Failed to close conversation')
      }
    } finally {
      setClosingConversation(false)
    }
  }

  const handleQuickReply = (message: string) => {
    setMessageInput(message)
    setShowStandardMessages(false)
  }

  const filteredConversations = conversations.filter(conv => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const userEmail = conv.user?.email?.toLowerCase() || ''
      const subject = conv.subject?.toLowerCase() || ''
      return userEmail.includes(query) || subject.includes(query)
    }
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-500'
      case 'closed':
        return 'bg-gray-500'
      case 'resolved':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-400'
      case 'high':
        return 'text-orange-400'
      case 'normal':
        return 'text-yellow-400'
      case 'low':
        return 'text-gray-400'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <div className="h-[calc(100vh-120px)] sm:h-[calc(100vh-140px)] flex flex-col lg:flex-row overflow-hidden">
      {/* Conversations List - Hidden on mobile when chat is open, shown on desktop */}
      <div className={`${selectedConversation ? 'hidden lg:flex' : 'flex'} w-full lg:w-80 border-r ${isDark ? 'border-white/10' : 'border-gray-200'} flex flex-col min-h-0`}>
        <div className={`p-3 sm:p-4 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <h2 className={`font-monument font-bold text-lg sm:text-xl mb-3 sm:mb-4 ${theme.text.primary}`}>
            Conversations
          </h2>
          
          {/* Search */}
          <div className="relative mb-3">
            <MagnifyingGlass
              size={18}
              weight="regular"
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.text.muted}`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className={`w-full pl-10 pr-4 py-2 rounded-lg ${theme.bg.input} border-2 ${
                isDark ? 'border-white/20' : 'border-gray-300'
              } ${theme.text.primary} focus:outline-none focus:ring-2 focus:ring-tiktok-primary font-sequel text-sm`}
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={async (e) => {
              const newStatus = e.target.value
              setStatusFilter(newStatus)
              // Fetch conversations with the correct filter
              setIsLoading(true)
              try {
                const status = newStatus === 'all' ? undefined : newStatus
                const response = await api.support.getConversations({
                  page: 1,
                  limit: 50,
                  ...(status && { status }),
                })
                if (response.success && response.data) {
                  const data = response.data as any
                  const convs = data.conversations || data || []
                  setConversations(convs)
                  updateTotalUnreadCount()
                }
              } catch (error) {
                console.error('Failed to fetch conversations:', error)
                if (error instanceof ApiError && error.status !== 401) {
                  toast.error(error.message || 'Failed to load conversations')
                }
              } finally {
                setIsLoading(false)
              }
            }}
            className={`w-full px-3 py-2 rounded-lg ${theme.bg.input} border-2 ${
              isDark ? 'border-white/20' : 'border-gray-300'
            } ${theme.text.primary} focus:outline-none focus:ring-2 focus:ring-tiktok-primary font-sequel text-sm`}
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto overscroll-contain min-h-0">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="w-6 h-6 border-2 border-tiktok-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className={`text-sm font-sequel ${theme.text.muted}`}>Loading...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center">
              <p className={`text-sm font-sequel ${theme.text.muted}`}>No conversations found</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full text-left p-3 sm:p-4 border-b transition-colors ${
                  selectedConversation?.id === conv.id
                    ? isDark
                      ? 'bg-white/10 border-tiktok-primary'
                      : 'bg-tiktok-primary/10 border-tiktok-primary'
                    : isDark
                    ? 'border-white/10 hover:bg-white/5'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Circle size={8} weight="fill" className={getStatusColor(conv.status)} />
                    <span className={`font-semibold font-sequel text-sm ${theme.text.primary}`}>
                      {conv.user?.email || conv.guestId || 'Anonymous'}
                    </span>
                  </div>
                  <span className={`text-xs font-sequel ${getPriorityColor(conv.priority)}`}>
                    {conv.priority}
                  </span>
                </div>
                {conv.subject && (
                  <p className={`text-xs font-sequel mb-1 ${theme.text.secondary} truncate`}>
                    {conv.subject}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-sequel ${theme.text.muted}`}>
                    {conv.type}
                  </span>
                  {conv.lastMessageAt && (
                    <span className={`text-xs font-sequel ${theme.text.muted}`}>
                      {new Date(conv.lastMessageAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      {/* Chat Area - Full width on mobile, flex-1 on desktop */}
      <div className={`${selectedConversation ? 'flex' : 'hidden lg:flex'} flex-1 flex flex-col min-h-0 overflow-hidden`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className={`p-3 sm:p-4 border-b ${isDark ? 'border-white/10' : 'border-gray-200'} flex items-center justify-between`}>
              {/* Back button for mobile */}
              {selectedConversation && (
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="lg:hidden mr-2 p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X size={20} weight="regular" className={isDark ? 'text-white' : 'text-gray-900'} />
                </button>
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className={`font-semibold font-sequel text-sm sm:text-base truncate ${theme.text.primary}`}>
                    {selectedConversation.user?.email || selectedConversation.guestId || 'Anonymous'}
                  </h3>
                  <Circle 
                    size={8} 
                    weight="fill" 
                    className={isConnected ? 'text-green-500' : 'text-red-500'}
                  />
                </div>
                {selectedConversation.user?.firstName && (
                  <p className={`text-sm font-sequel ${theme.text.secondary}`}>
                    {selectedConversation.user.firstName} {selectedConversation.user.lastName}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                <span className={`text-xs font-sequel px-2 py-1 rounded ${getStatusColor(selectedConversation.status)} text-white`}>
                  {selectedConversation.status}
                </span>
                {selectedConversation.status === 'open' && (
                  <button
                    onClick={() => setShowCloseConfirm(true)}
                    className={`flex items-center space-x-1 px-3 py-1 rounded text-xs font-sequel transition-colors ${
                      isDark
                        ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                        : 'bg-red-50 hover:bg-red-100 text-red-600'
                    }`}
                    title="Close conversation"
                  >
                    <Lock size={14} weight="regular" />
                    <span>Close</span>
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto overscroll-contain min-h-0 p-2 sm:p-4 space-y-3 sm:space-y-4"
            >
              {isLoadingMessages && messages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-tiktok-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className={`text-sm font-sequel ${theme.text.muted}`}>Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <ChatCircle size={48} weight="regular" className={`mx-auto mb-2 ${theme.text.muted}`} />
                  <p className={`text-sm font-sequel ${theme.text.muted}`}>No messages yet</p>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => {
                    const isAdmin = message.senderType === 'admin'
                    return (
                      <div
                        key={`${message.id}-${index}-${forceUpdate}`}
                        className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            isAdmin
                              ? 'bg-tiktok-primary text-white'
                              : isDark
                              ? 'bg-white/10 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          {message.messageType === 'file' && message.fileUrl && (
                            <div className="mb-2">
                              <img
                                src={message.fileUrl}
                                alt={message.fileName || 'Attachment'}
                                className="max-w-full rounded-lg cursor-pointer"
                                onClick={() => window.open(message.fileUrl!, '_blank')}
                              />
                            </div>
                          )}
                          {message.message && (
                            <p className="text-sm font-sequel whitespace-pre-wrap break-words">
                              {message.message}
                            </p>
                          )}
                          <p className={`text-xs mt-1 ${
                            isAdmin ? 'text-white/70' : theme.text.muted
                          }`}>
                            {formatMessageTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  {typingUsers.size > 0 && (
                    <div className="flex justify-start">
                      <div className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        isDark ? 'bg-white/10' : 'bg-gray-100'
                      }`}>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Standard Messages Quick Replies */}
            {showStandardMessages && standardMessages && selectedConversation && (
              <div className={`p-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className={`text-xs font-sequel ${theme.text.muted}`}>Quick replies</p>
                  <button
                    onClick={() => setShowStandardMessages(false)}
                    className={`text-xs ${theme.text.muted}`}
                  >
                    Hide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedConversation.type === 'onboarding' && standardMessages.onboarding && (
                    <>
                      {Object.entries(standardMessages.onboarding).slice(0, 3).map(([key, msg]: [string, any]) => (
                        <button
                          key={key}
                          onClick={() => handleQuickReply(msg)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-sequel border ${
                            isDark
                              ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-900'
                          }`}
                        >
                          {msg.length > 40 ? msg.substring(0, 40) + '...' : msg}
                        </button>
                      ))}
                    </>
                  )}
                  {standardMessages.welcome && standardMessages.welcome[selectedConversation.type] && (
                    <button
                      onClick={() => handleQuickReply(standardMessages.welcome[selectedConversation.type])}
                      className={`px-3 py-1.5 rounded-lg text-xs font-sequel border ${
                        isDark
                          ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-900'
                      }`}
                    >
                      {standardMessages.welcome[selectedConversation.type].length > 40 
                        ? standardMessages.welcome[selectedConversation.type].substring(0, 40) + '...' 
                        : standardMessages.welcome[selectedConversation.type]}
                    </button>
                  )}
                  {standardMessages.other && standardMessages.other.greeting && (
                    <button
                      onClick={() => handleQuickReply(standardMessages.other.greeting)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-sequel border ${
                        isDark
                          ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-900'
                      }`}
                    >
                      {standardMessages.other.greeting.length > 40 
                        ? standardMessages.other.greeting.substring(0, 40) + '...' 
                        : standardMessages.other.greeting}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className={`p-2 sm:p-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!selectedConversation || uploadingFile || selectedConversation?.status !== 'open'}
                  className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDark
                      ? 'bg-white/5 hover:bg-white/10 text-white/80'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                  title="Upload image"
                >
                  {uploadingFile ? (
                    <div className="w-5 h-5 border-2 border-tiktok-primary border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Image size={20} weight="regular" />
                  )}
                </button>
                {standardMessages && (
                  <button
                    onClick={() => setShowStandardMessages(!showStandardMessages)}
                    disabled={!selectedConversation || selectedConversation?.status !== 'open'}
                    className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDark
                        ? 'bg-white/5 hover:bg-white/10 text-white/80'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    }`}
                    title="Quick replies"
                  >
                    <ChatCircle size={20} weight="regular" />
                  </button>
                )}
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Type a message..."
                  disabled={selectedConversation?.status !== 'open'}
                  className={`flex-1 px-2 sm:px-4 py-2 rounded-lg text-sm sm:text-base ${theme.bg.input} border-2 ${
                    isDark ? 'border-white/20' : 'border-gray-300'
                  } ${theme.text.primary} focus:outline-none focus:ring-2 focus:ring-tiktok-primary font-sequel disabled:opacity-50`}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || selectedConversation?.status !== 'open'}
                  className="p-2 bg-tiktok-primary hover:bg-tiktok-primary/90 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PaperPlaneTilt size={20} weight="regular" />
                </button>
              </div>
              {selectedConversation?.status !== 'open' && (
                <p className={`text-xs mt-2 ${theme.text.muted} text-center`}>
                  This conversation is {selectedConversation.status}. Users will need to create a new ticket to continue.
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <ChatCircle size={64} weight="regular" className={`mx-auto mb-4 ${theme.text.muted}`} />
              <p className={`font-semibold font-sequel text-lg mb-2 ${theme.text.primary}`}>
                Select a conversation
              </p>
              <p className={`text-sm font-sequel ${theme.text.secondary}`}>
                Choose a conversation from the list to start chatting
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Close Conversation Confirmation Modal */}
      {showCloseConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl border ${
            isDark 
              ? 'bg-black border-white/20' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="p-6">
              <h3 className={`font-monument font-bold text-lg mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Close Conversation?</h3>
              <p className={`text-sm font-sequel mb-4 ${
                isDark ? 'text-white/70' : 'text-gray-600'
              }`}>
                Are you sure you want to close this conversation? Users will need to create a new ticket to continue.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCloseConfirm(false)}
                  disabled={closingConversation}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all font-sequel ${
                    isDark
                      ? 'bg-white/5 text-white/80 hover:bg-white/10'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } disabled:opacity-50`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCloseConversation}
                  disabled={closingConversation}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-sequel"
                >
                  {closingConversation ? 'Closing...' : 'Close Conversation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminSupportPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-tiktok-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <AdminSupportPageContent />
    </Suspense>
  )
}
