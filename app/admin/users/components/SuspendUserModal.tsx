'use client'

import { useState } from 'react'
import { X, Prohibit, User, Envelope } from '@phosphor-icons/react'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '@/lib/toast'

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
}

interface SuspendUserModalProps {
  isOpen: boolean
  onClose: () => void
  user: User
  onSuspend: (userId: string, reason: string) => Promise<void>
}

export function SuspendUserModal({
  isOpen,
  onClose,
  user,
  onSuspend,
}: SuspendUserModalProps) {
  const { isDark } = useTheme()
  const toast = useToast()
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ reason?: string; general?: string }>({})

  const handleSubmit = async () => {
    setErrors({})

    // Validate reason (required, min 10 chars)
    if (!reason || reason.trim().length < 10) {
      const errorMsg = 'Suspension reason must be at least 10 characters'
      setErrors({ reason: errorMsg })
      toast.error(errorMsg)
      return
    }

    setIsLoading(true)
    try {
      await onSuspend(user.id, reason.trim())
      // If successful, onSuspend will close the modal
      setReason('')
      setErrors({})
    } catch (error) {
      // Error is already handled in parent, but we can show it here too
      const errorMsg = error instanceof Error ? error.message : 'Failed to suspend user'
      setErrors({ general: errorMsg })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setReason('')
    setErrors({})
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
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <Prohibit size={24} weight="regular" className="text-red-500" />
            <h3 className={`font-monument font-bold text-lg ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Suspend User</h3>
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
            <div className="flex items-center space-x-3 mb-2">
              <User size={20} weight="regular" className={isDark ? 'text-white/60' : 'text-gray-600'} />
              <div>
                <p className={`font-semibold font-sequel ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.email.split('@')[0]}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Envelope size={16} weight="regular" className={isDark ? 'text-white/60' : 'text-gray-600'} />
              <p className={`text-sm font-sequel ${
                isDark ? 'text-white/70' : 'text-gray-700'
              }`}>{user.email}</p>
            </div>
          </div>

          {/* Warning */}
          <div className={`p-3 rounded-lg ${
            isDark 
              ? 'bg-yellow-500/10 border border-yellow-500/30' 
              : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <p className={`text-sm font-sequel ${
              isDark ? 'text-yellow-300' : 'text-yellow-700'
            }`}>
              ⚠️ Suspended users cannot login or use the platform. This action can be reversed.
            </p>
          </div>

          {/* Reason Input */}
          <div>
            <label className={`block text-sm font-medium mb-2 font-sequel ${
              isDark ? 'text-white/80' : 'text-gray-700'
            }`}>
              Suspension Reason <span className="text-red-400">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value)
                if (errors.reason) {
                  setErrors({})
                }
              }}
              placeholder="Please provide a detailed reason for suspending this user (minimum 10 characters)..."
              rows={4}
              disabled={isLoading}
              className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-tiktok-primary font-sequel resize-none ${
                errors.reason
                  ? 'border-red-500/50 focus:ring-red-500/50'
                  : isDark
                  ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
            />
            {errors.reason && (
              <p className="mt-1.5 text-red-400 text-xs font-sequel">{errors.reason}</p>
            )}
            <p className={`mt-1 text-xs font-sequel ${
              isDark ? 'text-white/50' : 'text-gray-500'
            }`}>
              Minimum 10 characters required
            </p>
            <p className={`mt-1 text-xs font-sequel ${
              isDark ? 'text-white/40' : 'text-gray-400'
            }`}>
              Characters: {reason.length} / 10 minimum
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
              disabled={isLoading || !reason || reason.trim().length < 10}
              className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-sequel flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Suspending...</span>
                </>
              ) : (
                <>
                  <Prohibit size={18} weight="regular" />
                  <span>Suspend User</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

