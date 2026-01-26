'use client'

import { CheckCircle } from '@phosphor-icons/react'

interface ConfirmingPayPalStepProps {
  theme: 'light' | 'dark'
  isLoading: boolean
  error: string | null
  onSubmit: (step: string, data: any) => Promise<void>
  sessionData: any
}

export function ConfirmingPayPalStep({
  theme,
  isLoading,
  onSubmit,
  sessionData,
}: ConfirmingPayPalStepProps) {
  const isDark = theme === 'dark'

  const handleConfirm = async () => {
    await onSubmit('confirming-paypal', {
      confirmed: true,
    })
  }

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg ${
        isDark 
          ? 'bg-green-500/10 border border-green-500/30' 
          : 'bg-green-50 border border-green-200'
      }`}>
        <h4 className={`font-semibold mb-2 font-sequel ${
          isDark ? 'text-green-300' : 'text-green-700'
        }`}>
          Confirm Transaction
        </h4>
        <p className={`text-sm font-sequel ${
          isDark ? 'text-green-300/80' : 'text-green-700'
        }`}>
          Please review the transaction details below before submitting.
        </p>
      </div>

      {sessionData.amount && (
        <div className={`p-4 rounded-lg ${
          isDark ? 'bg-white/5' : 'bg-gray-50'
        }`}>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className={`text-sm font-sequel ${
                isDark ? 'text-white/60' : 'text-gray-600'
              }`}>
                Amount:
              </span>
              <span className={`text-sm font-semibold font-sequel ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                ${sessionData.amount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleConfirm}
        disabled={isLoading}
        className="w-full bg-tiktok-primary text-white py-3 rounded-xl font-semibold hover:bg-tiktok-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-sequel flex items-center justify-center space-x-2"
      >
        <CheckCircle size={18} weight="regular" />
        <span>{isLoading ? 'Processing...' : 'Confirm & Submit'}</span>
      </button>
    </div>
  )
}

