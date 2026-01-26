'use client'

import { useState } from 'react'
import { X, CheckCircle, User, Envelope, Phone, Wallet } from '@phosphor-icons/react'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '@/lib/toast'

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  balance?: number
}

interface CompleteOnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  user: User
  onComplete: (userId: string, notes: string) => Promise<void>
}

export function CompleteOnboardingModal({
  isOpen,
  onClose,
  user,
  onComplete,
}: CompleteOnboardingModalProps) {
  const { isDark } = useTheme()
  const toast = useToast()
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ notes?: string; general?: string }>({})

  const handleSubmit = async () => {
    setErrors({})

    // Validate notes (required, min 10 chars)
    if (!notes || notes.trim().length < 10) {
      const errorMsg = 'Onboarding notes must be at least 10 characters'
      setErrors({ notes: errorMsg })
      toast.error(errorMsg)
      return
    }

    setIsLoading(true)
    try {
      await onComplete(user.id, notes.trim())
      // If successful, onComplete will close the modal
      setNotes('')
      setErrors({})
    } catch (error) {
      // Error is already handled in parent, but we can show it here too
      const errorMsg = error instanceof Error ? error.message : 'Failed to complete onboarding'
      setErrors({ general: errorMsg })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setNotes('')
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-2xl rounded-2xl border max-h-[90vh] overflow-y-auto ${
        isDark 
          ? 'bg-black border-white/20' 
          : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-inherit">
          <div className="flex items-center space-x-3">
            <CheckCircle size={24} weight="regular" className="text-green-500" />
            <h3 className={`font-monument font-bold text-lg ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Complete Onboarding</h3>
          </div>
          <button
            onClick={handleClose}
            className={`${isDark ? 'text-white/80' : 'text-gray-700'}`}
            disabled={isLoading}
          >
            <X size={24} weight="regular" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* General Error */}
          {errors.general && (
            <div className={`p-3 rounded-lg ${
              isDark 
                ? 'bg-red-500/20 border border-red-500/50' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`text-sm font-sequel ${
                isDark ? 'text-red-300' : 'text-red-600'
              }`}>{errors.general}</p>
            </div>
          )}

          {/* User Info */}
          <div className={`p-4 rounded-xl border ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center space-x-3 mb-4">
              <User size={20} weight="regular" className={isDark ? 'text-white/60' : 'text-gray-600'} />
              <div>
                <p className={`font-semibold font-sequel ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.email.split('@')[0]}
                </p>
                <p className={`text-sm font-sequel ${
                  isDark ? 'text-white/60' : 'text-gray-600'
                }`}>{user.email}</p>
              </div>
            </div>
            {user.phone && (
              <div className="flex items-center space-x-3 mb-2">
                <Phone size={16} weight="regular" className={isDark ? 'text-white/60' : 'text-gray-600'} />
                <p className={`text-sm font-sequel ${
                  isDark ? 'text-white/70' : 'text-gray-700'
                }`}>{user.phone}</p>
              </div>
            )}
            {user.balance !== undefined && (
              <div className="flex items-center space-x-3">
                <Wallet size={16} weight="regular" className={isDark ? 'text-white/60' : 'text-gray-600'} />
                <p className={`text-sm font-sequel ${
                  isDark ? 'text-white/70' : 'text-gray-700'
                }`}>
                  Balance: ${user.balance.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className={`p-4 rounded-xl border ${
            isDark 
              ? 'bg-blue-500/10 border-blue-500/30' 
              : 'bg-blue-50 border-blue-200'
          }`}>
            <p className={`text-sm font-sequel mb-2 ${
              isDark ? 'text-blue-300' : 'text-blue-700'
            }`}>
              <strong>Important:</strong> Include all payment method details in the notes below:
            </p>
            <ul className={`text-xs font-sequel space-y-1 list-disc list-inside ${
              isDark ? 'text-blue-300/80' : 'text-blue-700'
            }`}>
              <li>Bank account details (bank name, account number, account name)</li>
              <li>PayPal email (if applicable)</li>
              <li>Payment method setup confirmation and date</li>
              <li>Meeting notes (if applicable)</li>
            </ul>
          </div>

          {/* Notes Input */}
          <div>
            <label className={`block text-sm font-medium mb-2 font-sequel ${
              isDark ? 'text-white/80' : 'text-gray-700'
            }`}>
              Onboarding Notes <span className="text-red-400">*</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value)
                if (errors.notes) {
                  setErrors({})
                }
              }}
              placeholder="Bank: First Bank of Nigeria, Account Number: 1234567890, Account Name: John Doe. PayPal: john.doe@example.com. Payment method configured on user's device on 2024-01-20. Meeting completed on 2024-01-20 at 2:00 PM. User understands the process and has agreed to terms."
              rows={8}
              disabled={isLoading}
              className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-tiktok-primary font-sequel resize-none ${
                errors.notes
                  ? 'border-red-500/50 focus:ring-red-500/50'
                  : isDark
                  ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
            />
            {errors.notes && (
              <p className="mt-1.5 text-red-400 text-xs font-sequel">{errors.notes}</p>
            )}
            <p className={`mt-1 text-xs font-sequel ${
              isDark ? 'text-white/50' : 'text-gray-500'
            }`}>
              Minimum 10 characters required. Include bank account, PayPal, payment method setup, and meeting notes.
            </p>
            <p className={`mt-1 text-xs font-sequel ${
              isDark ? 'text-white/40' : 'text-gray-400'
            }`}>
              Characters: {notes.length} / 10 minimum
            </p>
          </div>

          {/* Actions */}
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
              disabled={isLoading || !notes || notes.trim().length < 10}
              className="flex-1 bg-tiktok-primary text-white py-3 rounded-xl font-semibold hover:bg-tiktok-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-sequel flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Completing...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={18} weight="regular" />
                  <span>Complete Onboarding</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

