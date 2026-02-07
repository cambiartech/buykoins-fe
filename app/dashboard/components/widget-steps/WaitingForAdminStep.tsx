'use client'

import { Clock, CheckCircle, ChatCircle, Key } from '@phosphor-icons/react'
import { useState, useEffect } from 'react'
import { socketManager, Message } from '@/lib/socket'
import { api } from '@/lib/api'

interface WaitingForAdminStepProps {
  theme: 'light' | 'dark'
  isLoading: boolean
  error: string | null
  onSubmit: (step: string, data: any) => Promise<void>
  sessionData: any
  onOpenSupport?: (conversationId: string | null, type?: 'general' | 'onboarding' | 'call_request') => void
}

export function WaitingForAdminStep({
  theme,
  isLoading,
  onSubmit,
  sessionData,
  onOpenSupport,
}: WaitingForAdminStepProps) {
  const isDark = theme === 'dark'
  const [conversationId, setConversationId] = useState<string | null>(sessionData?.conversationId || null)
  const [hasNewMessage, setHasNewMessage] = useState(false)
  const [hasCredentials, setHasCredentials] = useState(false)
  const [hasOTP, setHasOTP] = useState(false)

  useEffect(() => {
    if (conversationId) {
      // Listen for new messages from admin
      const handleNewMessage = (message: Message) => {
        if (message.conversationId === conversationId && message.senderType === 'admin') {
          setHasNewMessage(true)
          // Check if message contains credentials indicators
          const messageText = message.message.toLowerCase()
          if (messageText.includes('tiktok') && (messageText.includes('username') || messageText.includes('password'))) {
            // Admin sent credentials
            setHasCredentials(true)
            setHasNewMessage(true)
          }
          if (messageText.includes('authentication code') || messageText.includes('otp') || (messageText.includes('code:') && /\d{6}/.test(message.message))) {
            // Admin sent OTP - automatically move to enter-auth-code step
            setHasOTP(true)
            setHasNewMessage(true)
            // Automatically transition to enter-auth-code step after a short delay
            setTimeout(() => {
              onSubmit('waiting-for-admin', { otpReceived: true })
            }, 1000)
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

  const handleReceiveOTP = async () => {
    // Request OTP from admin or move to enter-auth-code step
    await onSubmit('waiting-for-admin', { requestOTP: true })
  }

  const handleOpenChat = () => {
    if (onOpenSupport) {
      // Use direct callback if available (more reliable)
      onOpenSupport(conversationId, 'onboarding')
    } else {
      // Fallback to event dispatch
      const event = new CustomEvent('openSupportChat', { 
        detail: conversationId ? { conversationId, type: 'onboarding' as const } : { type: 'onboarding' as const },
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
            {!hasCredentials ? (
              <>
                <p className={`text-sm font-sequel ${
                  isDark ? 'text-yellow-300/80' : 'text-yellow-700'
                }`}>
                  An admin has been notified and will send you TikTok account credentials via the support chat. 
                  Click "Open Chat" below to view the conversation and continue with the admin. The admin will provide:
                </p>
                <ul className={`mt-2 space-y-1 text-sm font-sequel list-disc list-inside ${
                  isDark ? 'text-yellow-300/80' : 'text-yellow-700'
                }`}>
                  <li>TikTok username</li>
                  <li>TikTok password</li>
                  <li>Instructions to set up the payout method</li>
                </ul>
              </>
            ) : (
              <>
                <p className={`text-sm font-sequel ${
                  isDark ? 'text-yellow-300/80' : 'text-yellow-700'
                }`}>
                  Great! You've received the TikTok credentials. Please follow the instructions in the chat to set up your payout method.
                </p>
                {!hasOTP && (
                  <div className={`mt-3 p-3 rounded-lg ${
                    isDark ? 'bg-green-500/10 border border-green-500/30' : 'bg-green-50 border border-green-200'
                  }`}>
                    <p className={`text-sm font-semibold font-sequel ${
                      isDark ? 'text-green-300' : 'text-green-700'
                    }`}>
                      Done? Request OTP
                    </p>
                    <p className={`text-xs mt-1 font-sequel ${
                      isDark ? 'text-green-300/80' : 'text-green-700'
                    }`}>
                      Once you've completed the setup, click "Receive OTP" below or ask the admin in chat to send you the authentication code.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {conversationId && (
        <div className={`p-3 rounded-lg mb-4 ${
          isDark 
            ? 'bg-blue-500/10 border border-blue-500/30' 
            : 'bg-blue-50 border border-blue-200'
        }`}>
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
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          onClick={handleOpenChat}
          className="w-full bg-white border-2 border-blue-600 text-blue-600 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all font-sequel flex items-center justify-center space-x-2"
        >
          <ChatCircle size={18} weight="regular" />
          <span>Open Chat</span>
        </button>
        
        {hasCredentials && !hasOTP && (
          <button
            onClick={handleReceiveOTP}
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-sequel flex items-center justify-center space-x-2"
          >
            <Key size={18} weight="regular" />
            <span>Receive OTP</span>
          </button>
        )}
        
        {hasCredentials && (
          <button
            onClick={handleReceived}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-sequel flex items-center justify-center space-x-2"
          >
            <CheckCircle size={18} weight="regular" />
            <span>I've Received the Credentials</span>
          </button>
        )}
      </div>
    </div>
  )
}

