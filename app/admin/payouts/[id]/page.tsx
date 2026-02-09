'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ArrowDownRight, CheckCircle, XCircle, Clock, User, Envelope, Phone, Wallet, Bank, Info } from '@phosphor-icons/react'
import { useAdminTheme } from '../../hooks/useTheme'
import { getThemeClasses } from '../../utils/theme'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'
import { ProcessPayoutModal } from '../components/ProcessPayoutModal'
import { RejectPayoutModal } from '../components/RejectPayoutModal'

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

export default function PayoutDetailPage() {
  const params = useParams()
  const router = useRouter()
  const payoutId = params.id as string
  const isDark = useAdminTheme()
  const theme = getThemeClasses(isDark)
  const toast = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [payout, setPayout] = useState<Payout | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showProcessModal, setShowProcessModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [transferStatus, setTransferStatus] = useState<any>(null)
  const [loadingTransferStatus, setLoadingTransferStatus] = useState(false)

  useEffect(() => {
    if (payoutId) {
      fetchPayoutDetails()
    }
  }, [payoutId])

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
        if (error.status === 404) {
          router.push('/admin/payouts')
        }
      } else {
        const errorMsg = 'An unexpected error occurred'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleProcess = async (id: string, data?: { transactionReference?: string; notes?: string }) => {
    try {
      const response = await api.admin.processPayout(id, data)
      if (response.success) {
        toast.success(response.message || 'Payout processed successfully')
        setShowProcessModal(false)
        fetchPayoutDetails()
      } else {
        toast.error(response.message || 'Failed to process payout')
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message || 'Failed to process payout')
      } else {
        toast.error('An unexpected error occurred')
      }
      throw error
    }
  }

  const handleCompleteManual = async (id: string, data: { transactionReference: string; notes?: string }) => {
    try {
      const response = await api.admin.completePayoutManual(id, data)
      if (response.success) {
        toast.success(response.message || 'Payout completed manually')
        setShowProcessModal(false)
        fetchPayoutDetails()
      } else {
        toast.error(response.message || 'Failed to complete payout manually')
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message || 'Failed to complete payout manually')
      } else {
        toast.error('An unexpected error occurred')
      }
      throw error
    }
  }

  const handleReject = async (id: string, rejectionReason: string) => {
    try {
      const response = await api.admin.rejectPayout(id, rejectionReason)
      if (response.success) {
        toast.success(response.message || 'Payout rejected successfully')
        setShowRejectModal(false)
        fetchPayoutDetails()
      } else {
        toast.error(response.message || 'Failed to reject payout')
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message || 'Failed to reject payout')
      } else {
        toast.error('An unexpected error occurred')
      }
    }
  }

  const handleCheckTransferStatus = async () => {
    if (!payout?.transactionReference) return
    setLoadingTransferStatus(true)
    setTransferStatus(null)
    try {
      const response = await api.admin.getPayoutTransferStatus(payout.transactionReference)
      if (response.success && response.data) {
        setTransferStatus(response.data)
      } else {
        toast.error(response.message || 'Failed to get transfer status')
      }
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message || 'Failed to get transfer status')
      } else {
        toast.error('Failed to get transfer status')
      }
    } finally {
      setLoadingTransferStatus(false)
    }
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return isDark ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-50 text-green-700 border-green-200'
      case 'processing':
        return isDark ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-200'
      case 'rejected':
        return isDark ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-50 text-red-700 border-red-200'
      case 'pending':
      default:
        return isDark ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-tiktok-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={isDark ? 'text-white/60' : 'text-gray-600'}>Loading payout details...</p>
        </div>
      </div>
    )
  }

  if (error || !payout) {
    return (
      <div>
        <button
          onClick={() => router.back()}
          className={`flex items-center space-x-2 mb-4 font-sequel transition-colors ${
            isDark ? 'text-white/80 hover:text-white' : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          <ArrowLeft size={20} weight="regular" />
          <span>Back</span>
        </button>
        <div className={`p-6 rounded-xl border ${
          isDark 
            ? 'bg-red-500/20 border-red-500/50' 
            : 'bg-red-50 border-red-200'
        }`}>
          <p className={`font-sequel ${isDark ? 'text-red-300' : 'text-red-600'}`}>
            {error || 'Payout not found'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className={`flex items-center space-x-2 mb-4 font-sequel transition-colors ${
            isDark ? 'text-white/80 hover:text-white' : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          <ArrowLeft size={20} weight="regular" />
          <span>Back</span>
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`font-monument font-bold text-2xl mb-2 ${theme.text.primary}`}>
              Payout Details
            </h2>
            <p className={`font-sequel ${theme.text.secondary}`}>
              View and manage payout request
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {payout.status === 'pending' && (
              <>
                <button
                  onClick={() => setShowProcessModal(true)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border font-sequel transition-colors ${
                    isDark
                      ? 'bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30'
                      : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                  }`}
                >
                  <CheckCircle size={18} weight="regular" />
                  <span>Process</span>
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border font-sequel transition-colors ${
                    isDark
                      ? 'bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30'
                      : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                  }`}
                >
                  <XCircle size={18} weight="regular" />
                  <span>Reject</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Payout Info Card */}
      <div className={`mb-6 p-6 rounded-xl border ${theme.bg.card} ${theme.border.default}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isDark ? 'bg-tiktok-primary/20' : 'bg-tiktok-primary/10'
            }`}>
              <ArrowDownRight size={24} weight="regular" className="text-tiktok-primary" />
            </div>
            <div>
              <h3 className={`font-monument font-bold text-lg ${theme.text.primary}`}>
                ${payout.amount.toFixed(2)} USD
              </h3>
              <p className={`text-sm font-sequel ${theme.text.secondary}`}>
                Payout Request #{payout.id.slice(0, 8)}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-lg border text-sm font-semibold font-sequel ${getStatusColor(payout.status)}`}>
            {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Amount Details */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
            <h4 className={`font-semibold mb-3 font-sequel ${theme.text.primary}`}>Amount Details</h4>
            <div className="space-y-2 text-sm font-sequel">
              <div className="flex justify-between">
                <span className={theme.text.secondary}>Amount (USD):</span>
                <span className={theme.text.primary}>${payout.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className={theme.text.secondary}>Amount (NGN):</span>
                <span className={theme.text.primary}>₦{payout.amountInNgn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className={theme.text.secondary}>Processing Fee:</span>
                <span className={theme.text.primary}>₦{payout.processingFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/10">
                <span className={`font-semibold ${theme.text.primary}`}>Net Amount:</span>
                <span className={`font-bold text-tiktok-primary`}>₦{payout.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Bank Account Details */}
          <div className={`p-4 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
            <h4 className={`font-semibold mb-3 font-sequel ${theme.text.primary}`}>Bank Account</h4>
            <div className="space-y-2 text-sm font-sequel">
              <div className="flex items-center space-x-2">
                <Bank size={16} weight="regular" className={theme.text.secondary} />
                <span className={theme.text.primary}>{payout.bankAccount.bankName}</span>
              </div>
              <div>
                <span className={theme.text.secondary}>Account Name:</span>
                <span className={`ml-2 ${theme.text.primary}`}>{payout.bankAccount.accountName}</span>
              </div>
              <div>
                <span className={theme.text.secondary}>Account Number:</span>
                <span className={`ml-2 ${theme.text.primary}`}>{payout.bankAccount.accountNumber}</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Info */}
        {payout.user && (
          <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
            <h4 className={`font-semibold mb-3 font-sequel ${theme.text.primary}`}>User Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-sequel">
              <div className="flex items-center space-x-2">
                <User size={16} weight="regular" className={theme.text.secondary} />
                <span className={theme.text.secondary}>Name:</span>
                <span className={theme.text.primary}>
                  {payout.user.firstName && payout.user.lastName
                    ? `${payout.user.firstName} ${payout.user.lastName}`
                    : 'N/A'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Envelope size={16} weight="regular" className={theme.text.secondary} />
                <span className={theme.text.secondary}>Email:</span>
                <span className={theme.text.primary}>{payout.user.email}</span>
              </div>
              {payout.user.phone && (
                <div className="flex items-center space-x-2">
                  <Phone size={16} weight="regular" className={theme.text.secondary} />
                  <span className={theme.text.secondary}>Phone:</span>
                  <span className={theme.text.primary}>{payout.user.phone}</span>
                </div>
              )}
              {payout.user.balance !== undefined && (
                <div className="flex items-center space-x-2">
                  <Wallet size={16} weight="regular" className={theme.text.secondary} />
                  <span className={theme.text.secondary}>Balance:</span>
                  <span className={theme.text.primary}>${payout.user.balance.toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className="mt-4">
              <button
                onClick={() => router.push(`/admin/users/${payout.userId}`)}
                className={`text-sm font-sequel text-tiktok-primary hover:underline`}
              >
                View User Profile →
              </button>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
          <h4 className={`font-semibold mb-3 font-sequel ${theme.text.primary}`}>Timeline</h4>
          <div className="space-y-3 text-sm font-sequel">
            <div className="flex items-center space-x-3">
              <Clock size={16} weight="regular" className={theme.text.secondary} />
              <div>
                <span className={theme.text.secondary}>Requested:</span>
                <span className={`ml-2 ${theme.text.primary}`}>{formatDate(payout.requestedAt)}</span>
              </div>
            </div>
            {payout.processedAt && (
              <div className="flex items-center space-x-3">
                <CheckCircle size={16} weight="regular" className="text-blue-400" />
                <div>
                  <span className={theme.text.secondary}>Processed:</span>
                  <span className={`ml-2 ${theme.text.primary}`}>{formatDate(payout.processedAt)}</span>
                </div>
              </div>
            )}
            {payout.completedAt && (
              <div className="flex items-center space-x-3">
                <CheckCircle size={16} weight="fill" className="text-green-400" />
                <div>
                  <span className={theme.text.secondary}>Completed:</span>
                  <span className={`ml-2 ${theme.text.primary}`}>{formatDate(payout.completedAt)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Transaction Reference, Transfer Status & Notes */}
        {(payout.transactionReference || payout.notes) && (
          <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
            <h4 className={`font-semibold mb-3 font-sequel ${theme.text.primary}`}>Additional Information</h4>
            <div className="space-y-2 text-sm font-sequel">
              {payout.transactionReference && (
                <div>
                  <span className={theme.text.secondary}>Transaction Reference:</span>
                  <span className={`ml-2 ${theme.text.primary}`}>{payout.transactionReference}</span>
                </div>
              )}
              {payout.notes && (
                <div>
                  <span className={theme.text.secondary}>Notes:</span>
                  <p className={`mt-1 ${theme.text.primary}`}>{payout.notes}</p>
                </div>
              )}
            </div>
            {/* Check transfer status (reconciliation) - for completed payouts with Sudo transfer ID */}
            {payout.status === 'completed' && payout.transactionReference && (
              <div className={`mt-4 pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <Info size={16} weight="regular" className={theme.text.secondary} />
                  <span className={`text-sm font-sequel ${theme.text.secondary}`}>Transfer status (reconciliation)</span>
                </div>
                <button
                  type="button"
                  onClick={handleCheckTransferStatus}
                  disabled={loadingTransferStatus}
                  className={`text-sm font-sequel px-3 py-1.5 rounded-lg border transition-colors ${
                    isDark
                      ? 'border-white/20 text-tiktok-primary hover:bg-white/5'
                      : 'border-gray-300 text-blue-600 hover:bg-gray-100'
                  } disabled:opacity-50`}
                >
                  {loadingTransferStatus ? 'Loading...' : 'Check transfer status'}
                </button>
                {transferStatus && (
                  <div className={`mt-3 p-3 rounded-lg text-xs font-sequel ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                    <pre className="whitespace-pre-wrap break-all overflow-x-auto">
                      {JSON.stringify(transferStatus, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Rejection Reason */}
        {payout.rejectionReason && (
          <div className={`mt-6 p-4 rounded-lg border ${
            isDark 
              ? 'bg-red-500/20 border-red-500/50' 
              : 'bg-red-50 border-red-200'
          }`}>
            <h4 className={`font-semibold mb-2 font-sequel ${
              isDark ? 'text-red-300' : 'text-red-700'
            }`}>Rejection Reason</h4>
            <p className={`text-sm font-sequel ${
              isDark ? 'text-red-300/80' : 'text-red-700'
            }`}>{payout.rejectionReason}</p>
          </div>
        )}
      </div>

      {/* Process Modal */}
      {payout && (
        <ProcessPayoutModal
          isOpen={showProcessModal}
          onClose={() => setShowProcessModal(false)}
          payout={payout}
          onProcess={handleProcess}
          onCompleteManual={handleCompleteManual}
        />
      )}

      {/* Reject Modal */}
      {payout && (
        <RejectPayoutModal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          payout={payout}
          onReject={handleReject}
        />
      )}
    </div>
  )
}

