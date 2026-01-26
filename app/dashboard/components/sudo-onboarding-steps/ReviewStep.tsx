'use client'

import { CheckCircle, Calendar, MapPin, ShieldCheck } from '@phosphor-icons/react'

interface ReviewStepProps {
  theme: 'light' | 'dark'
  data: {
    dob: string
    billingAddress: {
      line1: string
      line2?: string
      city: string
      state: string
      postalCode: string
      country: string
    }
    identity: {
      identityType: 'BVN' | 'NIN'
      identityNumber: string
    }
  }
  onNext: () => void
  onBack: () => void
}

export function ReviewStep({ theme, data, onNext, onBack }: ReviewStepProps) {
  const isDark = theme === 'dark'

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const maskIdentity = (number: string) => {
    if (number.length <= 4) return number
    return '****' + number.slice(-4)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className={`font-monument font-bold text-xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Review Your Information
        </h3>
        <p className={`text-sm font-sequel ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
          Please review all the information you've provided. You can go back to make changes if needed.
        </p>
      </div>

      <div className="space-y-4">
        {/* Personal Info */}
        <div className={`p-4 rounded-lg border ${
          isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center space-x-2 mb-3">
            <Calendar size={20} weight="regular" className="text-tiktok-primary" />
            <h4 className={`font-semibold font-sequel ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Personal Information
            </h4>
          </div>
          <div className="space-y-1">
            <p className={`text-sm font-sequel ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
              <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Date of Birth:</span>{' '}
              {formatDate(data.dob)}
            </p>
          </div>
        </div>

        {/* Billing Address */}
        <div className={`p-4 rounded-lg border ${
          isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center space-x-2 mb-3">
            <MapPin size={20} weight="regular" className="text-tiktok-primary" />
            <h4 className={`font-semibold font-sequel ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Billing Address
            </h4>
          </div>
          <div className="space-y-1">
            <p className={`text-sm font-sequel ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
              {data.billingAddress.line1}
            </p>
            {data.billingAddress.line2 && (
              <p className={`text-sm font-sequel ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                {data.billingAddress.line2}
              </p>
            )}
            <p className={`text-sm font-sequel ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
              {data.billingAddress.city}, {data.billingAddress.state} {data.billingAddress.postalCode}
            </p>
            <p className={`text-sm font-sequel ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
              {data.billingAddress.country === 'NG' ? 'Nigeria' : data.billingAddress.country}
            </p>
          </div>
        </div>

        {/* Identity */}
        <div className={`p-4 rounded-lg border ${
          isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center space-x-2 mb-3">
            <ShieldCheck size={20} weight="regular" className="text-tiktok-primary" />
            <h4 className={`font-semibold font-sequel ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Identity Verification
            </h4>
          </div>
          <div className="space-y-1">
            <p className={`text-sm font-sequel ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
              <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Type:</span>{' '}
              {data.identity.identityType}
            </p>
            <p className={`text-sm font-sequel ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
              <span className={isDark ? 'text-white/60' : 'text-gray-600'}>Number:</span>{' '}
              {maskIdentity(data.identity.identityNumber)}
            </p>
          </div>
        </div>
      </div>

      <div className={`p-4 rounded-lg border ${
        isDark ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200'
      }`}>
        <div className="flex items-start space-x-2">
          <CheckCircle size={20} weight="regular" className={
            isDark ? 'text-green-400' : 'text-green-600'
          } />
          <p className={`text-sm font-sequel ${isDark ? 'text-green-300/80' : 'text-green-700'}`}>
            By submitting, you confirm that all information provided is accurate and belongs to you.
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3 pt-4">
        <button
          onClick={onBack}
          className={`flex-1 px-4 py-3 rounded-lg border font-sequel transition-colors ${
            isDark
              ? 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
          }`}
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 px-4 py-3 bg-tiktok-primary text-white rounded-lg hover:bg-tiktok-primary/90 transition-colors font-sequel flex items-center justify-center space-x-2"
        >
          <CheckCircle size={18} weight="regular" />
          <span>Submit & Complete</span>
        </button>
      </div>
    </div>
  )
}

