'use client'

import { useState, useEffect, useRef } from 'react'
import { X, CreditCard, Wallet, Clock, CheckCircle, XCircle, ArrowClockwise, Eye, EyeSlash } from '@phosphor-icons/react'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'
import { Card, CardTransaction } from './types'

interface CardDetailModalProps {
  isOpen: boolean
  onClose: () => void
  card: Card
  theme: 'light' | 'dark'
  onCardUpdated: () => void
}

declare global {
  interface Window {
    SecureProxy: any
  }
}

export function CardDetailModal({ isOpen, onClose, card, theme, onCardUpdated }: CardDetailModalProps) {
  const isDark = theme === 'dark'
  const toast = useToast()
  const [cardDetails, setCardDetails] = useState<Card | null>(card)
  const [transactions, setTransactions] = useState<CardTransaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [showSensitiveData, setShowSensitiveData] = useState(false)
  const [loadingSensitiveData, setLoadingSensitiveData] = useState(false)
  const [sudoCardId, setSudoCardId] = useState<string | null>(null)
  const secureProxyLoaded = useRef(false)

  // Get vault ID based on environment
  const getVaultId = () => {
    // Check if we're in production or staging/sandbox
    const isProduction = process.env.NEXT_PUBLIC_SUDO_ENVIRONMENT === 'production' || 
                        process.env.NODE_ENV === 'production'
    return isProduction ? 'vdl2xefo5' : 'we0dsa28s' // Production: vdl2xefo5, Sandbox: we0dsa28s
  }

  useEffect(() => {
    if (isOpen) {
      fetchCardDetails()
      fetchTransactions()
      loadSecureProxyScript()
    }
  }, [isOpen, card.id])

  const loadSecureProxyScript = () => {
    if (secureProxyLoaded.current || typeof window === 'undefined') return

    const script = document.createElement('script')
    script.src = 'https://js.securepro.xyz/sudo-show/1.1/ACiWvWF9tYAez4M498DHs.min.js'
    script.async = true
    script.onload = () => {
      secureProxyLoaded.current = true
    }
    script.onerror = () => {
      console.error('Failed to load Secure Proxy script')
    }
    document.body.appendChild(script)
  }

  const fetchCardDetails = async () => {
    setIsLoading(true)
    try {
      const response = await api.user.getCard(card.id)
      if (response.success && response.data) {
        const cardData = response.data as any
        // Store sudoCardId for Secure Proxy
        setSudoCardId(cardData.sudoCardId || null)
        // Normalize card data to match Card type
        const normalizedCard = {
          id: cardData.id,
          cardNumber: cardData.cardNumber || cardData.sudoCardId || '****',
          cardType: cardData.cardType || 'virtual',
          currency: cardData.currency || 'NGN',
          status: cardData.status || 'active',
          balance: typeof cardData.balance === 'string' ? parseFloat(cardData.balance) : (cardData.balance || 0),
          expiryMonth: cardData.expiryMonth || '',
          expiryYear: cardData.expiryYear || '',
          isDefault: cardData.isDefault || false,
          createdAt: cardData.createdAt || new Date().toISOString(),
        } as Card
        setCardDetails(normalizedCard)
      }
    } catch (error) {
      console.error('Failed to fetch card details:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTransactions = async (page: number = 0) => {
    setIsLoadingTransactions(true)
    try {
      const response = await api.user.getCardTransactions(card.id, { page, limit: 25 })
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

  const getCardToken = async (): Promise<string | null> => {
    try {
      const response = await api.user.getCardToken(card.id)
      if (response.success && response.data) {
        const data = response.data as any
        return data.token || null
      }
      return null
    } catch (error) {
      console.error('Failed to get card token:', error)
      toast.error('Failed to load card details. Please try again.')
      return null
    }
  }

  const displaySensitiveData = async () => {
    if (!sudoCardId || !window.SecureProxy) {
      toast.error('Unable to load card details. Please refresh and try again.')
      return
    }

    setLoadingSensitiveData(true)
    setShowSensitiveData(true)

    try {
      const cardToken = await getCardToken()
      if (!cardToken) {
        setShowSensitiveData(false)
        return
      }

      const vaultId = getVaultId()
      const numberSecret = window.SecureProxy.create(vaultId)
      const cvv2Secret = window.SecureProxy.create(vaultId)
      const pinSecret = window.SecureProxy.create(vaultId)

      // Display card number
      const cardNumberIframe = numberSecret.request({
        name: 'pan-text',
        method: 'GET',
        path: `/cards/${sudoCardId}/secure-data/number`,
        headers: {
          "Authorization": `Bearer ${cardToken}`
        },
        htmlWrapper: 'text',
        jsonPathSelector: 'data.number',
        serializers: [
          numberSecret.SERIALIZERS.replace(
            '(\\d{4})(\\d{4})(\\d{4})(\\d{4})',
            '$1 $2 $3 $4 '
          ),
        ]
      })
      cardNumberIframe.render('#secure-card-number')

      // Display CVV
      const cvv2iframe = cvv2Secret.request({
        name: 'cvv-text',
        method: 'GET',
        path: `/cards/${sudoCardId}/secure-data/cvv2`,
        headers: {
          "Authorization": `Bearer ${cardToken}`
        },
        htmlWrapper: 'text',
        jsonPathSelector: 'data.cvv2',
        serializers: []
      })
      cvv2iframe.render('#secure-cvv')

      // Display PIN
      const pinIframe = pinSecret.request({
        name: 'pin-text',
        method: 'GET',
        path: `/cards/${sudoCardId}/secure-data/defaultPin`,
        headers: {
          "Authorization": `Bearer ${cardToken}`
        },
        htmlWrapper: 'text',
        jsonPathSelector: 'data.defaultPin',
        serializers: []
      })
      pinIframe.render('#secure-pin')

      setLoadingSensitiveData(false)
    } catch (error) {
      console.error('Failed to display sensitive data:', error)
      toast.error('Failed to load sensitive card data. Please try again.')
      setLoadingSensitiveData(false)
      setShowSensitiveData(false)
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

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <CreditCard size={18} weight="regular" />
      case 'funding':
        return <Wallet size={18} weight="regular" />
      case 'refund':
        return <ArrowClockwise size={18} weight="regular" />
      default:
        return <Clock size={18} weight="regular" />
    }
  }

  const getStatusColor = (status: string) => {
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
      <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border ${
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
            <h2 className={`font-monument font-bold text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Card Details
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
          ) : cardDetails ? (
            <>
              {/* Card Info */}
              <div className={`p-6 rounded-xl border ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className={`text-sm font-sequel mb-1 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                      Card Number
                    </p>
                    {showSensitiveData ? (
                      <div id="secure-card-number" className={`font-semibold font-sequel ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {loadingSensitiveData && <span className="text-sm">Loading...</span>}
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <p className={`font-semibold font-sequel ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {cardDetails.cardNumber || 'Virtual Card'}
                        </p>
                        {sudoCardId && (
                          <button
                            onClick={displaySensitiveData}
                            className={`p-1 rounded transition-colors ${
                              isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                            }`}
                            title="Show card number"
                          >
                            <Eye size={16} weight="regular" className={isDark ? 'text-white/60' : 'text-gray-600'} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-sequel mb-1 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                      Expiry Date
                    </p>
                    <p className={`font-semibold font-sequel ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {cardDetails.expiryMonth}/{cardDetails.expiryYear}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm font-sequel mb-1 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                      Currency
                    </p>
                    <p className={`font-semibold font-sequel ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {cardDetails.currency}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm font-sequel mb-1 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                      Status
                    </p>
                    <p className={`font-semibold font-sequel ${
                      cardDetails.status === 'active' 
                        ? 'text-green-400' 
                        : cardDetails.status === 'frozen'
                        ? 'text-yellow-400'
                        : 'text-red-400'
                    }`}>
                      {cardDetails.status.charAt(0).toUpperCase() + cardDetails.status.slice(1)}
                    </p>
                  </div>
                </div>

                {/* Sensitive Data Section */}
                {showSensitiveData && sudoCardId && (
                  <div className={`pt-4 mt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className={`text-sm font-sequel mb-1 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                          CVV
                        </p>
                        <div id="secure-cvv" className={`font-semibold font-sequel ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {loadingSensitiveData && <span className="text-sm">Loading...</span>}
                        </div>
                      </div>
                      <div>
                        <p className={`text-sm font-sequel mb-1 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                          Default PIN
                        </p>
                        <div id="secure-pin" className={`font-semibold font-sequel ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {loadingSensitiveData && <span className="text-sm">Loading...</span>}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowSensitiveData(false)}
                      className={`mt-3 text-sm font-sequel flex items-center space-x-1 ${
                        isDark ? 'text-white/60 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <EyeSlash size={14} weight="regular" />
                      <span>Hide sensitive data</span>
                    </button>
                  </div>
                )}

                <div className={`pt-4 mt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                  <p className={`text-sm font-sequel mb-1 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                    Balance
                  </p>
                  <p className={`text-3xl font-bold font-monument ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {cardDetails.currency === 'NGN' ? '₦' : '$'}{typeof cardDetails.balance === 'number' ? cardDetails.balance.toFixed(2) : parseFloat(cardDetails.balance || '0').toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Transactions */}
              <div>
                <h3 className={`font-semibold mb-4 font-sequel ${isDark ? 'text-white' : 'text-gray-900'}`}>
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
                    <p className={`font-sequel ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
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
                            <div className={`p-2 rounded-lg ${
                              isDark ? 'bg-white/10' : 'bg-white'
                            }`}>
                              {getTransactionIcon(transaction.type)}
                            </div>
                            <div>
                              <p className={`font-semibold font-sequel ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {transaction.merchantName || transaction.description}
                              </p>
                              <p className={`text-xs font-sequel ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                                {formatDate(transaction.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold font-sequel ${
                              transaction.type === 'funding' || transaction.type === 'refund'
                                ? 'text-green-400'
                                : 'text-white'
                            }`}>
                              {transaction.type === 'funding' || transaction.type === 'refund' ? '+' : '-'}
                              {transaction.currency === 'NGN' ? '₦' : '$'}{transaction.amount.toFixed(2)}
                            </p>
                            <p className={`text-xs font-sequel ${getStatusColor(transaction.status)}`}>
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
