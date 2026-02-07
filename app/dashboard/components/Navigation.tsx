'use client'

import { useState, useEffect } from 'react'
import { House, Wallet, Gear, ChatCircle, X, List, CreditCard } from '@phosphor-icons/react'
import { View } from './types'

interface NavigationProps {
  theme: 'light' | 'dark'
  currentView: View
  onViewChange: (view: View) => void
  onSupportClick: () => void
}

export function Navigation({ theme, currentView, onViewChange, onSupportClick }: NavigationProps) {
  const isDark = theme === 'dark'
  const [showNav, setShowNav] = useState(false)
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

    // Listen for unread count changes
    const handleUnreadCountChange = (event: CustomEvent) => {
      setUnreadCount(event.detail)
    }

    window.addEventListener('supportUnreadCountChanged', handleUnreadCountChange as EventListener)

    return () => {
      window.removeEventListener('supportUnreadCountChanged', handleUnreadCountChange as EventListener)
    }
  }, [])

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
                <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  isDark ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
                }`}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Floating Navigation Button - Mobile Only */}
      <button
        onClick={() => setShowNav(!showNav)}
        className={`md:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-40 transition-all ${
          isDark 
            ? 'bg-blue-600 hover:bg-blue-700' 
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {showNav ? (
          <X size={24} weight="regular" className="text-white" />
        ) : (
          <List size={24} weight="regular" className="text-white" />
        )}
      </button>

      {/* Mobile Navigation Menu */}
      {showNav && (
        <div className="md:hidden fixed bottom-24 right-6 z-30">
          <div className={`rounded-xl shadow-xl border overflow-hidden ${
            isDark 
              ? 'bg-white/10 backdrop-blur-lg border-white/20' 
              : 'bg-white border-gray-200'
          }`}>
            <button
              onClick={() => {
                onViewChange('overview')
                setShowNav(false)
              }}
              className={`w-full px-4 py-3 text-left font-sequel text-sm transition-colors ${
                currentView === 'overview'
                  ? isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  : isDark ? 'text-white hover:bg-white/10' : 'text-gray-900 hover:bg-gray-50'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => {
                onViewChange('transactions')
                setShowNav(false)
              }}
              className={`w-full px-4 py-3 text-left font-sequel text-sm transition-colors border-t ${
                isDark ? 'border-white/10' : 'border-gray-200'
              } ${
                currentView === 'transactions'
                  ? isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  : isDark ? 'text-white hover:bg-white/10' : 'text-gray-900 hover:bg-gray-50'
              }`}
            >
              Transactions
            </button>
            <button
              onClick={() => {
                onViewChange('cards')
                setShowNav(false)
              }}
              className={`w-full px-4 py-3 text-left font-sequel text-sm transition-colors border-t ${
                isDark ? 'border-white/10' : 'border-gray-200'
              } ${
                currentView === 'cards'
                  ? isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  : isDark ? 'text-white hover:bg-white/10' : 'text-gray-900 hover:bg-gray-50'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => {
                onViewChange('settings')
                setShowNav(false)
              }}
              className={`w-full px-4 py-3 text-left font-sequel text-sm transition-colors border-t ${
                isDark ? 'border-white/10' : 'border-gray-200'
              } ${
                currentView === 'settings'
                  ? isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                  : isDark ? 'text-white hover:bg-white/10' : 'text-gray-900 hover:bg-gray-50'
              }`}
            >
              Settings
            </button>
            <button
              onClick={() => {
                onSupportClick()
                setShowNav(false)
              }}
              className={`relative w-full px-4 py-3 text-left font-sequel text-sm transition-colors border-t ${
                isDark ? 'border-white/10' : 'border-gray-200'
              } ${
                isDark ? 'text-white hover:bg-white/10' : 'text-gray-900 hover:bg-gray-50'
              }`}
            >
              Support
              {unreadCount > 0 && (
                <span className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  isDark ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
                }`}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

