'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Envelope, ArrowRight, Moon, Sun, ArrowLeft } from '@phosphor-icons/react'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'

interface FormErrors {
  email?: string
  general?: string
}

export default function ForgotPasswordPage() {
  const router = useRouter()
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [formData, setFormData] = useState({
    email: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})

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
    document.documentElement.classList.toggle('light', initialTheme === 'light')
    
    // Listen for system theme changes
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent) => {
        // Only update if user hasn't manually set a preference
        if (!localStorage.getItem('authTheme')) {
          const newTheme = e.matches ? 'dark' : 'light'
          setTheme(newTheme)
          document.documentElement.classList.toggle('light', newTheme === 'light')
        }
      }
      
      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
      } else {
        // Fallback for older browsers
        mediaQuery.addListener(handleChange)
        return () => mediaQuery.removeListener(handleChange)
      }
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('authTheme', newTheme)
    document.documentElement.classList.toggle('light', newTheme === 'light')
  }

  const isDark = theme === 'dark'

  // Email validation
  const validateEmail = (email: string): string | undefined => {
    if (!email) {
      return 'Email is required'
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address'
    }
    return undefined
  }

  // Handle input change
  const handleChange = (field: 'email', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: undefined }))
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const emailError = validateEmail(formData.email)

    if (emailError) {
      setErrors({ email: emailError })
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      const response = await api.auth.forgotPassword(formData.email)

      if (response.success) {
        setEmailSent(true)
        toast.success(response.message || 'Password reset link sent to your email!')
      } else {
        const errorMsg = response.message || 'Failed to send reset link. Please try again.'
        setErrors({ general: errorMsg })
        toast.error(errorMsg)
        setIsLoading(false)
      }
    } catch (error) {
      setIsLoading(false)
      
      if (error instanceof ApiError) {
        const errorMessage = error.message || 'An error occurred. Please try again.'
        setErrors({ general: errorMessage })
        toast.error(errorMessage)
      } else {
        const errorMsg = 'An unexpected error occurred. Please try again.'
        setErrors({ general: errorMsg })
        toast.error(errorMsg)
      }
    }
  }

  return (
    <div className={`min-h-screen flex transition-colors ${
      isDark ? 'bg-black' : 'bg-gray-50'
    }`}>
      {/* Left Column - Forgot Password Form */}
      <div className="w-full lg:w-2/3 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Header with Logo and Theme Toggle */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="inline-flex items-center">
              <img 
                src={isDark ? '/logos/logo-white.png' : '/logos/logo-colored.png'} 
                alt="BuyKoins" 
                className="h-8 w-auto"
              />
            </Link>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'text-white/60 hover:text-white hover:bg-white/10' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={20} weight="regular" /> : <Moon size={20} weight="regular" />}
            </button>
          </div>

          {/* Title */}
          <h1 className={`font-monument font-bold text-3xl sm:text-4xl mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Forgot Password?</h1>
          <p className={`font-sequel text-sm mb-8 ${
            isDark ? 'text-white/60' : 'text-gray-600'
          }`}>
            {emailSent 
              ? 'Check your email for password reset instructions'
              : 'Enter your email address and we\'ll send you a link to reset your password'
            }
          </p>

          {/* General Error Message */}
          {errors.general && (
            <div className={`mb-4 p-4 rounded-lg ${
              isDark 
                ? 'bg-red-500/20 border border-red-500/50' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`text-sm font-sequel ${
                isDark ? 'text-red-300' : 'text-red-600'
              }`}>{errors.general}</p>
            </div>
          )}

          {!emailSent ? (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Email Field */}
              <div>
                <label htmlFor="email" className={`block text-sm font-medium mb-2 font-sequel ${
                  isDark ? 'text-white/80' : 'text-gray-700'
                }`}>
                  Email
                </label>
                <div className="relative">
                  <Envelope 
                    size={18} 
                    weight="regular" 
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                      errors.email 
                        ? 'text-red-400' 
                        : isDark 
                          ? 'text-white/40' 
                          : 'text-gray-400'
                    }`} 
                  />
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={`w-full border rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 transition-all font-sequel text-sm ${
                      errors.email
                        ? 'border-red-500/50 focus:ring-red-500/50'
                        : isDark
                          ? 'bg-white/5 border-white/10 text-white placeholder-white/30 focus:ring-tiktok-primary focus:border-tiktok-primary/50'
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-tiktok-primary focus:border-tiktok-primary'
                    }`}
                    placeholder="Enter your email"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-red-400 text-xs font-sequel">{errors.email}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-tiktok-primary text-white px-4 py-3 rounded-lg font-semibold hover:bg-tiktok-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mt-6"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="font-sequel text-sm">Sending...</span>
                  </>
                ) : (
                  <>
                    <span className="font-sequel text-sm">Send Reset Link</span>
                    <ArrowRight size={16} weight="regular" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className={`p-6 rounded-lg text-center ${
                isDark 
                  ? 'bg-white/5 border border-white/10' 
                  : 'bg-white border border-gray-200'
              }`}>
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-tiktok-primary/20 flex items-center justify-center">
                  <Envelope size={32} weight="regular" className="text-tiktok-primary" />
                </div>
                <h3 className={`font-monument font-bold text-xl mb-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Check Your Email</h3>
                <p className={`font-sequel text-sm ${
                  isDark ? 'text-white/60' : 'text-gray-600'
                }`}>
                  We've sent a password reset link to <strong>{formData.email}</strong>
                </p>
              </div>

              <button
                onClick={() => {
                  setEmailSent(false)
                  setFormData({ email: '' })
                  setErrors({})
                }}
                className={`w-full px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 ${
                  isDark
                    ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                    : 'bg-white border border-gray-200 text-gray-900 hover:bg-gray-50'
                }`}
              >
                <ArrowLeft size={16} weight="regular" />
                <span className="font-sequel text-sm">Back to Login</span>
              </button>
            </div>
          )}

          {/* Login Link */}
          <p className={`text-sm text-center mt-6 font-sequel ${
            isDark ? 'text-white/60' : 'text-gray-600'
          }`}>
            Remember your password?{' '}
            <Link href="/login" className="text-tiktok-primary hover:underline font-semibold transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>

      {/* Right Column - Artboard Background */}
      <div 
        className="hidden lg:flex lg:w-1/3 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/bg/artboard.png)',
        }}
      ></div>
    </div>
  )
}

