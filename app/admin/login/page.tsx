'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Envelope, Lock, Eye, EyeSlash, ArrowRight, Shield } from '@phosphor-icons/react'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'
import { setAuthToken, setRefreshToken, setAdmin } from '@/lib/auth'

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

export default function AdminLoginPage() {
  const router = useRouter()
  const toast = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  })

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

  // Handle input change
  const handleChange = (field: 'email' | 'password', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: undefined }))
    }

    if (touched[field]) {
      if (field === 'email') {
        const error = validateEmail(value)
        setErrors((prev) => ({ ...prev, email: error }))
      } else if (field === 'password') {
        const error = validatePassword(value)
        setErrors((prev) => ({ ...prev, password: error }))
      }
    }
  }

  // Handle blur
  const handleBlur = (field: 'email' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    
    if (field === 'email') {
      const error = validateEmail(formData.email)
      setErrors((prev) => ({ ...prev, email: error }))
    } else if (field === 'password') {
      const error = validatePassword(formData.password)
      setErrors((prev) => ({ ...prev, password: error }))
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setTouched({ email: true, password: true })

    const emailError = validateEmail(formData.email)
    const passwordError = validatePassword(formData.password)

    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError,
      })
      return
    }

    setErrors({ general: undefined })
    setIsLoading(true)

    try {
      const response = await api.admin.login(formData.email, formData.password)

      if (response.success && response.data) {
        const data = response.data as any
        // Store tokens
        if (data.token) {
          setAuthToken(data.token)
        }
        if (data.refreshToken) {
          setRefreshToken(data.refreshToken)
        }
        
        // Store admin data
        if (data.admin) {
          setAdmin(data.admin)
          localStorage.setItem('adminEmail', data.admin.email)
          // Also store role and permissions separately for backward compatibility
          if (data.admin.role) {
            localStorage.setItem('adminRole', data.admin.role)
          }
          if (data.admin.permissions) {
            localStorage.setItem('adminPermissions', JSON.stringify(data.admin.permissions))
          }
        }

        toast.success(response.message || 'Login successful!')
        router.push('/admin')
      } else {
        // Handle success: false from backend
        const errorMsg = response.message || 'Login failed. Please check your credentials.'
        setErrors({ general: errorMsg })
        toast.error(errorMsg)
        setIsLoading(false)
      }
    } catch (error) {
      setIsLoading(false)
      
      if (error instanceof ApiError) {
        // Always show the error message from backend - this is critical!
        const errorMessage = error.message || 'An error occurred. Please try again.'
        setErrors({ general: errorMessage })
        toast.error(errorMessage)
        console.error('Admin login error:', error)
        
        // Handle field-specific errors if they exist
        if (error.errors && error.errors.length > 0) {
          const fieldErrors: FormErrors = { general: errorMessage }
          error.errors.forEach((err) => {
            if (err.field === 'email' || err.field === 'password') {
              fieldErrors[err.field] = err.message
            }
          })
          setErrors(fieldErrors)
        }
      } else {
        const errorMsg = 'An unexpected error occurred. Please try again.'
        setErrors({ general: errorMsg })
        console.error('Unexpected admin login error:', error)
        toast.error(errorMsg)
      }
    }
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left Column - Admin Login Form */}
      <div className="w-full lg:w-2/3 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center mb-8">
            <img 
              src="/logos/logo-white.png" 
              alt="BuyKoins" 
              className="h-8 w-auto"
            />
          </Link>

          {/* Title */}
          <div className="flex items-center space-x-2 mb-2">
            <Shield size={24} weight="regular" className="text-tiktok-primary" />
            <h1 className="text-white font-monument font-bold text-3xl sm:text-4xl">Admin Login</h1>
          </div>
          <p className="text-white/60 font-sequel text-sm mb-8">Sign in to access the admin dashboard</p>


          {/* Email Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* General Error Message */}
            {errors.general && (
              <div className="mb-4 p-4 rounded-lg bg-red-500/20 border border-red-500/50">
                <p className="text-sm font-sequel text-red-300">{errors.general}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-white/80 text-sm font-medium mb-2 font-sequel">
                Email
              </label>
              <div className="relative">
                <Envelope 
                  size={18} 
                  weight="regular" 
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    errors.email ? 'text-red-400' : 'text-white/40'
                  }`} 
                />
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={`w-full bg-white/5 border rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:ring-1 transition-all font-sequel text-sm ${
                    errors.email
                      ? 'border-red-500/50 focus:ring-red-500/50'
                      : 'border-white/10 focus:ring-tiktok-primary focus:border-tiktok-primary/50'
                  }`}
                  placeholder="admin@email.com"
                  disabled={isLoading}
                />
              </div>
              {errors.email && touched.email && (
                <p className="mt-1.5 text-red-400 text-xs font-sequel">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-white/80 text-sm font-medium mb-2 font-sequel">
                Password
              </label>
              <div className="relative">
                <Lock 
                  size={18} 
                  weight="regular" 
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    errors.password ? 'text-red-400' : 'text-white/40'
                  }`} 
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={`w-full bg-white/5 border rounded-lg pl-10 pr-10 py-2.5 text-white placeholder-white/30 focus:outline-none focus:ring-1 transition-all font-sequel text-sm ${
                    errors.password
                      ? 'border-red-500/50 focus:ring-red-500/50'
                      : 'border-white/10 focus:ring-tiktok-primary focus:border-tiktok-primary/50'
                  }`}
                  placeholder="Password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white transition-colors"
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black px-4 py-3 rounded-lg font-semibold hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mt-6"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                  <span className="font-sequel text-sm">Signing in...</span>
                </>
              ) : (
                <>
                  <span className="font-sequel text-sm">Continue</span>
                  <ArrowRight size={16} weight="regular" />
                </>
              )}
            </button>
          </form>

          {/* Back to Home Link */}
          <p className="text-white/60 text-sm text-center mt-6 font-sequel">
            <Link href="/" className="text-tiktok-primary hover:underline transition-colors">
              Back to home
            </Link>
          </p>
        </div>
      </div>

      {/* Right Column - TikTok Primary Background */}
      <div className="hidden lg:flex lg:w-1/3 bg-tiktok-primary" />
    </div>
  )
}

