'use client'

import { useState, useEffect } from 'react'
import { Bank, FloppyDisk } from '@phosphor-icons/react'
import { useAdminTheme } from '../../hooks/useTheme'
import { getThemeClasses } from '../../utils/theme'

interface PaymentSettingsProps {
  settings?: any
  onSave: (data: any) => void
  isSaving: boolean
}

export function PaymentSettings({ settings, onSave, isSaving }: PaymentSettingsProps) {
  const isDark = useAdminTheme()
  const theme = getThemeClasses(isDark)

  const [formData, setFormData] = useState({
    bankAccountRequired: true,
    requireVerifiedBankAccount: true,
    processingTime: '24-48 hours',
    processingTimeBusinessDays: 2,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (settings) {
      setFormData({
        bankAccountRequired: settings.bankAccountRequired !== false,
        requireVerifiedBankAccount: settings.requireVerifiedBankAccount !== false,
        processingTime: settings.processingTime || '24-48 hours',
        processingTimeBusinessDays: settings.processingTimeBusinessDays || 2,
      })
    }
  }, [settings])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (formData.processingTimeBusinessDays < 0) {
      newErrors.processingTimeBusinessDays = 'Processing time cannot be negative'
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
          <Bank size={24} weight="regular" className="text-tiktok-primary" />
        </div>
        <div>
          <h3 className={`font-monument font-bold text-lg ${theme.text.primary}`}>
            Payment Settings
          </h3>
          <p className={`text-sm font-sequel ${theme.text.secondary}`}>
            Configure payment and banking requirements
          </p>
        </div>
      </div>

      {/* Bank Account Requirements */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg border border-white/10">
          <div>
            <label className={`block text-sm font-semibold font-sequel ${theme.text.primary}`}>
              Bank Account Required
            </label>
            <p className={`text-xs font-sequel ${theme.text.secondary} mt-1`}>
              Require users to add a bank account before requesting payouts
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.bankAccountRequired}
              onChange={(e) => setFormData(prev => ({ ...prev, bankAccountRequired: e.target.checked }))}
              className="sr-only peer"
            />
            <div className={`w-11 h-6 rounded-full peer ${
              formData.bankAccountRequired ? 'bg-tiktok-primary' : isDark ? 'bg-white/20' : 'bg-gray-300'
            } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border border-white/10">
          <div>
            <label className={`block text-sm font-semibold font-sequel ${theme.text.primary}`}>
              Require Verified Bank Account
            </label>
            <p className={`text-xs font-sequel ${theme.text.secondary} mt-1`}>
              Require bank account verification via OTP before payouts
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.requireVerifiedBankAccount}
              onChange={(e) => setFormData(prev => ({ ...prev, requireVerifiedBankAccount: e.target.checked }))}
              className="sr-only peer"
            />
            <div className={`w-11 h-6 rounded-full peer ${
              formData.requireVerifiedBankAccount ? 'bg-tiktok-primary' : isDark ? 'bg-white/20' : 'bg-gray-300'
            } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
          </label>
        </div>
      </div>

      {/* Processing Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-semibold font-sequel mb-2 ${theme.text.secondary}`}>
            Processing Time (Display)
          </label>
          <input
            type="text"
            value={formData.processingTime}
            onChange={(e) => setFormData(prev => ({ ...prev, processingTime: e.target.value }))}
            className={`w-full ${theme.bg.input} border-2 rounded-lg px-4 py-2.5 ${theme.text.primary} focus:outline-none focus:ring-2 focus:ring-tiktok-primary focus:border-tiktok-primary font-sequel transition-colors ${
              isDark ? 'border-white/20' : 'border-gray-300'
            }`}
            placeholder="24-48 hours"
          />
          <p className={`mt-1 text-xs font-sequel ${theme.text.muted}`}>
            This text is shown to users
          </p>
        </div>

        <div>
          <label className={`block text-sm font-semibold font-sequel mb-2 ${theme.text.secondary}`}>
            Processing Time (Business Days) *
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={formData.processingTimeBusinessDays}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, processingTimeBusinessDays: parseInt(e.target.value) || 0 }))
              setErrors(prev => ({ ...prev, processingTimeBusinessDays: '' }))
            }}
            className={`w-full ${theme.bg.input} border-2 rounded-lg px-4 py-2.5 ${theme.text.primary} focus:outline-none focus:ring-2 focus:ring-tiktok-primary focus:border-tiktok-primary font-sequel transition-colors ${
              errors.processingTimeBusinessDays 
                ? 'border-red-500' 
                : isDark 
                ? 'border-white/20' 
                : 'border-gray-300'
            }`}
          />
          {errors.processingTimeBusinessDays && (
            <p className="mt-1 text-sm text-red-400 font-sequel">{errors.processingTimeBusinessDays}</p>
          )}
          <p className={`mt-1 text-xs font-sequel ${theme.text.muted}`}>
            Number of business days for processing
          </p>
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
              <span>Save Payment Settings</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}

