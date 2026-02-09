'use client'

import {
  ArrowDownRight,
  CheckCircle,
  XCircle,
  MagnifyingGlass,
  Funnel,
  Eye,
  Clock
} from '@phosphor-icons/react'
import { useState, useEffect } from 'react'
import { useAdminTheme } from '../hooks/useTheme'
import { getThemeClasses } from '../utils/theme'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'
import Pagination from '../components/Pagination'
import { UserLink } from '../components/UserLink'
import { PayoutDetailModal } from './components/PayoutDetailModal'
import { ProcessPayoutModal } from './components/ProcessPayoutModal'
import { RejectPayoutModal } from './components/RejectPayoutModal'

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
  processedAt?: string | null
  completedAt?: string | null
  processedBy?: string | null
  transactionReference?: string | null
  rejectionReason?: string | null
  notes?: string | null
}

export default function PayoutsPage() {
  const isDark = useAdminTheme()
  const theme = getThemeClasses(isDark)
  const toast = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'processing' | 'completed' | 'rejected'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showProcessModal, setShowProcessModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const itemsPerPage = 10

  useEffect(() => {
    fetchPayouts()
  }, [currentPage, filterStatus])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filterStatus])

  const fetchPayouts = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.admin.getPayouts({
        page: currentPage,
        limit: itemsPerPage,
        status: filterStatus !== 'all' ? filterStatus : undefined,
      })

      if (response.success && response.data) {
        const data = response.data as any
        setPayouts(Array.isArray(data.payouts) ? data.payouts : [])
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1)
          setTotalItems(data.pagination.totalItems || 0)
        } else {
          setTotalPages(1)
          setTotalItems(data.payouts?.length || 0)
        }
        setError(null)
      } else {
        const errorMsg = response.message || 'Failed to load payouts'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const errorMsg = error.message || 'Failed to load payouts'
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

  const filteredPayouts = payouts.filter(payout => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    const user = payout.user
    const email = user?.email?.toLowerCase() || ''
    const firstName = user?.firstName?.toLowerCase() || ''
    const lastName = user?.lastName?.toLowerCase() || ''
    const amount = payout.amount.toString()
    return email.includes(query) || 
           firstName.includes(query) || 
           lastName.includes(query) ||
           amount.includes(query)
  })

  const handleProcess = async (id: string, data?: { transactionReference?: string; notes?: string }) => {
    try {
      const response = await api.admin.processPayout(id, data)
      if (response.success) {
        toast.success(response.message || 'Payout processed successfully')
        await fetchPayouts()
        setShowProcessModal(false)
        setSelectedPayout(null)
      } else {
        const errorMsg = response.message || 'Failed to process payout'
        toast.error(errorMsg)
        throw new Error(errorMsg)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message || 'Failed to process payout')
      } else if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('An unexpected error occurred')
      }
      throw error
    }
  }

  const handleCompleteManual = async (id: string, data: { transactionReference: string; notes?: string }) => {
    try {
      const response = await api.admin.completePayoutManual(id, data)
      if (response.success) {
        toast.success(response.message || 'Payout completed manually')
        await fetchPayouts()
        setShowProcessModal(false)
        setSelectedPayout(null)
      } else {
        const errorMsg = response.message || 'Failed to complete payout manually'
        toast.error(errorMsg)
        throw new Error(errorMsg)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message || 'Failed to complete payout manually')
      } else if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('An unexpected error occurred')
      }
      throw error
    }
  }

  const handleReject = async (id: string, rejectionReason: string) => {
    try {
      const response = await api.admin.rejectPayout(id, rejectionReason)
      if (response.success) {
        toast.success(response.message || 'Payout rejected successfully')
        await fetchPayouts()
        setShowRejectModal(false)
        setSelectedPayout(null)
      } else {
        const errorMsg = response.message || 'Failed to reject payout'
        toast.error(errorMsg)
        throw new Error(errorMsg)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const errorMsg = error.message || 'Failed to reject payout'
        toast.error(errorMsg)
        throw new Error(errorMsg)
      } else if (error instanceof Error) {
        toast.error(error.message)
        throw error
      } else {
        const errorMsg = 'An unexpected error occurred'
        toast.error(errorMsg)
        throw new Error(errorMsg)
      }
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className={`font-monument font-bold text-2xl mb-2 ${theme.text.primary}`}>Payout Management</h2>
        <p className={`font-sequel ${theme.text.secondary}`}>Process and manage user withdrawals</p>
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
              onClick={fetchPayouts}
              className={`text-sm font-sequel hover:underline ${
                isDark ? 'text-red-300' : 'text-red-600'
              }`}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="mb-6 flex items-center space-x-4">
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
            placeholder="Search by user email, name, or amount..."
            className={`w-full ${theme.bg.input} ${theme.border.input} rounded-xl pl-12 pr-4 py-3 ${theme.text.primary} ${theme.text.placeholder} focus:outline-none focus:ring-2 focus:ring-tiktok-primary font-sequel`}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Funnel size={20} weight="regular" className={theme.icon.hover} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className={`${theme.bg.input} ${theme.border.input} rounded-xl px-4 py-3 ${theme.text.primary} focus:outline-none focus:ring-2 focus:ring-tiktok-primary font-sequel`}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-tiktok-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredPayouts.length === 0 ? (
        <div className={`text-center py-12 rounded-xl border ${
          isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
        }`}>
          <p className={`font-sequel ${theme.text.muted}`}>
            {searchQuery || filterStatus !== 'all' ? 'No payouts found matching your filters' : 'No payouts found'}
          </p>
        </div>
      ) : (
        <>
          <div className={`${theme.bg.card} ${theme.border.default} rounded-xl overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDark ? 'bg-white/5' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-sm font-semibold font-sequel ${theme.text.secondary}`}>User</th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold font-sequel ${theme.text.secondary}`}>Amount</th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold font-sequel ${theme.text.secondary}`}>Bank Account</th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold font-sequel ${theme.text.secondary}`}>Requested</th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold font-sequel ${theme.text.secondary}`}>Status</th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold font-sequel ${theme.text.secondary}`}>Actions</th>
                  </tr>
                </thead>
                <tbody className={isDark ? 'divide-y divide-white/10' : 'divide-y divide-gray-200'}>
                  {filteredPayouts.map((payout) => (
                    <tr key={payout.id} className={theme.bg.hover + ' transition-colors'}>
                      <td className="px-6 py-4">
                        {payout.user ? (
                          <UserLink
                            userId={payout.userId}
                            firstName={payout.user.firstName}
                            lastName={payout.user.lastName}
                            email={payout.user.email}
                          />
                        ) : (
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-tiktok-primary/20 rounded-full flex items-center justify-center">
                              <ArrowDownRight size={20} weight="regular" className="text-tiktok-primary" />
                            </div>
                            <div>
                              <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                                {payout.userId}
                              </p>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                            ${payout.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <p className={`text-xs font-sequel ${theme.text.muted}`}>
                            ₦{payout.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} net
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className={`text-sm font-sequel ${theme.text.secondary}`}>
                            {payout.bankAccount.accountName}
                          </p>
                          <p className={`text-xs font-sequel ${theme.text.muted}`}>
                            {payout.bankAccount.bankName} • {payout.bankAccount.accountNumber.slice(-4)}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className={`text-sm font-sequel ${theme.text.secondary}`}>
                          {new Date(payout.requestedAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold font-sequel ${
                          payout.status === 'pending' 
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : payout.status === 'processing'
                            ? 'bg-blue-500/20 text-blue-400'
                            : payout.status === 'completed'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedPayout(payout)
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
                          {payout.status === 'pending' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedPayout(payout)
                                  setShowProcessModal(true)
                                }}
                                className="flex items-center space-x-1 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
                                title="Process Payout"
                              >
                                <CheckCircle size={16} weight="regular" />
                                <span className="text-xs font-sequel">Process</span>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedPayout(payout)
                                  setShowRejectModal(true)
                                }}
                                className="flex items-center space-x-1 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                                title="Reject Payout"
                              >
                                <XCircle size={16} weight="regular" />
                                <span className="text-xs font-sequel">Reject</span>
                              </button>
                            </>
                          )}
                          {payout.status === 'processing' && (
                            <span className="text-blue-400 text-sm font-sequel flex items-center space-x-1">
                              <Clock size={16} weight="regular" />
                              <span>Processing...</span>
                            </span>
                          )}
                          {payout.status === 'completed' && (
                            <span className="text-green-400 text-sm font-sequel flex items-center space-x-1">
                              <CheckCircle size={16} weight="regular" />
                              <span>Completed</span>
                            </span>
                          )}
                        </div>
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

      {/* Payout Detail Modal */}
      {selectedPayout && (
        <PayoutDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedPayout(null)
          }}
          payoutId={selectedPayout.id}
          initialPayout={selectedPayout}
          onProcess={() => {
            setShowDetailModal(false)
            setShowProcessModal(true)
          }}
          onReject={() => {
            setShowDetailModal(false)
            setShowRejectModal(true)
          }}
        />
      )}

      {/* Process Payout Modal */}
      {selectedPayout && (
        <ProcessPayoutModal
          isOpen={showProcessModal}
          onClose={() => {
            setShowProcessModal(false)
            setSelectedPayout(null)
          }}
          payout={selectedPayout}
          onProcess={handleProcess}
          onCompleteManual={handleCompleteManual}
        />
      )}

      {/* Reject Payout Modal */}
      {selectedPayout && (
        <RejectPayoutModal
          isOpen={showRejectModal}
          onClose={() => {
            setShowRejectModal(false)
            setSelectedPayout(null)
          }}
          payout={selectedPayout}
          onReject={handleReject}
        />
      )}
    </div>
  )
}
