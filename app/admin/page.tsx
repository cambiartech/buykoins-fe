'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, UserPlus, ArrowDownRight, Users, CreditCard, ChatCircle, Warning, X } from '@phosphor-icons/react'
import Link from 'next/link'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'
import { useAdminTheme } from './hooks/useTheme'

interface DashboardData {
  summary: {
    pendingCreditRequests: number
    pendingOnboarding: number
    pendingPayouts: number
    totalUsers: number
    totalTransactions: number
  }
  newSupportMessages: Array<{
    id: string
    conversationId: string
    type: string
    status: string
    userId?: string
    guestId?: string
    user?: {
      id: string
      email: string
      firstName?: string
      lastName?: string
      username?: string
    }
    unreadCount: number
    lastMessageAt: string
    createdAt: string
  }>
  newOnboardingRequests: Array<{
    id: string
    onboardingRequestId: string
    userId: string
    user: {
      id: string
      email: string
      firstName?: string
      lastName?: string
      username?: string
      phone?: string
    }
    message?: string
    submittedAt: string
    createdAt: string
  }>
  newPayoutRequests: Array<{
    id: string
    payoutId: string
    userId: string
    user: {
      id: string
      email: string
      firstName?: string
      lastName?: string
      username?: string
      phone?: string
      balance?: number
    }
    amount: number
    amountInNgn: number
    processingFee: number
    netAmount: number
    bankAccount: {
      accountNumber: string
      accountName: string
      bankName: string
      bankCode: string
    }
    requestedAt: string
    createdAt: string
  }>
  newCreditRequests: Array<{
    id: string
    creditRequestId: string
    userId: string
    user: {
      id: string
      email: string
      firstName?: string
      lastName?: string
      username?: string
      phone?: string
      balance?: number
    }
    amount: number
    proofUrl: string
    submittedAt: string
    createdAt: string
  }>
  fraudAlerts: Array<{
    type: string
    severity: 'high' | 'medium' | 'low'
    message: string
    userId: string
    user: {
      id: string
      email: string
      firstName?: string
      lastName?: string
      username?: string
    }
    count?: number
    amount?: number
    timeWindow?: string
    action: string
    link: string
  }>
}

export default function AdminDashboard() {
  const router = useRouter()
  const isDark = useAdminTheme()
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin')
    if (!isAdmin) {
      router.push('/admin/login')
      return
    }

    fetchDashboard()
  }, [router])

  const fetchDashboard = async () => {
    try {
      setIsLoading(true)
      const response = await api.admin.getDashboard()
      if (response.success && response.data) {
        setDashboardData(response.data as DashboardData)
      } else {
        toast.error('Failed to load dashboard data')
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message || 'Failed to load dashboard')
      } else {
        toast.error('An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getUserDisplayName = (user?: { firstName?: string; lastName?: string; email: string; username?: string }) => {
    if (!user) return 'Guest User'
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim()
    }
    return user.username || user.email.split('@')[0]
  }

  const stats = dashboardData ? [
    { 
      label: 'Pending Requests', 
      value: dashboardData.summary.pendingCreditRequests.toString(), 
      icon: Clock, 
      href: '/admin/requests', 
      color: 'yellow' 
    },
    { 
      label: 'Onboarding', 
      value: dashboardData.summary.pendingOnboarding.toString(), 
      icon: UserPlus, 
      href: '/admin/onboarding', 
      color: 'blue' 
    },
    { 
      label: 'Total Users', 
      value: dashboardData.summary.totalUsers.toLocaleString(), 
      icon: Users, 
      href: '/admin/users', 
      color: 'green' 
    },
    { 
      label: 'Transactions', 
      value: dashboardData.summary.totalTransactions.toLocaleString(), 
      icon: CreditCard, 
      href: '/admin/transactions', 
      color: 'purple' 
    },
    { 
      label: 'Support Messages', 
      value: dashboardData.newSupportMessages.reduce((sum, msg) => sum + msg.unreadCount, 0).toString(), 
      icon: ChatCircle, 
      href: '/admin/support', 
      color: 'pink',
      badge: dashboardData.newSupportMessages.reduce((sum, msg) => sum + msg.unreadCount, 0)
    },
  ] : []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-tiktok-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={isDark ? 'text-white/60' : 'text-gray-600'}>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <h2 className={`font-monument font-bold text-xl sm:text-2xl lg:text-3xl mb-1 sm:mb-2 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>Dashboard Overview</h2>
        <p className={`text-sm sm:text-base ${isDark ? 'text-white/60' : 'text-gray-600'}`} style={{ fontFamily: 'Sequel Sans, sans-serif' }}>
          Welcome back, Admin
        </p>
      </div>

      {/* Stats Grid - 2 columns on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Link
              key={index}
              href={stat.href}
              className={`relative ${
                isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-gray-200 hover:bg-gray-50'
              } border rounded-xl p-6 transition-colors`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  stat.color === 'yellow' ? 'bg-yellow-500/20' :
                  stat.color === 'blue' ? 'bg-blue-500/20' :
                  stat.color === 'green' ? 'bg-green-500/20' :
                  stat.color === 'pink' ? 'bg-tiktok-primary/20' :
                  'bg-purple-500/20'
                }`}>
                  <Icon size={24} weight="regular" className={
                    stat.color === 'yellow' ? 'text-yellow-400' :
                    stat.color === 'blue' ? 'text-blue-400' :
                    stat.color === 'green' ? 'text-green-400' :
                    stat.color === 'pink' ? 'text-tiktok-primary' :
                    'text-purple-400'
                  } />
                </div>
                {stat.badge && stat.badge > 0 && (
                  <span className={`absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isDark ? 'bg-tiktok-primary text-white' : 'bg-tiktok-primary text-white'
                  }`}>
                    {stat.badge > 9 ? '9+' : stat.badge}
                  </span>
                )}
              </div>
              <p className={`text-sm font-sequel mb-1 ${
                isDark ? 'text-white/70' : 'text-gray-600'
              }`}>{stat.label}</p>
              <p className={`font-monument font-bold text-2xl ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>{stat.value}</p>
            </Link>
          )
        })}
      </div>

      {dashboardData && (
        <div className="space-y-6">
          {/* Fraud Alerts - Full Width */}
          {dashboardData.fraudAlerts.length > 0 && (
            <div className={`border rounded-xl p-4 sm:p-6 ${
              isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center mb-4">
                <Warning size={20} weight="fill" className="text-red-500 mr-2 flex-shrink-0" />
                <h3 className={`font-monument font-bold text-lg sm:text-xl ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Fraud Alerts</h3>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {dashboardData.fraudAlerts.map((alert) => (
                  <Link
                    key={alert.userId + alert.type}
                    href={alert.link}
                    className={`block p-3 sm:p-4 rounded-lg border transition-colors ${
                      alert.severity === 'high' 
                        ? isDark ? 'bg-red-500/20 border-red-500/30 hover:bg-red-500/30' : 'bg-red-100 border-red-300 hover:bg-red-200'
                        : alert.severity === 'medium'
                        ? isDark ? 'bg-yellow-500/20 border-yellow-500/30 hover:bg-yellow-500/30' : 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200'
                        : isDark ? 'bg-orange-500/20 border-orange-500/30 hover:bg-orange-500/30' : 'bg-orange-100 border-orange-300 hover:bg-orange-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className={`font-sequel font-semibold mb-1 text-sm sm:text-base truncate ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>{alert.message}</p>
                        <p className={`text-xs sm:text-sm ${
                          isDark ? 'text-white/70' : 'text-gray-600'
                        }`}>
                          User: {getUserDisplayName(alert.user)}
                        </p>
                        <p className={`text-xs mt-1 ${
                          isDark ? 'text-white/60' : 'text-gray-500'
                        }`}>{alert.action}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 2-Column Layout for Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* New Support Messages */}
            {dashboardData.newSupportMessages.length > 0 && (
              <div className={`border rounded-xl p-4 sm:p-6 ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-monument font-bold text-lg sm:text-xl ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>New Support Messages</h3>
                  <Link 
                    href="/admin/support"
                    className={`text-xs sm:text-sm font-sequel ${
                      isDark ? 'text-tiktok-primary hover:text-tiktok-primary/80' : 'text-tiktok-primary hover:text-tiktok-primary/80'
                    }`}
                  >
                    View All
                  </Link>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  {dashboardData.newSupportMessages.slice(0, 5).map((msg) => (
                    <Link
                      key={msg.conversationId}
                      href={`/admin/support?conversation=${msg.conversationId}`}
                      className={`block p-3 sm:p-4 rounded-lg border transition-colors ${
                        isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className={`font-sequel font-semibold mb-1 text-sm sm:text-base truncate ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {getUserDisplayName(msg.user)}
                          </p>
                          <p className={`text-xs sm:text-sm ${
                            isDark ? 'text-white/70' : 'text-gray-600'
                          }`}>
                            {msg.type === 'onboarding' ? 'Onboarding Help' : 'General Support'}
                          </p>
                          <p className={`text-xs mt-1 ${
                            isDark ? 'text-white/60' : 'text-gray-500'
                          }`}>
                            {formatDate(msg.lastMessageAt)}
                          </p>
                        </div>
                        {msg.unreadCount > 0 && (
                          <span className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isDark ? 'bg-tiktok-primary text-white' : 'bg-tiktok-primary text-white'
                          }`}>
                            {msg.unreadCount > 9 ? '9+' : msg.unreadCount}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* New Onboarding Requests */}
            {dashboardData.newOnboardingRequests.length > 0 && (
              <div className={`border rounded-xl p-4 sm:p-6 ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-monument font-bold text-lg sm:text-xl ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>New Onboarding Requests</h3>
                  <Link 
                    href="/admin/onboarding"
                    className={`text-xs sm:text-sm font-sequel ${
                      isDark ? 'text-tiktok-primary hover:text-tiktok-primary/80' : 'text-tiktok-primary hover:text-tiktok-primary/80'
                    }`}
                  >
                    View All
                  </Link>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  {dashboardData.newOnboardingRequests.slice(0, 5).map((req) => (
                    <Link
                      key={req.onboardingRequestId}
                      href={`/admin/users/${req.userId}`}
                      className={`block p-3 sm:p-4 rounded-lg border transition-colors ${
                        isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className={`font-sequel font-semibold mb-1 text-sm sm:text-base truncate ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {getUserDisplayName(req.user)}
                          </p>
                          {req.message && (
                            <p className={`text-xs sm:text-sm line-clamp-2 ${
                              isDark ? 'text-white/70' : 'text-gray-600'
                            }`}>
                              {req.message}
                            </p>
                          )}
                          <p className={`text-xs mt-1 ${
                            isDark ? 'text-white/60' : 'text-gray-500'
                          }`}>
                            {formatDate(req.submittedAt)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* New Payout Requests */}
            {dashboardData.newPayoutRequests.length > 0 && (
              <div className={`border rounded-xl p-4 sm:p-6 ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-monument font-bold text-lg sm:text-xl ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>New Payout Requests</h3>
                  <Link 
                    href="/admin/payouts"
                    className={`text-xs sm:text-sm font-sequel ${
                      isDark ? 'text-tiktok-primary hover:text-tiktok-primary/80' : 'text-tiktok-primary hover:text-tiktok-primary/80'
                    }`}
                  >
                    View All
                  </Link>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  {dashboardData.newPayoutRequests.slice(0, 5).map((payout) => (
                    <Link
                      key={payout.payoutId}
                      href={`/admin/payouts/${payout.payoutId}`}
                      className={`block p-3 sm:p-4 rounded-lg border transition-colors ${
                        isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className={`font-sequel font-semibold mb-1 text-sm sm:text-base truncate ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {getUserDisplayName(payout.user)}
                          </p>
                          <p className={`text-xs sm:text-sm ${
                            isDark ? 'text-white/70' : 'text-gray-600'
                          }`}>
                            {formatCurrency(payout.amountInNgn)} ({payout.amount.toFixed(2)} USD)
                          </p>
                          <p className={`text-xs mt-1 ${
                            isDark ? 'text-white/60' : 'text-gray-500'
                          }`}>
                            {payout.bankAccount.bankName} • {formatDate(payout.requestedAt)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* New Credit Requests */}
            {dashboardData.newCreditRequests.length > 0 && (
              <div className={`border rounded-xl p-4 sm:p-6 ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-monument font-bold text-lg sm:text-xl ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>New Deposits</h3>
                  <Link 
                    href="/admin/requests"
                    className={`text-xs sm:text-sm font-sequel ${
                      isDark ? 'text-tiktok-primary hover:text-tiktok-primary/80' : 'text-tiktok-primary hover:text-tiktok-primary/80'
                    }`}
                  >
                    View All
                  </Link>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  {dashboardData.newCreditRequests.slice(0, 5).map((req) => (
                    <Link
                      key={req.creditRequestId}
                      href={`/admin/requests/${req.creditRequestId}`}
                      className={`block p-3 sm:p-4 rounded-lg border transition-colors ${
                        isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className={`font-sequel font-semibold mb-1 text-sm sm:text-base truncate ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {getUserDisplayName(req.user)}
                          </p>
                          <p className={`text-xs sm:text-sm ${
                            isDark ? 'text-white/70' : 'text-gray-600'
                          }`}>
                            ${req.amount.toFixed(2)}
                          </p>
                          <p className={`text-xs mt-1 ${
                            isDark ? 'text-white/60' : 'text-gray-500'
                          }`}>
                            {formatDate(req.submittedAt)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Empty State */}
          {dashboardData.fraudAlerts.length === 0 &&
           dashboardData.newSupportMessages.length === 0 &&
           dashboardData.newOnboardingRequests.length === 0 &&
           dashboardData.newPayoutRequests.length === 0 &&
           dashboardData.newCreditRequests.length === 0 && (
            <div className={`border rounded-xl p-12 text-center ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
            }`}>
              <p className={`text-lg font-sequel ${
                isDark ? 'text-white/60' : 'text-gray-600'
              }`}>
                No new items requiring attention
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
