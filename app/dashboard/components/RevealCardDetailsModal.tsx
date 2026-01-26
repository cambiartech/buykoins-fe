'use client'

import { useState, useEffect, useRef } from 'react'
import { X, CreditCard } from '@phosphor-icons/react'
import { api } from '@/lib/api'
import { useToast } from '@/lib/toast'
import { Card } from './types'

declare global {
  interface Window {
    SecureProxy: any
  }
}

interface RevealCardDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  card: Card
  sudoCardId?: string
  theme: 'light' | 'dark'
}

export function RevealCardDetailsModal({
  isOpen,
  onClose,
  card,
  sudoCardId,
  theme,
}: RevealCardDetailsModalProps) {
  const isDark = theme === 'dark'
  const toast = useToast()
  const [showDetails, setShowDetails] = useState(false)
  const [loading, setLoading] = useState(false)
  const secureProxyLoaded = useRef(false)

  const cardNumberContainerId = `reveal-card-number-${card.id}`
  const cvvContainerId = `reveal-cvv-${card.id}`
  const pinContainerId = `reveal-pin-${card.id}`

  // Get vault ID based on environment
  const getVaultId = () => {
    const isProduction = process.env.NEXT_PUBLIC_SUDO_ENVIRONMENT === 'production' || 
                        process.env.NODE_ENV === 'production'
    return isProduction ? 'vdl2xefo5' : 'we0dsa28s'
  }

  useEffect(() => {
    if (isOpen && sudoCardId) {
      loadSecureProxyScript()
      // Auto-reveal when modal opens - wait for script to load
      setShowDetails(true)
      const timer = setTimeout(() => {
        if (window.SecureProxy) {
          revealDetails()
        } else {
          // Wait a bit more for script to load
          setTimeout(() => {
            if (window.SecureProxy) {
              revealDetails()
            } else {
              toast.error('Failed to load security module. Please refresh the page.')
              setLoading(false)
            }
          }, 1000)
        }
      }, 300)
      
      return () => clearTimeout(timer)
    } else {
      // Reset when modal closes
      setShowDetails(false)
      setLoading(false)
    }
  }, [isOpen, sudoCardId, toast])

  useEffect(() => {
    // Auto-hide after 90 seconds
    if (showDetails) {
      const timer = setTimeout(() => {
        setShowDetails(false)
        toast.info('Card details hidden for security')
      }, 90000)

      return () => clearTimeout(timer)
    }
  }, [showDetails, toast])

  const loadSecureProxyScript = () => {
    if (secureProxyLoaded.current || typeof window === 'undefined') return

    const script = document.createElement('script')
    script.src = 'https://js.securepro.xyz/sudo-show/1.1/ACiWvWF9tYAez4M498DHs.min.js'
    script.async = true
    script.onload = () => {
      secureProxyLoaded.current = true
    }
    script.onerror = () => {
      console.error('Failed to load Secure Proxy script')
    }
    document.body.appendChild(script)
  }

  const getCardToken = async (): Promise<string | null> => {
    try {
      const response = await api.user.getCardToken(card.id)
      if (response.success && response.data) {
        const data = response.data as any
        return data.token || null
      }
      return null
    } catch (error) {
      console.error('Failed to get card token:', error)
      return null
    }
  }

  const revealDetails = async () => {
    if (!sudoCardId) {
      toast.error('Card details not available')
      return
    }

    if (!window.SecureProxy) {
      toast.error('Loading payment security... Please wait a moment and try again.')
      loadSecureProxyScript()
      setTimeout(() => {
        if (window.SecureProxy) {
          revealDetails()
        } else {
          toast.error('Failed to load security module. Please refresh the page.')
        }
      }, 1000)
      return
    }

    setLoading(true)
    setShowDetails(true)

    try {
      const cardToken = await getCardToken()
      if (!cardToken) {
        setShowDetails(false)
        toast.error('Failed to load card details')
        return
      }

      const vaultId = getVaultId()

      // Reveal card number
      const numberSecret = window.SecureProxy.create(vaultId)
      const cardNumberIframe = numberSecret.request({
        name: 'pan-text',
        method: 'GET',
        path: `/cards/${sudoCardId}/secure-data/number`,
        headers: {
          "Authorization": `Bearer ${cardToken}`
        },
        htmlWrapper: 'text',
        jsonPathSelector: 'data.number',
        serializers: [
          numberSecret.SERIALIZERS.replace(
            '(\\d{4})(\\d{4})(\\d{4})(\\d{4})',
            '$1 $2 $3 $4 '
          ),
        ]
      })

      // Wait for DOM to be ready, then render
      const renderAll = () => {
        const cardNumberContainer = document.getElementById(cardNumberContainerId)
        const cvvContainer = document.getElementById(cvvContainerId)
        const pinContainer = document.getElementById(pinContainerId)

        if (cardNumberContainer && cvvContainer && pinContainer) {
          try {
            // Render card number
            cardNumberIframe.render(`#${cardNumberContainerId}`)

            // Reveal CVV
            const cvv2Secret = window.SecureProxy.create(vaultId)
            const cvv2iframe = cvv2Secret.request({
              name: 'cvv-text',
              method: 'GET',
              path: `/cards/${sudoCardId}/secure-data/cvv2`,
              headers: {
                "Authorization": `Bearer ${cardToken}`
              },
              htmlWrapper: 'text',
              jsonPathSelector: 'data.cvv2',
              serializers: []
            })
            cvv2iframe.render(`#${cvvContainerId}`)

            // Reveal PIN
            const pinSecret = window.SecureProxy.create(vaultId)
            const pinIframe = pinSecret.request({
              name: 'pin-text',
              method: 'GET',
              path: `/cards/${sudoCardId}/secure-data/defaultPin`,
              headers: {
                "Authorization": `Bearer ${cardToken}`
              },
              htmlWrapper: 'text',
              jsonPathSelector: 'data.defaultPin',
              serializers: []
            })
            pinIframe.render(`#${pinContainerId}`)
          } catch (error) {
            console.error('Failed to render card details:', error)
            toast.error('Failed to render card details')
          }
        } else {
          // Retry if containers not ready
          setTimeout(renderAll, 100)
        }
      }

      // Small delay to ensure containers exist in DOM
      setTimeout(renderAll, 200)
    } catch (error) {
      console.error('Failed to display card details:', error)
      toast.error('Failed to load card details')
      setShowDetails(false)
    } finally {
      setLoading(false)
    }
  }


  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative w-full max-w-md rounded-xl border ${
        isDark ? 'bg-black border-white/10' : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDark ? 'border-white/10' : 'border-gray-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-tiktok-primary/20 rounded-full flex items-center justify-center">
              <CreditCard size={20} weight="regular" className="text-tiktok-primary" />
            </div>
            <h2 className={`font-monument font-bold text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Card Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <X size={20} weight="regular" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="space-y-4">
              {/* Card Number */}
              <div>
                <label className={`block text-sm font-medium mb-2 font-sequel ${
                  isDark ? 'text-white/80' : 'text-gray-700'
                }`}>
                  Card Number
                </label>
                <div className={`p-3 rounded-lg border ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div
                    id={cardNumberContainerId}
                    className="text-lg font-mono font-bold tracking-wider min-h-[28px] flex items-center"
                    style={{
                      lineHeight: '1.75rem'
                    }}
                  >
                    {loading && (
                      <span className={isDark ? 'text-white/60' : 'text-gray-600'}>
                        <span className="inline-block w-4 h-4 border-2 border-tiktok-primary border-t-transparent rounded-full animate-spin mr-2"></span>
                        Loading...
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* CVV */}
              <div>
                <label className={`block text-sm font-medium mb-2 font-sequel ${
                  isDark ? 'text-white/80' : 'text-gray-700'
                }`}>
                  CVV
                </label>
                <div className={`p-3 rounded-lg border ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div
                    id={cvvContainerId}
                    className="text-lg font-mono font-bold min-h-[28px] flex items-center"
                    style={{
                      lineHeight: '1.75rem'
                    }}
                  >
                    {loading && (
                      <span className={isDark ? 'text-white/60' : 'text-gray-600'}>
                        <span className="inline-block w-4 h-4 border-2 border-tiktok-primary border-t-transparent rounded-full animate-spin mr-2"></span>
                        Loading...
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* PIN */}
              <div>
                <label className={`block text-sm font-medium mb-2 font-sequel ${
                  isDark ? 'text-white/80' : 'text-gray-700'
                }`}>
                  Default PIN
                </label>
                <div className={`p-3 rounded-lg border ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div
                    id={pinContainerId}
                    className="text-lg font-mono font-bold min-h-[28px] flex items-center"
                    style={{
                      lineHeight: '1.75rem'
                    }}
                  >
                    {loading && (
                      <span className={isDark ? 'text-white/60' : 'text-gray-600'}>
                        <span className="inline-block w-4 h-4 border-2 border-tiktok-primary border-t-transparent rounded-full animate-spin mr-2"></span>
                        Loading...
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Expiry Date (not sensitive) */}
              <div>
                <label className={`block text-sm font-medium mb-2 font-sequel ${
                  isDark ? 'text-white/80' : 'text-gray-700'
                }`}>
                  Expiry Date
                </label>
                <div className={`p-3 rounded-lg border ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="text-lg font-mono font-bold">
                    {card.expiryMonth || 'MM'}/{card.expiryYear || 'YY'}
                  </div>
                </div>
              </div>

              {/* Hide Button */}
              <button
                onClick={onClose}
                className={`w-full py-3 rounded-lg border font-sequel transition-colors flex items-center justify-center space-x-2 ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>Close</span>
              </button>

              {/* Auto-hide Timer */}
              {showDetails && (
                <p className={`text-center text-xs font-sequel ${
                  isDark ? 'text-white/60' : 'text-gray-600'
                }`}>
                  Details will auto-hide in 90 seconds
                </p>
              )}
            </div>
        </div>
      </div>
    </div>
  )
}
