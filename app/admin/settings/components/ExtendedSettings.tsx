'use client'

import { useState, useEffect } from 'react'
import { Code, FloppyDisk, Trash } from '@phosphor-icons/react'
import { useAdminTheme } from '../../hooks/useTheme'
import { getThemeClasses } from '../../utils/theme'

interface ExtendedSettingsProps {
  settings?: any
  onSave: (data: any) => void
  isSaving: boolean
}

export function ExtendedSettings({ settings, onSave, isSaving }: ExtendedSettingsProps) {
  const isDark = useAdminTheme()
  const theme = getThemeClasses(isDark)

  const [jsonText, setJsonText] = useState('{}')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (settings) {
      try {
        setJsonText(JSON.stringify(settings, null, 2))
        setError(null)
      } catch (err) {
        setError('Invalid JSON in settings')
      }
    }
  }, [settings])

  const validate = () => {
    try {
      JSON.parse(jsonText)
      setError(null)
      return true
    } catch (err) {
      setError('Invalid JSON format')
      return false
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      try {
        const data = JSON.parse(jsonText)
        onSave(data)
      } catch (err) {
        setError('Failed to parse JSON')
      }
    }
  }

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonText)
      setJsonText(JSON.stringify(parsed, null, 2))
      setError(null)
    } catch (err) {
      setError('Invalid JSON format')
    }
  }

  const handleClear = () => {
    setJsonText('{}')
    setError(null)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-tiktok-primary/20 rounded-lg flex items-center justify-center">
          <Code size={24} weight="regular" className="text-tiktok-primary" />
        </div>
        <div>
          <h3 className={`font-monument font-bold text-lg ${theme.text.primary}`}>
            Extended Settings
          </h3>
          <p className={`text-sm font-sequel ${theme.text.secondary}`}>
            Advanced settings stored as JSON (Super Admin only)
          </p>
        </div>
      </div>

      <div className={`p-4 rounded-lg border ${
        isDark ? 'bg-purple-500/10 border-purple-500/30' : 'bg-purple-50 border-purple-200'
      }`}>
        <p className={`text-sm font-sequel ${
          isDark ? 'text-purple-300' : 'text-purple-700'
        }`}>
          ⚠️ Extended settings are for advanced configuration. Only super admins can modify these settings.
          Use this for feature flags, A/B testing, and custom configurations.
        </p>
      </div>

      {/* JSON Editor */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={`block text-sm font-semibold font-sequel ${theme.text.secondary}`}>
            JSON Configuration
          </label>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleFormat}
              className={`px-3 py-1.5 text-xs font-sequel rounded-lg transition-colors ${
                isDark
                  ? 'bg-white/5 hover:bg-white/10 text-white/80'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Format
            </button>
            <button
              type="button"
              onClick={handleClear}
              className={`px-3 py-1.5 text-xs font-sequel rounded-lg transition-colors ${
                isDark
                  ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300'
                  : 'bg-red-50 hover:bg-red-100 text-red-600'
              }`}
            >
              <Trash size={14} weight="regular" className="inline mr-1" />
              Clear
            </button>
          </div>
        </div>
        <textarea
          value={jsonText}
          onChange={(e) => {
            setJsonText(e.target.value)
            setError(null)
          }}
          rows={15}
          className={`w-full font-mono text-sm ${theme.bg.input} border-2 rounded-lg px-4 py-3 ${theme.text.primary} focus:outline-none focus:ring-2 focus:ring-tiktok-primary focus:border-tiktok-primary transition-colors ${
            error 
              ? 'border-red-500' 
              : isDark 
              ? 'border-white/20' 
              : 'border-gray-300'
          }`}
          spellCheck={false}
        />
        {error && (
          <p className="mt-2 text-sm text-red-400 font-sequel">{error}</p>
        )}
        <p className={`mt-2 text-xs font-sequel ${theme.text.muted}`}>
          Enter valid JSON. Example: {`{"featureFlag1": true, "customSetting": "value"}`}
        </p>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-white/10">
        <button
          type="submit"
          disabled={isSaving || !!error}
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
              <span>Save Extended Settings</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}

