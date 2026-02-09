'use client'

import { useState } from 'react'
import { X, XCircle, ArrowDownRight, Wallet, Bank } from '@phosphor-icons/react'
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

interface RejectPayoutModalProps {
  isOpen: boolean
  onClose: () => void
  payout: Payout
  onReject: (id: string, rejectionReason: string) => Promise<void>
}

export function RejectPayoutModal({
  isOpen,
  onClose,
  payout,
  onReject,
}: RejectPayoutModalProps) {
  const isDark = useAdminTheme()
  const theme = getThemeClasses(isDark)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isRejecting, setIsRejecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!rejectionReason.trim()) {
      setError('Rejection reason is required')
      return
    }

    if (rejectionReason.trim().length < 10) {
      setError('Rejection reason must be at least 10 characters')
      return
    }

    if (isRejecting) return

    setIsRejecting(true)
    try {
      await onReject(payout.id, rejectionReason.trim())
      // Reset form on success
      setRejectionReason('')
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('Failed to reject payout. Please try again.')
      }
    } finally {
      setIsRejecting(false)
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
      <div className={`relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border ${
        isDark ? 'bg-black border-white/10' : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDark ? 'border-white/10' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
              <XCircle size={20} weight="regular" className="text-red-400" />
            </div>
            <h2 className={`font-monument font-bold text-xl ${theme.text.primary}`}>
              Reject Payout
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

          {/* Rejection Reason */}
          <div>
            <label className={`block text-sm font-semibold font-sequel mb-2 ${theme.text.primary}`}>
              Rejection Reason <span className="text-red-400">*</span>
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value)
                setError(null)
              }}
              placeholder="Explain why this payout is being rejected (e.g., invalid bank account details, insufficient verification, etc.)"
              required
              minLength={10}
              maxLength={500}
              rows={5}
              className={`w-full ${theme.bg.input} ${theme.border.input} rounded-xl px-4 py-3 ${theme.text.primary} ${theme.text.placeholder} focus:outline-none focus:ring-2 focus:ring-tiktok-primary font-sequel resize-none`}
            />
            <p className={`mt-1 text-xs font-sequel ${
              rejectionReason.length < 10
                ? isDark ? 'text-red-400' : 'text-red-600'
                : theme.text.muted
            }`}>
              {rejectionReason.length}/500 characters (minimum 10 characters)
            </p>
          </div>

          {/* Warning */}
          <div className={`p-4 rounded-xl border ${
            isDark ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'
          }`}>
            <p className={`text-sm font-sequel ${
              isDark ? 'text-yellow-300' : 'text-yellow-700'
            }`}>
              <strong>Note:</strong> Rejecting this payout will NOT deduct any amount from the user's balance. The user can submit a new payout request after rejection.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isRejecting}
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
              disabled={isRejecting || !rejectionReason.trim() || rejectionReason.trim().length < 10}
              className="flex-1 px-4 py-3 rounded-xl font-sequel font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isRejecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Rejecting...</span>
                </>
              ) : (
                <>
                  <XCircle size={20} weight="regular" />
                  <span>Reject Payout</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

