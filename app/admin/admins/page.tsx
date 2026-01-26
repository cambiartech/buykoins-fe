'use client'

import {
  Shield,
  Prohibit,
  CheckCircle,
  Eye,
  MagnifyingGlass,
  Lock,
  UserPlus,
  Pencil,
  Trash,
  Funnel,
  X
} from '@phosphor-icons/react'
import { useState, useEffect } from 'react'
import { useAdminTheme } from '../hooks/useTheme'
import { getThemeClasses } from '../utils/theme'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'
import { Select } from '../components/Select'
import Pagination from '../components/Pagination'
import { CreateAdminModal } from './components/CreateAdminModal'
import { EditAdminModal } from './components/EditAdminModal'
import { SuspendAdminModal } from './components/SuspendAdminModal'
import { DeleteAdminModal } from './components/DeleteAdminModal'
import { ChangePasswordModal } from './components/ChangePasswordModal'

interface Admin {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: 'admin' | 'super_admin'
  permissions: string[]
  status: 'active' | 'disabled'
  lastLoginAt?: string
  createdAt: string
  updatedAt?: string
}

interface PermissionGroups {
  [key: string]: string[]
}

export default function AdminsPage() {
  const isDark = useAdminTheme()
  const theme = getThemeClasses(isDark)
  const toast = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [admins, setAdmins] = useState<Admin[]>([])
  const [availablePermissions, setAvailablePermissions] = useState<string[]>([])
  const [permissionGroups, setPermissionGroups] = useState<PermissionGroups>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'super_admin'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'disabled'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null)
  const [isSuspending, setIsSuspending] = useState(true)

  useEffect(() => {
    fetchAvailablePermissions()
    fetchAdmins()
  }, [currentPage, searchQuery, filterRole, filterStatus])

  const fetchAvailablePermissions = async () => {
    try {
      const response = await api.admin.getAvailablePermissions()
      if (response.success && response.data) {
        const data = response.data as any
        setAvailablePermissions(Array.isArray(data.permissions) ? data.permissions : [])
        setPermissionGroups(data.groups || {})
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error)
    }
  }

  const fetchAdmins = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.admin.getAdmins({
        page: currentPage,
        limit: 10,
        search: searchQuery || undefined,
        role: filterRole !== 'all' ? filterRole : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
      })

      if (response.success && response.data) {
        const data = response.data as any
        setAdmins(Array.isArray(data.admins) ? data.admins : [])
        
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1)
          setTotalItems(data.pagination.totalItems || 0)
        }
      } else {
        const errorMsg = response.message || 'Failed to load admins'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const errorMsg = error.message || 'Failed to load admins'
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

  const handleCreateSuccess = () => {
    fetchAdmins()
  }

  const handleEditSuccess = () => {
    fetchAdmins()
  }

  const handleSuspendSuccess = () => {
    fetchAdmins()
  }

  const handleDeleteSuccess = () => {
    fetchAdmins()
  }

  const handleEdit = (admin: Admin) => {
    setSelectedAdmin(admin)
    setShowEditModal(true)
  }

  const handleSuspend = (admin: Admin) => {
    setSelectedAdmin(admin)
    setIsSuspending(true)
    setShowSuspendModal(true)
  }

  const handleUnsuspend = (admin: Admin) => {
    setSelectedAdmin(admin)
    setIsSuspending(false)
    setShowSuspendModal(true)
  }

  const handleDelete = (admin: Admin) => {
    setSelectedAdmin(admin)
    setShowDeleteModal(true)
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-500/20 text-purple-400'
      case 'admin':
        return 'bg-blue-500/20 text-blue-400'
      default:
        return 'bg-gray-500/20 text-gray-400'
    }
  }

  const formatPermissions = (permissions: string[]) => {
    if (permissions.length === 0) return 'No permissions'
    if (permissions.length <= 3) {
      return permissions.map(p => p.split(':')[1] || p).join(', ')
    }
    return `${permissions.slice(0, 3).map(p => p.split(':')[1] || p).join(', ')} +${permissions.length - 3} more`
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`font-monument font-bold text-2xl mb-2 ${theme.text.primary}`}>
              Admin Management
            </h2>
            <p className={`font-sequel ${theme.text.secondary}`}>
              Manage admin accounts, roles, and permissions
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-tiktok-primary hover:bg-tiktok-primary/90 text-white font-sequel transition-colors"
          >
            <UserPlus size={20} weight="regular" />
            <span>Create Admin</span>
          </button>
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
              onClick={fetchAdmins}
              className={`text-sm font-sequel hover:underline ${
                isDark ? 'text-red-300' : 'text-red-600'
              }`}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlass 
            size={20} 
            weight="regular" 
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${theme.icon.default}`} 
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="Search by email, first name, or last name..."
            className={`w-full ${theme.bg.input} ${theme.border.input} rounded-xl pl-12 pr-4 py-3 ${theme.text.primary} ${theme.text.placeholder} focus:outline-none focus:ring-2 focus:ring-tiktok-primary font-sequel`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded hover:bg-white/10"
            >
              <X size={16} weight="regular" className={theme.icon.default} />
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Funnel size={20} weight="regular" className={theme.icon.default} />
          <Select
            value={filterRole}
            onChange={(value) => {
              setFilterRole(value as any)
              setCurrentPage(1)
            }}
            options={[
              { value: 'all', label: 'All Roles' },
              { value: 'admin', label: 'Admin' },
              { value: 'super_admin', label: 'Super Admin' },
            ]}
            placeholder="Filter by role"
          />
          <Select
            value={filterStatus}
            onChange={(value) => {
              setFilterStatus(value as any)
              setCurrentPage(1)
            }}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'disabled', label: 'Disabled' },
            ]}
            placeholder="Filter by status"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-tiktok-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : admins.length === 0 ? (
        <div className={`text-center py-12 rounded-xl border ${
          isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
        }`}>
          <p className={`font-sequel ${theme.text.muted}`}>
            {searchQuery || filterRole !== 'all' || filterStatus !== 'all'
              ? 'No admins found matching your filters'
              : 'No admins found'}
          </p>
        </div>
      ) : (
        <>
          <div className={`${theme.bg.card} ${theme.border.default} rounded-xl overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDark ? 'bg-white/5' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-xs font-semibold font-sequel uppercase tracking-wider ${theme.text.secondary}`}>
                      Admin
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold font-sequel uppercase tracking-wider ${theme.text.secondary}`}>
                      Role
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold font-sequel uppercase tracking-wider ${theme.text.secondary}`}>
                      Status
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold font-sequel uppercase tracking-wider ${theme.text.secondary}`}>
                      Permissions
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold font-sequel uppercase tracking-wider ${theme.text.secondary}`}>
                      Last Login
                    </th>
                    <th className={`px-6 py-4 text-left text-xs font-semibold font-sequel uppercase tracking-wider ${theme.text.secondary}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={isDark ? 'divide-y divide-white/10' : 'divide-y divide-gray-200'}>
                  {admins.map((admin) => {
                    const fullName = admin.firstName && admin.lastName
                      ? `${admin.firstName} ${admin.lastName}`
                      : admin.email

                    return (
                      <tr key={admin.id} className={`hover:${
                        isDark ? 'bg-white/5' : 'bg-gray-50'
                      } transition-colors`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isDark ? 'bg-tiktok-primary/20' : 'bg-tiktok-primary/10'
                            }`}>
                              <Shield size={20} weight="regular" className="text-tiktok-primary" />
                            </div>
                            <div>
                              <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                                {fullName}
                              </p>
                              <p className={`text-xs font-sequel ${theme.text.muted}`}>
                                {admin.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold font-sequel ${getRoleBadgeColor(admin.role)}`}>
                            {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold font-sequel ${
                            admin.status === 'active'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {admin.status === 'active' ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            {admin.role === 'super_admin' ? (
                              <span className={`text-xs font-sequel px-2 py-1 rounded ${
                                isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-50 text-purple-700'
                              }`}>
                                All Permissions
                              </span>
                            ) : (
                              <p className={`text-xs font-sequel ${theme.text.secondary}`} title={admin.permissions.join(', ')}>
                                {formatPermissions(admin.permissions)}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className={`text-sm font-sequel ${theme.text.secondary}`}>
                            {admin.lastLoginAt
                              ? new Date(admin.lastLoginAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: 'numeric',
                                  minute: '2-digit',
                                })
                              : 'Never'}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(admin)}
                              className={`p-2 rounded-lg transition-colors ${
                                isDark
                                  ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400'
                                  : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                              }`}
                              title="Edit Admin"
                            >
                              <Pencil size={16} weight="regular" />
                            </button>
                            {admin.status === 'active' ? (
                              <button
                                onClick={() => handleSuspend(admin)}
                                className={`p-2 rounded-lg transition-colors ${
                                  isDark
                                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                                    : 'bg-red-50 hover:bg-red-100 text-red-600'
                                }`}
                                title="Suspend Admin"
                              >
                                <Prohibit size={16} weight="regular" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUnsuspend(admin)}
                                className={`p-2 rounded-lg transition-colors ${
                                  isDark
                                    ? 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                                    : 'bg-green-50 hover:bg-green-100 text-green-600'
                                }`}
                                title="Unsuspend Admin"
                              >
                                <CheckCircle size={16} weight="regular" />
                              </button>
                            )}
                            {admin.role !== 'super_admin' && (
                              <button
                                onClick={() => handleDelete(admin)}
                                className={`p-2 rounded-lg transition-colors ${
                                  isDark
                                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
                                    : 'bg-red-50 hover:bg-red-100 text-red-600'
                                }`}
                                title="Delete Admin"
                              >
                                <Trash size={16} weight="regular" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
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
                itemsPerPage={10}
                totalItems={totalItems}
              />
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <CreateAdminModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
        availablePermissions={availablePermissions}
        permissionGroups={permissionGroups}
      />

      <EditAdminModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedAdmin(null)
        }}
        onSuccess={handleEditSuccess}
        admin={selectedAdmin}
        availablePermissions={availablePermissions}
        permissionGroups={permissionGroups}
      />

      <SuspendAdminModal
        isOpen={showSuspendModal}
        onClose={() => {
          setShowSuspendModal(false)
          setSelectedAdmin(null)
        }}
        onSuccess={handleSuspendSuccess}
        admin={selectedAdmin}
        isSuspending={isSuspending}
      />

      <DeleteAdminModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedAdmin(null)
        }}
        onSuccess={handleDeleteSuccess}
        admin={selectedAdmin}
      />
    </div>
  )
}
