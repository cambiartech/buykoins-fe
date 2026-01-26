'use client'

import Link from 'next/link'
import { UserCircle } from '@phosphor-icons/react'
import { useAdminTheme } from '../hooks/useTheme'
import { getThemeClasses } from '../utils/theme'

interface UserLinkProps {
  userId: string
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  username?: string | null
  showAvatar?: boolean
  showEmail?: boolean
  className?: string
}

export function UserLink({
  userId,
  firstName,
  lastName,
  email,
  username,
  showAvatar = true,
  showEmail = true,
  className = '',
}: UserLinkProps) {
  const isDark = useAdminTheme()
  const theme = getThemeClasses(isDark)

  const displayName = firstName && lastName
    ? `${firstName} ${lastName}`
    : email || userId

  return (
    <Link
      href={`/admin/users/${userId}`}
      className={`flex items-center space-x-3 group transition-colors ${className}`}
    >
      {showAvatar && (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
          isDark ? 'bg-tiktok-primary/20 group-hover:bg-tiktok-primary/30' : 'bg-tiktok-primary/10 group-hover:bg-tiktok-primary/20'
        }`}>
          <UserCircle size={20} weight="regular" className="text-tiktok-primary" />
        </div>
      )}
      <div>
        <p className={`font-semibold font-sequel group-hover:text-tiktok-primary transition-colors ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          {displayName}
        </p>
        {showEmail && email && (
          <p className={`text-xs font-sequel ${theme.text.muted}`}>
            {email}
          </p>
        )}
        {username && (
          <p className={`text-xs font-sequel ${theme.text.muted}`}>
            @{username}
          </p>
        )}
      </div>
    </Link>
  )
}

