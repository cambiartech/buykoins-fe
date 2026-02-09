import { io, Socket } from 'socket.io-client'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export interface WidgetSession {
  sessionId: string
  currentStep: string
  trigger: 'onboarding' | 'withdrawal' | 'deposit'
  status: 'active' | 'completed' | 'abandoned' | 'error'
  completedSteps: string[]
  collectedData: any
  expiresAt?: string
}

class WidgetSocketManager {
  private socket: Socket | null = null

  connect(token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket) {
        this.socket.disconnect()
      }

      const auth: any = {}
      if (token) {
        auth.token = token
      }

      this.socket = io(`${API_BASE_URL}/widget`, {
        path: '/api/socket.io',
        auth,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity,
      })

      this.socket.on('connect', () => {
        console.log('Widget socket connected')
        resolve()
      })

      this.socket.on('connect_error', (error) => {
        console.error('Widget socket connection error:', error)
        reject(error)
      })
    })
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  getSocket(): Socket | null {
    return this.socket
  }

  isConnected(): boolean {
    return this.socket !== null && this.socket.connected
  }

  // Join widget session room
  joinSession(sessionId: string) {
    if (!this.socket || !this.socket.connected) {
      console.warn('Widget socket not connected, cannot join session')
      return false
    }
    this.socket.emit('widget:join', { sessionId })
    return true
  }

  // Leave widget session room
  leaveSession(sessionId: string) {
    if (!this.socket || !this.socket.connected) {
      return false
    }
    this.socket.emit('widget:leave', { sessionId })
    return true
  }

  // Event listeners
  onInit(callback: (data: { sessionId: string; currentStep: string; trigger: string }) => void) {
    if (!this.socket) return
    this.socket.on('widget:init', callback)
  }

  offInit(callback: (data: { sessionId: string; currentStep: string; trigger: string }) => void) {
    if (!this.socket) return
    this.socket.off('widget:init', callback)
  }

  onStep(callback: (data: { sessionId: string; currentStep: string; nextStep?: string; message?: string }) => void) {
    if (!this.socket) return
    this.socket.on('widget:step', callback)
  }

  offStep(callback: (data: { sessionId: string; currentStep: string; nextStep?: string; message?: string }) => void) {
    if (!this.socket) return
    this.socket.off('widget:step', callback)
  }

  onComplete(callback: (data: { sessionId: string; status: string; message?: string }) => void) {
    if (!this.socket) return
    this.socket.on('widget:complete', callback)
  }

  offComplete(callback: (data: { sessionId: string; status: string; message?: string }) => void) {
    if (!this.socket) return
    this.socket.off('widget:complete', callback)
  }

  onStatus(callback: (data: { sessionId: string; status: string; currentStep?: string }) => void) {
    if (!this.socket) return
    this.socket.on('widget:status', callback)
  }

  offStatus(callback: (data: { sessionId: string; status: string; currentStep?: string }) => void) {
    if (!this.socket) return
    this.socket.off('widget:status', callback)
  }

  onError(callback: (data: { sessionId: string; error: string; step?: string }) => void) {
    if (!this.socket) return
    this.socket.on('widget:error', callback)
  }

  offError(callback: (data: { sessionId: string; error: string; step?: string }) => void) {
    if (!this.socket) return
    this.socket.off('widget:error', callback)
  }
}

export const widgetSocketManager = new WidgetSocketManager()

