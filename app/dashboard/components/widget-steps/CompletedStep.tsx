'use client'

import { CheckCircle } from '@phosphor-icons/react'

interface CompletedStepProps {
  theme: 'light' | 'dark'
  isLoading: boolean
  error: string | null
  onSubmit: (step: string, data: any) => Promise<void>
  onComplete: (finalData?: any) => Promise<void>
  sessionData: any
  onClose: () => void
}

export function CompletedStep({
  theme,
  onClose,
}: CompletedStepProps) {
  const isDark = theme === 'dark'

  return (
    <div className="space-y-4 text-center">
      <div className="flex justify-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
          isDark ? 'bg-green-500/20' : 'bg-green-100'
        }`}>
          <CheckCircle size={48} weight="fill" className="text-tiktok-primary" />
        </div>
      </div>

      <div>
        <h4 className={`text-xl font-bold mb-2 font-monument ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Completed Successfully!
        </h4>
        <p className={`text-sm font-sequel ${
          isDark ? 'text-white/60' : 'text-gray-600'
        }`}>
          Your request has been processed successfully.
        </p>
      </div>

      <button
        onClick={onClose}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all font-sequel"
      >
        Close
      </button>
    </div>
  )
}

