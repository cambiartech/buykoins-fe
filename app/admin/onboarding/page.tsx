'use client'

import {
  UserPlus,
  CheckCircle,
  MagnifyingGlass,
  Envelope,
  Phone,
  Eye,
  Clock
} from '@phosphor-icons/react'
import { useState, useEffect } from 'react'
import { useAdminTheme } from '../hooks/useTheme'
import { getThemeClasses } from '../utils/theme'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'
import Pagination from '../components/Pagination'
import { CompleteOnboardingModal } from '../users/components/CompleteOnboardingModal'
import { UserDetailModal } from '../users/components/UserDetailModal'

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

export default function OnboardingPage() {
  const isDark = useAdminTheme()
  const theme = getThemeClasses(isDark)
  const toast = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showOnboardingModal, setShowOnboardingModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const itemsPerPage = 10

  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchQuery])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  const fetchUsers = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.admin.getUsers({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery || undefined,
        onboardingStatus: 'pending', // Only fetch users with pending onboarding
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
        const errorMsg = response.message || 'Failed to load onboarding requests'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        // 401 errors are handled by API layer (redirects to login)
        if (error.status !== 401) {
          const errorMsg = error.message || 'Failed to load onboarding requests'
          setError(errorMsg)
          toast.error(errorMsg)
        }
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

  return (
    <div>
      <div className="mb-6">
        <h2 className={`font-monument font-bold text-2xl mb-2 ${theme.text.primary}`}>Onboarding Requests</h2>
        <p className={`font-sequel ${theme.text.secondary}`}>Help users complete their account setup</p>
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

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <MagnifyingGlass 
            size={20} 
            weight="regular" 
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${theme.icon.default}`} 
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className={`w-full ${theme.bg.input} ${theme.border.input} rounded-xl pl-12 pr-4 py-3 ${theme.text.primary} ${theme.text.placeholder} focus:outline-none focus:ring-2 focus:ring-tiktok-primary font-sequel`}
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-tiktok-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : users.length === 0 ? (
        <div className={`text-center py-12 rounded-xl border ${
          isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
        }`}>
          <p className={`font-sequel ${theme.text.muted}`}>
            {searchQuery ? 'No users found matching your search' : 'No pending onboarding requests'}
          </p>
        </div>
      ) : (
        <>
          <div className={`${theme.bg.card} ${theme.border.default} rounded-xl overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDark ? 'bg-white/5' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-sm font-semibold font-sequel ${theme.text.secondary}`}>Name</th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold font-sequel ${theme.text.secondary}`}>Email</th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold font-sequel ${theme.text.secondary}`}>Phone</th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold font-sequel ${theme.text.secondary}`}>Joined</th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold font-sequel ${theme.text.secondary}`}>Status</th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold font-sequel ${theme.text.secondary}`}>Actions</th>
                  </tr>
                </thead>
                <tbody className={isDark ? 'divide-y divide-white/10' : 'divide-y divide-gray-200'}>
                  {users.map((user) => (
                    <tr key={user.id} className={theme.bg.hover + ' transition-colors'}>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-tiktok-primary/20 rounded-full flex items-center justify-center">
                            <UserPlus size={20} weight="regular" className="text-tiktok-primary" />
                          </div>
                          <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                            {user.firstName && user.lastName
                              ? `${user.firstName} ${user.lastName}`
                              : user.username || user.email.split('@')[0]}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Envelope size={16} weight="regular" className={theme.icon.default} />
                          <p className={`text-sm font-sequel ${theme.text.secondary}`}>{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.phone ? (
                          <div className="flex items-center space-x-2">
                            <Phone size={16} weight="regular" className={theme.icon.default} />
                            <p className={`text-sm font-sequel ${theme.text.secondary}`}>{user.phone}</p>
                          </div>
                        ) : (
                          <p className={`text-sm font-sequel ${theme.text.muted}`}>N/A</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className={`text-sm font-sequel ${theme.text.secondary}`}>
                          {new Date(user.joinedAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold font-sequel ${
                          user.onboardingStatus === 'pending' 
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          {user.onboardingStatus === 'pending' && (
                            <Clock size={14} weight="regular" className="mr-1" />
                          )}
                          {user.onboardingStatus.charAt(0).toUpperCase() + user.onboardingStatus.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
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
                              className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
                              title="Complete Onboarding"
                            >
                              <CheckCircle size={18} weight="regular" />
                              <span className="text-sm font-sequel">Complete</span>
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
    </div>
  )
}
