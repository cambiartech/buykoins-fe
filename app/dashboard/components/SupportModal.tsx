'use client'

import { useState, useEffect, useRef } from 'react'
import { X, ChatCircle, PaperPlaneTilt, Circle, Image, Paperclip } from '@phosphor-icons/react'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'
import { socketManager, Message } from '@/lib/socket'
import { getAuthToken } from '@/lib/auth'
import { formatMessageTime } from '@/lib/dateUtils'
import { playNotificationSound, enableAudio } from '@/lib/soundUtils'

interface SupportModalProps {
  isOpen: boolean
  onClose: () => void
  theme: 'light' | 'dark'
  initialConversationId?: string | null
  initialConversationType?: 'general' | 'onboarding' | 'call_request' | null
}

interface Conversation {
  id: string
  userId?: string | null
  guestId?: string | null
  type: 'general' | 'onboarding' | 'call_request'
  status: 'open' | 'closed' | 'resolved'
  unreadCount?: number  // Backend-provided unread count
}

export function SupportModal({ 
  isOpen, 
  onClose, 
  theme,
  initialConversationId,
  initialConversationType 
}: SupportModalProps) {
  const isDark = theme === 'dark'
  const toast = useToast()

  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const [uploadingFile, setUploadingFile] = useState(false)
  const [showConversationStarters, setShowConversationStarters] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Conversation starters - 4 clear options for users
  const conversationStarters = [
    {
      id: 'onboarding',
      title: 'I need help with onboarding',
      description: 'Set up your TikTok account and get your PayPal code',
      type: 'onboarding' as const,
    },
    {
      id: 'credit-request',
      title: 'I want to submit my TikTok earnings',
      description: 'Upload proof of earnings and get paid',
      type: 'general' as const,
    },
    {
      id: 'withdrawal',
      title: 'I need help with my withdrawal/payout',
      description: 'Check status or get help with payouts',
      type: 'general' as const,
    },
    {
      id: 'other',
      title: 'Other - General Support',
      description: 'Any other questions or issues',
      type: 'general' as const,
    },
  ]
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const conversationIdRef = useRef<string | null>(null)
  const lastMessageIdRef = useRef<string | null>(null) // Track last message to detect new ones

  // Update unread count in localStorage (shared with Navigation component)
  const updateUnreadCount = (count: number) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('supportUnreadCount', count.toString())
      // Dispatch custom event to notify Navigation component
      window.dispatchEvent(new CustomEvent('supportUnreadCountChanged', { detail: count }))
    }
  }


  useEffect(() => {
    // Enable audio on user interaction
    if (isOpen) {
      enableAudio()
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      initializeChat()
    } else {
      // Cleanup when modal closes
      cleanup()
    }
    return () => {
      cleanup()
    }
  }, [isOpen])

  const cleanup = () => {
    // Remove all event listeners first
    socketManager.offMessageReceived(handleNewMessage)
    socketManager.offTypingStart(handleTypingStart)
    socketManager.offTypingStop(handleTypingStop)
    socketManager.offError(handleSocketError)
    
    // Leave conversation if connected
    const currentConvId = conversationIdRef.current || conversation?.id
    if (currentConvId && socketManager.isConnected()) {
      socketManager.leaveConversation(currentConvId)
    }
    
    // Clear ref
    conversationIdRef.current = null
    
    // Don't disconnect - keep connection alive for faster reconnection
    // socketManager.disconnect()
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const initializeChat = async () => {
    setIsConnecting(true)
    try {
      // Check if already connected
      if (!socketManager.isConnected()) {
        // Connect socket
        const token = getAuthToken()
        if (token) {
          await socketManager.connect(token)
        } else {
          // Guest mode
          const guestId = typeof window !== 'undefined' ? localStorage.getItem('guestId') : null
          await socketManager.connect(undefined, guestId || undefined)
        }
      }

      // Set up event listeners (remove old ones first to avoid duplicates)
      socketManager.offMessageReceived(handleNewMessage)
      socketManager.offTypingStart(handleTypingStart)
      socketManager.offTypingStop(handleTypingStop)
      socketManager.offError(handleSocketError)
      
      socketManager.onMessageReceived(handleNewMessage)
      socketManager.onTypingStart(handleTypingStart)
      socketManager.onTypingStop(handleTypingStop)
      socketManager.onError(handleSocketError)

      // If we have an initial conversation ID (from widget), use it
      if (initialConversationId) {
        try {
          const messagesResponse = await api.support.getConversationMessages(initialConversationId, { page: 1, limit: 50 })
          if (messagesResponse.success && messagesResponse.data) {
            const joined = socketManager.joinConversation(initialConversationId)
            if (joined) {
              const conv: Conversation = {
                id: initialConversationId,
                type: initialConversationType || 'onboarding',
                status: 'open',
              }
              setConversation(conv)
              conversationIdRef.current = initialConversationId
              setShowConversationStarters(false)
              
              await loadMessages(initialConversationId)
              return
            }
          }
        } catch (error) {
          console.error('Failed to load initial conversation:', error)
        }
      }

      // Check if we have an existing open conversation
      // IMPORTANT: getOrCreateConversation might create a conversation automatically
      // So we check if the conversation has messages - if it's empty, show starters instead
      const token = getAuthToken()
      let hasOpenConversation = false
      
      if (token) {
        // Try to get existing conversation
        try {
          const response = await api.support.getOrCreateConversation(initialConversationType || undefined)
          if (response.success && response.data) {
            const conv = (response.data as any).conversation || response.data as Conversation
            // Only use it if it's an open conversation AND has messages (not a fresh one)
            if (conv && conv.status === 'open') {
              // Load messages to check if conversation is empty
              const joined = socketManager.joinConversation(conv.id)
              if (joined) {
                await new Promise(resolve => setTimeout(resolve, 100))
                const messagesResponse = await api.support.getConversationMessages(conv.id, { page: 1, limit: 1 })
                
                // If conversation has messages, use it. Otherwise show starters.
                if (messagesResponse.success && messagesResponse.data) {
                  const messagesList = (messagesResponse.data as any).messages || []
                  if (messagesList.length > 0) {
                    // Has messages, use this conversation
                    hasOpenConversation = true
                    setConversation(conv)
                    conversationIdRef.current = conv.id
                    setShowConversationStarters(false)
                    
                    await loadMessages(conv.id)
                    if (conv.unreadCount !== undefined) {
                      updateUnreadCount(conv.unreadCount)
                    }
                  } else {
                    // Empty conversation, show starters instead
                    setShowConversationStarters(true)
                  }
                } else {
                  // Couldn't load messages, show starters
                  setShowConversationStarters(true)
                }
              } else {
                // Couldn't join, show starters
                setShowConversationStarters(true)
              }
            } else {
              // Not open, show starters
              setShowConversationStarters(true)
            }
          } else {
            // No conversation, show starters
            setShowConversationStarters(true)
          }
        } catch (error) {
          // If error, show starters
          console.error('Failed to get conversation:', error)
          setShowConversationStarters(true)
        }
      } else {
        // Guest user, show starters
        setShowConversationStarters(true)
      }

      // Ensure starters are shown if no open conversation
      if (!hasOpenConversation) {
        setShowConversationStarters(true)
      }
    } catch (error) {
      console.error('Chat initialization error:', error)
      toast.error('Failed to initialize chat')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleConversationStarter = async (starterType: 'general' | 'onboarding' | 'call_request') => {
    setIsLoading(true)
    try {
      const token = getAuthToken()
      let response

      // Find the starter message to send
      const starter = conversationStarters.find(s => s.type === starterType)
      const initialMessage = starter ? starter.title : 'Hello, I need help'

      if (token) {
        // Authenticated user
        response = await api.support.getOrCreateConversation(starterType)
      } else {
        // Guest user
        const guestId = typeof window !== 'undefined' ? localStorage.getItem('guestId') : null
        response = await api.support.getOrCreateGuestConversation({
          type: starterType,
        })
        if (response.success && response.data) {
          const data = response.data as any
          if (data.guestId) {
            localStorage.setItem('guestId', data.guestId)
          }
        }
      }

      if (response.success && response.data) {
        const conv = (response.data as any).conversation || response.data as Conversation
        setConversation(conv)
        conversationIdRef.current = conv.id
        setShowConversationStarters(false) // Hide starters once conversation is created
        
        // Join conversation room
        const joined = socketManager.joinConversation(conv.id)
        if (!joined) {
          console.warn('Failed to join conversation room, socket may not be connected')
        }
        
        // Wait a bit for room join to complete
        await new Promise(resolve => setTimeout(resolve, 200))
        
        // Load messages
        await loadMessages(conv.id)
        
        // Update unread count from backend-provided count
        if (conv.unreadCount !== undefined) {
          updateUnreadCount(conv.unreadCount)
        }

        // Automatically send the initial message
        if (socketManager.isConnected() && conv.id) {
          const success = socketManager.sendMessage(conv.id, initialMessage)
          if (success) {
            // Optimistically add message to UI
            const tempMessage: Message = {
              id: `temp_${Date.now()}`,
              conversationId: conv.id,
              senderId: null,
              senderType: 'user',
              message: initialMessage,
              messageType: 'text',
              isRead: false,
              createdAt: new Date().toISOString(),
            }
            setMessages(prev => {
              const newMessages = [...prev, tempMessage]
              return newMessages.sort((a, b) => 
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              )
            })
          } else {
            toast.error('Failed to send message. Please try again.')
          }
        }
      } else {
        toast.error('Failed to create conversation')
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message || 'Failed to create conversation')
      } else {
        toast.error('Failed to create conversation. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    // Check if we have a conversation, if not, create one first
    let currentConvId = conversationIdRef.current || conversation?.id
    
    if (!currentConvId) {
      // Create conversation automatically before uploading
      try {
        setIsLoading(true)
        const token = getAuthToken()
        let response

        if (token) {
          response = await api.support.getOrCreateConversation('general')
        } else {
          const guestId = typeof window !== 'undefined' ? localStorage.getItem('guestId') : null
          response = await api.support.getOrCreateGuestConversation({ type: 'general' })
          if (response.success && response.data) {
            const data = response.data as any
            if (data.guestId) {
              localStorage.setItem('guestId', data.guestId)
            }
          }
        }

        if (response.success && response.data) {
          const conv = (response.data as any).conversation || response.data as Conversation
          setConversation(conv)
          conversationIdRef.current = conv.id
          currentConvId = conv.id
          setShowConversationStarters(false)
          
          console.log('✅ Created conversation for upload:', currentConvId)
          
          // Join conversation room
          const joined = socketManager.joinConversation(conv.id)
          if (joined) {
            await new Promise(resolve => setTimeout(resolve, 200))
          }
        } else {
          toast.error('Failed to create conversation')
          setIsLoading(false)
          return
        }
      } catch (error) {
        console.error('❌ Failed to create conversation for upload:', error)
        toast.error('Failed to create conversation. Please try again.')
        setIsLoading(false)
        return
      } finally {
        setIsLoading(false)
      }
    }

    if (!currentConvId) {
      console.error('❌ No conversation ID available for upload')
      toast.error('No active conversation')
      return
    }

    // Validate conversationId is a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(currentConvId)) {
      console.error('❌ Invalid conversation ID format:', currentConvId)
      toast.error('Invalid conversation ID. Please try again.')
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
      console.log('📤 Uploading file with conversationId:', currentConvId)
      const response = await api.support.uploadFile(currentConvId, file, messageInput.trim() || undefined)
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

  // Removed: handleQuickReply - quick replies are admin-only

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await api.support.getConversationMessages(conversationId, {
        page: 1,
        limit: 50,
      })
      if (response.success && response.data) {
        const data = response.data as any
        const messagesList = data.messages || []
        
        // Normalize all timestamps to ensure they're in UTC format
        // This handles cases where backend might send timestamps without 'Z' or in wrong format
        const normalizedMessages = messagesList.map((msg: Message) => {
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
        
        // Sort messages by createdAt (oldest first)
        const sortedMessages = normalizedMessages.sort((a: Message, b: Message) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
        
        console.log('📥 Loaded messages from REST API:', {
          count: sortedMessages.length,
          sampleTimestamps: sortedMessages.slice(0, 3).map((m: Message) => ({
            id: m.id,
            original: m.createdAt,
            normalized: new Date(m.createdAt).toISOString(),
            display: formatMessageTime(m.createdAt)
          }))
        })
        
        setMessages(sortedMessages)
        
        // Refresh conversation to get updated unreadCount from backend
        if (conversationId) {
          api.support.getConversation(conversationId).then(response => {
            if (response.success && response.data) {
              const conv = (response.data as any).conversation || response.data as Conversation
              if (conv.unreadCount !== undefined) {
                updateUnreadCount(conv.unreadCount)
              }
            }
          })
        }
        
        // Set last message ID
        if (sortedMessages.length > 0) {
          lastMessageIdRef.current = sortedMessages[sortedMessages.length - 1].id
        }
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message || 'Failed to load messages')
      }
    }
  }

  const handleNewMessage = (message: Message) => {
    console.log('User received message:', message)
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
        isOwnMessage: message.senderType === 'user'
      })
    }
    const currentConvId = conversationIdRef.current || conversation?.id
    console.log('Current conversation ID (ref):', conversationIdRef.current)
    console.log('Current conversation ID (state):', conversation?.id)
    console.log('Message conversation ID:', message.conversationId)
    
    // Use ref first, fallback to state
    if (currentConvId && message.conversationId === currentConvId) {
      console.log('✅ Message matches, adding to state')
      setMessages(prev => {
        // Check if message already exists by ID to avoid duplicates
        const existsById = prev.some(m => m.id === message.id)
        if (existsById) {
          console.log('⚠️ Message already exists by ID, skipping')
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
        
        let newMessages: Message[]
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
          newMessages = [...prev]
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
        
        // Check if this is a new message (not from current user) and modal is not open
        const isNewMessage = message.id !== lastMessageIdRef.current && 
                            message.senderType !== 'user' && 
                            message.senderType !== 'guest'
        
        if (isNewMessage) {
          lastMessageIdRef.current = message.id
          
          // Play sound notification if modal is not open or message is from admin/system
          if (!isOpen || message.senderType === 'admin' || message.senderType === 'system') {
            playNotificationSound()
          }
          
          // Refresh conversation to get updated unreadCount from backend
          if (conversation) {
            api.support.getConversation(conversation.id).then(response => {
              if (response.success && response.data) {
                const conv = (response.data as any).conversation || response.data as Conversation
                if (conv.unreadCount !== undefined) {
                  updateUnreadCount(conv.unreadCount)
                }
              }
            })
          }
        }
        
        console.log('✅ Final message count:', newMessages.length)
        return newMessages
      })
      // Mark as read if from admin/system and modal is open
      if ((message.senderType === 'admin' || message.senderType === 'system') && isOpen) {
        socketManager.markMessageRead(message.id)
        // Backend will update unreadCount, refresh conversation after a delay
        if (conversation) {
          setTimeout(() => {
            api.support.getConversation(conversation.id).then(response => {
              if (response.success && response.data) {
                const conv = (response.data as any).conversation || response.data as Conversation
                if (conv.unreadCount !== undefined) {
                  updateUnreadCount(conv.unreadCount)
                }
              }
            })
          }, 500)
        }
      }
      // Scroll to bottom
      setTimeout(() => {
        scrollToBottom()
      }, 100)
    } else {
      console.log('❌ Message conversation mismatch:', {
        messageConvId: message.conversationId,
        currentConvIdRef: conversationIdRef.current,
        currentConvIdState: conversation?.id
      })
    }
  }

  const handleTypingStart = (data: { conversationId: string; senderId: string }) => {
    if (conversation && data.conversationId === conversation.id) {
      setTypingUsers(prev => new Set(prev).add(data.senderId))
    }
  }

  const handleTypingStop = (data: { conversationId: string; senderId: string }) => {
    if (conversation && data.conversationId === conversation.id) {
      setTypingUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(data.senderId)
        return newSet
      })
    }
  }

  const handleSocketError = (error: { error: string }) => {
    toast.error(error.error || 'Chat error occurred')
  }

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return

    const messageText = messageInput.trim()
    setMessageInput('')
    stopTyping()

    // Get or create conversation if we don't have one
    let currentConvId = conversationIdRef.current || conversation?.id
    
    if (!currentConvId) {
      // Create conversation automatically on first message (defaults to 'general')
      try {
        setIsLoading(true)
        const token = getAuthToken()
        let response

        if (token) {
          response = await api.support.getOrCreateConversation('general')
        } else {
          const guestId = typeof window !== 'undefined' ? localStorage.getItem('guestId') : null
          response = await api.support.getOrCreateGuestConversation({ type: 'general' })
          if (response.success && response.data) {
            const data = response.data as any
            if (data.guestId) {
              localStorage.setItem('guestId', data.guestId)
            }
          }
        }

        if (response.success && response.data) {
          const conv = (response.data as any).conversation || response.data as Conversation
          setConversation(conv)
          conversationIdRef.current = conv.id
          currentConvId = conv.id
          setShowConversationStarters(false) // Hide starters when conversation is created automatically
          
          // Join conversation room
          const joined = socketManager.joinConversation(conv.id)
          if (joined) {
            await new Promise(resolve => setTimeout(resolve, 100))
          }
        } else {
          toast.error('Failed to create conversation')
          return
        }
      } catch (error) {
        toast.error('Failed to create conversation. Please try again.')
        return
      } finally {
        setIsLoading(false)
      }
    }

    if (!currentConvId) {
      toast.error('No conversation available')
      return
    }

    // Optimistically add message to UI (will be replaced by server message)
    const tempMessage: Message = {
      id: `temp_${Date.now()}`,
      conversationId: currentConvId,
      senderId: null,
      senderType: 'user',
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

    const success = socketManager.sendMessage(currentConvId, messageText)
    if (!success) {
      // Remove temp message if send failed
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id))
      toast.error('Failed to send message. Please check your connection.')
    }
  }

  const handleInputChange = (value: string) => {
    setMessageInput(value)
    const currentConvId = conversationIdRef.current || conversation?.id
    if (!isTyping && value.trim() && currentConvId && socketManager.isConnected()) {
      setIsTyping(true)
      socketManager.startTyping(currentConvId)
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping()
    }, 3000)
  }

  const stopTyping = () => {
    const currentConvId = conversationIdRef.current || conversation?.id
    if (isTyping && currentConvId && socketManager.isConnected()) {
      socketManager.stopTyping(currentConvId)
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-2xl rounded-2xl border ${
        isDark 
          ? 'bg-black border-white/20' 
          : 'bg-white border-gray-200'
      } flex flex-col h-[600px]`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDark ? 'border-white/10' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-2">
            <ChatCircle size={24} weight="regular" className="text-tiktok-primary" />
            <h3 className={`font-monument font-bold text-lg ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Support Chat</h3>
            {conversation && (
              <Circle size={8} weight="fill" className="bg-green-500" />
            )}
          </div>
          <button
            onClick={onClose}
            className={`${isDark ? 'text-white/80 hover:text-white' : 'text-gray-700 hover:text-gray-900'}`}
          >
            <X size={24} weight="regular" />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {isConnecting || isLoading ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-tiktok-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className={`text-sm font-sequel ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                {isConnecting ? 'Connecting...' : 'Loading messages...'}
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <ChatCircle size={48} weight="regular" className={`mx-auto mb-2 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
              <p className={`text-sm font-sequel ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => {
                const isUser = message.senderType === 'user' || message.senderType === 'guest'
                return (
                  <div
                    key={message.id}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-lg px-4 py-2 ${
                        isUser
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
                        isUser ? 'text-white/70' : isDark ? 'text-white/60' : 'text-gray-600'
                      }`}>
                        {formatMessageTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              })}
              {typingUsers.size > 0 && (
                <div className="flex justify-start">
                  <div className={`max-w-[75%] rounded-lg px-4 py-2 ${
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

        {/* Conversation Starters - Show when no conversation exists */}
        {showConversationStarters && (
          <div className={`p-4 border-t ${
            isDark ? 'border-white/10' : 'border-gray-200'
          }`}>
            <p className={`text-sm font-sequel mb-3 ${
              isDark ? 'text-white/80' : 'text-gray-700'
            }`}>How can we help you?</p>
            <div className="space-y-2">
              {conversationStarters.map((starter) => (
                <button
                  key={starter.id}
                  onClick={() => handleConversationStarter(starter.type)}
                  disabled={isLoading}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                    isDark
                      ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-900'
                  } disabled:opacity-50`}
                >
                  <p className="font-sequel font-semibold">{starter.title}</p>
                  <p className={`text-xs mt-1 ${
                    isDark ? 'text-white/60' : 'text-gray-600'
                  }`}>{starter.description}</p>
                </button>
              ))}
            </div>
            <p className={`text-xs mt-3 text-center ${
              isDark ? 'text-white/40' : 'text-gray-400'
            }`}>
              Or just start typing below to begin a conversation
            </p>
          </div>
        )}

        {/* Message Input */}
        {(
          <div className={`p-4 border-t ${
            isDark ? 'border-white/10' : 'border-gray-200'
          }`}>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isConnecting || uploadingFile || isLoading}
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
                disabled={!conversationIdRef.current || isConnecting}
                className={`flex-1 px-4 py-2 rounded-lg ${
                  isDark ? 'bg-white/5 border-white/20' : 'bg-gray-50 border-gray-300'
                } border-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-tiktok-primary font-sequel disabled:opacity-50`}
              />
              <button
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || !conversationIdRef.current || isConnecting}
                className="p-2 bg-tiktok-primary hover:bg-tiktok-primary/90 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PaperPlaneTilt size={20} weight="regular" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
