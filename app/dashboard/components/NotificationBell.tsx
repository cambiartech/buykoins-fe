'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, X, CheckCircle, Clock, ArrowDownRight, Megaphone } from '@phosphor-icons/react'
import { notificationSocketManager } from '@/lib/notification-socket'
import { api } from '@/lib/api'

interface NotificationBellProps {
  theme: 'light' | 'dark'
}

interface UserNotification {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
  actionUrl?: string
  metadata?: Record<string, unknown>
}

export function NotificationBell({ theme }: NotificationBellProps) {
  const isDark = theme === 'dark'
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<UserNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const panelRef = useRef<HTMLDivElement>(null)

  // Connect to notification socket and fetch initial list + count
  useEffect(() => {
    notificationSocketManager.connect()

    const handleNotification = (n: {
      id: string
      type: string
      title: string
      message: string
      isRead: boolean
      createdAt: string
      actionUrl?: string | null
      metadata?: Record<string, unknown>
    }) => {
      setNotifications((prev) => [{ ...n, actionUrl: n.actionUrl ?? undefined }, ...prev])
      setUnreadCount((c) => c + 1)
    }

    const handleUnreadCount = (count: number) => {
      setUnreadCount(count)
    }

    notificationSocketManager.onNotification(handleNotification)
    notificationSocketManager.onUnreadCount(handleUnreadCount)

    // Request initial unread count from socket (server may reply with unread_count)
    notificationSocketManager.getUnreadCount((res) => {
      if (res.success && res.count !== undefined) setUnreadCount(res.count)
    })

    // Fetch initial notifications list and unread count via REST
    api.user.getNotifications({ limit: 20 }).then((res) => {
      if (res.success && res.data) {
        const data = res.data as { notifications?: UserNotification[] }
        const list = Array.isArray(data.notifications) ? data.notifications : []
        setNotifications(list)
      }
    }).catch(() => {})

    api.user.getUnreadNotificationCount().then((res) => {
      if (res.success && res.data && typeof (res.data as { count?: number }).count === 'number') {
        setUnreadCount((res.data as { count: number }).count)
      }
    }).catch(() => {})

    return () => {
      notificationSocketManager.offNotification(handleNotification)
      notificationSocketManager.offUnreadCount(handleUnreadCount)
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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'credit_approved':
        return <CheckCircle size={20} weight="fill" className="text-green-500" />
      case 'credit_rejected':
        return <X size={20} weight="fill" className="text-red-500" />
      case 'payout_completed':
        return <ArrowDownRight size={20} weight="fill" className="text-blue-500" />
      case 'payout_failed':
        return <X size={20} weight="fill" className="text-red-500" />
      case 'onboarding_completed':
        return <CheckCircle size={20} weight="fill" className="text-green-500" />
      case 'announcement':
      case 'ANNOUNCEMENT':
        return <Megaphone size={20} weight="fill" className="text-amber-500" />
      default:
        return <Bell size={20} weight="regular" className="text-gray-500" />
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
        <Bell size={20} weight={unreadCount > 0 ? 'fill' : 'regular'} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {isOpen && (
        <div className={`absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border shadow-2xl z-50 ${
          isDark 
            ? 'bg-black border-white/20' 
            : 'bg-white border-gray-200'
        }`}>
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b ${
            isDark ? 'border-white/10' : 'border-gray-200'
          }`}>
            <div className="flex items-center space-x-2">
              <h3 className={`font-sequel font-bold text-base ${
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
            <button
              onClick={() => setIsOpen(false)}
              className={`p-1 rounded-lg transition-colors ${
                isDark 
                  ? 'text-white/60 hover:text-white hover:bg-white/5' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <X size={18} weight="regular" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell size={40} weight="regular" className={`mx-auto mb-2 ${
                  isDark ? 'text-white/40' : 'text-gray-400'
                }`} />
                <p className={`text-sm font-sequel ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                  No notifications yet
                </p>
                <p className={`text-xs font-sequel mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                  We'll notify you about important updates
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
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
                        {!notification.isRead && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 ml-2 mt-1" />
                        )}
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
