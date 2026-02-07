'use client'

import { useState, useEffect } from 'react'
import { CreditCard, Plus, Eye, Wallet, Lock, LockOpen, Trash, Star } from '@phosphor-icons/react'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'
import { Card, CardTransaction } from './types'
import { CreateCardModal } from './CreateCardModal'
import { FundCardModal } from './FundCardModal'
import { CardDetailModal } from './CardDetailModal'
import { VirtualCard } from './VirtualCard'
import { RevealCardDetailsModal } from './RevealCardDetailsModal'

interface CardsViewProps {
  theme: 'light' | 'dark'
  balance: number // Wallet balance
  onClose: () => void
  onAddFunds?: () => void
  onWalletUpdate?: () => void
}

export function CardsView({ theme, balance, onClose, onAddFunds, onWalletUpdate }: CardsViewProps) {
  const isDark = theme === 'dark'
  const toast = useToast()
  const [cards, setCards] = useState<Card[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showFundModal, setShowFundModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showRevealModal, setShowRevealModal] = useState(false)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [fundingCard, setFundingCard] = useState<Card | null>(null)
  const [revealingCard, setRevealingCard] = useState<Card | null>(null)

  useEffect(() => {
    fetchCards()
  }, [])

  const fetchCards = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.user.getCards()
      if (response.success && response.data) {
        const cardsData = Array.isArray(response.data) ? response.data : []
        // Normalize card data to match Card type
        const normalizedCards = cardsData.map((card: any) => ({
          id: card.id,
          cardNumber: card.cardNumber || card.sudoCardId || '****',
          cardType: card.cardType || 'virtual',
          currency: card.currency || 'NGN',
          status: card.status || 'active',
          balance: typeof card.balance === 'string' ? parseFloat(card.balance) : (card.balance || 0),
          expiryMonth: card.expiryMonth || '',
          expiryYear: card.expiryYear || '',
          isDefault: card.isDefault || false,
          createdAt: card.createdAt || new Date().toISOString(),
          sudoCardId: card.sudoCardId || null, // Store sudoCardId for Secure Proxy
        } as Card & { sudoCardId?: string }))
        setCards(normalizedCards)
      } else {
        setError(response.message || 'Failed to load cards')
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message || 'Failed to load cards')
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCard = async () => {
    await fetchCards()
    setShowCreateModal(false)
  }

  const handleFundCard = async () => {
    await fetchCards()
    setShowFundModal(false)
    setFundingCard(null)
  }

  const handleFreezeCard = async (card: Card) => {
    try {
      const response = await api.user.updateCard(card.id, { status: 'frozen' })
      if (response.success) {
        toast.success('Card frozen successfully')
        await fetchCards()
      } else {
        toast.error(response.message || 'Failed to freeze card')
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message || 'Failed to freeze card')
      } else {
        toast.error('An unexpected error occurred')
      }
    }
  }

  const handleUnfreezeCard = async (card: Card) => {
    try {
      const response = await api.user.updateCard(card.id, { status: 'active' })
      if (response.success) {
        toast.success('Card unfrozen successfully')
        await fetchCards()
      } else {
        toast.error(response.message || 'Failed to unfreeze card')
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message || 'Failed to unfreeze card')
      } else {
        toast.error('An unexpected error occurred')
      }
    }
  }

  const handleSetDefault = async (card: Card) => {
    try {
      const response = await api.user.setDefaultCard(card.id)
      if (response.success) {
        toast.success('Default card updated')
        await fetchCards()
      } else {
        toast.error(response.message || 'Failed to set default card')
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message || 'Failed to set default card')
      } else {
        toast.error('An unexpected error occurred')
      }
    }
  }

  const handleDeleteCard = async (card: Card) => {
    if (!confirm('Are you sure you want to delete this card? This action cannot be undone.')) {
      return
    }

    try {
      const response = await api.user.deleteCard(card.id)
      if (response.success) {
        toast.success('Card deleted successfully')
        await fetchCards()
      } else {
        toast.error(response.message || 'Failed to delete card')
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message || 'Failed to delete card')
      } else {
        toast.error('An unexpected error occurred')
      }
    }
  }

  const formatCardNumber = (cardNumber: string | null | undefined) => {
    // Card number is already masked from backend (e.g., "****1234")
    if (!cardNumber || cardNumber === '****') {
      return 'Virtual Card'
    }
    return cardNumber
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return isDark ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-50 text-green-700 border-green-200'
      case 'frozen':
        return isDark ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'closed':
        return isDark ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-red-100 text-red-700 border-red-200'
      default:
        return isDark ? 'bg-white/10 text-white/60 border-white/10' : 'bg-gray-50 text-gray-600 border-gray-200'
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className={`font-monument font-bold text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
            My Cards
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-sequel mt-2"
          >
            <Plus size={18} weight="regular" />
            <span>Create Card</span>
          </button>
        </div>
        <p className={`font-sequel ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
          Create virtual cards to buy TikTok coins, pay for subscriptions, and more
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#29013a] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error State */}
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
            onClick={fetchCards}
            className="mt-2 text-sm text-[#29013a] hover:underline font-sequel mx-auto block"
          >
            Retry
          </button>
        </div>
      )}

      {/* Cards List */}
      {!isLoading && !error && (
        <>
          {cards.length === 0 ? (
            <div className={`text-center py-12 rounded-xl border ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
            }`}>
              <CreditCard size={48} weight="regular" className={`mx-auto mb-4 ${
                isDark ? 'text-white/40' : 'text-gray-400'
              }`} />
              <p className={`font-sequel mb-4 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                No cards yet. Create your first virtual card to get started!
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-sequel"
              >
                Create Card
              </button>
            </div>
          ) : (
            <>
              {/* Mobile: Horizontal Scroll with Partial Cards Visible */}
              <div className="md:hidden overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 pb-4">
                <div className="flex gap-4" style={{ width: 'max-content' }}>
                  {cards.map((card) => {
                    const cardWithSudo = card as Card & { sudoCardId?: string }
                    return (
                      <div key={card.id} className="snap-start flex-shrink-0 w-[85vw] max-w-sm">
                        <VirtualCard
                          card={card}
                          theme={theme}
                          sudoCardId={cardWithSudo.sudoCardId}
                          onFund={() => {
                            setFundingCard(card)
                            setShowFundModal(true)
                          }}
                          onFreeze={() => handleFreezeCard(card)}
                          onUnfreeze={() => handleUnfreezeCard(card)}
                          onSetDefault={() => handleSetDefault(card)}
                          onDelete={() => handleDeleteCard(card)}
                          onReveal={() => {
                            setRevealingCard(card)
                            setShowRevealModal(true)
                          }}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
              
              {/* Desktop: Grid Layout */}
              <div className="hidden md:grid md:grid-cols-2 md:gap-6">
                {cards.map((card) => {
                  const cardWithSudo = card as Card & { sudoCardId?: string }
                  return (
                    <VirtualCard
                      key={card.id}
                      card={card}
                      theme={theme}
                      sudoCardId={cardWithSudo.sudoCardId}
                      onFund={() => {
                        setFundingCard(card)
                        setShowFundModal(true)
                      }}
                      onFreeze={() => handleFreezeCard(card)}
                      onUnfreeze={() => handleUnfreezeCard(card)}
                      onSetDefault={() => handleSetDefault(card)}
                      onDelete={() => handleDeleteCard(card)}
                      onReveal={() => {
                        setRevealingCard(card)
                        setShowRevealModal(true)
                      }}
                    />
                  )
                })}
              </div>
            </>
          )}
        </>
      )}

      {/* Modals */}
      <CreateCardModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateCard}
        theme={theme}
      />

      {fundingCard && (
        <FundCardModal
          isOpen={showFundModal}
          onClose={() => {
            setShowFundModal(false)
            setFundingCard(null)
          }}
          onSuccess={handleFundCard}
          card={fundingCard}
          balance={balance}
          theme={theme}
          onAddFunds={onAddFunds}
          onWalletUpdate={onWalletUpdate}
        />
      )}

      {selectedCard && (
        <CardDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedCard(null)
          }}
          card={selectedCard}
          theme={theme}
          onCardUpdated={fetchCards}
        />
      )}

      {revealingCard && (
        <RevealCardDetailsModal
          isOpen={showRevealModal}
          onClose={() => {
            setShowRevealModal(false)
            setRevealingCard(null)
          }}
          card={revealingCard}
          sudoCardId={(revealingCard as Card & { sudoCardId?: string }).sudoCardId}
          theme={theme}
        />
      )}
    </div>
  )
}

