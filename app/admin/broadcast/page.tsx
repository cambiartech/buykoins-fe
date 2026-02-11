'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Megaphone,
  PaperPlaneTilt,
  Spinner,
  MagnifyingGlass,
  X,
  CheckCircle,
  UserCircle,
} from '@phosphor-icons/react'
import { useAdminTheme } from '../hooks/useTheme'
import { getThemeClasses } from '../utils/theme'
import { api, ApiError } from '@/lib/api'
import { useToast } from '@/lib/toast'

const TITLE_MAX = 255
const MESSAGE_MAX = 50_000
const USER_IDS_MAX = 5_000

type Audience = 'all' | 'active' | 'onboarded' | 'select'
type MessageFormat = 'plain' | 'html'

interface UserOption {
  id: string
  email: string
  firstName?: string
  lastName?: string
}

export default function BroadcastPage() {
  const isDark = useAdminTheme()
  const theme = getThemeClasses(isDark)
  const toast = useToast()
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [messageFormat, setMessageFormat] = useState<MessageFormat>('plain')
  const [audience, setAudience] = useState<Audience>('all')
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [selectedUserLabels, setSelectedUserLabels] = useState<Record<string, string>>({}) // id -> display label
  const [userSearch, setUserSearch] = useState('')
  const [searchResults, setSearchResults] = useState<UserOption[]>([])
  const [searching, setSearching] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounced user search
  const searchUsers = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSearchResults([])
      return
    }
    setSearching(true)
    try {
      const response = await api.admin.getUsers({ search: q.trim(), limit: 25 })
      if (response.success && response.data) {
        const data = response.data as { users?: UserOption[] }
        const users = Array.isArray(data.users) ? data.users : []
        setSearchResults(users)
      } else {
        setSearchResults([])
      }
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      searchUsers(userSearch)
    }, 300)
    return () => clearTimeout(t)
  }, [userSearch, searchUsers])

  const addUser = (user: UserOption) => {
    if (selectedUserIds.includes(user.id)) return
    if (selectedUserIds.length >= USER_IDS_MAX) {
      toast.error(`Maximum ${USER_IDS_MAX} users allowed.`)
      return
    }
    setSelectedUserIds((prev) => [...prev, user.id])
    const label = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
    setSelectedUserLabels((prev) => ({ ...prev, [user.id]: label }))
  }

  const removeUser = (id: string) => {
    setSelectedUserIds((prev) => prev.filter((x) => x !== id))
    setSelectedUserLabels((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const t = title.trim()
    const m = message.trim()
    if (!t) {
      setError('Title is required.')
      return
    }
    if (!m) {
      setError('Message is required.')
      return
    }
    if (t.length > TITLE_MAX) {
      setError(`Title must be ${TITLE_MAX} characters or less.`)
      return
    }
    if (m.length > MESSAGE_MAX) {
      setError(`Message must be ${MESSAGE_MAX} characters or less.`)
      return
    }
    if (audience === 'select') {
      if (selectedUserIds.length === 0) {
        setError('Select at least one user, or choose another audience.')
        return
      }
      if (selectedUserIds.length > USER_IDS_MAX) {
        setError(`Maximum ${USER_IDS_MAX} users allowed.`)
        return
      }
    }

    setIsSending(true)
    try {
      const response = await api.admin.broadcastAnnouncement({
        title: t,
        message: m,
        messageFormat: messageFormat === 'html' ? 'html' : undefined,
        userIds: audience === 'select' && selectedUserIds.length > 0 ? selectedUserIds : undefined,
        audience: audience !== 'select' ? audience : undefined,
      })
      if (response.success && response.data) {
        const sent = (response.data as { sent: number }).sent
        toast.success(`Announcement sent to ${sent} user${sent === 1 ? '' : 's'}.`)
        setTitle('')
        setMessage('')
        setSelectedUserIds([])
        setSelectedUserLabels({})
      } else {
        setError(response.message || 'Failed to send announcement.')
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || 'Failed to send announcement.')
      } else {
        setError('An unexpected error occurred.')
      }
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className={`rounded-xl border ${theme.border.default} ${theme.bg.card} p-6`}>
        <div className="flex items-center gap-3 mb-6">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isDark ? 'bg-amber-500/20' : 'bg-amber-100'
            }`}
          >
            <Megaphone size={24} weight="regular" className="text-amber-500" />
          </div>
          <div>
            <h2 className={`font-monument font-bold text-xl ${theme.text.primary}`}>
              Email blast (broadcast)
            </h2>
            <p className={`text-sm font-sequel ${theme.text.secondary}`}>
              Send an announcement. Choose who receives it: everyone, active users, onboarded only, or select users.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div
              className={`p-4 rounded-xl text-sm font-sequel ${
                isDark
                  ? 'bg-red-500/20 border border-red-500/50 text-red-300'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {error}
            </div>
          )}

          <div>
            <label className={`block text-sm font-semibold font-sequel mb-2 ${theme.text.primary}`}>
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={TITLE_MAX}
              placeholder="e.g. Maintenance tonight"
              className={`w-full ${theme.bg.input} ${theme.border.input} rounded-xl px-4 py-3 ${theme.text.primary} ${theme.text.placeholder} focus:outline-none focus:ring-2 focus:ring-amber-500 font-sequel`}
              disabled={isSending}
            />
            <p className={`mt-1 text-xs font-sequel ${theme.text.muted}`}>
              {title.length} / {TITLE_MAX}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <label className={`text-sm font-semibold font-sequel ${theme.text.primary}`}>
                Message <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-sequel ${theme.text.muted}`}>Format:</span>
                <button
                  type="button"
                  onClick={() => setMessageFormat('plain')}
                  className={`px-2 py-1 rounded text-xs font-sequel ${
                    messageFormat === 'plain'
                      ? 'bg-amber-500 text-white'
                      : isDark
                        ? 'bg-white/10 text-white/70 hover:bg-white/20'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Plain
                </button>
                <button
                  type="button"
                  onClick={() => setMessageFormat('html')}
                  className={`px-2 py-1 rounded text-xs font-sequel ${
                    messageFormat === 'html'
                      ? 'bg-amber-500 text-white'
                      : isDark
                        ? 'bg-white/10 text-white/70 hover:bg-white/20'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  HTML
                </button>
              </div>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={MESSAGE_MAX}
              placeholder={
                messageFormat === 'html'
                  ? 'e.g. <p>Hello</p><ul><li>Item</li></ul>'
                  : 'Write your announcement. Use line breaks for paragraphs.'
              }
              rows={8}
              className={`w-full ${theme.bg.input} ${theme.border.input} rounded-xl px-4 py-3 ${theme.text.primary} ${theme.text.placeholder} focus:outline-none focus:ring-2 focus:ring-amber-500 font-sequel resize-y min-h-[160px]`}
              disabled={isSending}
            />
            <p className={`mt-1 text-xs font-sequel ${theme.text.muted}`}>
              {message.length.toLocaleString()} / {MESSAGE_MAX.toLocaleString()}
            </p>
          </div>

          {/* Audience */}
          <div>
            <label className={`block text-sm font-semibold font-sequel mb-2 ${theme.text.primary}`}>
              Who receives this
            </label>
            <div className={`rounded-xl border ${theme.border.input} ${theme.bg.input} p-3 space-y-2`}>
              {(
                [
                  { value: 'all' as const, label: 'All users' },
                  { value: 'active' as const, label: 'Active users only' },
                  { value: 'onboarded' as const, label: 'Onboarded users only' },
                  { value: 'select' as const, label: 'Select users…' },
                ] as const
              ).map(({ value, label }) => (
                <label
                  key={value}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${
                    isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="audience"
                    checked={audience === value}
                    onChange={() => setAudience(value)}
                    className="rounded-full border-gray-400"
                  />
                  <span className={`font-sequel text-sm ${theme.text.primary}`}>{label}</span>
                </label>
              ))}
            </div>

            {audience === 'select' && (
              <div className={`mt-4 p-4 rounded-xl border ${theme.border.default} ${theme.bg.card}`}>
                <p className={`text-sm font-sequel mb-3 ${theme.text.secondary}`}>
                  Search by email or name and click a user to add. Max {USER_IDS_MAX.toLocaleString()} users.
                </p>
                <div className="relative mb-3">
                  <MagnifyingGlass
                    size={18}
                    className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.text.muted}`}
                  />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search users…"
                    className={`w-full pl-9 pr-4 py-2 rounded-lg ${theme.bg.input} ${theme.border.input} ${theme.text.primary} ${theme.text.placeholder} text-sm font-sequel focus:outline-none focus:ring-2 focus:ring-amber-500`}
                  />
                </div>
                {searching && (
                  <div className="flex items-center gap-2 py-2">
                    <Spinner size={16} className="animate-spin text-amber-500" />
                    <span className={`text-xs font-sequel ${theme.text.muted}`}>Searching…</span>
                  </div>
                )}
                {!searching && userSearch.trim() && (
                  <ul className={`max-h-48 overflow-y-auto rounded-lg border ${theme.border.default} divide-y ${theme.border.default}`}>
                    {searchResults.length === 0 ? (
                      <li className={`px-3 py-3 text-sm font-sequel ${theme.text.muted}`}>
                        No users found. Try a different search.
                      </li>
                    ) : (
                      searchResults.map((user) => {
                        const added = selectedUserIds.includes(user.id)
                        const label = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
                        return (
                          <li key={user.id}>
                            <button
                              type="button"
                              onClick={() => addUser(user)}
                              disabled={added}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm font-sequel transition-colors ${
                                added
                                  ? 'opacity-60 cursor-default'
                                  : isDark
                                    ? 'hover:bg-white/10'
                                    : 'hover:bg-gray-50'
                              } ${theme.text.primary}`}
                            >
                              <UserCircle size={18} className={theme.icon.default} />
                              <span className="flex-1 truncate">{label}</span>
                              <span className={`truncate text-xs ${theme.text.muted}`}>{user.email}</span>
                              {added && <CheckCircle size={16} weight="fill" className="text-amber-500 flex-shrink-0" />}
                            </button>
                          </li>
                        )
                      })
                    )}
                  </ul>
                )}
                {selectedUserIds.length > 0 && (
                  <div className="mt-3">
                    <p className={`text-xs font-sequel mb-2 ${theme.text.muted}`}>
                      Selected: {selectedUserIds.length} / {USER_IDS_MAX.toLocaleString()}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedUserIds.map((id) => (
                        <span
                          key={id}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-sequel ${
                            isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {selectedUserLabels[id] || id.slice(0, 8)}
                          <button
                            type="button"
                            onClick={() => removeUser(id)}
                            className="p-0.5 rounded hover:bg-black/10"
                            aria-label="Remove"
                          >
                            <X size={12} weight="bold" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSending}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-sequel font-semibold transition-colors ${
              isSending ? 'bg-amber-500/50 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 text-white'
            }`}
          >
            {isSending ? (
              <>
                <Spinner size={20} weight="regular" className="animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <PaperPlaneTilt size={20} weight="regular" />
                {audience === 'select' && selectedUserIds.length > 0
                  ? `Send to ${selectedUserIds.length} user${selectedUserIds.length === 1 ? '' : 's'}`
                  : audience === 'all'
                    ? 'Send to all users'
                    : audience === 'active'
                      ? 'Send to active users'
                      : audience === 'onboarded'
                        ? 'Send to onboarded users'
                        : 'Send announcement'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
