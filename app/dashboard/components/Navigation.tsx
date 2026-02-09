'use client'

import { useState, useEffect } from 'react'
import { House, Wallet, Gear, ChatCircle, CreditCard } from '@phosphor-icons/react'
import { View } from './types'

interface NavigationProps {
  theme: 'light' | 'dark'
  currentView: View
  onViewChange: (view: View) => void
  onSupportClick: () => void
}

const mobileNavItems: { view: View; label: string; Icon: typeof House }[] = [
  { view: 'overview', label: 'Home', Icon: House },
  { view: 'cards', label: 'Cards', Icon: CreditCard },
  { view: 'transactions', label: 'Transactions', Icon: Wallet },
  { view: 'settings', label: 'Settings', Icon: Gear },
]

export function Navigation({ theme, currentView, onViewChange, onSupportClick }: NavigationProps) {
  const isDark = theme === 'dark'
  const [unreadCount, setUnreadCount] = useState(0)

  // Load unread count from localStorage
  useEffect(() => {
    const loadUnreadCount = () => {
      if (typeof window !== 'undefined') {
        const count = parseInt(localStorage.getItem('supportUnreadCount') || '0', 10)
        setUnreadCount(count)
      }
    }

    loadUnreadCount()

    const handleUnreadCountChange = (event: CustomEvent) => {
      setUnreadCount(event.detail)
    }

    window.addEventListener('supportUnreadCountChanged', handleUnreadCountChange as EventListener)

    return () => {
      window.removeEventListener('supportUnreadCountChanged', handleUnreadCountChange as EventListener)
    }
  }, [])

  const activeClasses = isDark
    ? 'text-blue-400'
    : 'text-blue-600'
  const inactiveClasses = isDark
    ? 'text-white/60'
    : 'text-gray-500'

  return (
    <>
      {/* Bottom Navigation - Desktop */}
      <nav className={`hidden md:flex fixed bottom-0 left-0 right-0 z-40 border-t ${
        isDark ? 'bg-black border-white/10' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-4xl mx-auto w-full px-4">
          <div className="flex items-center justify-between py-3">
            <button
              onClick={() => onViewChange('overview')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                currentView === 'overview'
                  ? isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  : isDark ? 'text-white/80 hover:text-white' : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <House size={20} weight={currentView === 'overview' ? 'fill' : 'regular'} />
              <span className="font-sequel text-sm">Home</span>
            </button>
            <button
              onClick={() => onViewChange('cards')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                currentView === 'cards'
                  ? isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  : isDark ? 'text-white/80 hover:text-white' : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <CreditCard size={20} weight={currentView === 'cards' ? 'fill' : 'regular'} />
              <span className="font-sequel text-sm">Cards</span>
            </button>
            <button
              onClick={() => onViewChange('transactions')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                currentView === 'transactions'
                  ? isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  : isDark ? 'text-white/80 hover:text-white' : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <Wallet size={20} weight={currentView === 'transactions' ? 'fill' : 'regular'} />
              <span className="font-sequel text-sm">Transactions</span>
            </button>
            <button
              onClick={() => onViewChange('settings')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                currentView === 'settings'
                  ? isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  : isDark ? 'text-white/80 hover:text-white' : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <Gear size={20} weight={currentView === 'settings' ? 'fill' : 'regular'} />
              <span className="font-sequel text-sm">Settings</span>
            </button>
            <button
              onClick={onSupportClick}
              className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isDark ? 'text-white/80 hover:text-white' : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              <ChatCircle size={20} weight="regular" />
              <span className="font-sequel text-sm">Support</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold bg-blue-600 text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile: Native-style bottom nav bar */}
      <nav
        className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t ${
          isDark ? 'bg-black/95 border-white/10 backdrop-blur' : 'bg-white/95 border-gray-200/80 backdrop-blur'
        }`}
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="flex items-center justify-around py-2 pt-3">
          {mobileNavItems.map(({ view, label, Icon }) => (
            <button
              key={view}
              onClick={() => onViewChange(view)}
              className="flex flex-col items-center justify-center min-w-[64px] py-1 rounded-xl active:scale-95 transition-transform"
            >
              <Icon
                size={24}
                weight={currentView === view ? 'fill' : 'regular'}
                className={currentView === view ? activeClasses : inactiveClasses}
              />
              <span
                className={`text-[10px] font-sequel mt-1 ${
                  currentView === view ? activeClasses : inactiveClasses
                }`}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile: Floating Support button - tap anywhere to open support */}
      <button
        onClick={onSupportClick}
        className={`md:hidden fixed z-50 rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95 ${
          isDark
            ? 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700'
            : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
        }`}
        style={{
          width: 56,
          height: 56,
          bottom: 'calc(4.5rem + max(0.5rem, env(safe-area-inset-bottom)))',
          right: 20,
        }}
        aria-label="Support"
      >
        <ChatCircle size={26} weight="fill" className="text-white" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold bg-amber-500 text-white ring-2 ring-white"
            style={{ padding: '0 4px' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </>
  )
}

