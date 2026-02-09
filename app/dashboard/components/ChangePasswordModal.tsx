'use client'

import { useState } from 'react'
import { X, Eye, EyeSlash, Lock } from '@phosphor-icons/react'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
  theme: 'light' | 'dark'
  onSuccess: () => void
}

export function ChangePasswordModal({ isOpen, onClose, theme, onSuccess }: ChangePasswordModalProps) {
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<{
    currentPassword?: string
    newPassword?: string
    confirmPassword?: string
    general?: string
  }>({})
  const [touched, setTouched] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  })
  const isDark = theme === 'dark'

  const validateCurrentPassword = (password: string): string | undefined => {
    if (!password) {
      return 'Current password is required'
    }
    return undefined
  }

  const validateNewPassword = (password: string): string | undefined => {
    if (!password) {
      return 'New password is required'
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters'
    }
    if (password === formData.currentPassword) {
      return 'New password must be different from current password'
    }
    return undefined
  }

  const validateConfirmPassword = (confirmPassword: string, newPassword: string): string | undefined => {
    if (!confirmPassword) {
      return 'Please confirm your new password'
    }
    if (confirmPassword !== newPassword) {
      return 'Passwords do not match'
    }
    return undefined
  }

  const handleChange = (field: 'currentPassword' | 'newPassword' | 'confirmPassword', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: undefined }))
    }

    // Validate on change if field has been touched
    if (touched[field]) {
      if (field === 'currentPassword') {
        const error = validateCurrentPassword(value)
        setErrors((prev) => ({ ...prev, currentPassword: error }))
      } else if (field === 'newPassword') {
        const error = validateNewPassword(value)
        setErrors((prev) => ({ ...prev, newPassword: error }))
        // Also validate confirm password if it's been touched
        if (touched.confirmPassword) {
          const confirmError = validateConfirmPassword(formData.confirmPassword, value)
          setErrors((prev) => ({ ...prev, confirmPassword: confirmError }))
        }
      } else if (field === 'confirmPassword') {
        const error = validateConfirmPassword(value, formData.newPassword)
        setErrors((prev) => ({ ...prev, confirmPassword: error }))
      }
    }
  }

  const handleBlur = (field: 'currentPassword' | 'newPassword' | 'confirmPassword') => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    
    if (field === 'currentPassword') {
      const error = validateCurrentPassword(formData.currentPassword)
      setErrors((prev) => ({ ...prev, currentPassword: error }))
    } else if (field === 'newPassword') {
      const error = validateNewPassword(formData.newPassword)
      setErrors((prev) => ({ ...prev, newPassword: error }))
      // Also validate confirm password if it's been touched
      if (touched.confirmPassword) {
        const confirmError = validateConfirmPassword(formData.confirmPassword, formData.newPassword)
        setErrors((prev) => ({ ...prev, confirmPassword: confirmError }))
      }
    } else if (field === 'confirmPassword') {
      const error = validateConfirmPassword(formData.confirmPassword, formData.newPassword)
      setErrors((prev) => ({ ...prev, confirmPassword: error }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setTouched({ currentPassword: true, newPassword: true, confirmPassword: true })

    const currentPasswordError = validateCurrentPassword(formData.currentPassword)
    const newPasswordError = validateNewPassword(formData.newPassword)
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.newPassword)

    if (currentPasswordError || newPasswordError || confirmPasswordError) {
      setErrors({
        currentPassword: currentPasswordError,
        newPassword: newPasswordError,
        confirmPassword: confirmPasswordError,
      })
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const response = await api.auth.changePassword(formData.currentPassword, formData.newPassword)

      if (response.success) {
        toast.success(response.message || 'Password changed successfully!')
        // Reset form
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
        setTouched({
          currentPassword: false,
          newPassword: false,
          confirmPassword: false,
        })
        onSuccess()
        onClose()
      } else {
        const errorMsg = response.message || 'Failed to change password'
        setErrors({ general: errorMsg })
        toast.error(errorMsg)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const errorMsg = error.message || 'Failed to change password'
        setErrors({ general: errorMsg })
        toast.error(errorMsg)
      } else {
        const errorMsg = 'An unexpected error occurred. Please try again.'
        setErrors({ general: errorMsg })
        toast.error(errorMsg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    })
    setErrors({})
    setTouched({
      currentPassword: false,
      newPassword: false,
      confirmPassword: false,
    })
    setShowCurrentPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
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
          <h3 className={`font-monument font-bold text-lg ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Change Password</h3>
          <button
            onClick={handleClose}
            className={`${isDark ? 'text-white/80' : 'text-gray-700'}`}
            disabled={isLoading}
          >
            <X size={24} weight="regular" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
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

          {/* Current Password */}
          <div>
            <label className={`block text-sm font-medium mb-2 font-sequel ${
              isDark ? 'text-white/80' : 'text-gray-700'
            }`}>
              Current Password
            </label>
            <div className="relative">
              <Lock 
                size={18} 
                weight="regular" 
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  errors.currentPassword 
                    ? 'text-red-400' 
                    : isDark 
                      ? 'text-white/40' 
                      : 'text-gray-400'
                }`} 
              />
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={(e) => handleChange('currentPassword', e.target.value)}
                onBlur={() => handleBlur('currentPassword')}
                placeholder="Enter current password"
                disabled={isLoading}
                className={`w-full border rounded-lg pl-10 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 font-sequel ${
                  errors.currentPassword
                    ? 'border-red-500/50 focus:ring-red-500/50'
                    : isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                  isDark
                    ? 'text-white/40 hover:text-white'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                disabled={isLoading}
              >
                {showCurrentPassword ? (
                  <EyeSlash size={18} weight="regular" />
                ) : (
                  <Eye size={18} weight="regular" />
                )}
              </button>
            </div>
            {errors.currentPassword && touched.currentPassword && (
              <p className="mt-1.5 text-red-400 text-xs font-sequel">{errors.currentPassword}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className={`block text-sm font-medium mb-2 font-sequel ${
              isDark ? 'text-white/80' : 'text-gray-700'
            }`}>
              New Password
            </label>
            <div className="relative">
              <Lock 
                size={18} 
                weight="regular" 
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  errors.newPassword 
                    ? 'text-red-400' 
                    : isDark 
                      ? 'text-white/40' 
                      : 'text-gray-400'
                }`} 
              />
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => handleChange('newPassword', e.target.value)}
                onBlur={() => handleBlur('newPassword')}
                placeholder="Enter new password"
                disabled={isLoading}
                className={`w-full border rounded-lg pl-10 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 font-sequel ${
                  errors.newPassword
                    ? 'border-red-500/50 focus:ring-red-500/50'
                    : isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                  isDark
                    ? 'text-white/40 hover:text-white'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                disabled={isLoading}
              >
                {showNewPassword ? (
                  <EyeSlash size={18} weight="regular" />
                ) : (
                  <Eye size={18} weight="regular" />
                )}
              </button>
            </div>
            {errors.newPassword && touched.newPassword && (
              <p className="mt-1.5 text-red-400 text-xs font-sequel">{errors.newPassword}</p>
            )}
            <p className={`mt-1 text-xs font-sequel ${
              isDark ? 'text-white/50' : 'text-gray-500'
            }`}>
              Must be at least 6 characters and different from current password
            </p>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className={`block text-sm font-medium mb-2 font-sequel ${
              isDark ? 'text-white/80' : 'text-gray-700'
            }`}>
              Confirm New Password
            </label>
            <div className="relative">
              <Lock 
                size={18} 
                weight="regular" 
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  errors.confirmPassword 
                    ? 'text-red-400' 
                    : isDark 
                      ? 'text-white/40' 
                      : 'text-gray-400'
                }`} 
              />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                placeholder="Confirm new password"
                disabled={isLoading}
                className={`w-full border rounded-lg pl-10 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 font-sequel ${
                  errors.confirmPassword
                    ? 'border-red-500/50 focus:ring-red-500/50'
                    : isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                  isDark
                    ? 'text-white/40 hover:text-white'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeSlash size={18} weight="regular" />
                ) : (
                  <Eye size={18} weight="regular" />
                )}
              </button>
            </div>
            {errors.confirmPassword && touched.confirmPassword && (
              <p className="mt-1.5 text-red-400 text-xs font-sequel">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-2">
            <button
              type="button"
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
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-sequel flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Changing...</span>
                </>
              ) : (
                <span>Change Password</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

