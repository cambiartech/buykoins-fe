'use client'

export interface User {
  id: string
  email: string
  username?: string
  firstName?: string
  lastName?: string
  phone?: string
  balance?: number
  onboardingStatus?: 'pending' | 'completed'
  emailVerified?: boolean
  /** Set after user completes "Add TikTok Account" flow. */
  tiktokOpenId?: string | null
  tiktokDisplayName?: string | null
  tiktokAvatarUrl?: string | null
  /** Backend may send this instead of/in addition to tiktokOpenId; use for header/UI. */
  hasTikTok?: boolean
  /** How the user signed up; use to branch onboarding steps. */
  authType?: 'email' | 'tiktok'
}

/** True if the user has TikTok linked (from tiktokOpenId or backend hasTikTok). */
export function userHasTiktok(user: User | null): boolean {
  if (!user) return false
  return Boolean(user.tiktokOpenId || user.hasTikTok)
}

/** True if the user has a placeholder email (e.g. TikTok sign-up without email set). */
export function isPlaceholderEmail(email: string | undefined | null): boolean {
  return Boolean(email && String(email).toLowerCase().endsWith('@users.buykoins.com'))
}

/**
 * Resolve authType for UI branching (user-journey: email vs tiktok sign-up).
 * Prefer backend authType; else infer: TikTok sign-up = has TikTok linked but no real email yet.
 */
export function resolveAuthType(user: User | null): 'email' | 'tiktok' {
  if (!user) return 'email'
  if (user.authType === 'tiktok' || user.authType === 'email') return user.authType
  if (isPlaceholderEmail(user.email)) return 'tiktok'
  const hasRealEmail = Boolean(user.email && String(user.email).trim() && !isPlaceholderEmail(user.email))
  if (userHasTiktok(user) && !hasRealEmail) return 'tiktok'
  return 'email'
}

export interface Admin {
  id: string
  email: string
  role: 'admin' | 'super_admin'
  permissions?: string[]
  firstName?: string
  lastName?: string
}

export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token)
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token')
  }
  return null
}

export function setRefreshToken(refreshToken: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('refreshToken', refreshToken)
  }
}

export function getRefreshToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refreshToken')
  }
  return null
}

export function setUser(user: User) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user))
  }
}

export function getUser(): User | null {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        return JSON.parse(userStr)
      } catch {
        return null
      }
    }
  }
  return null
}

export function setAdmin(admin: Admin) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('admin', JSON.stringify(admin))
    localStorage.setItem('isAdmin', 'true')
  }
}

export function getAdmin(): Admin | null {
  if (typeof window !== 'undefined') {
    const adminStr = localStorage.getItem('admin')
    if (adminStr) {
      try {
        return JSON.parse(adminStr)
      } catch {
        return null
      }
    }
  }
  return null
}

export function clearAuth() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('rememberMe')
  }
}

export function clearAdminAuth() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('admin')
    localStorage.removeItem('isAdmin')
    localStorage.removeItem('adminEmail')
  }
}

export function isAuthenticated(): boolean {
  return getAuthToken() !== null
}

export function isAdminAuthenticated(): boolean {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('isAdmin') === 'true' && getAuthToken() !== null
  }
  return false
}

