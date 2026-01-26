'use client'

import { UserPlus } from '@phosphor-icons/react'
import { api } from '@/lib/api'
import { socketManager } from '@/lib/socket'
import { getAuthToken } from '@/lib/auth'

interface RequestCredentialsStepProps {
  theme: 'light' | 'dark'
  isLoading: boolean
  error: string | null
  onSubmit: (step: string, data: any) => Promise<void>
  sessionData: any
}

export function RequestCredentialsStep({
  theme,
  isLoading,
  error,
  onSubmit,
}: RequestCredentialsStepProps) {
  const isDark = theme === 'dark'

  const handleSubmit = async () => {
    try {
      // Create onboarding conversation and send initial message
      const token = getAuthToken()
      if (token) {
        // Ensure socket is connected
        if (!socketManager.isConnected()) {
          await socketManager.connect(token)
        }

        // Create/get onboarding conversation
        const convResponse = await api.support.getOrCreateConversation('onboarding')
        if (convResponse.success && convResponse.data) {
          const conversation = (convResponse.data as any).conversation || convResponse.data
          const conversationId = conversation.id

          // Join conversation room
          socketManager.joinConversation(conversationId)

          // Send initial message
          const initialMessage = "I need help with onboarding. Please provide PayPal credentials and authentication code."
          socketManager.sendMessage(conversationId, initialMessage)

          // Store conversation ID in session data
          await onSubmit('request-credentials', { 
            conversationId,
            messageSent: true 
          })
        } else {
          // If conversation creation fails, still proceed with widget step
          await onSubmit('request-credentials', {})
        }
      } else {
        // No token, just proceed
        await onSubmit('request-credentials', {})
      }
    } catch (error) {
      console.error('Failed to create conversation:', error)
      // Still proceed with widget step even if conversation creation fails
      await onSubmit('request-credentials', {})
    }
  }

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg ${
        isDark 
          ? 'bg-blue-500/10 border border-blue-500/30' 
          : 'bg-blue-50 border border-blue-200'
      }`}>
        <div className="flex items-start space-x-3">
          <UserPlus size={24} weight="regular" className={`mt-1 ${
            isDark ? 'text-blue-400' : 'text-blue-600'
          }`} />
          <div>
            <h4 className={`font-semibold mb-2 font-sequel ${
              isDark ? 'text-blue-300' : 'text-blue-700'
            }`}>
              Request PayPal Credentials
            </h4>
            <p className={`text-sm font-sequel ${
              isDark ? 'text-blue-300/80' : 'text-blue-700'
            }`}>
              We'll provide you with PayPal login credentials to receive your TikTok earnings. 
              An admin will send you the credentials and an authentication code shortly.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full bg-tiktok-primary text-white py-3 rounded-xl font-semibold hover:bg-tiktok-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-sequel flex items-center justify-center space-x-2"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Requesting...</span>
          </>
        ) : (
          <>
            <UserPlus size={18} weight="regular" />
            <span>Request Credentials</span>
          </>
        )}
      </button>
    </div>
  )
}

