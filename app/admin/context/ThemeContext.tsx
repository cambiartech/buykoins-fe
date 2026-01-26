'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  isDark: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  // Apply theme to document
  const applyTheme = (newTheme: Theme) => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement
      if (newTheme === 'light') {
        root.classList.add('light')
      } else {
        root.classList.remove('light')
      }
    }
  }

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      // Get system preference or default to light
      const getSystemTheme = (): Theme => {
        if (window.matchMedia) {
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        }
        return 'light' // Default to light if can't detect
      }

      // Load theme from localStorage, or use system preference, or default to light
      const savedTheme = localStorage.getItem('adminTheme') as Theme | null
      const initialTheme = savedTheme || getSystemTheme()
      setTheme(initialTheme)
      applyTheme(initialTheme)
      
      // Listen for system theme changes
      if (window.matchMedia) {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleChange = (e: MediaQueryListEvent) => {
          // Only update if user hasn't manually set a preference
          if (!localStorage.getItem('adminTheme')) {
            const newTheme: Theme = e.matches ? 'dark' : 'light'
            setTheme(newTheme)
            applyTheme(newTheme)
          }
        }
        
        // Modern browsers
        if (mediaQuery.addEventListener) {
          mediaQuery.addEventListener('change', handleChange)
          return () => mediaQuery.removeEventListener('change', handleChange)
        } else {
          // Fallback for older browsers
          mediaQuery.addListener(handleChange)
          return () => mediaQuery.removeListener(handleChange)
        }
      }
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    applyTheme(newTheme)
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminTheme', newTheme)
      // Reload page to ensure theme applies everywhere
      window.location.reload()
    }
  }

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    // Get system preference or default to light
    const getSystemTheme = (): Theme => {
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      return 'light' // Default to light if can't detect
    }
    
    const systemTheme = typeof window !== 'undefined' ? getSystemTheme() : 'light'
    
    // Fallback for when used outside provider (e.g., login page)
    return {
      theme: systemTheme,
      isDark: systemTheme === 'dark',
      toggleTheme: () => {
        if (typeof window !== 'undefined') {
          const root = document.documentElement
          const isLight = root.classList.contains('light')
          if (isLight) {
            root.classList.remove('light')
            localStorage.setItem('adminTheme', 'dark')
          } else {
            root.classList.add('light')
            localStorage.setItem('adminTheme', 'light')
          }
          // Reload page to ensure theme applies everywhere
          window.location.reload()
        }
      }
    }
  }
  return context
}

