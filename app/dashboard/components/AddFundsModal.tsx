'use client'

import { useState, useEffect } from 'react'
import { X, Wallet, CircleNotch, CreditCard } from '@phosphor-icons/react'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'
import { getUser } from '@/lib/auth'

declare global {
  interface Window {
    PaystackPop: any
  }
}

interface AddFundsModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  theme: 'light' | 'dark'
  minAmount?: number
}

export function AddFundsModal({ isOpen, onClose, onSuccess, theme, minAmount = 100 }: AddFundsModalProps) {
  const isDark = theme === 'dark'
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [paystackLoaded, setPaystackLoaded] = useState(false)
  const user = getUser()

  useEffect(() => {
    // Check if Paystack is already loaded
    if (typeof window !== 'undefined' && window.PaystackPop) {
      setPaystackLoaded(true)
      return
    }

    if (isOpen && !paystackLoaded) {
      // Load Paystack script
      const script = document.createElement('script')
      script.src = 'https://js.paystack.co/v1/inline.js'
      script.async = true
      script.onload = () => {
        // Wait a bit to ensure PaystackPop is fully initialized
        setTimeout(() => {
          if (window.PaystackPop && window.PaystackPop.setup) {
            setPaystackLoaded(true)
          } else {
            console.error('PaystackPop not available after script load')
            toast.error('Failed to initialize payment gateway. Please refresh the page.')
            setError('Failed to initialize payment gateway')
          }
        }, 100)
      }
      script.onerror = () => {
        toast.error('Failed to load payment gateway. Please refresh the page.')
        setError('Failed to load payment gateway')
      }
      document.body.appendChild(script)

      return () => {
        // Don't remove script on unmount - keep it loaded for future use
        // Scripts are cached by browser anyway
      }
    }
  }, [isOpen, paystackLoaded, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (amountNum < minAmount) {
      setError(`Minimum amount is ${minAmount} NGN`)
      return
    }

    if (!paystackLoaded || !window.PaystackPop) {
      setError('Payment gateway is still loading. Please wait...')
      return
    }

    setIsLoading(true)

    try {
      // Convert NGN to kobo (multiply by 100)
      const amountInKobo = Math.round(amountNum * 100)

      // Initialize payment
      const initResponse = await api.payments.initialize(amountInKobo, `${window.location.origin}/payment/callback`)
      
      if (!initResponse.success || !initResponse.data) {
        throw new Error(initResponse.message || 'Failed to initialize payment')
      }

      const data = initResponse.data as any
      const { reference, authorizationUrl } = data

      // Get Paystack public key from environment
      const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || ''

      if (!paystackPublicKey) {
        throw new Error('Paystack public key not configured')
      }

      // Verify PaystackPop is available
      if (typeof window.PaystackPop === 'undefined' || !window.PaystackPop.setup) {
        throw new Error('Paystack payment gateway not loaded. Please refresh the page.')
      }

      // Open Paystack popup
      // Note: callback must be a regular function, not async
      const handler = window.PaystackPop.setup({
        key: paystackPublicKey,
        email: user?.email || '',
        amount: amountInKobo,
        ref: reference,
        callback: (response: any) => {
          // Handle payment success - use regular function, then call async verification
          if (response.status === 'success') {
            // Verify payment asynchronously
            api.payments.verify(reference)
              .then((verifyResponse) => {
                if (verifyResponse.success) {
                  toast.success('Funds added to wallet successfully!')
                  onSuccess()
                  onClose()
                  setAmount('')
                } else {
                  toast.error(verifyResponse.message || 'Payment verification failed')
                }
              })
              .catch((verifyError) => {
                console.error('Payment verification error:', verifyError)
                if (verifyError instanceof ApiError) {
                  toast.error(verifyError.message || 'Payment verification failed')
                } else {
                  toast.error('Payment verification failed. Please contact support.')
                }
              })
          } else {
            toast.error('Payment was not successful. Please try again.')
          }
        },
        onClose: () => {
          setIsLoading(false)
          toast.info('Payment cancelled')
        },
      })

      handler.openIframe()
    } catch (error) {
      console.error('Payment initialization error:', error)
      if (error instanceof ApiError) {
        const errorMsg = error.message || 'Failed to initialize payment'
        toast.error(errorMsg)
        setError(errorMsg)
      } else {
        const errorMsg = 'An unexpected error occurred'
        toast.error(errorMsg)
        setError(errorMsg)
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
              Add Funds to Wallet
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
            <p className={`text-sm font-sequel mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
              Add funds to your wallet to fund cards, make purchases, and more.
            </p>
            <p className={`text-xs font-sequel ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
              Funds will be added to your wallet balance via Paystack.
            </p>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 font-sequel ${
              isDark ? 'text-white/80' : 'text-gray-700'
            }`}>
              Amount (NGN)
            </label>
            <div className="relative">
              <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-sequel ${
                isDark ? 'text-white/60' : 'text-gray-600'
              }`}>
                ₦
              </span>
              <input
                type="number"
                step="100"
                min={minAmount}
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value)
                  setError(null)
                }}
                placeholder="0.00"
                className={`w-full pl-8 pr-4 py-3 rounded-lg border font-sequel ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-blue-600'
                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:ring-2 focus:ring-blue-600'
                } focus:outline-none ${error ? (isDark ? 'border-red-500/50' : 'border-red-300') : ''}`}
              />
            </div>
            {error && (
              <p className={`mt-2 text-sm font-sequel ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                {error}
              </p>
            )}
            <p className={`mt-2 text-xs font-sequel ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
              Minimum: ₦{minAmount.toLocaleString()}
            </p>
          </div>

          {/* Quick Amount Buttons */}
          <div>
            <p className={`text-xs font-sequel mb-2 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
              Quick amounts:
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[1000, 2000, 5000, 10000].map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => {
                    setAmount(quickAmount.toString())
                    setError(null)
                  }}
                  className={`px-3 py-2 rounded-lg border font-sequel text-sm transition-colors ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  ₦{quickAmount.toLocaleString()}
                </button>
              ))}
            </div>
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
              disabled={isLoading || !amount || parseFloat(amount) < minAmount || !paystackLoaded}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-sequel disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <CircleNotch size={18} weight="regular" className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Wallet size={18} weight="regular" />
                  <span>Add Funds</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
