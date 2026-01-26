'use client'

import { useState } from 'react'
import { CheckCircle, Circle } from '@phosphor-icons/react'

interface TikTokSetupStepProps {
  theme: 'light' | 'dark'
  isLoading: boolean
  error: string | null
  onSubmit: (step: string, data: any) => Promise<void>
  sessionData: any
}

export function TikTokSetupStep({
  theme,
  isLoading,
  onSubmit,
}: TikTokSetupStepProps) {
  const isDark = theme === 'dark'
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const steps = [
    'Open TikTok Creator Fund settings on your device',
    'Navigate to Payment Settings',
    'Add PayPal as your payment method',
    'Enter the PayPal email address provided by admin',
    'Enter the authentication code when prompted',
    'Confirm and save the payment method',
  ]

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    )
  }

  const handleContinue = async () => {
    await onSubmit('tiktok-setup-instructions', { stepsCompleted: completedSteps.length })
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
          TikTok Setup Instructions
        </h4>
        <p className={`text-sm font-sequel ${
          isDark ? 'text-green-300/80' : 'text-green-700'
        }`}>
          Follow these steps to set up your TikTok account to receive earnings via PayPal:
        </p>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={index}
            onClick={() => toggleStep(index)}
            className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
              completedSteps.includes(index)
                ? isDark
                  ? 'bg-green-500/20 border border-green-500/50'
                  : 'bg-green-100 border border-green-300'
                : isDark
                  ? 'bg-white/5 border border-white/10 hover:bg-white/10'
                  : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            {completedSteps.includes(index) ? (
              <CheckCircle size={20} weight="fill" className={`mt-0.5 flex-shrink-0 ${
                isDark ? 'text-green-400' : 'text-green-600'
              }`} />
            ) : (
              <Circle size={20} weight="regular" className={`mt-0.5 flex-shrink-0 ${
                isDark ? 'text-white/40' : 'text-gray-400'
              }`} />
            )}
            <p className={`text-sm font-sequel flex-1 ${
              completedSteps.includes(index)
                ? isDark
                  ? 'text-green-300 line-through'
                  : 'text-green-700 line-through'
                : isDark
                  ? 'text-white/80'
                  : 'text-gray-700'
            }`}>
              {index + 1}. {step}
            </p>
          </div>
        ))}
      </div>

      <button
        onClick={handleContinue}
        disabled={isLoading || completedSteps.length < steps.length}
        className="w-full bg-tiktok-primary text-white py-3 rounded-xl font-semibold hover:bg-tiktok-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-sequel"
      >
        {isLoading ? 'Processing...' : 'I\'ve Completed All Steps'}
      </button>
    </div>
  )
}

