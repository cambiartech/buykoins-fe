'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/app/components/AuthGuard'
import { getUser, clearAuth, setUser } from '@/lib/auth'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'
import { DashboardHeader } from './components/DashboardHeader'
import { DashboardOverview } from './components/DashboardOverview'
import { TransactionsView } from './components/TransactionsView'
import { SettingsView } from './components/SettingsView'
import { CreditRequestModal } from './components/CreditRequestModal'
import { CreditHistoryView } from './components/CreditHistoryView'
import { SupportModal } from './components/SupportModal'
import { OnboardingRequestModal } from './components/OnboardingRequestModal'
import { Widget } from './components/Widget'
import { BankAccountsView } from './components/BankAccountsView'
import { PayoutHistoryView } from './components/PayoutHistoryView'
import { PayoutRequestModal } from './components/PayoutRequestModal'
import { CardsView } from './components/CardsView'
import { Navigation } from './components/Navigation'
import { AddFundsModal } from './components/AddFundsModal'
import { CreditStatus, OnboardingStatus, View, Transaction, Activity } from './components/types'

function UserDashboardContent() {
  const router = useRouter()
  const toast = useToast()
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [currentView, setCurrentView] = useState<View>('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [balance, setBalance] = useState(0) // Earnings balance
  const [wallet, setWallet] = useState(0) // Wallet balance
  const [user, setUserState] = useState(getUser())
  const [userFirstName, setUserFirstName] = useState(user?.firstName || user?.email?.split('@')[0] || 'User')
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus>(user?.onboardingStatus || 'pending')
  const [creditStatus, setCreditStatus] = useState<CreditStatus>('none')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSupport, setShowSupport] = useState(false)
  const [supportConversationId, setSupportConversationId] = useState<string | null>(null)
  const [supportConversationType, setSupportConversationType] = useState<'general' | 'onboarding' | 'call_request' | null>(null)
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [showOnboardingModal, setShowOnboardingModal] = useState(false)
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [showWidget, setShowWidget] = useState(false)
  const [showAddFundsModal, setShowAddFundsModal] = useState(false)
  const [widgetTrigger, setWidgetTrigger] = useState<'onboarding' | 'deposit'>('onboarding')
  const [widgetContext, setWidgetContext] = useState<{ amount?: number; payoutId?: string; balance?: number } | undefined>()
  const [todayRate, setTodayRate] = useState<number>(1500)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [error, setError] = useState<string | null>(null)

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Listen for openSupportChat events from widget
  useEffect(() => {
    const handleOpenSupportChat = (event: Event) => {
      const customEvent = event as CustomEvent
      if (customEvent.detail?.conversationId) {
        setSupportConversationId(customEvent.detail.conversationId)
        setSupportConversationType(customEvent.detail.type || 'onboarding')
        // Dispatch chatOpened event to minimize widget BEFORE opening support
        window.dispatchEvent(new CustomEvent('chatOpened', { bubbles: true }))
        document.dispatchEvent(new CustomEvent('chatOpened', { bubbles: true }))
        // Small delay to ensure widget minimizes first
        setTimeout(() => {
          setShowSupport(true)
        }, 100)
      }
    }
    // Listen on both window and document for better compatibility
    window.addEventListener('openSupportChat', handleOpenSupportChat)
    document.addEventListener('openSupportChat', handleOpenSupportChat)
    return () => {
      window.removeEventListener('openSupportChat', handleOpenSupportChat)
      document.removeEventListener('openSupportChat', handleOpenSupportChat)
    }
  }, [])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await api.user.getDashboard()
      
      if (response.success && response.data) {
        const data = response.data as any
        
        // Update user data
        if (data.user) {
          setUserState(data.user)
          setUser(data.user)
          setUserFirstName(data.user.firstName || data.user.email?.split('@')[0] || 'User')
          setOnboardingStatus(data.user.onboardingStatus || 'pending')
          setBalance(data.user.balance || data.user.earnings || 0) // Earnings balance
        }
        
        // Fetch wallet balance separately
        try {
          const balanceResponse = await api.payments.getBalance()
          if (balanceResponse.success && balanceResponse.data) {
            const balanceData = balanceResponse.data as any
            setWallet(balanceData.wallet || 0)
            // Also update earnings if provided
            if (balanceData.earnings !== undefined) {
              setBalance(balanceData.earnings || 0)
            }
          }
        } catch (error) {
          console.error('Failed to fetch wallet balance:', error)
          // Continue without wallet balance - it will default to 0
        }
        
        // Update credit request status
        if (data.creditRequest) {
          setCreditStatus(data.creditRequest.status || 'none')
        }
        
        // Update transactions (for backward compatibility)
        if (data.recentTransactions && Array.isArray(data.recentTransactions)) {
          const formattedTransactions: Transaction[] = data.recentTransactions.map((t: any) => ({
            id: t.id,
            type: t.type === 'credit' ? 'credit' : t.type === 'withdrawal' || t.type === 'payout' ? 'withdrawal' : t.type || 'pending',
            amount: t.type === 'credit' || t.type === 'deposit' ? t.amount : t.type === 'withdrawal' || t.type === 'payout' ? -Math.abs(t.amount) : t.amount,
            currency: t.currency || 'USD', // Use currency field from API
            date: t.date,
            status: t.status,
            description: t.description || `${t.type} transaction`
          }))
          setTransactions(formattedTransactions)
        }
        
        // Update activities (unified view of credit requests, payout requests, and transactions)
        if (data.recentActivities && Array.isArray(data.recentActivities)) {
          const formattedActivities: Activity[] = data.recentActivities.map((a: any) => ({
            id: a.id,
            type: a.type,
            amount: a.amount,
            currency: a.currency || 'USD', // Use currency field from API
            amountInNgn: a.amountInNgn,
            netAmount: a.netAmount,
            date: a.date,
            status: a.status,
            description: a.description || `${a.type} activity`,
            referenceId: a.referenceId
          }))
          setActivities(formattedActivities)
        } else if (data.recentTransactions && Array.isArray(data.recentTransactions)) {
          // Fallback: convert transactions to activities if recentActivities not available
          const formattedActivities: Activity[] = data.recentTransactions.map((t: any) => ({
            id: t.id,
            type: t.type === 'credit' ? 'credit' : t.type === 'withdrawal' || t.type === 'payout' ? 'payout' : t.type || 'credit',
            amount: t.amount,
            currency: t.currency || 'USD', // Use currency field from API
            date: t.date,
            status: t.status,
            description: t.description || `${t.type} transaction`
          }))
          setActivities(formattedActivities)
        }
        
        // Update exchange rate
        if (data.todayRate) {
          setTodayRate(data.todayRate.usdToNgn || 1500)
        }
      } else {
        const errorMsg = response.message || 'Failed to load dashboard data'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const errorMsg = error.message || 'Failed to load dashboard data'
        setError(errorMsg)
        toast.error(errorMsg)
        
        // If unauthorized, check error code before logging out
        if (error.status === 401) {
          const errorCode = error.errorCode || 'AUTH_UNAUTHORIZED'
          
          // Error codes that should log out the user
          const logoutErrorCodes = [
            'AUTH_TOKEN_INVALID',
            'AUTH_TOKEN_EXPIRED',
            'AUTH_TOKEN_NOT_ACTIVE',
            'AUTH_REQUIRED',
            'AUTH_ACCOUNT_SUSPENDED',
            'AUTH_ACCOUNT_NOT_FOUND',
            'AUTH_UNAUTHORIZED',
          ]
          
          // Only log out if error code indicates session is invalid
          if (logoutErrorCodes.includes(errorCode)) {
            clearAuth()
            router.push('/login')
            return
          }
          // For AUTH_CREDENTIALS_INVALID and AUTH_EMAIL_NOT_VERIFIED, don't log out
          // Just show the error message
        }
      } else {
        const errorMsg = 'An unexpected error occurred. Please try again.'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle('light', savedTheme === 'light')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('light', newTheme === 'light')
  }

  const handleLogout = () => {
    clearAuth()
    router.push('/')
  }

  const handleWithdraw = async () => {
    if (balance === 0) {
      toast.error('No balance available to withdraw')
      return
    }
    setShowPayoutModal(true)
  }

  const handleCreditRequestSuccess = async () => {
    await fetchDashboardData()
  }

  const handleProfileUpdated = async () => {
    await fetchDashboardData()
  }

  const isDark = theme === 'dark'

  return (
    <div className={`min-h-screen transition-colors ${
      isDark ? 'bg-black' : 'bg-gray-50'
    }`}>
      <DashboardHeader
        theme={theme}
        userFirstName={userFirstName}
        onToggleTheme={toggleTheme}
        onOpenSettings={() => setCurrentView('settings')}
        onLogout={handleLogout}
      />

      <main className="max-w-4xl mx-auto px-4 pb-20">
        {/* Loading State */}
        {isLoading && currentView === 'overview' && (
          <div className="mt-6 flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-tiktok-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className={`mt-6 p-4 rounded-xl ${
            isDark 
              ? 'bg-red-500/20 border border-red-500/50' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`text-sm font-sequel text-center ${
              isDark ? 'text-red-300' : 'text-red-600'
            }`}>{error}</p>
            <button
              onClick={fetchDashboardData}
              className="mt-2 text-sm text-tiktok-primary hover:underline font-sequel mx-auto block"
            >
              Retry
            </button>
          </div>
        )}

        {/* Overview View */}
        {currentView === 'overview' && !isLoading && !error && (
          <DashboardOverview
            theme={theme}
            balance={balance}
            wallet={wallet}
            onboardingStatus={onboardingStatus}
            creditStatus={creditStatus}
            transactions={transactions}
            activities={activities}
            onWithdraw={handleWithdraw}
            onNewCredit={() => setShowCreditModal(true)}
            onViewTransactions={() => setCurrentView('transactions')}
            onViewCreditHistory={() => setCurrentView('credit-history')}
            onRequestOnboarding={() => {
              setWidgetTrigger('onboarding')
              setWidgetContext(undefined)
              setShowWidget(true)
            }}
            onViewCards={() => setCurrentView('cards')}
            onAddFunds={() => setShowAddFundsModal(true)}
            onTransferToWallet={async () => {
              // Simple transfer modal - transfer 50% of earnings or prompt for amount
              const transferAmount = balance * 0.5
              if (transferAmount > 0) {
                try {
                  const response = await api.payments.transferEarningsToWallet(transferAmount)
                  if (response.success) {
                    toast.success('Funds transferred to wallet successfully!')
                    await fetchDashboardData()
                  } else {
                    toast.error(response.message || 'Transfer failed')
                  }
                } catch (error) {
                  if (error instanceof ApiError) {
                    toast.error(error.message || 'Transfer failed')
                  } else {
                    toast.error('Transfer failed. Please try again.')
                  }
                }
              }
            }}
          />
        )}

        {/* Transactions/Activities View */}
        {currentView === 'transactions' && (
          <TransactionsView
            theme={theme}
            transactions={transactions}
            activities={activities}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClose={() => setCurrentView('overview')}
          />
        )}

        {/* Settings View */}
        {currentView === 'settings' && (
          <SettingsView
            theme={theme}
            todayRate={todayRate}
            onClose={() => setCurrentView('overview')}
            onToggleTheme={toggleTheme}
            onProfileUpdated={handleProfileUpdated}
            onViewChange={(view) => setCurrentView(view)}
          />
        )}

        {/* Credit History View */}
        {currentView === 'credit-history' && (
          <CreditHistoryView
            theme={theme}
            onClose={() => setCurrentView('overview')}
          />
        )}

        {/* Bank Accounts View */}
        {currentView === 'bank-accounts' && (
          <BankAccountsView
            theme={theme}
            onClose={() => setCurrentView('overview')}
          />
        )}

        {/* Payout History View */}
        {currentView === 'payout-history' && (
          <PayoutHistoryView
            theme={theme}
            onClose={() => setCurrentView('overview')}
          />
        )}

        {/* Cards View */}
        {currentView === 'cards' && (
          <CardsView
            theme={theme}
            balance={wallet}
            onClose={() => setCurrentView('overview')}
            onAddFunds={() => setShowAddFundsModal(true)}
            onWalletUpdate={fetchDashboardData}
          />
        )}
      </main>

      <Navigation
        theme={theme}
        currentView={currentView}
        onViewChange={setCurrentView}
        onSupportClick={() => setShowSupport(true)}
      />

      <SupportModal
        isOpen={showSupport}
        onClose={() => {
          setShowSupport(false)
          setSupportConversationId(null)
          setSupportConversationType(null)
        }}
        theme={theme}
        initialConversationId={supportConversationId}
        initialConversationType={supportConversationType}
      />

      <CreditRequestModal
        isOpen={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        theme={theme}
        onSuccess={handleCreditRequestSuccess}
      />

      <OnboardingRequestModal
        isOpen={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
        theme={theme}
        onSuccess={handleCreditRequestSuccess}
      />

      <Widget
        isOpen={showWidget}
        onClose={() => setShowWidget(false)}
        theme={theme}
        trigger={widgetTrigger}
        context={widgetContext}
        onSuccess={() => {
          fetchDashboardData()
          setShowWidget(false)
        }}
      />

      <PayoutRequestModal
        isOpen={showPayoutModal}
        onClose={() => setShowPayoutModal(false)}
        theme={theme}
        balance={balance}
        onSuccess={handleCreditRequestSuccess}
        onNavigateToBankAccounts={() => setCurrentView('bank-accounts')}
      />

      <AddFundsModal
        isOpen={showAddFundsModal}
        onClose={() => setShowAddFundsModal(false)}
        theme={theme}
        onSuccess={async () => {
          // Refresh balances after successful payment
          await fetchDashboardData()
        }}
      />
    </div>
  )
}

export default function UserDashboard() {
  return (
    <AuthGuard>
      <UserDashboardContent />
    </AuthGuard>
  )
}
