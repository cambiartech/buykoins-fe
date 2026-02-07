'use client'

import { Wallet, ArrowDownRight, ArrowUpRight, Plus, CheckCircle, Clock, XCircle, UserPlus, CreditCard } from '@phosphor-icons/react'
import { CreditStatus, OnboardingStatus, Transaction, Activity } from './types'

interface DashboardOverviewProps {
  theme: 'light' | 'dark'
  balance: number // Earnings balance
  wallet: number // Wallet balance
  onboardingStatus: OnboardingStatus
  creditStatus: CreditStatus
  transactions: Transaction[]
  activities?: Activity[]
  onWithdraw: () => void
  onNewCredit: () => void
  onViewTransactions: () => void
  onViewCreditHistory: () => void
  onRequestOnboarding: () => void
  onViewCards?: () => void
  onAddFunds?: () => void
  onTransferToWallet?: () => void
}

// Helper function to format currency based on currency field
const formatCurrency = (amount: number, currency: 'USD' | 'NGN' | undefined = 'USD') => {
  const symbol = currency === 'NGN' ? '₦' : '$'
  return `${symbol}${Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function DashboardOverview({
  theme,
  balance,
  wallet,
  onboardingStatus,
  creditStatus,
  transactions,
  activities,
  onWithdraw,
  onNewCredit,
  onViewTransactions,
  onViewCreditHistory,
  onRequestOnboarding,
  onViewCards,
  onAddFunds,
  onTransferToWallet,
}: DashboardOverviewProps) {
  const isDark = theme === 'dark'

  return (
    <>
      {/* Balance Cards - Two Separate Cards */}
      {/* Mobile: Horizontal Scroll, Desktop: Grid */}
      <div className="mt-6">
        {/* Mobile: Horizontal Scroll with Partial Cards Visible */}
        <div className="md:hidden overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-2 px-4 pb-4 md:ml-2px">
          <div className="flex gap-4" style={{ width: 'max-content' }}>
            {/* Earnings Balance Card - Black on light theme, White on dark theme */}
            <div className="snap-start flex-shrink-0 w-[85vw] max-w-sm">
              <div className={`rounded-2xl p-6 border h-full ${
                isDark
                  ? 'bg-white border-white/20'
                  : 'bg-[#1a1a1a] border-[#1a1a1a]'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className={`text-sm font-sequel mb-1 ${
                      isDark ? 'text-gray-700' : 'text-gray-400'
                    }`}>Earnings Balance</p>
                    <h2 className={`font-monument font-bold text-2xl sm:text-3xl ${
                      isDark ? 'text-gray-900' : 'text-white'
                    }`}>
                      ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h2>
                    <p className={`text-xs font-sequel mt-1 ${
                      isDark ? 'text-gray-600' : 'text-gray-300'
                    }`}>From TikTok earnings</p>
                  </div>
                  <Wallet size={28} weight="regular" className={isDark ? 'text-gray-700' : 'text-gray-400'} />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={onWithdraw}
                    disabled={balance === 0}
                    className={`flex-1 py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 text-sm ${
                      balance === 0
                        ? isDark ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : isDark ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <ArrowDownRight size={18} weight="regular" />
                    <span className="font-sequel">Withdraw</span>
                  </button>
                  {onboardingStatus === 'completed' && creditStatus !== 'pending' && (
                    <button
                      onClick={onNewCredit}
                      className="flex-1 py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 bg-blue-600 text-white hover:bg-blue-700 text-sm"
                    >
                      <Plus size={18} weight="regular" />
                      <span className="font-sequel">Deposit</span>
                    </button>
                  )}
                </div>
                {balance > 0 && onTransferToWallet && (
                  <button
                    onClick={onTransferToWallet}
                    className="mt-2 w-full py-2 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 bg-blue-600 text-white hover:bg-blue-700 text-xs font-sequel"
                  >
                    <ArrowDownRight size={14} weight="regular" />
                    <span>Transfer to Wallet</span>
                  </button>
                )}
              </div>
            </div>

            {/* Wallet Balance Card */}
            <div className="snap-start flex-shrink-0 w-[85vw] max-w-sm">
              <div className={`rounded-2xl p-6 border h-full ${
                isDark
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 border-white/20'
                  : 'bg-gradient-to-br from-blue-500 to-blue-600 border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className={`text-sm font-sequel mb-1 ${
                      isDark ? 'text-white/80' : 'text-white/90'
                    }`}>Wallet Balance</p>
                    <h2 className={`font-monument font-bold text-2xl sm:text-3xl ${
                      isDark ? 'text-white' : 'text-white'
                    }`}>
                      ₦{wallet.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h2>
                    <p className={`text-xs font-sequel mt-1 ${
                      isDark ? 'text-white/70' : 'text-white/80'
                    }`}>For spending & cards</p>
                  </div>
                  <CreditCard size={28} weight="regular" className="text-white/80" />
                </div>
                <div className="flex gap-2">
                  {onAddFunds && (
                    <button
                      onClick={onAddFunds}
                      className="flex-1 py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 bg-white text-blue-600 hover:bg-white/90 text-sm font-sequel"
                    >
                      <Plus size={18} weight="regular" />
                      <span>Add Funds</span>
                    </button>
                  )}
                  {onViewCards && (
                    <button
                      onClick={onViewCards}
                      className="flex-1 py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 bg-white/10 text-white hover:bg-white/20 border border-white/20 text-sm font-sequel"
                    >
                      <CreditCard size={18} weight="regular" />
                      <span>My Cards</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop: Grid Layout */}
        <div className="hidden md:grid md:grid-cols-2 gap-4">
          {/* Earnings Balance Card - Black on light theme, White on dark theme */}
          <div className={`rounded-2xl p-6 border ${
            isDark
              ? 'bg-white border-white/20'
              : 'bg-[#1a1a1a] border-[#1a1a1a]'
          }`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className={`text-sm font-sequel mb-1 ${
                    isDark ? 'text-gray-700' : 'text-gray-400'
                  }`}>Earnings Balance</p>
                  <h2 className={`font-monument font-bold text-2xl sm:text-3xl ${
                    isDark ? 'text-gray-900' : 'text-white'
                  }`}>
                    ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h2>
                  <p className={`text-xs font-sequel mt-1 ${
                    isDark ? 'text-gray-600' : 'text-gray-300'
                  }`}>From TikTok earnings</p>
                </div>
                <Wallet size={28} weight="regular" className={isDark ? 'text-gray-700' : 'text-gray-400'} />
              </div>
            <div className="flex gap-2">
              <button
                onClick={onWithdraw}
                disabled={balance === 0}
                className={`flex-1 py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 text-sm ${
                  balance === 0
                    ? isDark ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : isDark ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <ArrowDownRight size={18} weight="regular" />
                <span className="font-sequel">Withdraw</span>
              </button>
              {onboardingStatus === 'completed' && creditStatus !== 'pending' && (
                <button
                  onClick={onNewCredit}
                  className="flex-1 py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 bg-blue-600 text-white hover:bg-blue-700 text-sm"
                >
                  <Plus size={18} weight="regular" />
                  <span className="font-sequel">Deposit</span>
                </button>
              )}
            </div>
            {balance > 0 && onTransferToWallet && (
              <button
                onClick={onTransferToWallet}
                className="mt-2 w-full py-2 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 bg-blue-600 text-white hover:bg-blue-700 text-xs font-sequel"
              >
                <ArrowDownRight size={14} weight="regular" />
                <span>Transfer to Wallet</span>
              </button>
            )}
          </div>

          {/* Wallet Balance Card */}
          <div className={`rounded-2xl p-6 border ${
            isDark
              ? 'bg-gradient-to-br from-blue-600 to-blue-700 border-white/20'
              : 'bg-gradient-to-br from-blue-500 to-blue-600 border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className={`text-sm font-sequel mb-1 ${
                  isDark ? 'text-white/80' : 'text-white/90'
                }`}>Wallet Balance</p>
                <h2 className={`font-monument font-bold text-2xl sm:text-3xl ${
                  isDark ? 'text-white' : 'text-white'
                }`}>
                  ₦{wallet.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
                <p className={`text-xs font-sequel mt-1 ${
                  isDark ? 'text-white/70' : 'text-white/80'
                }`}>For spending & cards</p>
              </div>
              <CreditCard size={28} weight="regular" className="text-white/80" />
            </div>
            <div className="flex gap-2">
              {onAddFunds && (
                <button
                  onClick={onAddFunds}
                  className="flex-1 py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 bg-white text-blue-600 hover:bg-white/90 text-sm font-sequel"
                >
                  <Plus size={18} weight="regular" />
                  <span>Add Funds</span>
                </button>
              )}
              {onViewCards && (
                <button
                  onClick={onViewCards}
                  className="flex-1 py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 bg-white/10 text-white hover:bg-white/20 border border-white/20 text-sm font-sequel"
                >
                  <CreditCard size={18} weight="regular" />
                  <span>My Cards</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Onboarding Status */}
      {onboardingStatus === 'pending' && (
        <div className={`mt-4 p-4 rounded-xl border ${
          isDark 
            ? 'bg-yellow-500/10 border-yellow-500/30' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 hidden md:flex">
              <Clock size={20} weight="regular" className="text-yellow-500" />
              <div className="">
                <p className={`font-semibold text-sm font-sequel ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Onboarding Required</p>
                <p className={`text-xs font-sequel ${
                  isDark ? 'text-white/70' : 'text-gray-600'
                }`}>Submit a request to get started with onboarding</p>
              </div>
            </div>
            <button
              onClick={onRequestOnboarding}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all text-sm font-sequel flex items-center space-x-2 w-full md:w-auto"
            >
              <UserPlus size={16} weight="regular" />
              <span>Request Onboarding</span>
            </button>
          </div>
        </div>
      )}

      {/* Credit Request Status */}
      {creditStatus !== 'none' && (
        <div className={`mt-4 p-4 rounded-xl border ${
          creditStatus === 'pending' 
            ? isDark 
              ? 'bg-blue-500/10 border-blue-500/30' 
              : 'bg-blue-50 border-blue-200'
            : creditStatus === 'sent'
            ? isDark
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-green-50 border-green-200'
            : isDark
              ? 'bg-red-500/10 border-red-500/30'
              : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {creditStatus === 'pending' && <Clock size={20} weight="regular" className="text-blue-500" />}
              {creditStatus === 'sent' && <CheckCircle size={20} weight="regular" className="text-green-500" />}
              {creditStatus === 'rejected' && <XCircle size={20} weight="regular" className="text-red-500" />}
              <div>
                <p className={`font-semibold text-sm font-sequel ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {creditStatus === 'pending' && 'Credit Request Pending'}
                  {creditStatus === 'sent' && 'Credit Added to Balance'}
                  {creditStatus === 'rejected' && 'Credit Request Rejected'}
                </p>
                <p className={`text-xs font-sequel ${
                  isDark ? 'text-white/70' : 'text-gray-600'
                }`}>
                  {creditStatus === 'pending' && 'Admin is reviewing your request'}
                  {creditStatus === 'sent' && 'Your credit has been added to your balance'}
                  {creditStatus === 'rejected' && 'Please contact support for more information'}
                </p>
              </div>
            </div>
            <button
              onClick={onViewCreditHistory}
              className={`text-xs font-sequel ${
                isDark ? 'text-blue-500' : 'text-blue-600'
              } hover:underline`}
            >
              View History
            </button>
          </div>
        </div>
      )}

      {/* View Credit History Button (when no active request) */}
      {creditStatus === 'none' && onboardingStatus === 'completed' && (
        <div className={`mt-4 rounded-xl p-4 border ${
          isDark 
            ? 'bg-white/5 border-white/10' 
            : 'bg-white border-gray-200'
        }`}>
          <button
            onClick={onViewCreditHistory}
            className={`w-full text-left font-sequel text-sm ${
              isDark ? 'text-white/80 hover:text-white' : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            View Credit Request History
          </button>
        </div>
      )}

      {/* Quick Stats */}
      <div className={`mt-4 rounded-xl p-4 border ${
        isDark 
          ? 'bg-white/5 border-white/10' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`font-monument font-bold text-base ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Quick Stats</h3>
          <button
            onClick={onViewTransactions}
            className={`text-xs font-sequel ${
              isDark ? 'text-blue-500' : 'text-blue-600'
            }`}
          >
            View all
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className={`text-xs font-sequel mb-1 ${
              isDark ? 'text-white/70' : 'text-gray-600'
            }`}>Total Credits</p>
            <p className={`font-semibold font-sequel ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>${balance.toLocaleString()}</p>
          </div>
          <div>
            <p className={`text-xs font-sequel mb-1 ${
              isDark ? 'text-white/70' : 'text-gray-600'
            }`}>Transactions</p>
            <p className={`font-semibold font-sequel ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>{transactions.length}</p>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className={`mt-4 rounded-xl p-4 border ${
        isDark 
          ? 'bg-white/5 border-white/10' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={`font-monument font-bold text-base ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Recent Activity</h3>
          <button
            onClick={onViewTransactions}
            className={`text-xs font-sequel ${
              isDark ? 'text-blue-500' : 'text-blue-600'
            }`}
          >
            See all
          </button>
        </div>
        {(!activities || activities.length === 0) && transactions.length === 0 ? (
          <p className={`text-sm font-sequel text-center py-4 ${
            isDark ? 'text-white/60' : 'text-gray-600'
          }`}>No activity yet</p>
        ) : (
          <div className="space-y-2">
            {(activities && activities.length > 0 ? activities : transactions).slice(0, 3).map((item) => {
              const activity = activities && activities.length > 0 ? (item as Activity) : null
              const transaction = !activity ? (item as Transaction) : null
              
              const type = activity?.type || transaction?.type || 'credit'
              const description = activity?.description || transaction?.description || ''
              const date = activity?.date || transaction?.date || ''
              const status = activity?.status || transaction?.status || 'pending'
              const amount = activity?.amount || transaction?.amount || 0
              const currency = activity?.currency || transaction?.currency || 'USD' // Get currency from item
              
              // Determine icon and color based on activity/transaction type
              const getActivityIcon = () => {
                if (type === 'credit' || type === 'credit_request' || type === 'deposit') {
                  return <ArrowUpRight size={16} weight="regular" className="text-green-400" />
                } else if (type === 'payout' || type === 'payout_request' || type === 'withdrawal') {
                  return <ArrowDownRight size={16} weight="regular" className="text-blue-600" />
                } else {
                  return <Clock size={16} weight="regular" className="text-yellow-400" />
                }
              }
              
              const getActivityColor = () => {
                if (type === 'credit' || type === 'credit_request' || type === 'deposit') {
                  return 'bg-green-500/20'
                } else if (type === 'payout' || type === 'payout_request' || type === 'withdrawal') {
                  return 'bg-blue-600/20'
                } else {
                  return 'bg-yellow-500/20'
                }
              }
              
              return (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 py-2">
                  <div className="flex items-start sm:items-center space-x-3 flex-1 min-w-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getActivityColor()}`}>
                      {getActivityIcon()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold font-sequel break-words ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>{description}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <p className={`text-xs font-sequel ${
                          isDark ? 'text-white/50' : 'text-gray-500'
                        }`}>
                          {new Date(date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </p>
                        <span className={`text-xs font-sequel px-2 py-0.5 rounded-full ${
                          status === 'completed'
                            ? isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600'
                            : status === 'pending' || status === 'processing'
                            ? isDark ? 'bg-yellow-500/10 text-yellow-400' : 'bg-yellow-50 text-yellow-600'
                            : isDark ? 'bg-red-500/10 text-red-400' : 'bg-red-50 text-red-600'
                        }`}>
                          {status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-left sm:text-right ml-11 sm:ml-2 flex-shrink-0">
                    {type === 'payout_request' && activity?.netAmount ? (
                      <div className="space-y-0.5">
                        <p className={`text-sm font-semibold font-sequel ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          ${amount.toLocaleString('en-US', { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          })}
                        </p>
                        <p className={`text-xs font-sequel ${
                          isDark ? 'text-white/50' : 'text-gray-500'
                        }`}>
                          ₦{activity.netAmount.toLocaleString('en-US', { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          })}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className={`text-sm font-semibold font-sequel ${
                          amount > 0 
                            ? isDark ? 'text-green-400' : 'text-green-600'
                            : isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {amount > 0 ? '+' : ''}
                          {formatCurrency(amount, activity?.currency || transaction?.currency)}
                        </p>
                        {type === 'credit_request' || type === 'payout_request' ? (
                          <p className={`text-xs font-sequel mt-0.5 ${
                            isDark ? 'text-white/50' : 'text-gray-500'
                          }`}>
                            {type === 'credit_request' ? 'Request' : 'Request'}
                          </p>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

