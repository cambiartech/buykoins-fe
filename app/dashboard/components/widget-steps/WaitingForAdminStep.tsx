'use client'

import { Clock, CheckCircle, ChatCircle } from '@phosphor-icons/react'
import { useState, useEffect } from 'react'
import { socketManager, Message } from '@/lib/socket'
import { api } from '@/lib/api'

interface WaitingForAdminStepProps {
  theme: 'light' | 'dark'
  isLoading: boolean
  error: string | null
  onSubmit: (step: string, data: any) => Promise<void>
  sessionData: any
}

export function WaitingForAdminStep({
  theme,
  isLoading,
  onSubmit,
  sessionData,
}: WaitingForAdminStepProps) {
  const isDark = theme === 'dark'
  const [conversationId, setConversationId] = useState<string | null>(sessionData?.conversationId || null)
  const [hasNewMessage, setHasNewMessage] = useState(false)

  useEffect(() => {
    if (conversationId) {
      // Listen for new messages from admin
      const handleNewMessage = (message: Message) => {
        if (message.conversationId === conversationId && message.senderType === 'admin') {
          setHasNewMessage(true)
          // Check if message contains credentials indicators
          const messageText = message.message.toLowerCase()
          if (messageText.includes('paypal') || messageText.includes('code') || messageText.includes('credential')) {
            // Admin likely sent credentials
            setHasNewMessage(true)
          }
        }
      }

      socketManager.onMessageReceived(handleNewMessage)

      return () => {
        socketManager.offMessageReceived(handleNewMessage)
      }
    }
  }, [conversationId])

  const handleReceived = async () => {
    await onSubmit('waiting-for-admin', { received: true })
  }

  const handleOpenChat = () => {
    // Dispatch event to open support chat with this conversation
    if (conversationId) {
      const event = new CustomEvent('openSupportChat', { 
        detail: { conversationId, type: 'onboarding' as const },
        bubbles: true
      })
      window.dispatchEvent(event)
      document.dispatchEvent(event)
      
      // Also dispatch chatOpened event to minimize widget
      const chatOpenedEvent = new CustomEvent('chatOpened', { bubbles: true })
      window.dispatchEvent(chatOpenedEvent)
      document.dispatchEvent(chatOpenedEvent)
    }
  }

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg ${
        isDark 
          ? 'bg-yellow-500/10 border border-yellow-500/30' 
          : 'bg-yellow-50 border border-yellow-200'
      }`}>
        <div className="flex items-start space-x-3">
          <Clock size={24} weight="regular" className={`mt-1 animate-pulse ${
            isDark ? 'text-yellow-400' : 'text-yellow-600'
          }`} />
          <div>
            <h4 className={`font-semibold mb-2 font-sequel ${
              isDark ? 'text-yellow-300' : 'text-yellow-700'
            }`}>
              Waiting for Admin
            </h4>
            <p className={`text-sm font-sequel ${
              isDark ? 'text-yellow-300/80' : 'text-yellow-700'
            }`}>
              An admin has been notified and will send you PayPal credentials via the support chat. 
              Click "Open Chat" below to view the conversation. The admin will provide:
            </p>
            <ul className={`mt-2 space-y-1 text-sm font-sequel list-disc list-inside ${
              isDark ? 'text-yellow-300/80' : 'text-yellow-700'
            }`}>
              <li>PayPal email address</li>
              <li>PayPal password</li>
              <li>6-digit authentication code</li>
            </ul>
          </div>
        </div>
      </div>

      {conversationId && (
        <div className={`p-3 rounded-lg mb-4 ${
          isDark 
            ? 'bg-blue-500/10 border border-blue-500/30' 
            : 'bg-blue-50 border border-blue-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ChatCircle size={18} weight="regular" className={isDark ? 'text-blue-400' : 'text-blue-600'} />
              <span className={`text-sm font-sequel ${
                isDark ? 'text-blue-300' : 'text-blue-700'
              }`}>
                Support conversation created
              </span>
              {hasNewMessage && (
                <span className={`text-xs px-2 py-0.5 rounded ${
                  isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                }`}>
                  New message
                </span>
              )}
            </div>
            <button
              onClick={handleOpenChat}
              className={`text-sm font-sequel underline ${
                isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              Open Chat
            </button>
          </div>
        </div>
      )}

      <button
        onClick={handleReceived}
        disabled={isLoading}
        className="w-full bg-tiktok-primary text-white py-3 rounded-xl font-semibold hover:bg-tiktok-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-sequel flex items-center justify-center space-x-2"
      >
        <CheckCircle size={18} weight="regular" />
        <span>I've Received the Credentials</span>
      </button>
    </div>
  )
}

