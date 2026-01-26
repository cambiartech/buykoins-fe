'use client'

import { Clock, CheckCircle } from '@phosphor-icons/react'

interface PendingAdminStepProps {
  theme: 'light' | 'dark'
  isLoading: boolean
  error: string | null
  onSubmit: (step: string, data: any) => Promise<void>
  sessionData: any
}

export function PendingAdminStep({
  theme,
}: PendingAdminStepProps) {
  const isDark = theme === 'dark'

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg ${
        isDark 
          ? 'bg-yellow-500/10 border border-yellow-500/30' 
          : 'bg-yellow-50 border border-yellow-200'
      }`}>
        <div className="flex items-start space-x-3">
          <Clock size={24} weight="regular" className={`mt-1 animate-pulse ${
            isDark ? 'text-yellow-400' : 'text-yellow-600'
          }`} />
          <div>
            <h4 className={`font-semibold mb-2 font-sequel ${
              isDark ? 'text-yellow-300' : 'text-yellow-700'
            }`}>
              Pending Admin Approval
            </h4>
            <p className={`text-sm font-sequel ${
              isDark ? 'text-yellow-300/80' : 'text-yellow-700'
            }`}>
              Your request has been submitted successfully. An admin will review and process your request shortly.
            </p>
            <p className={`text-xs mt-2 font-sequel ${
              isDark ? 'text-yellow-300/60' : 'text-yellow-700/80'
            }`}>
              You'll be notified once your request is processed. You can close this window and continue using the platform.
            </p>
          </div>
        </div>
      </div>

      <div className={`p-4 rounded-lg ${
        isDark ? 'bg-white/5' : 'bg-gray-50'
      }`}>
        <div className="flex items-center space-x-2">
          <CheckCircle size={20} weight="fill" className="text-tiktok-primary" />
          <p className={`text-sm font-sequel ${
            isDark ? 'text-white/80' : 'text-gray-700'
          }`}>
            Request submitted successfully
          </p>
        </div>
      </div>
    </div>
  )
}

