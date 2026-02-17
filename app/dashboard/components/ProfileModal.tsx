'use client'

import { useState, useEffect } from 'react'
import { X } from '@phosphor-icons/react'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'
import { getUser, setUser, isPlaceholderEmail } from '@/lib/auth'
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  theme: 'light' | 'dark'
  onProfileUpdated: () => void
}

export function ProfileModal({ isOpen, onClose, theme, onProfileUpdated }: ProfileModalProps) {
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  })
  const [errors, setErrors] = useState<{
    firstName?: string
    lastName?: string
    phone?: string
    email?: string
    general?: string
  }>({})
  const isDark = theme === 'dark'
  const user = getUser()
  const showEmailField = Boolean(user && isPlaceholderEmail(user.email))

  useEffect(() => {
    if (isOpen) {
      fetchProfile()
    }
  }, [isOpen])

  const fetchProfile = async () => {
    setIsFetching(true)
    try {
      const response = await api.user.getProfile()
      if (response.success && response.data) {
        const data = response.data as any
        const rawEmail = data.email || ''
        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
          email: isPlaceholderEmail(rawEmail) ? '' : rawEmail,
        })
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message || 'Failed to load profile')
      } else {
        toast.error('An unexpected error occurred')
      }
    } finally {
      setIsFetching(false)
    }
  }

  const handleChange = (field: 'firstName' | 'lastName' | 'phone' | 'email', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {}
    
    if (formData.firstName && formData.firstName.length > 100) {
      newErrors.firstName = 'First name must be 100 characters or less'
    }
    if (formData.lastName && formData.lastName.length > 100) {
      newErrors.lastName = 'Last name must be 100 characters or less'
    }
    if (showEmailField && formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address'
      }
    }
    if (showEmailField && !formData.email?.trim()) {
      newErrors.email = 'Email is required so we can reach you and send your credentials'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const updateData: { firstName?: string; lastName?: string; phone?: string; email?: string } = {}
      if (formData.firstName) updateData.firstName = formData.firstName
      if (formData.lastName) updateData.lastName = formData.lastName
      if (formData.phone) updateData.phone = formData.phone
      if (showEmailField && formData.email?.trim()) updateData.email = formData.email.trim()

      const response = await api.user.updateProfile(updateData)

      if (response.success) {
        toast.success(response.message || 'Profile updated successfully!')
        // Update local user data
        const currentUser = getUser()
        if (currentUser && response.data) {
          const data = response.data as any
          setUser({
            ...currentUser,
            firstName: data.firstName ?? currentUser.firstName,
            lastName: data.lastName ?? currentUser.lastName,
            phone: data.phone ?? currentUser.phone,
            email: data.email ?? currentUser.email,
          })
        }
        onProfileUpdated()
        onClose()
      } else {
        const errorMsg = response.message || 'Failed to update profile'
        setErrors({ general: errorMsg })
        toast.error(errorMsg)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const errorMsg = error.message || 'Failed to update profile'
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
          }`}>Edit Profile</h3>
          <button
            onClick={onClose}
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

          {/* Email (TikTok users only: add real email once) */}
          {showEmailField && (
            <div>
              <label className={`block text-sm font-medium mb-2 font-sequel ${
                isDark ? 'text-white/80' : 'text-gray-700'
              }`}>
                Email address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="Enter your email"
                disabled={isLoading || isFetching}
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-600 font-sequel ${
                  errors.email
                    ? 'border-red-500/50 focus:ring-red-500/50'
                    : isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
              />
              <p className={`mt-1 text-xs font-sequel ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                We need this to reach you and send your credentials. You can only set it once.
              </p>
              {errors.email && (
                <p className="mt-1.5 text-red-400 text-xs font-sequel">{errors.email}</p>
              )}
            </div>
          )}

          {/* First Name */}
          <div>
            <label className={`block text-sm font-medium mb-2 font-sequel ${
              isDark ? 'text-white/80' : 'text-gray-700'
            }`}>
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              placeholder="Enter first name"
              disabled={isLoading || isFetching}
              className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-600 font-sequel ${
                errors.firstName
                  ? 'border-red-500/50 focus:ring-red-500/50'
                  : isDark
                    ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
            />
            {errors.firstName && (
              <p className="mt-1.5 text-red-400 text-xs font-sequel">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className={`block text-sm font-medium mb-2 font-sequel ${
              isDark ? 'text-white/80' : 'text-gray-700'
            }`}>
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              placeholder="Enter last name"
              disabled={isLoading || isFetching}
              className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-600 font-sequel ${
                errors.lastName
                  ? 'border-red-500/50 focus:ring-red-500/50'
                  : isDark
                    ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
            />
            {errors.lastName && (
              <p className="mt-1.5 text-red-400 text-xs font-sequel">{errors.lastName}</p>
            )}
          </div>

          {/* Phone */}
          <div className={isDark ? 'phone-input-dark' : 'phone-input-light'}>
            <label className={`block text-sm font-medium mb-2 font-sequel ${
              isDark ? 'text-white/80' : 'text-gray-700'
            }`}>
              Phone Number
            </label>
            <div className={`phone-input-container ${
              errors.phone ? 'error' : ''
            }`}>
              <PhoneInput
                international
                defaultCountry="NG"
                value={formData.phone}
                onChange={(value) => handleChange('phone', value || '')}
                disabled={isLoading || isFetching}
                className={`${
                  errors.phone ? 'phone-input-error' : ''
                }`}
              />
            </div>
            {errors.phone && (
              <p className="mt-1.5 text-red-400 text-xs font-sequel">{errors.phone}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
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
              disabled={isLoading || isFetching}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-sequel flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : showEmailField && !formData.email?.trim() ? (
                <span>Provide email</span>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

