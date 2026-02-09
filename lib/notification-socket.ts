import { io, Socket } from 'socket.io-client'

// Base URL for Socket.IO: origin only, no /api (namespace is /notifications, path is /api/socket.io)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://buykoins-be-production.up.railway.app'
const SOCKET_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '')

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  metadata?: Record<string, any>
  priority: 'low' | 'medium' | 'high' | 'urgent'
  isRead: boolean
  readAt?: string | null
  actionUrl?: string | null
  createdAt: string
}

class NotificationSocketManager {
  private socket: Socket | null = null
  private token: string | null = null
  private listeners: Map<string, Set<Function>> = new Map()

  constructor() {
    // Initialize listener maps
    this.listeners.set('notification', new Set())
    this.listeners.set('unread_count', new Set())
    this.listeners.set('error', new Set())
  }

  connect(): void {
    // Get token from localStorage
    const token = localStorage.getItem('token')
    if (!token) {
      console.warn('No auth token found for notification socket')
      return
    }

    if (this.socket && this.socket.connected && this.token === token) {
      console.log('Notification socket already connected with same token.')
      return
    }

    this.disconnect() // Disconnect any old connection

    this.token = token
    this.socket = io(`${SOCKET_BASE_URL}/notifications`, {
      path: '/api/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    })

    this.socket.on('connect', () => {
      console.log('✅ Notification socket connected.')
    })

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Notification socket disconnected:', reason)
    })

    this.socket.on('connect_error', (error) => {
      console.error('❌ Notification socket connection error:', error.message)
      this.emit('error', { error: error.message })
    })

    // Register listeners for server events
    this.socket.on('notification', (data: Notification) => {
      console.log('🔔 New notification:', data)
      this.emit('notification', data)
    })

    this.socket.on('unread_count', (data: { count: number }) => {
      console.log('📊 Unread count:', data.count)
      this.emit('unread_count', data.count)
    })

    this.socket.on('error', (data: { message: string }) => {
      console.error('❌ Notification error:', data.message)
      this.emit('error', { error: data.message })
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.token = null
      console.log('Notification socket disconnected cleanly.')
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false
  }

  // Client to server events
  markAsRead(notificationId: string, callback?: (response: { success: boolean }) => void): void {
    if (!this.socket) {
      console.warn('Socket not connected')
      callback?.({ success: false })
      return
    }
    this.socket.emit('mark_read', { notificationId }, (response: { success: boolean }) => {
      callback?.(response)
    })
  }

  markAllAsRead(callback?: (response: { success: boolean }) => void): void {
    if (!this.socket) {
      console.warn('Socket not connected')
      callback?.({ success: false })
      return
    }
    this.socket.emit('mark_all_read', {}, (response: { success: boolean }) => {
      callback?.(response)
    })
  }

  getUnreadCount(callback?: (response: { success: boolean; count: number }) => void): void {
    if (!this.socket) {
      console.warn('Socket not connected')
      callback?.({ success: false, count: 0 })
      return
    }
    this.socket.emit('get_unread_count', {}, (response: { success: boolean; count: number }) => {
      callback?.(response)
    })
  }

  // Event listener management
  onNotification(listener: (notification: Notification) => void): void {
    const listeners = this.listeners.get('notification')
    if (listeners) {
      listeners.add(listener)
    }
  }

  offNotification(listener: (notification: Notification) => void): void {
    const listeners = this.listeners.get('notification')
    if (listeners) {
      listeners.delete(listener)
    }
  }

  onUnreadCount(listener: (count: number) => void): void {
    const listeners = this.listeners.get('unread_count')
    if (listeners) {
      listeners.add(listener)
    }
  }

  offUnreadCount(listener: (count: number) => void): void {
    const listeners = this.listeners.get('unread_count')
    if (listeners) {
      listeners.delete(listener)
    }
  }

  onError(listener: (error: { error: string }) => void): void {
    const listeners = this.listeners.get('error')
    if (listeners) {
      listeners.add(listener)
    }
  }

  offError(listener: (error: { error: string }) => void): void {
    const listeners = this.listeners.get('error')
    if (listeners) {
      listeners.delete(listener)
    }
  }

  private emit(event: string, ...args: any[]) {
    const listeners = this.listeners.get(event)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(...args)
        } catch (error) {
          console.error(`Error in ${event} listener:`, error)
        }
      })
    }
  }
}

export const notificationSocketManager = new NotificationSocketManager()
