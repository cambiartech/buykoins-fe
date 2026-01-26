'use client'

import { useState } from 'react'
import { X, CheckCircle, ArrowDownRight, Wallet, Bank } from '@phosphor-icons/react'
import { useAdminTheme } from '../../hooks/useTheme'
import { getThemeClasses } from '../../utils/theme'

interface PayoutUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
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
}

interface ProcessPayoutModalProps {
  isOpen: boolean
  onClose: () => void
  payout: Payout
  onProcess: (id: string, data?: { transactionReference?: string; notes?: string }) => Promise<void>
}

export function ProcessPayoutModal({
  isOpen,
  onClose,
  payout,
  onProcess,
}: ProcessPayoutModalProps) {
  const isDark = useAdminTheme()
  const theme = getThemeClasses(isDark)
  const [transactionReference, setTransactionReference] = useState('')
  const [notes, setNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (isProcessing) return

    setIsProcessing(true)
    try {
      await onProcess(payout.id, {
        transactionReference: transactionReference.trim() || undefined,
        notes: notes.trim() || undefined,
      })
      // Reset form on success
      setTransactionReference('')
      setNotes('')
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Failed to process payout. Please try again.')
      }
    } finally {
      setIsProcessing(false)
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
      <div className={`relative w-full max-w-lg rounded-xl border ${
        isDark ? 'bg-black border-white/10' : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDark ? 'border-white/10' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckCircle size={20} weight="regular" className="text-green-400" />
            </div>
            <h2 className={`font-monument font-bold text-xl ${theme.text.primary}`}>
              Process Payout
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
          {/* Error Message */}
          {error && (
            <div className={`p-4 rounded-xl ${
              isDark 
                ? 'bg-red-500/20 border border-red-500/50' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`text-sm font-sequel ${
                isDark ? 'text-red-300' : 'text-red-600'
              }`}>{error}</p>
            </div>
          )}

          {/* Payout Summary */}
          <div className={`p-4 rounded-xl border ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center space-x-3 mb-4">
              <ArrowDownRight size={20} weight="regular" className="text-tiktok-primary" />
              <h3 className={`font-semibold font-sequel ${theme.text.primary}`}>Payout Summary</h3>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className={`text-sm font-sequel ${theme.text.secondary}`}>User</p>
                <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                  {payout.user?.firstName && payout.user?.lastName
                    ? `${payout.user.firstName} ${payout.user.lastName}`
                    : payout.user?.email || 'Unknown User'}
                </p>
              </div>
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
                <p className={`text-sm font-sequel ${theme.text.secondary}`}>Net Amount (NGN)</p>
                <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                  ₦{payout.netAmount.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className={`pt-2 border-t ${
                isDark ? 'border-white/10' : 'border-gray-200'
              }`}>
                <div className="flex items-center space-x-2">
                  <Bank size={16} weight="regular" className={theme.icon.default} />
                  <div className="flex-1">
                    <p className={`text-xs font-sequel ${theme.text.secondary}`}>Bank Account</p>
                    <p className={`text-sm font-semibold font-sequel ${theme.text.primary}`}>
                      {payout.bankAccount.bankName} • {payout.bankAccount.accountNumber.slice(-4)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Reference */}
          <div>
            <label className={`block text-sm font-semibold font-sequel mb-2 ${theme.text.primary}`}>
              Transaction Reference <span className="text-gray-500 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={transactionReference}
              onChange={(e) => {
                setTransactionReference(e.target.value)
                setError(null)
              }}
              placeholder="e.g., TXN123456789"
              maxLength={100}
              className={`w-full ${theme.bg.input} ${theme.border.input} rounded-xl px-4 py-3 ${theme.text.primary} ${theme.text.placeholder} focus:outline-none focus:ring-2 focus:ring-tiktok-primary font-sequel`}
            />
            <p className={`mt-1 text-xs font-sequel ${theme.text.muted}`}>
              Transaction reference from bank or payment processor
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className={`block text-sm font-semibold font-sequel mb-2 ${theme.text.primary}`}>
              Notes <span className="text-gray-500 font-normal">(Optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value)
                setError(null)
              }}
              placeholder="Add any notes about this payout processing..."
              maxLength={500}
              rows={4}
              className={`w-full ${theme.bg.input} ${theme.border.input} rounded-xl px-4 py-3 ${theme.text.primary} ${theme.text.placeholder} focus:outline-none focus:ring-2 focus:ring-tiktok-primary font-sequel resize-none`}
            />
            <p className={`mt-1 text-xs font-sequel ${theme.text.muted}`}>
              {notes.length}/500 characters
            </p>
          </div>

          {/* Warning */}
          <div className={`p-4 rounded-xl border ${
            isDark ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'
          }`}>
            <p className={`text-sm font-sequel ${
              isDark ? 'text-yellow-300' : 'text-yellow-700'
            }`}>
              <strong>Note:</strong> Processing this payout will deduct ${payout.amount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} from the user's balance and mark the payout as completed.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className={`flex-1 px-4 py-3 rounded-xl font-sequel font-semibold transition-colors ${
                isDark
                  ? 'bg-white/5 hover:bg-white/10 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 px-4 py-3 rounded-xl font-sequel font-semibold bg-green-500 hover:bg-green-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={20} weight="regular" />
                  <span>Process Payout</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

