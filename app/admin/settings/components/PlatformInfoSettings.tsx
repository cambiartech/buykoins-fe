'use client'

import { useState, useEffect } from 'react'
import { Info, FloppyDisk } from '@phosphor-icons/react'
import { useAdminTheme } from '../../hooks/useTheme'
import { getThemeClasses } from '../../utils/theme'

interface PlatformInfoSettingsProps {
  settings?: any
  onSave: (data: any) => void
  isSaving: boolean
}

export function PlatformInfoSettings({ settings, onSave, isSaving }: PlatformInfoSettingsProps) {
  const isDark = useAdminTheme()
  const theme = getThemeClasses(isDark)

  const [formData, setFormData] = useState({
    platformName: 'BuyTikTokCoins',
    supportEmail: '',
    supportPhone: '',
    termsOfServiceUrl: '',
    privacyPolicyUrl: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (settings) {
      setFormData({
        platformName: settings.platformName || 'BuyTikTokCoins',
        supportEmail: settings.supportEmail || '',
        supportPhone: settings.supportPhone || '',
        termsOfServiceUrl: settings.termsOfServiceUrl || '',
        privacyPolicyUrl: settings.privacyPolicyUrl || '',
      })
    }
  }, [settings])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (formData.supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.supportEmail)) {
      newErrors.supportEmail = 'Invalid email format'
    }

    if (formData.termsOfServiceUrl && !isValidUrl(formData.termsOfServiceUrl)) {
      newErrors.termsOfServiceUrl = 'Invalid URL format'
    }

    if (formData.privacyPolicyUrl && !isValidUrl(formData.privacyPolicyUrl)) {
      newErrors.privacyPolicyUrl = 'Invalid URL format'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSave({
        platformName: formData.platformName,
        supportEmail: formData.supportEmail || null,
        supportPhone: formData.supportPhone || null,
        termsOfServiceUrl: formData.termsOfServiceUrl || null,
        privacyPolicyUrl: formData.privacyPolicyUrl || null,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-tiktok-primary/20 rounded-lg flex items-center justify-center">
          <Info size={24} weight="regular" className="text-tiktok-primary" />
        </div>
        <div>
          <h3 className={`font-monument font-bold text-lg ${theme.text.primary}`}>
            Platform Information
          </h3>
          <p className={`text-sm font-sequel ${theme.text.secondary}`}>
            Configure platform name, support contact, and legal links
          </p>
        </div>
      </div>

      {/* Platform Name */}
      <div>
        <label className={`block text-sm font-semibold font-sequel mb-2 ${theme.text.secondary}`}>
          Platform Name *
        </label>
        <input
          type="text"
          value={formData.platformName}
          onChange={(e) => setFormData(prev => ({ ...prev, platformName: e.target.value }))}
          className={`w-full ${theme.bg.input} border-2 rounded-lg px-4 py-2.5 ${theme.text.primary} focus:outline-none focus:ring-2 focus:ring-tiktok-primary focus:border-tiktok-primary font-sequel transition-colors ${
            isDark ? 'border-white/20' : 'border-gray-300'
          }`}
        />
      </div>

      {/* Support Contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-semibold font-sequel mb-2 ${theme.text.secondary}`}>
            Support Email <span className="text-xs font-normal">(optional)</span>
          </label>
          <input
            type="email"
            value={formData.supportEmail}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, supportEmail: e.target.value }))
              setErrors(prev => ({ ...prev, supportEmail: '' }))
            }}
            className={`w-full ${theme.bg.input} border-2 rounded-lg px-4 py-2.5 ${theme.text.primary} focus:outline-none focus:ring-2 focus:ring-tiktok-primary focus:border-tiktok-primary font-sequel transition-colors ${
              errors.supportEmail 
                ? 'border-red-500' 
                : isDark 
                ? 'border-white/20' 
                : 'border-gray-300'
            }`}
            placeholder="support@example.com"
          />
          {errors.supportEmail && (
            <p className="mt-1 text-sm text-red-400 font-sequel">{errors.supportEmail}</p>
          )}
        </div>

        <div>
          <label className={`block text-sm font-semibold font-sequel mb-2 ${theme.text.secondary}`}>
            Support Phone <span className="text-xs font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={formData.supportPhone}
            onChange={(e) => setFormData(prev => ({ ...prev, supportPhone: e.target.value }))}
            className={`w-full ${theme.bg.input} border-2 rounded-lg px-4 py-2.5 ${theme.text.primary} focus:outline-none focus:ring-2 focus:ring-tiktok-primary focus:border-tiktok-primary font-sequel transition-colors ${
              isDark ? 'border-white/20' : 'border-gray-300'
            }`}
            placeholder="+1234567890"
          />
        </div>
      </div>

      {/* Legal Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-semibold font-sequel mb-2 ${theme.text.secondary}`}>
            Terms of Service URL <span className="text-xs font-normal">(optional)</span>
          </label>
          <input
            type="url"
            value={formData.termsOfServiceUrl}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, termsOfServiceUrl: e.target.value }))
              setErrors(prev => ({ ...prev, termsOfServiceUrl: '' }))
            }}
            className={`w-full ${theme.bg.input} border-2 rounded-lg px-4 py-2.5 ${theme.text.primary} focus:outline-none focus:ring-2 focus:ring-tiktok-primary focus:border-tiktok-primary font-sequel transition-colors ${
              errors.termsOfServiceUrl 
                ? 'border-red-500' 
                : isDark 
                ? 'border-white/20' 
                : 'border-gray-300'
            }`}
            placeholder="https://example.com/terms"
          />
          {errors.termsOfServiceUrl && (
            <p className="mt-1 text-sm text-red-400 font-sequel">{errors.termsOfServiceUrl}</p>
          )}
        </div>

        <div>
          <label className={`block text-sm font-semibold font-sequel mb-2 ${theme.text.secondary}`}>
            Privacy Policy URL <span className="text-xs font-normal">(optional)</span>
          </label>
          <input
            type="url"
            value={formData.privacyPolicyUrl}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, privacyPolicyUrl: e.target.value }))
              setErrors(prev => ({ ...prev, privacyPolicyUrl: '' }))
            }}
            className={`w-full ${theme.bg.input} border-2 rounded-lg px-4 py-2.5 ${theme.text.primary} focus:outline-none focus:ring-2 focus:ring-tiktok-primary focus:border-tiktok-primary font-sequel transition-colors ${
              errors.privacyPolicyUrl 
                ? 'border-red-500' 
                : isDark 
                ? 'border-white/20' 
                : 'border-gray-300'
            }`}
            placeholder="https://example.com/privacy"
          />
          {errors.privacyPolicyUrl && (
            <p className="mt-1 text-sm text-red-400 font-sequel">{errors.privacyPolicyUrl}</p>
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
              <span>Save Platform Info</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}

