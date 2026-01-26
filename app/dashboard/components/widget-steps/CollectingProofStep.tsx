'use client'

import { useState } from 'react'
import { Image } from '@phosphor-icons/react'
import { FileUpload } from '../FileUpload'

interface CollectingProofStepProps {
  theme: 'light' | 'dark'
  isLoading: boolean
  error: string | null
  onSubmit: (step: string, data: any) => Promise<void>
  onUploadProof: (file: File, step?: string) => Promise<string | undefined>
  sessionData: any
}

export function CollectingProofStep({
  theme,
  isLoading,
  error,
  onSubmit,
  onUploadProof,
}: CollectingProofStepProps) {
  const isDark = theme === 'dark'
  const [proof, setProof] = useState<File | null>(null)
  const [proofUrl, setProofUrl] = useState<string | null>(null)
  const [skip, setSkip] = useState(false)

  const handleFileChange = async (file: File | null) => {
    if (file) {
      setProof(file)
      setSkip(false)
      try {
        const url = await onUploadProof(file, 'collecting-proof')
        if (url) {
          setProofUrl(url)
        }
      } catch (error) {
        console.error('Failed to upload proof:', error)
      }
    } else {
      setProof(null)
      setProofUrl(null)
    }
  }

  const handleSkip = () => {
    setSkip(true)
    setProof(null)
    setProofUrl(null)
  }

  const handleSubmit = async () => {
    await onSubmit('collecting-proof', {
      proofUrl: skip ? null : proofUrl,
      skipped: skip,
    })
  }

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-lg ${
        isDark 
          ? 'bg-blue-500/10 border border-blue-500/30' 
          : 'bg-blue-50 border border-blue-200'
      }`}>
        <div className="flex items-start space-x-3">
          <Image size={24} weight="regular" className={`mt-1 ${
            isDark ? 'text-blue-400' : 'text-blue-600'
          }`} />
          <div>
            <h4 className={`font-semibold mb-2 font-sequel ${
              isDark ? 'text-blue-300' : 'text-blue-700'
            }`}>
              Upload Proof (Optional)
            </h4>
            <p className={`text-sm font-sequel ${
              isDark ? 'text-blue-300/80' : 'text-blue-700'
            }`}>
              Upload a screenshot or proof of the transaction. This helps us verify and process your request faster.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <FileUpload
          accept="image/jpeg,image/jpg,image/png,image/webp,.pdf"
          maxSizeMB={5}
          value={proof}
          onChange={handleFileChange}
          disabled={isLoading || skip}
          theme={theme}
          label="Upload Proof"
          description="Screenshot or document showing the transaction"
          allowedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']}
          allowedTypesText="JPG, PNG, WEBP, PDF"
        />

        <div className="flex space-x-3">
          <button
            onClick={handleSkip}
            disabled={isLoading || skip}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all font-sequel ${
              isDark
                ? 'bg-white/5 text-white/80 hover:bg-white/10'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } disabled:opacity-50`}
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 bg-tiktok-primary text-white py-3 rounded-xl font-semibold hover:bg-tiktok-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-sequel"
          >
            {isLoading ? 'Processing...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}

