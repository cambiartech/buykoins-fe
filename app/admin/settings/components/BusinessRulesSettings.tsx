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
    requireBvnForOnboarding: false,
    requireNinForOnboarding: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [savingBvn, setSavingBvn] = useState(false)
  const [savingNin, setSavingNin] = useState(false)

  useEffect(() => {
    if (settings) {
      setFormData({
        minCreditRequestAmount: settings.minCreditRequestAmount || null,
        maxCreditRequestAmount: settings.maxCreditRequestAmount || null,
        creditRequestCooldownHours: settings.creditRequestCooldownHours || 24,
        payoutRequestCooldownHours: settings.payoutRequestCooldownHours || 24,
        maxActiveCreditRequests: settings.maxActiveCreditRequests || 1,
        maxActivePayoutRequests: settings.maxActivePayoutRequests || 1,
        requireBvnForOnboarding: settings.requireBvnForOnboarding || false,
        requireNinForOnboarding: settings.requireNinForOnboarding || false,
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

  const handleBvnToggle = async () => {
    const newValue = !formData.requireBvnForOnboarding
    setSavingBvn(true)
    setFormData(prev => ({ ...prev, requireBvnForOnboarding: newValue }))
    
    try {
      await onSave({
        requireBvnForOnboarding: newValue,
      })
    } catch (error) {
      // Revert on error
      setFormData(prev => ({ ...prev, requireBvnForOnboarding: !newValue }))
    } finally {
      setSavingBvn(false)
    }
  }

  const handleNinToggle = async () => {
    const newValue = !formData.requireNinForOnboarding
    setSavingNin(true)
    setFormData(prev => ({ ...prev, requireNinForOnboarding: newValue }))
    
    try {
      await onSave({
        requireNinForOnboarding: newValue,
      })
    } catch (error) {
      // Revert on error
      setFormData(prev => ({ ...prev, requireNinForOnboarding: !newValue }))
    } finally {
      setSavingNin(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSave({
        ...formData,
        minCreditRequestAmount: formData.minCreditRequestAmount || null,
        maxCreditRequestAmount: formData.maxCreditRequestAmount || null,
        requireBvnForOnboarding: formData.requireBvnForOnboarding,
        requireNinForOnboarding: formData.requireNinForOnboarding,
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

      {/* Onboarding Verification Requirements */}
      <div>
        <h4 className={`font-semibold font-sequel text-base mb-4 ${theme.text.primary}`}>
          Onboarding Verification Requirements
        </h4>
        <p className={`text-sm font-sequel mb-4 ${theme.text.secondary}`}>
          Control whether users must provide identity verification before submitting onboarding requests. 
          Useful for preventing fake requests or during promotional periods.
        </p>
        <div className="space-y-3">
          {/* Require BVN */}
          <div className={`flex items-center justify-between p-4 rounded-lg border ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
          }`}>
            <div>
              <h5 className={`font-semibold font-sequel text-sm ${theme.text.primary}`}>
                Require BVN for Onboarding
              </h5>
              <p className={`text-xs font-sequel mt-0.5 ${theme.text.muted}`}>
                Users must provide their Bank Verification Number before requesting onboarding
              </p>
            </div>
            <button
              type="button"
              onClick={handleBvnToggle}
              disabled={savingBvn}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                savingBvn ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                formData.requireBvnForOnboarding ? 'bg-tiktok-primary' : isDark ? 'bg-gray-700' : 'bg-gray-300'
              }`}
            >
              {savingBvn ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              ) : (
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.requireBvnForOnboarding ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              )}
            </button>
          </div>

          {/* Require NIN */}
          <div className={`flex items-center justify-between p-4 rounded-lg border ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
          }`}>
            <div>
              <h5 className={`font-semibold font-sequel text-sm ${theme.text.primary}`}>
                Require NIN for Onboarding
              </h5>
              <p className={`text-xs font-sequel mt-0.5 ${theme.text.muted}`}>
                Users must provide their National Identification Number before requesting onboarding
              </p>
            </div>
            <button
              type="button"
              onClick={handleNinToggle}
              disabled={savingNin}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                savingNin ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                formData.requireNinForOnboarding ? 'bg-tiktok-primary' : isDark ? 'bg-gray-700' : 'bg-gray-300'
              }`}
            >
              {savingNin ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              ) : (
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.requireNinForOnboarding ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              )}
            </button>
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

