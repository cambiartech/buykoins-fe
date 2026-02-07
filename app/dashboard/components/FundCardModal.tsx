'use client'

import { useState } from 'react'
import { X, Wallet, CircleNotch, Plus } from '@phosphor-icons/react'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'
import { Card } from './types'

interface FundCardModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  card: Card
  balance: number
  theme: 'light' | 'dark'
  onAddFunds?: () => void
  onWalletUpdate?: () => void
}

export function FundCardModal({ isOpen, onClose, onSuccess, card, balance, theme, onAddFunds, onWalletUpdate }: FundCardModalProps) {
  const isDark = theme === 'dark'
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (amountNum < 0.01) {
      setError('Minimum funding amount is 0.01')
      return
    }

    if (balance <= 0) {
      setError('Insufficient balance. Please add funds to your wallet first.')
      return
    }

    if (amountNum > balance) {
      setError(`Insufficient balance. Available: ${card.currency === 'NGN' ? '₦' : '$'}${balance.toFixed(2)}`)
      return
    }

    setIsLoading(true)

    try {
      const response = await api.user.fundCard(card.id, amountNum)
      if (response.success) {
        toast.success('Card funded successfully!')
        onSuccess()
        // Update wallet balance in parent component
        if (onWalletUpdate) {
          onWalletUpdate()
        }
        onClose()
        setAmount('')
      } else {
        toast.error(response.message || 'Failed to fund card')
        setError(response.message || 'Failed to fund card')
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const errorMsg = error.message || 'Failed to fund card'
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
              <Wallet size={20} weight="regular" className="text-tiktok-primary" />
            </div>
            <h2 className={`font-monument font-bold text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Fund Card
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
              Card: {card.cardNumber}
            </p>
            <p className={`text-sm font-sequel ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
              Available Balance: {card.currency === 'NGN' ? '₦' : '$'}{balance.toFixed(2)}
            </p>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 font-sequel ${
              isDark ? 'text-white/80' : 'text-gray-700'
            }`}>
              Amount ({card.currency})
            </label>
            <div className="relative">
              <span className={`absolute left-4 top-1/2 -translate-y-1/2 font-sequel ${
                isDark ? 'text-white/60' : 'text-gray-600'
              }`}>
                {card.currency === 'NGN' ? '₦' : '$'}
              </span>
              <input
                type="number"
                step="0.01"
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
              <div className="mt-2">
                <p className={`text-sm font-sequel ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                  {error}
                </p>
                {(balance <= 0 || (amount && parseFloat(amount) > balance)) && onAddFunds && (
                  <button
                    type="button"
                    onClick={onAddFunds}
                    className="mt-3 w-full px-4 py-2 bg-tiktok-primary/20 text-tiktok-primary rounded-lg hover:bg-tiktok-primary/30 transition-colors font-sequel flex items-center justify-center space-x-2 border border-tiktok-primary/30"
                  >
                    <Plus size={16} weight="regular" />
                    <span>Add Funds to Wallet</span>
                  </button>
                )}
              </div>
            )}
            <p className={`mt-2 text-xs font-sequel ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
              Minimum: {card.currency === 'NGN' ? '₦' : '$'}0.01
            </p>
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
              disabled={isLoading || !amount || parseFloat(amount) <= 0}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-sequel disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <CircleNotch size={18} weight="regular" className="animate-spin" />
                  <span>Funding...</span>
                </>
              ) : (
                <span>Fund Card</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

