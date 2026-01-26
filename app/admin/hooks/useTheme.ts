'use client'

import { useTheme } from '../context/ThemeContext'

export function useAdminTheme() {
  const { isDark } = useTheme()
  return isDark
}

