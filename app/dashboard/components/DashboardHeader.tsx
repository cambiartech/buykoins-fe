'use client'

import Link from 'next/link'
import { Sun, Moon, Gear, SignOut } from '@phosphor-icons/react'
import { NotificationBell } from './NotificationBell'

interface DashboardHeaderProps {
  theme: 'light' | 'dark'
  userFirstName: string
  /** Whether user has linked TikTok (required for onboarding). */
  hasTiktok?: boolean
  tiktokDisplayName?: string | null
  tiktokAvatarUrl?: string | null
  onToggleTheme: () => void
  onOpenSettings: () => void
  onLogout: () => void
}

export function DashboardHeader({
  theme,
  userFirstName,
  hasTiktok = false,
  tiktokDisplayName,
  tiktokAvatarUrl,
  onToggleTheme,
  onOpenSettings,
  onLogout,
}: DashboardHeaderProps) {
  const isDark = theme === 'dark'

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <header className={`${isDark ? 'bg-black' : 'bg-white'} border-b ${
      isDark ? 'border-white/10' : 'border-gray-200'
    } sticky top-0 z-50`}>
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="mb-1">
              <img 
                src={isDark ? '/logos/logo-white.png' : '/logos/logo-colored.png'} 
                alt="BuyKoins" 
                className="h-8 w-auto"
              />
            </div>
            <p className={`text-xs font-sequel ${
              isDark ? 'text-white/60' : 'text-gray-600'
            }`}>
              {getGreeting()}, {userFirstName}
            </p>
            <Link
              href="/onboarding"
              className={`inline-flex items-center gap-1.5 mt-1 text-xs font-sequel ${
                hasTiktok
                  ? isDark ? 'text-white/50 hover:text-white/70' : 'text-gray-500 hover:text-gray-700'
                  : 'text-tiktok-primary hover:underline'
              }`}
            >
              {hasTiktok ? (
                <>
                  {tiktokAvatarUrl ? (
                    <img src={tiktokAvatarUrl} alt="" className="w-4 h-4 rounded-full object-cover" />
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-tiktok-primary/20 flex items-center justify-center text-[10px] font-bold text-tiktok-primary">TT</span>
                  )}
                  <span>{tiktokDisplayName ? `@${tiktokDisplayName}` : 'TikTok connected'}</span>
                </>
              ) : (
                <span>Link TikTok account</span>
              )}
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            {/* Notification Bell */}
            <NotificationBell theme={theme} />
            
            <button 
              onClick={onToggleTheme}
              className={`p-2 rounded-lg ${isDark ? 'text-white/80 hover:text-white hover:bg-white/5' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'} transition-colors`}
            >
              {isDark ? <Sun size={20} weight="regular" /> : <Moon size={20} weight="regular" />}
            </button>
            <button 
              onClick={onOpenSettings}
              className={`p-2 rounded-lg ${isDark ? 'text-white/80 hover:text-white hover:bg-white/5' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'} transition-colors`}
            >
              <Gear size={20} weight="regular" />
            </button>
            <button 
              onClick={onLogout}
              className={`p-2 rounded-lg ${isDark ? 'text-white/80 hover:text-white hover:bg-white/5' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'} transition-colors`}
            >
              <SignOut size={20} weight="regular" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

