'use client'

import { useState } from 'react'
import { X, IdentificationCard, ShieldCheck } from '@phosphor-icons/react'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'

interface IdentityVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  theme: 'light' | 'dark'
  requiredType?: 'BVN' | 'NIN' | 'BOTH'
}

export function IdentityVerificationModal({
  isOpen,
  onClose,
  onSuccess,
  theme,
  requiredType = 'BOTH'
}: IdentityVerificationModalProps) {
  const isDark = theme === 'dark'
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [identityType, setIdentityType] = useState<'BVN' | 'NIN'>('BVN')
  const [identityNumber, setIdentityNumber] = useState('')
  const [dob, setDob] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!isOpen) return null

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!identityNumber.trim()) {
      newErrors.identityNumber = `Please enter your ${identityType}`
    } else if (identityType === 'BVN' && identityNumber.length !== 11) {
      newErrors.identityNumber = 'BVN must be 11 digits'
    } else if (identityType === 'NIN' && identityNumber.length !== 11) {
      newErrors.identityNumber = 'NIN must be 11 digits'
    } else if (!/^\d+$/.test(identityNumber)) {
      newErrors.identityNumber = `${identityType} must contain only numbers`
    }

    if (!dob.trim()) {
      newErrors.dob = 'Please enter your date of birth'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsLoading(true)

    try {
      const response = await api.user.verifyIdentity({
        identityType,
        identityNumber,
        dob
      })

      if (response.success) {
        toast.success('Identity verified successfully!')
        onSuccess()
        onClose()
        // Reset form
        setIdentityNumber('')
        setDob('')
        setErrors({})
      } else {
        toast.error(response.message || 'Verification failed')
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message)
      } else {
        toast.error('Failed to verify identity. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getTitle = () => {
    if (requiredType === 'BVN') return 'Verify Your BVN'
    if (requiredType === 'NIN') return 'Verify Your NIN'
    return 'Verify Your Identity'
  }

  const getDescription = () => {
    if (requiredType === 'BVN') {
      return 'Provide your Bank Verification Number to continue with onboarding.'
    }
    if (requiredType === 'NIN') {
      return 'Provide your National Identification Number to continue with onboarding.'
    }
    return 'Choose and provide either your BVN or NIN to continue with onboarding.'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border shadow-xl ${
        isDark 
          ? 'bg-black border-white/20' 
          : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <ShieldCheck size={20} weight="regular" className="text-blue-500" />
            </div>
            <div>
              <h3 className={`font-monument font-bold text-lg ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {getTitle()}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`${isDark ? 'text-white/80 hover:text-white' : 'text-gray-700 hover:text-gray-900'}`}
          >
            <X size={24} weight="regular" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className={`text-sm font-sequel ${
            isDark ? 'text-white/70' : 'text-gray-600'
          }`}>
            {getDescription()}
          </p>

          {/* Identity Type Selection */}
          {requiredType === 'BOTH' && (
            <div>
              <label className={`block text-sm font-semibold font-sequel mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Verification Type *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIdentityType('BVN')
                    setIdentityNumber('')
                    setErrors({})
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    identityType === 'BVN'
                      ? 'border-blue-500 bg-blue-500/10'
                      : isDark
                      ? 'border-white/10 hover:border-white/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <IdentificationCard 
                    size={24} 
                    weight="regular" 
                    className={identityType === 'BVN' ? 'text-blue-500' : isDark ? 'text-white/60' : 'text-gray-600'} 
                  />
                  <p className={`font-sequel font-semibold text-sm mt-2 ${
                    identityType === 'BVN' 
                      ? 'text-blue-500' 
                      : isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    BVN
                  </p>
                  <p className={`font-sequel text-xs mt-1 ${
                    isDark ? 'text-white/50' : 'text-gray-500'
                  }`}>
                    Bank Verification
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIdentityType('NIN')
                    setIdentityNumber('')
                    setErrors({})
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    identityType === 'NIN'
                      ? 'border-blue-500 bg-blue-500/10'
                      : isDark
                      ? 'border-white/10 hover:border-white/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <IdentificationCard 
                    size={24} 
                    weight="regular" 
                    className={identityType === 'NIN' ? 'text-blue-500' : isDark ? 'text-white/60' : 'text-gray-600'} 
                  />
                  <p className={`font-sequel font-semibold text-sm mt-2 ${
                    identityType === 'NIN' 
                      ? 'text-blue-500' 
                      : isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    NIN
                  </p>
                  <p className={`font-sequel text-xs mt-1 ${
                    isDark ? 'text-white/50' : 'text-gray-500'
                  }`}>
                    National ID
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Identity Number */}
          <div>
            <label className={`block text-sm font-semibold font-sequel mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {identityType} Number *
            </label>
            <input
              type="text"
              value={identityNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 11)
                setIdentityNumber(value)
                setErrors(prev => ({ ...prev, identityNumber: '' }))
              }}
              placeholder={`Enter your ${identityType} (11 digits)`}
              className={`w-full ${
                isDark ? 'bg-white/5' : 'bg-white'
              } border-2 rounded-lg px-4 py-3 ${
                isDark ? 'text-white' : 'text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-sequel transition-colors ${
                errors.identityNumber 
                  ? 'border-red-500' 
                  : isDark 
                  ? 'border-white/20' 
                  : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {errors.identityNumber && (
              <p className="mt-1 text-sm text-red-400 font-sequel">{errors.identityNumber}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label className={`block text-sm font-semibold font-sequel mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Date of Birth *
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => {
                setDob(e.target.value)
                setErrors(prev => ({ ...prev, dob: '' }))
              }}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full ${
                isDark ? 'bg-white/5' : 'bg-white'
              } border-2 rounded-lg px-4 py-3 ${
                isDark ? 'text-white' : 'text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-sequel transition-colors ${
                errors.dob 
                  ? 'border-red-500' 
                  : isDark 
                  ? 'border-white/20' 
                  : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {errors.dob && (
              <p className="mt-1 text-sm text-red-400 font-sequel">{errors.dob}</p>
            )}
          </div>

          {/* Info Box */}
          <div className={`p-3 rounded-lg ${
            isDark ? 'bg-blue-500/10' : 'bg-blue-50'
          }`}>
            <p className={`text-xs font-sequel ${
              isDark ? 'text-white/70' : 'text-gray-600'
            }`}>
              <strong>Note:</strong> Your information is securely encrypted and used only for identity verification purposes. This does not create a card or charge any fees.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold font-sequel transition-colors ${
                isDark
                  ? 'bg-white/10 text-white hover:bg-white/20'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-sequel flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={18} weight="regular" />
                  <span>Verify Identity</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
