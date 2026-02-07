'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, X, Check, CheckCircle, Clock, ArrowDownRight, UserPlus, ChatCircle, Warning } from '@phosphor-icons/react'
import { useToast } from '@/lib/toast'
import { notificationSocketManager, Notification } from '@/lib/notification-socket'
import { useRouter } from 'next/navigation'

interface NotificationsPanelProps {
  isDark: boolean
}

export function NotificationsPanel({ isDark }: NotificationsPanelProps) {
  const router = useRouter()
  const toast = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Connect to notification socket
    notificationSocketManager.connect()

    // Listen for new notifications
    const handleNewNotification = (notification: Notification) => {
      setNotifications(prev => [notification, ...prev])
      toast.success(notification.title)
      
      // Play notification sound (optional)
      try {
        const audio = new Audio('/notification.mp3')
        audio.volume = 0.3
        audio.play().catch(() => {})
      } catch (error) {}
    }

    const handleUnreadCount = (count: number) => {
      setUnreadCount(count)
    }

    const handleError = (error: { error: string }) => {
      console.error('Notification error:', error)
    }

    notificationSocketManager.onNotification(handleNewNotification)
    notificationSocketManager.onUnreadCount(handleUnreadCount)
    notificationSocketManager.onError(handleError)

    return () => {
      notificationSocketManager.offNotification(handleNewNotification)
      notificationSocketManager.offUnreadCount(handleUnreadCount)
      notificationSocketManager.offError(handleError)
    }
  }, [])

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const markAsRead = (notification: Notification) => {
    if (notification.isRead) return

    notificationSocketManager.markAsRead(notification.id, (response) => {
      if (response.success) {
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    })
  }

  const markAllAsRead = () => {
    notificationSocketManager.markAllAsRead((response) => {
      if (response.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        setUnreadCount(0)
        toast.success('All notifications marked as read')
      }
    })
  }

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification)
    
    if (notification.actionUrl) {
      setIsOpen(false)
      router.push(notification.actionUrl)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_credit_request':
        return <Clock size={20} weight="regular" className="text-yellow-500" />
      case 'new_payout_request':
        return <ArrowDownRight size={20} weight="regular" className="text-blue-500" />
      case 'new_onboarding_request':
        return <UserPlus size={20} weight="regular" className="text-green-500" />
      case 'new_support_message':
        return <ChatCircle size={20} weight="regular" className="text-purple-500" />
      case 'fraud_alert':
        return <Warning size={20} weight="fill" className="text-red-500" />
      default:
        return <Bell size={20} weight="regular" className="text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500'
      case 'high':
        return 'bg-orange-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMins = Math.floor(diffInMs / 60000)
    const diffInHours = Math.floor(diffInMs / 3600000)
    const diffInDays = Math.floor(diffInMs / 86400000)

    if (diffInMins < 1) return 'Just now'
    if (diffInMins < 60) return `${diffInMins}m ago`
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInDays < 7) return `${diffInDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-lg transition-colors ${
          isDark 
            ? 'text-white/80 hover:text-white hover:bg-white/5' 
            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
        }`}
        aria-label="Notifications"
      >
        <Bell size={24} weight={unreadCount > 0 ? 'fill' : 'regular'} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {isOpen && (
        <div className={`absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] rounded-xl border shadow-2xl z-50 ${
          isDark 
            ? 'bg-black border-white/20' 
            : 'bg-white border-gray-200'
        }`}>
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b ${
            isDark ? 'border-white/10' : 'border-gray-200'
          }`}>
            <div className="flex items-center space-x-2">
              <h3 className={`font-sequel font-bold text-lg ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className={`text-xs font-sequel font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                    isDark 
                      ? 'text-blue-400 hover:bg-blue-500/10' 
                      : 'text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className={`p-1 rounded-lg transition-colors ${
                  isDark 
                    ? 'text-white/60 hover:text-white hover:bg-white/5' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <X size={20} weight="regular" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[500px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className={`text-sm font-sequel ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                  Loading...
                </p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell size={48} weight="regular" className={`mx-auto mb-2 ${
                  isDark ? 'text-white/40' : 'text-gray-400'
                }`} />
                <p className={`text-sm font-sequel ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full text-left p-4 border-b transition-colors ${
                    !notification.isRead
                      ? isDark
                        ? 'bg-blue-500/10 border-white/10 hover:bg-blue-500/20'
                        : 'bg-blue-50 border-gray-200 hover:bg-blue-100'
                      : isDark
                      ? 'border-white/10 hover:bg-white/5'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <p className={`font-sequel font-semibold text-sm ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </p>
                        <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`} />
                          {!notification.isRead && (
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                          )}
                        </div>
                      </div>
                      <p className={`text-sm font-sequel mb-2 ${
                        isDark ? 'text-white/70' : 'text-gray-600'
                      }`}>
                        {notification.message}
                      </p>
                      <p className={`text-xs font-sequel ${
                        isDark ? 'text-white/50' : 'text-gray-500'
                      }`}>
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
