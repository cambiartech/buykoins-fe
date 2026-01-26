'use client'

import { useState, useEffect } from 'react'
import { X, Bank, CheckCircle, Clock } from '@phosphor-icons/react'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'

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
  const [formData, setFormData] = useState({
    accountNumber: '',
    accountName: '',
    bankName: '',
    bankCode: '',
  })
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentBankAccountId, setCurrentBankAccountId] = useState<string | null>(bankAccountId || null)
  const [otpExpiresIn, setOtpExpiresIn] = useState<number | null>(null)
  const isDark = theme === 'dark'

  // OTP countdown timer
  useEffect(() => {
    if (otpExpiresIn && otpExpiresIn > 0) {
      const timer = setInterval(() => {
        setOtpExpiresIn((prev) => (prev && prev > 0 ? prev - 1 : null))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [otpExpiresIn])

  const handleAddBankAccount = async () => {
    setError(null)

    // Validation
    if (!formData.accountNumber || formData.accountNumber.length < 10) {
      const errorMsg = 'Account number must be at least 10 characters'
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    if (!formData.accountName || formData.accountName.length < 2) {
      const errorMsg = 'Account name must be at least 2 characters'
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    if (!formData.bankName || formData.bankName.length < 2) {
      const errorMsg = 'Bank name is required'
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    if (!formData.bankCode || formData.bankCode.length < 3) {
      const errorMsg = 'Bank code is required (minimum 3 characters)'
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    setIsLoading(true)

    try {
      const response = await api.user.addBankAccount(formData)

      if (response.success && response.data) {
        const data = response.data as any
        setCurrentBankAccountId(data.id)
        setOtpExpiresIn(data.expiresIn ? data.expiresIn * 60 : 900) // Convert minutes to seconds
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
    // Only allow single digit
    if (value.length > 1) return
    
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return
    
    const newCode = [...otpCode]
    newCode[index] = value
    
    setOtpCode(newCode)
    
    // Clear error when user starts typing
    if (error) {
      setError(null)
    }

    // Auto-focus next input
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
    
    // Clear error on paste
    if (error) {
      setError(null)
    }
    
    // Focus last filled input or next empty
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
        // Clear code on error
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
        // Clear code on error
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
    setFormData({
      accountNumber: '',
      accountName: '',
      bankName: '',
      bankCode: '',
    })
    setOtpCode(['', '', '', '', '', ''])
    setError(null)
    setCurrentBankAccountId(null)
    setOtpExpiresIn(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-md rounded-2xl border ${
        isDark 
          ? 'bg-black border-white/20' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <Bank size={24} weight="regular" className="text-tiktok-primary" />
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
              <div className={`p-3 rounded-lg ${
                isDark 
                  ? 'bg-blue-500/10 border border-blue-500/30' 
                  : 'bg-blue-50 border border-blue-200'
              }`}>
                <p className={`text-sm font-sequel ${
                  isDark ? 'text-blue-300' : 'text-blue-700'
                }`}>
                  💡 A verification code will be sent to your email. You'll need to verify the account before using it for payouts.
                </p>
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
                  value={formData.accountNumber}
                  onChange={(e) => {
                    setFormData({ ...formData, accountNumber: e.target.value })
                    setError(null)
                  }}
                  placeholder="1234567890"
                  disabled={isLoading}
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-tiktok-primary font-sequel ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>

              {/* Account Name */}
              <div>
                <label className={`block text-sm font-medium mb-2 font-sequel ${
                  isDark ? 'text-white/80' : 'text-gray-700'
                }`}>
                  Account Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.accountName}
                  onChange={(e) => {
                    setFormData({ ...formData, accountName: e.target.value })
                    setError(null)
                  }}
                  placeholder="John Doe"
                  disabled={isLoading}
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-tiktok-primary font-sequel ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>

              {/* Bank Name */}
              <div>
                <label className={`block text-sm font-medium mb-2 font-sequel ${
                  isDark ? 'text-white/80' : 'text-gray-700'
                }`}>
                  Bank Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => {
                    setFormData({ ...formData, bankName: e.target.value })
                    setError(null)
                  }}
                  placeholder="First Bank of Nigeria"
                  disabled={isLoading}
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-tiktok-primary font-sequel ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                />
              </div>

              {/* Bank Code */}
              <div>
                <label className={`block text-sm font-medium mb-2 font-sequel ${
                  isDark ? 'text-white/80' : 'text-gray-700'
                }`}>
                  Bank Code <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.bankCode}
                  onChange={(e) => {
                    setFormData({ ...formData, bankCode: e.target.value })
                    setError(null)
                  }}
                  placeholder="011"
                  disabled={isLoading}
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-tiktok-primary font-sequel ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                />
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
                  disabled={isLoading || !formData.accountNumber || !formData.accountName || !formData.bankName || !formData.bankCode}
                  className="flex-1 bg-tiktok-primary text-white py-3 rounded-xl font-semibold hover:bg-tiktok-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-sequel flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Bank size={18} weight="regular" />
                      <span>Add Account</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Info Box */}
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
                      className={`w-12 h-14 border rounded-lg text-center font-monument font-bold text-xl focus:outline-none focus:ring-2 focus:ring-tiktok-primary focus:border-tiktok-primary transition-all ${
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
                  className="flex-1 bg-tiktok-primary text-white py-3 rounded-xl font-semibold hover:bg-tiktok-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-sequel flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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

