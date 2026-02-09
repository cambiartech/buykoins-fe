'use client'

import { useState } from 'react'
import { X } from '@phosphor-icons/react'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'
import { FileUpload } from './FileUpload'

interface CreditRequestModalProps {
  isOpen: boolean
  onClose: () => void
  theme: 'light' | 'dark'
  onSuccess: () => void
}

export function CreditRequestModal({ isOpen, onClose, theme, onSuccess }: CreditRequestModalProps) {
  const toast = useToast()
  const [creditAmount, setCreditAmount] = useState('')
  const [creditProof, setCreditProof] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isDark = theme === 'dark'

  const handleFileChange = (file: File | null) => {
    setCreditProof(file)
    if (file) {
      setError(null)
    }
  }

  const handleFileError = (errorMsg: string) => {
    setError(errorMsg)
    toast.error(errorMsg)
  }

  const handleSubmit = async () => {
    // Clear previous errors
    setError(null)

    // Validate amount
    if (!creditAmount) {
      const errorMsg = 'Please enter an amount'
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    const amount = parseFloat(creditAmount)
    if (isNaN(amount) || amount <= 0) {
      const errorMsg = 'Amount must be a positive number'
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    if (amount < 1.00) {
      const errorMsg = 'Amount must be at least $1.00'
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    // Validate proof file
    if (!creditProof) {
      const errorMsg = 'Please upload proof of earnings'
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await api.user.createCreditRequest(amount, creditProof)

      if (response.success) {
        toast.success(response.message || 'Credit request submitted successfully!')
        // Reset form
        setCreditAmount('')
        setCreditProof(null)
        onSuccess()
        onClose()
      } else {
        const errorMsg = response.message || 'Failed to submit credit request'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        let errorMsg = error.message || 'Failed to submit credit request'
        
        // Handle specific error cases
        if (error.status === 403) {
          errorMsg = 'You must complete onboarding before submitting credit requests'
        } else if (error.status === 409) {
          errorMsg = 'You already have a pending credit request. Please wait for it to be processed.'
        } else if (error.status === 400) {
          // Validation errors from backend
          errorMsg = error.message || 'Invalid request. Please check your input.'
        }
        
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

  const handleClose = () => {
    setCreditAmount('')
    setCreditProof(null)
    setError(null)
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
          <h3 className={`font-monument font-bold text-lg ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>New Deposit</h3>
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

          {/* Amount Input */}
          <div>
            <label className={`block text-sm font-medium mb-2 font-sequel ${
              isDark ? 'text-white/80' : 'text-gray-700'
            }`}>
              Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="1.00"
              value={creditAmount}
              onChange={(e) => {
                setCreditAmount(e.target.value)
                setError(null)
              }}
              placeholder="1.00"
              disabled={isLoading}
              className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-600 font-sequel ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                  : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
            />
            <p className={`mt-1 text-xs font-sequel ${
              isDark ? 'text-white/50' : 'text-gray-500'
            }`}>
              Minimum amount: $1.00
            </p>
          </div>

          {/* File Upload */}
          <FileUpload
            accept="image/jpeg,image/jpg,image/png,image/webp,.pdf"
            maxSizeMB={10}
            value={creditProof}
            onChange={handleFileChange}
            onError={handleFileError}
            disabled={isLoading}
            theme={theme}
            label="Upload Proof"
            description="Upload proof of your TikTok earnings (screenshot, statement, etc.)"
            allowedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']}
            allowedTypesText="JPG, PNG, WEBP, PDF"
          />

          {/* Action Buttons */}
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
              disabled={!creditAmount || !creditProof || isLoading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-sequel flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Request</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

