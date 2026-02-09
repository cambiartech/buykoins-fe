'use client'

import { useState, useEffect } from 'react'
import { X, Bank as BankIcon, CheckCircle, MagnifyingGlass, CircleNotch } from '@phosphor-icons/react'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'

interface Bank {
  bankCode: string
  name: string
  logoImage?: string | null
  alias?: string[]
}

interface BankAccountModalProps {
  isOpen: boolean
  onClose: () => void
  theme: 'light' | 'dark'
  onSuccess: () => void
  bankAccountId?: string | null
  verificationCode?: string | null
}

export function BankAccountModal({
  isOpen,
  onClose,
  theme,
  onSuccess,
  bankAccountId,
  verificationCode,
}: BankAccountModalProps) {
  const toast = useToast()
  const [step, setStep] = useState<'add' | 'verify'>(bankAccountId ? 'verify' : 'add')
  const [banks, setBanks] = useState<Bank[]>([])
  const [loadingBanks, setLoadingBanks] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showBankDropdown, setShowBankDropdown] = useState(false)
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null)
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [verifyingAccount, setVerifyingAccount] = useState(false)
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentBankAccountId, setCurrentBankAccountId] = useState<string | null>(bankAccountId || null)
  const [otpExpiresIn, setOtpExpiresIn] = useState<number | null>(null)
  const isDark = theme === 'dark'

  // Fetch banks list when modal opens (add step)
  useEffect(() => {
    if (isOpen && step === 'add') {
      fetchBanks()
    }
  }, [isOpen, step])

  // Auto-verify account when account number reaches 10 digits
  useEffect(() => {
    if (accountNumber.length === 10 && selectedBank) {
      verifyAccountNumber()
    } else if (accountNumber.length < 10) {
      setAccountName('')
      setError(null)
    }
  }, [accountNumber, selectedBank])

  // OTP countdown timer
  useEffect(() => {
    if (otpExpiresIn && otpExpiresIn > 0) {
      const timer = setInterval(() => {
        setOtpExpiresIn((prev) => (prev && prev > 0 ? prev - 1 : null))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [otpExpiresIn])

  const fetchBanks = async () => {
    setLoadingBanks(true)
    try {
      const response = await api.user.getBanksList()
      
      if (!response.success || response.data == null) {
        setBanks([])
        return
      }

      const raw = response.data as any
      // Backend can return: data as array, or data.data, or data.banks, or nested object
      let list: any[] = []
      if (Array.isArray(raw)) {
        list = raw
      } else if (Array.isArray(raw?.data)) {
        list = raw.data
      } else if (Array.isArray(raw?.banks)) {
        list = raw.banks
      } else if (typeof raw === 'object') {
        for (const key of Object.keys(raw)) {
          if (Array.isArray(raw[key])) {
            list = raw[key]
            break
          }
        }
      }

      // Normalize to { bankCode, name, logoImage } (backend may use different keys)
      const banksData: Bank[] = list.map((b: any) => ({
        bankCode: b.bankCode ?? b.code ?? b.routingKey ?? '',
        name: b.name ?? '',
        logoImage: b.logoImage ?? null,
        alias: b.alias ?? []
      })).filter((b: Bank) => b.bankCode && b.name)

      setBanks(banksData)
    } catch (error) {
      console.error('Failed to fetch banks:', error)
      toast.error('Failed to load banks list')
      setBanks([])
    } finally {
      setLoadingBanks(false)
    }
  }

  const verifyAccountNumber = async () => {
    if (!selectedBank || accountNumber.length !== 10) return

    setVerifyingAccount(true)
    setError(null)

    try {
      const response = await api.user.nameEnquiry({
        bankCode: selectedBank.bankCode,
        accountNumber: accountNumber
      })

      if (response.success && response.data) {
        const data = response.data as any
        setAccountName(data.accountName || '')
        toast.success('Account verified!')
      } else {
        setAccountName('')
        const errorMsg = 'Unable to verify account number'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (error) {
      setAccountName('')
      if (error instanceof ApiError) {
        const errorMsg = error.message || 'Unable to verify account number'
        setError(errorMsg)
        toast.error(errorMsg)
      } else {
        toast.error('Failed to verify account')
      }
    } finally {
      setVerifyingAccount(false)
    }
  }

  const filteredBanks = banks.filter(bank =>
    bank.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectBank = (bank: Bank) => {
    setSelectedBank(bank)
    setSearchQuery(bank.name)
    setShowBankDropdown(false)
    setAccountName('')
    setError(null)
  }

  const handleAddBankAccount = async () => {
    setError(null)

    // Validation
    if (!selectedBank) {
      const errorMsg = 'Please select a bank'
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    if (accountNumber.length !== 10) {
      const errorMsg = 'Account number must be 10 digits'
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    if (!accountName) {
      const errorMsg = 'Account name could not be verified'
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    setIsLoading(true)

    try {
      const response = await api.user.addBankAccount({
        accountNumber,
        accountName,
        bankName: selectedBank.name,
        bankCode: selectedBank.bankCode
      })

      if (response.success && response.data) {
        const data = response.data as any
        setCurrentBankAccountId(data.id)
        setOtpExpiresIn(data.expiresIn ? data.expiresIn * 60 : 900)
        setStep('verify')
        toast.success(response.message || 'Verification code sent to your email')
        setError(null)
      } else {
        const errorMsg = response.message || 'Failed to add bank account'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const errorMsg = error.message || 'Failed to add bank account'
        setError(errorMsg)
        toast.error(errorMsg)
      } else {
        const errorMsg = 'An unexpected error occurred. Please try again.'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return
    if (value && !/^\d$/.test(value)) return
    
    const newCode = [...otpCode]
    newCode[index] = value
    setOtpCode(newCode)
    
    if (error) setError(null)

    if (value && index < 5) {
      const nextInput = document.getElementById(`bank-otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`bank-otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newCode = pastedData.split('').concat(Array(6 - pastedData.length).fill(''))
    setOtpCode(newCode)
    
    if (error) setError(null)
    
    const lastFilledIndex = Math.min(pastedData.length - 1, 5)
    const nextInput = document.getElementById(`bank-otp-${lastFilledIndex}`)
    nextInput?.focus()
  }

  const handleVerify = async () => {
    setError(null)

    const code = otpCode.join('')
    
    if (code.length !== 6) {
      const errorMsg = 'Please enter the complete 6-digit verification code'
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    if (!currentBankAccountId) {
      const errorMsg = 'Bank account ID is missing'
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    setIsLoading(true)

    try {
      const response = await api.user.verifyBankAccount(currentBankAccountId, code)

      if (response.success) {
        toast.success(response.message || 'Bank account verified successfully!')
        handleClose()
        onSuccess()
      } else {
        const errorMsg = response.message || 'Failed to verify bank account'
        setError(errorMsg)
        toast.error(errorMsg)
        setOtpCode(['', '', '', '', '', ''])
        document.getElementById('bank-otp-0')?.focus()
      }
    } catch (error) {
      if (error instanceof ApiError) {
        let errorMsg = error.message || 'Failed to verify bank account'
        
        if (error.status === 400) {
          if (errorMsg.includes('expired')) {
            errorMsg = 'Verification code has expired. Please add the bank account again to receive a new code.'
          } else if (errorMsg.includes('invalid')) {
            errorMsg = 'Invalid verification code. Please check and try again.'
          } else if (errorMsg.includes('already verified')) {
            errorMsg = 'This bank account is already verified.'
          }
        }
        
        setError(errorMsg)
        toast.error(errorMsg)
        setOtpCode(['', '', '', '', '', ''])
        document.getElementById('bank-otp-0')?.focus()
      } else {
        const errorMsg = 'An unexpected error occurred. Please try again.'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setStep('add')
    setSelectedBank(null)
    setSearchQuery('')
    setAccountNumber('')
    setAccountName('')
    setOtpCode(['', '', '', '', '', ''])
    setError(null)
    setCurrentBankAccountId(null)
    setOtpExpiresIn(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border ${
        isDark 
          ? 'bg-black border-white/20' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <BankIcon size={24} weight="regular" className="text-blue-600" />
            <h3 className={`font-monument font-bold text-lg ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {step === 'add' ? 'Add Bank Account' : 'Verify Bank Account'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className={`${isDark ? 'text-white/80' : 'text-gray-700'}`}
            disabled={isLoading}
          >
            <X size={24} weight="regular" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          {/* Error Message */}
          {error && (
            <div className={`p-3 rounded-lg ${
              isDark 
                ? 'bg-red-500/20 border border-red-500/50' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`text-sm font-sequel ${
                isDark ? 'text-red-300' : 'text-red-600'
              }`}>{error}</p>
            </div>
          )}

          {step === 'add' ? (
            <>
              {/* Info Box */}
              {/* <div className={`p-3 rounded-lg ${
                isDark 
                  ? 'bg-blue-500/10 border border-blue-500/30' 
                  : 'bg-blue-50 border border-blue-200'
              }`}>
                <p className={`text-sm font-sequel ${
                  isDark ? 'text-blue-300' : 'text-blue-700'
                }`}>
                  💡 Select your bank and enter your account number. We'll verify it automatically!
                </p>
              </div> */}

              {/* Bank Selection */}
              <div className="relative">
                <label className={`block text-sm font-medium mb-2 font-sequel ${
                  isDark ? 'text-white/80' : 'text-gray-700'
                }`}>
                  Select Bank <span className="text-red-400">*</span>
                </label>
                
                {/* Selected Bank Display */}
                {selectedBank && (
                  <div className={`mb-2 p-3 rounded-lg border flex items-center space-x-3 ${
                    isDark
                      ? 'bg-blue-500/10 border-blue-500/30'
                      : 'bg-blue-50 border-blue-200'
                  }`}>
                    {selectedBank.logoImage ? (
                      <img 
                        src={selectedBank.logoImage} 
                        alt={selectedBank.name}
                        className="w-10 h-10 rounded object-contain bg-white/10"
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded flex items-center justify-center ${
                        isDark ? 'bg-white/10' : 'bg-white'
                      }`}>
                        <BankIcon size={20} weight="regular" className="text-blue-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold font-sequel ${
                        isDark ? 'text-blue-400' : 'text-blue-700'
                      }`}>{selectedBank.name}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBank(null)
                        setSearchQuery('')
                        setAccountName('')
                        setAccountNumber('')
                      }}
                      className={`p-1 rounded hover:bg-white/10 transition-colors ${
                        isDark ? 'text-blue-400' : 'text-blue-600'
                      }`}
                    >
                      <X size={16} weight="bold" />
                    </button>
                  </div>
                )}

                <div className="relative">
                  <div className="relative">
                    <MagnifyingGlass 
                      size={18} 
                      weight="regular" 
                      className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                        isDark ? 'text-white/40' : 'text-gray-400'
                      }`}
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setShowBankDropdown(true)
                      }}
                      onFocus={() => setShowBankDropdown(true)}
                      placeholder="Search for your bank..."
                      disabled={isLoading || loadingBanks}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-600 font-sequel ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                          : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                    />
                  </div>
                  
                  {/* Dropdown */}
                  {showBankDropdown && (
                    <div className={`absolute z-10 w-full mt-1 max-h-60 overflow-y-auto rounded-lg border shadow-lg ${
                      isDark
                        ? 'bg-black border-white/10'
                        : 'bg-white border-gray-200'
                    }`}>
                      {loadingBanks ? (
                        <div className="p-4 text-center">
                          <CircleNotch className="animate-spin mx-auto text-blue-600" size={24} weight="bold" />
                          <p className={`text-sm font-sequel mt-2 ${
                            isDark ? 'text-white/60' : 'text-gray-600'
                          }`}>Loading banks...</p>
                        </div>
                      ) : filteredBanks.length > 0 ? (
                        filteredBanks.map((bank) => (
                          <button
                            key={bank.bankCode}
                            type="button"
                            onClick={() => handleSelectBank(bank)}
                            className={`w-full text-left px-4 py-3 transition-colors font-sequel flex items-center space-x-3 ${
                              selectedBank?.bankCode === bank.bankCode
                                ? isDark
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : 'bg-blue-50 text-blue-700'
                                : isDark
                                ? 'hover:bg-white/5 text-white'
                                : 'hover:bg-gray-50 text-gray-900'
                            }`}
                          >
                            {/* Bank Logo */}
                            {bank.logoImage ? (
                              <img 
                                src={bank.logoImage} 
                                alt={bank.name}
                                className="w-8 h-8 rounded object-contain bg-white/10"
                              />
                            ) : (
                              <div className={`w-8 h-8 rounded flex items-center justify-center ${
                                isDark ? 'bg-white/10' : 'bg-gray-100'
                              }`}>
                                <BankIcon size={18} weight="regular" className={
                                  isDark ? 'text-white/40' : 'text-gray-400'
                                } />
                              </div>
                            )}
                            
                            {/* Bank Info */}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{bank.name}</p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center">
                          <p className={`text-sm font-sequel ${
                            isDark ? 'text-white/60' : 'text-gray-600'
                          }`}>No banks found</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Account Number */}
              <div>
                <label className={`block text-sm font-medium mb-2 font-sequel ${
                  isDark ? 'text-white/80' : 'text-gray-700'
                }`}>
                  Account Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                    setAccountNumber(value)
                    setError(null)
                  }}
                  placeholder="1234567890"
                  disabled={isLoading || !selectedBank}
                  maxLength={10}
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-600 font-sequel ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                />
                {verifyingAccount && (
                  <p className={`text-xs font-sequel mt-1 flex items-center space-x-1 ${
                    isDark ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    <CircleNotch className="animate-spin" size={12} weight="bold" />
                    <span>Verifying account...</span>
                  </p>
                )}
              </div>

              {/* Account Name (Auto-filled) */}
              <div>
                <label className={`block text-sm font-medium mb-2 font-sequel ${
                  isDark ? 'text-white/80' : 'text-gray-700'
                }`}>
                  Account Name
                </label>
                <div className={`px-4 py-3 rounded-lg border font-sequel ${
                  accountName
                    ? isDark
                      ? 'bg-green-500/10 border-green-500/30 text-green-400'
                      : 'bg-green-50 border-green-200 text-green-700'
                    : isDark
                    ? 'bg-white/5 border-white/10 text-white/40'
                    : 'bg-gray-50 border-gray-300 text-gray-400'
                }`}>
                  {accountName || 'Account name will appear here automatically'}
                </div>
              </div>

              {/* Action Button */}
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all font-sequel ${
                    isDark
                      ? 'bg-white/5 text-white/80 hover:bg-white/10'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } disabled:opacity-50`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddBankAccount}
                  disabled={isLoading || !selectedBank || !accountName || accountNumber.length !== 10}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-sequel flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <CircleNotch className="animate-spin" size={18} weight="bold" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <BankIcon size={18} weight="regular" />
                      <span>Add Account</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Verify Step (unchanged) */}
              <div className={`p-3 rounded-lg ${
                isDark 
                  ? 'bg-green-500/10 border border-green-500/30' 
                  : 'bg-green-50 border border-green-200'
              }`}>
                <div className="flex items-start space-x-2">
                  <CheckCircle size={18} weight="regular" className={`mt-0.5 ${
                    isDark ? 'text-green-400' : 'text-green-600'
                  }`} />
                  <div>
                    <p className={`text-sm font-semibold font-sequel ${
                      isDark ? 'text-green-300' : 'text-green-700'
                    }`}>Verification Code Sent</p>
                    <p className={`text-xs font-sequel mt-1 ${
                      isDark ? 'text-green-300/80' : 'text-green-700'
                    }`}>
                      Check your email for the 6-digit verification code.
                    </p>
                    {otpExpiresIn && otpExpiresIn > 0 && (
                      <p className={`text-xs font-sequel mt-1 ${
                        isDark ? 'text-green-300/80' : 'text-green-700'
                      }`}>
                        Code expires in {Math.floor(otpExpiresIn / 60)}:{(otpExpiresIn % 60).toString().padStart(2, '0')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* OTP Input */}
              <div>
                <label className={`block text-sm font-medium mb-3 font-sequel text-center ${
                  isDark ? 'text-white/80' : 'text-gray-700'
                }`}>
                  Verification Code <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center justify-center space-x-2 mb-4">
                  {otpCode.map((digit, index) => (
                    <input
                      key={index}
                      id={`bank-otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      disabled={isLoading}
                      className={`w-12 h-14 border rounded-lg text-center font-monument font-bold text-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all ${
                        isDark
                          ? 'bg-white/5 border-white/10 text-white'
                          : 'bg-gray-50 border-gray-200 text-gray-900'
                      }`}
                      autoFocus={index === 0 && step === 'verify'}
                    />
                  ))}
                </div>
                <p className={`text-xs font-sequel text-center ${
                  isDark ? 'text-white/50' : 'text-gray-500'
                }`}>
                  Enter the 6-digit code sent to your email
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => {
                    setStep('add')
                    setOtpCode(['', '', '', '', '', ''])
                    setError(null)
                  }}
                  disabled={isLoading}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all font-sequel ${
                    isDark
                      ? 'bg-white/5 text-white/80 hover:bg-white/10'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } disabled:opacity-50`}
                >
                  Back
                </button>
                <button
                  onClick={handleVerify}
                  disabled={isLoading || otpCode.join('').length !== 6}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-sequel flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <CircleNotch className="animate-spin" size={18} weight="bold" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} weight="regular" />
                      <span>Verify</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
