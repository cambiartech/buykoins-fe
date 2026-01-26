'use client'

import {
  Wallet,
  ArrowDownRight,
  MagnifyingGlass,
  Funnel,
  Download,
  ChartBar,
  CurrencyDollar,
  Receipt,
  FileArrowDown
} from '@phosphor-icons/react'
import { useState, useEffect } from 'react'
import { useAdminTheme } from '../hooks/useTheme'
import { getThemeClasses } from '../utils/theme'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'
import { DatePicker } from '../components/DatePicker'
import { Select } from '../components/Select'
import { UserLink } from '../components/UserLink'

interface FinanceTransactionUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
}

interface FinanceTransaction {
  id: string
  userId: string
  user: FinanceTransactionUser | null
  type: 'payout' | 'withdrawal'
  amount: number
  amountInNgn?: number | null
  exchangeRate?: number | null
  processingFee?: number | null
  netAmount?: number | null
  status: 'completed' | 'pending' | 'rejected'
  description: string
  date: string
  createdAt: string
}

interface FinanceSummary {
  totalTransactions: number
  totalAmountUsd: number
  totalAmountNgn: number
  totalProcessingFees: number
  totalNetAmount: number
  averageExchangeRate: number
}

export default function FinanceReportPage() {
  const isDark = useAdminTheme()
  const theme = getThemeClasses(isDark)
  const toast = useToast()
  const [filterType, setFilterType] = useState<'all' | 'payout' | 'withdrawal'>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [summary, setSummary] = useState<FinanceSummary | null>(null)
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchFinanceReport()
  }, [filterType, dateFrom, dateTo])

  const fetchFinanceReport = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.admin.getFinanceReport({
        type: filterType !== 'all' ? filterType : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      })

      if (response.success && response.data) {
        const data = response.data as any
        setSummary(data.summary || null)
        setTransactions(Array.isArray(data.transactions) ? data.transactions : [])
        setError(null)
      } else {
        const errorMsg = response.message || 'Failed to load finance report'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const errorMsg = error.message || 'Failed to load finance report'
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

  const clearFilters = () => {
    setFilterType('all')
    setDateFrom('')
    setDateTo('')
  }

  const hasActiveFilters = filterType !== 'all' || dateFrom || dateTo

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
      'Processing Fee (NGN)',
      'Net Amount (NGN)',
      'Status',
      'Description',
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
    link.setAttribute('download', `finance_report_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('Finance report exported successfully')
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className={`font-monument font-bold text-2xl mb-2 ${theme.text.primary}`}>Finance Report</h2>
        <p className={`font-sequel ${theme.text.secondary}`}>Financial data for bookkeeping and analysis</p>
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
              onClick={fetchFinanceReport}
              className={`text-sm font-sequel hover:underline ${
                isDark ? 'text-red-300' : 'text-red-600'
              }`}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {summary && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className={`rounded-xl border p-6 ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <p className={`text-sm font-sequel ${theme.text.secondary}`}>Total Transactions</p>
              <ChartBar size={20} weight="regular" className={theme.icon.default} />
            </div>
            <p className={`font-monument font-bold text-2xl ${theme.text.primary}`}>
              {(summary.totalTransactions || 0).toLocaleString()}
            </p>
          </div>
          <div className={`rounded-xl border p-6 ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <p className={`text-sm font-sequel ${theme.text.secondary}`}>Total Amount (USD)</p>
              <CurrencyDollar size={20} weight="regular" className={theme.icon.default} />
            </div>
            <p className={`font-monument font-bold text-2xl ${theme.text.primary}`}>
              ${(summary.totalAmountUsd || 0).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className={`rounded-xl border p-6 ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <p className={`text-sm font-sequel ${theme.text.secondary}`}>Total Amount (NGN)</p>
              <Wallet size={20} weight="regular" className={theme.icon.default} />
            </div>
            <p className={`font-monument font-bold text-2xl ${theme.text.primary}`}>
              ₦{(summary.totalAmountNgn || 0).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className={`rounded-xl border p-6 ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <p className={`text-sm font-sequel ${theme.text.secondary}`}>Total Processing Fees</p>
              <Receipt size={20} weight="regular" className="text-yellow-400" />
            </div>
            <p className={`font-monument font-bold text-2xl text-yellow-400`}>
              ₦{(summary.totalProcessingFees || 0).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className={`rounded-xl border p-6 ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <p className={`text-sm font-sequel ${theme.text.secondary}`}>Total Net Amount</p>
              <ArrowDownRight size={20} weight="regular" className="text-green-400" />
            </div>
            <p className={`font-monument font-bold text-2xl text-green-400`}>
              ₦{(summary.totalNetAmount || 0).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className={`rounded-xl border p-6 ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <p className={`text-sm font-sequel ${theme.text.secondary}`}>Average Exchange Rate</p>
              <ChartBar size={20} weight="regular" className="text-blue-400" />
            </div>
            <p className={`font-monument font-bold text-2xl text-blue-400`}>
              ₦{(summary.averageExchangeRate || 0).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
            <p className={`text-xs font-sequel mt-1 ${theme.text.muted}`}>
              per $1 USD
            </p>
          </div>
        </div>
      )}

      {/* Filters and Export */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
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
            <span>Export Report</span>
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
              <h3 className={`font-semibold font-sequel ${theme.text.primary}`}>Filters</h3>
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    { value: 'payout', label: 'Payout' },
                    { value: 'withdrawal', label: 'Withdrawal' },
                  ]}
                  placeholder="Select type"
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
        <div className={`${theme.bg.card} ${theme.border.default} rounded-xl overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDark ? 'bg-white/5' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-4 text-left text-xs font-semibold font-sequel uppercase tracking-wider ${theme.text.secondary}`}>User</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold font-sequel uppercase tracking-wider ${theme.text.secondary}`}>Type</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold font-sequel uppercase tracking-wider ${theme.text.secondary}`}>Amount (USD)</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold font-sequel uppercase tracking-wider ${theme.text.secondary}`}>Amount (NGN)</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold font-sequel uppercase tracking-wider ${theme.text.secondary}`}>Exchange Rate</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold font-sequel uppercase tracking-wider ${theme.text.secondary}`}>Processing Fee</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold font-sequel uppercase tracking-wider ${theme.text.secondary}`}>Net Amount</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold font-sequel uppercase tracking-wider ${theme.text.secondary}`}>Status</th>
                  <th className={`px-6 py-4 text-left text-xs font-semibold font-sequel uppercase tracking-wider ${theme.text.secondary}`}>Date</th>
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
                        />
                      ) : (
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isDark ? 'bg-tiktok-primary/20' : 'bg-tiktok-primary/10'
                          }`}>
                            <Wallet size={20} weight="regular" className="text-tiktok-primary" />
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
                      <span className={`text-sm font-sequel capitalize ${
                        isDark ? 'text-white/80' : 'text-gray-700'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                        ${transaction.amount.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transaction.amountInNgn != null ? (
                        <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                          ₦{transaction.amountInNgn.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      ) : (
                        <p className={`font-semibold font-sequel ${theme.text.muted}`}>N/A</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transaction.exchangeRate != null ? (
                        <p className={`text-sm font-sequel ${theme.text.secondary}`}>
                          ₦{transaction.exchangeRate.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      ) : (
                        <p className={`text-sm font-sequel ${theme.text.muted}`}>N/A</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transaction.processingFee != null ? (
                        <p className={`font-semibold font-sequel text-yellow-400`}>
                          ₦{transaction.processingFee.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      ) : (
                        <p className={`font-semibold font-sequel ${theme.text.muted}`}>N/A</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transaction.netAmount != null ? (
                        <p className={`font-semibold font-sequel text-green-400`}>
                          ₦{transaction.netAmount.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      ) : (
                        <p className={`font-semibold font-sequel ${theme.text.muted}`}>N/A</p>
                      )}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

