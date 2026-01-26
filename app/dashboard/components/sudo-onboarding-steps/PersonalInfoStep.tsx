'use client'

import { useState } from 'react'
import { Calendar } from '@phosphor-icons/react'

interface PersonalInfoStepProps {
  theme: 'light' | 'dark'
  initialData?: { dob?: string }
  onNext: (data: { dob: string }) => void
  onBack: () => void
}

export function PersonalInfoStep({ theme, initialData, onNext, onBack }: PersonalInfoStepProps) {
  const isDark = theme === 'dark'
  const [dob, setDob] = useState(initialData?.dob || '')
  const [error, setError] = useState<string | null>(null)

  const validate = () => {
    if (!dob) {
      setError('Date of birth is required')
      return false
    }

    const birthDate = new Date(dob)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      const actualAge = age - 1
      if (actualAge < 18) {
        setError('You must be at least 18 years old')
        return false
      }
    } else if (age < 18) {
      setError('You must be at least 18 years old')
      return false
    }

    if (birthDate > today) {
      setError('Date of birth cannot be in the future')
      return false
    }

    setError(null)
    return true
  }

  const handleNext = () => {
    if (validate()) {
      onNext({ dob })
    }
  }

  // Calculate max date (18 years ago)
  const today = new Date()
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
  const maxDateString = maxDate.toISOString().split('T')[0]

  // Calculate min date (reasonable limit, e.g., 100 years ago)
  const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate())
  const minDateString = minDate.toISOString().split('T')[0]

  return (
    <div className="space-y-6">
      <div>
        <h3 className={`font-monument font-bold text-xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Personal Information
        </h3>
        <p className={`text-sm font-sequel ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
          Please provide your date of birth for identity verification.
        </p>
      </div>

      <div>
        <label className={`block text-sm font-medium mb-2 font-sequel ${
          isDark ? 'text-white/80' : 'text-gray-700'
        }`}>
          Date of Birth
        </label>
        <div className="relative">
          <Calendar 
            size={20} 
            weight="regular" 
            className={`absolute left-4 top-1/2 -translate-y-1/2 ${
              isDark ? 'text-white/60' : 'text-gray-600'
            }`} 
          />
          <input
            type="date"
            value={dob}
            onChange={(e) => {
              setDob(e.target.value)
              setError(null)
            }}
            min={minDateString}
            max={maxDateString}
            className={`w-full pl-12 pr-4 py-3 rounded-lg border font-sequel ${
              isDark
                ? 'bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-tiktok-primary'
                : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-tiktok-primary'
            } focus:outline-none ${error ? (isDark ? 'border-red-500/50' : 'border-red-300') : ''}`}
          />
        </div>
        {error && (
          <p className={`mt-2 text-sm font-sequel ${isDark ? 'text-red-400' : 'text-red-600'}`}>
            {error}
          </p>
        )}
        <p className={`mt-2 text-xs font-sequel ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
          You must be at least 18 years old to create a card.
        </p>
      </div>

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
          className="flex-1 px-4 py-3 bg-tiktok-primary text-white rounded-lg hover:bg-tiktok-primary/90 transition-colors font-sequel"
        >
          Continue
        </button>
      </div>
    </div>
  )
}

