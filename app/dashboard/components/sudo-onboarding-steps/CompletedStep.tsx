'use client'

import { CheckCircle, CreditCard } from '@phosphor-icons/react'

interface CompletedStepProps {
  theme: 'light' | 'dark'
  onContinue: () => void
}

export function CompletedStep({ theme, onContinue }: CompletedStepProps) {
  const isDark = theme === 'dark'

  return (
    <div className="space-y-6 text-center">
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
          <CheckCircle size={40} weight="fill" className="text-green-400" />
        </div>
        <h3 className={`font-monument font-bold text-xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Profile Complete!
        </h3>
        <p className={`text-sm font-sequel mb-6 ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
          Your profile has been successfully set up. You can now create virtual cards.
        </p>
      </div>

      <div className={`p-4 rounded-lg border ${
        isDark ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200'
      }`}>
        <div className="flex items-center space-x-2 justify-center mb-2">
          <CreditCard size={20} weight="regular" className={
            isDark ? 'text-green-400' : 'text-green-600'
          } />
          <p className={`font-semibold font-sequel ${
            isDark ? 'text-green-300' : 'text-green-700'
          }`}>
            Ready to Create Cards
          </p>
        </div>
        <p className={`text-xs font-sequel ${
          isDark ? 'text-green-300/80' : 'text-green-700'
        }`}>
          You can now create virtual cards to make purchases for TikTok coins, subscriptions, and more.
        </p>
      </div>

      <button
        onClick={onContinue}
        className="w-full bg-tiktok-primary text-white py-3 rounded-xl font-semibold hover:bg-tiktok-primary/90 transition-colors font-sequel"
      >
        Create My First Card
      </button>
    </div>
  )
}

