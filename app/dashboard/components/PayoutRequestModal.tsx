'use client'

import { useState, useEffect } from 'react'
import { X, ArrowDownRight, Bank, Calculator } from '@phosphor-icons/react'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'
import { BankAccount } from './types'

interface PayoutRequestModalProps {
  isOpen: boolean
  onClose: () => void
  theme: 'light' | 'dark'
  balance: number
  onSuccess: () => void
  onNavigateToBankAccounts?: () => void
}

export function PayoutRequestModal({
  isOpen,
  onClose,
  theme,
  balance,
  onSuccess,
  onNavigateToBankAccounts,
}: PayoutRequestModalProps) {
  const toast = useToast()
  const isDark = theme === 'dark'
  const [amount, setAmount] = useState('')
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string | null>(null)
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exchangeRate] = useState(1500) // Hardcoded for now
  const [processingFee] = useState(50) // Hardcoded for now

  useEffect(() => {
    if (isOpen) {
      fetchBankAccounts()
    }
  }, [isOpen])

  const fetchBankAccounts = async () => {
    setIsLoadingAccounts(true)
    try {
      const response = await api.user.getBankAccounts()
      if (response.success && response.data) {
        const accounts = Array.isArray(response.data) ? response.data : []
        const verifiedAccounts = accounts.filter((acc: BankAccount) => acc.isVerified)
        setBankAccounts(verifiedAccounts)
        
        // Auto-select primary account or first verified account
        const primary = verifiedAccounts.find((acc: BankAccount) => acc.isPrimary)
        if (primary) {
          setSelectedBankAccountId(primary.id)
        } else if (verifiedAccounts.length > 0) {
          setSelectedBankAccountId(verifiedAccounts[0].id)
        }
      }
    } catch (error) {
      console.error('Failed to fetch bank accounts:', error)
    } finally {
      setIsLoadingAccounts(false)
    }
  }

  const calculatePayout = () => {
    const amountNum = parseFloat(amount) || 0
    if (amountNum <= 0) return { amountInNgn: 0, netAmount: 0 }
    
    const amountInNgn = amountNum * exchangeRate
    const netAmount = amountInNgn - processingFee
    return { amountInNgn, netAmount }
  }

  const handleSubmit = async () => {
    setError(null)

    // Validation
    const amountNum = parseFloat(amount)
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      const errorMsg = 'Please enter a valid amount'
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    if (amountNum < 0.01) {
      const errorMsg = 'Minimum withdrawal amount is $0.01'
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    if (amountNum > balance) {
      const errorMsg = 'Insufficient balance'
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    const { netAmount } = calculatePayout()
    if (netAmount <= 0) {
      const errorMsg = 'Amount too small. Processing fee exceeds the payout amount.'
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    if (!selectedBankAccountId) {
      const errorMsg = 'Please select a bank account'
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    setIsLoading(true)

    try {
      const response = await api.user.requestPayout(amountNum, selectedBankAccountId)

      if (response.success) {
        toast.success(response.message || 'Payout request submitted successfully!')
        setAmount('')
        setError(null)
        onSuccess()
        onClose()
      } else {
        const errorMsg = response.message || 'Failed to submit payout request'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        let errorMsg = error.message || 'Failed to submit payout request'
        
        if (error.status === 400) {
          if (errorMsg.includes('insufficient')) {
            errorMsg = 'Insufficient balance for this payout'
          } else if (errorMsg.includes('pending')) {
            errorMsg = 'You already have a pending payout request. Please wait for it to be processed.'
          } else if (errorMsg.includes('bank account')) {
            errorMsg = 'No verified bank account found. Please add and verify a bank account first.'
          }
        } else if (error.status === 403) {
          errorMsg = 'You must complete onboarding before requesting payouts'
        } else if (error.status === 404) {
          errorMsg = 'Selected bank account not found or not verified'
        }
        
        setError(errorMsg)
        toast.error(errorMsg)
      } else {
        const errorMsg = 'An unexpected error occurred. Please try again.'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setAmount('')
    setError(null)
    setSelectedBankAccountId(null)
    onClose()
  }

  const { amountInNgn, netAmount } = calculatePayout()
  const verifiedAccounts = bankAccounts.filter(acc => acc.isVerified)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border ${
        isDark 
          ? 'bg-black border-white/20' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <ArrowDownRight size={24} weight="regular" className="text-tiktok-primary" />
            <h3 className={`font-monument font-bold text-lg ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Request Payout</h3>
          </div>
          <button
            onClick={handleClose}
            className={`${isDark ? 'text-white/80' : 'text-gray-700'}`}
            disabled={isLoading}
          >
            <X size={24} weight="regular" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          {/* Error Message */}
          {error && (
            <div className={`p-3 rounded-lg ${
              isDark 
                ? 'bg-red-500/20 border border-red-500/50' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`text-sm font-sequel ${
                isDark ? 'text-red-300' : 'text-red-600'
              }`}>{error}</p>
            </div>
          )}

          {/* Balance Info */}
          <div className={`p-3 rounded-lg ${
            isDark 
              ? 'bg-blue-500/10 border border-blue-500/30' 
              : 'bg-blue-50 border border-blue-200'
          }`}>
            <p className={`text-sm font-sequel ${
              isDark ? 'text-blue-300' : 'text-blue-700'
            }`}>
              <strong>Available Balance:</strong> ${balance.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          {/* Amount Input */}
          <div>
            <label className={`block text-sm font-medium mb-2 font-sequel ${
              isDark ? 'text-white/80' : 'text-gray-700'
            }`}>
              Amount (USD) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={balance}
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
                setError(null)
              }}
              placeholder="0.00"
              disabled={isLoading}
              className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-600 font-sequel ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
            />
            <p className={`mt-1 text-xs font-sequel ${
              isDark ? 'text-white/50' : 'text-gray-500'
            }`}>
              Minimum: $0.01
            </p>
          </div>

          {/* Bank Account Selection */}
          {isLoadingAccounts ? (
            <div className="flex items-center justify-center py-4">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : verifiedAccounts.length === 0 ? (
            <div className={`p-3 rounded-lg ${
              isDark 
                ? 'bg-yellow-500/10 border border-yellow-500/30' 
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <div className="flex items-start space-x-2 mb-3">
                <div className={`text-lg ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>⚠️</div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold font-sequel mb-1 ${
                    isDark ? 'text-yellow-300' : 'text-yellow-700'
                  }`}>
                    No Verified Bank Accounts
                  </p>
                  <p className={`text-xs font-sequel ${
                    isDark ? 'text-yellow-300/80' : 'text-yellow-700'
                  }`}>
                    You need to add and verify a bank account before requesting payouts.
                  </p>
                </div>
              </div>
              {onNavigateToBankAccounts && (
                <button
                  onClick={() => {
                    onClose()
                    onNavigateToBankAccounts()
                  }}
                  className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all text-sm font-sequel flex items-center justify-center space-x-2"
                >
                  <Bank size={18} weight="regular" />
                  <span>Add Bank Account</span>
                </button>
              )}
            </div>
          ) : (
            <div>
              <label className={`block text-sm font-medium mb-2 font-sequel ${
                isDark ? 'text-white/80' : 'text-gray-700'
              }`}>
                Bank Account <span className="text-red-400">*</span>
              </label>
              <div className="space-y-2">
                {verifiedAccounts.map((account) => (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => setSelectedBankAccountId(account.id)}
                    disabled={isLoading}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                      selectedBankAccountId === account.id
                        ? 'border-blue-600 bg-blue-600/10'
                        : isDark
                        ? 'border-white/10 bg-white/5 hover:border-white/20'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Bank size={16} weight="regular" className={isDark ? 'text-white/60' : 'text-gray-600'} />
                          <span className={`font-semibold font-sequel ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>{account.bankName}</span>
                          {account.isPrimary && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-sequel ${
                              isDark 
                                ? 'bg-blue-600/20 text-blue-400' 
                                : 'bg-blue-600/10 text-blue-600'
                            }`}>
                              Primary
                            </span>
                          )}
                        </div>
                        <p className={`text-xs font-sequel ${
                          isDark ? 'text-white/60' : 'text-gray-600'
                        }`}>
                          {account.accountNumber} • {account.accountName}
                        </p>
                      </div>
                      {selectedBankAccountId === account.id && (
                        <div className={`w-5 h-5 rounded-full border-2 border-blue-600 bg-blue-600 flex items-center justify-center`}>
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Payout Calculation */}
          {amount && parseFloat(amount) > 0 && (
            <div className={`p-4 rounded-lg border ${
              isDark 
                ? 'bg-white/5 border-white/10' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-center space-x-2 mb-3">
                <Calculator size={18} weight="regular" className={isDark ? 'text-white/60' : 'text-gray-600'} />
                <h4 className={`font-semibold font-sequel ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Payout Summary</h4>
              </div>
              <div className="space-y-2 text-sm font-sequel">
                <div className="flex justify-between">
                  <span className={isDark ? 'text-white/70' : 'text-gray-600'}>Amount (USD):</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-white/70' : 'text-gray-600'}>Exchange Rate:</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>₦{exchangeRate.toLocaleString()} per USD</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-white/70' : 'text-gray-600'}>Amount (NGN):</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>₦{amountInNgn.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-white/70' : 'text-gray-600'}>Processing Fee:</span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>₦{processingFee.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className={`flex justify-between pt-2 border-t ${
                  isDark ? 'border-white/10' : 'border-gray-200'
                }`}>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>You'll Receive:</span>
                  <span className={`font-bold text-lg ${isDark ? 'text-tiktok-primary' : 'text-tiktok-primary'}`}>
                    ₦{netAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all font-sequel ${
                isDark
                  ? 'bg-white/5 text-white/80 hover:bg-white/10'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50`}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !amount || parseFloat(amount) <= 0 || !selectedBankAccountId || verifiedAccounts.length === 0}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-sequel flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <ArrowDownRight size={18} weight="regular" />
                  <span>Request Payout</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

