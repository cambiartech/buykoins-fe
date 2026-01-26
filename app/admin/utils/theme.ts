'use client'

export function getThemeClasses(isDark: boolean) {
  return {
    text: {
      primary: isDark ? 'text-white' : 'text-gray-900',
      secondary: isDark ? 'text-white/70' : 'text-gray-700',
      muted: isDark ? 'text-white/50' : 'text-gray-600',
      placeholder: isDark ? 'placeholder-white/30' : 'placeholder-gray-400',
    },
    bg: {
      card: isDark ? 'bg-white/5' : 'bg-white',
      hover: isDark ? 'hover:bg-white/10' : 'hover:bg-gray-50',
      input: isDark ? 'bg-white/5' : 'bg-white border-gray-300',
    },
    border: {
      default: isDark ? 'border-white/10' : 'border-gray-200',
      input: isDark ? 'border-white/10' : 'border-gray-300',
    },
    icon: {
      default: isDark ? 'text-white/40' : 'text-gray-500',
      hover: isDark ? 'text-white/50' : 'text-gray-600',
    }
  }
}

