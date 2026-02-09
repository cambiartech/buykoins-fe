'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle, ArrowDownRight, Bank, Warning, Copy, Image } from '@phosphor-icons/react'
import { useAdminTheme } from '../../hooks/useTheme'
import { getThemeClasses } from '../../utils/theme'
import { ApiError } from '@/lib/api'

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
  onCompleteManual: (id: string, data: { transactionReference: string; notes?: string }) => Promise<void>
}

export function ProcessPayoutModal({
  isOpen,
  onClose,
  payout,
  onProcess,
  onCompleteManual,
}: ProcessPayoutModalProps) {
  const isDark = useAdminTheme()
  const theme = getThemeClasses(isDark)
  const [transactionReference, setTransactionReference] = useState('')
  const [notes, setNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sudoFailed, setSudoFailed] = useState<{ message: string; sudoError?: string; hint?: string } | null>(null)
  const [manualStep, setManualStep] = useState(false)
  const [manualTransactionRef, setManualTransactionRef] = useState('')
  const [manualNotes, setManualNotes] = useState('')
  const [manualConfirmChecked, setManualConfirmChecked] = useState(false)
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setError(null)
      setSudoFailed(null)
      setManualStep(false)
      setManualTransactionRef('')
      setManualNotes('')
      setManualConfirmChecked(false)
      setScreenshotFile(null)
    }
  }, [isOpen])

  const resetAndClose = () => {
    setError(null)
    setSudoFailed(null)
    setManualStep(false)
    setTransactionReference('')
    setNotes('')
    setManualTransactionRef('')
    setManualNotes('')
    setManualConfirmChecked(false)
    setScreenshotFile(null)
    onClose()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {})
  }

  const UserPayoutAccountBlock = () => (
    <div className={`p-4 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
      <h4 className={`text-sm font-semibold font-sequel mb-3 ${theme.text.primary}`}>
        User payout account (send to this)
      </h4>
      <div className="space-y-2 text-sm font-sequel">
        <div className="flex items-center justify-between gap-2">
          <span className={theme.text.secondary}>Bank</span>
          <span className={`${theme.text.primary} font-medium`}>{payout.bankAccount.bankName}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className={theme.text.secondary}>Account name</span>
          <div className="flex items-center gap-1">
            <span className={theme.text.primary}>{payout.bankAccount.accountName}</span>
            <button
              type="button"
              onClick={() => copyToClipboard(payout.bankAccount.accountName)}
              className={`p-1 rounded ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}
              title="Copy"
            >
              <Copy size={14} weight="regular" />
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className={theme.text.secondary}>Account number</span>
          <div className="flex items-center gap-1">
            <span className={`${theme.text.primary} font-mono`}>{payout.bankAccount.accountNumber}</span>
            <button
              type="button"
              onClick={() => copyToClipboard(payout.bankAccount.accountNumber)}
              className={`p-1 rounded ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}
              title="Copy"
            >
              <Copy size={14} weight="regular" />
            </button>
          </div>
        </div>
        <div className={`pt-2 border-t ${isDark ? 'border-white/10' : 'border-gray-200'} flex justify-between`}>
          <span className={theme.text.secondary}>Net amount (NGN)</span>
          <span className={`${theme.text.primary} font-bold`}>
            ₦{payout.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSudoFailed(null)

    if (isProcessing) return

    setIsProcessing(true)
    try {
      await onProcess(payout.id, {
        transactionReference: transactionReference.trim() || undefined,
        notes: notes.trim() || undefined,
      })
      setTransactionReference('')
      setNotes('')
      onClose()
    } catch (err) {
      if (err instanceof ApiError && err.errorCode === 'SUDO_TRANSFER_FAILED') {
        setSudoFailed({
          message: err.message,
          sudoError: err.sudoError,
          hint: err.hint,
        })
      } else {
        setError(err instanceof Error ? err.message : 'Failed to process payout. Please try again.')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCompleteManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const ref = manualTransactionRef.trim()
    if (!ref) {
      setError('Transaction reference is required for manual completion.')
      return
    }
    if (ref.length > 100) {
      setError('Transaction reference must be 1–100 characters.')
      return
    }
    if (!manualConfirmChecked) {
      setError('Please confirm that you have completed the transfer to the user\'s account.')
      return
    }
    if (isProcessing) return

    let notes = manualNotes.trim()
    if (screenshotFile) {
      notes = notes ? `${notes}\nScreenshot: ${screenshotFile.name}` : `Screenshot: ${screenshotFile.name}`
    }

    setIsProcessing(true)
    try {
      await onCompleteManual(payout.id, {
        transactionReference: ref,
        notes: notes || undefined,
      })
      setManualTransactionRef('')
      setManualNotes('')
      setSudoFailed(null)
      setManualStep(false)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete payout manually.')
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
      <div className={`relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border ${
        isDark ? 'bg-black border-white/10' : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDark ? 'border-white/10' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              manualStep ? 'bg-blue-500/20' : sudoFailed ? 'bg-amber-500/20' : 'bg-green-500/20'
            }`}>
              {manualStep ? (
                <CheckCircle size={20} weight="regular" className="text-blue-400" />
              ) : sudoFailed ? (
                <Warning size={20} weight="regular" className="text-amber-400" />
              ) : (
                <CheckCircle size={20} weight="regular" className="text-green-400" />
              )}
            </div>
            <h2 className={`font-monument font-bold text-xl ${theme.text.primary}`}>
              {manualStep ? 'Complete manually' : sudoFailed ? 'Transfer failed' : 'Process Payout'}
            </h2>
          </div>
          <button
            onClick={() => manualStep ? setManualStep(false) : resetAndClose()}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <X size={20} weight="regular" />
          </button>
        </div>

        {/* Content */}
        {/* Manual completion form */}
        {manualStep ? (
          <form onSubmit={handleCompleteManualSubmit} className="p-6 space-y-6">
            {error && (
              <div className={`p-4 rounded-xl ${
                isDark ? 'bg-red-500/20 border border-red-500/50' : 'bg-red-50 border border-red-200'
              }`}>
                <p className={`text-sm font-sequel ${isDark ? 'text-red-300' : 'text-red-600'}`}>{error}</p>
              </div>
            )}
            <UserPayoutAccountBlock />

            <p className={`text-sm font-sequel ${theme.text.secondary}`}>
              Add the transaction reference (e.g. bank ref or screenshot ID) and optional notes. You can attach a screenshot for your records.
            </p>
            <div>
              <label className={`block text-sm font-semibold font-sequel mb-2 ${theme.text.primary}`}>
                Transaction Reference <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={manualTransactionRef}
                onChange={(e) => { setManualTransactionRef(e.target.value); setError(null) }}
                placeholder="e.g., BANK_REF_12345 or screenshot ID"
                maxLength={100}
                className={`w-full ${theme.bg.input} ${theme.border.input} rounded-xl px-4 py-3 ${theme.text.primary} ${theme.text.placeholder} focus:outline-none focus:ring-2 focus:ring-tiktok-primary font-sequel`}
              />
            </div>
            <div>
              <label className={`block text-sm font-semibold font-sequel mb-2 ${theme.text.primary}`}>
                Attach screenshot <span className="text-gray-500 font-normal">(Optional)</span>
              </label>
              <div className={`flex items-center gap-3 p-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                <label className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer font-sequel text-sm ${
                  isDark ? 'bg-white/10 hover:bg-white/15 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}>
                  <Image size={18} weight="regular" />
                  <span>Choose file</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      setScreenshotFile(f || null)
                      setError(null)
                    }}
                  />
                </label>
                {screenshotFile && (
                  <span className={`text-sm font-sequel ${theme.text.secondary}`}>
                    {screenshotFile.name}
                  </span>
                )}
              </div>
            </div>
            <div>
              <label className={`block text-sm font-semibold font-sequel mb-2 ${theme.text.primary}`}>
                Notes <span className="text-gray-500 font-normal">(Optional)</span>
              </label>
              <textarea
                value={manualNotes}
                onChange={(e) => setManualNotes(e.target.value)}
                placeholder="e.g., Paid via manual transfer"
                maxLength={500}
                rows={3}
                className={`w-full ${theme.bg.input} ${theme.border.input} rounded-xl px-4 py-3 ${theme.text.primary} ${theme.text.placeholder} focus:outline-none focus:ring-2 focus:ring-tiktok-primary font-sequel resize-none`}
              />
            </div>
            <div className={`p-4 rounded-xl border ${isDark ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'}`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={manualConfirmChecked}
                  onChange={(e) => { setManualConfirmChecked(e.target.checked); setError(null) }}
                  className="mt-1 rounded border-gray-400"
                />
                <span className={`text-sm font-sequel ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
                  I confirm I have completed the transfer to the user&apos;s account (₦{payout.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} to the account above).
                </span>
              </label>
            </div>
            <div className="flex items-center space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setManualStep(false)}
                disabled={isProcessing}
                className={`flex-1 px-4 py-3 rounded-xl font-sequel font-semibold ${
                  isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                } disabled:opacity-50`}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isProcessing || !manualTransactionRef.trim() || !manualConfirmChecked}
                className="flex-1 px-4 py-3 rounded-xl font-sequel font-semibold bg-green-500 hover:bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Completing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} weight="regular" />
                    <span>Complete manually</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : sudoFailed ? (
          <div className="p-6 space-y-6">
            <div className={`p-4 rounded-xl border ${
              isDark ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'
            }`}>
              <p className={`text-sm font-sequel font-semibold ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
                {sudoFailed.message}
              </p>
              {sudoFailed.sudoError && (
                <p className={`text-xs font-sequel mt-2 ${isDark ? 'text-amber-300/80' : 'text-amber-700'}`}>
                  {sudoFailed.sudoError}
                </p>
              )}
              {sudoFailed.hint && (
                <p className={`text-xs font-sequel mt-2 ${isDark ? 'text-amber-200' : 'text-amber-600'}`}>
                  {sudoFailed.hint}
                </p>
              )}
            </div>
            <div className="mt-4">
              <UserPayoutAccountBlock />
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={resetAndClose}
                className={`flex-1 px-4 py-3 rounded-xl font-sequel font-semibold ${
                  isDark ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setManualStep(true)}
                className="flex-1 px-4 py-3 rounded-xl font-sequel font-semibold bg-green-500 hover:bg-green-600 text-white flex items-center justify-center space-x-2"
              >
                <CheckCircle size={20} weight="regular" />
                <span>Complete manually</span>
              </button>
            </div>
          </div>
        ) : (
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

          {/* Info: what happens when processed */}
          <div className={`p-4 rounded-xl border ${
            isDark ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'
          }`}>
            <p className={`text-sm font-sequel ${
              isDark ? 'text-yellow-300' : 'text-yellow-700'
            }`}>
              <strong>Note:</strong> Processing will send ${payout.amount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} to the user&apos;s bank account, then mark the payout as completed and deduct the amount from the user&apos;s balance.
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
        )}
      </div>
    </div>
  )
}

