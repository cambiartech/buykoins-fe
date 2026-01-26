'use client'

import { CircleNotch } from '@phosphor-icons/react'

interface ProcessingStepProps {
  theme: 'light' | 'dark'
}

export function ProcessingStep({ theme }: ProcessingStepProps) {
  const isDark = theme === 'dark'

  return (
    <div className="space-y-6 text-center">
      <div className="flex flex-col items-center justify-center py-8">
        <CircleNotch size={48} weight="regular" className="text-tiktok-primary animate-spin mb-4" />
        <h3 className={`font-monument font-bold text-xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Creating Your Profile
        </h3>
        <p className={`text-sm font-sequel ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
          Please wait while we set up your account with our card provider...
        </p>
      </div>
    </div>
  )
}

