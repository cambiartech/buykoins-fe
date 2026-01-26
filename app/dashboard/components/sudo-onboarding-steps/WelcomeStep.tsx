'use client'

import { CreditCard, CheckCircle } from '@phosphor-icons/react'

interface WelcomeStepProps {
  theme: 'light' | 'dark'
  onNext: () => void
}

export function WelcomeStep({ theme, onNext }: WelcomeStepProps) {
  const isDark = theme === 'dark'

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-tiktok-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard size={32} weight="regular" className="text-tiktok-primary" />
        </div>
        <h3 className={`font-monument font-bold text-xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Complete Your Profile
        </h3>
        <p className={`text-sm font-sequel ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
          To create virtual cards, we need some additional information for security and compliance.
        </p>
      </div>

      <div className={`p-4 rounded-lg border ${
        isDark ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200'
      }`}>
        <h4 className={`font-semibold mb-3 font-sequel ${
          isDark ? 'text-blue-300' : 'text-blue-700'
        }`}>
          What we'll collect:
        </h4>
        <ul className="space-y-2">
          {[
            'Date of birth',
            'Billing address',
            'Identity verification (BVN or NIN)',
          ].map((item, index) => (
            <li key={index} className="flex items-center space-x-2">
              <CheckCircle size={18} weight="regular" className={
                isDark ? 'text-blue-400' : 'text-blue-600'
              } />
              <span className={`text-sm font-sequel ${
                isDark ? 'text-white/80' : 'text-gray-700'
              }`}>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={`p-4 rounded-lg ${
        isDark ? 'bg-white/5' : 'bg-gray-50'
      }`}>
        <p className={`text-xs font-sequel ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
          <strong className={isDark ? 'text-white/80' : 'text-gray-700'}>Note:</strong> Your information is secure and encrypted. 
          You can save your progress and return later if needed.
        </p>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-tiktok-primary text-white py-3 rounded-xl font-semibold hover:bg-tiktok-primary/90 transition-colors font-sequel"
      >
        Get Started
      </button>
    </div>
  )
}

