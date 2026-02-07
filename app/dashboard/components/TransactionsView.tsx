'use client'

import { X, MagnifyingGlass, ArrowUpRight, ArrowDownRight, Clock, CreditCard, Wallet } from '@phosphor-icons/react'
import { Transaction, Activity } from './types'

interface TransactionsViewProps {
  theme: 'light' | 'dark'
  transactions: Transaction[]
  activities?: Activity[]
  searchQuery: string
  onSearchChange: (query: string) => void
  onClose: () => void
}

// Helper function to format currency based on currency field
const formatCurrency = (amount: number, currency: 'USD' | 'NGN' | undefined = 'USD') => {
  const symbol = currency === 'NGN' ? '₦' : '$'
  return `${symbol}${Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function TransactionsView({
  theme,
  transactions,
  activities,
  searchQuery,
  onSearchChange,
  onClose,
}: TransactionsViewProps) {
  const isDark = theme === 'dark'

  // Use activities if available, otherwise fall back to transactions
  const displayItems = activities && activities.length > 0 
    ? activities 
    : transactions.map(t => ({
        id: t.id,
        type: t.type === 'credit' ? 'credit' : t.type === 'withdrawal' ? 'payout' : 'credit',
        amount: t.amount,
        currency: t.currency || 'USD', // Preserve currency field
        date: t.date,
        status: t.status,
        description: t.description,
      } as Activity))

  const filteredItems = displayItems.filter(item => 
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.amount.toString().includes(searchQuery) ||
    (item.type === 'payout_request' && item.netAmount?.toString().includes(searchQuery))
  )

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className={`font-monument font-bold text-xl ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>All Transactions</h2>
        <button
          onClick={onClose}
          className={`${isDark ? 'text-white/80' : 'text-gray-700'}`}
        >
          <X size={24} weight="regular" />
        </button>
      </div>

      {/* Search */}
      <div className={`mb-4 rounded-xl border ${
        isDark 
          ? 'bg-white/5 border-white/10' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="relative">
          <MagnifyingGlass 
            size={18} 
            weight="regular" 
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
              isDark ? 'text-white/40' : 'text-gray-400'
            }`} 
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search transactions"
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border-0 focus:outline-none font-sequel text-sm ${
              isDark
                ? 'bg-transparent text-white placeholder-white/30'
                : 'bg-transparent text-gray-900 placeholder-gray-400'
            }`}
          />
        </div>
      </div>

      {/* Activities/Transactions List */}
      {filteredItems.length === 0 ? (
        <div className={`rounded-xl p-8 text-center border ${
          isDark 
            ? 'bg-white/5 border-white/10' 
            : 'bg-white border-gray-200'
        }`}>
          <p className={`font-sequel ${
            isDark ? 'text-white/60' : 'text-gray-600'
          }`}>
            {searchQuery ? 'No activities found' : 'No activities yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item) => {
            const getActivityIcon = () => {
              if (item.type === 'credit' || item.type === 'credit_request') {
                return <ArrowUpRight size={20} weight="regular" className="text-green-400" />
              } else if (item.type === 'payout' || item.type === 'payout_request' || item.type === 'withdrawal') {
                return <ArrowDownRight size={20} weight="regular" className="text-blue-600" />
              } else {
                return <Clock size={20} weight="regular" className="text-yellow-400" />
              }
            }
            
            const getActivityColor = () => {
              if (item.type === 'credit' || item.type === 'credit_request') {
                return 'bg-green-500/20'
              } else if (item.type === 'payout' || item.type === 'payout_request' || item.type === 'withdrawal') {
                return 'bg-blue-600/20'
              } else {
                return 'bg-yellow-500/20'
              }
            }
            
            const getActivityTypeLabel = () => {
              if (item.type === 'credit_request') return 'Credit Request'
              if (item.type === 'payout_request') return 'Payout Request'
              if (item.type === 'credit') return 'Credit'
              if (item.type === 'payout' || item.type === 'withdrawal') return 'Payout'
              return 'Activity'
            }
            
            return (
              <div 
                key={item.id} 
                className={`rounded-xl p-4 border ${
                  isDark 
                    ? 'bg-white/5 border-white/10' 
                    : 'bg-white border-gray-200'
                }`}
              >
                {/* Mobile: Stacked layout, Desktop: Horizontal */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-start sm:items-center space-x-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityColor()}`}>
                      {getActivityIcon()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1 sm:mb-0">
                        <p className={`font-semibold font-sequel text-sm sm:text-base break-words ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>{item.description}</p>
                        {(item.type === 'credit_request' || item.type === 'payout_request') && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-sequel self-start sm:self-auto ${
                            isDark 
                              ? 'bg-white/10 text-white/70' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {getActivityTypeLabel()}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1 sm:mt-0.5">
                        <p className={`text-xs font-sequel ${
                          isDark ? 'text-white/50' : 'text-gray-500'
                        }`}>
                          {new Date(item.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </p>
                        <span className={`text-xs font-sequel px-2 py-0.5 rounded-full ${
                          item.status === 'completed'
                            ? isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'
                            : item.status === 'pending' || item.status === 'processing'
                            ? isDark ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-700'
                            : isDark ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-700'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-left sm:text-right ml-0 sm:ml-4 flex-shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 mt-2 sm:mt-0">
                    {item.type === 'payout_request' && item.netAmount ? (
                      <div className="space-y-1">
                        <p className={`font-semibold font-sequel text-base ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {formatCurrency(item.amount, item.currency)}
                        </p>
                        <p className={`text-xs font-sequel ${
                          isDark ? 'text-white/50' : 'text-gray-500'
                        }`}>
                          ₦{item.netAmount.toLocaleString('en-US', { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          })} net
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className={`font-semibold font-sequel text-base ${
                          item.amount > 0 
                            ? isDark ? 'text-green-400' : 'text-green-600'
                            : isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {item.amount > 0 ? '+' : ''}
                          {formatCurrency(item.amount, item.currency)}
                        </p>
                        {item.type === 'credit_request' && (
                          <p className={`text-xs font-sequel mt-1 ${
                            isDark ? 'text-white/50' : 'text-gray-500'
                          }`}>Request</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

