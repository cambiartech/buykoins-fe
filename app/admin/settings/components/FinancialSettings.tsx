'use client'

import { useState, useEffect } from 'react'
import { CurrencyDollar, FloppyDisk } from '@phosphor-icons/react'
import { useAdminTheme } from '../../hooks/useTheme'
import { getThemeClasses } from '../../utils/theme'

interface FinancialSettingsProps {
  settings?: any
  onSave: (data: any) => void
  isSaving: boolean
}

export function FinancialSettings({ settings, onSave, isSaving }: FinancialSettingsProps) {
  const isDark = useAdminTheme()
  const theme = getThemeClasses(isDark)

  const [formData, setFormData] = useState({
    exchangeRateUsdToNgn: 1500.00,
    processingFee: 50.00,
    processingFeeType: 'fixed' as 'fixed' | 'percentage',
    processingFeePercentage: null as number | null,
    minPayout: 1000.00,
    maxPayout: 1000000.00,
    dailyPayoutLimit: null as number | null,
    monthlyPayoutLimit: null as number | null,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (settings) {
      setFormData({
        exchangeRateUsdToNgn: settings.exchangeRateUsdToNgn || 1500.00,
        processingFee: settings.processingFee || 50.00,
        processingFeeType: settings.processingFeeType || 'fixed',
        processingFeePercentage: settings.processingFeePercentage || null,
        minPayout: settings.minPayout || 1000.00,
        maxPayout: settings.maxPayout || 1000000.00,
        dailyPayoutLimit: settings.dailyPayoutLimit || null,
        monthlyPayoutLimit: settings.monthlyPayoutLimit || null,
      })
    }
  }, [settings])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (formData.exchangeRateUsdToNgn <= 0) {
      newErrors.exchangeRateUsdToNgn = 'Exchange rate must be greater than 0'
    }

    if (formData.processingFee < 0) {
      newErrors.processingFee = 'Processing fee cannot be negative'
    }

    if (formData.processingFeeType === 'percentage' && (!formData.processingFeePercentage || formData.processingFeePercentage < 0 || formData.processingFeePercentage > 100)) {
      newErrors.processingFeePercentage = 'Percentage must be between 0 and 100'
    }

    if (formData.minPayout < 0) {
      newErrors.minPayout = 'Minimum payout cannot be negative'
    }

    if (formData.maxPayout <= formData.minPayout) {
      newErrors.maxPayout = 'Maximum payout must be greater than minimum payout'
    }

    if (formData.dailyPayoutLimit !== null && formData.dailyPayoutLimit < 0) {
      newErrors.dailyPayoutLimit = 'Daily limit cannot be negative'
    }

    if (formData.monthlyPayoutLimit !== null && formData.monthlyPayoutLimit < 0) {
      newErrors.monthlyPayoutLimit = 'Monthly limit cannot be negative'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSave(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-tiktok-primary/20 rounded-lg flex items-center justify-center">
          <CurrencyDollar size={24} weight="regular" className="text-tiktok-primary" />
        </div>
        <div>
          <h3 className={`font-monument font-bold text-lg ${theme.text.primary}`}>
            Financial Settings
          </h3>
          <p className={`text-sm font-sequel ${theme.text.secondary}`}>
            Configure exchange rates, processing fees, and payout limits
          </p>
        </div>
      </div>

      {/* Exchange Rate */}
      <div>
        <label className={`block text-sm font-semibold font-sequel mb-2 ${theme.text.secondary}`}>
          Exchange Rate (USD to NGN) *
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={formData.exchangeRateUsdToNgn}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, exchangeRateUsdToNgn: parseFloat(e.target.value) || 0 }))
            setErrors(prev => ({ ...prev, exchangeRateUsdToNgn: '' }))
          }}
          className={`w-full ${theme.bg.input} border-2 rounded-lg px-4 py-2.5 ${theme.text.primary} focus:outline-none focus:ring-2 focus:ring-tiktok-primary focus:border-tiktok-primary font-sequel transition-colors ${
            errors.exchangeRateUsdToNgn 
              ? 'border-red-500' 
              : isDark 
              ? 'border-white/20' 
              : 'border-gray-300'
          }`}
        />
        {errors.exchangeRateUsdToNgn && (
          <p className="mt-1 text-sm text-red-400 font-sequel">{errors.exchangeRateUsdToNgn}</p>
        )}
        {settings?.exchangeRateLastUpdated && (
          <p className={`mt-1 text-xs font-sequel ${theme.text.muted}`}>
            Last updated: {new Date(settings.exchangeRateLastUpdated).toLocaleString()}
          </p>
        )}
      </div>

      {/* Processing Fee Type */}
      <div>
        <label className={`block text-sm font-semibold font-sequel mb-2 ${theme.text.secondary}`}>
          Processing Fee Type
        </label>
        <select
          value={formData.processingFeeType}
          onChange={(e) => setFormData(prev => ({ ...prev, processingFeeType: e.target.value as 'fixed' | 'percentage' }))}
          className={`w-full ${theme.bg.input} border-2 rounded-lg px-4 py-2.5 ${theme.text.primary} focus:outline-none focus:ring-2 focus:ring-tiktok-primary focus:border-tiktok-primary font-sequel transition-colors ${
            isDark ? 'border-white/20' : 'border-gray-300'
          }`}
        >
          <option value="fixed">Fixed Amount</option>
          <option value="percentage">Percentage</option>
        </select>
      </div>

      {/* Processing Fee */}
      {formData.processingFeeType === 'fixed' ? (
        <div>
          <label className={`block text-sm font-semibold font-sequel mb-2 ${theme.text.secondary}`}>
            Processing Fee (NGN) *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.processingFee}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, processingFee: parseFloat(e.target.value) || 0 }))
              setErrors(prev => ({ ...prev, processingFee: '' }))
            }}
            className={`w-full ${theme.bg.input} border-2 rounded-lg px-4 py-2.5 ${theme.text.primary} focus:outline-none focus:ring-2 focus:ring-tiktok-primary focus:border-tiktok-primary font-sequel transition-colors ${
              errors.processingFee 
                ? 'border-red-500' 
                : isDark 
                ? 'border-white/20' 
                : 'border-gray-300'
            }`}
          />
          {errors.processingFee && (
            <p className="mt-1 text-sm text-red-400 font-sequel">{errors.processingFee}</p>
          )}
        </div>
      ) : (
        <div>
          <label className={`block text-sm font-semibold font-sequel mb-2 ${theme.text.secondary}`}>
            Processing Fee Percentage *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={formData.processingFeePercentage || ''}
            onChange={(e) => {
              const value = e.target.value === '' ? null : parseFloat(e.target.value) || 0
              setFormData(prev => ({ ...prev, processingFeePercentage: value }))
              setErrors(prev => ({ ...prev, processingFeePercentage: '' }))
            }}
            className={`w-full ${theme.bg.input} border-2 rounded-lg px-4 py-2.5 ${theme.text.primary} focus:outline-none focus:ring-2 focus:ring-tiktok-primary focus:border-tiktok-primary font-sequel transition-colors ${
              errors.processingFeePercentage 
                ? 'border-red-500' 
                : isDark 
                ? 'border-white/20' 
                : 'border-gray-300'
            }`}
          />
          {errors.processingFeePercentage && (
            <p className="mt-1 text-sm text-red-400 font-sequel">{errors.processingFeePercentage}</p>
          )}
        </div>
      )}

      {/* Payout Limits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-semibold font-sequel mb-2 ${theme.text.secondary}`}>
            Minimum Payout (NGN) *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.minPayout}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, minPayout: parseFloat(e.target.value) || 0 }))
              setErrors(prev => ({ ...prev, minPayout: '', maxPayout: '' }))
            }}
            className={`w-full ${theme.bg.input} border-2 rounded-lg px-4 py-2.5 ${theme.text.primary} focus:outline-none focus:ring-2 focus:ring-tiktok-primary focus:border-tiktok-primary font-sequel transition-colors ${
              errors.minPayout 
                ? 'border-red-500' 
                : isDark 
                ? 'border-white/20' 
                : 'border-gray-300'
            }`}
          />
          {errors.minPayout && (
            <p className="mt-1 text-sm text-red-400 font-sequel">{errors.minPayout}</p>
          )}
        </div>

        <div>
          <label className={`block text-sm font-semibold font-sequel mb-2 ${theme.text.secondary}`}>
            Maximum Payout (NGN) *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.maxPayout}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, maxPayout: parseFloat(e.target.value) || 0 }))
              setErrors(prev => ({ ...prev, maxPayout: '' }))
            }}
            className={`w-full ${theme.bg.input} border-2 rounded-lg px-4 py-2.5 ${theme.text.primary} focus:outline-none focus:ring-2 focus:ring-tiktok-primary focus:border-tiktok-primary font-sequel transition-colors ${
              errors.maxPayout 
                ? 'border-red-500' 
                : isDark 
                ? 'border-white/20' 
                : 'border-gray-300'
            }`}
          />
          {errors.maxPayout && (
            <p className="mt-1 text-sm text-red-400 font-sequel">{errors.maxPayout}</p>
          )}
        </div>
      </div>

      {/* Daily/Monthly Limits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-semibold font-sequel mb-2 ${theme.text.secondary}`}>
            Daily Payout Limit (NGN) <span className="text-xs font-normal">(optional)</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.dailyPayoutLimit || ''}
            onChange={(e) => {
              const value = e.target.value === '' ? null : parseFloat(e.target.value) || 0
              setFormData(prev => ({ ...prev, dailyPayoutLimit: value }))
              setErrors(prev => ({ ...prev, dailyPayoutLimit: '' }))
            }}
            placeholder="No limit"
            className={`w-full ${theme.bg.input} border-2 rounded-lg px-4 py-2.5 ${theme.text.primary} focus:outline-none focus:ring-2 focus:ring-tiktok-primary focus:border-tiktok-primary font-sequel transition-colors ${
              errors.dailyPayoutLimit 
                ? 'border-red-500' 
                : isDark 
                ? 'border-white/20' 
                : 'border-gray-300'
            }`}
          />
          {errors.dailyPayoutLimit && (
            <p className="mt-1 text-sm text-red-400 font-sequel">{errors.dailyPayoutLimit}</p>
          )}
        </div>

        <div>
          <label className={`block text-sm font-semibold font-sequel mb-2 ${theme.text.secondary}`}>
            Monthly Payout Limit (NGN) <span className="text-xs font-normal">(optional)</span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.monthlyPayoutLimit || ''}
            onChange={(e) => {
              const value = e.target.value === '' ? null : parseFloat(e.target.value) || 0
              setFormData(prev => ({ ...prev, monthlyPayoutLimit: value }))
              setErrors(prev => ({ ...prev, monthlyPayoutLimit: '' }))
            }}
            placeholder="No limit"
            className={`w-full ${theme.bg.input} border-2 rounded-lg px-4 py-2.5 ${theme.text.primary} focus:outline-none focus:ring-2 focus:ring-tiktok-primary focus:border-tiktok-primary font-sequel transition-colors ${
              errors.monthlyPayoutLimit 
                ? 'border-red-500' 
                : isDark 
                ? 'border-white/20' 
                : 'border-gray-300'
            }`}
          />
          {errors.monthlyPayoutLimit && (
            <p className="mt-1 text-sm text-red-400 font-sequel">{errors.monthlyPayoutLimit}</p>
          )}
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
              <span>Save Financial Settings</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}

