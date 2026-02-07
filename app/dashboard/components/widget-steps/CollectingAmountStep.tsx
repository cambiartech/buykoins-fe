'use client'

import { useState } from 'react'
import { Calculator } from '@phosphor-icons/react'

interface CollectingAmountStepProps {
  theme: 'light' | 'dark'
  isLoading: boolean
  error: string | null
  onSubmit: (step: string, data: any) => Promise<void>
  context?: { amount?: number; payoutId?: string; balance?: number }
  sessionData: any
}

export function CollectingAmountStep({
  theme,
  isLoading,
  error,
  onSubmit,
  context,
}: CollectingAmountStepProps) {
  const isDark = theme === 'dark'
  const [amount, setAmount] = useState(context?.amount?.toString() || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const amountNum = parseFloat(amount)
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      return
    }

    // Validate against balance if provided
    if (context?.balance !== undefined && amountNum > context.balance) {
      return
    }

    await onSubmit('collecting-amount', { amount: amountNum })
  }

  const maxAmount = context?.balance || undefined
  const amountNum = parseFloat(amount) || 0
  const exceedsBalance = maxAmount !== undefined && amountNum > maxAmount

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg ${
        isDark 
          ? 'bg-blue-500/10 border border-blue-500/30' 
          : 'bg-blue-50 border border-blue-200'
      }`}>
        <div className="flex items-start space-x-3">
          <Calculator size={24} weight="regular" className={`mt-1 ${
            isDark ? 'text-blue-400' : 'text-blue-600'
          }`} />
          <div>
            <h4 className={`font-semibold mb-2 font-sequel ${
              isDark ? 'text-blue-300' : 'text-blue-700'
            }`}>
              Enter Amount
            </h4>
            <p className={`text-sm font-sequel ${
              isDark ? 'text-blue-300/80' : 'text-blue-700'
            }`}>
              {context?.amount 
                ? `Suggested amount: $${context.amount.toFixed(2)}. You can modify this amount.`
                : 'Enter the amount you want to process'
              }
              {maxAmount !== undefined && (
                <span className={`block mt-1 text-xs ${
                  isDark ? 'text-blue-300/60' : 'text-blue-600'
                }`}>
                  Available balance: ${maxAmount.toFixed(2)}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={`block text-sm font-medium mb-2 font-sequel ${
            isDark ? 'text-white/80' : 'text-gray-700'
          }`}>
            Amount ($)
          </label>
            <input
            type="number"
            step="0.01"
            min="0.01"
            max={maxAmount}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            disabled={isLoading}
            className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-600 font-sequel ${
              exceedsBalance
                ? 'border-red-500 focus:ring-red-500'
                : isDark
                ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
            }`}
          />
          {exceedsBalance && (
            <p className={`text-xs mt-1 font-sequel ${
              isDark ? 'text-red-400' : 'text-red-600'
            }`}>
              Amount exceeds available balance of ${maxAmount?.toFixed(2)}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !amount || parseFloat(amount) <= 0 || exceedsBalance}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-sequel"
        >
          {isLoading ? 'Processing...' : 'Continue'}
        </button>
      </form>
    </div>
  )
}

