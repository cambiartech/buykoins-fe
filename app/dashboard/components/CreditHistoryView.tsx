'use client'

import { useState, useEffect } from 'react'
import { X, Clock, CheckCircle, XCircle, FileImage, FilePdf } from '@phosphor-icons/react'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'

interface CreditRequest {
  id: string
  amount: number
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
  processedAt: string | null
  rejectionReason: string | null
  proofUrl: string | null
}

interface CreditHistoryViewProps {
  theme: 'light' | 'dark'
  onClose: () => void
}

export function CreditHistoryView({ theme, onClose }: CreditHistoryViewProps) {
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [creditRequests, setCreditRequests] = useState<CreditRequest[]>([])
  const [error, setError] = useState<string | null>(null)
  const isDark = theme === 'dark'

  useEffect(() => {
    fetchCreditHistory()
  }, [])

  const fetchCreditHistory = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.user.getCreditRequestHistory()

      if (response.success && response.data) {
        setCreditRequests(Array.isArray(response.data) ? response.data : [])
      } else {
        const errorMsg = response.message || 'Failed to load credit history'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        const errorMsg = error.message || 'Failed to load credit history'
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={20} weight="regular" className="text-yellow-500" />
      case 'approved':
        return <CheckCircle size={20} weight="regular" className="text-green-500" />
      case 'rejected':
        return <XCircle size={20} weight="regular" className="text-red-500" />
      default:
        return <Clock size={20} weight="regular" className="text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return isDark ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-yellow-50 border-yellow-200'
      case 'approved':
        return isDark ? 'bg-green-500/10 border-green-500/30' : 'bg-green-50 border-green-200'
      case 'rejected':
        return isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'
      default:
        return isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const getFileIcon = (url: string | null) => {
    if (!url) return null
    if (url.toLowerCase().includes('.pdf')) {
      return <FilePdf size={16} weight="regular" className={isDark ? 'text-white/60' : 'text-gray-600'} />
    }
    return <FileImage size={16} weight="regular" className={isDark ? 'text-white/60' : 'text-gray-600'} />
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className={`font-monument font-bold text-xl ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>Credit Request History</h2>
        <button
          onClick={onClose}
          className={`${isDark ? 'text-white/80' : 'text-gray-700'}`}
        >
          <X size={24} weight="regular" />
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-tiktok-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {error && !isLoading && (
        <div className={`p-4 rounded-xl ${
          isDark 
            ? 'bg-red-500/20 border border-red-500/50' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <p className={`text-sm font-sequel text-center ${
            isDark ? 'text-red-300' : 'text-red-600'
          }`}>{error}</p>
          <button
            onClick={fetchCreditHistory}
            className="mt-2 text-sm text-tiktok-primary hover:underline font-sequel mx-auto block"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {creditRequests.length === 0 ? (
            <div className={`rounded-xl p-8 text-center border ${
              isDark
                ? 'bg-white/5 border-white/10'
                : 'bg-white border-gray-200'
            }`}>
              <p className={`font-sequel ${
                isDark ? 'text-white/60' : 'text-gray-600'
              }`}>No credit requests yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {creditRequests.map((request) => (
                <div
                  key={request.id}
                  className={`rounded-xl p-4 border ${
                    isDark
                      ? 'bg-white/5 border-white/10'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(request.status)}
                      <div>
                        <p className={`font-semibold font-sequel ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          ${request.amount.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                        <p className={`text-xs font-sequel ${
                          isDark ? 'text-white/50' : 'text-gray-500'
                        }`}>
                          Submitted: {formatDate(request.submittedAt)}
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full border text-xs font-sequel ${
                      getStatusColor(request.status)
                    } ${
                      request.status === 'pending'
                        ? isDark ? 'text-yellow-400' : 'text-yellow-700'
                        : request.status === 'approved'
                        ? isDark ? 'text-green-400' : 'text-green-700'
                        : isDark ? 'text-red-400' : 'text-red-700'
                    }`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </div>
                  </div>

                  {request.processedAt && (
                    <p className={`text-xs font-sequel mb-2 ${
                      isDark ? 'text-white/50' : 'text-gray-500'
                    }`}>
                      Processed: {formatDate(request.processedAt)}
                    </p>
                  )}

                  {request.rejectionReason && (
                    <div className={`mt-2 p-2 rounded-lg ${
                      isDark
                        ? 'bg-red-500/10 border border-red-500/20'
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <p className={`text-xs font-sequel ${
                        isDark ? 'text-red-300' : 'text-red-600'
                      }`}>
                        <strong>Reason:</strong> {request.rejectionReason}
                      </p>
                    </div>
                  )}

                  {request.proofUrl && (
                    <div className="mt-3 flex items-center space-x-2">
                      {getFileIcon(request.proofUrl)}
                      <a
                        href={request.proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-xs font-sequel hover:underline ${
                          isDark ? 'text-tiktok-primary' : 'text-tiktok-primary'
                        }`}
                      >
                        View Proof
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

