'use client'

import { Sun, Moon, Gear, SignOut } from '@phosphor-icons/react'

interface DashboardHeaderProps {
  theme: 'light' | 'dark'
  userFirstName: string
  onToggleTheme: () => void
  onOpenSettings: () => void
  onLogout: () => void
}

export function DashboardHeader({
  theme,
  userFirstName,
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
            <h1 className={`font-monument font-bold text-lg ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>BuyTikTokCoins</h1>
            <p className={`text-xs font-sequel ${
              isDark ? 'text-white/60' : 'text-gray-600'
            }`}>
              {getGreeting()}, {userFirstName}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={onToggleTheme}
              className={`${isDark ? 'text-white/80 hover:text-white' : 'text-gray-700 hover:text-gray-900'} transition-colors`}
            >
              {isDark ? <Sun size={20} weight="regular" /> : <Moon size={20} weight="regular" />}
            </button>
            <button 
              onClick={onOpenSettings}
              className={`${isDark ? 'text-white/80 hover:text-white' : 'text-gray-700 hover:text-gray-900'} transition-colors`}
            >
              <Gear size={20} weight="regular" />
            </button>
            <button 
              onClick={onLogout}
              className={`${isDark ? 'text-white/80 hover:text-white' : 'text-gray-700 hover:text-gray-900'} transition-colors`}
            >
              <SignOut size={20} weight="regular" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

