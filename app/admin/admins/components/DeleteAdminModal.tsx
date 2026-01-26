'use client'

import { useState } from 'react'
import { X, Warning, Trash } from '@phosphor-icons/react'
import { useAdminTheme } from '../../hooks/useTheme'
import { getThemeClasses } from '../../utils/theme'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'

interface DeleteAdminModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  admin: { id: string; email: string; firstName?: string; lastName?: string } | null
}

export function DeleteAdminModal({
  isOpen,
  onClose,
  onSuccess,
  admin,
}: DeleteAdminModalProps) {
  const isDark = useAdminTheme()
  const theme = getThemeClasses(isDark)
  const toast = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmText, setConfirmText] = useState('')

  if (!isOpen || !admin) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await api.admin.deleteAdmin(admin.id)

      if (response.success) {
        toast.success('Admin deleted successfully')
        onSuccess()
        handleClose()
      } else {
        const errorMsg = response.message || 'Failed to delete admin'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const errorMsg = error.message || 'Failed to delete admin'
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
    setConfirmText('')
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
        isDark ? 'bg-black border-red-500/50' : 'bg-white border-red-200'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDark ? 'border-red-500/50' : 'border-red-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <Trash size={20} weight="regular" className="text-red-400" />
            </div>
            <h2 className={`font-monument font-bold text-xl ${theme.text.primary}`}>
              Delete Admin
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

          <div className={`p-4 rounded-lg ${
            isDark ? 'bg-red-500/10 border border-red-500/30' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-start space-x-3">
              <Warning size={20} weight="regular" className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className={`font-semibold font-sequel mb-2 ${theme.text.primary}`}>
                  This action cannot be undone
                </p>
                <p className={`text-sm font-sequel ${theme.text.secondary}`}>
                  You are about to delete <strong>{adminName}</strong>. This will permanently disable their account and they will not be able to log in.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-semibold font-sequel mb-2 ${theme.text.secondary}`}>
              Type <strong>DELETE</strong> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => {
                setConfirmText(e.target.value)
                setError(null)
              }}
              placeholder="DELETE"
              className={`w-full ${theme.bg.input} ${theme.border.input} rounded-lg px-4 py-2 ${theme.text.primary} focus:outline-none focus:ring-2 focus:ring-red-500 font-sequel ${
                error ? 'border-red-500' : ''
              }`}
            />
          </div>

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
              disabled={isLoading || confirmText !== 'DELETE'}
              className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-sequel transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Deleting...' : 'Delete Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

