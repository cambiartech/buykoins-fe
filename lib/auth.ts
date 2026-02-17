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

