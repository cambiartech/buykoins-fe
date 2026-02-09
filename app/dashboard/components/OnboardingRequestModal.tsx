'use client'

import { useState } from 'react'
import { X, UserPlus, Clock } from '@phosphor-icons/react'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'

interface OnboardingRequestModalProps {
  isOpen: boolean
  onClose: () => void
  theme: 'light' | 'dark'
  onSuccess: () => void
}

export function OnboardingRequestModal({
  isOpen,
  onClose,
  theme,
  onSuccess,
}: OnboardingRequestModalProps) {
  const toast = useToast()
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isDark = theme === 'dark'

  const handleSubmit = async () => {
    setError(null)

    // Message is optional, but if provided, validate length
    if (message && message.trim().length > 1000) {
      const errorMsg = 'Message must be less than 1000 characters'
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    setIsLoading(true)

    try {
      const response = await api.user.submitOnboardingRequest(
        message.trim() || undefined
      )

      if (response.success) {
        toast.success(response.message || 'Onboarding request submitted successfully!')
        setMessage('')
        setError(null)
        onSuccess()
        onClose()
      } else {
        const errorMsg = response.message || 'Failed to submit onboarding request'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        let errorMsg = error.message || 'Failed to submit onboarding request'
        
        // Handle specific error cases
        if (error.status === 400) {
          errorMsg = 'You already have a pending onboarding request'
        } else if (error.status === 409) {
          errorMsg = 'You have already completed onboarding'
        }
        
        setError(errorMsg)
        toast.error(errorMsg)
      } else {
        const errorMsg = 'An unexpected error occurred. Please try again.'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setMessage('')
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border ${
        isDark 
          ? 'bg-black border-white/20' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <UserPlus size={24} weight="regular" className="text-tiktok-primary" />
            <h3 className={`font-monument font-bold text-lg ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Request Onboarding</h3>
          </div>
          <button
            onClick={handleClose}
            className={`${isDark ? 'text-white/80' : 'text-gray-700'}`}
            disabled={isLoading}
          >
            <X size={24} weight="regular" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          {/* Error Message */}
          {error && (
            <div className={`p-3 rounded-lg ${
              isDark 
                ? 'bg-red-500/20 border border-red-500/50' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`text-sm font-sequel ${
                isDark ? 'text-red-300' : 'text-red-600'
              }`}>{error}</p>
            </div>
          )}

          {/* Info Box */}
          <div className={`p-3 rounded-lg ${
            isDark 
              ? 'bg-blue-500/10 border border-blue-500/30' 
              : 'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex items-start space-x-2">
              <Clock size={18} weight="regular" className={`mt-0.5 ${
                isDark ? 'text-blue-400' : 'text-blue-600'
              }`} />
              <div>
                <p className={`text-sm font-semibold font-sequel ${
                  isDark ? 'text-blue-300' : 'text-blue-700'
                }`}>What is Onboarding?</p>
                <p className={`text-xs font-sequel mt-1 ${
                  isDark ? 'text-blue-300/80' : 'text-blue-700'
                }`}>
                  Onboarding helps us set up your payment method and connect your TikTok account. 
                  An admin will contact you to complete the setup process.
                </p>
              </div>
            </div>
          </div>

          {/* Message Input */}
          <div>
            <label className={`block text-sm font-medium mb-2 font-sequel ${
              isDark ? 'text-white/80' : 'text-gray-700'
            }`}>
              Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                setError(null)
              }}
              placeholder="Tell us what you need help with (e.g., 'I need help setting up my payment method')..."
              rows={4}
              maxLength={1000}
              disabled={isLoading}
              className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-600 font-sequel resize-none ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
            />
            <p className={`mt-1 text-xs font-sequel ${
              isDark ? 'text-white/40' : 'text-gray-400'
            }`}>
              Characters: {message.length} / 1000
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all font-sequel ${
                isDark
                  ? 'bg-white/5 text-white/80 hover:bg-white/10'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50`}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-sequel flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <UserPlus size={18} weight="regular" />
                  <span>Submit Request</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

