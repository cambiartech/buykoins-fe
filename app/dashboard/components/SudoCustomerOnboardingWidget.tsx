'use client'

import { useState, useEffect } from 'react'
import { X, CircleNotch } from '@phosphor-icons/react'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'
import { WelcomeStep } from './sudo-onboarding-steps/WelcomeStep'
import { PersonalInfoStep } from './sudo-onboarding-steps/PersonalInfoStep'
import { BillingAddressStep } from './sudo-onboarding-steps/BillingAddressStep'
import { IdentityVerificationStep } from './sudo-onboarding-steps/IdentityVerificationStep'
import { ReviewStep } from './sudo-onboarding-steps/ReviewStep'
import { ProcessingStep } from './sudo-onboarding-steps/ProcessingStep'
import { CompletedStep } from './sudo-onboarding-steps/CompletedStep'

interface SudoCustomerOnboardingWidgetProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  theme: 'light' | 'dark'
}

type Step = 'welcome' | 'personal-info' | 'billing-address' | 'identity' | 'review' | 'processing' | 'completed'

interface OnboardingData {
  dob?: string
  billingAddress?: {
    line1?: string
    line2?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
  identity?: {
    identityType?: 'BVN' | 'NIN'
    identityNumber?: string
  }
}

export function SudoCustomerOnboardingWidget({
  isOpen,
  onClose,
  onComplete,
  theme,
}: SudoCustomerOnboardingWidgetProps) {
  const isDark = theme === 'dark'
  const toast = useToast()
  const [currentStep, setCurrentStep] = useState<Step>('welcome')
  const [isLoading, setIsLoading] = useState(false)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({})
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchOnboardingStatus()
    }
  }, [isOpen])

  const fetchOnboardingStatus = async () => {
    try {
      const response = await api.user.getSudoOnboardingStatus()
      if (response.success && response.data) {
        const data = response.data
        const responseData = data as any
        if (responseData.onboardingData) {
          setOnboardingData(responseData.onboardingData)
        }
        if (responseData.currentStep) {
          setCurrentStep(responseData.currentStep as Step)
        } else if (responseData.onboardingCompleted) {
          setCurrentStep('completed')
        }
      }
    } catch (error) {
      console.error('Failed to fetch onboarding status:', error)
      // Start fresh if there's an error
      setCurrentStep('welcome')
    }
  }

  const saveStep = async (step: string, data: any) => {
    try {
      await api.user.saveSudoOnboardingStep(step, data)
    } catch (error) {
      console.error('Failed to save step:', error)
      // Don't show error to user, just log it
    }
  }

  const handleWelcomeNext = () => {
    setCurrentStep('personal-info')
  }

  const handlePersonalInfoNext = (data: { dob: string }) => {
    const newData = { ...onboardingData, dob: data.dob }
    setOnboardingData(newData)
    saveStep('personal-info', data)
    setCurrentStep('billing-address')
  }

  const handleBillingAddressNext = (data: {
    line1: string
    line2?: string
    city: string
    state: string
    postalCode: string
    country: string
  }) => {
    const newData = { ...onboardingData, billingAddress: data }
    setOnboardingData(newData)
    saveStep('billing-address', data)
    setCurrentStep('identity')
  }

  const handleIdentityNext = (data: { identityType: 'BVN' | 'NIN'; identityNumber: string }) => {
    const newData = { ...onboardingData, identity: data }
    setOnboardingData(newData)
    saveStep('identity', data)
    setCurrentStep('review')
  }

  const handleReviewNext = async () => {
    setIsLoading(true)
    setError(null)
    setCurrentStep('processing')

    try {
      const response = await api.user.completeSudoOnboarding()
      if (response.success) {
        setCurrentStep('completed')
      } else {
        setError(response.message || 'Failed to complete onboarding')
        setCurrentStep('review')
        toast.error(response.message || 'Failed to complete onboarding')
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const errorMsg = error.message || 'Failed to complete onboarding'
        setError(errorMsg)
        toast.error(errorMsg)
      } else {
        const errorMsg = 'An unexpected error occurred'
        setError(errorMsg)
        toast.error(errorMsg)
      }
      setCurrentStep('review')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompletedContinue = () => {
    onComplete()
    onClose()
  }

  const handleBack = () => {
    const stepOrder: Step[] = ['welcome', 'personal-info', 'billing-address', 'identity', 'review']
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1])
    }
  }

  const getStepTitle = (step: Step) => {
    switch (step) {
      case 'welcome':
        return 'Welcome'
      case 'personal-info':
        return 'Personal Information'
      case 'billing-address':
        return 'Billing Address'
      case 'identity':
        return 'Identity Verification'
      case 'review':
        return 'Review'
      case 'processing':
        return 'Processing'
      case 'completed':
        return 'Complete'
      default:
        return 'Onboarding'
    }
  }

  const getStepNumber = (step: Step) => {
    const stepOrder: Step[] = ['welcome', 'personal-info', 'billing-address', 'identity', 'review']
    return stepOrder.indexOf(step) + 1
  }

  const getTotalSteps = () => {
    return 5 // welcome, personal-info, billing-address, identity, review
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={currentStep === 'processing' ? undefined : onClose}
      />

      {/* Modal */}
      <div className={`relative w-full max-w-2xl rounded-xl border ${
        isDark ? 'bg-black border-white/10' : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDark ? 'border-white/10' : 'border-gray-200'
        }`}>
          <div className="flex-1">
            <h2 className={`font-monument font-bold text-xl mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {getStepTitle(currentStep)}
            </h2>
            {currentStep !== 'welcome' && currentStep !== 'processing' && currentStep !== 'completed' && (
              <div className="flex items-center space-x-2 mt-2">
                <div className={`flex-1 h-2 rounded-full ${
                  isDark ? 'bg-white/10' : 'bg-gray-200'
                }`}>
                  <div
                    className="h-2 rounded-full bg-tiktok-primary transition-all"
                    style={{ width: `${(getStepNumber(currentStep) / getTotalSteps()) * 100}%` }}
                  />
                </div>
                <span className={`text-xs font-sequel ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                  {getStepNumber(currentStep)}/{getTotalSteps()}
                </span>
              </div>
            )}
          </div>
          {currentStep !== 'processing' && (
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <X size={20} weight="regular" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {error && currentStep !== 'processing' && (
            <div className={`mb-4 p-4 rounded-lg ${
              isDark 
                ? 'bg-red-500/20 border border-red-500/50' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`text-sm font-sequel ${
                isDark ? 'text-red-300' : 'text-red-600'
              }`}>{error}</p>
            </div>
          )}

          {currentStep === 'welcome' && (
            <WelcomeStep theme={theme} onNext={handleWelcomeNext} />
          )}

          {currentStep === 'personal-info' && (
            <PersonalInfoStep
              theme={theme}
              initialData={onboardingData}
              onNext={handlePersonalInfoNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 'billing-address' && (
            <BillingAddressStep
              theme={theme}
              initialData={onboardingData.billingAddress}
              onNext={handleBillingAddressNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 'identity' && (
            <IdentityVerificationStep
              theme={theme}
              initialData={onboardingData.identity}
              onNext={handleIdentityNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 'review' && onboardingData.dob && onboardingData.billingAddress && onboardingData.identity && (
            <ReviewStep
              theme={theme}
              data={{
                dob: onboardingData.dob,
                billingAddress: onboardingData.billingAddress as any,
                identity: onboardingData.identity as any,
              }}
              onNext={handleReviewNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 'processing' && (
            <ProcessingStep theme={theme} />
          )}

          {currentStep === 'completed' && (
            <CompletedStep theme={theme} onContinue={handleCompletedContinue} />
          )}
        </div>
      </div>
    </div>
  )
}

