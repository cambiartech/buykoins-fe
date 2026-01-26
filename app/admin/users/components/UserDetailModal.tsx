'use client'

import { useState, useEffect } from 'react'
import { X, User, Envelope, Phone, Wallet, Calendar, CheckCircle, Clock, Shield } from '@phosphor-icons/react'
import { useTheme } from '../../context/ThemeContext'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'

interface UserDetail {
  id: string
  email: string
  firstName?: string
  lastName?: string
  username?: string
  phone?: string
  balance: number
  status: 'active' | 'suspended' | 'frozen'
  onboardingStatus: 'pending' | 'completed'
  emailVerified: boolean
  walletStatus: 'active' | 'frozen'
  joinedAt: string
  createdAt: string
  updatedAt?: string
  onboardingRequest?: {
    id: string
    message: string
    status: string
    submittedAt: string
    completedAt: string | null
    notes: string | null
  } | null
}

interface UserDetailModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  onCompleteOnboarding: () => void
}

export function UserDetailModal({
  isOpen,
  onClose,
  userId,
  onCompleteOnboarding,
}: UserDetailModalProps) {
  const { isDark } = useTheme()
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<UserDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetails()
    }
  }, [isOpen, userId])

  const fetchUserDetails = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.admin.getUser(userId)
      if (response.success && response.data) {
        setUser(response.data as any)
        setError(null)
      } else {
        const errorMsg = response.message || 'Failed to load user details'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const errorMsg = error.message || 'Failed to load user details'
        setError(errorMsg)
        toast.error(errorMsg)
      } else {
        const errorMsg = 'An unexpected error occurred'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-2xl rounded-2xl border max-h-[90vh] overflow-y-auto ${
        isDark 
          ? 'bg-black border-white/20' 
          : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-inherit">
          <h3 className={`font-monument font-bold text-xl ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>User Details</h3>
          <button
            onClick={onClose}
            className={`${isDark ? 'text-white/80' : 'text-gray-700'}`}
          >
            <X size={24} weight="regular" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-tiktok-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className={`p-4 rounded-xl ${
              isDark 
                ? 'bg-red-500/20 border border-red-500/50' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`text-sm font-sequel ${
                isDark ? 'text-red-300' : 'text-red-600'
              }`}>{error}</p>
              <button
                onClick={fetchUserDetails}
                className="mt-2 text-sm text-tiktok-primary hover:underline font-sequel"
              >
                Retry
              </button>
            </div>
          </div>
        ) : user ? (
          <div className="p-6 space-y-6">
            {/* User Information */}
            <div>
              <h4 className={`font-monument font-bold text-lg mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>User Information</h4>
              <div className={`space-y-3 p-4 rounded-xl border ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <User size={20} weight="regular" className={isDark ? 'text-white/60' : 'text-gray-600'} />
                  <div>
                    <p className={`text-sm font-sequel ${
                      isDark ? 'text-white/60' : 'text-gray-600'
                    }`}>Name</p>
                    <p className={`font-semibold font-sequel ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.username || 'Not provided'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Envelope size={20} weight="regular" className={isDark ? 'text-white/60' : 'text-gray-600'} />
                  <div>
                    <p className={`text-sm font-sequel ${
                      isDark ? 'text-white/60' : 'text-gray-600'
                    }`}>Email</p>
                    <p className={`font-semibold font-sequel ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>{user.email}</p>
                    {user.emailVerified && (
                      <span className={`inline-flex items-center space-x-1 mt-1 text-xs font-sequel ${
                        isDark ? 'text-green-400' : 'text-green-600'
                      }`}>
                        <CheckCircle size={12} weight="regular" />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>
                </div>
                {user.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone size={20} weight="regular" className={isDark ? 'text-white/60' : 'text-gray-600'} />
                    <div>
                      <p className={`text-sm font-sequel ${
                        isDark ? 'text-white/60' : 'text-gray-600'
                      }`}>Phone</p>
                      <p className={`font-semibold font-sequel ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>{user.phone}</p>
                    </div>
                  </div>
                )}
                {user.username && (
                  <div className="flex items-center space-x-3">
                    <User size={20} weight="regular" className={isDark ? 'text-white/60' : 'text-gray-600'} />
                    <div>
                      <p className={`text-sm font-sequel ${
                        isDark ? 'text-white/60' : 'text-gray-600'
                      }`}>Username</p>
                      <p className={`font-semibold font-sequel ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>@{user.username}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <Wallet size={20} weight="regular" className={isDark ? 'text-white/60' : 'text-gray-600'} />
                  <div>
                    <p className={`text-sm font-sequel ${
                      isDark ? 'text-white/60' : 'text-gray-600'
                    }`}>Balance</p>
                    <p className={`font-semibold font-sequel ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      ${user.balance.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Information */}
            <div>
              <h4 className={`font-monument font-bold text-lg mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Status Information</h4>
              <div className={`space-y-3 p-4 rounded-xl border ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Shield size={20} weight="regular" className={isDark ? 'text-white/60' : 'text-gray-600'} />
                    <div>
                      <p className={`text-sm font-sequel ${
                        isDark ? 'text-white/60' : 'text-gray-600'
                      }`}>Account Status</p>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-sequel mt-1 ${
                        user.status === 'active'
                          ? isDark ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-green-50 border-green-200 text-green-700'
                          : user.status === 'suspended'
                          ? isDark ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-red-50 border-red-200 text-red-700'
                          : isDark ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                      } border`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {user.onboardingStatus === 'pending' ? (
                      <Clock size={20} weight="regular" className={isDark ? 'text-yellow-400' : 'text-yellow-600'} />
                    ) : (
                      <CheckCircle size={20} weight="regular" className={isDark ? 'text-green-400' : 'text-green-600'} />
                    )}
                    <div>
                      <p className={`text-sm font-sequel ${
                        isDark ? 'text-white/60' : 'text-gray-600'
                      }`}>Onboarding Status</p>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-sequel mt-1 ${
                        user.onboardingStatus === 'completed'
                          ? isDark ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-green-50 border-green-200 text-green-700'
                          : isDark ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                      } border`}>
                        {user.onboardingStatus.charAt(0).toUpperCase() + user.onboardingStatus.slice(1)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar size={20} weight="regular" className={isDark ? 'text-white/60' : 'text-gray-600'} />
                  <div>
                    <p className={`text-sm font-sequel ${
                      isDark ? 'text-white/60' : 'text-gray-600'
                    }`}>Joined</p>
                    <p className={`font-semibold font-sequel ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>{formatDate(user.joinedAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Onboarding Request */}
            {user.onboardingRequest && (
              <div>
                <h4 className={`font-monument font-bold text-lg mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Onboarding Request</h4>
                <div className={`p-4 rounded-xl border ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                }`}>
                  <p className={`text-sm font-sequel mb-2 ${
                    isDark ? 'text-white/60' : 'text-gray-600'
                  }`}>Message:</p>
                  <p className={`font-sequel mb-4 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>{user.onboardingRequest.message}</p>
                  <p className={`text-xs font-sequel ${
                    isDark ? 'text-white/50' : 'text-gray-500'
                  }`}>
                    Submitted: {formatDate(user.onboardingRequest.submittedAt)}
                  </p>
                  {user.onboardingRequest.notes && (
                    <div className={`mt-4 p-3 rounded-lg ${
                      isDark ? 'bg-white/5' : 'bg-white'
                    }`}>
                      <p className={`text-xs font-sequel mb-1 ${
                        isDark ? 'text-white/60' : 'text-gray-600'
                      }`}>Onboarding Notes:</p>
                      <p className={`text-sm font-sequel ${
                        isDark ? 'text-white/80' : 'text-gray-700'
                      }`}>{user.onboardingRequest.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            {user.onboardingStatus === 'pending' && (
              <div className="flex space-x-3 pt-4 border-t border-white/10">
                <button
                  onClick={onClose}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all font-sequel ${
                    isDark
                      ? 'bg-white/5 text-white/80 hover:bg-white/10'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Close
                </button>
                <button
                  onClick={onCompleteOnboarding}
                  className="flex-1 bg-tiktok-primary text-white py-3 rounded-xl font-semibold hover:bg-tiktok-primary/90 transition-all font-sequel"
                >
                  Complete Onboarding
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}

