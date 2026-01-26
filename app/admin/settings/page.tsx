'use client'

import { useState, useEffect } from 'react'
import {
  CurrencyDollar,
  Gear,
  Bank,
  Scales,
  Info,
  Code,
  CheckCircle,
  XCircle,
} from '@phosphor-icons/react'
import { useAdminTheme } from '../hooks/useTheme'
import { getThemeClasses } from '../utils/theme'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'
import { getAdmin } from '@/lib/auth'
import { FinancialSettings } from './components/FinancialSettings'
import { OperationsSettings } from './components/OperationsSettings'
import { PaymentSettings } from './components/PaymentSettings'
import { BusinessRulesSettings } from './components/BusinessRulesSettings'
import { PlatformInfoSettings } from './components/PlatformInfoSettings'
import { ExtendedSettings } from './components/ExtendedSettings'

type SettingsCategory = 'financial' | 'operations' | 'payment' | 'business-rules' | 'platform-info' | 'extended'

interface SettingsData {
  financial?: any
  operations?: any
  payment?: any
  businessRules?: any
  platformInfo?: any
  extended?: any
  metadata?: {
    updatedAt?: string
    updatedBy?: string | null
  }
}

export default function SettingsPage() {
  const isDark = useAdminTheme()
  const theme = getThemeClasses(isDark)
  const toast = useToast()
  const admin = getAdmin()
  const isSuperAdmin = admin?.role === 'super_admin'

  const [activeTab, setActiveTab] = useState<SettingsCategory>('financial')
  const [settings, setSettings] = useState<SettingsData>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingCategory, setSavingCategory] = useState<string | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.settings.getAllSettings()
      if (response.success && response.data) {
        setSettings(response.data)
      } else {
        setError(response.message || 'Failed to load settings')
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Failed to load settings')
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (category: SettingsCategory, data: any) => {
    setSavingCategory(category)
    try {
      let response
      switch (category) {
        case 'financial':
          response = await api.settings.updateFinancialSettings(data)
          break
        case 'operations':
          response = await api.settings.updateOperationsSettings(data)
          break
        case 'payment':
          response = await api.settings.updatePaymentSettings(data)
          break
        case 'business-rules':
          response = await api.settings.updateBusinessRulesSettings(data)
          break
        case 'platform-info':
          response = await api.settings.updatePlatformInfoSettings(data)
          break
        case 'extended':
          response = await api.settings.updateExtendedSettings(data)
          break
      }

      if (response.success) {
        toast.success(response.message || 'Settings updated successfully')
        // Refresh settings
        await fetchSettings()
      } else {
        toast.error(response.message || 'Failed to update settings')
      }
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || 'Failed to update settings')
      } else {
        toast.error('An unexpected error occurred')
      }
    } finally {
      setSavingCategory(null)
    }
  }

  const tabs: Array<{ id: SettingsCategory; label: string; icon: any; requiresSuperAdmin?: boolean }> = [
    { id: 'financial', label: 'Financial', icon: CurrencyDollar },
    { id: 'operations', label: 'Operations', icon: Gear },
    { id: 'payment', label: 'Payment', icon: Bank },
    { id: 'business-rules', label: 'Business Rules', icon: Scales },
    { id: 'platform-info', label: 'Platform Info', icon: Info },
    { id: 'extended', label: 'Extended', icon: Code, requiresSuperAdmin: true },
  ]

  const visibleTabs = tabs.filter(tab => !tab.requiresSuperAdmin || isSuperAdmin)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-tiktok-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={`font-sequel ${theme.text.secondary}`}>Loading settings...</p>
        </div>
      </div>
    )
  }

  if (error && !settings.financial) {
    return (
      <div className={`p-6 rounded-xl border ${isDark ? 'bg-red-500/10 border-red-500/50' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-center space-x-3 mb-2">
          <XCircle size={24} weight="regular" className="text-red-500" />
          <h3 className={`font-semibold font-sequel ${isDark ? 'text-red-300' : 'text-red-700'}`}>
            Error Loading Settings
          </h3>
        </div>
        <p className={`font-sequel ${isDark ? 'text-red-300/80' : 'text-red-600'}`}>{error}</p>
        <button
          onClick={fetchSettings}
          className="mt-4 px-4 py-2 bg-tiktok-primary hover:bg-tiktok-primary/90 text-white rounded-lg font-sequel transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className={`font-monument font-bold text-2xl mb-2 ${theme.text.primary}`}>
          Platform Settings
        </h2>
        <p className={`font-sequel ${theme.text.secondary}`}>
          Manage all platform configuration settings
        </p>
      </div>

      {/* Tabs */}
      <div className={`mb-6 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
        <div className="flex space-x-1 overflow-x-auto">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 font-sequel font-semibold transition-colors border-b-2 ${
                  isActive
                    ? 'border-tiktok-primary text-tiktok-primary'
                    : `border-transparent ${theme.text.secondary} hover:${theme.text.primary}`
                }`}
              >
                <Icon size={18} weight="regular" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className={`${theme.bg.card} ${theme.border.default} rounded-xl p-6`}>
        {error && (
          <div className={`mb-4 p-4 rounded-lg ${
            isDark ? 'bg-red-500/20 border border-red-500/50' : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`text-sm font-sequel ${isDark ? 'text-red-300' : 'text-red-600'}`}>
              {error}
            </p>
          </div>
        )}

        {activeTab === 'financial' && (
          <FinancialSettings
            settings={settings.financial}
            onSave={(data) => handleSave('financial', data)}
            isSaving={savingCategory === 'financial'}
          />
        )}

        {activeTab === 'operations' && (
          <OperationsSettings
            settings={settings.operations}
            onSave={(data) => handleSave('operations', data)}
            isSaving={savingCategory === 'operations'}
          />
        )}

        {activeTab === 'payment' && (
          <PaymentSettings
            settings={settings.payment}
            onSave={(data) => handleSave('payment', data)}
            isSaving={savingCategory === 'payment'}
          />
        )}

        {activeTab === 'business-rules' && (
          <BusinessRulesSettings
            settings={settings.businessRules}
            onSave={(data) => handleSave('business-rules', data)}
            isSaving={savingCategory === 'business-rules'}
          />
        )}

        {activeTab === 'platform-info' && (
          <PlatformInfoSettings
            settings={settings.platformInfo}
            onSave={(data) => handleSave('platform-info', data)}
            isSaving={savingCategory === 'platform-info'}
          />
        )}

        {activeTab === 'extended' && isSuperAdmin && (
          <ExtendedSettings
            settings={settings.extended || {}}
            onSave={(data) => handleSave('extended', data)}
            isSaving={savingCategory === 'extended'}
          />
        )}
      </div>

      {/* Metadata */}
      {settings.metadata?.updatedAt && (
        <div className={`mt-4 text-xs font-sequel ${theme.text.muted} text-center`}>
          Last updated: {new Date(settings.metadata.updatedAt).toLocaleString()}
          {settings.metadata.updatedBy && ` by ${settings.metadata.updatedBy}`}
        </div>
      )}
    </div>
  )
}
