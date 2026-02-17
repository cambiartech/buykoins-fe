'use client'

import { useEffect } from 'react'
import { X } from '@phosphor-icons/react'
import type { OnboardingStep } from '../lib/onboarding-steps'

const DISMISS_KEY_PREFIX = 'onboarding_guide_dismissed_'

interface OnboardingGuidePopupProps {
  isOpen: boolean
  onClose: () => void
  step: OnboardingStep
  stepIndex: number
  totalSteps: number
  theme: 'light' | 'dark'
  /** When true, remember dismissal in localStorage so we do not show again for this step. */
  rememberDismissal?: boolean
  /** When provided, primary button performs this action (e.g. open add-email screen) instead of just closing. */
  onPrimaryAction?: () => void
  /** Label for the primary button when actionable (e.g. "Provide email"). If not set and onPrimaryAction is set, uses "Continue". */
  primaryButtonLabel?: string
}

export function OnboardingGuidePopup({
  isOpen,
  onClose,
  step,
  stepIndex,
  totalSteps,
  theme,
  rememberDismissal = true,
  onPrimaryAction,
  primaryButtonLabel,
}: OnboardingGuidePopupProps) {
  const isDark = theme === 'dark'
  const storageKey = `${DISMISS_KEY_PREFIX}${step.id}`
  const hasAction = Boolean(onPrimaryAction)
  const label = primaryButtonLabel || (hasAction ? 'Continue' : 'Got it')

  const handleClose = () => {
    if (rememberDismissal && typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, '1')
      } catch {}
    }
    onClose()
  }

  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      {/* Popup card - responsive: bottom sheet on mobile, centered on desktop */}
      <div
        role="dialog"
        aria-labelledby="onboarding-guide-title"
        className={`relative w-full max-w-md rounded-t-2xl sm:rounded-2xl border shadow-xl ${
          isDark
            ? 'bg-[#1a1a1a] border-white/20'
            : 'bg-white border-gray-200'
        }`}
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <p className={`text-xs font-sequel ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
              Step {stepIndex + 1} of {totalSteps}
            </p>
            <button
              type="button"
              onClick={handleClose}
              className={`p-1 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'} transition-colors`}
              aria-label="Close"
            >
              <X size={20} weight="regular" className={isDark ? 'text-white/70' : 'text-gray-500'} />
            </button>
          </div>
          <h3
            id="onboarding-guide-title"
            className={`font-semibold text-lg font-sequel mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            {step.title}
          </h3>
          <p className={`text-sm font-sequel leading-relaxed ${isDark ? 'text-white/80' : 'text-gray-600'}`}>
            {step.message}
          </p>
          <p className={`mt-3 text-sm font-sequel ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
            {step.hint}
          </p>
          <div className={`mt-5 flex gap-3 ${hasAction ? 'flex-col-reverse sm:flex-row' : ''}`}>
            {hasAction && (
              <button
                type="button"
                onClick={() => {
                  handleClose()
                  onPrimaryAction?.()
                }}
                className="w-full py-2.5 rounded-xl font-semibold font-sequel text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                {label}
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className={`w-full py-2.5 rounded-xl font-semibold font-sequel text-sm transition-colors ${
                isDark
                  ? 'bg-white/10 text-white hover:bg-white/15'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {hasAction ? 'Maybe later' : 'Got it'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function wasOnboardingGuideDismissed(stepId: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(`${DISMISS_KEY_PREFIX}${stepId}`) === '1'
  } catch {
    return false
  }
}
