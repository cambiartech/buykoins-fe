'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { Clock, CheckCircle, XCircle, Eye, MagnifyingGlass } from '@phosphor-icons/react'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'
import Pagination from '../components/Pagination'
import { CreditRequestDetailModal } from './components/CreditRequestDetailModal'
import { ApproveCreditRequestModal } from './components/ApproveCreditRequestModal'
import { RejectCreditRequestModal } from './components/RejectCreditRequestModal'

interface CreditRequest {
  id: string
  amount: number
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  processedAt: string | null
  rejectionReason: string | null
  proofUrl: string | null
  user: {
    id: string
    email: string
    firstName?: string
    lastName?: string
    phone?: string
    balance?: number
  } | null
}

export default function CreditRequestsPage() {
  const { isDark } = useTheme()
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [creditRequests, setCreditRequests] = useState<CreditRequest[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<CreditRequest | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showApproveRejectModal, setShowApproveRejectModal] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const limit = 10

  useEffect(() => {
    fetchCreditRequests()
  }, [currentPage, statusFilter, searchQuery])

  const fetchCreditRequests = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.admin.getCreditRequests({
        page: currentPage,
        limit,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchQuery || undefined,
      })

      if (response.success && response.data) {
        const data = response.data as any
        setCreditRequests(Array.isArray(data.creditRequests || data.requests || data) ? (data.creditRequests || data.requests || data) : [])
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1)
          setTotalItems(data.pagination.totalItems || 0)
        } else {
          setTotalPages(data.totalPages || Math.ceil((data.total || 0) / limit))
          setTotalItems(data.total || (data.creditRequests || data.requests || data).length)
        }
        setError(null)
      } else {
        const errorMsg = response.message || 'Failed to load credit requests'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const errorMsg = error.message || 'Failed to load credit requests'
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

  const handleApprove = async (
    id: string,
    options: {
      notes?: string
      creditMethod?: 'balance' | 'direct'
      amount?: number
      adminProof?: File
    }
  ) => {
    try {
      const response = await api.admin.approveCreditRequest(id, options)
      if (response.success) {
        toast.success(response.message || 'Credit request approved successfully')
        await fetchCreditRequests()
        setShowApproveRejectModal(false)
        setSelectedRequest(null)
        setActionType(null)
      } else {
        const errorMsg = response.message || 'Failed to approve credit request'
        toast.error(errorMsg)
        throw new Error(errorMsg)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const errorMsg = error.message || 'Failed to approve credit request'
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

  const handleReject = async (id: string, reason: string) => {
    try {
      const response = await api.admin.rejectCreditRequest(id, reason)
      if (response.success) {
        toast.success(response.message || 'Credit request rejected')
        await fetchCreditRequests()
        setShowApproveRejectModal(false)
        setSelectedRequest(null)
        setActionType(null)
      } else {
        const errorMsg = response.message || 'Failed to reject credit request'
        toast.error(errorMsg)
        throw new Error(errorMsg)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const errorMsg = error.message || 'Failed to reject credit request'
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

  const openApproveModal = (request: CreditRequest) => {
    setSelectedRequest(request)
    setActionType('approve')
    setShowApproveRejectModal(true)
  }

  const openRejectModal = (request: CreditRequest) => {
    setSelectedRequest(request)
    setActionType('reject')
    setShowApproveRejectModal(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={20} weight="regular" className="text-yellow-500" />
      case 'approved':
        return <CheckCircle size={20} weight="regular" className="text-green-500" />
      case 'rejected':
        return <XCircle size={20} weight="regular" className="text-red-500" />
      default:
        return <Clock size={20} weight="regular" className="text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return isDark ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' : 'bg-yellow-50 border-yellow-200 text-yellow-700'
      case 'approved':
        return isDark ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-green-50 border-green-200 text-green-700'
      case 'rejected':
        return isDark ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-red-50 border-red-200 text-red-700'
      default:
        return isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  // Search is now handled server-side, so we don't need client-side filtering
  const filteredRequests = creditRequests

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className={`font-monument font-bold text-2xl mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Credit Requests</h2>
          <p className={`text-sm font-sequel ${
            isDark ? 'text-white/60' : 'text-gray-600'
          }`}>
            Manage and review credit requests from users
          </p>
        </div>
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
              onClick={fetchCreditRequests}
              className={`text-sm font-sequel hover:underline ${
                isDark ? 'text-red-300' : 'text-red-600'
              }`}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status)
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-lg font-sequel text-sm whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-tiktok-primary text-white'
                  : isDark
                  ? 'bg-white/5 text-white/70 hover:bg-white/10'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className={`relative flex-1 max-w-md ${
          isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
        } border rounded-lg`}>
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
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Search by email, name, or amount..."
            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border-0 focus:outline-none font-sequel text-sm ${
              isDark
                ? 'bg-transparent text-white placeholder-white/30'
                : 'bg-transparent text-gray-900 placeholder-gray-400'
            }`}
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-tiktok-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className={`rounded-xl p-8 text-center border ${
          isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
        }`}>
          <p className={`font-sequel ${
            isDark ? 'text-white/60' : 'text-gray-600'
          }`}>
            {searchQuery ? 'No credit requests found' : 'No credit requests'}
          </p>
        </div>
      ) : (
        <>
          <div className={`rounded-xl border overflow-hidden ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${
                  isDark ? 'bg-white/5' : 'bg-gray-50'
                }`}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-sequel font-semibold uppercase tracking-wider ${
                      isDark ? 'text-white/70' : 'text-gray-600'
                    }`}>User</th>
                    <th className={`px-6 py-3 text-left text-xs font-sequel font-semibold uppercase tracking-wider ${
                      isDark ? 'text-white/70' : 'text-gray-600'
                    }`}>Amount</th>
                    <th className={`px-6 py-3 text-left text-xs font-sequel font-semibold uppercase tracking-wider ${
                      isDark ? 'text-white/70' : 'text-gray-600'
                    }`}>Status</th>
                    <th className={`px-6 py-3 text-left text-xs font-sequel font-semibold uppercase tracking-wider ${
                      isDark ? 'text-white/70' : 'text-gray-600'
                    }`}>Submitted</th>
                    <th className={`px-6 py-3 text-left text-xs font-sequel font-semibold uppercase tracking-wider ${
                      isDark ? 'text-white/70' : 'text-gray-600'
                    }`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className={`hover:${
                      isDark ? 'bg-white/5' : 'bg-gray-50'
                    } transition-colors`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          {request.user ? (
                            <>
                              <p className={`font-semibold font-sequel ${
                                isDark ? 'text-white' : 'text-gray-900'
                              }`}>
                                {request.user.firstName && request.user.lastName
                                  ? `${request.user.firstName} ${request.user.lastName}`
                                  : request.user.email}
                              </p>
                              <p className={`text-xs font-sequel ${
                                isDark ? 'text-white/50' : 'text-gray-500'
                              }`}>{request.user.email}</p>
                              {request.user.phone && (
                                <p className={`text-xs font-sequel ${
                                  isDark ? 'text-white/50' : 'text-gray-500'
                                }`}>{request.user.phone}</p>
                              )}
                            </>
                          ) : (
                            <p className={`text-xs font-sequel ${
                              isDark ? 'text-white/50' : 'text-gray-500'
                            }`}>User not found</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className={`font-semibold font-sequel ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          ${request.amount.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-xs font-sequel ${
                          getStatusColor(request.status)
                        }`}>
                          {getStatusIcon(request.status)}
                          <span>{request.status.charAt(0).toUpperCase() + request.status.slice(1)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className={`text-sm font-sequel ${
                          isDark ? 'text-white/70' : 'text-gray-600'
                        }`}>
                          {formatDate(request.submittedAt)}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedRequest(request)
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
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => openApproveModal(request)}
                                className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                                title="Approve"
                              >
                                <CheckCircle size={18} weight="regular" />
                              </button>
                              <button
                                onClick={() => openRejectModal(request)}
                                className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                                title="Reject"
                              >
                                <XCircle size={18} weight="regular" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={limit}
                totalItems={totalItems}
              />
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {selectedRequest && (
        <CreditRequestDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedRequest(null)
          }}
          request={selectedRequest}
          onApprove={() => {
            setShowDetailModal(false)
            openApproveModal(selectedRequest)
          }}
          onReject={() => {
            setShowDetailModal(false)
            openRejectModal(selectedRequest)
          }}
        />
      )}

      {/* Approve Modal */}
      {selectedRequest && actionType === 'approve' && (
        <ApproveCreditRequestModal
          isOpen={showApproveRejectModal}
          onClose={() => {
            setShowApproveRejectModal(false)
            setSelectedRequest(null)
            setActionType(null)
          }}
          request={selectedRequest}
          onApprove={handleApprove}
        />
      )}

      {/* Reject Modal */}
      {selectedRequest && actionType === 'reject' && (
        <RejectCreditRequestModal
          isOpen={showApproveRejectModal}
          onClose={() => {
            setShowApproveRejectModal(false)
            setSelectedRequest(null)
            setActionType(null)
          }}
          request={selectedRequest}
          onReject={handleReject}
        />
      )}
    </div>
  )
}
