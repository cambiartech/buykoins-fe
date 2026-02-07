'use client'

import { useState, useEffect } from 'react'
import { X, Bank, CheckCircle, Clock, Star, Trash, Plus } from '@phosphor-icons/react'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'
import { BankAccount } from './types'
import { BankAccountModal } from './BankAccountModal'

interface BankAccountsViewProps {
  theme: 'light' | 'dark'
  onClose: () => void
}

export function BankAccountsView({ theme, onClose }: BankAccountsViewProps) {
  const toast = useToast()
  const isDark = theme === 'dark'
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchBankAccounts()
  }, [])

  const fetchBankAccounts = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.user.getBankAccounts()
      if (response.success && response.data) {
        const accounts = Array.isArray(response.data) ? response.data : []
        setBankAccounts(accounts)
        setError(null)
      } else {
        const errorMsg = response.message || 'Failed to load bank accounts'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const errorMsg = error.message || 'Failed to load bank accounts'
        setError(errorMsg)
        toast.error(errorMsg)
      } else {
        const errorMsg = 'An unexpected error occurred'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSetPrimary = async (id: string) => {
    try {
      const response = await api.user.setPrimaryBankAccount(id)
      if (response.success) {
        toast.success(response.message || 'Bank account set as primary')
        await fetchBankAccounts()
      } else {
        const errorMsg = response.message || 'Failed to set primary account'
        toast.error(errorMsg)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const errorMsg = error.message || 'Failed to set primary account'
        toast.error(errorMsg)
      } else {
        const errorMsg = 'An unexpected error occurred'
        toast.error(errorMsg)
      }
    }
  }

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    try {
      const response = await api.user.deleteBankAccount(id)
      if (response.success) {
        toast.success(response.message || 'Bank account deleted successfully')
        setAccountToDelete(null)
        await fetchBankAccounts()
      } else {
        const errorMsg = response.message || 'Failed to delete bank account'
        toast.error(errorMsg)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        let errorMsg = error.message || 'Failed to delete bank account'
        if (error.status === 400 && errorMsg.includes('primary')) {
          errorMsg = 'Cannot delete primary bank account. Set another account as primary first.'
        }
        toast.error(errorMsg)
      } else {
        const errorMsg = 'An unexpected error occurred'
        toast.error(errorMsg)
      }
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`font-monument font-bold text-xl ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>Bank Accounts</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all text-sm font-sequel flex items-center space-x-2"
            >
              <Plus size={18} weight="regular" />
              <span>Add Account</span>
            </button>
            <button
              onClick={onClose}
              className={`${isDark ? 'text-white/80' : 'text-gray-700'}`}
            >
              <X size={24} weight="regular" />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`mb-4 p-3 rounded-lg ${
            isDark 
              ? 'bg-red-500/20 border border-red-500/50' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`text-sm font-sequel ${
              isDark ? 'text-red-300' : 'text-red-600'
            }`}>{error}</p>
            <button
              onClick={fetchBankAccounts}
              className="mt-2 text-sm text-tiktok-primary hover:underline font-sequel"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-tiktok-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : bankAccounts.length === 0 ? (
          <div className={`rounded-xl p-8 text-center border ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
          }`}>
            <Bank size={48} weight="regular" className={`mx-auto mb-4 ${
              isDark ? 'text-white/40' : 'text-gray-400'
            }`} />
            <p className={`font-sequel mb-2 ${
              isDark ? 'text-white/60' : 'text-gray-600'
            }`}>No bank accounts added yet</p>
            <p className={`text-sm font-sequel mb-4 ${
              isDark ? 'text-white/50' : 'text-gray-500'
            }`}>Add a bank account to enable withdrawals</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all font-sequel"
            >
              Add Bank Account
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {bankAccounts.map((account) => (
              <div
                key={account.id}
                className={`rounded-xl p-4 border ${
                  isDark 
                    ? 'bg-white/5 border-white/10' 
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Bank size={20} weight="regular" className={isDark ? 'text-white/60' : 'text-gray-600'} />
                      <h3 className={`font-semibold font-sequel ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>{account.bankName}</h3>
                      {account.isPrimary && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-sequel ${
                          isDark 
                            ? 'bg-tiktok-primary/20 text-tiktok-primary' 
                            : 'bg-tiktok-primary/10 text-tiktok-primary'
                        }`}>
                          Primary
                        </span>
                      )}
                      {account.isVerified ? (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-sequel flex items-center space-x-1 ${
                          isDark 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-green-50 text-green-600'
                        }`}>
                          <CheckCircle size={12} weight="regular" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-sequel flex items-center space-x-1 ${
                          isDark 
                            ? 'bg-yellow-500/20 text-yellow-400' 
                            : 'bg-yellow-50 text-yellow-600'
                        }`}>
                          <Clock size={12} weight="regular" />
                          <span>Pending</span>
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className={`text-sm font-sequel ${
                        isDark ? 'text-white/70' : 'text-gray-700'
                      }`}>
                        <span className={isDark ? 'text-white/50' : 'text-gray-500'}>Account:</span> {account.accountNumber}
                      </p>
                      <p className={`text-sm font-sequel ${
                        isDark ? 'text-white/70' : 'text-gray-700'
                      }`}>
                        <span className={isDark ? 'text-white/50' : 'text-gray-500'}>Name:</span> {account.accountName}
                      </p>
                      <p className={`text-xs font-sequel ${
                        isDark ? 'text-white/50' : 'text-gray-500'
                      }`}>
                        Added {new Date(account.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {account.isVerified && !account.isPrimary && (
                      <button
                        onClick={() => handleSetPrimary(account.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDark
                            ? 'text-white/70 hover:text-white hover:bg-white/10'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                        title="Set as Primary"
                      >
                        <Star size={18} weight="regular" />
                      </button>
                    )}
                    {!account.isPrimary && (
                      <button
                        onClick={() => setAccountToDelete(account.id)}
                        disabled={isDeleting}
                        className={`p-2 rounded-lg transition-colors ${
                          isDark
                            ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                            : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                        } disabled:opacity-50`}
                        title="Delete Account"
                      >
                        <Trash size={18} weight="regular" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {accountToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl border ${
            isDark 
              ? 'bg-black border-white/20' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="p-6">
              <h3 className={`font-monument font-bold text-lg mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Delete Bank Account?</h3>
              <p className={`text-sm font-sequel mb-4 ${
                isDark ? 'text-white/70' : 'text-gray-600'
              }`}>
                This action cannot be undone. The bank account will be permanently removed.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setAccountToDelete(null)}
                  disabled={isDeleting}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all font-sequel ${
                    isDark
                      ? 'bg-white/5 text-white/80 hover:bg-white/10'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } disabled:opacity-50`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(accountToDelete)}
                  disabled={isDeleting}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl font-semibold hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-sequel"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Bank Account Modal */}
      <BankAccountModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        theme={theme}
        onSuccess={fetchBankAccounts}
      />
    </>
  )
}

