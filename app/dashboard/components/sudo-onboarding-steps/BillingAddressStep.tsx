'use client'

import { useState } from 'react'
import { MapPin } from '@phosphor-icons/react'

interface BillingAddressStepProps {
  theme: 'light' | 'dark'
  initialData?: {
    line1?: string
    line2?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
  onNext: (data: {
    line1: string
    line2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }) => void
  onBack: () => void
}

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
  'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
]

export function BillingAddressStep({ theme, initialData, onNext, onBack }: BillingAddressStepProps) {
  const isDark = theme === 'dark'
  const [formData, setFormData] = useState({
    line1: initialData?.line1 || '',
    line2: initialData?.line2 || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    postalCode: initialData?.postalCode || '',
    country: initialData?.country || 'NG',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.line1.trim()) {
      newErrors.line1 = 'Street address is required'
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required'
    }

    if (!formData.state) {
      newErrors.state = 'State is required'
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required'
    } else if (!/^\d{6}$/.test(formData.postalCode)) {
      newErrors.postalCode = 'Postal code must be 6 digits'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleNext = () => {
    if (validate()) {
      onNext({
        line1: formData.line1.trim(),
        line2: formData.line2.trim() || undefined,
        city: formData.city.trim(),
        state: formData.state,
        postalCode: formData.postalCode.trim(),
        country: formData.country,
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className={`font-monument font-bold text-xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Billing Address
        </h3>
        <p className={`text-sm font-sequel ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
          Please provide your billing address for card verification.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className={`block text-sm font-medium mb-2 font-sequel ${
            isDark ? 'text-white/80' : 'text-gray-700'
          }`}>
            Street Address <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <MapPin 
              size={20} 
              weight="regular" 
              className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                isDark ? 'text-white/60' : 'text-gray-600'
              }`} 
            />
            <input
              type="text"
              value={formData.line1}
              onChange={(e) => handleChange('line1', e.target.value)}
              placeholder="e.g., 123 Main Street"
              className={`w-full pl-12 pr-4 py-3 rounded-lg border font-sequel ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-tiktok-primary'
                  : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-tiktok-primary'
              } focus:outline-none ${errors.line1 ? (isDark ? 'border-red-500/50' : 'border-red-300') : ''}`}
            />
          </div>
          {errors.line1 && (
            <p className={`mt-1 text-sm font-sequel ${isDark ? 'text-red-400' : 'text-red-600'}`}>
              {errors.line1}
            </p>
          )}
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 font-sequel ${
            isDark ? 'text-white/80' : 'text-gray-700'
          }`}>
            Apartment, Suite, etc. (Optional)
          </label>
          <input
            type="text"
            value={formData.line2}
            onChange={(e) => handleChange('line2', e.target.value)}
            placeholder="e.g., Apt 4B"
            className={`w-full px-4 py-3 rounded-lg border font-sequel ${
              isDark
                ? 'bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-tiktok-primary'
                : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-tiktok-primary'
            } focus:outline-none`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 font-sequel ${
              isDark ? 'text-white/80' : 'text-gray-700'
            }`}>
              City <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="City"
              className={`w-full px-4 py-3 rounded-lg border font-sequel ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-tiktok-primary'
                  : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-tiktok-primary'
              } focus:outline-none ${errors.city ? (isDark ? 'border-red-500/50' : 'border-red-300') : ''}`}
            />
            {errors.city && (
              <p className={`mt-1 text-xs font-sequel ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                {errors.city}
              </p>
            )}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 font-sequel ${
              isDark ? 'text-white/80' : 'text-gray-700'
            }`}>
              State <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border font-sequel ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-tiktok-primary'
                  : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-tiktok-primary'
              } focus:outline-none ${errors.state ? (isDark ? 'border-red-500/50' : 'border-red-300') : ''}`}
            >
              <option value="">Select State</option>
              {NIGERIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            {errors.state && (
              <p className={`mt-1 text-xs font-sequel ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                {errors.state}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 font-sequel ${
            isDark ? 'text-white/80' : 'text-gray-700'
          }`}>
            Postal Code <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.postalCode}
            onChange={(e) => handleChange('postalCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            maxLength={6}
            className={`w-full px-4 py-3 rounded-lg border font-sequel ${
              isDark
                ? 'bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-tiktok-primary'
                : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-tiktok-primary'
            } focus:outline-none ${errors.postalCode ? (isDark ? 'border-red-500/50' : 'border-red-300') : ''}`}
          />
          {errors.postalCode && (
            <p className={`mt-1 text-sm font-sequel ${isDark ? 'text-red-400' : 'text-red-600'}`}>
              {errors.postalCode}
            </p>
          )}
          <p className={`mt-1 text-xs font-sequel ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
            6-digit postal code
          </p>
        </div>
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

