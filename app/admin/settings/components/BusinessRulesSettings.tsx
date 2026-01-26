'use client'

import { useState, useEffect } from 'react'
import { Scales, FloppyDisk } from '@phosphor-icons/react'
import { useAdminTheme } from '../../hooks/useTheme'
import { getThemeClasses } from '../../utils/theme'

interface BusinessRulesSettingsProps {
  settings?: any
  onSave: (data: any) => void
  isSaving: boolean
}

export function BusinessRulesSettings({ settings, onSave, isSaving }: BusinessRulesSettingsProps) {
  const isDark = useAdminTheme()
  const theme = getThemeClasses(isDark)

  const [formData, setFormData] = useState({
    minCreditRequestAmount: null as number | null,
    maxCreditRequestAmount: null as number | null,
    creditRequestCooldownHours: 24,
    payoutRequestCooldownHours: 24,
    maxActiveCreditRequests: 1,
    maxActivePayoutRequests: 1,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (settings) {
      setFormData({
        minCreditRequestAmount: settings.minCreditRequestAmount || null,
        maxCreditRequestAmount: settings.maxCreditRequestAmount || null,
        creditRequestCooldownHours: settings.creditRequestCooldownHours || 24,
        payoutRequestCooldownHours: settings.payoutRequestCooldownHours || 24,
        maxActiveCreditRequests: settings.maxActiveCreditRequests || 1,
        maxActivePayoutRequests: settings.maxActivePayoutRequests || 1,
      })
    }
  }, [settings])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (formData.minCreditRequestAmount !== null && formData.minCreditRequestAmount < 0) {
      newErrors.minCreditRequestAmount = 'Minimum amount cannot be negative'
    }

    if (formData.maxCreditRequestAmount !== null) {
      if (formData.maxCreditRequestAmount < 0) {
        newErrors.maxCreditRequestAmount = 'Maximum amount cannot be negative'
      } else if (formData.minCreditRequestAmount !== null && formData.maxCreditRequestAmount <= formData.minCreditRequestAmount) {
        newErrors.maxCreditRequestAmount = 'Maximum amount must be greater than minimum amount'
      }
    }

    if (formData.creditRequestCooldownHours < 0) {
      newErrors.creditRequestCooldownHours = 'Cooldown cannot be negative'
    }

    if (formData.payoutRequestCooldownHours < 0) {
      newErrors.payoutRequestCooldownHours = 'Cooldown cannot be negative'
    }

    if (formData.maxActiveCreditRequests < 1) {
      newErrors.maxActiveCreditRequests = 'Must allow at least 1 active request'
    }

    if (formData.maxActivePayoutRequests < 1) {
      newErrors.maxActivePayoutRequests = 'Must allow at least 1 active request'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSave({
        ...formData,
        minCreditRequestAmount: formData.minCreditRequestAmount || null,
        maxCreditRequestAmount: formData.maxCreditRequestAmount || null,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-tiktok-primary/20 rounded-lg flex items-center justify-center">
          <Scales size={24} weight="regular" className="text-tiktok-primary" />
        </div>
        <div>
          <h3 className={`font-monument font-bold text-lg ${theme.text.primary}`}>
            Business Rules Settings
          </h3>
          <p className={`text-sm font-sequel ${theme.text.secondary}`}>
            Configure business logic, limits, and cooldowns
          </p>
        </div>
      </div>

      {/* Credit Request Limits */}
      <div>
        <h4 className={`font-semibold font-sequel text-base mb-4 ${theme.text.primary}`}>
          Credit Request Limits
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-semibold font-sequel mb-2 ${theme.text.secondary}`}>
              Minimum Credit Request (USD) <span className="text-xs font-normal">(optional)</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.minCreditRequestAmount || ''}
              onChange={(e) => {
                const value = e.target.value === '' ? null : parseFloat(e.target.value) || 0
                setFormData(prev => ({ ...prev, minCreditRequestAmount: value }))
                setErrors(prev => ({ ...prev, minCreditRequestAmount: '', maxCreditRequestAmount: '' }))
              }}
              placeholder="No minimum"
              className={`w-full ${theme.bg.input} border-2 rounded-lg px-4 py-2.5 ${theme.text.primary} focus:outline-none focus:ring-2 focus:ring-tiktok-primary focus:border-tiktok-primary font-sequel transition-colors ${
                errors.minCreditRequestAmount 
                  ? 'border-red-500' 
                  : isDark 
                  ? 'border-white/20' 
                  : 'border-gray-300'
              }`}
            />
            {errors.minCreditRequestAmount && (
              <p className="mt-1 text-sm text-red-400 font-sequel">{errors.minCreditRequestAmount}</p>
            )}
          </div>

          <div>
            <label className={`block text-sm font-semibold font-sequel mb-2 ${theme.text.secondary}`}>
              Maximum Credit Request (USD) <span className="text-xs font-normal">(optional)</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.maxCreditRequestAmount || ''}
              onChange={(e) => {
                const value = e.target.value === '' ? null : parseFloat(e.target.value) || 0
                setFormData(prev => ({ ...prev, maxCreditRequestAmount: value }))
                setErrors(prev => ({ ...prev, maxCreditRequestAmount: '' }))
              }}
              placeholder="No maximum"
              className={`w-full ${theme.bg.input} border-2 rounded-lg px-4 py-2.5 ${theme.text.primary} focus:outline-none focus:ring-2 focus:ring-tiktok-primary focus:border-tiktok-primary font-sequel transition-colors ${
                errors.maxCreditRequestAmount 
                  ? 'border-red-500' 
                  : isDark 
                  ? 'border-white/20' 
                  : 'border-gray-300'
              }`}
            />
            {errors.maxCreditRequestAmount && (
              <p className="mt-1 text-sm text-red-400 font-sequel">{errors.maxCreditRequestAmount}</p>
            )}
          </div>
        </div>
      </div>

      {/* Cooldown Periods */}
      <div>
        <h4 className={`font-semibold font-sequel text-base mb-4 ${theme.text.primary}`}>
          Cooldown Periods
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-semibold font-sequel mb-2 ${theme.text.secondary}`}>
              Credit Request Cooldown (Hours) *
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={formData.creditRequestCooldownHours}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, creditRequestCooldownHours: parseInt(e.target.value) || 0 }))
                setErrors(prev => ({ ...prev, creditRequestCooldownHours: '' }))
              }}
              className={`w-full ${theme.bg.input} border-2 rounded-lg px-4 py-2.5 ${theme.text.primary} focus:outline-none focus:ring-2 focus:ring-tiktok-primary focus:border-tiktok-primary font-sequel transition-colors ${
                errors.creditRequestCooldownHours 
                  ? 'border-red-500' 
                  : isDark 
                  ? 'border-white/20' 
                  : 'border-gray-300'
              }`}
            />
            {errors.creditRequestCooldownHours && (
              <p className="mt-1 text-sm text-red-400 font-sequel">{errors.creditRequestCooldownHours}</p>
            )}
          </div>

          <div>
            <label className={`block text-sm font-semibold font-sequel mb-2 ${theme.text.secondary}`}>
              Payout Request Cooldown (Hours) *
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={formData.payoutRequestCooldownHours}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, payoutRequestCooldownHours: parseInt(e.target.value) || 0 }))
                setErrors(prev => ({ ...prev, payoutRequestCooldownHours: '' }))
              }}
              className={`w-full ${theme.bg.input} border-2 rounded-lg px-4 py-2.5 ${theme.text.primary} focus:outline-none focus:ring-2 focus:ring-tiktok-primary focus:border-tiktok-primary font-sequel transition-colors ${
                errors.payoutRequestCooldownHours 
                  ? 'border-red-500' 
                  : isDark 
                  ? 'border-white/20' 
                  : 'border-gray-300'
              }`}
            />
            {errors.payoutRequestCooldownHours && (
              <p className="mt-1 text-sm text-red-400 font-sequel">{errors.payoutRequestCooldownHours}</p>
            )}
          </div>
        </div>
      </div>

      {/* Max Active Requests */}
      <div>
        <h4 className={`font-semibold font-sequel text-base mb-4 ${theme.text.primary}`}>
          Maximum Active Requests
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-semibold font-sequel mb-2 ${theme.text.secondary}`}>
              Max Active Credit Requests *
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={formData.maxActiveCreditRequests}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, maxActiveCreditRequests: parseInt(e.target.value) || 1 }))
                setErrors(prev => ({ ...prev, maxActiveCreditRequests: '' }))
              }}
              className={`w-full ${theme.bg.input} border-2 rounded-lg px-4 py-2.5 ${theme.text.primary} focus:outline-none focus:ring-2 focus:ring-tiktok-primary focus:border-tiktok-primary font-sequel transition-colors ${
                errors.maxActiveCreditRequests 
                  ? 'border-red-500' 
                  : isDark 
                  ? 'border-white/20' 
                  : 'border-gray-300'
              }`}
            />
            {errors.maxActiveCreditRequests && (
              <p className="mt-1 text-sm text-red-400 font-sequel">{errors.maxActiveCreditRequests}</p>
            )}
          </div>

          <div>
            <label className={`block text-sm font-semibold font-sequel mb-2 ${theme.text.secondary}`}>
              Max Active Payout Requests *
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={formData.maxActivePayoutRequests}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, maxActivePayoutRequests: parseInt(e.target.value) || 1 }))
                setErrors(prev => ({ ...prev, maxActivePayoutRequests: '' }))
              }}
              className={`w-full ${theme.bg.input} border-2 rounded-lg px-4 py-2.5 ${theme.text.primary} focus:outline-none focus:ring-2 focus:ring-tiktok-primary focus:border-tiktok-primary font-sequel transition-colors ${
                errors.maxActivePayoutRequests 
                  ? 'border-red-500' 
                  : isDark 
                  ? 'border-white/20' 
                  : 'border-gray-300'
              }`}
            />
            {errors.maxActivePayoutRequests && (
              <p className="mt-1 text-sm text-red-400 font-sequel">{errors.maxActivePayoutRequests}</p>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-white/10">
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center space-x-2 px-6 py-2.5 bg-tiktok-primary hover:bg-tiktok-primary/90 text-white rounded-lg font-sequel transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <FloppyDisk size={18} weight="regular" />
              <span>Save Business Rules</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}

