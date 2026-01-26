'use client'

import { useState, useEffect } from 'react'
import { X, CreditCard, CircleNotch } from '@phosphor-icons/react'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'
import { SudoCustomerOnboardingWidget } from './SudoCustomerOnboardingWidget'

interface CreateCardModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  theme: 'light' | 'dark'
}

export function CreateCardModal({ isOpen, onClose, onSuccess, theme }: CreateCardModalProps) {
  const isDark = theme === 'dark'
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [currency, setCurrency] = useState('NGN')
  const [checkingOnboarding, setCheckingOnboarding] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [hasSudoCustomer, setHasSudoCustomer] = useState(false)

  useEffect(() => {
    if (isOpen) {
      checkOnboardingStatus()
    } else {
      // Reset state when modal closes
      setCheckingOnboarding(true)
      setShowOnboarding(false)
      setHasSudoCustomer(false)
    }
  }, [isOpen])

  const checkOnboardingStatus = async () => {
    setCheckingOnboarding(true)
    try {
      const response = await api.user.getSudoOnboardingStatus()
      if (response.success && response.data) {
        const data = response.data as any
        if (data.hasSudoCustomer || data.sudoCustomerId) {
          setHasSudoCustomer(true)
          setShowOnboarding(false)
        } else if (data.onboardingCompleted) {
          // Onboarding complete but customer not created yet - backend will handle it
          setHasSudoCustomer(false)
          setShowOnboarding(false)
        } else {
          // Need to complete onboarding
          setHasSudoCustomer(false)
          setShowOnboarding(true)
        }
      } else {
        // Assume onboarding needed if status check fails
        setHasSudoCustomer(false)
        setShowOnboarding(true)
      }
    } catch (error) {
      console.error('Failed to check onboarding status:', error)
      // On error, assume we need onboarding
      setHasSudoCustomer(false)
      setShowOnboarding(true)
    } finally {
      setCheckingOnboarding(false)
    }
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    setHasSudoCustomer(true)
    // Now proceed with card creation
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await api.user.createCard(currency)
      if (response.success) {
        toast.success('Card created successfully!')
        onSuccess()
        onClose()
      } else {
        // Check if onboarding is required
        if (response.message?.toLowerCase().includes('onboarding') || 
            (response as any).onboardingRequired) {
          setShowOnboarding(true)
          setHasSudoCustomer(false)
        } else {
          toast.error(response.message || 'Failed to create card')
        }
      }
    } catch (error) {
      if (error instanceof ApiError) {
        // Check if error indicates onboarding is required
        if (error.message?.toLowerCase().includes('onboarding') || 
            error.status === 403) {
          setShowOnboarding(true)
          setHasSudoCustomer(false)
        } else {
          toast.error(error.message || 'Failed to create card')
        }
      } else {
        toast.error('An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  // Show onboarding widget if needed
  if (showOnboarding) {
    return (
      <SudoCustomerOnboardingWidget
        isOpen={isOpen}
        onClose={onClose}
        onComplete={handleOnboardingComplete}
        theme={theme}
      />
    )
  }

  // Show loading while checking onboarding status
  if (checkingOnboarding) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className={`relative w-full max-w-md rounded-xl border ${
          isDark ? 'bg-black border-white/10' : 'bg-white border-gray-200'
        }`}>
          <div className="p-12 text-center">
            <CircleNotch size={32} weight="regular" className="text-tiktok-primary animate-spin mx-auto mb-4" />
            <p className={`font-sequel ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
              Checking your profile...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative w-full max-w-md rounded-xl border ${
        isDark ? 'bg-black border-white/10' : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDark ? 'border-white/10' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-tiktok-primary/20 rounded-full flex items-center justify-center">
              <CreditCard size={20} weight="regular" className="text-tiktok-primary" />
            </div>
            <h2 className={`font-monument font-bold text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Create New Card
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <X size={20} weight="regular" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <p className={`text-sm font-sequel mb-4 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
              Create a virtual card to make purchases for TikTok coins, subscriptions, and more.
            </p>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 font-sequel ${
              isDark ? 'text-white/80' : 'text-gray-700'
            }`}>
              Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border font-sequel ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-tiktok-primary'
                  : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-tiktok-primary'
              } focus:outline-none`}
            >
              <option value="NGN">NGN (Nigerian Naira)</option>
              <option value="USD">USD (US Dollar)</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-3 rounded-lg border font-sequel transition-colors ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-tiktok-primary text-white rounded-lg hover:bg-tiktok-primary/90 transition-colors font-sequel disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <CircleNotch size={18} weight="regular" className="animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Card</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

