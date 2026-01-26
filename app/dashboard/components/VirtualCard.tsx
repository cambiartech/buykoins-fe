'use client'

import { useState } from 'react'
import { Eye, Wallet, ArrowUpRight, Lock, LockOpen } from '@phosphor-icons/react'
import { Card } from './types'
import { getUser } from '@/lib/auth'

interface VirtualCardProps {
  card: Card
  theme: 'light' | 'dark'
  onFund: () => void
  onFreeze: () => void
  onUnfreeze: () => void
  onSetDefault: () => void
  onDelete: () => void
  onReveal: () => void
  sudoCardId?: string
}

export function VirtualCard({
  card,
  theme,
  onFund,
  onFreeze,
  onUnfreeze,
  onSetDefault,
  onDelete,
  onReveal,
  sudoCardId,
}: VirtualCardProps) {
  const isDark = theme === 'dark'
  const [isFlipped, setIsFlipped] = useState(false)



  const formatCardNumber = (number: string) => {
    if (!number || number === 'Virtual Card') return '**** **** **** ****'
    const cleaned = number.replace(/\s/g, '')
    if (cleaned.length === 16) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8, 12)} ${cleaned.slice(12, 16)}`
    }
    return number
  }

  const user = getUser()
  const cardholderName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user?.firstName || user?.email?.split('@')[0] || 'Cardholder'

  return (
    <div className="w-full">
      {/* Card Container with Flip Animation */}
      <div 
        className="relative cursor-pointer"
        style={{ perspective: '1000px' }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className="relative w-full h-56 transition-transform duration-500"
          style={{ 
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* Front of Card */}
          <div
            className={`absolute inset-0 w-full h-full rounded-2xl p-6 ${
              isDark
                ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
                : 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800'
            } text-white shadow-2xl`}
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          >
            {/* Chip */}
            <div className="absolute top-6 left-6">
              <div className="w-12 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-md flex items-center justify-center">
                <div className="w-8 h-6 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-sm"></div>
              </div>
            </div>

            {/* Card Number */}
            <div className="absolute top-20 left-6 right-6">
              <div className="text-lg font-mono font-bold tracking-wider">
                {formatCardNumber(card.cardNumber)}
              </div>
            </div>

            {/* Expiry Date */}
            <div className="absolute bottom-12 left-6">
              <div className="text-xs opacity-80 mb-1">Valid Thru</div>
              <div className="text-sm font-mono">
                {card.expiryMonth || 'MM'}/{card.expiryYear || 'YY'}
              </div>
            </div>

            {/* Cardholder Name */}
            <div className="absolute bottom-4 left-6">
              <div className="text-xs font-semibold uppercase tracking-wide">
                {cardholderName.toUpperCase()}
              </div>
            </div>

            {/* TikTok Branding */}
            <div className="absolute top-6 right-6">
              <img 
                src="/logos/tiktok.png" 
                alt="TikTok" 
                className="h-6 w-auto"
                onError={(e) => {
                  // Fallback if image doesn't load
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>

            {/* Balance */}
            <div className="absolute bottom-4 right-6 text-right">
              <div className="text-xs opacity-80 mb-1">Balance</div>
              <div className="text-sm font-bold">
                {card.currency === 'NGN' ? '₦' : '$'}{typeof card.balance === 'number' ? card.balance.toFixed(2) : parseFloat(card.balance || '0').toFixed(2)}
              </div>
            </div>
          </div>

          {/* Back of Card */}
          <div
            className={`absolute inset-0 w-full h-full rounded-2xl p-6 ${
              isDark
                ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
                : 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-800'
            } text-white shadow-2xl rotate-y-180`}
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            {/* Magnetic Stripe */}
            <div className="absolute top-0 left-0 right-0 h-12 bg-black"></div>

            {/* CVV Section */}
            <div className="absolute top-20 left-6 right-6">
              <div className="text-xs opacity-80 mb-2">CVV</div>
              <div className="text-xl font-mono font-bold bg-white/10 px-4 py-2 rounded">
                ***
              </div>
            </div>

            {/* PIN Section */}
            <div className="absolute top-40 left-6 right-6">
              <div className="text-xs opacity-80 mb-2">Default PIN</div>
              <div className="text-xl font-mono font-bold bg-white/10 px-4 py-2 rounded">
                ****
              </div>
            </div>

            {/* TikTok Branding */}
            <div className="absolute bottom-4 right-6">
              <img 
                src="/logos/tiktok.png" 
                alt="TikTok" 
                className="h-5 w-auto opacity-80"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Flip Instruction */}
      <div className="flex items-center justify-center mt-4 mb-6">
        <div className={`flex items-center space-x-2 text-sm font-sequel ${
          isDark ? 'text-white/60' : 'text-gray-600'
        }`}>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-0.5 bg-current"></div>
            <div className="w-4 h-0.5 bg-current"></div>
          </div>
          <span>Tap Card to Flip</span>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-0.5 bg-current"></div>
            <div className="w-4 h-0.5 bg-current"></div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={onFund}
          className={`flex flex-col items-center justify-center p-2.5 rounded-lg border transition-colors ${
            isDark
              ? 'bg-white/5 border-white/10 hover:bg-white/10'
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Wallet size={18} weight="regular" className={isDark ? 'text-white/80' : 'text-gray-700 mb-1'} />
          <span className={`text-xs font-sequel ${isDark ? 'text-white/80' : 'text-gray-700'}`}>Fund</span>
        </button>

        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className={`flex flex-col items-center justify-center p-2.5 rounded-lg border transition-colors ${
            isDark
              ? 'bg-white/5 border-white/10 hover:bg-white/10'
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
        >
          <ArrowUpRight size={18} weight="regular" className={isDark ? 'text-white/80' : 'text-gray-700 mb-1'} />
          <span className={`text-xs font-sequel ${isDark ? 'text-white/80' : 'text-gray-700'}`}>Withdraw</span>
        </button>

        <button
          onClick={onReveal}
          className={`flex flex-col items-center justify-center p-2.5 rounded-lg border transition-colors ${
            isDark
              ? 'bg-white/5 border-white/10 hover:bg-white/10'
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Eye size={18} weight="regular" className={isDark ? 'text-white/80' : 'text-gray-700 mb-1'} />
          <span className={`text-xs font-sequel ${isDark ? 'text-white/80' : 'text-gray-700'}`}>Reveal</span>
        </button>

        <button
          onClick={card.status === 'active' ? onFreeze : onUnfreeze}
          className={`flex flex-col items-center justify-center p-2.5 rounded-lg border transition-colors ${
            isDark
              ? 'bg-white/5 border-white/10 hover:bg-white/10'
              : 'bg-white border-gray-200 hover:bg-gray-50'
          }`}
        >
          {card.status === 'active' ? (
            <Lock size={18} weight="regular" className={isDark ? 'text-white/80' : 'text-gray-700 mb-1'} />
          ) : (
            <LockOpen size={18} weight="regular" className={isDark ? 'text-white/80' : 'text-gray-700 mb-1'} />
          )}
          <span className={`text-xs font-sequel ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
            {card.status === 'active' ? 'Freeze' : 'Unfreeze'}
          </span>
        </button>
      </div>

    </div>
  )
}
