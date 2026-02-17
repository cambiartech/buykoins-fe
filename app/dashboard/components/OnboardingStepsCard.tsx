'use client'

import { useState, useEffect } from 'react'
import { Clock, UserPlus, CheckCircle, Envelope, Question } from '@phosphor-icons/react'
import Link from 'next/link'
import {
  getOnboardingSteps,
  getCurrentOnboardingStep,
  type AuthType,
} from '../lib/onboarding-steps'
import { OnboardingGuidePopup, wasOnboardingGuideDismissed } from './OnboardingGuidePopup'

interface OnboardingStepsCardProps {
  theme: 'light' | 'dark'
  authType: AuthType
  hasTiktok: boolean
  hasRealEmail: boolean
  onboardingStatus: 'pending' | 'completed'
  onRequestOnboarding: () => void
  onOpenProfile: () => void
}

export function OnboardingStepsCard({
  theme,
  authType,
  hasTiktok,
  hasRealEmail,
  onboardingStatus,
  onRequestOnboarding,
  onOpenProfile,
}: OnboardingStepsCardProps) {
  const isDark = theme === 'dark'
  const steps = getOnboardingSteps(authType)
  const currentInfo = getCurrentOnboardingStep(
    authType,
    hasTiktok,
    hasRealEmail,
    onboardingStatus === 'completed'
  )
  const [showGuidePopup, setShowGuidePopup] = useState(false)
  const [hasCheckedPopup, setHasCheckedPopup] = useState(false)

  // Show guide popup once for current step if not yet dismissed (after mount)
  useEffect(() => {
    if (!currentInfo || hasCheckedPopup) return
    setHasCheckedPopup(true)
    const alreadyDismissed = wasOnboardingGuideDismissed(currentInfo.step.id)
    if (!alreadyDismissed) {
      setShowGuidePopup(true)
    }
  }, [currentInfo?.step.id, hasCheckedPopup])

  const handlePrimaryAction = () => {
    if (!currentInfo) return
    const { step } = currentInfo
    if (step.actionTarget === 'link_tiktok') {
      window.location.href = '/onboarding'
    } else if (step.actionTarget === 'open_profile') {
      onOpenProfile()
    } else {
      onRequestOnboarding()
    }
  }

  const canRequestOnboarding =
    (authType === 'email' && hasTiktok) || (authType === 'tiktok' && hasRealEmail)

  const completedCount = steps.filter((s) =>
    authType === 'email'
      ? (s.id === 'link_tiktok' && hasTiktok) || (s.id === 'request_onboarding' && onboardingStatus === 'completed')
      : (s.id === 'add_email' && hasRealEmail) || (s.id === 'request_onboarding' && onboardingStatus === 'completed')
  ).length
  const totalCount = steps.length

  return (
    <>
      <div
        className={`mt-4 rounded-xl border overflow-hidden ${
          isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
        }`}
      >
        {/* Profile completion progress bar – click to open guide popup */}
        {currentInfo && (
          <button
            type="button"
            onClick={() => setShowGuidePopup(true)}
            className={`w-full px-4 py-3 flex items-center justify-between gap-3 text-left border-b ${
              isDark ? 'border-white/10 hover:bg-white/5' : 'border-gray-100 hover:bg-gray-50'
            } transition-colors`}
          >
            <span className={`text-xs font-sequel ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
              Profile setup
            </span>
            <div className="flex items-center gap-2">
              <div
                className={`h-1.5 rounded-full overflow-hidden w-24 ${
                  isDark ? 'bg-white/10' : 'bg-gray-200'
                }`}
              >
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${(completedCount / totalCount) * 100}%` }}
                />
              </div>
              <span className={`text-xs font-sequel font-medium ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                {completedCount} of {totalCount} complete
              </span>
            </div>
          </button>
        )}
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={20} weight="regular" className={isDark ? 'text-amber-400' : 'text-amber-600'} />
            <h3 className={`font-semibold text-sm font-sequel ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Get set up
            </h3>
          </div>
          <p className={`text-xs font-sequel mb-4 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
            Follow these steps to start earning. We will guide you through each one.
          </p>

          <ul className="space-y-3 mb-4">
            {steps.map((step, index) => {
              const isDone =
                authType === 'email'
                  ? (step.id === 'link_tiktok' && hasTiktok) || (step.id === 'request_onboarding' && onboardingStatus === 'completed')
                  : (step.id === 'add_email' && hasRealEmail) || (step.id === 'request_onboarding' && onboardingStatus === 'completed')
              const isCurrent = currentInfo?.step.id === step.id
              return (
                <li
                  key={step.id}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    isCurrent
                      ? isDark
                        ? 'bg-blue-500/10 border border-blue-500/30'
                        : 'bg-blue-50 border border-blue-200'
                      : isDark
                        ? 'bg-white/5'
                        : 'bg-gray-50'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle size={20} weight="fill" className="flex-shrink-0 text-green-500 mt-0.5" />
                  ) : (
                    <span
                      className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold ${
                        isCurrent
                          ? 'bg-blue-600 text-white'
                          : isDark
                            ? 'bg-white/20 text-white/70'
                            : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {index + 1}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm font-sequel ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {step.title}
                    </p>
                    {isDone && (
                      <p className={`text-xs font-sequel mt-0.5 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                        Done
                      </p>
                    )}
                    {isCurrent && !isDone && (
                      <button
                        type="button"
                        onClick={() => setShowGuidePopup(true)}
                        className={`mt-1.5 inline-flex items-center gap-1 text-xs font-sequel ${
                          isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                        }`}
                      >
                        <Question size={14} weight="regular" />
                        Need a hint?
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>

          {currentInfo && (
            <div className="flex flex-col sm:flex-row gap-3">
              {currentInfo.step.actionTarget === 'link_tiktok' && (
                <Link
                  href="/onboarding"
                  className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm font-sequel transition-colors ${
                    isDark
                      ? 'bg-tiktok-primary text-black hover:opacity-90'
                      : 'bg-tiktok-primary text-black hover:opacity-90'
                  }`}
                >
                  Link TikTok account
                </Link>
              )}
              {currentInfo.step.actionTarget === 'open_profile' && (
                <button
                  type="button"
                  onClick={onOpenProfile}
                  className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm font-sequel transition-colors ${
                    isDark ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <Envelope size={18} weight="regular" />
                  Add your email in Profile
                </button>
              )}
              {currentInfo.step.actionTarget === 'request_onboarding' && (
                <button
                  type="button"
                  onClick={onRequestOnboarding}
                  disabled={!canRequestOnboarding}
                  className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm font-sequel transition-colors ${
                    canRequestOnboarding
                      ? isDark
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                      : isDark
                        ? 'bg-white/10 text-white/50 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <UserPlus size={18} weight="regular" />
                  Request onboarding
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {currentInfo && (
        <OnboardingGuidePopup
          isOpen={showGuidePopup}
          onClose={() => setShowGuidePopup(false)}
          step={currentInfo.step}
          stepIndex={currentInfo.index}
          totalSteps={currentInfo.total}
          theme={theme}
          rememberDismissal
          onPrimaryAction={currentInfo.step.actionTarget === 'open_profile' ? onOpenProfile : undefined}
          primaryButtonLabel={currentInfo.step.actionTarget === 'open_profile' ? 'Provide email' : undefined}
        />
      )}
    </>
  )
}
