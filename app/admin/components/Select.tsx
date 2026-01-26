'use client'

import { useState, useRef, useEffect } from 'react'
import { CaretDown, Check } from '@phosphor-icons/react'
import { useAdminTheme } from '../hooks/useTheme'
import { getThemeClasses } from '../utils/theme'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
}

export function Select({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  disabled = false,
}: SelectProps) {
  const isDark = useAdminTheme()
  const theme = getThemeClasses(isDark)
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const selectedOption = options.find(opt => opt.value === value)

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between ${theme.bg.input} ${theme.border.input} rounded-lg px-3 py-2 transition-colors ${
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:border-tiktok-primary/50 cursor-pointer'
        } ${isOpen ? 'ring-2 ring-tiktok-primary' : ''}`}
      >
        <span className={`font-sequel text-sm text-left ${
          selectedOption ? theme.text.primary : theme.text.placeholder
        }`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <CaretDown
          size={16}
          weight="regular"
          className={`${theme.icon.default} transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && !disabled && (
        <div className={`absolute top-full left-0 right-0 mt-2 z-50 rounded-lg border shadow-xl max-h-60 overflow-y-auto ${
          isDark ? 'bg-black border-white/10' : 'bg-white border-gray-200'
        }`}>
          {options.map((option) => {
            const isSelected = option.value === value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors ${
                  isSelected
                    ? isDark
                      ? 'bg-tiktok-primary/20 text-tiktok-primary'
                      : 'bg-tiktok-primary/10 text-tiktok-primary'
                    : isDark
                    ? 'text-white/80 hover:bg-white/10 hover:text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="font-sequel text-sm">{option.label}</span>
                {isSelected && (
                  <Check size={16} weight="regular" className="text-tiktok-primary" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

