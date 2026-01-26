'use client'

import { useState } from 'react'
import { X, CheckCircle, Wallet, Bank, FileImage, FilePdf, XCircle } from '@phosphor-icons/react'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '@/lib/toast'

interface CreditRequest {
  id: string
  amount: number
  status: 'pending' | 'approved' | 'rejected'
  user: {
    email: string
    firstName?: string
    lastName?: string
    balance?: number
    onboardingStatus?: 'pending' | 'completed'
  } | null
}

interface ApproveCreditRequestModalProps {
  isOpen: boolean
  onClose: () => void
  request: CreditRequest
  onApprove: (
    id: string,
    options: {
      notes?: string
      creditMethod?: 'balance' | 'direct'
      amount?: number
      adminProof?: File
    }
  ) => Promise<void>
}

export function ApproveCreditRequestModal({
  isOpen,
  onClose,
  request,
  onApprove,
}: ApproveCreditRequestModalProps) {
  const { isDark } = useTheme()
  const toast = useToast()
  const [notes, setNotes] = useState('')
  const [creditMethod, setCreditMethod] = useState<'balance' | 'direct'>('balance')
  const [amount, setAmount] = useState<string>(request.amount.toString())
  const [adminProof, setAdminProof] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    amount?: string
    adminProof?: string
    general?: string
  }>({})

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      const errorMsg = 'File must be JPG, JPEG, PNG, WEBP, or PDF'
      setErrors({ adminProof: errorMsg })
      toast.error(errorMsg)
      return
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      const errorMsg = 'File size must be less than 10MB'
      setErrors({ adminProof: errorMsg })
      toast.error(errorMsg)
      return
    }

    setAdminProof(file)
    setErrors({})

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProofPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setProofPreview(null)
    }
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setAmount(value)
    if (errors.amount) {
      setErrors({})
    }
  }

  const handleSubmit = async () => {
    setErrors({})

    // Validate amount
    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      const errorMsg = 'Amount must be a positive number'
      setErrors({ amount: errorMsg })
      toast.error(errorMsg)
      return
    }

    setIsLoading(true)
    try {
      await onApprove(request.id, {
        notes: notes.trim() || undefined,
        creditMethod,
        amount: amountNum,
        adminProof: adminProof || undefined,
      })
      // If successful, onApprove will close the modal
      handleClose()
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to approve credit request'
      setErrors({ general: errorMsg })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setNotes('')
    setCreditMethod('balance')
    setAmount(request.amount.toString())
    setAdminProof(null)
    setProofPreview(null)
    setErrors({})
    onClose()
  }

  const getFileIcon = () => {
    if (!adminProof) return null
    if (adminProof.type === 'application/pdf') {
      return <FilePdf size={20} weight="regular" className={isDark ? 'text-red-400' : 'text-red-600'} />
    }
    return <FileImage size={20} weight="regular" className={isDark ? 'text-blue-400' : 'text-blue-600'} />
  }

  if (!isOpen) return null

  const hasBankAccount = request.user?.onboardingStatus === 'completed'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-2xl rounded-2xl border max-h-[90vh] overflow-y-auto ${
        isDark 
          ? 'bg-black border-white/20' 
          : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-inherit">
          <div className="flex items-center space-x-3">
            <CheckCircle size={24} weight="regular" className="text-green-500" />
            <h3 className={`font-monument font-bold text-lg ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>Approve Credit Request</h3>
          </div>
          <button
            onClick={handleClose}
            className={`${isDark ? 'text-white/80' : 'text-gray-700'}`}
            disabled={isLoading}
          >
            <X size={24} weight="regular" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* General Error Message */}
          {errors.general && (
            <div className={`p-3 rounded-lg ${
              isDark 
                ? 'bg-red-500/20 border border-red-500/50' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`text-sm font-sequel ${
                isDark ? 'text-red-300' : 'text-red-600'
              }`}>{errors.general}</p>
            </div>
          )}

          {/* Request Info */}
          <div className={`p-4 rounded-xl border ${
            isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
          }`}>
            {request.user ? (
              <>
                <p className={`text-sm font-sequel mb-1 ${
                  isDark ? 'text-white/60' : 'text-gray-600'
                }`}>User</p>
                <p className={`font-semibold font-sequel ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {request.user.firstName && request.user.lastName
                    ? `${request.user.firstName} ${request.user.lastName}`
                    : request.user.email}
                </p>
                {request.user.balance !== undefined && (
                  <p className={`text-sm font-sequel mt-2 ${
                    isDark ? 'text-white/60' : 'text-gray-600'
                  }`}>
                    Current Balance: ${request.user.balance.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                )}
              </>
            ) : (
              <p className={`text-sm font-sequel ${
                isDark ? 'text-white/60' : 'text-gray-600'
              }`}>User not found</p>
            )}
            <p className={`text-sm font-sequel mt-2 mb-1 ${
              isDark ? 'text-white/60' : 'text-gray-600'
            }`}>Requested Amount</p>
            <p className={`font-monument font-bold text-xl ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              ${request.amount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          {/* Credit Method Selection */}
          <div>
            <label className={`block text-sm font-medium mb-3 font-sequel ${
              isDark ? 'text-white/80' : 'text-gray-700'
            }`}>
              Credit Method <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCreditMethod('balance')}
                disabled={isLoading}
                className={`p-4 rounded-xl border-2 transition-all font-sequel ${
                  creditMethod === 'balance'
                    ? 'border-tiktok-primary bg-tiktok-primary/10'
                    : isDark
                    ? 'border-white/10 bg-white/5 hover:border-white/20'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Wallet size={20} weight="regular" className={
                    creditMethod === 'balance' ? 'text-tiktok-primary' : (isDark ? 'text-white/60' : 'text-gray-600')
                  } />
                  <span className={`font-semibold ${
                    creditMethod === 'balance'
                      ? 'text-tiktok-primary'
                      : isDark ? 'text-white' : 'text-gray-900'
                  }`}>Balance</span>
                </div>
                <p className={`text-xs text-left ${
                  isDark ? 'text-white/60' : 'text-gray-600'
                }`}>
                  Credit user's balance on the system
                </p>
              </button>
              <button
                type="button"
                onClick={() => setCreditMethod('direct')}
                disabled={isLoading || !hasBankAccount}
                className={`p-4 rounded-xl border-2 transition-all font-sequel ${
                  !hasBankAccount
                    ? 'opacity-50 cursor-not-allowed'
                    : creditMethod === 'direct'
                    ? 'border-tiktok-primary bg-tiktok-primary/10'
                    : isDark
                    ? 'border-white/10 bg-white/5 hover:border-white/20'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Bank size={20} weight="regular" className={
                    creditMethod === 'direct' ? 'text-tiktok-primary' : (isDark ? 'text-white/60' : 'text-gray-600')
                  } />
                  <span className={`font-semibold ${
                    creditMethod === 'direct'
                      ? 'text-tiktok-primary'
                      : isDark ? 'text-white' : 'text-gray-900'
                  }`}>Direct</span>
                </div>
                <p className={`text-xs text-left ${
                  isDark ? 'text-white/60' : 'text-gray-600'
                }`}>
                  Remit directly to bank account
                </p>
                {!hasBankAccount && (
                  <p className={`text-xs mt-1 ${
                    isDark ? 'text-yellow-400' : 'text-yellow-600'
                  }`}>
                    Requires verified bank account
                  </p>
                )}
              </button>
            </div>
            {creditMethod === 'direct' && !hasBankAccount && (
              <p className={`mt-2 text-xs font-sequel ${
                isDark ? 'text-yellow-300' : 'text-yellow-600'
              }`}>
                ⚠️ User must have a verified primary bank account for direct remittance
              </p>
            )}
          </div>

          {/* Amount Input */}
          <div>
            <label className={`block text-sm font-medium mb-2 font-sequel ${
              isDark ? 'text-white/80' : 'text-gray-700'
            }`}>
              Credit Amount <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={handleAmountChange}
              disabled={isLoading}
              className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-tiktok-primary font-sequel ${
                errors.amount
                  ? 'border-red-500/50 focus:ring-red-500/50'
                  : isDark
                  ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
              placeholder={request.amount.toString()}
            />
            {errors.amount && (
              <p className="mt-1.5 text-red-400 text-xs font-sequel">{errors.amount}</p>
            )}
            <p className={`mt-1 text-xs font-sequel ${
              isDark ? 'text-white/50' : 'text-gray-500'
            }`}>
              Leave empty or enter a different amount than requested
            </p>
          </div>

          {/* Notes Input */}
          <div>
            <label className={`block text-sm font-medium mb-2 font-sequel ${
              isDark ? 'text-white/80' : 'text-gray-700'
            }`}>
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this approval..."
              rows={3}
              maxLength={500}
              disabled={isLoading}
              className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-tiktok-primary font-sequel resize-none ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
            />
            <p className={`mt-1 text-xs font-sequel ${
              isDark ? 'text-white/40' : 'text-gray-400'
            }`}>
              Characters: {notes.length} / 500
            </p>
          </div>

          {/* Admin Proof Upload */}
          <div>
            <label className={`block text-sm font-medium mb-2 font-sequel ${
              isDark ? 'text-white/80' : 'text-gray-700'
            }`}>
              Admin Proof (Optional)
            </label>
            <div className={`p-4 rounded-lg border-2 border-dashed ${
              isDark ? 'border-white/20 bg-white/5' : 'border-gray-300 bg-gray-50'
            }`}>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                onChange={handleFileChange}
                disabled={isLoading}
                className="hidden"
                id="adminProof"
              />
              <label
                htmlFor="adminProof"
                className={`cursor-pointer flex flex-col items-center justify-center space-y-2 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {adminProof ? (
                  <div className="w-full">
                    <div className="flex items-center space-x-2 mb-2">
                      {getFileIcon()}
                      <span className={`text-sm font-sequel ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {adminProof.name}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setAdminProof(null)
                          setProofPreview(null)
                        }}
                        className="ml-auto"
                      >
                        <XCircle size={18} weight="regular" className={isDark ? 'text-white/60' : 'text-gray-600'} />
                      </button>
                    </div>
                    {proofPreview && (
                      <img
                        src={proofPreview}
                        alt="Proof preview"
                        className="w-full rounded-lg border border-white/10 max-h-48 object-contain"
                      />
                    )}
                  </div>
                ) : (
                  <>
                    <FileImage size={32} weight="regular" className={isDark ? 'text-white/40' : 'text-gray-400'} />
                    <p className={`text-sm font-sequel ${
                      isDark ? 'text-white/60' : 'text-gray-600'
                    }`}>
                      Click to upload proof file
                    </p>
                    <p className={`text-xs font-sequel ${
                      isDark ? 'text-white/40' : 'text-gray-500'
                    }`}>
                      JPG, JPEG, PNG, WEBP, or PDF (max 10MB)
                    </p>
                  </>
                )}
              </label>
            </div>
            {errors.adminProof && (
              <p className="mt-1.5 text-red-400 text-xs font-sequel">{errors.adminProof}</p>
            )}
          </div>

          {/* Info Box */}
          <div className={`p-3 rounded-lg ${
            isDark 
              ? 'bg-blue-500/10 border border-blue-500/30' 
              : 'bg-blue-50 border border-blue-200'
          }`}>
            <p className={`text-sm font-sequel ${
              isDark ? 'text-blue-300' : 'text-blue-700'
            }`}>
              {creditMethod === 'balance' ? (
                <>💡 <strong>Balance Method:</strong> User's balance will be increased by the credit amount. Transaction will be recorded.</>
              ) : (
                <>💡 <strong>Direct Method:</strong> Amount will be remitted directly to user's verified bank account. Balance will NOT be updated, but transaction will be recorded for tracking.</>
              )}
            </p>
          </div>

          {/* Actions */}
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
              onClick={handleSubmit}
              disabled={isLoading || !amount || parseFloat(amount) <= 0}
              className="flex-1 bg-tiktok-primary text-white py-3 rounded-xl font-semibold hover:bg-tiktok-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-sequel flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={18} weight="regular" />
                  <span>Approve Request</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

