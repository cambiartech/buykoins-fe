'use client'

import { useState } from 'react'
import { ShieldCheck } from '@phosphor-icons/react'

interface IdentityVerificationStepProps {
  theme: 'light' | 'dark'
  initialData?: {
    identityType?: 'BVN' | 'NIN'
    identityNumber?: string
  }
  onNext: (data: { identityType: 'BVN' | 'NIN'; identityNumber: string }) => void
  onBack: () => void
}

export function IdentityVerificationStep({ theme, initialData, onNext, onBack }: IdentityVerificationStepProps) {
  const isDark = theme === 'dark'
  const [identityType, setIdentityType] = useState<'BVN' | 'NIN' | ''>(initialData?.identityType || '')
  const [identityNumber, setIdentityNumber] = useState(initialData?.identityNumber || '')
  const [error, setError] = useState<string | null>(null)

  const validate = () => {
    if (!identityType) {
      setError('Please select an identity type')
      return false
    }

    if (!identityNumber.trim()) {
      setError(`${identityType} number is required`)
      return false
    }

    // Both BVN and NIN are 11 digits
    if (!/^\d{11}$/.test(identityNumber)) {
      setError(`${identityType} must be exactly 11 digits`)
      return false
    }

    setError(null)
    return true
  }

  const handleNumberChange = (value: string) => {
    // Only allow digits, max 11
    const digitsOnly = value.replace(/\D/g, '').slice(0, 11)
    setIdentityNumber(digitsOnly)
    setError(null)
  }

  const handleNext = () => {
    if (validate()) {
      onNext({
        identityType: identityType as 'BVN' | 'NIN',
        identityNumber: identityNumber.trim(),
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className={`font-monument font-bold text-xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Identity Verification
        </h3>
        <p className={`text-sm font-sequel ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
          Please verify your identity using either your BVN or NIN.
        </p>
      </div>

      <div className={`p-4 rounded-lg border ${
        isDark ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'
      }`}>
        <p className={`text-xs font-sequel ${isDark ? 'text-blue-300/80' : 'text-blue-700'}`}>
          <strong>Why we need this:</strong> This information is required by our card provider
          for compliance and security purposes. Your data is encrypted and secure.
        </p>
      </div>

      <div>
        <label className={`block text-sm font-medium mb-3 font-sequel ${
          isDark ? 'text-white/80' : 'text-gray-700'
        }`}>
          Select Identity Type <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              setIdentityType('BVN')
              setError(null)
            }}
            className={`p-4 rounded-lg border-2 transition-all font-sequel ${
              identityType === 'BVN'
                ? isDark
                  ? 'bg-tiktok-primary/20 border-tiktok-primary text-tiktok-primary'
                  : 'bg-tiktok-primary/10 border-tiktok-primary text-tiktok-primary'
                : isDark
                ? 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-2">
              <ShieldCheck size={20} weight="regular" />
              <span className="font-semibold">BVN</span>
            </div>
            <p className={`text-xs mt-1 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
              Bank Verification Number
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              setIdentityType('NIN')
              setError(null)
            }}
            className={`p-4 rounded-lg border-2 transition-all font-sequel ${
              identityType === 'NIN'
                ? isDark
                  ? 'bg-tiktok-primary/20 border-tiktok-primary text-tiktok-primary'
                  : 'bg-tiktok-primary/10 border-tiktok-primary text-tiktok-primary'
                : isDark
                ? 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-2">
              <ShieldCheck size={20} weight="regular" />
              <span className="font-semibold">NIN</span>
            </div>
            <p className={`text-xs mt-1 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
              National Identification Number
            </p>
          </button>
        </div>
      </div>

      {identityType && (
        <div>
          <label className={`block text-sm font-medium mb-2 font-sequel ${
            isDark ? 'text-white/80' : 'text-gray-700'
          }`}>
            {identityType} Number <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <ShieldCheck 
              size={20} 
              weight="regular" 
              className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                isDark ? 'text-white/60' : 'text-gray-600'
              }`} 
            />
            <input
              type="text"
              value={identityNumber}
              onChange={(e) => handleNumberChange(e.target.value)}
              placeholder={`Enter your ${identityType} (11 digits)`}
              maxLength={11}
              className={`w-full pl-12 pr-4 py-3 rounded-lg border font-sequel ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-blue-600'
                  : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-600'
              } focus:outline-none ${error ? (isDark ? 'border-red-500/50' : 'border-red-300') : ''}`}
            />
          </div>
          {error && (
            <p className={`mt-2 text-sm font-sequel ${isDark ? 'text-red-400' : 'text-red-600'}`}>
              {error}
            </p>
          )}
          <p className={`mt-2 text-xs font-sequel ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
            Enter your {identityType} number (11 digits)
          </p>
        </div>
      )}

      <div className="flex items-center space-x-3 pt-4">
        <button
          onClick={onBack}
          className={`flex-1 px-4 py-3 rounded-lg border font-sequel transition-colors ${
            isDark
              ? 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
          }`}
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!identityType || !identityNumber}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-sequel disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  )
}

