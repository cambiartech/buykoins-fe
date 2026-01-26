'use client'

import { useState } from 'react'
import { CheckCircle, Image } from '@phosphor-icons/react'
import { FileUpload } from '../FileUpload'

interface ConfirmSetupStepProps {
  theme: 'light' | 'dark'
  isLoading: boolean
  error: string | null
  onSubmit: (step: string, data: any) => Promise<void>
  onUploadProof: (file: File, step?: string) => Promise<string | undefined>
  sessionData: any
}

export function ConfirmSetupStep({
  theme,
  isLoading,
  error,
  onSubmit,
  onUploadProof,
}: ConfirmSetupStepProps) {
  const isDark = theme === 'dark'
  const [confirmed, setConfirmed] = useState(false)
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null)

  const handleFileChange = async (file: File | null) => {
    if (file) {
      setScreenshot(file)
      try {
        const url = await onUploadProof(file, 'confirm-setup')
        if (url) {
          setScreenshotUrl(url)
        }
      } catch (error) {
        console.error('Failed to upload screenshot:', error)
      }
    } else {
      setScreenshot(null)
      setScreenshotUrl(null)
    }
  }

  const handleSubmit = async () => {
    await onSubmit('confirm-setup', {
      confirmed: true,
      screenshotUrl,
    })
  }

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg ${
        isDark 
          ? 'bg-green-500/10 border border-green-500/30' 
          : 'bg-green-50 border border-green-200'
      }`}>
        <h4 className={`font-semibold mb-2 font-sequel ${
          isDark ? 'text-green-300' : 'text-green-700'
        }`}>
          Confirm Setup Complete
        </h4>
        <p className={`text-sm font-sequel ${
          isDark ? 'text-green-300/80' : 'text-green-700'
        }`}>
          Please confirm that you've successfully set up your TikTok payment method with the provided PayPal account.
        </p>
      </div>

      <div className="space-y-4">
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-gray-300 text-tiktok-primary focus:ring-tiktok-primary"
          />
          <span className={`text-sm font-sequel ${
            isDark ? 'text-white/80' : 'text-gray-700'
          }`}>
            I confirm that I've successfully set up my TikTok account to use the provided PayPal account for receiving earnings.
          </span>
        </label>

        <div>
          <label className={`block text-sm font-medium mb-2 font-sequel ${
            isDark ? 'text-white/80' : 'text-gray-700'
          }`}>
            Upload Screenshot (Optional)
          </label>
          <p className={`text-xs mb-2 font-sequel ${
            isDark ? 'text-white/50' : 'text-gray-500'
          }`}>
            Upload a screenshot of your TikTok payment settings showing PayPal as the payment method.
          </p>
          <FileUpload
            accept="image/jpeg,image/jpg,image/png,image/webp"
            maxSizeMB={5}
            value={screenshot}
            onChange={handleFileChange}
            disabled={isLoading}
            theme={theme}
            label="Upload Screenshot"
            description="Screenshot of TikTok payment settings"
            allowedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
            allowedTypesText="JPG, PNG, WEBP"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isLoading || !confirmed}
        className="w-full bg-tiktok-primary text-white py-3 rounded-xl font-semibold hover:bg-tiktok-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-sequel flex items-center justify-center space-x-2"
      >
        <CheckCircle size={18} weight="regular" />
        <span>{isLoading ? 'Submitting...' : 'Confirm & Submit'}</span>
      </button>
    </div>
  )
}

