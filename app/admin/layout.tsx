'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  List,
  X,
  Wallet,
  Users,
  Clock,
  CreditCard,
  ArrowDownRight,
  UserPlus,
  Shield,
  Moon,
  Sun,
  House,
  Gear,
  ChatCircle,
  Cards
} from '@phosphor-icons/react'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { getAdmin } from '@/lib/auth'
import { api } from '@/lib/api'
import { NotificationsPanel } from './components/NotificationsPanel'

interface SidebarItem {
  id: string
  label: string
  icon: any
  href: string
  count?: number
}

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false) // Closed by default on mobile
  const [mounted, setMounted] = useState(false)
  const [adminRole, setAdminRole] = useState<string>('admin')
  const [adminPermissions, setAdminPermissions] = useState<string[]>([])
  const { theme, isDark, toggleTheme } = useTheme()
  const [supportUnreadCount, setSupportUnreadCount] = useState(0)
  const [pendingCounts, setPendingCounts] = useState({
    creditRequests: 0,
    onboarding: 0,
    payouts: 0,
  })

  // Fetch pending counts from dashboard
  useEffect(() => {
    const fetchPendingCounts = async () => {
      try {
        const response = await api.admin.getDashboard()
        if (response.success && response.data) {
          const data = response.data as any
          setPendingCounts({
            creditRequests: data.summary?.pendingCreditRequests || 0,
            onboarding: data.summary?.pendingOnboarding || 0,
            payouts: data.summary?.pendingPayouts || 0,
          })
        }
      } catch (error) {
        console.error('Failed to fetch pending counts:', error)
      }
    }

    if (pathname !== '/admin/login') {
      fetchPendingCounts()
      // Refresh counts every 30 seconds
      const interval = setInterval(fetchPendingCounts, 30000)
      return () => clearInterval(interval)
    }
  }, [pathname])

  // Handle window resize - auto-expand sidebar on desktop, close on mobile
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        const isDesktop = window.innerWidth >= 1024
        if (isDesktop) {
          // On desktop, sidebar should be open by default
          setSidebarOpen(true)
        } else {
          // On mobile, sidebar should be closed
          setSidebarOpen(false)
        }
      }
    }

    // Set initial state based on screen size
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Load unread count from localStorage
  useEffect(() => {
    const loadUnreadCount = () => {
      if (typeof window !== 'undefined') {
        const count = parseInt(localStorage.getItem('adminSupportUnreadCount') || '0', 10)
        setSupportUnreadCount(count)
      }
    }

    loadUnreadCount()

    // Listen for unread count changes
    const handleUnreadCountChange = (event: CustomEvent) => {
      setSupportUnreadCount(event.detail)
    }

    window.addEventListener('adminSupportUnreadCountChanged', handleUnreadCountChange as EventListener)

    return () => {
      window.removeEventListener('adminSupportUnreadCountChanged', handleUnreadCountChange as EventListener)
    }
  }, [])

  useEffect(() => {
    setMounted(true)
    
    // Don't check auth on login page
    if (pathname === '/admin/login') {
      return
    }

    // Check if admin is logged in
    if (typeof window !== 'undefined') {
      const isAdmin = localStorage.getItem('isAdmin')
      if (!isAdmin) {
        router.push('/admin/login')
        return
      }

      // Get admin role and permissions from stored admin data
      const admin = getAdmin()
      if (admin) {
        setAdminRole(admin.role || 'admin')
        setAdminPermissions(admin.permissions || [])
      } else {
        // Fallback to localStorage if admin object not found
        const role = localStorage.getItem('adminRole') || 'admin'
        const permissions = JSON.parse(localStorage.getItem('adminPermissions') || '[]')
        setAdminRole(role)
        setAdminPermissions(permissions)
      }
    }
  }, [router, pathname])

  // Login page is handled in the wrapper component

  const handleLogout = () => {
    localStorage.removeItem('adminEmail')
    localStorage.removeItem('isAdmin')
    router.push('/admin/login')
  }

  const sidebarItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: House, href: '/admin' },
    { id: 'requests', label: 'Credit Requests', icon: Clock, href: '/admin/requests', count: pendingCounts.creditRequests },
    { id: 'onboarding', label: 'Onboarding', icon: UserPlus, href: '/admin/onboarding', count: pendingCounts.onboarding },
    { id: 'payouts', label: 'Payouts', icon: ArrowDownRight, href: '/admin/payouts', count: pendingCounts.payouts },
    { id: 'users', label: 'Users', icon: Users, href: '/admin/users' },
    { id: 'transactions', label: 'Transactions', icon: CreditCard, href: '/admin/transactions' },
    { id: 'cards', label: 'Cards', icon: Cards, href: '/admin/cards' },
    { id: 'finance', label: 'Finance Report', icon: Wallet, href: '/admin/finance' },
    { id: 'support', label: 'Support', icon: ChatCircle, href: '/admin/support', count: supportUnreadCount },
    { id: 'admins', label: 'Admin Management', icon: Shield, href: '/admin/admins' },
    { id: 'settings', label: 'Settings', icon: Gear, href: '/admin/settings' },
  ]

  // Use isDark from context

  return (
    <div className={`min-h-screen flex transition-colors ${
      isDark ? 'bg-black' : 'bg-gray-50'
    }`}>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 lg:z-auto ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } ${sidebarOpen ? 'w-64' : 'w-64 lg:w-20'} ${
        isDark ? 'bg-black/95 lg:bg-black/50 border-white/10' : 'bg-white border-gray-200'
      } border-r transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className={`p-4 sm:p-6 border-b ${
          isDark ? 'border-white/10' : 'border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-tiktok-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              {sidebarOpen && (
                <span className={`font-sequel font-bold text-lg sm:text-xl ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Admin</span>
              )}
            </div>
            {/* Close button for mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X size={20} weight="regular" className={isDark ? 'text-white' : 'text-gray-900'} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 sm:p-4 space-y-1 sm:space-y-2 overflow-y-auto overscroll-contain">
          {sidebarItems
            .filter((item) => {
              // Filter items based on permissions (only after mount to avoid hydration mismatch)
              if (!mounted) return true // Show all items during SSR
              
              // Hide certain items based on role/permissions
              if (item.id === 'admins' && adminRole !== 'super_admin') {
                return false
              }
              if (item.id === 'settings' && adminRole !== 'super_admin' && !adminPermissions.includes('settings')) {
                return false
              }
              return true
            })
            .map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || (item.href === '/admin' && pathname === '/admin')
              
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => {
                    // Close sidebar on mobile when navigating
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false)
                    }
                  }}
                  className={`w-full flex items-center space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all ${
                    isActive
                      ? 'bg-tiktok-primary text-white'
                      : isDark
                      ? 'text-white/70 hover:bg-white/5 hover:text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={18} weight={isActive ? 'fill' : 'regular'} className="flex-shrink-0" />
                  {sidebarOpen && (
                    <>
                      <span className="font-sequel font-semibold flex-1 text-left text-sm sm:text-base">{item.label}</span>
                      {item.count !== undefined && item.count > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-sequel font-bold flex-shrink-0 ${
                          isActive 
                            ? 'bg-white text-blue-600' 
                            : isDark
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-600 text-white'
                        }`}>
                          {item.count}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              )
            })}
        </nav>

        {/* Settings & Logout */}
        <div className={`p-3 sm:p-4 border-t ${
          isDark ? 'border-white/10' : 'border-gray-200'
        }`}>
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all mb-2 ${
              isDark
                ? 'text-white/70 hover:bg-white/5 hover:text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {isDark ? <Sun size={18} weight="regular" className="flex-shrink-0" /> : <Moon size={18} weight="regular" className="flex-shrink-0" />}
            {sidebarOpen && <span className="font-sequel font-semibold text-sm sm:text-base">Theme</span>}
          </button>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center space-x-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all ${
              isDark
                ? 'text-white/70 hover:bg-white/5 hover:text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <X size={18} weight="regular" className="flex-shrink-0" />
            {sidebarOpen && <span className="font-sequel font-semibold text-sm sm:text-base">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto lg:ml-0">
        {/* Header */}
        <header className={`sticky top-0 z-30 border-b ${
          isDark ? 'bg-black/50 backdrop-blur-sm border-white/10' : 'bg-white/95 backdrop-blur-sm border-gray-200'
        }`}>
          <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'text-white/80 hover:text-white hover:bg-white/5' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? <X size={20} weight="regular" /> : <List size={20} weight="regular" />}
              </button>
              <h1 className={`font-monument font-bold text-lg sm:text-xl lg:text-2xl ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {sidebarItems.find(item => item.href === pathname)?.label || 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Notifications Panel */}
              <NotificationsPanel isDark={isDark} />
              
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                isDark ? 'bg-blue-600/20' : 'bg-blue-600/10'
              }`}>
                <Shield size={16} weight="regular" className="text-blue-600 sm:w-5 sm:h-5" />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
    </ThemeProvider>
  )
}

function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  
  // Don't apply layout to login page
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return <AdminLayoutContent>{children}</AdminLayoutContent>
}

