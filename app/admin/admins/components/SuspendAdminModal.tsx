'use client'

import { useState } from 'react'
import { X, Warning } from '@phosphor-icons/react'
import { useAdminTheme } from '../../hooks/useTheme'
import { getThemeClasses } from '../../utils/theme'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'

interface SuspendAdminModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  admin: { id: string; email: string; firstName?: string; lastName?: string } | null
  isSuspending: boolean
}

export function SuspendAdminModal({
  isOpen,
  onClose,
  onSuccess,
  admin,
  isSuspending,
}: SuspendAdminModalProps) {
  const isDark = useAdminTheme()
  const theme = getThemeClasses(isDark)
  const toast = useToast()

  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen || !admin) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = isSuspending
        ? await api.admin.suspendAdmin(admin.id, reason || undefined)
        : await api.admin.unsuspendAdmin(admin.id)

      if (response.success) {
        toast.success(isSuspending ? 'Admin suspended successfully' : 'Admin unsuspended successfully')
        onSuccess()
        handleClose()
      } else {
        const errorMsg = response.message || `Failed to ${isSuspending ? 'suspend' : 'unsuspend'} admin`
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const errorMsg = error.message || `Failed to ${isSuspending ? 'suspend' : 'unsuspend'} admin`
        setError(errorMsg)
        toast.error(errorMsg)
      } else {
        const errorMsg = 'An unexpected error occurred'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setReason('')
    setError(null)
    onClose()
  }

  const adminName = admin.firstName && admin.lastName
    ? `${admin.firstName} ${admin.lastName}`
    : admin.email

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className={`relative w-full max-w-md rounded-xl border ${
        isDark ? 'bg-black border-white/10' : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDark ? 'border-white/10' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              isSuspending ? 'bg-red-500/20' : 'bg-green-500/20'
            }`}>
              <Warning size={20} weight="regular" className={isSuspending ? 'text-red-400' : 'text-green-400'} />
            </div>
            <h2 className={`font-monument font-bold text-xl ${theme.text.primary}`}>
              {isSuspending ? 'Suspend Admin' : 'Unsuspend Admin'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
            }`}
          >
            <X size={20} weight="regular" className={theme.icon.default} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className={`p-4 rounded-lg ${
              isDark ? 'bg-red-500/20 border border-red-500/50' : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`text-sm font-sequel ${
                isDark ? 'text-red-300' : 'text-red-600'
              }`}>{error}</p>
            </div>
          )}

          <div>
            <p className={`text-sm font-sequel ${theme.text.secondary} mb-2`}>
              {isSuspending
                ? `Are you sure you want to suspend ${adminName}? They will not be able to log in until unsuspended.`
                : `Are you sure you want to unsuspend ${adminName}? They will be able to log in again.`}
            </p>
          </div>

          {isSuspending && (
            <div>
              <label className={`block text-sm font-semibold font-sequel mb-2 ${theme.text.secondary}`}>
                Reason (optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Enter reason for suspension..."
                className={`w-full ${theme.bg.input} ${theme.border.input} rounded-lg px-4 py-2 ${theme.text.primary} ${theme.text.placeholder} focus:outline-none focus:ring-2 focus:ring-tiktok-primary font-sequel resize-none`}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className={`px-4 py-2 rounded-lg font-sequel transition-colors ${
                isDark
                  ? 'bg-white/5 hover:bg-white/10 text-white/80'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg font-sequel transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isSuspending
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isLoading
                ? (isSuspending ? 'Suspending...' : 'Unsuspending...')
                : (isSuspending ? 'Suspend Admin' : 'Unsuspend Admin')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

