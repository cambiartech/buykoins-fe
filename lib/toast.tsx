'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { X, CheckCircle, XCircle, Warning, Info } from '@phosphor-icons/react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, duration?: number) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (type: ToastType, message: string, duration: number = 5000) => {
      const id = Math.random().toString(36).substring(7)
      const toast: Toast = { id, type, message, duration }

      setToasts((prev) => [...prev, toast])

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id)
        }, duration)
      }
    },
    [removeToast]
  )

  const success = useCallback((message: string, duration?: number) => {
    showToast('success', message, duration)
  }, [showToast])

  const error = useCallback((message: string, duration?: number) => {
    showToast('error', message, duration)
  }, [showToast])

  const warning = useCallback((message: string, duration?: number) => {
    showToast('warning', message, duration)
  }, [showToast])

  const info = useCallback((message: string, duration?: number) => {
    showToast('info', message, duration)
  }, [showToast])

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md w-full sm:w-auto">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bgStyle: { backgroundColor: 'oklch(62.7% 0.194 149.214)' },
          borderStyle: { borderColor: 'oklch(55% 0.194 149.214)' },
          text: 'text-white',
          icon: CheckCircle,
          iconColor: 'text-white',
          closeButton: 'text-white/90 hover:text-white hover:bg-white/20',
        }
      case 'error':
        return {
          bgStyle: { backgroundColor: 'oklch(50.5% 0.213 27.518)' },
          borderStyle: { borderColor: 'oklch(45% 0.213 27.518)' },
          text: 'text-white',
          icon: XCircle,
          iconColor: 'text-white',
          closeButton: 'text-white/90 hover:text-white hover:bg-white/20',
        }
      case 'warning':
        return {
          bgStyle: { backgroundColor: 'oklch(70% 0.15 85)' },
          borderStyle: { borderColor: 'oklch(65% 0.15 85)' },
          text: 'text-gray-900',
          icon: Warning,
          iconColor: 'text-gray-900',
          closeButton: 'text-gray-700 hover:text-gray-900 hover:bg-gray-900/10',
        }
      case 'info':
        return {
          bgStyle: { backgroundColor: 'oklch(48.8% 0.243 264.376)' },
          borderStyle: { borderColor: 'oklch(43% 0.243 264.376)' },
          text: 'text-white',
          icon: Info,
          iconColor: 'text-white',
          closeButton: 'text-white/90 hover:text-white hover:bg-white/20',
        }
    }
  }

  const styles = getToastStyles()
  const Icon = styles.icon

  return (
    <div
      className={`${styles.text} border-2 rounded-xl p-4 shadow-2xl animate-in slide-in-from-right-full duration-300 flex items-start space-x-3 min-w-[300px] max-w-md`}
      style={{
        ...styles.bgStyle,
        borderColor: styles.borderStyle.borderColor,
      }}
    >
      <Icon size={20} weight="fill" className={`${styles.iconColor} flex-shrink-0 mt-0.5`} />
      <p className="flex-1 font-sequel text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className={`${styles.closeButton} rounded-lg p-1 transition-all flex-shrink-0`}
        aria-label="Close notification"
      >
        <X size={18} weight="regular" />
      </button>
    </div>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

