'use client'

import { useState } from 'react'
import { X, Eye, EyeSlash, Envelope } from '@phosphor-icons/react'
import { useAdminTheme } from '../../hooks/useTheme'
import { getThemeClasses } from '../../utils/theme'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  admin: { id: string; email: string } | null
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  onSuccess,
  admin,
}: ChangePasswordModalProps) {
  const isDark = useAdminTheme()
  const theme = getThemeClasses(isDark)
  const toast = useToast()

  const [step, setStep] = useState<'request' | 'verify'>('request')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [otpSent, setOtpSent] = useState(false)

  if (!isOpen || !admin) return null

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      const response = await api.admin.requestPasswordChangeOTP(admin.id)

      if (response.success) {
        toast.success('OTP sent to admin email')
        setOtpSent(true)
        setStep('verify')
      } else {
        const errorMsg = response.message || 'Failed to send OTP'
        setErrors({ general: errorMsg })
        toast.error(errorMsg)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const errorMsg = error.message || 'Failed to send OTP'
        setErrors({ general: errorMsg })
        toast.error(errorMsg)
      } else {
        const errorMsg = 'An unexpected error occurred'
        setErrors({ general: errorMsg })
        toast.error(errorMsg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyAndChange = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Record<string, string> = {}
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    if (!otp || otp.length !== 6) {
      newErrors.otp = 'Please enter a valid 6-digit OTP'
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setIsLoading(true)
    setErrors({})

    try {
      const response = await api.admin.verifyPasswordChangeOTP(admin.id, password, otp)

      if (response.success) {
        toast.success('Password changed successfully')
        onSuccess()
        handleClose()
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
        const errorMsg = 'An unexpected error occurred'
        setErrors({ general: errorMsg })
        toast.error(errorMsg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setStep('request')
    setPassword('')
    setConfirmPassword('')
    setOtp('')
    setErrors({})
    setShowPassword(false)
    setShowConfirmPassword(false)
    setOtpSent(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className={`relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl border ${
        isDark ? 'bg-black border-white/10' : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDark ? 'border-white/10' : 'border-gray-200'
        }`}>
          <h2 className={`font-monument font-bold text-xl ${theme.text.primary}`}>
            Change Password
          </h2>
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
        <form onSubmit={step === 'request' ? handleRequestOTP : handleVerifyAndChange} className="p-6 space-y-4">
          {errors.general && (
            <div className={`p-4 rounded-lg ${
              isDark ? 'bg-red-500/20 border border-red-500/50' : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`text-sm font-sequel ${
                isDark ? 'text-red-300' : 'text-red-600'
              }`}>{errors.general}</p>
            </div>
          )}

          {step === 'request' ? (
            <>
              <div className={`p-4 rounded-lg border ${
                isDark ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-start space-x-3">
                  <Envelope size={20} weight="regular" className="text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className={`text-sm font-sequel ${theme.text.primary} mb-1`}>
                      OTP Verification Required
                    </p>
                    <p className={`text-xs font-sequel ${theme.text.secondary}`}>
                      An OTP will be sent to <strong>{admin.email}</strong> to verify the password change.
                    </p>
                  </div>
                </div>
              </div>

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
                  className="px-4 py-2 rounded-lg bg-tiktok-primary hover:bg-tiktok-primary/90 text-white font-sequel transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 'Send OTP'}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className={`p-4 rounded-lg border ${
                isDark ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200'
              }`}>
                <p className={`text-sm font-sequel ${
                  isDark ? 'text-green-300' : 'text-green-700'
                }`}>
                  OTP sent to {admin.email}. Please check your email and enter the code below.
                </p>
              </div>

              <div>
                <label className={`block text-sm font-semibold font-sequel mb-2 ${theme.text.secondary}`}>
                  OTP Code *
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                    setOtp(value)
                    setErrors(prev => ({ ...prev, otp: '' }))
                  }}
                  placeholder="000000"
                  className={`w-full ${theme.bg.input} border-2 rounded-lg px-4 py-2.5 text-center text-2xl tracking-widest font-mono ${theme.text.primary} focus:outline-none focus:ring-2 focus:ring-tiktok-primary focus:border-tiktok-primary font-sequel transition-colors ${
                    errors.otp 
                      ? 'border-red-500' 
                      : isDark 
                      ? 'border-white/20' 
                      : 'border-gray-300'
                  }`}
                />
                {errors.otp && (
                  <p className="mt-1 text-sm text-red-400 font-sequel">{errors.otp}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-semibold font-sequel mb-2 ${theme.text.secondary}`}>
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setErrors(prev => ({ ...prev, password: '' }))
                    }}
                    className={`w-full ${theme.bg.input} border-2 rounded-lg px-4 py-2.5 pr-10 ${theme.text.primary} focus:outline-none focus:ring-2 focus:ring-tiktok-primary focus:border-tiktok-primary font-sequel transition-colors ${
                      errors.password 
                        ? 'border-red-500' 
                        : isDark 
                        ? 'border-white/20' 
                        : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeSlash size={20} weight="regular" className={theme.icon.default} />
                    ) : (
                      <Eye size={20} weight="regular" className={theme.icon.default} />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400 font-sequel">{errors.password}</p>
                )}
                <p className={`mt-1 text-xs font-sequel ${theme.text.muted}`}>
                  Minimum 8 characters
                </p>
              </div>

              <div>
                <label className={`block text-sm font-semibold font-sequel mb-2 ${theme.text.secondary}`}>
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      setErrors(prev => ({ ...prev, confirmPassword: '' }))
                    }}
                    className={`w-full ${theme.bg.input} border-2 rounded-lg px-4 py-2.5 pr-10 ${theme.text.primary} focus:outline-none focus:ring-2 focus:ring-tiktok-primary focus:border-tiktok-primary font-sequel transition-colors ${
                      errors.confirmPassword 
                        ? 'border-red-500' 
                        : isDark 
                        ? 'border-white/20' 
                        : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showConfirmPassword ? (
                      <EyeSlash size={20} weight="regular" className={theme.icon.default} />
                    ) : (
                      <Eye size={20} weight="regular" className={theme.icon.default} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400 font-sequel">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setStep('request')
                    setOtp('')
                    setPassword('')
                    setConfirmPassword('')
                    setErrors({})
                  }}
                  className={`px-4 py-2 rounded-lg font-sequel transition-colors ${
                    isDark
                      ? 'bg-white/5 hover:bg-white/10 text-white/80'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 rounded-lg bg-tiktok-primary hover:bg-tiktok-primary/90 text-white font-sequel transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}

