'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isAuthenticated, setAuthToken, setRefreshToken } from '@/lib/auth'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Sign in / Sign up with TikTok: backend redirects to returnUrl?tiktok_login=1&token=...&refresh_token=...
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
    if (params.get('tiktok_login') === '1') {
      const token = params.get('token')
      const refreshToken = params.get('refresh_token')
      if (token && refreshToken) {
        setAuthToken(token)
        setRefreshToken(refreshToken)
        window.history.replaceState({}, '', window.location.pathname)
      }
    }

    if (!isAuthenticated()) {
      router.push('/login')
    } else {
      setIsChecking(false)
    }
  }, [router])

  if (isChecking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-tiktok-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return <>{children}</>
}

