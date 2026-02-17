'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AuthGuard } from '@/app/components/AuthGuard'
import { getUser, setUser } from '@/lib/auth'
import { api, getTiktokLinkUrl } from '@/lib/api'
import { useToast } from '@/lib/toast'

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToast()
  const [user, setUserState] = useState(getUser())
  const [refreshing, setRefreshing] = useState(false)

  const tiktokLinked = searchParams.get('tiktok_linked')
  const tiktokError = searchParams.get('tiktok_error')
  const tiktokErrorDesc = searchParams.get('tiktok_error_description')

  const [returnUrl, setReturnUrl] = useState('')
  useEffect(() => {
    setReturnUrl(typeof window !== 'undefined' ? `${window.location.origin}/onboarding` : '')
  }, [])

  // Handle redirect back from TikTok OAuth: show toast, refresh user, clear URL params
  useEffect(() => {
    if (tiktokLinked === '1') {
      toast.success('TikTok account linked successfully.')
      setRefreshing(true)
      api.user
        .getDashboard()
        .then((res) => {
          if (res.success && res.data && (res.data as any).user) {
            const updated = (res.data as any).user
            setUser(updated)
            setUserState(updated)
          }
        })
        .catch(() => {})
        .finally(() => setRefreshing(false))
      // Clear query params without reload
      router.replace('/onboarding', { scroll: false })
      return
    }
    if (tiktokError || tiktokErrorDesc) {
      toast.error(tiktokErrorDesc || tiktokError || 'Failed to link TikTok account.')
      router.replace('/onboarding', { scroll: false })
    }
  }, [tiktokLinked, tiktokError, tiktokErrorDesc])

  const hasTiktok = Boolean(user?.tiktokOpenId)

  const handleAddTiktok = () => {
    if (!returnUrl) return
    window.location.href = getTiktokLinkUrl(returnUrl)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md text-center space-y-8">
        <h1 className="text-2xl font-semibold">Onboarding</h1>
        <p className="text-gray-400">
          Link your TikTok account before you can request onboarding and talk to support.
        </p>

        {refreshing ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-tiktok-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : hasTiktok ? (
          <div className="space-y-4">
            <div className="rounded-xl bg-white/5 border border-white/10 p-4 flex items-center justify-center gap-3">
              {user?.tiktokAvatarUrl ? (
                <img
                  src={user.tiktokAvatarUrl}
                  alt="TikTok"
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-tiktok-primary/20 flex items-center justify-center text-tiktok-primary font-semibold">
                  TT
                </div>
              )}
              <div className="text-left">
                <p className="font-medium">
                  {user?.tiktokDisplayName ? `@${user.tiktokDisplayName}` : 'TikTok connected'}
                </p>
                <p className="text-sm text-gray-400">Account linked</p>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="inline-block w-full py-3 px-4 rounded-xl bg-tiktok-primary text-black font-semibold hover:opacity-90 transition"
            >
              Continue to dashboard
            </Link>
            <p className="text-sm text-gray-500">
              From the dashboard you can request onboarding and chat with support.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleAddTiktok}
              className="w-full py-3 px-4 rounded-xl bg-tiktok-primary text-black font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              <span>Add TikTok account</span>
            </button>
            <p className="text-sm text-gray-500">
              You’ll be redirected to TikTok to authorize, then back here.
            </p>
          </div>
        )}

        <Link href="/dashboard" className="inline-block text-gray-400 hover:text-white text-sm">
          ← Back to dashboard
        </Link>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <AuthGuard>
      <OnboardingContent />
    </AuthGuard>
  )
}
