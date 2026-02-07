'use client'

import { useState } from 'react'
import { Key } from '@phosphor-icons/react'
import { api } from '@/lib/api'

interface EnterAuthCodeStepProps {
  theme: 'light' | 'dark'
  isLoading: boolean
  error: string | null
  onSubmit: (step: string, data: any) => Promise<void>
  sessionData: any
}

export function EnterAuthCodeStep({
  theme,
  isLoading,
  error,
  onSubmit,
}: EnterAuthCodeStepProps) {
  const isDark = theme === 'dark'
  const [authCode, setAuthCode] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!authCode || authCode.length !== 6) {
      return
    }

    // Verify the OTP code
    try {
      const response = await api.support.verifyOnboardingCode({ code: authCode })
      if (response.success) {
        // OTP verified successfully, move to completed step
        await onSubmit('enter-auth-code', { authCode, verified: true })
      } else {
        // Handle error - will be shown by parent component
        await onSubmit('enter-auth-code', { authCode, verified: false })
      }
    } catch (error) {
      // Handle error - will be shown by parent component
      await onSubmit('enter-auth-code', { authCode, verified: false })
    }
  }

  const handleCodeChange = (value: string) => {
    // Only allow digits and limit to 6 characters
    const digits = value.replace(/\D/g, '').slice(0, 6)
    setAuthCode(digits)
  }

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg ${
        isDark 
          ? 'bg-blue-500/10 border border-blue-500/30' 
          : 'bg-blue-50 border border-blue-200'
      }`}>
        <div className="flex items-start space-x-3">
          <Key size={24} weight="regular" className={`mt-1 ${
            isDark ? 'text-blue-400' : 'text-blue-600'
          }`} />
          <div>
            <h4 className={`font-semibold mb-2 font-sequel ${
              isDark ? 'text-blue-300' : 'text-blue-700'
            }`}>
              Enter Authentication Code
            </h4>
            <p className={`text-sm font-sequel ${
              isDark ? 'text-blue-300/80' : 'text-blue-700'
            }`}>
              Enter the 6-digit authentication code sent by the admin. 
              This code is used to verify your PayPal setup.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={`block text-sm font-medium mb-2 font-sequel ${
            isDark ? 'text-white/80' : 'text-gray-700'
          }`}>
            Authentication Code
          </label>
          <input
            type="text"
            value={authCode}
            onChange={(e) => handleCodeChange(e.target.value)}
            placeholder="123456"
            maxLength={6}
            disabled={isLoading}
            className={`w-full px-4 py-3 rounded-lg border text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-600 font-sequel ${
              isDark
                ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
            }`}
          />
          <p className={`mt-1 text-xs font-sequel ${
            isDark ? 'text-white/40' : 'text-gray-400'
          }`}>
            Enter the 6-digit code from the admin
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading || authCode.length !== 6}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-sequel"
        >
          {isLoading ? 'Validating...' : 'Continue'}
        </button>
      </form>
    </div>
  )
}

