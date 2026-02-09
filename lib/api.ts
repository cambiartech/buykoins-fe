const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  errors?: Array<{ field: string; message: string }>
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Array<{ field: string; message: string }>,
    public errorCode?: string,
    public sudoError?: string,
    public hint?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers as Record<string, string>),
  }

  // Remove Content-Type for FormData
  if (options.body instanceof FormData) {
    delete headers['Content-Type']
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    // Try to parse JSON, but handle cases where response might not be JSON
    let data: any = {}
    
    try {
      const text = await response.text()
      if (text && text.trim()) {
        data = JSON.parse(text)
      }
    } catch (parseError) {
      // If response is not JSON, we'll use empty data and check status
      console.error('Failed to parse response as JSON:', parseError)
    }

    // Check if response is not ok OR if success is false
    if (!response.ok || data.success === false) {
      // Always extract message from backend if available
      const errorMessage = data.message || `Server error (${response.status}). Please try again.`
      
      // Handle 401 Unauthorized - check error code before logging out
      if (response.status === 401) {
        const errorCode = data.errorCode || 'AUTH_UNAUTHORIZED'
        
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
          if (typeof window !== 'undefined') {
            // Check if it's an admin route
            const isAdminRoute = endpoint.includes('/admin/')
            if (isAdminRoute) {
              localStorage.removeItem('isAdmin')
              localStorage.removeItem('adminEmail')
              localStorage.removeItem('adminRole')
              localStorage.removeItem('adminPermissions')
              window.location.href = '/admin/login'
            } else {
              // User route
              localStorage.removeItem('token')
              localStorage.removeItem('refreshToken')
              localStorage.removeItem('user')
              window.location.href = '/login'
            }
          }
        }
        // For AUTH_CREDENTIALS_INVALID and AUTH_EMAIL_NOT_VERIFIED, don't log out
        // Just throw the error so the calling code can handle it (e.g., show error message)
      }
      
      throw new ApiError(
        errorMessage,
        response.status,
        data.errors,
        data.errorCode,
        data.sudoError,
        data.hint
      )
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError('Network error. Please check your connection.', 0)
    }
    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      throw new ApiError('Invalid response from server', 0)
    }
    throw new ApiError('An unexpected error occurred. Please try again.', 0)
  }
}

export const api = {
  // Auth endpoints
  auth: {
    signup: async (email: string, password: string, phone: string, firstName?: string, lastName?: string) => {
      return request('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ 
          email, 
          password, 
          phone,
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
        }),
      })
    },

    verifyEmail: async (email: string, verificationCode: string) => {
      return request('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify({ email, verificationCode }),
      })
    },

    resendVerification: async (email: string) => {
      return request('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
    },

    login: async (email: string, password: string, rememberMe: boolean = false) => {
      return request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, rememberMe }),
      })
    },

    refreshToken: async (refreshToken: string) => {
      return request('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      })
    },

    forgotPassword: async (email: string) => {
      return request('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
    },

    resetPassword: async (token: string, password: string) => {
      return request('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      })
    },

    changePassword: async (currentPassword: string, newPassword: string) => {
      return request('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      })
    },

    socialLogin: async (provider: 'google' | 'tiktok', accessToken: string, email: string) => {
      return request('/auth/social-login', {
        method: 'POST',
        body: JSON.stringify({ provider, accessToken, email }),
      })
    },
  },

  // Admin auth
  admin: {
    login: async (email: string, password: string) => {
      return request('/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
    },

    // Dashboard
    getDashboard: async () => {
      return request('/admin/dashboard')
    },

    // Credit Requests
    getCreditRequests: async (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.status) queryParams.append('status', params.status)
      if (params?.search) queryParams.append('search', params.search)
      const query = queryParams.toString()
      return request(`/admin/credit-requests${query ? `?${query}` : ''}`)
    },

    getCreditRequest: async (id: string) => {
      return request(`/admin/credit-requests/${id}`)
    },

    approveCreditRequest: async (
      id: string,
      options?: {
        notes?: string
        creditMethod?: 'balance' | 'direct'
        amount?: number
        adminProof?: File
      }
    ) => {
      const formData = new FormData()
      if (options?.notes) formData.append('notes', options.notes)
      if (options?.creditMethod) formData.append('creditMethod', options.creditMethod)
      if (options?.amount !== undefined) formData.append('amount', options.amount.toString())
      if (options?.adminProof) formData.append('adminProof', options.adminProof)
      
      return request(`/admin/credit-requests/${id}/approve`, {
        method: 'POST',
        body: formData,
      })
    },

    rejectCreditRequest: async (id: string, reason: string) => {
      return request(`/admin/credit-requests/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      })
    },

    // User Management
    getUsers: async (params?: { 
      page?: number
      limit?: number
      search?: string
      status?: string
      onboardingStatus?: string
    }) => {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.search) queryParams.append('search', params.search)
      if (params?.status && params.status !== 'all') queryParams.append('status', params.status)
      if (params?.onboardingStatus && params.onboardingStatus !== 'all') queryParams.append('onboardingStatus', params.onboardingStatus)
      const query = queryParams.toString()
      return request(`/admin/users${query ? `?${query}` : ''}`)
    },

    getUser: async (id: string) => {
      return request(`/admin/users/${id}`)
    },

    getUserBankAccounts: async (userId: string) => {
      return request(`/admin/users/${userId}/bank-accounts`)
    },

    completeOnboarding: async (id: string, notes: string) => {
      return request(`/admin/users/${id}/complete-onboarding`, {
        method: 'POST',
        body: JSON.stringify({ notes }),
      })
    },

    suspendUser: async (id: string, reason: string) => {
      return request(`/admin/users/${id}/suspend`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      })
    },

    unsuspendUser: async (id: string) => {
      return request(`/admin/users/${id}/unsuspend`, {
        method: 'POST',
        body: JSON.stringify({}),
      })
    },

    // Payout Management
    getPayouts: async (params?: {
      page?: number
      limit?: number
      status?: string
    }) => {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.status && params.status !== 'all') queryParams.append('status', params.status)
      const query = queryParams.toString()
      return request(`/admin/payouts${query ? `?${query}` : ''}`)
    },

    getPayout: async (id: string) => {
      return request(`/admin/payouts/${id}`)
    },

    processPayout: async (id: string, data?: {
      transactionReference?: string
      notes?: string
    }) => {
      return request(`/admin/payouts/${id}/process`, {
        method: 'POST',
        body: JSON.stringify({
          ...(data?.transactionReference && { transactionReference: data.transactionReference }),
          ...(data?.notes && { notes: data.notes }),
        }),
      })
    },

    rejectPayout: async (id: string, rejectionReason: string) => {
      return request(`/admin/payouts/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ rejectionReason }),
      })
    },

    getPayoutTransferStatus: async (transferId: string) => {
      return request(`/admin/payouts/transfer-status/${transferId}`)
    },

    completePayoutManual: async (id: string, data: { transactionReference: string; notes?: string }) => {
      return request(`/admin/payouts/${id}/complete-manual`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    // Widget Management
    getWidgetSessions: async (params?: {
      page?: number
      limit?: number
      status?: string
      trigger?: 'onboarding' | 'withdrawal' | 'deposit'
    }) => {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.status) queryParams.append('status', params.status)
      if (params?.trigger) queryParams.append('trigger', params.trigger)
      const query = queryParams.toString()
      return request(`/admin/widget/sessions${query ? `?${query}` : ''}`)
    },

    getWidgetWithdrawals: async (params?: {
      page?: number
      limit?: number
      status?: string
    }) => {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.status) queryParams.append('status', params.status)
      const query = queryParams.toString()
      return request(`/admin/widget/withdrawals${query ? `?${query}` : ''}`)
    },

    // Transaction Management
    getTransactions: async (params?: {
      page?: number
      limit?: number
      type?: string
      status?: string
      userId?: string
      search?: string
      dateFrom?: string
      dateTo?: string
    }) => {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.type && params.type !== 'all') queryParams.append('type', params.type)
      if (params?.status && params.status !== 'all') queryParams.append('status', params.status)
      if (params?.userId) queryParams.append('userId', params.userId)
      if (params?.search) queryParams.append('search', params.search)
      if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom)
      if (params?.dateTo) queryParams.append('dateTo', params.dateTo)
      const query = queryParams.toString()
      return request(`/admin/transactions${query ? `?${query}` : ''}`)
    },

    getTransaction: async (id: string) => {
      return request(`/admin/transactions/${id}`)
    },

    getTransactionStats: async (params?: {
      type?: string
      status?: string
      dateFrom?: string
      dateTo?: string
    }) => {
      const queryParams = new URLSearchParams()
      if (params?.type && params.type !== 'all') queryParams.append('type', params.type)
      if (params?.status && params.status !== 'all') queryParams.append('status', params.status)
      if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom)
      if (params?.dateTo) queryParams.append('dateTo', params.dateTo)
      const query = queryParams.toString()
      return request(`/admin/transactions/stats/summary${query ? `?${query}` : ''}`)
    },

    // Finance Report
    getFinanceReport: async (params?: {
      type?: string
      dateFrom?: string
      dateTo?: string
    }) => {
      const queryParams = new URLSearchParams()
      if (params?.type && params.type !== 'all') queryParams.append('type', params.type)
      if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom)
      if (params?.dateTo) queryParams.append('dateTo', params.dateTo)
      const query = queryParams.toString()
      return request(`/admin/finance/report${query ? `?${query}` : ''}`)
    },

    // Admin Management
    getAdmins: async (params?: {
      page?: number
      limit?: number
      search?: string
      role?: string
      status?: string
    }) => {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.search) queryParams.append('search', params.search)
      if (params?.role && params.role !== 'all') queryParams.append('role', params.role)
      if (params?.status && params.status !== 'all') queryParams.append('status', params.status)
      const query = queryParams.toString()
      return request(`/admin/admins${query ? `?${query}` : ''}`)
    },

    getAdmin: async (id: string) => {
      return request(`/admin/admins/${id}`)
    },

    createAdmin: async (data: {
      email: string
      password: string
      firstName: string
      lastName: string
      role?: 'admin' | 'super_admin'
      permissions?: string[]
    }) => {
      return request('/admin/admins', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    updateAdmin: async (id: string, data: {
      email?: string
      password?: string
      firstName?: string
      lastName?: string
      role?: 'admin' | 'super_admin'
      permissions?: string[]
      status?: 'active' | 'disabled'
    }) => {
      return request(`/admin/admins/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
    },

    suspendAdmin: async (id: string, reason?: string) => {
      return request(`/admin/admins/${id}/suspend`, {
        method: 'POST',
        body: JSON.stringify(reason ? { reason } : {}),
      })
    },

    unsuspendAdmin: async (id: string) => {
      return request(`/admin/admins/${id}/unsuspend`, {
        method: 'POST',
        body: JSON.stringify({}),
      })
    },

    deleteAdmin: async (id: string) => {
      return request(`/admin/admins/${id}`, {
        method: 'DELETE',
      })
    },

    getAvailablePermissions: async () => {
      return request('/admin/admins/permissions/available')
    },

    // Cards Management
    getCards: async (params?: {
      page?: number
      limit?: number
      status?: string
      search?: string
    }) => {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.status && params.status !== 'all') queryParams.append('status', params.status)
      if (params?.search) queryParams.append('search', params.search)
      const query = queryParams.toString()
      return request(`/admin/cards${query ? `?${query}` : ''}`)
    },

    getCard: async (id: string) => {
      return request(`/admin/cards/${id}`)
    },

    getCardTransactions: async (id: string, params?: { page?: number; limit?: number }) => {
      const queryParams = new URLSearchParams()
      if (params?.page !== undefined) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      const query = queryParams.toString()
      return request(`/admin/cards/${id}/transactions${query ? `?${query}` : ''}`)
    },

    freezeCard: async (id: string) => {
      return request(`/admin/cards/${id}/freeze`, {
        method: 'POST',
      })
    },

    unfreezeCard: async (id: string) => {
      return request(`/admin/cards/${id}/unfreeze`, {
        method: 'POST',
      })
    },

    requestPasswordChangeOTP: async (id: string) => {
      return request(`/admin/admins/${id}/password/request-otp`, {
        method: 'POST',
        body: JSON.stringify({}),
      })
    },

    verifyPasswordChangeOTP: async (id: string, password: string, verificationCode: string) => {
      return request(`/admin/admins/${id}/password/verify-otp`, {
        method: 'POST',
        body: JSON.stringify({ password, verificationCode }),
      })
    },
  },

  // Settings endpoints
  settings: {
    getAllSettings: async () => {
      return request('/admin/settings')
    },

    getSettingsByCategory: async (category: string) => {
      return request(`/admin/settings/${category}`)
    },

    updateFinancialSettings: async (data: {
      exchangeRateUsdToNgn?: number
      processingFee?: number
      processingFeeType?: 'fixed' | 'percentage'
      processingFeePercentage?: number | null
      minPayout?: number
      maxPayout?: number
      dailyPayoutLimit?: number | null
      monthlyPayoutLimit?: number | null
    }) => {
      return request('/admin/settings/financial', {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
    },

    updateOperationsSettings: async (data: {
      maintenanceMode?: boolean
      maintenanceMessage?: string | null
      allowNewRegistrations?: boolean
      requireEmailVerification?: boolean
      requireKyc?: boolean
      autoApproveCredits?: boolean
      autoApproveThreshold?: number | null
      autoVerifySupport?: boolean
    }) => {
      return request('/admin/settings/operations', {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
    },

    updatePaymentSettings: async (data: {
      bankAccountRequired?: boolean
      requireVerifiedBankAccount?: boolean
      processingTime?: string
      processingTimeBusinessDays?: number
    }) => {
      return request('/admin/settings/payment', {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
    },

    updateBusinessRulesSettings: async (data: {
      minCreditRequestAmount?: number | null
      maxCreditRequestAmount?: number | null
      creditRequestCooldownHours?: number
      payoutRequestCooldownHours?: number
      maxActiveCreditRequests?: number
      maxActivePayoutRequests?: number
      requireBvnForOnboarding?: boolean
      requireNinForOnboarding?: boolean
    }) => {
      return request('/admin/settings/business-rules', {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
    },

    updatePlatformInfoSettings: async (data: {
      platformName?: string
      supportEmail?: string | null
      supportPhone?: string | null
      termsOfServiceUrl?: string | null
      privacyPolicyUrl?: string | null
    }) => {
      return request('/admin/settings/platform-info', {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
    },

    updateExtendedSettings: async (data: Record<string, any>) => {
      return request('/admin/settings/extended', {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
    },

    // Widget Settings
    getWidgetSettings: async () => {
      return request('/admin/settings/widget')
    },

    updateWidgetSettings: async (data: {
      automaticWithdrawalsEnabled?: boolean
      paypalEmail?: string
      automaticOnboardingEnabled?: boolean
      gmailWebhookUrl?: string
    }) => {
      return request('/admin/settings/widget', {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
    },

    // Notifications
    getNotifications: async (params?: { page?: number; limit?: number; unreadOnly?: boolean }) => {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.unreadOnly) queryParams.append('unreadOnly', 'true')
      const query = queryParams.toString()
      return request(`/admin/notifications${query ? `?${query}` : ''}`)
    },

    getUnreadNotificationCount: async () => {
      return request('/admin/notifications/unread-count')
    },

    markNotificationAsRead: async (id: string) => {
      return request(`/admin/notifications/${id}/read`, {
        method: 'POST',
      })
    },

    markAllNotificationsAsRead: async () => {
      return request('/admin/notifications/read-all', {
        method: 'POST',
      })
    },

    deleteNotification: async (id: string) => {
      return request(`/admin/notifications/${id}`, {
        method: 'DELETE',
      })
    },
  },

  // User endpoints
  user: {
    getDashboard: async () => {
      return request('/user/dashboard')
    },

    getProfile: async () => {
      return request('/user/profile')
    },

    updateProfile: async (data: { firstName?: string; lastName?: string; phone?: string }) => {
      return request('/user/profile', {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
    },

    createCreditRequest: async (amount: number, proof: File) => {
      const formData = new FormData()
      formData.append('amount', amount.toString())
      formData.append('proof', proof)
      return request('/user/credit-request', {
        method: 'POST',
        body: formData,
      })
    },

    getCreditRequestStatus: async () => {
      return request('/user/credit-request/status')
    },

    getCreditRequestHistory: async () => {
      return request('/user/credit-request/history')
    },

    // Onboarding
    submitOnboardingRequest: async (message?: string) => {
      return request('/user/onboarding/request', {
        method: 'POST',
        body: JSON.stringify({ message: message || '' }),
      })
    },

    getOnboardingStatus: async () => {
      return request('/user/onboarding/status')
    },

    // Bank Accounts
    addBankAccount: async (data: {
      accountNumber: string
      accountName: string
      bankName: string
      bankCode: string
    }) => {
      return request('/user/bank-accounts', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    verifyBankAccount: async (id: string, verificationCode: string) => {
      return request(`/user/bank-accounts/${id}/verify`, {
        method: 'POST',
        body: JSON.stringify({ verificationCode }),
      })
    },

    verifyIdentity: async (data: {
      identityType: 'BVN' | 'NIN'
      identityNumber: string
      dob: string
    }) => {
      return request('/user/verify-identity', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    getBankAccounts: async () => {
      return request('/user/bank-accounts')
    },

    getBanksList: async () => {
      return request('/user/bank-accounts/banks')
    },

    nameEnquiry: async (data: {
      bankCode: string
      accountNumber: string
    }) => {
      return request('/user/bank-accounts/name-enquiry', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    setPrimaryBankAccount: async (id: string) => {
      return request(`/user/bank-accounts/${id}/set-primary`, {
        method: 'POST',
      })
    },

    deleteBankAccount: async (id: string) => {
      return request(`/user/bank-accounts/${id}`, {
        method: 'DELETE',
      })
    },

    // Payouts
    requestPayout: async (amount: number, bankAccountId?: string) => {
      return request('/user/payout', {
        method: 'POST',
        body: JSON.stringify({
          amount,
          ...(bankAccountId && { bankAccountId }),
        }),
      })
    },

    getPayoutStatus: async (id: string) => {
      return request(`/user/payout/${id}`)
    },

    getPayoutHistory: async (params?: { page?: number; limit?: number }) => {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      const query = queryParams.toString()
      return request(`/user/payouts${query ? `?${query}` : ''}`)
    },

    // Cards
    createCard: async (currency: string = 'NGN') => {
      return request('/cards', {
        method: 'POST',
        body: JSON.stringify({ currency }),
      })
    },

    getCards: async () => {
      return request('/cards')
    },

    getCard: async (id: string) => {
      return request(`/cards/${id}`)
    },

    updateCard: async (id: string, data: { status?: 'active' | 'frozen' | 'closed'; isDefault?: boolean }) => {
      return request(`/cards/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
    },

    fundCard: async (id: string, amount: number) => {
      return request(`/cards/${id}/fund`, {
        method: 'POST',
        body: JSON.stringify({ amount }),
      })
    },

    getCardTransactions: async (id: string, params?: { page?: number; limit?: number }) => {
      const queryParams = new URLSearchParams()
      if (params?.page !== undefined) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      const query = queryParams.toString()
      return request(`/cards/${id}/transactions${query ? `?${query}` : ''}`)
    },

    setDefaultCard: async (id: string) => {
      return request(`/cards/${id}/set-default`, {
        method: 'POST',
      })
    },

    deleteCard: async (id: string) => {
      return request(`/cards/${id}`, {
        method: 'DELETE',
      })
    },

    getCardToken: async (id: string) => {
      return request(`/cards/${id}/token`)
    },

    // Sudo Customer Onboarding
    saveSudoOnboardingStep: async (step: string, data: any) => {
      return request('/cards/onboarding/save-step', {
        method: 'POST',
        body: JSON.stringify({ step, data }),
      })
    },

    getSudoOnboardingStatus: async () => {
      return request('/cards/onboarding/status')
    },

    completeSudoOnboarding: async () => {
      return request('/cards/onboarding/complete', {
        method: 'POST',
      })
    },
  },

  // Payment endpoints
  payments: {
    initialize: async (amount: number, callbackUrl?: string) => {
      return request('/payments/initialize', {
        method: 'POST',
        body: JSON.stringify({
          amount,
          ...(callbackUrl && { callbackUrl }),
        }),
      })
    },

    verify: async (reference: string) => {
      return request(`/payments/verify/${reference}`, {
        method: 'POST',
      })
    },

    getBalance: async () => {
      return request('/payments/balance')
    },

    transferEarningsToWallet: async (amount: number) => {
      return request('/payments/transfer-earnings-to-wallet', {
        method: 'POST',
        body: JSON.stringify({ amount }),
      })
    },
  },

  // Support endpoints
  support: {
    // Authenticated user - get or create conversation
    getOrCreateConversation: async (type?: 'general' | 'onboarding' | 'call_request') => {
      const query = type ? `?type=${type}` : ''
      return request(`/support/conversation${query}`)
    },

    // Guest user - get or create conversation
    getOrCreateGuestConversation: async (data?: { type?: 'general' | 'onboarding' | 'call_request'; subject?: string }) => {
      return request('/support/conversation/guest', {
        method: 'POST',
        body: JSON.stringify(data || {}),
      })
    },

    // Get conversation messages
    getConversationMessages: async (conversationId: string, params?: { page?: number; limit?: number }) => {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      const query = queryParams.toString()
      return request(`/support/conversation/${conversationId}/messages${query ? `?${query}` : ''}`)
    },

    // Get conversation details
    getConversation: async (conversationId: string) => {
      return request(`/support/conversation/${conversationId}`)
    },

    // Admin - get all conversations
    getConversations: async (params?: { page?: number; limit?: number; status?: string; type?: string; userId?: string }) => {
      const queryParams = new URLSearchParams()
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())
      if (params?.status) queryParams.append('status', params.status)
      if (params?.type) queryParams.append('type', params.type)
      if (params?.userId) queryParams.append('userId', params.userId)
      const query = queryParams.toString()
      return request(`/admin/support/conversations${query ? `?${query}` : ''}`)
    },

    // Admin - generate onboarding auth code
    generateOnboardingCode: async (data: {
      userId?: string
      guestId?: string
      conversationId?: string
      deviceInfo?: string
    }) => {
      return request('/support/onboarding/generate-code', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    // Verify onboarding auth code (public)
    verifyOnboardingCode: async (data: {
      code: string
      userId?: string
      guestId?: string
    }) => {
      return request('/support/onboarding/verify-code', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    // Upload image/file to conversation
    uploadFile: async (conversationId: string, file: File, message?: string) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('conversationId', conversationId) // Add conversationId to form data
      if (message) {
        formData.append('message', message)
      }
      return request(`/support/conversation/${conversationId}/upload`, {
        method: 'POST',
        body: formData,
      })
    },

    // Get conversation options
    getConversationOptions: async () => {
      return request('/support/conversation-options')
    },

    // Get standard messages/templates
    getStandardMessages: async () => {
      return request('/support/standard-messages')
    },

    // Admin - update conversation status
    updateConversationStatus: async (conversationId: string, status: 'open' | 'closed' | 'resolved') => {
      return request(`/admin/support/conversations/${conversationId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
    },
  },

  // Widget endpoints
  widget: {
    init: async (trigger: 'onboarding' | 'withdrawal' | 'deposit', context?: { amount?: number; payoutId?: string }) => {
      return request('/widget/init', {
        method: 'POST',
        body: JSON.stringify({ trigger, context: context || {} }),
      })
    },

    getSession: async (sessionId: string) => {
      return request(`/widget/session/${sessionId}`)
    },

    submitStep: async (sessionId: string, step: string, data: any) => {
      return request(`/widget/session/${sessionId}/step`, {
        method: 'POST',
        body: JSON.stringify({ step, data }),
      })
    },

    uploadProof: async (sessionId: string, file: File, step?: string) => {
      const formData = new FormData()
      formData.append('file', file)
      if (step) formData.append('step', step)
      
      return request(`/widget/session/${sessionId}/upload-proof`, {
        method: 'POST',
        body: formData,
      })
    },

    complete: async (sessionId: string, finalData?: any) => {
      return request(`/widget/session/${sessionId}/complete`, {
        method: 'POST',
        body: JSON.stringify({ finalData: finalData || {} }),
      })
    },

    getSessions: async () => {
      return request('/widget/sessions')
    },
  },
}

