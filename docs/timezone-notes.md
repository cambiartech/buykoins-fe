# Timezone Handling Notes

## How Timestamps Work

### Backend (Server)
- **Stores all times in UTC** (Coordinated Universal Time)
- Sends timestamps in ISO 8601 format with 'Z' suffix: `2025-12-12T13:29:52.568Z`
- The 'Z' indicates UTC (zero offset)

### Frontend (Browser)
- **JavaScript automatically converts UTC to local timezone**
- When you do `new Date('2025-12-12T13:29:52.568Z')`, JavaScript:
  1. Parses the UTC time
  2. Converts it to the browser's local timezone
  3. Creates a Date object with the local time

### Example
- Backend sends: `2025-12-12T13:29:52.568Z` (1:29 PM UTC)
- User in GMT+1 (London): Sees `2:29 PM` (1 hour ahead)
- User in GMT-5 (New York): Sees `8:29 AM` (5 hours behind)
- User in GMT+0 (UTC): Sees `1:29 PM` (same as UTC)

## Why Admin Shows 1 Hour Behind

If admin is showing 1 hour behind the computer's actual time, possible causes:

1. **Backend is storing in wrong timezone**
   - Backend might be storing times in a timezone that's 1 hour ahead of UTC
   - Check backend code - should use UTC for all timestamps

2. **Browser timezone settings**
   - Admin's browser/system might have wrong timezone set
   - Check: `Intl.DateTimeFormat().resolvedOptions().timeZone`

3. **Daylight Saving Time (DST)**
   - If it's DST period, there might be a 1-hour offset
   - JavaScript handles DST automatically, but backend might not

4. **Backend sending non-UTC timestamps**
   - If backend sends `2025-12-12T13:29:52.568` (no Z), JavaScript treats it as local time
   - This causes incorrect conversions

## Solution

### For Backend Team:
1. **Always store times in UTC** in database
2. **Always send UTC timestamps** with 'Z' suffix in API responses
3. **Never send local timezone timestamps** from backend

### For Frontend:
- ✅ Already implemented: `formatMessageTime()` function
- ✅ Uses `new Date()` which automatically converts UTC to local
- ✅ Both admin and user use the same function
- ✅ No timezone specification needed (JavaScript handles it)

## Testing Timezone

To verify timezone is working correctly:

```javascript
// In browser console
const testDate = new Date('2025-12-12T13:29:52.568Z')
console.log('UTC:', testDate.toISOString())
console.log('Local:', testDate.toLocaleTimeString())
console.log('Timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone)
```

Expected:
- UTC should show: `2025-12-12T13:29:52.568Z`
- Local should show your local time (converted from UTC)
- Timezone should show your browser's timezone

## If Admin Still Shows Wrong Time

1. **Check backend timestamp format:**
   - Should end with 'Z': `2025-12-12T13:29:52.568Z`
   - If it doesn't have 'Z', backend is sending wrong format

2. **Check browser timezone:**
   - Admin's browser: `Intl.DateTimeFormat().resolvedOptions().timeZone`
   - Should match system timezone

3. **Check if backend is applying timezone conversion:**
   - Backend should NOT convert to local timezone
   - Backend should always send UTC

4. **Verify with console:**
   ```javascript
   // When message arrives, check:
   console.log('Raw timestamp:', message.createdAt)
   console.log('Parsed date:', new Date(message.createdAt))
   console.log('Local time:', new Date(message.createdAt).toLocaleTimeString())
   console.log('UTC time:', new Date(message.createdAt).toISOString())
   ```

## Current Implementation

✅ **Frontend is correct:**
- Uses `formatMessageTime()` for consistent formatting
- Both admin and user use same function
- JavaScript handles UTC to local conversion automatically

⚠️ **If issue persists, check:**
- Backend is sending UTC timestamps with 'Z' suffix
- Backend is not applying timezone conversion
- Browser/system timezone is correct

---

**Last Updated:** 2025-12-12

