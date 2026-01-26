'use client'

import { useState, useEffect } from 'react'
import { X, CreditCard, User, Wallet, Clock, CheckCircle, XCircle, Lock, LockOpen } from '@phosphor-icons/react'
import { useAdminTheme } from '../../hooks/useTheme'
import { getThemeClasses } from '../../utils/theme'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'
import { UserLink } from '../../components/UserLink'

interface CardUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
}

interface Card {
  id: string
  userId: string
  user: CardUser | null
  cardNumber: string
  cardType: 'virtual' | 'physical'
  currency: string
  status: 'active' | 'frozen' | 'closed'
  balance: number
  expiryMonth: string
  expiryYear: string
  isDefault: boolean
  createdAt: string
  updatedAt?: string
}

interface CardTransaction {
  id: string
  cardId: string
  userId: string
  type: 'purchase' | 'funding' | 'refund' | 'reversal' | 'fee'
  amount: number
  currency: string
  merchantName?: string
  description: string
  status: 'pending' | 'completed' | 'failed' | 'reversed'
  reference?: string
  createdAt: string
}

interface CardDetailModalProps {
  isOpen: boolean
  onClose: () => void
  cardId: string
  initialCard?: Card | null
  onCardUpdated: () => void
}

export function CardDetailModal({
  isOpen,
  onClose,
  cardId,
  initialCard,
  onCardUpdated,
}: CardDetailModalProps) {
  const isDark = useAdminTheme()
  const theme = getThemeClasses(isDark)
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [card, setCard] = useState<Card | null>(initialCard || null)
  const [transactions, setTransactions] = useState<CardTransaction[]>([])
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    if (isOpen && cardId) {
      if (initialCard) {
        setCard(initialCard)
        setIsLoading(false)
      }
      fetchCardDetails()
      fetchTransactions()
    }
  }, [isOpen, cardId, initialCard])

  const fetchCardDetails = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.admin.getCard(cardId)
      if (response.success && response.data) {
        setCard(response.data as Card)
        setError(null)
      } else {
        const errorMsg = response.message || 'Failed to load card details'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const errorMsg = error.message || 'Failed to load card details'
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

  const fetchTransactions = async (page: number = 0) => {
    setIsLoadingTransactions(true)
    try {
      const response = await api.admin.getCardTransactions(cardId, { page, limit: 25 })
      if (response.success && response.data) {
        const newTransactions = Array.isArray(response.data) ? response.data : []
        if (page === 0) {
          setTransactions(newTransactions)
        } else {
          setTransactions(prev => [...prev, ...newTransactions])
        }
        setHasMore(newTransactions.length === 25)
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setIsLoadingTransactions(false)
    }
  }

  const handleFreeze = async () => {
    try {
      const response = await api.admin.freezeCard(cardId)
      if (response.success) {
        toast.success('Card frozen successfully')
        await fetchCardDetails()
        onCardUpdated()
      } else {
        toast.error(response.message || 'Failed to freeze card')
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message || 'Failed to freeze card')
      } else {
        toast.error('An unexpected error occurred')
      }
    }
  }

  const handleUnfreeze = async () => {
    try {
      const response = await api.admin.unfreezeCard(cardId)
      if (response.success) {
        toast.success('Card unfrozen successfully')
        await fetchCardDetails()
        onCardUpdated()
      } else {
        toast.error(response.message || 'Failed to unfreeze card')
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message || 'Failed to unfreeze card')
      } else {
        toast.error('An unexpected error occurred')
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return isDark ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-50 text-green-700 border-green-200'
      case 'frozen':
        return isDark ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'closed':
        return isDark ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-50 text-red-700 border-red-200'
      default:
        return isDark ? 'bg-white/10 text-white/60 border-white/10' : 'bg-gray-50 text-gray-600 border-gray-200'
    }
  }

  const getTransactionStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return isDark ? 'text-green-400' : 'text-green-600'
      case 'pending':
        return isDark ? 'text-yellow-400' : 'text-yellow-600'
      case 'failed':
      case 'reversed':
        return isDark ? 'text-red-400' : 'text-red-600'
      default:
        return isDark ? 'text-white/60' : 'text-gray-600'
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
      <div className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl border ${
        isDark ? 'bg-black border-white/10' : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className={`sticky top-0 flex items-center justify-between p-6 border-b ${
          isDark ? 'border-white/10 bg-black' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-tiktok-primary/20 rounded-full flex items-center justify-center">
              <CreditCard size={20} weight="regular" className="text-tiktok-primary" />
            </div>
            <h2 className={`font-monument font-bold text-xl ${theme.text.primary}`}>
              Card Details
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            {card?.status === 'active' && (
              <button
                onClick={handleFreeze}
                className={`px-4 py-2 rounded-lg border font-sequel transition-colors ${
                  isDark
                    ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30'
                    : 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100'
                }`}
              >
                <Lock size={18} weight="regular" className="inline mr-2" />
                Freeze
              </button>
            )}
            {card?.status === 'frozen' && (
              <button
                onClick={handleUnfreeze}
                className={`px-4 py-2 rounded-lg border font-sequel transition-colors ${
                  isDark
                    ? 'bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30'
                    : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                }`}
              >
                <LockOpen size={18} weight="regular" className="inline mr-2" />
                Unfreeze
              </button>
            )}
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <X size={20} weight="regular" />
            </button>
          </div>
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
          ) : card ? (
            <>
              {/* Card Info */}
              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className={`text-sm font-sequel mb-1 ${theme.text.secondary}`}>
                      Card Number
                    </p>
                    <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                      {card.cardNumber}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm font-sequel mb-1 ${theme.text.secondary}`}>
                      Expiry Date
                    </p>
                    <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                      {card.expiryMonth}/{card.expiryYear}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm font-sequel mb-1 ${theme.text.secondary}`}>
                      Currency
                    </p>
                    <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                      {card.currency}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm font-sequel mb-1 ${theme.text.secondary}`}>
                      Status
                    </p>
                    <span className={`px-2 py-1 rounded text-xs font-semibold font-sequel border ${getStatusColor(card.status)}`}>
                      {card.status.charAt(0).toUpperCase() + card.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <p className={`text-sm font-sequel mb-1 ${theme.text.secondary}`}>
                      Balance
                    </p>
                    <p className={`text-2xl font-bold font-monument ${theme.text.primary}`}>
                      {card.currency === 'NGN' ? '₦' : '$'}{card.balance.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm font-sequel mb-1 ${theme.text.secondary}`}>
                      Created
                    </p>
                    <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                      {formatDate(card.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* User Info */}
              {card.user && (
                <div className={`p-6 rounded-xl border ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                }`}>
                  <h3 className={`font-semibold mb-4 font-sequel ${theme.text.primary}`}>
                    User Information
                  </h3>
                  <UserLink
                    userId={card.userId}
                    firstName={card.user.firstName}
                    lastName={card.user.lastName}
                    email={card.user.email}
                  />
                </div>
              )}

              {/* Transactions */}
              <div>
                <h3 className={`font-semibold mb-4 font-sequel ${theme.text.primary}`}>
                  Recent Transactions
                </h3>
                {isLoadingTransactions && transactions.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-tiktok-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className={`text-center py-12 rounded-xl border ${
                    isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <p className={`font-sequel ${theme.text.muted}`}>
                      No transactions yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className={`p-4 rounded-lg border ${
                          isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div>
                              <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                                {transaction.merchantName || transaction.description}
                              </p>
                              <p className={`text-xs font-sequel ${theme.text.secondary}`}>
                                {formatDate(transaction.createdAt)} • {transaction.type}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold font-sequel ${
                              transaction.type === 'funding' || transaction.type === 'refund'
                                ? 'text-green-400'
                                : theme.text.primary
                            }`}>
                              {transaction.type === 'funding' || transaction.type === 'refund' ? '+' : '-'}
                              {transaction.currency === 'NGN' ? '₦' : '$'}{transaction.amount.toFixed(2)}
                            </p>
                            <p className={`text-xs font-sequel ${getTransactionStatusColor(transaction.status)}`}>
                              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {hasMore && (
                      <button
                        onClick={() => {
                          const nextPage = currentPage + 1
                          setCurrentPage(nextPage)
                          fetchTransactions(nextPage)
                        }}
                        disabled={isLoadingTransactions}
                        className={`w-full py-3 rounded-lg border font-sequel transition-colors ${
                          isDark
                            ? 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        } disabled:opacity-50`}
                      >
                        {isLoadingTransactions ? 'Loading...' : 'Load More'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

