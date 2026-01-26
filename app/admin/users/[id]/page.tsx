'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  User,
  Envelope,
  Phone,
  Wallet,
  CreditCard,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Bank,
  FileText,
  ChartBar,
  UserCircle,
  Shield,
  ChatCircle
} from '@phosphor-icons/react'
import { useAdminTheme } from '../../hooks/useTheme'
import { getThemeClasses } from '../../utils/theme'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'
import Link from 'next/link'

interface UserData {
  id: string
  email: string
  firstName?: string
  lastName?: string
  username?: string
  phone?: string
  balance: number
  status: 'active' | 'suspended' | 'frozen'
  onboardingStatus: 'pending' | 'completed'
  emailVerified: boolean
  walletStatus: 'active' | 'frozen'
  joinedAt: string
  createdAt: string
}

interface Transaction {
  id: string
  type: 'credit' | 'withdrawal' | 'payout' | 'deposit' | 'card_funding' | 'transfer_earnings_to_wallet' | 'card_purchase'
  amount: number
  currency?: 'USD' | 'NGN' // CRITICAL: Use this field to display correct currency
  amountInNgn?: number | null
  netAmount?: number | null
  status: 'completed' | 'pending' | 'rejected'
  description: string
  date: string
}

interface CreditRequest {
  id: string
  amount: number
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  proofUrl?: string
}

interface PayoutRequest {
  id: string
  amount: number
  amountInNgn: number
  netAmount: number
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  requestedAt: string
}

interface BankAccount {
  id: string
  accountNumber: string
  accountName: string
  bankName: string
  isVerified: boolean
  isPrimary: boolean
}

// Helper function to format currency based on currency field
const formatCurrency = (amount: number, currency: 'USD' | 'NGN' | undefined = 'USD') => {
  const symbol = currency === 'NGN' ? '₦' : '$'
  return `${symbol}${Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string
  const isDark = useAdminTheme()
  const theme = getThemeClasses(isDark)
  const toast = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<UserData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [creditRequests, setCreditRequests] = useState<CreditRequest[]>([])
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([])
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'credit-requests' | 'payouts' | 'bank-accounts'>('overview')

  useEffect(() => {
    if (userId) {
      fetchUserData()
    }
  }, [userId])

  const fetchUserData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Fetch user details
      const userResponse = await api.admin.getUser(userId)
      if (userResponse.success && userResponse.data) {
        setUser(userResponse.data as any)
      }

      // Fetch user transactions
      const transactionsResponse = await api.admin.getTransactions({
        userId,
        limit: 50,
      })
      let fetchedTransactions: Transaction[] = []
      if (transactionsResponse.success && transactionsResponse.data) {
        const data = transactionsResponse.data as any
        fetchedTransactions = Array.isArray(data.transactions) ? data.transactions : []
        setTransactions(fetchedTransactions)
      }

      // Fetch credit requests (filter from fetched transactions)
      const creditTransactions = fetchedTransactions.filter(t => t.type === 'credit')
      setCreditRequests(
        creditTransactions.map(t => ({
          id: t.id,
          amount: t.amount,
          status: t.status === 'completed' ? 'approved' : t.status === 'rejected' ? 'rejected' : 'pending',
          submittedAt: t.date,
        }))
      )

      // Fetch payout requests (filter from fetched transactions)
      const payoutTransactions = fetchedTransactions.filter(t => t.type === 'payout' || t.type === 'withdrawal')
      setPayoutRequests(
        payoutTransactions.map(t => ({
          id: t.id,
          amount: t.amount,
          amountInNgn: t.amountInNgn || 0,
          netAmount: t.netAmount || 0,
          status: t.status as any,
          requestedAt: t.date,
        }))
      )

      // Fetch bank accounts
      try {
        const bankAccountsResponse = await api.admin.getUserBankAccounts(userId)
        if (bankAccountsResponse.success && bankAccountsResponse.data) {
          const data = bankAccountsResponse.data as any
          setBankAccounts(Array.isArray(data.bankAccounts) ? data.bankAccounts : Array.isArray(data) ? data : [])
        }
      } catch (error) {
        // Silently fail for bank accounts - not critical
        console.error('Failed to fetch bank accounts:', error)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const errorMsg = error.message || 'Failed to load user data'
        setError(errorMsg)
        toast.error(errorMsg)
      } else {
        const errorMsg = 'An unexpected error occurred'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'approved':
        return 'text-green-400'
      case 'pending':
      case 'processing':
        return 'text-yellow-400'
      case 'rejected':
      case 'suspended':
      case 'frozen':
        return 'text-red-400'
      default:
        return theme.text.primary
    }
  }

  const getStatusBadge = (status: string) => {
    const colorClass = status === 'active' || status === 'completed' || status === 'approved'
      ? 'bg-green-500/20 text-green-400'
      : status === 'pending' || status === 'processing'
      ? 'bg-yellow-500/20 text-yellow-400'
      : 'bg-red-500/20 text-red-400'
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold font-sequel ${colorClass}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-tiktok-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error && !user) {
    return (
      <div className="p-6">
        <div className={`p-4 rounded-xl ${
          isDark 
            ? 'bg-red-500/20 border border-red-500/50' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <p className={`text-sm font-sequel ${
            isDark ? 'text-red-300' : 'text-red-600'
          }`}>{error}</p>
          <button
            onClick={() => router.back()}
            className={`mt-4 text-sm font-sequel hover:underline ${
              isDark ? 'text-red-300' : 'text-red-600'
            }`}
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const fullName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.email

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className={`flex items-center space-x-2 mb-4 font-sequel transition-colors ${
            isDark ? 'text-white/80 hover:text-white' : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          <ArrowLeft size={20} weight="regular" />
          <span>Back</span>
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`font-monument font-bold text-2xl mb-2 ${theme.text.primary}`}>
              User Profile
            </h2>
            <p className={`font-sequel ${theme.text.secondary}`}>
              Complete user activity and information
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                router.push(`/admin/support?userId=${userId}`)
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border font-sequel transition-colors ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ChatCircle size={18} weight="regular" />
              <span>Support</span>
            </button>
          </div>
        </div>
      </div>

      {/* User Info Card */}
      <div className={`mb-6 p-6 rounded-xl border ${
        isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              isDark ? 'bg-tiktok-primary/20' : 'bg-tiktok-primary/10'
            }`}>
              <UserCircle size={32} weight="regular" className="text-tiktok-primary" />
            </div>
            <div>
              <h3 className={`font-monument font-bold text-xl mb-1 ${theme.text.primary}`}>
                {fullName}
              </h3>
              <p className={`text-sm font-sequel ${theme.text.secondary}`}>
                {user.email}
              </p>
              {user.username && (
                <p className={`text-sm font-sequel ${theme.text.muted}`}>
                  @{user.username}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {getStatusBadge(user.status)}
            {user.onboardingStatus === 'completed' ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold font-sequel bg-blue-500/20 text-blue-400">
                Onboarded
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold font-sequel bg-yellow-500/20 text-yellow-400">
                Pending Onboarding
              </span>
            )}
            {user.emailVerified ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold font-sequel bg-green-500/20 text-green-400">
                <CheckCircle size={12} weight="regular" className="mr-1" />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold font-sequel bg-gray-500/20 text-gray-400">
                Unverified
              </span>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div>
            <p className={`text-xs font-semibold font-sequel uppercase tracking-wider mb-1 ${theme.text.secondary}`}>
              Balance
            </p>
            <p className={`font-bold font-sequel text-lg ${theme.text.primary}`}>
              ${user.balance.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div>
            <p className={`text-xs font-semibold font-sequel uppercase tracking-wider mb-1 ${theme.text.secondary}`}>
              Transactions
            </p>
            <p className={`font-bold font-sequel text-lg ${theme.text.primary}`}>
              {transactions.length}
            </p>
          </div>
          <div>
            <p className={`text-xs font-semibold font-sequel uppercase tracking-wider mb-1 ${theme.text.secondary}`}>
              Credit Requests
            </p>
            <p className={`font-bold font-sequel text-lg ${theme.text.primary}`}>
              {creditRequests.length}
            </p>
          </div>
          <div>
            <p className={`text-xs font-semibold font-sequel uppercase tracking-wider mb-1 ${theme.text.secondary}`}>
              Payout Requests
            </p>
            <p className={`font-bold font-sequel text-lg ${theme.text.primary}`}>
              {payoutRequests.length}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 border-b border-white/10">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBar },
            { id: 'transactions', label: 'Transactions', icon: CreditCard },
            { id: 'credit-requests', label: 'Credit Requests', icon: ArrowUpRight },
            { id: 'payouts', label: 'Payouts', icon: ArrowDownRight },
            { id: 'bank-accounts', label: 'Bank Accounts', icon: Bank },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-3 font-sequel text-sm transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-tiktok-primary text-tiktok-primary'
                    : `border-transparent ${theme.text.secondary} hover:${theme.text.primary}`
                }`}
              >
                <Icon size={18} weight="regular" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* User Details */}
            <div>
              <h3 className={`font-monument font-bold text-lg mb-4 ${theme.text.primary}`}>
                User Details
              </h3>
              <div className={`p-4 rounded-xl border space-y-3 ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
              }`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone size={20} weight="regular" className={theme.icon.default} />
                      <div>
                        <p className={`text-xs font-sequel ${theme.text.secondary}`}>Phone</p>
                        <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                          {user.phone}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <Calendar size={20} weight="regular" className={theme.icon.default} />
                    <div>
                      <p className={`text-xs font-sequel ${theme.text.secondary}`}>Joined</p>
                      <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                        {new Date(user.joinedAt || user.createdAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Wallet size={20} weight="regular" className={theme.icon.default} />
                    <div>
                      <p className={`text-xs font-sequel ${theme.text.secondary}`}>Wallet Status</p>
                      <p className={`font-semibold font-sequel capitalize ${getStatusColor(user.walletStatus)}`}>
                        {user.walletStatus}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield size={20} weight="regular" className={theme.icon.default} />
                    <div>
                      <p className={`text-xs font-sequel ${theme.text.secondary}`}>Account Status</p>
                      <p className={`font-semibold font-sequel capitalize ${getStatusColor(user.status)}`}>
                        {user.status}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className={`font-monument font-bold text-lg mb-4 ${theme.text.primary}`}>
                Recent Activity
              </h3>
              <div className={`rounded-xl border overflow-hidden ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
              }`}>
                {transactions.slice(0, 5).length === 0 ? (
                  <div className="p-8 text-center">
                    <p className={`font-sequel ${theme.text.muted}`}>No recent activity</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/10">
                    {transactions.slice(0, 5).map((tx) => (
                      <div key={tx.id} className="p-4 hover:bg-white/5 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {tx.type === 'credit' ? (
                              <ArrowUpRight size={20} weight="regular" className="text-green-400" />
                            ) : (
                              <ArrowDownRight size={20} weight="regular" className="text-tiktok-primary" />
                            )}
                            <div>
                              <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                                {tx.description}
                              </p>
                              <p className={`text-xs font-sequel ${theme.text.muted}`}>
                                {new Date(tx.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold font-sequel ${
                              tx.type === 'credit' || tx.type === 'deposit' ? 'text-green-400' : theme.text.primary
                            }`}>
                              {(tx.type === 'credit' || tx.type === 'deposit') ? '+' : '-'}
                              {formatCurrency(tx.amount, tx.currency)}
                            </p>
                            {getStatusBadge(tx.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div>
            <h3 className={`font-monument font-bold text-lg mb-4 ${theme.text.primary}`}>
              All Transactions
            </h3>
            {transactions.length === 0 ? (
              <div className={`p-8 text-center rounded-xl border ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
              }`}>
                <p className={`font-sequel ${theme.text.muted}`}>No transactions found</p>
              </div>
            ) : (
              <div className={`rounded-xl border overflow-hidden ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
              }`}>
                <div className="divide-y divide-white/10">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="p-4 hover:bg-white/5 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {tx.type === 'credit' || tx.type === 'deposit' ? (
                            <ArrowUpRight size={20} weight="regular" className="text-green-400" />
                          ) : (
                            <ArrowDownRight size={20} weight="regular" className="text-tiktok-primary" />
                          )}
                          <div>
                            <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                              {tx.description}
                            </p>
                            <p className={`text-xs font-sequel ${theme.text.muted}`}>
                              {new Date(tx.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold font-sequel ${
                            tx.type === 'credit' || tx.type === 'deposit' ? 'text-green-400' : theme.text.primary
                          }`}>
                            {(tx.type === 'credit' || tx.type === 'deposit') ? '+' : '-'}
                            {formatCurrency(tx.amount, tx.currency)}
                          </p>
                          {/* Show USD equivalent for NGN transactions */}
                          {tx.currency === 'NGN' && tx.amountInNgn && (
                            <p className={`text-xs font-sequel ${theme.text.muted}`}>
                              ≈ ${(tx.amount / 1500).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </p>
                          )}
                          {/* Show NGN equivalent for USD transactions */}
                          {tx.currency === 'USD' && tx.amountInNgn && (
                            <p className={`text-xs font-sequel ${theme.text.muted}`}>
                              ≈ ₦{tx.amountInNgn.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </p>
                          )}
                          <div className="mt-1">
                            {getStatusBadge(tx.status)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'credit-requests' && (
          <div>
            <h3 className={`font-monument font-bold text-lg mb-4 ${theme.text.primary}`}>
              Credit Requests
            </h3>
            {creditRequests.length === 0 ? (
              <div className={`p-8 text-center rounded-xl border ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
              }`}>
                <p className={`font-sequel ${theme.text.muted}`}>No credit requests found</p>
              </div>
            ) : (
              <div className={`rounded-xl border overflow-hidden ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
              }`}>
                <div className="divide-y divide-white/10">
                  {creditRequests.map((cr) => (
                    <div key={cr.id} className="p-4 hover:bg-white/5 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                            Credit Request #{cr.id.slice(0, 8)}
                          </p>
                          <p className={`text-xs font-sequel ${theme.text.muted}`}>
                            {new Date(cr.submittedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold font-sequel text-green-400`}>
                            ${cr.amount.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                          <div className="mt-1">
                            {getStatusBadge(cr.status)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'payouts' && (
          <div>
            <h3 className={`font-monument font-bold text-lg mb-4 ${theme.text.primary}`}>
              Payout Requests
            </h3>
            {payoutRequests.length === 0 ? (
              <div className={`p-8 text-center rounded-xl border ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
              }`}>
                <p className={`font-sequel ${theme.text.muted}`}>No payout requests found</p>
              </div>
            ) : (
              <div className={`rounded-xl border overflow-hidden ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
              }`}>
                <div className="divide-y divide-white/10">
                  {payoutRequests.map((pr) => (
                    <div key={pr.id} className="p-4 hover:bg-white/5 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                            Payout Request #{pr.id.slice(0, 8)}
                          </p>
                          <p className={`text-xs font-sequel ${theme.text.muted}`}>
                            {new Date(pr.requestedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                            ${pr.amount.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                          {pr.amountInNgn > 0 && (
                            <p className={`text-xs font-sequel ${theme.text.muted}`}>
                              ₦{pr.amountInNgn.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })} → ₦{pr.netAmount.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </p>
                          )}
                          <div className="mt-1">
                            {getStatusBadge(pr.status)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'bank-accounts' && (
          <div>
            <h3 className={`font-monument font-bold text-lg mb-4 ${theme.text.primary}`}>
              Bank Accounts
            </h3>
            {bankAccounts.length === 0 ? (
              <div className={`p-8 text-center rounded-xl border ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
              }`}>
                <p className={`font-sequel ${theme.text.muted}`}>No bank accounts found</p>
              </div>
            ) : (
              <div className={`rounded-xl border overflow-hidden ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
              }`}>
                <div className="divide-y divide-white/10">
                  {bankAccounts.map((ba) => (
                    <div key={ba.id} className="p-4 hover:bg-white/5 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                            {ba.accountName}
                          </p>
                          <p className={`text-sm font-sequel ${theme.text.secondary}`}>
                            {ba.bankName} • ••••{ba.accountNumber?.slice(-4) || ba.accountNumber}
                          </p>
                          {ba.accountNumber && (
                            <p className={`text-xs font-sequel ${theme.text.muted} font-mono`}>
                              Account: {ba.accountNumber}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {ba.isVerified && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold font-sequel bg-green-500/20 text-green-400">
                              Verified
                            </span>
                          )}
                          {ba.isPrimary && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold font-sequel bg-blue-500/20 text-blue-400">
                              Primary
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

