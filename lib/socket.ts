import { io, Socket } from 'socket.io-client'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export interface SocketConnectionData {
  type: 'user' | 'admin' | 'guest'
  userId?: string
  adminId?: string
  guestId?: string
}

export interface Message {
  id: string
  conversationId: string
  senderId?: string | null
  senderType: 'user' | 'admin' | 'guest' | 'system'
  guestId?: string | null
  message: string
  messageType: 'text' | 'file' | 'system' | 'auth_code'
  fileUrl?: string | null
  fileName?: string | null
  fileSize?: number | null
  isRead: boolean
  createdAt: string
}

class SocketManager {
  private socket: Socket | null = null
  private connectionData: SocketConnectionData | null = null

  connect(token?: string, guestId?: string): Promise<SocketConnectionData> {
    return new Promise((resolve, reject) => {
      // Disconnect existing connection if any
      if (this.socket) {
        this.socket.disconnect()
      }

      const auth: any = {}
      if (token) {
        auth.token = token
      } else if (guestId) {
        auth.guestId = guestId
      }

      this.socket = io(`${API_BASE_URL}/support`, {
        auth,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity,
      })

      this.socket.on('connection:success', (data: SocketConnectionData) => {
        this.connectionData = data
        
        // Store guest ID if provided
        if (data.guestId && typeof window !== 'undefined') {
          localStorage.setItem('guestId', data.guestId)
        }
        
        resolve(data)
      })

      this.socket.on('connect', () => {
        console.log('Socket connected')
        // Re-authenticate on reconnect
        if (this.socket) {
          this.socket.emit('reconnect', auth)
        }
      })

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason)
      })

      this.socket.on('reconnect', (attemptNumber) => {
        console.log('Socket reconnected after', attemptNumber, 'attempts')
        // Re-authenticate
        if (this.socket && (token || guestId)) {
          this.socket.emit('reconnect', auth)
        }
      })

      this.socket.on('reconnect_attempt', (attemptNumber) => {
        console.log('Reconnection attempt', attemptNumber)
      })

      this.socket.on('reconnect_error', (error) => {
        console.error('Reconnection error:', error)
      })

      this.socket.on('reconnect_failed', () => {
        console.error('Reconnection failed')
      })

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        reject(error)
      })
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.connectionData = null
    }
  }

  getSocket(): Socket | null {
    return this.socket
  }

  getConnectionData(): SocketConnectionData | null {
    return this.connectionData
  }

  // Send message
  sendMessage(conversationId: string, message: string, messageType: 'text' | 'file' | 'system' | 'auth_code' = 'text') {
    if (!this.socket || !this.socket.connected) {
      console.error('Socket not connected, cannot send message')
      return false
    }
    this.socket.emit('message:send', {
      conversationId,
      message,
      messageType,
    })
    return true
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.connected
  }

  // Join conversation room
  joinConversation(conversationId: string) {
    if (!this.socket || !this.socket.connected) {
      console.warn('Socket not connected, cannot join conversation')
      return false
    }
    this.socket.emit('conversation:join', { conversationId })
    return true
  }

  // Leave conversation room
  leaveConversation(conversationId: string) {
    if (!this.socket || !this.socket.connected) {
      console.warn('Socket not connected, cannot leave conversation')
      return false
    }
    this.socket.emit('conversation:leave', { conversationId })
    return true
  }

  // Typing indicators
  startTyping(conversationId: string) {
    if (!this.socket || !this.socket.connected) {
      return false
    }
    this.socket.emit('typing:start', { conversationId })
    return true
  }

  stopTyping(conversationId: string) {
    if (!this.socket || !this.socket.connected) {
      return false
    }
    this.socket.emit('typing:stop', { conversationId })
    return true
  }

  // Mark message as read
  markMessageRead(messageId: string) {
    if (!this.socket || !this.socket.connected) {
      return false
    }
    this.socket.emit('message:read', { messageId })
    return true
  }

  // Event listeners
  onMessageReceived(callback: (message: Message) => void) {
    if (!this.socket) return
    this.socket.on('message:received', callback)
  }

  offMessageReceived(callback: (message: Message) => void) {
    if (!this.socket) return
    this.socket.off('message:received', callback)
  }

  onTypingStart(callback: (data: { conversationId: string; senderId: string }) => void) {
    if (!this.socket) return
    this.socket.on('typing:start', callback)
  }

  offTypingStart(callback: (data: { conversationId: string; senderId: string }) => void) {
    if (!this.socket) return
    this.socket.off('typing:start', callback)
  }

  onTypingStop(callback: (data: { conversationId: string; senderId: string }) => void) {
    if (!this.socket) return
    this.socket.on('typing:stop', callback)
  }

  offTypingStop(callback: (data: { conversationId: string; senderId: string }) => void) {
    if (!this.socket) return
    this.socket.off('typing:stop', callback)
  }

  onConversationJoined(callback: (data: { conversationId: string }) => void) {
    if (!this.socket) return
    this.socket.on('conversation:joined', callback)
  }

  offConversationJoined(callback: (data: { conversationId: string }) => void) {
    if (!this.socket) return
    this.socket.off('conversation:joined', callback)
  }

  onConversationNewMessage(callback: (data: { conversationId: string; message: Message }) => void) {
    if (!this.socket) return
    this.socket.on('conversation:new_message', callback)
  }

  offConversationNewMessage(callback: (data: { conversationId: string; message: Message }) => void) {
    if (!this.socket) return
    this.socket.off('conversation:new_message', callback)
  }

  // Listen for unread count updates
  onUnreadCountUpdated(callback: (data: { conversationId: string; unreadCount: number; totalUnreadCount?: number }) => void) {
    if (!this.socket) return
    this.socket.on('conversation:unread_count_updated', callback)
  }

  offUnreadCountUpdated(callback: (data: { conversationId: string; unreadCount: number; totalUnreadCount?: number }) => void) {
    if (!this.socket) return
    this.socket.off('conversation:unread_count_updated', callback)
  }

  onError(callback: (error: { error: string }) => void) {
    if (!this.socket) return
    this.socket.on('message:error', callback)
  }

  offError(callback: (error: { error: string }) => void) {
    if (!this.socket) return
    this.socket.off('message:error', callback)
  }

  onConnect(callback: () => void) {
    if (!this.socket) return
    this.socket.on('connect', callback)
  }

  offConnect(callback: () => void) {
    if (!this.socket) return
    this.socket.off('connect', callback)
  }

  onDisconnect(callback: () => void) {
    if (!this.socket) return
    this.socket.on('disconnect', callback)
  }

  offDisconnect(callback: () => void) {
    if (!this.socket) return
    this.socket.off('disconnect', callback)
  }
}

export const socketManager = new SocketManager()

