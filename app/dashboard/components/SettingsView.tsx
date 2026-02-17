'use client'

import { useState, useEffect } from 'react'
import { X, User, Bell, Shield, Sun, Moon, Wallet, Question, ArrowUpRight, Bank, ArrowDownRight } from '@phosphor-icons/react'
import { ProfileModal } from './ProfileModal'
import { ChangePasswordModal } from './ChangePasswordModal'
import { View } from './types'

interface SettingsViewProps {
  theme: 'light' | 'dark'
  todayRate: number
  onClose: () => void
  onToggleTheme: () => void
  onProfileUpdated: () => void
  onViewChange?: (view: View) => void
  /** When true, open the Profile modal as soon as this view mounts (e.g. from onboarding step). */
  openProfileOnMount?: boolean
  onOpenProfileOpened?: () => void
}

export function SettingsView({
  theme,
  todayRate,
  onClose,
  onToggleTheme,
  onProfileUpdated,
  onViewChange,
  openProfileOnMount,
  onOpenProfileOpened,
}: SettingsViewProps) {
  const isDark = theme === 'dark'
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)

  useEffect(() => {
    if (openProfileOnMount) {
      setShowProfileModal(true)
      onOpenProfileOpened?.()
    }
  }, [openProfileOnMount])

  return (
    <>
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`font-monument font-bold text-xl ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Settings</h2>
          <button
            onClick={onClose}
            className={`${isDark ? 'text-white/80' : 'text-gray-700'}`}
          >
            <X size={24} weight="regular" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Profile */}
          <button
            onClick={() => setShowProfileModal(true)}
            className={`w-full rounded-xl p-4 border text-left ${
              isDark 
                ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                : 'bg-white border-gray-200 hover:bg-gray-50'
            } transition-colors`}
          >
            <div className="flex items-center space-x-3 py-2">
              <User size={20} weight="regular" className={isDark ? 'text-white/80' : 'text-gray-700'} />
              <div className="flex-1">
                <p className={`font-semibold font-sequel ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Profile</p>
                <p className={`text-xs font-sequel ${
                  isDark ? 'text-white/60' : 'text-gray-600'
                }`}>Manage your account information</p>
              </div>
              <ArrowUpRight size={16} weight="regular" className={isDark ? 'text-white/40' : 'text-gray-400'} />
            </div>
          </button>

          {/* Notifications */}
          <div className={`rounded-xl p-4 border ${
            isDark 
              ? 'bg-white/5 border-white/10' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center space-x-3 py-2">
              <Bell size={20} weight="regular" className={isDark ? 'text-white/80' : 'text-gray-700'} />
              <div className="flex-1">
                <p className={`font-semibold font-sequel ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Notifications</p>
                <p className={`text-xs font-sequel ${
                  isDark ? 'text-white/60' : 'text-gray-600'
                }`}>Manage notification preferences</p>
              </div>
              <ArrowUpRight size={16} weight="regular" className={isDark ? 'text-white/40' : 'text-gray-400'} />
            </div>
          </div>

          {/* Security */}
          <button
            onClick={() => setShowChangePasswordModal(true)}
            className={`w-full rounded-xl p-4 border text-left ${
              isDark 
                ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                : 'bg-white border-gray-200 hover:bg-gray-50'
            } transition-colors`}
          >
            <div className="flex items-center space-x-3 py-2">
              <Shield size={20} weight="regular" className={isDark ? 'text-white/80' : 'text-gray-700'} />
              <div className="flex-1">
                <p className={`font-semibold font-sequel ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Security</p>
                <p className={`text-xs font-sequel ${
                  isDark ? 'text-white/60' : 'text-gray-600'
                }`}>Password, 2FA, and security settings</p>
              </div>
              <ArrowUpRight size={16} weight="regular" className={isDark ? 'text-white/40' : 'text-gray-400'} />
            </div>
          </button>

          {/* Theme */}
          <div className={`rounded-xl p-4 border ${
            isDark 
              ? 'bg-white/5 border-white/10' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                {isDark ? <Sun size={20} weight="regular" className="text-white/80" /> : <Moon size={20} weight="regular" className="text-gray-700" />}
                <div>
                  <p className={`font-semibold font-sequel ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>Theme</p>
                  <p className={`text-xs font-sequel ${
                    isDark ? 'text-white/60' : 'text-gray-600'
                  }`}>{theme === 'dark' ? 'Dark mode' : 'Light mode'}</p>
                </div>
              </div>
              <button
                onClick={onToggleTheme}
                className={`px-4 py-2 rounded-lg transition-colors font-sequel text-sm ${
                  isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                Switch
              </button>
            </div>
          </div>

          {/* Today's Rate */}
          <div className={`rounded-xl p-4 border ${
            isDark 
              ? 'bg-white/5 border-white/10' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <Wallet size={20} weight="regular" className={isDark ? 'text-white/80' : 'text-gray-700'} />
                <div>
                  <p className={`font-semibold font-sequel ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>Today's Rate</p>
                  <p className={`text-xs font-sequel ${
                    isDark ? 'text-white/60' : 'text-gray-600'
                  }`}>Current exchange rate</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold font-sequel ${
                  isDark ? 'text-tiktok-primary' : 'text-tiktok-primary'
                }`}>₦{todayRate.toLocaleString()}</p>
                <p className={`text-xs font-sequel ${
                  isDark ? 'text-white/60' : 'text-gray-600'
                }`}>NGN</p>
              </div>
            </div>
          </div>

          {/* Bank Accounts */}
          {onViewChange && (
            <button
              onClick={() => onViewChange?.('bank-accounts' as View)}
              className={`w-full rounded-xl p-4 border text-left ${
                isDark 
                  ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              } transition-colors`}
            >
              <div className="flex items-center space-x-3 py-2">
                <Bank size={20} weight="regular" className={isDark ? 'text-white/80' : 'text-gray-700'} />
                <div className="flex-1">
                  <p className={`font-semibold font-sequel ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>Bank Accounts</p>
                  <p className={`text-xs font-sequel ${
                    isDark ? 'text-white/60' : 'text-gray-600'
                  }`}>Manage your bank accounts for payouts</p>
                </div>
                <ArrowUpRight size={16} weight="regular" className={isDark ? 'text-white/40' : 'text-gray-400'} />
              </div>
            </button>
          )}

          {/* Payout History */}
          {onViewChange && (
            <button
              onClick={() => onViewChange?.('payout-history' as View)}
              className={`w-full rounded-xl p-4 border text-left ${
                isDark 
                  ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              } transition-colors`}
            >
              <div className="flex items-center space-x-3 py-2">
                <ArrowDownRight size={20} weight="regular" className={isDark ? 'text-white/80' : 'text-gray-700'} />
                <div className="flex-1">
                  <p className={`font-semibold font-sequel ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>Payout History</p>
                  <p className={`text-xs font-sequel ${
                    isDark ? 'text-white/60' : 'text-gray-600'
                  }`}>View your withdrawal history</p>
                </div>
                <ArrowUpRight size={16} weight="regular" className={isDark ? 'text-white/40' : 'text-gray-400'} />
              </div>
            </button>
          )}

          {/* Help & Support */}
          <div className={`rounded-xl p-4 border ${
            isDark 
              ? 'bg-white/5 border-white/10' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center space-x-3 py-2">
              <Question size={20} weight="regular" className={isDark ? 'text-white/80' : 'text-gray-700'} />
              <div className="flex-1">
                <p className={`font-semibold font-sequel ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>Help & Support</p>
                <p className={`text-xs font-sequel ${
                  isDark ? 'text-white/60' : 'text-gray-600'
                }`}>FAQs, guides, and contact support</p>
              </div>
              <ArrowUpRight size={16} weight="regular" className={isDark ? 'text-white/40' : 'text-gray-400'} />
            </div>
          </div>
        </div>
      </div>

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        theme={theme}
        onProfileUpdated={onProfileUpdated}
      />

      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        theme={theme}
        onSuccess={() => {
          // Optionally refresh data or show success message
        }}
      />
    </>
  )
}

