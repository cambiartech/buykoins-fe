'use client'

import { useState } from 'react'
import { X, Eye, EyeSlash, ArrowRight, ArrowLeft, Check } from '@phosphor-icons/react'
import { useAdminTheme } from '../../hooks/useTheme'
import { getThemeClasses } from '../../utils/theme'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'

interface CreateAdminModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  availablePermissions: string[]
  permissionGroups: Record<string, string[]>
}

export function CreateAdminModal({
  isOpen,
  onClose,
  onSuccess,
  availablePermissions,
  permissionGroups,
}: CreateAdminModalProps) {
  const isDark = useAdminTheme()
  const theme = getThemeClasses(isDark)
  const toast = useToast()

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'admin' as 'admin' | 'super_admin',
    permissions: [] as string[],
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!isOpen) return null

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2)
      setErrors({})
    }
  }

  const handleBack = () => {
    setStep(1)
    setErrors({})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) {
      handleNext()
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const payload: any = {
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        role: formData.role,
      }

      // Only include permissions if role is admin (super_admin has all permissions)
      if (formData.role === 'admin' && formData.permissions.length > 0) {
        payload.permissions = formData.permissions
      }

      const response = await api.admin.createAdmin(payload)

      if (response.success) {
        toast.success('Admin created successfully')
        onSuccess()
        handleClose()
      } else {
        const errorMsg = response.message || 'Failed to create admin'
        setErrors({ general: errorMsg })
        toast.error(errorMsg)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const errorMsg = error.message || 'Failed to create admin'
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
    setStep(1)
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      role: 'admin',
      permissions: [],
    })
    setErrors({})
    setShowPassword(false)
    setShowConfirmPassword(false)
    onClose()
  }

  const togglePermission = (permission: string) => {
    if (formData.role === 'super_admin') return

    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission],
    }))
  }

  const toggleModulePermissions = (modulePermissions: string[]) => {
    if (formData.role === 'super_admin') return

    const allSelected = modulePermissions.every(p => formData.permissions.includes(p))
    
    setFormData(prev => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter(p => !modulePermissions.includes(p))
        : Array.from(new Set([...prev.permissions, ...modulePermissions])),
    }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border ${
        isDark ? 'bg-black border-white/10' : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDark ? 'border-white/10' : 'border-gray-200'
        }`}>
          <div>
            <h2 className={`font-monument font-bold text-xl mb-1 ${theme.text.primary}`}>
              Create New Admin
            </h2>
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-1 text-xs font-sequel ${
                step >= 1 ? 'text-tiktok-primary' : theme.text.muted
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  step >= 1 ? 'bg-tiktok-primary text-white' : isDark ? 'bg-white/10 text-white/40' : 'bg-gray-200 text-gray-400'
                }`}>
                  {step > 1 ? <Check size={14} weight="bold" /> : '1'}
                </div>
                <span>Basic Info</span>
              </div>
              <div className={`w-8 h-0.5 ${
                step >= 2 ? 'bg-tiktok-primary' : isDark ? 'bg-white/10' : 'bg-gray-200'
              }`} />
              <div className={`flex items-center space-x-1 text-xs font-sequel ${
                step >= 2 ? 'text-tiktok-primary' : theme.text.muted
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  step >= 2 ? 'bg-tiktok-primary text-white' : isDark ? 'bg-white/10 text-white/40' : 'bg-gray-200 text-gray-400'
                }`}>
                  2
                </div>
                <span>Permissions</span>
              </div>
            </div>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* General Error */}
          {errors.general && (
            <div className={`p-4 rounded-lg ${
              isDark ? 'bg-red-500/20 border border-red-500/50' : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`text-sm font-sequel ${
                isDark ? 'text-red-300' : 'text-red-600'
              }`}>{errors.general}</p>
            </div>
          )}

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className={`font-semibold font-sequel text-lg ${theme.text.primary}`}>Basic Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-semibold font-sequel mb-2 ${theme.text.secondary}`}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className={`w-full ${theme.bg.input} border-2 rounded-lg px-4 py-2.5 ${theme.text.primary} focus:outline-none focus:ring-2 focus:ring-tiktok-primary focus:border-tiktok-primary font-sequel transition-colors ${
                      errors.firstName 
                        ? 'border-red-500' 
                        : isDark 
                        ? 'border-white/20' 
                        : 'border-gray-300'
                    }`}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-400 font-sequel">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-semibold font-sequel mb-2 ${theme.text.secondary}`}>
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className={`w-full ${theme.bg.input} border-2 rounded-lg px-4 py-2.5 ${theme.text.primary} focus:outline-none focus:ring-2 focus:ring-tiktok-primary focus:border-tiktok-primary font-sequel transition-colors ${
                      errors.lastName 
                        ? 'border-red-500' 
                        : isDark 
                        ? 'border-white/20' 
                        : 'border-gray-300'
                    }`}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-400 font-sequel">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-semibold font-sequel mb-2 ${theme.text.secondary}`}>
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full ${theme.bg.input} border-2 rounded-lg px-4 py-2.5 ${theme.text.primary} focus:outline-none focus:ring-2 focus:ring-tiktok-primary focus:border-tiktok-primary font-sequel transition-colors ${
                    errors.email 
                      ? 'border-red-500' 
                      : isDark 
                      ? 'border-white/20' 
                      : 'border-gray-300'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400 font-sequel">{errors.email}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-semibold font-sequel mb-2 ${theme.text.secondary}`}>
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
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
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
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
              </div>

              <div>
                <label className={`block text-sm font-semibold font-sequel mb-2 ${theme.text.secondary}`}>
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => {
                    const role = e.target.value as 'admin' | 'super_admin'
                    setFormData(prev => ({
                      ...prev,
                      role,
                      permissions: role === 'super_admin' ? [] : prev.permissions,
                    }))
                  }}
                  className={`w-full ${theme.bg.input} border-2 rounded-lg px-4 py-2.5 ${theme.text.primary} focus:outline-none focus:ring-2 focus:ring-tiktok-primary focus:border-tiktok-primary font-sequel transition-colors ${
                    isDark ? 'border-white/20' : 'border-gray-300'
                  }`}
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
                <p className={`mt-1 text-xs font-sequel ${theme.text.muted}`}>
                  {formData.role === 'super_admin'
                    ? 'Super admins have all permissions automatically'
                    : 'Admins can have custom permissions'}
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Permissions */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className={`font-semibold font-sequel text-lg ${theme.text.primary}`}>
                  Permissions
                </h3>
                <p className={`text-sm font-sequel ${theme.text.muted}`}>
                  {formData.permissions.length} selected
                </p>
              </div>

              {formData.role === 'super_admin' ? (
                <div className={`p-4 rounded-lg border ${
                  isDark ? 'bg-purple-500/10 border-purple-500/30' : 'bg-purple-50 border-purple-200'
                }`}>
                  <p className={`text-sm font-sequel ${
                    isDark ? 'text-purple-300' : 'text-purple-700'
                  }`}>
                    Super admins have all permissions automatically. No need to select permissions.
                  </p>
                </div>
              ) : (
                <div className={`p-4 rounded-lg border ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                }`}>
                  <p className={`text-sm font-sequel mb-4 ${theme.text.secondary}`}>
                    Leave empty to assign default permissions, or select specific permissions below.
                  </p>

                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {Object.entries(permissionGroups).map(([module, permissions]) => {
                      const allSelected = permissions.every(p => formData.permissions.includes(p))
                      const someSelected = permissions.some(p => formData.permissions.includes(p))

                      return (
                        <div key={module} className={`p-4 rounded-lg border ${
                          isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
                        }`}>
                          <div className="flex items-center justify-between mb-3">
                            <label className={`text-sm font-semibold font-sequel ${theme.text.primary}`}>
                              {module.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </label>
                            <button
                              type="button"
                              onClick={() => toggleModulePermissions(permissions)}
                              className={`text-xs font-sequel px-3 py-1 rounded-lg transition-colors ${
                                allSelected
                                  ? 'bg-tiktok-primary text-white'
                                  : isDark
                                  ? 'text-tiktok-primary hover:bg-tiktok-primary/10'
                                  : 'text-tiktok-primary hover:bg-tiktok-primary/10'
                              }`}
                            >
                              {allSelected ? 'Deselect All' : 'Select All'}
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {permissions.map((permission) => {
                              const isSelected = formData.permissions.includes(permission)
                              return (
                                <label
                                  key={permission}
                                  className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${
                                    isSelected
                                      ? isDark
                                        ? 'bg-tiktok-primary/20 border-2 border-tiktok-primary'
                                        : 'bg-tiktok-primary/10 border-2 border-tiktok-primary'
                                      : isDark
                                      ? 'hover:bg-white/5 border-2 border-transparent'
                                      : 'hover:bg-gray-50 border-2 border-transparent'
                                  }`}
                                >
                                  <div className={`relative flex items-center justify-center w-5 h-5 rounded border-2 transition-colors ${
                                    isSelected
                                      ? 'bg-tiktok-primary border-tiktok-primary'
                                      : isDark
                                      ? 'border-white/30 bg-transparent'
                                      : 'border-gray-300 bg-transparent'
                                  }`}>
                                    {isSelected && (
                                      <Check size={14} weight="bold" className="text-white" />
                                    )}
                                  </div>
                                  <span className={`text-sm font-sequel flex-1 ${
                                    isSelected ? theme.text.primary : theme.text.secondary
                                  }`}>
                                    {permission.split(':')[1] || permission}
                                  </span>
                                </label>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            {step === 1 ? (
              <div className="w-full flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-tiktok-primary hover:bg-tiktok-primary/90 text-white font-sequel transition-colors"
                >
                  <span>Next</span>
                  <ArrowRight size={18} weight="regular" />
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleBack}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-sequel transition-colors ${
                    isDark
                      ? 'bg-white/5 hover:bg-white/10 text-white/80'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  <ArrowLeft size={18} weight="regular" />
                  <span>Back</span>
                </button>
                <div className="flex items-center space-x-3">
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
                    {isLoading ? 'Creating...' : 'Create Admin'}
                  </button>
                </div>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
