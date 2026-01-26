/**
 * Date utility functions for consistent timezone handling
 * All timestamps from backend are in UTC (ISO format)
 * We convert them to user's local timezone for display
 */

/**
 * Format a date/time string to local time
 * Backend sends UTC timestamps (ISO format with Z), we display in user's local timezone
 * 
 * Important: When you create new Date('2025-12-12T13:29:52.568Z'),
 * JavaScript automatically converts the UTC time to the browser's local timezone.
 * So if backend sends 13:29 UTC and you're in GMT+1, it becomes 14:29 local time.
 */
/**
 * Normalize timestamp to ensure it's in UTC format
 * Backend might send timestamps without 'Z' or in wrong format
 */
function normalizeTimestamp(dateString: string): Date {
  // If it already has 'Z', it's UTC - use as-is
  if (dateString.endsWith('Z')) {
    return new Date(dateString)
  }
  
  // If it has timezone offset, parse it
  if (dateString.includes('+') || dateString.includes('-') && !dateString.endsWith('Z')) {
    // Has timezone offset like +01:00 or -05:00
    return new Date(dateString)
  }
  
  // If no timezone info, assume it's UTC and add 'Z'
  // This handles cases where backend sends "2025-12-13T01:22:00" without timezone
  if (!dateString.includes('Z') && !dateString.includes('+') && !dateString.includes('-', 10)) {
    // Add 'Z' to make it UTC
    return new Date(dateString + 'Z')
  }
  
  // Default: let JavaScript parse it
  return new Date(dateString)
}

export function formatMessageTime(dateString: string): string {
  try {
    // Normalize the timestamp first
    const date = normalizeTimestamp(dateString)
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString)
      return 'Invalid date'
    }
    
    // Get timezone info for debugging
    if (typeof window !== 'undefined') {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const offset = -date.getTimezoneOffset() / 60
      const utcTime = date.toISOString()
      const localTime = date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true
      })
      
      // Also get system time for comparison
      const now = new Date()
      const systemTime = now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      })
      
      console.log('Time conversion:', { 
        original: dateString, 
        normalized: date.toISOString(),
        utc: utcTime, 
        local: localTime,
        systemTime,
        timezone,
        offsetHours: offset,
        systemOffset: -now.getTimezoneOffset() / 60,
        timeDiff: Math.abs(date.getTime() - now.getTime()) / 1000 / 60 // minutes difference
      })
    }
    
    // Format using the browser's detected timezone
    // JavaScript automatically handles UTC to local conversion
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  } catch (error) {
    console.error('Error formatting time:', error, dateString)
    return 'Invalid date'
  }
}

/**
 * Format a date/time string to local date and time
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  
  if (isNaN(date.getTime())) {
    return 'Invalid date'
  }
  
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  })
}

/**
 * Format a date string to local date only
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  
  if (isNaN(date.getTime())) {
    return 'Invalid date'
  }
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
  })
}

/**
 * Get user's timezone
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

/**
 * Check if a date string is in UTC format
 */
export function isUTC(dateString: string): boolean {
  return dateString.endsWith('Z') || dateString.includes('+00:00')
}

