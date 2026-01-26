'use client'

import { useState, useEffect } from 'react'
import { Gear, FloppyDisk } from '@phosphor-icons/react'
import { useAdminTheme } from '../../hooks/useTheme'
import { getThemeClasses } from '../../utils/theme'

interface OperationsSettingsProps {
  settings?: any
  onSave: (data: any) => void
  isSaving: boolean
}

export function OperationsSettings({ settings, onSave, isSaving }: OperationsSettingsProps) {
  const isDark = useAdminTheme()
  const theme = getThemeClasses(isDark)

  const [formData, setFormData] = useState({
    maintenanceMode: false,
    maintenanceMessage: '',
    allowNewRegistrations: true,
    requireEmailVerification: true,
    requireKyc: false,
    autoApproveCredits: false,
    autoApproveThreshold: null as number | null,
    autoVerifySupport: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (settings) {
      setFormData({
        maintenanceMode: settings.maintenanceMode || false,
        maintenanceMessage: settings.maintenanceMessage || '',
        allowNewRegistrations: settings.allowNewRegistrations !== false,
        requireEmailVerification: settings.requireEmailVerification !== false,
        requireKyc: settings.requireKyc || false,
        autoApproveCredits: settings.autoApproveCredits || false,
        autoApproveThreshold: settings.autoApproveThreshold || null,
        autoVerifySupport: settings.autoVerifySupport || false,
      })
    }
  }, [settings])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (formData.maintenanceMode && !formData.maintenanceMessage.trim()) {
      newErrors.maintenanceMessage = 'Maintenance message is required when maintenance mode is enabled'
    }

    if (formData.autoApproveCredits && (!formData.autoApproveThreshold || formData.autoApproveThreshold < 0)) {
      newErrors.autoApproveThreshold = 'Auto-approve threshold must be greater than 0 when auto-approve is enabled'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onSave({
        ...formData,
        maintenanceMessage: formData.maintenanceMessage || null,
        autoApproveThreshold: formData.autoApproveThreshold || null,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-tiktok-primary/20 rounded-lg flex items-center justify-center">
          <Gear size={24} weight="regular" className="text-tiktok-primary" />
        </div>
        <div>
          <h3 className={`font-monument font-bold text-lg ${theme.text.primary}`}>
            Operations Settings
          </h3>
          <p className={`text-sm font-sequel ${theme.text.secondary}`}>
            Configure platform operations and maintenance
          </p>
        </div>
      </div>

      {/* Maintenance Mode */}
      <div className={`p-4 rounded-lg border ${
        isDark ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <label className={`block text-sm font-semibold font-sequel ${theme.text.primary}`}>
              Maintenance Mode
            </label>
            <p className={`text-xs font-sequel ${theme.text.secondary} mt-1`}>
              Temporarily disable the platform for maintenance
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.maintenanceMode}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, maintenanceMode: e.target.checked }))
                setErrors(prev => ({ ...prev, maintenanceMessage: '' }))
              }}
              className="sr-only peer"
            />
            <div className={`w-11 h-6 rounded-full peer ${
              formData.maintenanceMode ? 'bg-tiktok-primary' : isDark ? 'bg-white/20' : 'bg-gray-300'
            } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
          </label>
        </div>
        {formData.maintenanceMode && (
          <div className="mt-3">
            <label className={`block text-sm font-semibold font-sequel mb-2 ${theme.text.secondary}`}>
              Maintenance Message *
            </label>
            <textarea
              value={formData.maintenanceMessage}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, maintenanceMessage: e.target.value }))
                setErrors(prev => ({ ...prev, maintenanceMessage: '' }))
              }}
              rows={3}
              className={`w-full ${theme.bg.input} border-2 rounded-lg px-4 py-2.5 ${theme.text.primary} focus:outline-none focus:ring-2 focus:ring-tiktok-primary focus:border-tiktok-primary font-sequel transition-colors ${
                errors.maintenanceMessage 
                  ? 'border-red-500' 
                  : isDark 
                  ? 'border-white/20' 
                  : 'border-gray-300'
              }`}
              placeholder="We are currently performing scheduled maintenance. Please check back later."
            />
            {errors.maintenanceMessage && (
              <p className="mt-1 text-sm text-red-400 font-sequel">{errors.maintenanceMessage}</p>
            )}
          </div>
        )}
      </div>

      {/* Registration & Verification */}
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg border border-white/10">
          <div>
            <label className={`block text-sm font-semibold font-sequel ${theme.text.primary}`}>
              Allow New Registrations
            </label>
            <p className={`text-xs font-sequel ${theme.text.secondary} mt-1`}>
              Enable or disable new user signups
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.allowNewRegistrations}
              onChange={(e) => setFormData(prev => ({ ...prev, allowNewRegistrations: e.target.checked }))}
              className="sr-only peer"
            />
            <div className={`w-11 h-6 rounded-full peer ${
              formData.allowNewRegistrations ? 'bg-tiktok-primary' : isDark ? 'bg-white/20' : 'bg-gray-300'
            } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border border-white/10">
          <div>
            <label className={`block text-sm font-semibold font-sequel ${theme.text.primary}`}>
              Require Email Verification
            </label>
            <p className={`text-xs font-sequel ${theme.text.secondary} mt-1`}>
              Users must verify their email before accessing the platform
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.requireEmailVerification}
              onChange={(e) => setFormData(prev => ({ ...prev, requireEmailVerification: e.target.checked }))}
              className="sr-only peer"
            />
            <div className={`w-11 h-6 rounded-full peer ${
              formData.requireEmailVerification ? 'bg-tiktok-primary' : isDark ? 'bg-white/20' : 'bg-gray-300'
            } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border border-white/10">
          <div>
            <label className={`block text-sm font-semibold font-sequel ${theme.text.primary}`}>
              Require KYC Verification
            </label>
            <p className={`text-xs font-sequel ${theme.text.secondary} mt-1`}>
              Require identity verification before withdrawals
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.requireKyc}
              onChange={(e) => setFormData(prev => ({ ...prev, requireKyc: e.target.checked }))}
              className="sr-only peer"
            />
            <div className={`w-11 h-6 rounded-full peer ${
              formData.requireKyc ? 'bg-tiktok-primary' : isDark ? 'bg-white/20' : 'bg-gray-300'
            } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
          </label>
        </div>
      </div>

      {/* Auto-Approve Credits */}
      <div className={`p-4 rounded-lg border ${
        isDark ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <label className={`block text-sm font-semibold font-sequel ${theme.text.primary}`}>
              Auto-Approve Credits
            </label>
            <p className={`text-xs font-sequel ${theme.text.secondary} mt-1`}>
              Automatically approve credit requests below threshold (not recommended)
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.autoApproveCredits}
              onChange={(e) => {
                setFormData(prev => ({ 
                  ...prev, 
                  autoApproveCredits: e.target.checked,
                  autoApproveThreshold: e.target.checked ? prev.autoApproveThreshold || 100 : null,
                }))
                setErrors(prev => ({ ...prev, autoApproveThreshold: '' }))
              }}
              className="sr-only peer"
            />
            <div className={`w-11 h-6 rounded-full peer ${
              formData.autoApproveCredits ? 'bg-tiktok-primary' : isDark ? 'bg-white/20' : 'bg-gray-300'
            } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
          </label>
        </div>
        {formData.autoApproveCredits && (
          <div className="mt-3">
            <label className={`block text-sm font-semibold font-sequel mb-2 ${theme.text.secondary}`}>
              Auto-Approve Threshold (USD) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.autoApproveThreshold || ''}
              onChange={(e) => {
                const value = e.target.value === '' ? null : parseFloat(e.target.value) || 0
                setFormData(prev => ({ ...prev, autoApproveThreshold: value }))
                setErrors(prev => ({ ...prev, autoApproveThreshold: '' }))
              }}
              className={`w-full ${theme.bg.input} border-2 rounded-lg px-4 py-2.5 ${theme.text.primary} focus:outline-none focus:ring-2 focus:ring-tiktok-primary focus:border-tiktok-primary font-sequel transition-colors ${
                errors.autoApproveThreshold 
                  ? 'border-red-500' 
                  : isDark 
                  ? 'border-white/20' 
                  : 'border-gray-300'
              }`}
            />
            {errors.autoApproveThreshold && (
              <p className="mt-1 text-sm text-red-400 font-sequel">{errors.autoApproveThreshold}</p>
            )}
          </div>
        )}
      </div>

      {/* Auto Verify Support */}
      <div className="flex items-center justify-between p-4 rounded-lg border border-white/10">
        <div>
          <label className={`block text-sm font-semibold font-sequel ${theme.text.primary}`}>
            Auto Verify Support
          </label>
          <p className={`text-xs font-sequel ${theme.text.secondary} mt-1`}>
            Automatically verify support/admin operations
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formData.autoVerifySupport}
            onChange={(e) => setFormData(prev => ({ ...prev, autoVerifySupport: e.target.checked }))}
            className="sr-only peer"
          />
          <div className={`w-11 h-6 rounded-full peer ${
            formData.autoVerifySupport ? 'bg-tiktok-primary' : isDark ? 'bg-white/20' : 'bg-gray-300'
          } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all`}></div>
        </label>
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
              <span>Save Operations Settings</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}

