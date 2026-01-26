'use client'

import { useState, useRef, useEffect } from 'react'
import { Calendar, CaretLeft, CaretRight, X } from '@phosphor-icons/react'
import { useAdminTheme } from '../hooks/useTheme'
import { getThemeClasses } from '../utils/theme'

interface DatePickerProps {
  value?: string
  onChange: (date: string) => void
  placeholder?: string
  disabled?: boolean
  minDate?: string
  maxDate?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  disabled = false,
  minDate,
  maxDate,
}: DatePickerProps) {
  const isDark = useAdminTheme()
  const theme = getThemeClasses(isDark)
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedDate = value ? new Date(value) : null

  useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))
    }
  }, [value])

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

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0]
  }

  const formatDisplayDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const dateString = formatDate(newDate)
    
    // Check min/max constraints
    if (minDate && dateString < minDate) return
    if (maxDate && dateString > maxDate) return
    
    onChange(dateString)
    setIsOpen(false)
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const handleToday = () => {
    const today = new Date()
    const todayString = formatDate(today)
    
    if (minDate && todayString < minDate) return
    if (maxDate && todayString > maxDate) return
    
    onChange(todayString)
    setIsOpen(false)
  }

  const handleClear = () => {
    onChange('')
    setIsOpen(false)
  }

  const isDateDisabled = (day: number): boolean => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const dateString = formatDate(date)
    
    if (minDate && dateString < minDate) return true
    if (maxDate && dateString > maxDate) return true
    return false
  }

  const isDateSelected = (day: number): boolean => {
    if (!selectedDate) return false
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentMonth.getMonth() &&
      selectedDate.getFullYear() === currentMonth.getFullYear()
    )
  }

  const isToday = (day: number): boolean => {
    const today = new Date()
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear()
    )
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)
  const days: (number | null)[] = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  return (
    <div ref={containerRef} className="relative">
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`relative flex items-center ${theme.bg.input} ${theme.border.input} rounded-lg px-3 py-2 cursor-pointer transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-tiktok-primary/50'
        } ${isOpen ? 'ring-2 ring-tiktok-primary' : ''}`}
      >
        <Calendar size={16} weight="regular" className={`mr-2 ${theme.icon.default}`} />
        <input
          type="text"
          readOnly
          value={value ? formatDisplayDate(value) : ''}
          placeholder={placeholder}
          disabled={disabled}
          className={`flex-1 bg-transparent border-0 outline-none font-sequel text-sm ${theme.text.primary} placeholder:${theme.text.placeholder} cursor-pointer`}
        />
        {value && !disabled && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleClear()
            }}
            className="ml-2 p-1 rounded hover:bg-white/10 transition-colors"
          >
            <X size={14} weight="regular" className={theme.icon.default} />
          </button>
        )}
      </div>

      {isOpen && !disabled && (
        <div className={`absolute top-full left-0 mt-2 z-50 rounded-xl border shadow-xl ${
          isDark ? 'bg-black border-white/10' : 'bg-white border-gray-200'
        }`}>
          {/* Calendar Header */}
          <div className={`flex items-center justify-between p-4 border-b ${
            isDark ? 'border-white/10' : 'border-gray-200'
          }`}>
            <button
              onClick={handlePrevMonth}
              className={`p-1.5 rounded-lg transition-colors ${
                isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
              }`}
            >
              <CaretLeft size={20} weight="regular" className={theme.icon.default} />
            </button>
            <h3 className={`font-semibold font-sequel ${theme.text.primary}`}>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button
              onClick={handleNextMonth}
              className={`p-1.5 rounded-lg transition-colors ${
                isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
              }`}
            >
              <CaretRight size={20} weight="regular" className={theme.icon.default} />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="p-4">
            {/* Week Days Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className={`text-center text-xs font-semibold font-sequel py-2 ${theme.text.secondary}`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                if (day === null) {
                  return <div key={index} className="aspect-square" />
                }

                const disabled = isDateDisabled(day)
                const selected = isDateSelected(day)
                const today = isToday(day)

                return (
                  <button
                    key={day}
                    onClick={() => !disabled && handleDateSelect(day)}
                    disabled={disabled}
                    className={`aspect-square rounded-lg text-sm font-sequel transition-colors ${
                      selected
                        ? 'bg-tiktok-primary text-white'
                        : today
                        ? isDark
                          ? 'bg-white/10 text-tiktok-primary border border-tiktok-primary'
                          : 'bg-tiktok-primary/10 text-tiktok-primary border border-tiktok-primary'
                        : disabled
                        ? `${theme.text.muted} cursor-not-allowed opacity-30`
                        : isDark
                        ? 'text-white/80 hover:bg-white/10 hover:text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className={`flex items-center justify-between p-3 border-t ${
            isDark ? 'border-white/10' : 'border-gray-200'
          }`}>
            <button
              onClick={handleToday}
              className={`text-sm font-sequel px-3 py-1.5 rounded-lg transition-colors ${
                isDark
                  ? 'text-tiktok-primary hover:bg-tiktok-primary/10'
                  : 'text-tiktok-primary hover:bg-tiktok-primary/10'
              }`}
            >
              Today
            </button>
            {value && (
              <button
                onClick={handleClear}
                className={`text-sm font-sequel px-3 py-1.5 rounded-lg transition-colors ${
                  isDark
                    ? 'text-white/70 hover:bg-white/10'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

