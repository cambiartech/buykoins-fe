'use client'

import { useState, useEffect } from 'react'
import { X, Envelope, ArrowRight } from '@phosphor-icons/react'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'
import { setAuthToken, setRefreshToken, setUser } from '@/lib/auth'

interface EmailVerificationModalProps {
  email: string
  onVerified: () => void
  onClose: () => void
}

export function EmailVerificationModal({ email, onVerified, onClose }: EmailVerificationModalProps) {
  const toast = useToast()
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get system preference or default to light
    const getSystemTheme = (): 'light' | 'dark' => {
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      return 'light' // Default to light if can't detect
    }

    // Load theme preference from localStorage, or use system preference, or default to light
    const savedTheme = localStorage.getItem('authTheme') as 'light' | 'dark' | null
    const initialTheme = savedTheme || getSystemTheme()
    setTheme(initialTheme)
  }, [])

  const isDark = theme === 'dark'

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return
    
    const newCode = [...verificationCode]
    newCode[index] = value
    
    setVerificationCode(newCode)
    
    // Clear error when user starts typing
    if (error) {
      setError(null)
    }

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    const newCode = pastedData.split('').concat(Array(6 - pastedData.length).fill(''))
    setVerificationCode(newCode)
    
    // Focus last filled input
    const lastFilledIndex = Math.min(pastedData.length, 5)
    const lastInput = document.getElementById(`code-${lastFilledIndex}`)
    lastInput?.focus()
  }

  const handleVerify = async () => {
    const code = verificationCode.join('')
    
    if (code.length !== 6) {
      const errorMsg = 'Please enter the complete 6-digit code'
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const response = await api.auth.verifyEmail(email, code)

      if (response.success && response.data) {
        const data = response.data as any
        // Store tokens
        if (data.token) {
          setAuthToken(data.token)
        }
        if (data.refreshToken) {
          setRefreshToken(data.refreshToken)
        }
        
        // Store user data
        if (data.userId) {
          setUser({
            id: data.userId,
            email: email,
            emailVerified: true,
          })
          localStorage.setItem('userEmail', email)
        }

        toast.success(response.message || 'Email verified successfully!')
        onVerified()
      } else {
        // Handle success: false from backend
        const errorMsg = response.message || 'Verification failed. Please try again.'
        setError(errorMsg)
        toast.error(errorMsg)
        setIsLoading(false)
        // Clear code on error
        setVerificationCode(['', '', '', '', '', ''])
        document.getElementById('code-0')?.focus()
      }
    } catch (error) {
      setIsLoading(false)
      
      if (error instanceof ApiError) {
        // Always show the error message from backend
        const errorMsg = error.message || 'Invalid verification code. Please try again.'
        setError(errorMsg)
        toast.error(errorMsg)
        // Clear code on error
        setVerificationCode(['', '', '', '', '', ''])
        document.getElementById('code-0')?.focus()
      } else {
        const errorMsg = 'An unexpected error occurred. Please try again.'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    }
  }

  const handleResend = async () => {
    setError(null)
    setIsResending(true)

    try {
      const response = await api.auth.resendVerification(email)

      if (response.success) {
        const successMsg = response.message || 'Verification code resent! Please check your email.'
        toast.success(successMsg)
        // Clear code when resending
        setVerificationCode(['', '', '', '', '', ''])
        document.getElementById('code-0')?.focus()
      } else {
        const errorMsg = response.message || 'Failed to resend code. Please try again.'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const errorMsg = error.message || 'Failed to resend code. Please try again.'
        setError(errorMsg)
        toast.error(errorMsg)
      } else {
        const errorMsg = 'An unexpected error occurred. Please try again.'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className={`fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${
      isDark ? 'bg-black/80' : 'bg-gray-900/80'
    }`}>
      <div className={`border rounded-2xl p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto ${
        isDark 
          ? 'bg-black border-white/10' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isDark ? 'bg-tiktok-primary/20' : 'bg-tiktok-primary/10'
            }`}>
              <Envelope size={24} weight="regular" className="text-tiktok-primary" />
            </div>
            <div>
              <h2 className={`font-monument font-bold text-xl ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Verify your email</h2>
              <p className={`font-sequel text-sm ${
                isDark ? 'text-white/60' : 'text-gray-600'
              }`}>Enter the 6-digit code</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`transition-colors ${
              isDark 
                ? 'text-white/60 hover:text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            disabled={isLoading}
          >
            <X size={24} weight="regular" />
          </button>
        </div>

        <div className="mb-6">
          <p className={`font-sequel text-sm mb-4 text-center ${
            isDark ? 'text-white/80' : 'text-gray-700'
          }`}>
            We sent a verification code to <span className="text-tiktok-primary font-semibold">{email}</span>
          </p>

          {/* Error Message */}
          {error && (
            <div className={`mb-4 p-3 rounded-lg ${
              isDark 
                ? 'bg-red-500/20 border border-red-500/50' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`text-sm font-sequel text-center ${
                isDark ? 'text-red-300' : 'text-red-600'
              }`}>{error}</p>
            </div>
          )}

          <div className="flex items-center justify-center space-x-2 mb-4">
            {verificationCode.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className={`w-12 h-14 border rounded-lg text-center font-monument font-bold text-xl focus:outline-none focus:ring-2 focus:ring-tiktok-primary focus:border-tiktok-primary transition-all ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white'
                    : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}
                disabled={isLoading}
                autoFocus={index === 0}
              />
            ))}
          </div>

          <button
            onClick={handleResend}
            disabled={isResending}
            className="w-full text-tiktok-primary hover:text-tiktok-primary/80 font-sequel text-sm transition-colors disabled:opacity-50"
          >
            {isResending ? 'Resending...' : "Didn't receive code? Resend"}
          </button>
        </div>

        <button
          onClick={handleVerify}
          disabled={isLoading || verificationCode.join('').length !== 6}
          className="w-full bg-tiktok-primary hover:bg-tiktok-primary/90 text-white px-4 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span className="font-sequel text-sm">Verifying...</span>
            </>
          ) : (
            <>
              <span className="font-sequel text-sm">Verify Email</span>
              <ArrowRight size={16} weight="regular" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}

