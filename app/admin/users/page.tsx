'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  Prohibit,
  CheckCircle,
  Eye,
  MagnifyingGlass,
  Funnel,
  Clock,
  XCircle,
} from '@phosphor-icons/react'
import { useTheme } from '../context/ThemeContext'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'
import Pagination from '../components/Pagination'
import { UserLink } from '../components/UserLink'
import { UserDetailModal } from './components/UserDetailModal'
import { CompleteOnboardingModal } from './components/CompleteOnboardingModal'
import { SuspendUserModal } from './components/SuspendUserModal'

interface User {
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

export default function UsersPage() {
  const { isDark } = useTheme()
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [onboardingFilter, setOnboardingFilter] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showOnboardingModal, setShowOnboardingModal] = useState(false)
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const limit = 10

  useEffect(() => {
    fetchUsers()
  }, [currentPage, statusFilter, onboardingFilter, searchQuery])

  const fetchUsers = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.admin.getUsers({
        page: currentPage,
        limit,
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        onboardingStatus: onboardingFilter !== 'all' ? onboardingFilter : undefined,
      })

      if (response.success && response.data) {
        const data = response.data as any
        setUsers(Array.isArray(data.users) ? data.users : [])
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1)
          setTotalItems(data.pagination.totalItems || 0)
        } else {
          setTotalPages(1)
          setTotalItems(data.users?.length || 0)
        }
        setError(null)
      } else {
        const errorMsg = response.message || 'Failed to load users'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const errorMsg = error.message || 'Failed to load users'
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

  const handleCompleteOnboarding = async (userId: string, notes: string) => {
    try {
      const response = await api.admin.completeOnboarding(userId, notes)
      if (response.success) {
        toast.success(response.message || 'Onboarding completed successfully')
        await fetchUsers()
        setShowOnboardingModal(false)
        setSelectedUser(null)
      } else {
        const errorMsg = response.message || 'Failed to complete onboarding'
        toast.error(errorMsg)
        throw new Error(errorMsg)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const errorMsg = error.message || 'Failed to complete onboarding'
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

  const handleSuspend = async (userId: string, reason: string) => {
    try {
      const response = await api.admin.suspendUser(userId, reason)
      if (response.success) {
        toast.success(response.message || 'User suspended successfully')
        await fetchUsers()
        setShowSuspendModal(false)
        setSelectedUser(null)
      } else {
        const errorMsg = response.message || 'Failed to suspend user'
        toast.error(errorMsg)
        throw new Error(errorMsg)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const errorMsg = error.message || 'Failed to suspend user'
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

  const handleUnsuspend = async (userId: string) => {
    try {
      const response = await api.admin.unsuspendUser(userId)
      if (response.success) {
        toast.success(response.message || 'User unsuspended successfully')
        await fetchUsers()
      } else {
        const errorMsg = response.message || 'Failed to unsuspend user'
        toast.error(errorMsg)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const errorMsg = error.message || 'Failed to unsuspend user'
        toast.error(errorMsg)
      } else {
        const errorMsg = 'An unexpected error occurred'
        toast.error(errorMsg)
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className={`font-monument font-bold text-2xl mb-2 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>Users</h2>
        <p className={`font-sequel ${
          isDark ? 'text-white/60' : 'text-gray-600'
        }`}>Manage user accounts, onboarding, and permissions</p>
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
              onClick={fetchUsers}
              className={`text-sm font-sequel hover:underline ${
                isDark ? 'text-red-300' : 'text-red-600'
              }`}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
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
            placeholder="Search by name, email, phone..."
            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border-0 focus:outline-none font-sequel text-sm ${
              isDark
                ? 'bg-transparent text-white placeholder-white/30'
                : 'bg-transparent text-gray-900 placeholder-gray-400'
            }`}
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto">
          <Funnel size={20} weight="regular" className={`${isDark ? 'text-white/60' : 'text-gray-600'} flex-shrink-0`} />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(1)
            }}
            className={`px-4 py-2 rounded-lg font-sequel text-sm transition-colors ${
              isDark
                ? 'bg-white/5 border-white/10 text-white'
                : 'bg-white border-gray-200 text-gray-900'
            } border`}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="frozen">Frozen</option>
          </select>

          {/* Onboarding Filter */}
          <select
            value={onboardingFilter}
            onChange={(e) => {
              setOnboardingFilter(e.target.value)
              setCurrentPage(1)
            }}
            className={`px-4 py-2 rounded-lg font-sequel text-sm transition-colors ${
              isDark
                ? 'bg-white/5 border-white/10 text-white'
                : 'bg-white border-gray-200 text-gray-900'
            } border`}
          >
            <option value="all">All Onboarding</option>
            <option value="pending">Pending Onboarding</option>
            <option value="completed">Onboarded</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-tiktok-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : users.length === 0 ? (
        <div className={`rounded-xl p-8 text-center border ${
          isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
        }`}>
          <p className={`font-sequel ${
            isDark ? 'text-white/60' : 'text-gray-600'
          }`}>
            {searchQuery || statusFilter !== 'all' || onboardingFilter !== 'all'
              ? 'No users found matching your filters'
              : 'No users found'}
          </p>
        </div>
      ) : (
        <>
          <div className={`rounded-xl border overflow-hidden ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDark ? 'bg-white/5' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-sequel font-semibold uppercase tracking-wider ${
                      isDark ? 'text-white/70' : 'text-gray-600'
                    }`}>User</th>
                    <th className={`px-6 py-3 text-left text-xs font-sequel font-semibold uppercase tracking-wider ${
                      isDark ? 'text-white/70' : 'text-gray-600'
                    }`}>Contact</th>
                    <th className={`px-6 py-3 text-left text-xs font-sequel font-semibold uppercase tracking-wider ${
                      isDark ? 'text-white/70' : 'text-gray-600'
                    }`}>Balance</th>
                    <th className={`px-6 py-3 text-left text-xs font-sequel font-semibold uppercase tracking-wider ${
                      isDark ? 'text-white/70' : 'text-gray-600'
                    }`}>Onboarding</th>
                    <th className={`px-6 py-3 text-left text-xs font-sequel font-semibold uppercase tracking-wider ${
                      isDark ? 'text-white/70' : 'text-gray-600'
                    }`}>Status</th>
                    <th className={`px-6 py-3 text-left text-xs font-sequel font-semibold uppercase tracking-wider ${
                      isDark ? 'text-white/70' : 'text-gray-600'
                    }`}>Joined</th>
                    <th className={`px-6 py-3 text-left text-xs font-sequel font-semibold uppercase tracking-wider ${
                      isDark ? 'text-white/70' : 'text-gray-600'
                    }`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {users.map((user) => (
                    <tr key={user.id} className={`hover:${
                      isDark ? 'bg-white/5' : 'bg-gray-50'
                    } transition-colors`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <UserLink
                          userId={user.id}
                          firstName={user.firstName}
                          lastName={user.lastName}
                          email={user.email}
                          username={user.username}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className={`text-sm font-sequel ${
                            isDark ? 'text-white/80' : 'text-gray-700'
                          }`}>{user.email}</p>
                          {user.phone && (
                            <p className={`text-xs font-sequel ${
                              isDark ? 'text-white/50' : 'text-gray-500'
                            }`}>{user.phone}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className={`font-semibold font-sequel ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          ${user.balance.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-sequel ${
                          user.onboardingStatus === 'completed'
                            ? isDark ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-green-50 border-green-200 text-green-700'
                            : isDark ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                        } border`}>
                          {user.onboardingStatus === 'pending' ? (
                            <Clock size={14} weight="regular" />
                          ) : (
                            <CheckCircle size={14} weight="regular" />
                          )}
                          <span>{user.onboardingStatus.charAt(0).toUpperCase() + user.onboardingStatus.slice(1)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-sequel ${
                          user.status === 'active'
                            ? isDark ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-green-50 border-green-200 text-green-700'
                            : user.status === 'suspended'
                            ? isDark ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-red-50 border-red-200 text-red-700'
                            : isDark ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                        } border`}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className={`text-sm font-sequel ${
                          isDark ? 'text-white/70' : 'text-gray-600'
                        }`}>
                          {formatDate(user.joinedAt)}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user)
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
                          {user.onboardingStatus === 'pending' && (
                            <button
                              onClick={() => {
                                setSelectedUser(user)
                                setShowOnboardingModal(true)
                              }}
                              className="p-2 rounded-lg bg-tiktok-primary/20 text-tiktok-primary hover:bg-tiktok-primary/30 transition-colors"
                              title="Complete Onboarding"
                            >
                              <CheckCircle size={18} weight="regular" />
                            </button>
                          )}
                          {user.status === 'active' && (
                            <button
                              onClick={() => {
                                setSelectedUser(user)
                                setShowSuspendModal(true)
                              }}
                              className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                              title="Suspend User"
                            >
                              <Prohibit size={18} weight="regular" />
                            </button>
                          )}
                          {user.status === 'suspended' && (
                            <button
                              onClick={() => handleUnsuspend(user.id)}
                              className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                              title="Unsuspend User"
                            >
                              <CheckCircle size={18} weight="regular" />
                            </button>
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

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedUser(null)
          }}
          userId={selectedUser.id}
          onCompleteOnboarding={() => {
            setShowDetailModal(false)
            setShowOnboardingModal(true)
          }}
        />
      )}

      {/* Complete Onboarding Modal */}
      {selectedUser && (
        <CompleteOnboardingModal
          isOpen={showOnboardingModal}
          onClose={() => {
            setShowOnboardingModal(false)
            setSelectedUser(null)
          }}
          user={selectedUser}
          onComplete={handleCompleteOnboarding}
        />
      )}

      {/* Suspend User Modal */}
      {selectedUser && (
        <SuspendUserModal
          isOpen={showSuspendModal}
          onClose={() => {
            setShowSuspendModal(false)
            setSelectedUser(null)
          }}
          user={selectedUser}
          onSuspend={handleSuspend}
        />
      )}
    </div>
  )
}
