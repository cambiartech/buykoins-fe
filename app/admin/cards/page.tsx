'use client'

import {
  CreditCard,
  Eye,
  Lock,
  LockOpen,
  MagnifyingGlass,
  Funnel,
  User,
  Wallet,
  CheckCircle,
  XCircle,
  Clock,
} from '@phosphor-icons/react'
import { useState, useEffect } from 'react'
import { useAdminTheme } from '../hooks/useTheme'
import { getThemeClasses } from '../utils/theme'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'
import Pagination from '../components/Pagination'
import { UserLink } from '../components/UserLink'
import { CardDetailModal } from './components/CardDetailModal'

interface CardUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
}

interface Card {
  id: string
  userId: string
  user: CardUser | null
  cardNumber: string
  cardType: 'virtual' | 'physical'
  currency: string
  status: 'active' | 'frozen' | 'closed'
  balance: number
  expiryMonth: string
  expiryYear: string
  isDefault: boolean
  createdAt: string
}

export default function CardsPage() {
  const isDark = useAdminTheme()
  const theme = getThemeClasses(isDark)
  const toast = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'frozen' | 'closed'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [cards, setCards] = useState<Card[]>([])
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const itemsPerPage = 10

  useEffect(() => {
    fetchCards()
  }, [currentPage, filterStatus])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filterStatus])

  const fetchCards = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.admin.getCards({
        page: currentPage,
        limit: itemsPerPage,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: searchQuery || undefined,
      })
      if (response.success && response.data) {
        const data = response.data as any
        if (Array.isArray(data)) {
          setCards(data)
          setTotalPages(1)
          setTotalItems(data.length)
        } else if (data && typeof data === 'object' && 'cards' in data) {
          setCards(data.cards)
          setTotalPages(data.pagination?.totalPages || 1)
          setTotalItems(data.pagination?.totalItems || data.cards.length)
        } else {
          setCards([])
          setTotalPages(1)
          setTotalItems(0)
        }
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

  const handleFreezeCard = async (card: Card) => {
    try {
      const response = await api.admin.freezeCard(card.id)
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
      const response = await api.admin.unfreezeCard(card.id)
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

  const filteredCards = cards.filter((card) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesCardNumber = card.cardNumber.toLowerCase().includes(query)
      const matchesUser = card.user?.email.toLowerCase().includes(query) ||
        card.user?.firstName?.toLowerCase().includes(query) ||
        card.user?.lastName?.toLowerCase().includes(query)
      if (!matchesCardNumber && !matchesUser) return false
    }
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return isDark ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-50 text-green-700 border-green-200'
      case 'frozen':
        return isDark ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'closed':
        return isDark ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-red-50 text-red-700 border-red-200'
      default:
        return isDark ? 'bg-white/10 text-white/60 border-white/10' : 'bg-gray-50 text-gray-600 border-gray-200'
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className={`font-monument font-bold text-2xl mb-2 ${theme.text.primary}`}>
          Cards Management
        </h2>
        <p className={`font-sequel ${theme.text.secondary}`}>View and manage all user cards</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className={`mb-6 p-4 rounded-xl ${
          isDark 
            ? 'bg-red-500/20 border border-red-500/50' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <p className={`text-sm font-sequel ${
              isDark ? 'text-red-300' : 'text-red-600'
            }`}>{error}</p>
            <button
              onClick={fetchCards}
              className={`text-sm font-sequel hover:underline ${
                isDark ? 'text-red-300' : 'text-red-600'
              }`}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="mb-6 flex items-center space-x-4">
        <div className="flex-1 relative">
          <MagnifyingGlass 
            size={20} 
            weight="regular" 
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${theme.icon.default}`} 
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by card number, user email, or name..."
            className={`w-full ${theme.bg.input} ${theme.border.input} rounded-xl pl-12 pr-4 py-3 ${theme.text.primary} ${theme.text.placeholder} focus:outline-none focus:ring-2 focus:ring-tiktok-primary font-sequel`}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Funnel size={20} weight="regular" className={theme.icon.hover} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className={`${theme.bg.input} ${theme.border.input} rounded-xl px-4 py-3 ${theme.text.primary} focus:outline-none focus:ring-2 focus:ring-tiktok-primary font-sequel`}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="frozen">Frozen</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-tiktok-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredCards.length === 0 ? (
        <div className={`text-center py-12 rounded-xl border ${
          isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
        }`}>
          <p className={`font-sequel ${theme.text.muted}`}>
            {searchQuery || filterStatus !== 'all' ? 'No cards found matching your filters' : 'No cards found'}
          </p>
        </div>
      ) : (
        <>
          <div className={`${theme.bg.card} ${theme.border.default} rounded-xl overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDark ? 'bg-white/5' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-4 text-left text-sm font-semibold font-sequel ${theme.text.secondary}`}>Card</th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold font-sequel ${theme.text.secondary}`}>User</th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold font-sequel ${theme.text.secondary}`}>Balance</th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold font-sequel ${theme.text.secondary}`}>Status</th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold font-sequel ${theme.text.secondary}`}>Created</th>
                    <th className={`px-6 py-4 text-left text-sm font-semibold font-sequel ${theme.text.secondary}`}>Actions</th>
                  </tr>
                </thead>
                <tbody className={isDark ? 'divide-y divide-white/10' : 'divide-y divide-gray-200'}>
                  {filteredCards.map((card) => (
                    <tr key={card.id} className={theme.bg.hover + ' transition-colors'}>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isDark ? 'bg-tiktok-primary/20' : 'bg-tiktok-primary/10'
                          }`}>
                            <CreditCard size={20} weight="regular" className="text-tiktok-primary" />
                          </div>
                          <div>
                            <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                              {card.cardNumber}
                            </p>
                            <p className={`text-xs font-sequel ${theme.text.secondary}`}>
                              {card.expiryMonth}/{card.expiryYear} • {card.currency}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {card.user ? (
                          <UserLink
                            userId={card.userId}
                            firstName={card.user.firstName}
                            lastName={card.user.lastName}
                            email={card.user.email}
                          />
                        ) : (
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-tiktok-primary/20 rounded-full flex items-center justify-center">
                              <User size={20} weight="regular" className="text-tiktok-primary" />
                            </div>
                            <div>
                              <p className={`text-sm font-sequel ${theme.text.secondary}`}>User not found</p>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className={`font-semibold font-sequel ${theme.text.primary}`}>
                          {card.currency === 'NGN' ? '₦' : '$'}{card.balance.toFixed(2)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold font-sequel border ${getStatusColor(card.status)}`}>
                          {card.status.charAt(0).toUpperCase() + card.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className={`text-sm font-sequel ${theme.text.secondary}`}>
                          {new Date(card.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedCard(card)
                              setShowDetailModal(true)
                            }}
                            className={`p-2 rounded-lg transition-colors ${
                              isDark
                                ? 'text-white/70 hover:text-white hover:bg-white/10'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                            title="View Details"
                          >
                            <Eye size={18} weight="regular" />
                          </button>
                          {card.status === 'active' && (
                            <button
                              onClick={() => handleFreezeCard(card)}
                              className={`p-2 rounded-lg transition-colors ${
                                isDark
                                  ? 'text-yellow-400/70 hover:text-yellow-400 hover:bg-yellow-500/10'
                                  : 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50'
                              }`}
                              title="Freeze Card"
                            >
                              <Lock size={18} weight="regular" />
                            </button>
                          )}
                          {card.status === 'frozen' && (
                            <button
                              onClick={() => handleUnfreezeCard(card)}
                              className={`p-2 rounded-lg transition-colors ${
                                isDark
                                  ? 'text-green-400/70 hover:text-green-400 hover:bg-green-500/10'
                                  : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                              }`}
                              title="Unfreeze Card"
                            >
                              <LockOpen size={18} weight="regular" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems}
              />
            </div>
          )}
        </>
      )}

      {/* Card Detail Modal */}
      {selectedCard && (
        <CardDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedCard(null)
          }}
          cardId={selectedCard.id}
          initialCard={selectedCard}
          onCardUpdated={fetchCards}
        />
      )}
    </div>
  )
}

