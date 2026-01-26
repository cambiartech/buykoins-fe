'use client'

import { useState, useEffect } from 'react'
import { X, ArrowUpRight, ArrowDownRight, User, Envelope, Phone, Wallet, CreditCard, Calendar, FileText, CurrencyDollar, ChartBar, Receipt } from '@phosphor-icons/react'
import { useAdminTheme } from '../../hooks/useTheme'
import { getThemeClasses } from '../../utils/theme'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'

interface TransactionUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  username?: string
  balance?: number
}

interface Transaction {
  id: string
  userId: string
  user: TransactionUser | null
  type: 'credit' | 'withdrawal' | 'payout' | 'deposit' | 'card_funding' | 'transfer_earnings_to_wallet' | 'card_purchase'
  amount: number
  currency?: 'USD' | 'NGN' // CRITICAL: Use this field to display correct currency
  amountInNgn?: number | null
  exchangeRate?: number | null
  processingFee?: number | null
  netAmount?: number | null
  status: 'completed' | 'pending' | 'rejected'
  description: string
  referenceId: string
  date: string
  createdAt: string
  updatedAt?: string
}

interface TransactionDetailModalProps {
  isOpen: boolean
  onClose: () => void
  transactionId: string
  initialTransaction?: Transaction | null
}

export function TransactionDetailModal({
  isOpen,
  onClose,
  transactionId,
  initialTransaction,
}: TransactionDetailModalProps) {
  const isDark = useAdminTheme()
  const theme = getThemeClasses(isDark)
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [transaction, setTransaction] = useState<Transaction | null>(initialTransaction || null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && transactionId) {
      // Set initial transaction if provided
      if (initialTransaction) {
        setTransaction(initialTransaction)
        setIsLoading(false)
      }
      fetchTransactionDetails()
    }
  }, [isOpen, transactionId, initialTransaction])

  const fetchTransactionDetails = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.admin.getTransaction(transactionId)
      if (response.success && response.data) {
        setTransaction(response.data as Transaction)
        setError(null)
      } else {
        const errorMsg = response.message || 'Failed to load transaction details'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const errorMsg = error.message || 'Failed to load transaction details'
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

  // Helper function to format currency
  const formatCurrency = (amount: number, currency: 'USD' | 'NGN' | undefined = 'USD') => {
    const symbol = currency === 'NGN' ? '₦' : '$'
    return `${symbol}${Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  const getTransactionIcon = () => {
    if (transaction?.type === 'credit' || transaction?.type === 'deposit') {
      return <ArrowUpRight size={24} weight="regular" className="text-green-400" />
    }
    return <ArrowDownRight size={24} weight="regular" className="text-tiktok-primary" />
  }

  const getStatusColor = () => {
    if (transaction?.status === 'completed') return 'text-green-400'
    if (transaction?.status === 'pending') return 'text-yellow-400'
    return 'text-red-400'
  }

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
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              transaction?.type === 'credit' ? 'bg-green-500/20' : 'bg-tiktok-primary/20'
            }`}>
              {getTransactionIcon()}
            </div>
            <h2 className={`font-monument font-bold text-xl ${theme.text.primary}`}>
              Transaction Details
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
          {isLoading && !transaction ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-tiktok-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error && !transaction ? (
            <div className={`p-4 rounded-xl ${
              isDark 
                ? 'bg-red-500/20 border border-red-500/50' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`text-sm font-sequel ${
                isDark ? 'text-red-300' : 'text-red-600'
              }`}>{error}</p>
            </div>
          ) : transaction ? (
            <>
              {/* Status and Amount */}
              <div className={`p-4 rounded-xl border ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon()}
                    <div>
                      <p className={`text-sm font-sequel ${theme.text.secondary}`}>Status</p>
                      <p className={`font-semibold font-sequel ${getStatusColor()}`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-sequel ${theme.text.secondary}`}>
                      Amount ({transaction.currency || 'USD'})
                    </p>
                    <p className={`font-bold font-sequel text-xl ${
                      transaction.type === 'credit' || transaction.type === 'deposit'
                        ? 'text-green-400'
                        : isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {(transaction.type === 'credit' || transaction.type === 'deposit') ? '+' : '-'}
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </p>
                    {/* Show USD equivalent for NGN transactions */}
                    {transaction.currency === 'NGN' && transaction.amountInNgn && transaction.exchangeRate && (
                      <p className={`text-sm font-sequel mt-1 ${theme.text.secondary}`}>
                        ≈ ${(transaction.amount / transaction.exchangeRate).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    )}
                    {/* Show NGN equivalent for USD transactions */}
                    {transaction.currency === 'USD' && transaction.amountInNgn && (
                      <p className={`text-sm font-sequel mt-1 ${theme.text.secondary}`}>
                        ≈ ₦{transaction.amountInNgn.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    )}
                  </div>
                </div>
                {/* Transaction Type Badge */}
                <div className="pt-3 border-t border-white/10">
                  <div className="flex items-center space-x-2">
                    <CreditCard size={16} weight="regular" className={theme.icon.default} />
                    <span className={`text-sm font-sequel capitalize ${theme.text.secondary}`}>
                      {transaction.type}
                    </span>
                  </div>
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
                        {transaction.user?.firstName && transaction.user?.lastName
                          ? `${transaction.user.firstName} ${transaction.user.lastName}`
                          : transaction.user?.email || transaction.userId || 'Unknown User'}
                      </p>
                    </div>
                  </div>
                  {transaction.user?.email && (
                    <div className="flex items-center space-x-3">
                      <Envelope size={20} weight="regular" className={theme.icon.default} />
                      <div>
                        <p className={`text-sm font-sequel ${theme.text.secondary}`}>Email</p>
                        <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                          {transaction.user.email}
                        </p>
                      </div>
                    </div>
                  )}
                  {transaction.user?.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone size={20} weight="regular" className={theme.icon.default} />
                      <div>
                        <p className={`text-sm font-sequel ${theme.text.secondary}`}>Phone</p>
                        <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                          {transaction.user.phone}
                        </p>
                      </div>
                    </div>
                  )}
                  {transaction.user?.username && (
                    <div className="flex items-center space-x-3">
                      <User size={20} weight="regular" className={theme.icon.default} />
                      <div>
                        <p className={`text-sm font-sequel ${theme.text.secondary}`}>Username</p>
                        <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                          @{transaction.user.username}
                        </p>
                      </div>
                    </div>
                  )}
                  {transaction.user?.balance !== undefined && (
                    <div className="flex items-center space-x-3">
                      <Wallet size={20} weight="regular" className={theme.icon.default} />
                      <div>
                        <p className={`text-sm font-sequel ${theme.text.secondary}`}>Current Earnings</p>
                        <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                          ${transaction.user.balance.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                  {/* Show wallet balance if available */}
                  {(transaction.user as any)?.wallet !== undefined && (
                    <div className="flex items-center space-x-3">
                      <Wallet size={20} weight="regular" className={theme.icon.default} />
                      <div>
                        <p className={`text-sm font-sequel ${theme.text.secondary}`}>Current Wallet</p>
                        <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                          ₦{((transaction.user as any).wallet || 0).toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Transaction Information */}
              <div>
                <h3 className={`font-monument font-bold text-lg mb-4 ${theme.text.primary}`}>
                  Transaction Information
                </h3>
                <div className={`p-4 rounded-xl border space-y-4 ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div>
                    <p className={`text-xs font-semibold font-sequel uppercase tracking-wider mb-2 ${theme.text.secondary}`}>
                      Description
                    </p>
                    <p className={`font-sequel ${theme.text.primary}`}>
                      {transaction.description}
                    </p>
                  </div>
                  {transaction.referenceId && (
                    <div>
                      <p className={`text-xs font-semibold font-sequel uppercase tracking-wider mb-2 ${theme.text.secondary}`}>
                        Reference ID
                      </p>
                      <p className={`font-sequel font-mono text-sm ${theme.text.primary}`}>
                        {transaction.referenceId}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Details (for withdrawals/payouts) */}
              {(transaction.type === 'payout' || transaction.type === 'withdrawal') && (
                <div>
                  <h3 className={`font-monument font-bold text-lg mb-4 ${theme.text.primary}`}>
                    Financial Breakdown
                  </h3>
                  <div className={`p-4 rounded-xl border space-y-4 ${
                    isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                  }`}>
                    {/* Amount in NGN */}
                    {transaction.amountInNgn ? (
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-2">
                          <CurrencyDollar size={18} weight="regular" className={theme.icon.default} />
                          <p className={`text-sm font-sequel ${theme.text.secondary}`}>Amount (NGN)</p>
                        </div>
                        <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                          ₦{transaction.amountInNgn.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-2">
                          <CurrencyDollar size={18} weight="regular" className={theme.icon.default} />
                          <p className={`text-sm font-sequel ${theme.text.secondary}`}>Amount (NGN)</p>
                        </div>
                        <p className={`text-sm font-sequel ${theme.text.muted}`}>Not available</p>
                      </div>
                    )}

                    {/* Exchange Rate */}
                    {transaction.exchangeRate ? (
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-2">
                          <ChartBar size={18} weight="regular" className={theme.icon.default} />
                          <p className={`text-sm font-sequel ${theme.text.secondary}`}>Exchange Rate</p>
                        </div>
                        <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                          ₦{transaction.exchangeRate.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })} / $1
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-2">
                          <ChartBar size={18} weight="regular" className={theme.icon.default} />
                          <p className={`text-sm font-sequel ${theme.text.secondary}`}>Exchange Rate</p>
                        </div>
                        <p className={`text-sm font-sequel ${theme.text.muted}`}>Not available</p>
                      </div>
                    )}

                    {/* Processing Fee */}
                    {transaction.processingFee ? (
                      <div className={`flex items-center justify-between py-2 ${
                        isDark ? 'border-t border-white/10' : 'border-t border-gray-200'
                      } pt-4`}>
                        <div className="flex items-center space-x-2">
                          <Receipt size={18} weight="regular" className="text-yellow-400" />
                          <p className={`text-sm font-sequel ${theme.text.secondary}`}>Processing Fee</p>
                        </div>
                        <p className={`font-semibold font-sequel text-yellow-400`}>
                          ₦{transaction.processingFee.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    ) : (
                      <div className={`flex items-center justify-between py-2 ${
                        isDark ? 'border-t border-white/10' : 'border-t border-gray-200'
                      } pt-4`}>
                        <div className="flex items-center space-x-2">
                          <Receipt size={18} weight="regular" className={theme.icon.default} />
                          <p className={`text-sm font-sequel ${theme.text.secondary}`}>Processing Fee</p>
                        </div>
                        <p className={`text-sm font-sequel ${theme.text.muted}`}>Not available</p>
                      </div>
                    )}

                    {/* Net Amount */}
                    {transaction.netAmount ? (
                      <div className={`flex items-center justify-between py-3 ${
                        isDark ? 'border-t border-white/20' : 'border-t border-gray-300'
                      } pt-4 mt-2`}>
                        <div className="flex items-center space-x-2">
                          <Wallet size={20} weight="regular" className="text-green-400" />
                          <p className={`text-sm font-semibold font-sequel ${theme.text.primary}`}>Net Amount</p>
                        </div>
                        <p className={`font-bold font-sequel text-lg text-green-400`}>
                          ₦{transaction.netAmount.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    ) : (
                      <div className={`flex items-center justify-between py-3 ${
                        isDark ? 'border-t border-white/20' : 'border-t border-gray-300'
                      } pt-4 mt-2`}>
                        <div className="flex items-center space-x-2">
                          <Wallet size={20} weight="regular" className={theme.icon.default} />
                          <p className={`text-sm font-semibold font-sequel ${theme.text.primary}`}>Net Amount</p>
                        </div>
                        <p className={`text-sm font-sequel ${theme.text.muted}`}>Not available</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <h3 className={`font-monument font-bold text-lg mb-4 ${theme.text.primary}`}>
                  Timeline
                </h3>
                <div className={`p-4 rounded-xl border space-y-3 ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <Calendar size={20} weight="regular" className={theme.icon.default} />
                    <div>
                      <p className={`text-sm font-sequel ${theme.text.secondary}`}>Transaction Date</p>
                      <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                        {new Date(transaction.date).toLocaleString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar size={20} weight="regular" className={theme.icon.default} />
                    <div>
                      <p className={`text-sm font-sequel ${theme.text.secondary}`}>Created At</p>
                      <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                        {new Date(transaction.createdAt).toLocaleString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  {transaction.updatedAt && (
                    <div className="flex items-center space-x-3">
                      <Calendar size={20} weight="regular" className={theme.icon.default} />
                      <div>
                        <p className={`text-sm font-sequel ${theme.text.secondary}`}>Last Updated</p>
                        <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                          {new Date(transaction.updatedAt).toLocaleString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

