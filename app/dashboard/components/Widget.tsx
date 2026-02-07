'use client'

import { useState, useEffect, useRef } from 'react'
import { X, CheckCircle, Circle, CircleNotch } from '@phosphor-icons/react'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'
import { widgetSocketManager } from '@/lib/widget-socket'
import { RequestCredentialsStep } from './widget-steps/RequestCredentialsStep'
import { WaitingForAdminStep } from './widget-steps/WaitingForAdminStep'
import { EnterAuthCodeStep } from './widget-steps/EnterAuthCodeStep'
import { TikTokSetupStep } from './widget-steps/TikTokSetupStep'
import { ConfirmSetupStep } from './widget-steps/ConfirmSetupStep'
import { PendingVerificationStep } from './widget-steps/PendingVerificationStep'
import { CollectingAmountStep } from './widget-steps/CollectingAmountStep'
import { CollectingProofStep } from './widget-steps/CollectingProofStep'
import { ConfirmingPayPalStep } from './widget-steps/ConfirmingPayPalStep'
import { PendingAdminStep } from './widget-steps/PendingAdminStep'
import { CompletedStep } from './widget-steps/CompletedStep'

interface WidgetProps {
  isOpen: boolean
  onClose: () => void
  theme: 'light' | 'dark'
  trigger: 'onboarding' | 'deposit'
  context?: { amount?: number; payoutId?: string; balance?: number }
  onSuccess?: () => void
  onOpenSupport?: (conversationId: string | null, type?: 'general' | 'onboarding' | 'call_request') => void
}

interface WidgetSession {
  sessionId: string
  currentStep: string
  trigger: 'onboarding' | 'deposit'
  status: 'active' | 'completed' | 'abandoned' | 'error'
  completedSteps: string[]
  collectedData: any
  expiresAt?: string
}

export function Widget({
  isOpen,
  onClose,
  theme,
  trigger,
  context,
  onSuccess,
  onOpenSupport,
}: WidgetProps) {
  const toast = useToast()
  const isDark = theme === 'dark'
  const [session, setSession] = useState<WidgetSession | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [socketConnected, setSocketConnected] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [hasMoved, setHasMoved] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Initialize widget session
  useEffect(() => {
    if (isOpen && !session) {
      initializeSession()
    }
  }, [isOpen, trigger])

  // Connect WebSocket
  useEffect(() => {
    if (isOpen && session) {
      connectSocket()
      return () => {
        widgetSocketManager.disconnect()
      }
    }
  }, [isOpen, session])

  const initializeSession = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) {
        throw new Error('Not authenticated')
      }

      const response = await api.widget.init(trigger, context)
      if (response.success && response.data) {
        const data = response.data as any
        setSession({
          sessionId: data.sessionId,
          currentStep: data.currentStep,
          trigger: data.trigger,
          status: 'active',
          completedSteps: [],
          collectedData: {},
          expiresAt: data.expiresAt,
        })
      }
    } catch (error) {
      const errorMsg = error instanceof ApiError ? error.message : 'Failed to initialize widget'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const connectSocket = async () => {
    if (!session) return

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) return

      await widgetSocketManager.connect(token)
      setSocketConnected(true)

      // Join session room
      widgetSocketManager.joinSession(session.sessionId)

      // Set up event listeners
      widgetSocketManager.onStep((data) => {
        if (data.sessionId === session.sessionId) {
          // Handle both currentStep and nextStep from WebSocket
          const newStep = data.currentStep || (data as any).nextStep
          setSession((prev) => prev ? {
            ...prev,
            currentStep: newStep || prev.currentStep,
            completedSteps: prev.completedSteps.includes(prev.currentStep)
              ? prev.completedSteps
              : [...prev.completedSteps, prev.currentStep],
          } : null)
          if (data.message) {
            toast.success(data.message)
          }
        }
      })

      widgetSocketManager.onComplete((data) => {
        if (data.sessionId === session.sessionId) {
          setSession((prev) => prev ? { ...prev, status: 'completed' as const } : null)
          if (data.message) {
            toast.success(data.message)
          }
          if (onSuccess) {
            setTimeout(() => {
              onSuccess()
              handleClose()
            }, 2000)
          }
        }
      })

      widgetSocketManager.onError((data) => {
        if (data.sessionId === session.sessionId) {
          setError(data.error)
          toast.error(data.error)
        }
      })

      widgetSocketManager.onStatus((data) => {
        if (data.sessionId === session.sessionId) {
          setSession((prev) => prev ? {
            ...prev,
            status: data.status as any,
            currentStep: data.currentStep || prev.currentStep,
          } : null)
        }
      })
    } catch (error) {
      console.error('Failed to connect widget socket:', error)
    }
  }

  const handleSubmitStep = async (step: string, data: any) => {
    if (!session) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await api.widget.submitStep(session.sessionId, step, data)
      if (response.success && response.data) {
        // Backend may return either currentStep or nextStep
        const data = response.data as any
        const newStep = data.currentStep || data.nextStep
        setSession((prev) => prev ? {
          ...prev,
          currentStep: newStep || prev.currentStep,
          completedSteps: prev.completedSteps.includes(step)
            ? prev.completedSteps
            : [...prev.completedSteps, step],
          collectedData: { ...prev.collectedData, ...data },
        } : null)
        if (data.message) {
          toast.success(data.message || 'Step completed successfully')
        }
      }
    } catch (error) {
      const errorMsg = error instanceof ApiError ? error.message : 'Failed to submit step'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUploadProof = async (file: File, step?: string) => {
    if (!session) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await api.widget.uploadProof(session.sessionId, file, step)
      if (response.success && response.data) {
        const data = response.data as any
        return data.fileUrl
      }
    } catch (error) {
      const errorMsg = error instanceof ApiError ? error.message : 'Failed to upload proof'
      setError(errorMsg)
      toast.error(errorMsg)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleComplete = async (finalData?: any) => {
    if (!session) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await api.widget.complete(session.sessionId, finalData)
      if (response.success) {
        setSession((prev) => prev ? { ...prev, status: 'completed' as const } : null)
        if (response.message) {
          toast.success(response.message)
        }
        if (onSuccess) {
          setTimeout(() => {
            onSuccess()
            handleClose()
          }, 2000)
        }
      }
    } catch (error) {
      const errorMsg = error instanceof ApiError ? error.message : 'Failed to complete widget'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMinimize = () => {
    setIsMinimized(true)
  }

  const handleRestore = () => {
    setIsMinimized(false)
  }

  const handleClose = () => {
    if (session) {
      widgetSocketManager.leaveSession(session.sessionId)
      widgetSocketManager.disconnect()
    }
    setSession(null)
    setError(null)
    setIsLoading(false)
    setIsMinimized(false)
    onClose()
  }

  // Listen for chat open events to minimize widget
  useEffect(() => {
    if (!isOpen) return

    const handleChatOpened = (event: Event) => {
      setIsMinimized(true)
    }
    
    window.addEventListener('chatOpened', handleChatOpened)
    document.addEventListener('chatOpened', handleChatOpened)
    
    return () => {
      window.removeEventListener('chatOpened', handleChatOpened)
      document.removeEventListener('chatOpened', handleChatOpened)
    }
  }, [isOpen])

  const getStepTitle = () => {
    if (!session) return 'Loading...'
    
    const stepTitles: Record<string, string> = {
      'request-credentials': 'Request Credentials',
      'waiting-for-admin': 'Waiting for Admin',
      'enter-auth-code': 'Enter Auth Code',
      'tiktok-setup-instructions': 'TikTok Setup Instructions',
      'confirm-setup': 'Confirm Setup',
      'pending-verification': 'Pending Verification',
      'collecting-amount': 'Deposit Amount',
      'collecting-proof': 'Upload Proof',
      'confirming-paypal': 'Confirm PayPal',
      'pending-admin': 'Pending Admin Approval',
      'completed': 'Completed',
    }
    
    return stepTitles[session.currentStep] || 'Widget'
  }

  // Initialize position from localStorage or use default
  useEffect(() => {
    if (isMinimized && typeof window !== 'undefined') {
      const savedPosition = localStorage.getItem('widgetMinimizedPosition')
      if (savedPosition) {
        try {
          const { x, y } = JSON.parse(savedPosition)
          setPosition({ x, y })
        } catch (e) {
          setPosition({ x: 0, y: 0 })
        }
      }
    }
  }, [isMinimized])

  // Drag handlers
  const handleDragStart = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    setIsDragging(true)
    setHasMoved(false)
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDragStart({
        x: clientX - rect.left - position.x,
        y: clientY - rect.top - position.y,
      })
    }
  }

  const handleDrag = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !buttonRef.current) return

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    const newX = clientX - dragStart.x - (window.innerWidth - buttonRef.current.offsetWidth)
    const newY = clientY - dragStart.y - (window.innerHeight - buttonRef.current.offsetHeight)

    // Check if user has moved significantly (more than 5px)
    const deltaX = Math.abs(newX - position.x)
    const deltaY = Math.abs(newY - position.y)
    if (deltaX > 5 || deltaY > 5) {
      setHasMoved(true)
    }

    // Constrain to viewport
    const maxX = 0
    const minX = -(window.innerWidth - buttonRef.current.offsetWidth)
    const maxY = 0
    const minY = -(window.innerHeight - buttonRef.current.offsetHeight - 100) // Leave space for navigation

    setPosition({
      x: Math.max(minX, Math.min(maxX, newX)),
      y: Math.max(minY, Math.min(maxY, newY)),
    })
  }

  const handleDragEnd = () => {
    const wasDragging = isDragging
    setIsDragging(false)
    // Save position to localStorage
    if (typeof window !== 'undefined' && wasDragging) {
      localStorage.setItem('widgetMinimizedPosition', JSON.stringify(position))
    }
    // Reset hasMoved after a short delay
    setTimeout(() => setHasMoved(false), 100)
  }

  // Set up drag event listeners
  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e: MouseEvent) => handleDrag(e)
      const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault()
        handleDrag(e)
      }
      const handleMouseUp = () => handleDragEnd()
      const handleTouchEnd = () => handleDragEnd()

      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('touchmove', handleTouchMove, { passive: false })
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchend', handleTouchEnd)

      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('touchmove', handleTouchMove)
        window.removeEventListener('mouseup', handleMouseUp)
        window.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [isDragging, dragStart, position])

  if (!isOpen) return null

  // Minimized state - show floating draggable button
  if (isMinimized) {
    const buttonStyle: React.CSSProperties = {
      transform: `translate(${position.x}px, ${position.y}px)`,
      transition: isDragging ? 'none' : 'transform 0.2s ease-out',
      cursor: isDragging ? 'grabbing' : 'grab',
      touchAction: 'none',
    }

    return (
      <div 
        className="fixed bottom-20 right-4 z-50"
        style={buttonStyle}
      >
        <button
          ref={buttonRef}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          onClick={(e) => {
            // Only restore if user didn't drag (clicked without moving)
            if (!hasMoved && !isDragging) {
              handleRestore()
            }
          }}
          className={`flex items-center space-x-2 px-4 py-3 rounded-xl shadow-lg border select-none ${
            isDragging
              ? 'scale-105 opacity-90'
              : 'hover:scale-105 transition-transform active:scale-95'
          } ${
            isDark 
              ? 'bg-black border-white/20 text-white hover:bg-white/10' 
              : 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50'
          }`}
        >
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
            session?.status === 'active' ? 'bg-tiktok-primary animate-pulse' : 'bg-gray-400'
          }`} />
          <span className="font-sequel text-sm font-semibold whitespace-nowrap">
            {getStepTitle()}
          </span>
          <X 
            size={16} 
            weight="regular" 
            onClick={(e) => {
              e.stopPropagation()
              handleClose()
            }}
            className="ml-2 hover:opacity-70 flex-shrink-0"
          />
        </button>
      </div>
    )
  }

  const renderStep = () => {
    if (!session) {
      return (
        <div className="flex items-center justify-center p-8">
          <CircleNotch className="animate-spin text-tiktok-primary" size={32} weight="bold" />
        </div>
      )
    }

    const stepProps = {
      theme,
      isLoading,
      error,
      onSubmit: handleSubmitStep,
      onUploadProof: handleUploadProof,
      onComplete: handleComplete,
      sessionData: session.collectedData,
      onOpenSupport,
    }

    switch (session.currentStep) {
      // Onboarding steps
      case 'request-credentials':
        return <RequestCredentialsStep {...stepProps} />
      case 'waiting-for-admin':
        return <WaitingForAdminStep {...stepProps} />
      case 'enter-auth-code':
        return <EnterAuthCodeStep {...stepProps} />
      case 'tiktok-setup-instructions':
        return <TikTokSetupStep {...stepProps} />
      case 'confirm-setup':
        return <ConfirmSetupStep {...stepProps} />
      case 'pending-verification':
        return <PendingVerificationStep {...stepProps} />
      
      // Deposit steps
      case 'collecting-amount':
        return <CollectingAmountStep {...stepProps} context={context} />
      case 'collecting-proof':
        return <CollectingProofStep {...stepProps} />
      case 'confirming-paypal':
        return <ConfirmingPayPalStep {...stepProps} />
      case 'pending-admin':
        return <PendingAdminStep {...stepProps} />
      
      // Completion
      case 'completed':
        return <CompletedStep {...stepProps} onClose={handleClose} />
      
      default:
        return (
          <div className="p-8 text-center">
            <p className={isDark ? 'text-white' : 'text-gray-900'}>
              Unknown step: {session.currentStep}
            </p>
          </div>
        )
    }
  }

  const getProgress = () => {
    if (!session) return 0
    
    const onboardingSteps = ['request-credentials', 'waiting-for-admin', 'enter-auth-code', 'tiktok-setup-instructions', 'confirm-setup', 'pending-verification', 'completed']
    const depositSteps = ['collecting-amount', 'collecting-proof', 'confirming-paypal', 'pending-admin', 'completed']
    
    const steps = trigger === 'onboarding' ? onboardingSteps : depositSteps
    const currentIndex = steps.indexOf(session.currentStep)
    return currentIndex >= 0 ? ((currentIndex + 1) / steps.length) * 100 : 0
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-full max-w-2xl rounded-2xl border transform transition-all duration-300 ${
        isDark 
          ? 'bg-black border-white/20' 
          : 'bg-white border-gray-200'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center space-x-3 flex-1">
            <h3 className={`font-monument font-bold text-lg ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {getStepTitle()}
            </h3>
            {session && (
              <span className={`text-xs px-2 py-1 rounded ${
                isDark ? 'bg-white/10 text-white/60' : 'bg-gray-100 text-gray-600'
              }`}>
                {trigger}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleMinimize}
              className={`${isDark ? 'text-white/80 hover:text-white' : 'text-gray-700 hover:text-gray-900'}`}
              disabled={isLoading}
              title="Minimize"
            >
              <div className="w-4 h-0.5 bg-current" />
            </button>
            <button
              onClick={handleClose}
              className={`${isDark ? 'text-white/80 hover:text-white' : 'text-gray-700 hover:text-gray-900'}`}
              disabled={isLoading}
              title="Close"
            >
              <X size={24} weight="regular" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {session && (
          <div className="px-4 pt-4">
            <div className={`h-1 rounded-full overflow-hidden ${
              isDark ? 'bg-white/10' : 'bg-gray-200'
            }`}>
              <div
                className="h-full bg-tiktok-primary transition-all duration-300"
                style={{ width: `${getProgress()}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs">
              {session.completedSteps.map((step, idx) => (
                <div key={step} className="flex items-center">
                  <CheckCircle size={12} weight="fill" className="text-tiktok-primary" />
                  {idx < session.completedSteps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-1 ${
                      isDark ? 'bg-white/20' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
              <Circle size={12} weight="regular" className={isDark ? 'text-white/40' : 'text-gray-400'} />
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className={`mx-4 mt-4 p-3 rounded-lg ${
            isDark 
              ? 'bg-red-500/20 border border-red-500/50' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`text-sm font-sequel ${
              isDark ? 'text-red-300' : 'text-red-600'
            }`}>{error}</p>
          </div>
        )}

        {/* Content */}
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {renderStep()}
        </div>
      </div>
    </div>
  )
}

