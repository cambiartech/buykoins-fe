'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Envelope, Lock, Eye, EyeSlash, ArrowRight, Moon, Sun } from '@phosphor-icons/react'
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { api, ApiError, getTiktokLinkUrl } from '@/lib/api'
import { useToast } from '@/lib/toast'
import { EmailVerificationModal } from '@/app/components/EmailVerificationModal'

interface FormErrors {
  email?: string
  password?: string
  confirmPassword?: string
  phone?: string
  firstName?: string
  lastName?: string
  general?: string
}

export default function SignupPage() {
  const router = useRouter()
  const toast = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [signupEmail, setSignupEmail] = useState('')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phone: '' as string | undefined,
    firstName: '',
    lastName: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    confirmPassword: false,
    phone: false,
    firstName: false,
    lastName: false,
  })

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

  // Password validation
  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return 'Password is required'
    }
    // Don't reveal password requirements for security
    return undefined
  }

  // Confirm password validation
  const validateConfirmPassword = (confirmPassword: string, password: string): string | undefined => {
    if (!confirmPassword) {
      return 'Please confirm your password'
    }
    if (confirmPassword !== password) {
      return 'Passwords do not match'
    }
    return undefined
  }

  // Phone validation – accept any valid international number (NG, UK, US, etc.)
  const validatePhone = (phone: string | undefined): string | undefined => {
    const phoneValue = (phone || '').trim()
    if (!phoneValue) {
      return 'Phone number is required'
    }
    if (!isValidPhoneNumber(phoneValue)) {
      return 'Please enter a valid phone number'
    }
    return undefined
  }

  // Validate firstName
  const validateFirstName = (firstName: string): string | undefined => {
    if (firstName && firstName.length > 100) {
      return 'First name must be 100 characters or less'
    }
    return undefined
  }

  // Validate lastName
  const validateLastName = (lastName: string): string | undefined => {
    if (lastName && lastName.length > 100) {
      return 'Last name must be 100 characters or less'
    }
    return undefined
  }

  // Handle input change
  const handleChange = (field: 'email' | 'password' | 'confirmPassword' | 'phone' | 'firstName' | 'lastName', value: string | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value || '' }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }

    // Validate on change if field has been touched
    if (touched[field]) {
      if (field === 'email') {
        const error = validateEmail(value || '')
        setErrors((prev) => ({ ...prev, email: error }))
      } else if (field === 'password') {
        const error = validatePassword(value || '')
        setErrors((prev) => ({ ...prev, password: error }))
        // Also validate confirm password if it's been touched
        if (touched.confirmPassword) {
          const confirmError = validateConfirmPassword(formData.confirmPassword, value || '')
          setErrors((prev) => ({ ...prev, confirmPassword: confirmError }))
        }
      } else if (field === 'confirmPassword') {
        const error = validateConfirmPassword(value || '', formData.password)
        setErrors((prev) => ({ ...prev, confirmPassword: error }))
      } else if (field === 'phone') {
        const error = validatePhone(value as string | undefined)
        setErrors((prev) => ({ ...prev, phone: error }))
      } else if (field === 'firstName') {
        const error = validateFirstName(value || '')
        setErrors((prev) => ({ ...prev, firstName: error }))
      } else if (field === 'lastName') {
        const error = validateLastName(value || '')
        setErrors((prev) => ({ ...prev, lastName: error }))
      }
    }
  }

  // Handle blur (when user leaves field)
  const handleBlur = (field: 'email' | 'password' | 'confirmPassword' | 'phone' | 'firstName' | 'lastName') => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    
    if (field === 'email') {
      const error = validateEmail(formData.email)
      setErrors((prev) => ({ ...prev, email: error }))
    } else if (field === 'password') {
      const error = validatePassword(formData.password)
      setErrors((prev) => ({ ...prev, password: error }))
      // Also validate confirm password if it's been touched
      if (touched.confirmPassword) {
        const confirmError = validateConfirmPassword(formData.confirmPassword, formData.password)
        setErrors((prev) => ({ ...prev, confirmPassword: confirmError }))
      }
    } else if (field === 'confirmPassword') {
      const error = validateConfirmPassword(formData.confirmPassword, formData.password)
      setErrors((prev) => ({ ...prev, confirmPassword: error }))
    } else if (field === 'phone') {
      const error = validatePhone(formData.phone as string | undefined)
      setErrors((prev) => ({ ...prev, phone: error }))
    } else if (field === 'firstName') {
      const error = validateFirstName(formData.firstName)
      setErrors((prev) => ({ ...prev, firstName: error }))
    } else if (field === 'lastName') {
      const error = validateLastName(formData.lastName)
      setErrors((prev) => ({ ...prev, lastName: error }))
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setTouched({ email: true, password: true, confirmPassword: true, phone: true, firstName: true, lastName: true })

    const emailError = validateEmail(formData.email)
    const passwordError = validatePassword(formData.password)
    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password)
    const phoneValue = formData.phone || ''
    const phoneError = validatePhone(phoneValue)
    const firstNameError = validateFirstName(formData.firstName)
    const lastNameError = validateLastName(formData.lastName)

    if (emailError || passwordError || confirmPasswordError || phoneError || firstNameError || lastNameError) {
      setErrors({
        email: emailError,
        password: passwordError,
        confirmPassword: confirmPasswordError,
        phone: phoneError,
        firstName: firstNameError,
        lastName: lastNameError,
      })
      return
    }

    setErrors({})
    setIsLoading(true)

    try {
      const phoneValue = formData.phone || ''
      const response = await api.auth.signup(
        formData.email, 
        formData.password, 
        phoneValue,
        formData.firstName || undefined,
        formData.lastName || undefined
      )

      if (response.success) {
        toast.success(response.message || 'Account created! Please check your email for verification code.')
        setSignupEmail(formData.email)
        setShowVerificationModal(true)
        setIsLoading(false)
      } else {
        // Handle success: false from backend
        toast.error(response.message || 'Signup failed. Please try again.')
        setIsLoading(false)
      }
    } catch (error) {
      setIsLoading(false)
      
      if (error instanceof ApiError) {
        // Always show the error message from backend
        const errorMessage = error.message || 'An error occurred'
        toast.error(errorMessage)
        
        // Handle field-specific errors if they exist
        if (error.errors && error.errors.length > 0) {
          const fieldErrors: FormErrors = {}
          error.errors.forEach((err) => {
            if (err.field === 'email' || err.field === 'password' || err.field === 'phone' || err.field === 'firstName' || err.field === 'lastName') {
              fieldErrors[err.field] = err.message
            }
          })
          if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors)
          }
        }
      } else {
        const errorMsg = 'An unexpected error occurred. Please try again.'
        setErrors({ general: errorMsg })
        toast.error(errorMsg)
      }
    }
  }

  const handleVerified = () => {
    router.push('/dashboard')
  }

  // Handle social login (mock)
  const handleSocialSignup = async (provider: 'google' | 'tiktok') => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    localStorage.setItem('userEmail', `user@${provider}.com`)
    router.push('/dashboard')
  }

  return (
    <div className={`min-h-screen flex transition-colors ${
      isDark ? 'bg-black' : 'bg-gray-50'
    }`}>
      {/* Left Column - Signup Form */}
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
          }`}>Create your account</h1>
          <p className={`font-sequel text-sm mb-8 ${
            isDark ? 'text-white/60' : 'text-gray-600'
          }`}>Join our agency and start earning</p>


          {/* Social Signup Options */}
          {/* <div className="flex gap-3 mb-6">
            <button
              onClick={() => handleSocialSignup('google')}
              disabled={isLoading}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                isDark
                  ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                  : 'bg-white border border-gray-200 text-gray-900 hover:bg-gray-50'
              }`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" className="flex-shrink-0">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="font-sequel text-xs sm:text-sm">Google</span>
            </button>
            
            <button
              onClick={() => handleSocialSignup('tiktok')}
              disabled={isLoading}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                isDark
                  ? 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                  : 'bg-white border border-gray-200 text-gray-900 hover:bg-gray-50'
              }`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="flex-shrink-0 text-tiktok-primary">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
              <span className="font-sequel text-xs sm:text-sm">TikTok</span>
            </button>
          </div> */}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${
                isDark ? 'border-white/10' : 'border-gray-200'
              }`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-3 font-sequel ${
                isDark 
                  ? 'bg-black text-white/40' 
                  : 'bg-gray-50 text-gray-500'
              }`}>OR</span>
            </div>
          </div>

          {/* Continue with TikTok */}
          <div className="mb-4">
            <button
              type="button"
              onClick={() => {
                const returnUrl = typeof window !== 'undefined' ? `${window.location.origin}/login` : ''
                if (returnUrl) window.location.href = getTiktokLinkUrl(returnUrl)
              }}
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border font-semibold font-sequel text-sm transition-all ${
                isDark
                  ? 'border-white/20 text-white hover:bg-white/5'
                  : 'border-gray-300 text-gray-800 hover:bg-gray-50'
              } disabled:opacity-50`}
            >
              <span className="font-bold text-[#00f2ea]">TikTok</span>
              <span>Continue with TikTok</span>
            </button>
          </div>

          {/* Email Signup Form */}
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
                  onBlur={() => handleBlur('email')}
                  className={`w-full border rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 transition-all font-sequel text-sm ${
                    errors.email
                      ? 'border-red-500/50 focus:ring-red-500/50'
                      : isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder-white/30 focus:ring-tiktok-primary focus:border-tiktok-primary/50'
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-tiktok-primary focus:border-tiktok-primary'
                  }`}
                  placeholder="Email"
                  disabled={isLoading}
                />
              </div>
              {errors.email && touched.email && (
                <p className="mt-1.5 text-red-400 text-xs font-sequel">{errors.email}</p>
              )}
            </div>

            {/* First Name Field */}
            <div>
              <label htmlFor="firstName" className={`block text-sm font-medium mb-2 font-sequel ${
                isDark ? 'text-white/80' : 'text-gray-700'
              }`}>
                First Name <span className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>(Optional)</span>
              </label>
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                onBlur={() => handleBlur('firstName')}
                className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 transition-all font-sequel text-sm ${
                  errors.firstName
                    ? 'border-red-500/50 focus:ring-red-500/50'
                    : isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder-white/30 focus:ring-tiktok-primary focus:border-tiktok-primary/50'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-tiktok-primary focus:border-tiktok-primary'
                }`}
                placeholder="First Name"
                disabled={isLoading}
              />
              {errors.firstName && touched.firstName && (
                <p className="mt-1.5 text-red-400 text-xs font-sequel">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name Field */}
            <div>
              <label htmlFor="lastName" className={`block text-sm font-medium mb-2 font-sequel ${
                isDark ? 'text-white/80' : 'text-gray-700'
              }`}>
                Last Name <span className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>(Optional)</span>
              </label>
              <input
                type="text"
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                onBlur={() => handleBlur('lastName')}
                className={`w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 transition-all font-sequel text-sm ${
                  errors.lastName
                    ? 'border-red-500/50 focus:ring-red-500/50'
                    : isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder-white/30 focus:ring-tiktok-primary focus:border-tiktok-primary/50'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-tiktok-primary focus:border-tiktok-primary'
                }`}
                placeholder="Last Name"
                disabled={isLoading}
              />
              {errors.lastName && touched.lastName && (
                <p className="mt-1.5 text-red-400 text-xs font-sequel">{errors.lastName}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className={`block text-sm font-medium mb-2 font-sequel ${
                isDark ? 'text-white/80' : 'text-gray-700'
              }`}>
                Phone Number
              </label>
              <div className={`phone-input-container ${
                errors.phone
                  ? 'error'
                  : ''
              }`}>
                <PhoneInput
                  international
                  defaultCountry="NG"
                  value={formData.phone as string | undefined}
                  onChange={(value) => {
                    const phoneValue = value || ''
                    handleChange('phone', phoneValue)
                    // Also mark as touched when user starts typing
                    if (!touched.phone && phoneValue) {
                      setTouched((prev) => ({ ...prev, phone: true }))
                    }
                  }}
                  onBlur={() => handleBlur('phone')}
                  disabled={isLoading}
                  className={`${
                    errors.phone
                      ? 'phone-input-error'
                      : ''
                  }`}
                />
              </div>
              {errors.phone && touched.phone && (
                <p className="mt-1.5 text-red-400 text-xs font-sequel">{errors.phone}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className={`block text-sm font-medium mb-2 font-sequel ${
                isDark ? 'text-white/80' : 'text-gray-700'
              }`}>
                Password
              </label>
              <div className="relative">
                <Lock 
                  size={18} 
                  weight="regular" 
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    errors.password 
                      ? 'text-red-400' 
                      : isDark 
                        ? 'text-white/40' 
                        : 'text-gray-400'
                  }`} 
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={`w-full border rounded-lg pl-10 pr-10 py-2.5 focus:outline-none focus:ring-1 transition-all font-sequel text-sm ${
                    errors.password
                      ? 'border-red-500/50 focus:ring-red-500/50'
                      : isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder-white/30 focus:ring-tiktok-primary focus:border-tiktok-primary/50'
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-tiktok-primary focus:border-tiktok-primary'
                  }`}
                  placeholder="Password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                    isDark
                      ? 'text-white/40 hover:text-white'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeSlash size={18} weight="regular" />
                  ) : (
                    <Eye size={18} weight="regular" />
                  )}
                </button>
              </div>
              {errors.password && touched.password && (
                <p className="mt-1.5 text-red-400 text-xs font-sequel">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className={`block text-sm font-medium mb-2 font-sequel ${
                isDark ? 'text-white/80' : 'text-gray-700'
              }`}>
                Confirm Password
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
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  className={`w-full border rounded-lg pl-10 pr-10 py-2.5 focus:outline-none focus:ring-1 transition-all font-sequel text-sm ${
                    errors.confirmPassword
                      ? 'border-red-500/50 focus:ring-red-500/50'
                      : isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder-white/30 focus:ring-tiktok-primary focus:border-tiktok-primary/50'
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-tiktok-primary focus:border-tiktok-primary'
                  }`}
                  placeholder="Confirm Password"
                  disabled={isLoading}
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

            {/* Terms */}
            <p className={`text-xs text-center font-sequel ${
              isDark ? 'text-white/60' : 'text-gray-600'
            }`}>
              By continuing, you agree to the{' '}
              <Link href="/terms" className="text-tiktok-primary hover:underline transition-colors">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-tiktok-primary hover:underline transition-colors">
                Privacy Policy
              </Link>
            </p>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#29013a] text-white px-4 py-3 rounded-lg font-semibold hover:bg-[#3d0054] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mt-6"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="font-sequel text-sm">Creating account...</span>
                </>
              ) : (
                <>
                  <span className="font-sequel text-sm">Continue</span>
                  <ArrowRight size={16} weight="regular" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className={`text-sm text-center mt-6 font-sequel ${
            isDark ? 'text-white/60' : 'text-gray-600'
          }`}>
            Already have an account?{' '}
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

      {/* Email Verification Modal */}
      {showVerificationModal && (
        <EmailVerificationModal
          email={signupEmail}
          onVerified={handleVerified}
          onClose={() => setShowVerificationModal(false)}
        />
      )}
    </div>
  )
}
