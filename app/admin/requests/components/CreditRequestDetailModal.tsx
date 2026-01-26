'use client'

import { useState, useEffect } from 'react'
import { X, User, Envelope, Phone, Wallet, Calendar, FileImage, FilePdf } from '@phosphor-icons/react'
import { useTheme } from '../../context/ThemeContext'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'

interface CreditRequest {
  id: string
  amount: number
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  processedAt: string | null
  rejectionReason: string | null
  proofUrl: string | null
  adminProofUrl?: string | null
  creditMethod?: 'balance' | 'direct'
  notes?: string | null
  user: {
    id: string
    email: string
    firstName?: string
    lastName?: string
    phone?: string
    balance?: number
    onboardingStatus?: 'pending' | 'completed'
  } | null
}

interface CreditRequestDetailModalProps {
  isOpen: boolean
  onClose: () => void
  request: CreditRequest
  onApprove: () => void
  onReject: () => void
}

export function CreditRequestDetailModal({
  isOpen,
  onClose,
  request,
  onApprove,
  onReject,
}: CreditRequestDetailModalProps) {
  const { isDark } = useTheme()
  const toast = useToast()
  const [detailedRequest, setDetailedRequest] = useState<CreditRequest | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && request) {
      fetchDetailedRequest()
    }
  }, [isOpen, request.id])

  const fetchDetailedRequest = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.admin.getCreditRequest(request.id)
      if (response.success && response.data) {
        setDetailedRequest(response.data as any)
        setError(null)
      } else {
        const errorMsg = response.message || 'Failed to load request details'
        setError(errorMsg)
        toast.error(errorMsg)
        // Fallback to provided request if API fails
        setDetailedRequest(request)
      }
    } catch (error) {
      // Fallback to provided request if API fails
      setDetailedRequest(request)
      if (error instanceof ApiError) {
        const errorMsg = error.message || 'Failed to load request details'
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

  const getFileIcon = (url: string | null) => {
    if (!url) return null
    if (url.toLowerCase().includes('.pdf')) {
      return <FilePdf size={20} weight="regular" className={isDark ? 'text-red-400' : 'text-red-600'} />
    }
    return <FileImage size={20} weight="regular" className={isDark ? 'text-blue-400' : 'text-blue-600'} />
  }

  const displayRequest = detailedRequest || request

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
          }`}>Credit Request Details</h3>
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
        ) : (
          <div className="p-6 space-y-6">
            {/* Error Message */}
            {error && (
              <div className={`p-3 rounded-lg ${
                isDark 
                  ? 'bg-red-500/20 border border-red-500/50' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <p className={`text-sm font-sequel ${
                  isDark ? 'text-red-300' : 'text-red-600'
                }`}>{error}</p>
              </div>
            )}
            {/* Amount */}
            <div className={`p-4 rounded-xl border ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
            }`}>
              <p className={`text-sm font-sequel mb-1 ${
                isDark ? 'text-white/60' : 'text-gray-600'
              }`}>Requested Amount</p>
              <p className={`font-monument font-bold text-3xl ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                ${displayRequest.amount.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>

            {/* User Information */}
            {displayRequest.user ? (
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
                        {displayRequest.user.firstName && displayRequest.user.lastName
                          ? `${displayRequest.user.firstName} ${displayRequest.user.lastName}`
                          : 'Not provided'}
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
                      }`}>{displayRequest.user.email}</p>
                    </div>
                  </div>
                  {displayRequest.user.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone size={20} weight="regular" className={isDark ? 'text-white/60' : 'text-gray-600'} />
                      <div>
                        <p className={`text-sm font-sequel ${
                          isDark ? 'text-white/60' : 'text-gray-600'
                        }`}>Phone</p>
                        <p className={`font-semibold font-sequel ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>{displayRequest.user.phone}</p>
                      </div>
                    </div>
                  )}
                  {displayRequest.user.balance !== undefined && (
                    <div className="flex items-center space-x-3">
                      <Wallet size={20} weight="regular" className={isDark ? 'text-white/60' : 'text-gray-600'} />
                      <div>
                        <p className={`text-sm font-sequel ${
                          isDark ? 'text-white/60' : 'text-gray-600'
                        }`}>Current Balance</p>
                        <p className={`font-semibold font-sequel ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          ${displayRequest.user.balance.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <h4 className={`font-monument font-bold text-lg mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>User Information</h4>
                <div className={`p-4 rounded-xl border ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                }`}>
                  <p className={`text-sm font-sequel ${
                    isDark ? 'text-white/60' : 'text-gray-600'
                  }`}>User information not available</p>
                </div>
              </div>
            )}

            {/* Request Information */}
            <div>
              <h4 className={`font-monument font-bold text-lg mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Request Information</h4>
              <div className={`space-y-3 p-4 rounded-xl border ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <Calendar size={20} weight="regular" className={isDark ? 'text-white/60' : 'text-gray-600'} />
                  <div>
                    <p className={`text-sm font-sequel ${
                      isDark ? 'text-white/60' : 'text-gray-600'
                    }`}>Submitted</p>
                    <p className={`font-semibold font-sequel ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>{formatDate(displayRequest.submittedAt)}</p>
                  </div>
                </div>
                {displayRequest.processedAt && (
                  <div className="flex items-center space-x-3">
                    <Calendar size={20} weight="regular" className={isDark ? 'text-white/60' : 'text-gray-600'} />
                    <div>
                      <p className={`text-sm font-sequel ${
                        isDark ? 'text-white/60' : 'text-gray-600'
                      }`}>Processed</p>
                      <p className={`font-semibold font-sequel ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>{formatDate(displayRequest.processedAt)}</p>
                    </div>
                  </div>
                )}
                {displayRequest.rejectionReason && (
                  <div>
                    <p className={`text-sm font-sequel mb-1 ${
                      isDark ? 'text-white/60' : 'text-gray-600'
                    }`}>Rejection Reason</p>
                    <p className={`font-sequel ${
                      isDark ? 'text-red-300' : 'text-red-600'
                    }`}>{displayRequest.rejectionReason}</p>
                  </div>
                )}
                {displayRequest.creditMethod && (
                  <div>
                    <p className={`text-sm font-sequel mb-1 ${
                      isDark ? 'text-white/60' : 'text-gray-600'
                    }`}>Credit Method</p>
                    <p className={`font-sequel ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {displayRequest.creditMethod === 'balance' ? 'Balance Credit' : 'Direct Remittance'}
                    </p>
                  </div>
                )}
                {displayRequest.notes && (
                  <div>
                    <p className={`text-sm font-sequel mb-1 ${
                      isDark ? 'text-white/60' : 'text-gray-600'
                    }`}>Admin Notes</p>
                    <p className={`font-sequel ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>{displayRequest.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* User Proof File */}
            {displayRequest.proofUrl && (
              <div>
                <h4 className={`font-monument font-bold text-lg mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>User's Proof of Earnings</h4>
                <div className={`p-4 rounded-xl border ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center space-x-3 mb-4">
                    {getFileIcon(displayRequest.proofUrl)}
                    <a
                      href={displayRequest.proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-sm font-sequel hover:underline ${
                        isDark ? 'text-tiktok-primary' : 'text-tiktok-primary'
                      }`}
                    >
                      View Proof File
                    </a>
                  </div>
                  {displayRequest.proofUrl.toLowerCase().includes('.jpg') ||
                   displayRequest.proofUrl.toLowerCase().includes('.jpeg') ||
                   displayRequest.proofUrl.toLowerCase().includes('.png') ||
                   displayRequest.proofUrl.toLowerCase().includes('.webp') ? (
                    <img
                      src={displayRequest.proofUrl}
                      alt="Proof of earnings"
                      className="w-full rounded-lg border border-white/10 max-h-96 object-contain"
                    />
                  ) : null}
                </div>
              </div>
            )}

            {/* Admin Proof File */}
            {displayRequest.adminProofUrl && (
              <div>
                <h4 className={`font-monument font-bold text-lg mb-4 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Admin Proof</h4>
                <div className={`p-4 rounded-xl border ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center space-x-3 mb-4">
                    {getFileIcon(displayRequest.adminProofUrl)}
                    <a
                      href={displayRequest.adminProofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-sm font-sequel hover:underline ${
                        isDark ? 'text-tiktok-primary' : 'text-tiktok-primary'
                      }`}
                    >
                      View Admin Proof File
                    </a>
                  </div>
                  {displayRequest.adminProofUrl.toLowerCase().includes('.jpg') ||
                   displayRequest.adminProofUrl.toLowerCase().includes('.jpeg') ||
                   displayRequest.adminProofUrl.toLowerCase().includes('.png') ||
                   displayRequest.adminProofUrl.toLowerCase().includes('.webp') ? (
                    <img
                      src={displayRequest.adminProofUrl}
                      alt="Admin proof"
                      className="w-full rounded-lg border border-white/10 max-h-96 object-contain"
                    />
                  ) : null}
                </div>
              </div>
            )}

            {/* Actions */}
            {displayRequest.status === 'pending' && (
              <div className="flex space-x-3 pt-4 border-t border-white/10">
                <button
                  onClick={onReject}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all font-sequel ${
                    isDark
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      : 'bg-red-50 text-red-600 hover:bg-red-100'
                  }`}
                >
                  Reject
                </button>
                <button
                  onClick={onApprove}
                  className="flex-1 bg-tiktok-primary text-white py-3 rounded-xl font-semibold hover:bg-tiktok-primary/90 transition-all font-sequel"
                >
                  Approve
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

