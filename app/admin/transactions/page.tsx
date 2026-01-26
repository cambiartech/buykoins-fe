'use client'

import {
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  MagnifyingGlass,
  Funnel,
  Eye,
  X,
  Wallet,
  ChartBar,
  Download,
  FileArrowDown
} from '@phosphor-icons/react'
import { useState, useEffect } from 'react'
import { useAdminTheme } from '../hooks/useTheme'
import { getThemeClasses } from '../utils/theme'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'
import Pagination from '../components/Pagination'
import { DatePicker } from '../components/DatePicker'
import { Select } from '../components/Select'
import { UserLink } from '../components/UserLink'
import { TransactionDetailModal } from './components/TransactionDetailModal'

interface TransactionUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  username?: string
  balance?: number
}

interface Transaction {
  id: string
  userId: string
  user: TransactionUser | null
  type: 'credit' | 'withdrawal' | 'payout' | 'deposit' | 'card_funding' | 'transfer_earnings_to_wallet' | 'card_purchase'
  amount: number
  currency?: 'USD' | 'NGN' // CRITICAL: Use this field to display correct currency
  amountInNgn?: number | null
  exchangeRate?: number | null
  processingFee?: number | null
  netAmount?: number | null
  status: 'completed' | 'pending' | 'rejected'
  description: string
  referenceId: string
  date: string
  createdAt: string
}

interface TransactionStats {
  summary: {
    totalTransactions: number
    totalCredits: number
    totalWithdrawals: number
    netBalance: number
    totalVolume: number
    completedCredits: number
    completedWithdrawals: number
    completedNetBalance: number
  }
  byType: Array<{
    type: string
    count: number
    totalAmount: number
  }>
  byStatus: Array<{
    status: string
    count: number
  }>
}

// Helper function to format currency based on currency field
const formatCurrency = (amount: number, currency: 'USD' | 'NGN' | undefined = 'USD') => {
  const symbol = currency === 'NGN' ? '₦' : '$'
  return `${symbol}${Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export default function TransactionsPage() {
  const isDark = useAdminTheme()
  const theme = getThemeClasses(isDark)
  const toast = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'withdrawal' | 'payout' | 'deposit' | 'card_funding' | 'transfer_earnings_to_wallet' | 'card_purchase'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'rejected'>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [stats, setStats] = useState<TransactionStats | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const itemsPerPage = 20

  useEffect(() => {
    fetchTransactions()
    fetchStats()
  }, [currentPage, filterType, filterStatus, dateFrom, dateTo, searchQuery])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filterType, filterStatus, dateFrom, dateTo])

  const fetchTransactions = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.admin.getTransactions({
        page: currentPage,
        limit: itemsPerPage,
        type: filterType !== 'all' ? filterType : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: searchQuery || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      })

      if (response.success && response.data) {
        const data = response.data as any
        setTransactions(Array.isArray(data.transactions) ? data.transactions : [])
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1)
          setTotalItems(data.pagination.totalItems || 0)
        } else {
          setTotalPages(1)
          setTotalItems(data.transactions?.length || 0)
        }
        setError(null)
      } else {
        const errorMsg = response.message || 'Failed to load transactions'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const errorMsg = error.message || 'Failed to load transactions'
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

  const fetchStats = async () => {
    setIsLoadingStats(true)
    try {
      const response = await api.admin.getTransactionStats({
        type: filterType !== 'all' ? filterType : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      })

      if (response.success && response.data) {
        setStats(response.data as TransactionStats)
      }
    } catch (error) {
      // Silently fail stats - not critical
      console.error('Failed to load stats:', error)
    } finally {
      setIsLoadingStats(false)
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setFilterType('all')
    setFilterStatus('all')
    setDateFrom('')
    setDateTo('')
    setCurrentPage(1)
  }

  const hasActiveFilters = filterType !== 'all' || filterStatus !== 'all' || dateFrom || dateTo || searchQuery

  const exportToCSV = () => {
    if (transactions.length === 0) {
      toast.error('No transactions to export')
      return
    }

    // Prepare CSV headers
    const headers = [
      'ID',
      'User Email',
      'User Name',
      'Type',
      'Amount (USD)',
      'Amount (NGN)',
      'Exchange Rate',
      'Processing Fee',
      'Net Amount',
      'Status',
      'Description',
      'Reference ID',
      'Date',
    ]

    // Prepare CSV rows
    const rows = transactions.map((tx) => [
      tx.id,
      tx.user?.email || '',
      tx.user?.firstName && tx.user?.lastName
        ? `${tx.user.firstName} ${tx.user.lastName}`
        : tx.user?.email || '',
      tx.type,
      tx.amount.toString(),
      tx.amountInNgn?.toString() || '',
      tx.exchangeRate?.toString() || '',
      tx.processingFee?.toString() || '',
      tx.netAmount?.toString() || '',
      tx.status,
      tx.description,
      tx.referenceId,
      new Date(tx.date).toLocaleString('en-US'),
    ])

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('Transactions exported successfully')
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className={`font-monument font-bold text-2xl mb-2 ${theme.text.primary}`}>Transactions</h2>
        <p className={`font-sequel ${theme.text.secondary}`}>View and manage all platform transactions</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className={`mb-6 p-4 rounded-xl ${
          isDark 
            ? 'bg-red-500/20 border border-red-500/50' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <p className={`text-sm font-sequel ${
              isDark ? 'text-red-300' : 'text-red-600'
            }`}>{error}</p>
            <button
              onClick={fetchTransactions}
              className={`text-sm font-sequel hover:underline ${
                isDark ? 'text-red-300' : 'text-red-600'
              }`}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      {stats && !isLoadingStats && stats.summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className={`rounded-xl border p-6 ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <p className={`text-sm font-sequel ${theme.text.secondary}`}>Total Transactions</p>
              <ChartBar size={20} weight="regular" className={theme.icon.default} />
            </div>
            <p className={`font-monument font-bold text-2xl ${theme.text.primary}`}>
              {(stats.summary.totalTransactions || 0).toLocaleString()}
            </p>
          </div>
          <div className={`rounded-xl border p-6 ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <p className={`text-sm font-sequel ${theme.text.secondary}`}>Total Credits</p>
              <ArrowUpRight size={20} weight="regular" className="text-green-400" />
            </div>
            <p className={`font-monument font-bold text-2xl text-green-400`}>
              ${(stats.summary.totalCredits || 0).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className={`rounded-xl border p-6 ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <p className={`text-sm font-sequel ${theme.text.secondary}`}>Total Withdrawals</p>
              <ArrowDownRight size={20} weight="regular" className="text-tiktok-primary" />
            </div>
            <p className={`font-monument font-bold text-2xl text-tiktok-primary`}>
              ${(stats.summary.totalWithdrawals || 0).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className={`rounded-xl border p-6 ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <p className={`text-sm font-sequel ${theme.text.secondary}`}>Net Balance</p>
              <Wallet size={20} weight="regular" className="text-blue-400" />
            </div>
            <p className={`font-monument font-bold text-2xl text-blue-400`}>
              ${(stats.summary.netBalance || 0).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className={`text-xs font-sequel mt-1 ${theme.text.muted}`}>
              Credits - Withdrawals
            </p>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlass 
              size={20} 
              weight="regular" 
              className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${theme.icon.default}`} 
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by user, email, description..."
              className={`w-full ${theme.bg.input} ${theme.border.input} rounded-xl pl-12 pr-4 py-3 ${theme.text.primary} ${theme.text.placeholder} focus:outline-none focus:ring-2 focus:ring-tiktok-primary font-sequel`}
            />
          </div>

          {/* Export Button */}
          <button
            onClick={exportToCSV}
            disabled={transactions.length === 0 || isLoading}
            className={`flex items-center space-x-2 px-4 py-3 rounded-xl border font-sequel transition-colors ${
              isDark
                ? 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Download size={20} weight="regular" />
            <span>Export</span>
          </button>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-3 rounded-xl border font-sequel transition-colors ${
              isDark
                ? hasActiveFilters
                  ? 'bg-tiktok-primary/20 border-tiktok-primary/50 text-tiktok-primary'
                  : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                : hasActiveFilters
                ? 'bg-tiktok-primary/10 border-tiktok-primary/30 text-tiktok-primary'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Funnel size={20} weight="regular" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                isDark ? 'bg-tiktok-primary/30' : 'bg-tiktok-primary/20'
              }`}>
                Active
              </span>
            )}
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className={`rounded-xl border p-4 space-y-4 ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className={`font-semibold font-sequel ${theme.text.primary}`}>Advanced Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className={`text-sm font-sequel hover:underline ${
                    isDark ? 'text-tiktok-primary' : 'text-tiktok-primary'
                  }`}
                >
                  Clear All
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Type Filter */}
              <div>
                <label className={`block text-xs font-semibold font-sequel mb-2 ${theme.text.secondary}`}>
                  Type
                </label>
                <Select
                  value={filterType}
                  onChange={(value) => setFilterType(value as any)}
                  options={[
                    { value: 'all', label: 'All Types' },
                    { value: 'credit', label: 'Credit' },
                    { value: 'withdrawal', label: 'Withdrawal' },
                    { value: 'payout', label: 'Payout' },
                  ]}
                  placeholder="Select type"
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className={`block text-xs font-semibold font-sequel mb-2 ${theme.text.secondary}`}>
                  Status
                </label>
                <Select
                  value={filterStatus}
                  onChange={(value) => setFilterStatus(value as any)}
                  options={[
                    { value: 'all', label: 'All Status' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'rejected', label: 'Rejected' },
                  ]}
                  placeholder="Select status"
                />
              </div>

              {/* Date From */}
              <div>
                <label className={`block text-xs font-semibold font-sequel mb-2 ${theme.text.secondary}`}>
                  From Date
                </label>
                <DatePicker
                  value={dateFrom}
                  onChange={setDateFrom}
                  placeholder="Select start date"
                  maxDate={dateTo || undefined}
                />
              </div>

              {/* Date To */}
              <div>
                <label className={`block text-xs font-semibold font-sequel mb-2 ${theme.text.secondary}`}>
                  To Date
                </label>
                <DatePicker
                  value={dateTo}
                  onChange={setDateTo}
                  placeholder="Select end date"
                  minDate={dateFrom || undefined}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transactions Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-tiktok-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : transactions.length === 0 ? (
        <div className={`text-center py-12 rounded-xl border ${
          isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
        }`}>
          <p className={`font-sequel ${theme.text.muted}`}>
            {hasActiveFilters ? 'No transactions found matching your filters' : 'No transactions found'}
          </p>
        </div>
      ) : (
        <>
          <div className={`${theme.bg.card} ${theme.border.default} rounded-xl overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDark ? 'bg-white/5' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-xs font-semibold font-sequel uppercase tracking-wider ${theme.text.secondary}`}>User</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold font-sequel uppercase tracking-wider ${theme.text.secondary}`}>Type</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold font-sequel uppercase tracking-wider ${theme.text.secondary}`}>Amount</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold font-sequel uppercase tracking-wider ${theme.text.secondary}`}>Status</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold font-sequel uppercase tracking-wider ${theme.text.secondary}`}>Date</th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold font-sequel uppercase tracking-wider ${theme.text.secondary}`}>Actions</th>
                  </tr>
                </thead>
                <tbody className={isDark ? 'divide-y divide-white/10' : 'divide-y divide-gray-200'}>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className={`hover:${
                      isDark ? 'bg-white/5' : 'bg-gray-50'
                    } transition-colors`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {transaction.user ? (
                          <UserLink
                            userId={transaction.userId}
                            firstName={transaction.user.firstName}
                            lastName={transaction.user.lastName}
                            email={transaction.user.email}
                            username={transaction.user.username}
                          />
                        ) : (
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isDark ? 'bg-tiktok-primary/20' : 'bg-tiktok-primary/10'
                            }`}>
                              <CreditCard size={20} weight="regular" className="text-tiktok-primary" />
                            </div>
                            <div>
                              <p className={`font-semibold font-sequel ${
                                isDark ? 'text-white' : 'text-gray-900'
                              }`}>
                                {transaction.userId}
                              </p>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {transaction.type === 'credit' ? (
                            <ArrowUpRight size={18} weight="regular" className="text-green-400" />
                          ) : (
                            <ArrowDownRight size={18} weight="regular" className="text-tiktok-primary" />
                          )}
                          <span className={`text-sm font-sequel capitalize ${
                            isDark ? 'text-white/80' : 'text-gray-700'
                          }`}>
                            {transaction.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className={`font-semibold font-sequel ${
                            transaction.type === 'credit' || transaction.type === 'deposit'
                              ? 'text-green-400'
                              : isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {(transaction.type === 'credit' || transaction.type === 'deposit') ? '+' : '-'}
                            {formatCurrency(transaction.amount, transaction.currency)}
                          </p>
                          {/* Show USD equivalent for NGN transactions */}
                          {transaction.currency === 'NGN' && transaction.amountInNgn && transaction.amountInNgn !== transaction.amount && (
                            <p className={`text-xs font-sequel ${theme.text.muted}`}>
                              ≈ ${(transaction.amountInNgn / (transaction.exchangeRate || 1500)).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </p>
                          )}
                          {/* Show NGN equivalent for USD transactions */}
                          {transaction.currency === 'USD' && transaction.amountInNgn && (
                            <p className={`text-xs font-sequel ${theme.text.muted}`}>
                              ≈ ₦{transaction.amountInNgn.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold font-sequel ${
                          transaction.status === 'completed'
                            ? 'bg-green-500/20 text-green-400'
                            : transaction.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className={`text-sm font-sequel ${theme.text.secondary}`}>
                          {new Date(transaction.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedTransaction(transaction)
                            setShowDetailModal(true)
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            isDark
                              ? 'text-white/70 hover:text-white hover:bg-white/10'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                          }`}
                          title="View Details"
                        >
                          <Eye size={18} weight="regular" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems}
              />
            </div>
          )}
        </>
      )}

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <TransactionDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedTransaction(null)
          }}
          transactionId={selectedTransaction.id}
          initialTransaction={selectedTransaction}
        />
      )}
    </div>
  )
}
