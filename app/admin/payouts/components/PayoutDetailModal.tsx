'use client'

import { useState, useEffect } from 'react'
import { X, ArrowDownRight, CheckCircle, XCircle, Clock, User, Envelope, Phone, Wallet, Bank } from '@phosphor-icons/react'
import { useAdminTheme } from '../../hooks/useTheme'
import { getThemeClasses } from '../../utils/theme'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'

interface PayoutUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  balance?: number
}

interface BankAccount {
  accountNumber: string
  accountName: string
  bankName: string
  bankCode: string
}

interface Payout {
  id: string
  userId: string
  user: PayoutUser | null
  amount: number
  amountInNgn: number
  processingFee: number
  netAmount: number
  bankAccount: BankAccount
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  requestedAt: string
  processedAt?: string | null
  completedAt?: string | null
  processedBy?: string | null
  transactionReference?: string | null
  rejectionReason?: string | null
  notes?: string | null
}

interface PayoutDetailModalProps {
  isOpen: boolean
  onClose: () => void
  payoutId: string
  initialPayout?: Payout | null
  onProcess: () => void
  onReject: () => void
}

export function PayoutDetailModal({
  isOpen,
  onClose,
  payoutId,
  initialPayout,
  onProcess,
  onReject,
}: PayoutDetailModalProps) {
  const isDark = useAdminTheme()
  const theme = getThemeClasses(isDark)
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [payout, setPayout] = useState<Payout | null>(initialPayout || null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && payoutId) {
      // Set initial payout if provided
      if (initialPayout) {
        setPayout(initialPayout)
        setIsLoading(false)
      }
      fetchPayoutDetails()
    }
  }, [isOpen, payoutId, initialPayout])

  const fetchPayoutDetails = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.admin.getPayout(payoutId)
      if (response.success && response.data) {
        setPayout(response.data as Payout)
        setError(null)
      } else {
        const errorMsg = response.message || 'Failed to load payout details'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const errorMsg = error.message || 'Failed to load payout details'
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border ${
        isDark ? 'bg-black border-white/10' : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className={`sticky top-0 flex items-center justify-between p-6 border-b ${
          isDark ? 'border-white/10 bg-black' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-tiktok-primary/20 rounded-full flex items-center justify-center">
              <ArrowDownRight size={20} weight="regular" className="text-tiktok-primary" />
            </div>
            <h2 className={`font-monument font-bold text-xl ${theme.text.primary}`}>
              Payout Details
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
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-tiktok-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className={`p-4 rounded-xl ${
              isDark 
                ? 'bg-red-500/20 border border-red-500/50' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`text-sm font-sequel ${
                isDark ? 'text-red-300' : 'text-red-600'
              }`}>{error}</p>
            </div>
          ) : payout ? (
            <>
              {/* Status */}
              <div className={`p-4 rounded-xl border ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {payout.status === 'pending' && (
                      <Clock size={24} weight="regular" className="text-yellow-400" />
                    )}
                    {payout.status === 'processing' && (
                      <Clock size={24} weight="regular" className="text-blue-400" />
                    )}
                    {payout.status === 'completed' && (
                      <CheckCircle size={24} weight="regular" className="text-green-400" />
                    )}
                    {payout.status === 'rejected' && (
                      <XCircle size={24} weight="regular" className="text-red-400" />
                    )}
                    <div>
                      <p className={`text-sm font-sequel ${theme.text.secondary}`}>Status</p>
                      <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                        {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                      </p>
                    </div>
                  </div>
                  {payout.status === 'pending' && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={onProcess}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
                      >
                        <CheckCircle size={18} weight="regular" />
                        <span className="text-sm font-sequel">Process</span>
                      </button>
                      <button
                        onClick={onReject}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                      >
                        <XCircle size={18} weight="regular" />
                        <span className="text-sm font-sequel">Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* User Information */}
              <div>
                <h3 className={`font-monument font-bold text-lg mb-4 ${theme.text.primary}`}>
                  User Information
                </h3>
                <div className={`p-4 rounded-xl border space-y-3 ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <User size={20} weight="regular" className={theme.icon.default} />
                    <div>
                      <p className={`text-sm font-sequel ${theme.text.secondary}`}>Name</p>
                      <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                        {payout.user?.firstName && payout.user?.lastName
                          ? `${payout.user.firstName} ${payout.user.lastName}`
                          : payout.user?.email
                          ? payout.user.email.split('@')[0]
                          : 'Unknown User'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Envelope size={20} weight="regular" className={theme.icon.default} />
                    <div>
                      <p className={`text-sm font-sequel ${theme.text.secondary}`}>Email</p>
                      <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                        {payout.user?.email || payout.userId || 'N/A'}
                      </p>
                    </div>
                  </div>
                  {payout.user?.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone size={20} weight="regular" className={theme.icon.default} />
                      <div>
                        <p className={`text-sm font-sequel ${theme.text.secondary}`}>Phone</p>
                        <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                          {payout.user.phone}
                        </p>
                      </div>
                    </div>
                  )}
                  {payout.user?.balance !== undefined && (
                    <div className="flex items-center space-x-3">
                      <Wallet size={20} weight="regular" className={theme.icon.default} />
                      <div>
                        <p className={`text-sm font-sequel ${theme.text.secondary}`}>Balance</p>
                        <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                          ${payout.user.balance.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payout Amount */}
              <div>
                <h3 className={`font-monument font-bold text-lg mb-4 ${theme.text.primary}`}>
                  Payout Amount
                </h3>
                <div className={`p-4 rounded-xl border space-y-3 ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-sequel ${theme.text.secondary}`}>Amount (USD)</p>
                    <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                      ${payout.amount.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-sequel ${theme.text.secondary}`}>Amount (NGN)</p>
                    <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                      ₦{payout.amountInNgn.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-sequel ${theme.text.secondary}`}>Processing Fee</p>
                    <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                      ${payout.processingFee.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  <div className={`pt-3 border-t ${
                    isDark ? 'border-white/10' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-semibold font-sequel ${theme.text.primary}`}>Net Amount</p>
                      <p className={`font-bold font-sequel text-lg ${theme.text.primary}`}>
                        ₦{payout.netAmount.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bank Account */}
              <div>
                <h3 className={`font-monument font-bold text-lg mb-4 ${theme.text.primary}`}>
                  Bank Account
                </h3>
                <div className={`p-4 rounded-xl border space-y-3 ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <Bank size={20} weight="regular" className={theme.icon.default} />
                    <div className="flex-1">
                      <p className={`text-sm font-sequel ${theme.text.secondary}`}>Bank Name</p>
                      <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                        {payout.bankAccount.bankName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <User size={20} weight="regular" className={theme.icon.default} />
                    <div className="flex-1">
                      <p className={`text-sm font-sequel ${theme.text.secondary}`}>Account Name</p>
                      <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                        {payout.bankAccount.accountName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Wallet size={20} weight="regular" className={theme.icon.default} />
                    <div className="flex-1">
                      <p className={`text-sm font-sequel ${theme.text.secondary}`}>Account Number</p>
                      <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                        {payout.bankAccount.accountNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Bank size={20} weight="regular" className={theme.icon.default} />
                    <div className="flex-1">
                      <p className={`text-sm font-sequel ${theme.text.secondary}`}>Bank Code</p>
                      <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                        {payout.bankAccount.bankCode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div>
                <h3 className={`font-monument font-bold text-lg mb-4 ${theme.text.primary}`}>
                  Timeline
                </h3>
                <div className={`p-4 rounded-xl border space-y-3 ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div>
                    <p className={`text-sm font-sequel ${theme.text.secondary}`}>Requested At</p>
                    <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                      {new Date(payout.requestedAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {payout.processedAt && (
                    <div>
                      <p className={`text-sm font-sequel ${theme.text.secondary}`}>Processed At</p>
                      <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                        {new Date(payout.processedAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  )}
                  {payout.completedAt && (
                    <div>
                      <p className={`text-sm font-sequel ${theme.text.secondary}`}>Completed At</p>
                      <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                        {new Date(payout.completedAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Transaction Reference */}
              {payout.transactionReference && (
                <div>
                  <h3 className={`font-monument font-bold text-lg mb-4 ${theme.text.primary}`}>
                    Transaction Reference
                  </h3>
                  <div className={`p-4 rounded-xl border ${
                    isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                      {payout.transactionReference}
                    </p>
                  </div>
                </div>
              )}

              {/* Notes */}
              {payout.notes && (
                <div>
                  <h3 className={`font-monument font-bold text-lg mb-4 ${theme.text.primary}`}>
                    Notes
                  </h3>
                  <div className={`p-4 rounded-xl border ${
                    isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <p className={`font-sequel ${theme.text.primary}`}>
                      {payout.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Rejection Reason */}
              {payout.rejectionReason && (
                <div>
                  <h3 className={`font-monument font-bold text-lg mb-4 text-red-400`}>
                    Rejection Reason
                  </h3>
                  <div className={`p-4 rounded-xl border ${
                    isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'
                  }`}>
                    <p className={`font-sequel ${
                      isDark ? 'text-red-300' : 'text-red-600'
                    }`}>
                      {payout.rejectionReason}
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

