'use client'

import { useState, useEffect } from 'react'
import { X, ArrowDownRight, Clock, CheckCircle, XCircle, Eye } from '@phosphor-icons/react'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'
import { Payout } from './types'

interface PayoutHistoryViewProps {
  theme: 'light' | 'dark'
  onClose: () => void
}

export function PayoutHistoryView({ theme, onClose }: PayoutHistoryViewProps) {
  const toast = useToast()
  const isDark = theme === 'dark'
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null)
  const limit = 10

  useEffect(() => {
    fetchPayoutHistory()
  }, [currentPage])

  const fetchPayoutHistory = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.user.getPayoutHistory({
        page: currentPage,
        limit,
      })
      if (response.success && response.data) {
        const data = response.data as any
        setPayouts(Array.isArray(data.payouts) ? data.payouts : [])
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1)
          setTotalItems(data.pagination.totalItems || 0)
        } else {
          setTotalPages(1)
          setTotalItems(data.payouts?.length || 0)
        }
        setError(null)
      } else {
        const errorMsg = response.message || 'Failed to load payout history'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const errorMsg = error.message || 'Failed to load payout history'
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} weight="regular" className="text-green-500" />
      case 'pending':
      case 'processing':
        return <Clock size={20} weight="regular" className="text-yellow-500" />
      case 'rejected':
        return <XCircle size={20} weight="regular" className="text-red-500" />
      default:
        return <Clock size={20} weight="regular" className="text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return isDark ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-green-50 border-green-200 text-green-700'
      case 'pending':
      case 'processing':
        return isDark ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' : 'bg-yellow-50 border-yellow-200 text-yellow-700'
      case 'rejected':
        return isDark ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-red-50 border-red-200 text-red-700'
      default:
        return isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <>
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`font-monument font-bold text-xl ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Payout History</h2>
          <button
            onClick={onClose}
            className={`${isDark ? 'text-white/80' : 'text-gray-700'}`}
          >
            <X size={24} weight="regular" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`mb-4 p-3 rounded-lg ${
            isDark 
              ? 'bg-red-500/20 border border-red-500/50' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`text-sm font-sequel ${
              isDark ? 'text-red-300' : 'text-red-600'
            }`}>{error}</p>
            <button
              onClick={fetchPayoutHistory}
              className="mt-2 text-sm text-tiktok-primary hover:underline font-sequel"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-tiktok-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : payouts.length === 0 ? (
          <div className={`rounded-xl p-8 text-center border ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
          }`}>
            <ArrowDownRight size={48} weight="regular" className={`mx-auto mb-4 ${
              isDark ? 'text-white/40' : 'text-gray-400'
            }`} />
            <p className={`font-sequel ${
              isDark ? 'text-white/60' : 'text-gray-600'
            }`}>No payout requests yet</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {payouts.map((payout) => (
                <div
                  key={payout.id}
                  className={`rounded-xl p-4 border ${
                    isDark 
                      ? 'bg-white/5 border-white/10' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusIcon(payout.status)}
                        <div className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-sequel ${
                          getStatusColor(payout.status)
                        }`}>
                          {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className={`text-sm font-semibold font-sequel ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          ${payout.amount.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })} USD
                        </p>
                        <p className={`text-sm font-sequel ${
                          isDark ? 'text-white/70' : 'text-gray-700'
                        }`}>
                          ₦{payout.netAmount.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })} NGN (Net)
                        </p>
                        {payout.bankAccount && (
                          <p className={`text-xs font-sequel ${
                            isDark ? 'text-white/50' : 'text-gray-500'
                          }`}>
                            {payout.bankAccount.bankName} • {payout.bankAccount.accountNumber}
                          </p>
                        )}
                        <p className={`text-xs font-sequel ${
                          isDark ? 'text-white/50' : 'text-gray-500'
                        }`}>
                          Requested: {formatDate(payout.requestedAt)}
                        </p>
                        {payout.rejectionReason && (
                          <p className={`text-xs font-sequel mt-1 ${
                            isDark ? 'text-red-300' : 'text-red-600'
                          }`}>
                            Reason: {payout.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedPayout(payout)}
                      className={`p-2 rounded-lg transition-colors ml-4 ${
                        isDark
                          ? 'text-white/70 hover:text-white hover:bg-white/10'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                      title="View Details"
                    >
                      <Eye size={18} weight="regular" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-sequel text-sm transition-colors ${
                    currentPage === 1
                      ? 'opacity-50 cursor-not-allowed'
                      : isDark
                      ? 'bg-white/5 text-white/70 hover:bg-white/10'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Previous
                </button>
                <span className={`px-4 py-2 font-sequel text-sm ${
                  isDark ? 'text-white/70' : 'text-gray-600'
                }`}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-sequel text-sm transition-colors ${
                    currentPage === totalPages
                      ? 'opacity-50 cursor-not-allowed'
                      : isDark
                      ? 'bg-white/5 text-white/70 hover:bg-white/10'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Payout Detail Modal */}
      {selectedPayout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl border ${
            isDark 
              ? 'bg-black border-white/20' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className={`font-monument font-bold text-lg ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Payout Details</h3>
              <button
                onClick={() => setSelectedPayout(null)}
                className={`${isDark ? 'text-white/80' : 'text-gray-700'}`}
              >
                <X size={24} weight="regular" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className={`p-4 rounded-lg border ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="space-y-2 text-sm font-sequel">
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-white/70' : 'text-gray-600'}>Amount (USD):</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>
                      ${selectedPayout.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-white/70' : 'text-gray-600'}>Amount (NGN):</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>
                      ₦{selectedPayout.amountInNgn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-white/70' : 'text-gray-600'}>Processing Fee:</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>
                      ₦{selectedPayout.processingFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className={`flex justify-between pt-2 border-t ${
                    isDark ? 'border-white/10' : 'border-gray-200'
                  }`}>
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Net Amount:</span>
                    <span className={`font-bold ${isDark ? 'text-tiktok-primary' : 'text-tiktok-primary'}`}>
                      ₦{selectedPayout.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
              {selectedPayout.bankAccount && (
                <div className={`p-4 rounded-lg border ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                }`}>
                  <p className={`text-sm font-semibold font-sequel mb-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>Bank Account</p>
                  <div className="space-y-1 text-sm font-sequel">
                    <p className={isDark ? 'text-white/70' : 'text-gray-700'}>
                      {selectedPayout.bankAccount.bankName}
                    </p>
                    <p className={isDark ? 'text-white/70' : 'text-gray-700'}>
                      {selectedPayout.bankAccount.accountNumber}
                    </p>
                    <p className={isDark ? 'text-white/70' : 'text-gray-700'}>
                      {selectedPayout.bankAccount.accountName}
                    </p>
                  </div>
                </div>
              )}
              <div className="space-y-2 text-sm font-sequel">
                <div className="flex justify-between">
                  <span className={isDark ? 'text-white/70' : 'text-gray-600'}>Status:</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>
                    {selectedPayout.status.charAt(0).toUpperCase() + selectedPayout.status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-white/70' : 'text-gray-600'}>Requested:</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>
                    {formatDate(selectedPayout.requestedAt)}
                  </span>
                </div>
                {selectedPayout.completedAt && (
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-white/70' : 'text-gray-600'}>Completed:</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>
                      {formatDate(selectedPayout.completedAt)}
                    </span>
                  </div>
                )}
                {selectedPayout.rejectionReason && (
                  <div className={`p-3 rounded-lg mt-2 ${
                    isDark ? 'bg-red-500/10 border border-red-500/30' : 'bg-red-50 border border-red-200'
                  }`}>
                    <p className={`text-sm font-sequel ${
                      isDark ? 'text-red-300' : 'text-red-600'
                    }`}>
                      <strong>Rejection Reason:</strong> {selectedPayout.rejectionReason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

