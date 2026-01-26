'use client'

import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import { useTheme } from '../context/ThemeContext'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  itemsPerPage: number
  totalItems: number
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
}: PaginationProps) {
  const { isDark } = useTheme()

  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className={`flex items-center justify-between rounded-xl px-6 py-4 ${
      isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
    } border`}>
      <div>
        <p className={`text-sm font-sequel ${
          isDark ? 'text-white/60' : 'text-gray-600'
        }`}>
          Showing <span className={`font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>{startItem}</span> to{' '}
          <span className={`font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>{endItem}</span> of{' '}
          <span className={`font-semibold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>{totalItems}</span> results
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
            currentPage === 1
              ? `${isDark ? 'bg-white/5 text-white/30' : 'bg-gray-100 text-gray-400'} cursor-not-allowed`
              : `${isDark ? 'bg-white/5 hover:bg-white/10 text-white/80' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`
          }`}
        >
          <CaretLeft size={16} weight="regular" />
          <span className="text-sm font-sequel">Previous</span>
        </button>

        <div className="flex items-center space-x-1">
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className={`px-3 py-2 ${
                  isDark ? 'text-white/40' : 'text-gray-500'
                }`}>
                  ...
                </span>
              )
            }

            const pageNum = page as number
            const isActive = pageNum === currentPage

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-3 py-2 rounded-lg text-sm font-sequel transition-colors ${
                  isActive
                    ? 'bg-tiktok-primary text-white'
                    : isDark
                    ? 'bg-white/5 hover:bg-white/10 text-white/80'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {pageNum}
              </button>
            )
          })}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
            currentPage === totalPages
              ? `${isDark ? 'bg-white/5 text-white/30' : 'bg-gray-100 text-gray-400'} cursor-not-allowed`
              : `${isDark ? 'bg-white/5 hover:bg-white/10 text-white/80' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`
          }`}
        >
          <span className="text-sm font-sequel">Next</span>
          <CaretRight size={16} weight="regular" />
        </button>
      </div>
    </div>
  )
}

