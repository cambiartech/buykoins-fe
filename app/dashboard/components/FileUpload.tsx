'use client'

import { useState, useRef, useCallback } from 'react'
import { 
  CloudArrowUp, 
  X, 
  File, 
  FileImage, 
  FilePdf,
  CheckCircle,
  Warning
} from '@phosphor-icons/react'

interface FileUploadProps {
  accept?: string
  maxSize?: number // in bytes
  maxSizeMB?: number // in MB (alternative to maxSize)
  value?: File | null
  onChange?: (file: File | null) => void
  onError?: (error: string) => void
  disabled?: boolean
  theme?: 'light' | 'dark'
  label?: string
  description?: string
  allowedTypes?: string[]
  allowedTypesText?: string
}

export function FileUpload({
  accept = 'image/jpeg,image/jpg,image/png,image/webp,.pdf',
  maxSize,
  maxSizeMB = 10,
  value,
  onChange,
  onError,
  disabled = false,
  theme = 'dark',
  label = 'Upload File',
  description,
  allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'],
  allowedTypesText = 'JPG, PNG, WEBP, PDF',
}: FileUploadProps) {
  const isDark = theme === 'dark'
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const maxFileSize = maxSize || maxSizeMB * 1024 * 1024

  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return `File must be one of: ${allowedTypesText}`
    }

    // Check file size
    if (file.size > maxFileSize) {
      const sizeMB = (maxFileSize / (1024 * 1024)).toFixed(0)
      return `File size must be less than ${sizeMB}MB`
    }

    return null
  }, [allowedTypes, allowedTypesText, maxFileSize])

  const handleFile = useCallback((file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      if (onError) onError(validationError)
      return
    }

    setError(null)
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
    }

    if (onChange) {
      onChange(file)
    }
  }, [validateFile, onChange, onError])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled) return

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    setError(null)
    if (onChange) {
      onChange(null)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const getFileIcon = () => {
    if (!value) return null
    
    if (value.type.startsWith('image/')) {
      return <FileImage size={24} weight="regular" className="text-tiktok-primary" />
    } else if (value.type === 'application/pdf') {
      return <FilePdf size={24} weight="regular" className="text-red-400" />
    }
    return <File size={24} weight="regular" className="text-gray-400" />
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className={`block text-sm font-semibold font-sequel ${
          isDark ? 'text-white/80' : 'text-gray-700'
        }`}>
          {label}
        </label>
      )}

      {/* Drop Zone */}
      {!value ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`relative border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer ${
            isDragging
              ? isDark
                ? 'border-tiktok-primary bg-tiktok-primary/10'
                : 'border-tiktok-primary bg-tiktok-primary/5'
              : isDark
              ? 'border-white/20 bg-white/5 hover:border-white/30 hover:bg-white/10'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            disabled={disabled}
            className="hidden"
          />
          
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              isDark ? 'bg-white/10' : 'bg-gray-200'
            }`}>
              <CloudArrowUp 
                size={32} 
                weight="regular" 
                className={isDark ? 'text-white/60' : 'text-gray-500'}
              />
            </div>
            <div>
              <p className={`font-semibold font-sequel mb-1 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {isDragging ? 'Drop file here' : 'Click to upload or drag and drop'}
              </p>
              <p className={`text-xs font-sequel ${
                isDark ? 'text-white/50' : 'text-gray-500'
              }`}>
                {allowedTypesText} (Max {maxSizeMB}MB)
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* File Preview/Info */
        <div className={`rounded-xl border overflow-hidden ${
          isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
        }`}>
          {preview ? (
            /* Image Preview */
            <div className="relative">
              <img 
                src={preview} 
                alt="Preview" 
                className="w-full h-48 object-cover"
              />
              <button
                onClick={handleRemove}
                disabled={disabled}
                className={`absolute top-2 right-2 p-2 rounded-full ${
                  isDark ? 'bg-black/70 hover:bg-black/90' : 'bg-white/90 hover:bg-white'
                } transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <X size={18} weight="regular" className={isDark ? 'text-white' : 'text-gray-900'} />
              </button>
            </div>
          ) : (
            /* File Info */
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getFileIcon()}
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold font-sequel truncate ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {value.name}
                    </p>
                    <p className={`text-xs font-sequel ${
                      isDark ? 'text-white/50' : 'text-gray-500'
                    }`}>
                      {formatFileSize(value.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemove}
                  disabled={disabled}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark 
                      ? 'text-white/70 hover:text-white hover:bg-white/10' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <X size={20} weight="regular" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className={`flex items-center space-x-2 p-3 rounded-lg ${
          isDark 
            ? 'bg-red-500/20 border border-red-500/50' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <Warning size={18} weight="regular" className={
            isDark ? 'text-red-400' : 'text-red-600'
          } />
          <p className={`text-sm font-sequel ${
            isDark ? 'text-red-300' : 'text-red-600'
          }`}>
            {error}
          </p>
        </div>
      )}

      {/* Success Indicator */}
      {value && !error && (
        <div className={`flex items-center space-x-2 p-2 rounded-lg ${
          isDark 
            ? 'bg-green-500/10 border border-green-500/30' 
            : 'bg-green-50 border border-green-200'
        }`}>
          <CheckCircle size={16} weight="regular" className={
            isDark ? 'text-green-400' : 'text-green-600'
          } />
          <p className={`text-xs font-sequel ${
            isDark ? 'text-green-300' : 'text-green-700'
          }`}>
            File ready to upload
          </p>
        </div>
      )}

      {/* Description */}
      {description && (
        <p className={`text-xs font-sequel ${
          isDark ? 'text-white/50' : 'text-gray-500'
        }`}>
          {description}
        </p>
      )}
    </div>
  )
}

