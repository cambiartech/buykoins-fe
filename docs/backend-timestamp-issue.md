# Backend Timestamp Issue - Critical Bug Report

## 🚨 Issue Description

**Problem:** Message timestamps are showing 1 hour difference between sender and receiver.

**Symptoms:**
- ✅ **Sender sees correct time** - When you send a message, it appears with the correct local time
- ❌ **Receiver sees wrong time** - When someone else receives your message, it shows 1 hour behind
- Example: User sends at 3:22 AM, Admin receives it showing 2:22 AM

**Affected:**
- User → Admin: Admin sees user messages 1 hour behind
- Admin → User: User sees admin messages 1 hour behind (but user's own messages show correct)

## 🔍 Root Cause Analysis

### Frontend Behavior (Working Correctly)

1. **When sending a message:**
   - Frontend creates temp message with: `createdAt: new Date().toISOString()`
   - This creates a UTC timestamp: `2025-12-13T01:22:00.000Z`
   - Frontend displays this correctly in local timezone

2. **When receiving a message:**
   - Backend sends message via WebSocket with `createdAt` field
   - Frontend uses: `formatMessageTime(message.createdAt)`
   - This converts UTC to local timezone correctly

### Backend Issue (Suspected)

The backend is likely:
1. **Storing timestamps in wrong timezone** - Not storing in UTC
2. **Applying timezone conversion** - Converting UTC to server's local timezone before storing
3. **Sending wrong timestamp format** - Sending timestamps without 'Z' suffix or in wrong format

## 📋 What Backend Should Check

### 1. Database Storage

**Check how messages are stored in database:**

```sql
-- Check a message record
SELECT id, message, "createdAt", "updatedAt" 
FROM messages 
WHERE id = 'some-message-id';

-- Verify createdAt is stored as UTC timestamp
-- Should be: 2025-12-13T01:22:00.000Z (UTC)
-- NOT: 2025-12-13T02:22:00.000+01:00 (local timezone)
```

**Expected:** All timestamps should be stored in UTC (no timezone offset)

### 2. Message Creation Code

**Check the message creation/saving code:**

```typescript
// ❌ WRONG - Don't do this
const message = {
  message: text,
  createdAt: new Date(), // This uses server's local timezone!
}

// ❌ WRONG - Don't do this
const message = {
  message: text,
  createdAt: moment().toISOString(), // If moment has wrong timezone config
}

// ✅ CORRECT - Do this
const message = {
  message: text,
  createdAt: new Date().toISOString(), // Explicitly UTC
}

// ✅ CORRECT - Or let database handle it
const message = {
  message: text,
  // createdAt: undefined, // Let database set default (should be UTC)
}
```

### 3. WebSocket Message Broadcasting

**Check how messages are sent via WebSocket:**

```typescript
// When broadcasting message, ensure createdAt is UTC
socket.emit('message:received', {
  id: message.id,
  message: message.message,
  createdAt: message.createdAt, // Should be UTC string with 'Z'
  // ...
})

// ❌ WRONG - Don't convert to local timezone
createdAt: new Date(message.createdAt).toLocaleString()

// ✅ CORRECT - Send as-is from database (should be UTC)
createdAt: message.createdAt // Already UTC from database
```

### 4. Database Configuration

**Check database timezone settings:**

```sql
-- PostgreSQL
SHOW timezone;
-- Should be: UTC

-- MySQL
SELECT @@global.time_zone, @@session.time_zone;
-- Should be: +00:00 or SYSTEM (if system is UTC)

-- Set to UTC if not
SET timezone = 'UTC';
```

### 5. TypeORM/Prisma Configuration

**Check ORM configuration:**

```typescript
// TypeORM - Ensure UTC
{
  type: 'postgres',
  timezone: 'UTC', // ✅ Important!
  // ...
}

// Prisma - Check schema
model Message {
  createdAt DateTime @default(now()) // Should use UTC
}
```

## 🧪 Test Cases

### Test 1: Check Database Timestamp

1. Send a message from frontend
2. Check database immediately:
   ```sql
   SELECT "createdAt", NOW() as "serverTime" 
   FROM messages 
   ORDER BY "createdAt" DESC 
   LIMIT 1;
   ```
3. **Expected:** `createdAt` should be in UTC, close to `NOW()` (if server is UTC)

### Test 2: Check WebSocket Payload

1. Send a message
2. Check WebSocket payload in browser console
3. Look at `message.createdAt` field
4. **Expected:** Should be UTC format: `2025-12-13T01:22:00.000Z`

### Test 3: Compare Sender vs Receiver

1. User sends message at 3:22 AM (local time)
2. Check what backend stores: Should be `2025-12-13T01:22:00.000Z` (if user is UTC+2)
3. Admin receives message: Should show 3:22 AM (admin's local time)
4. **Current behavior:** Admin sees 2:22 AM (1 hour behind)

## 🔧 Expected Fix

### Backend Should:

1. **Store all timestamps in UTC**
   - Database should use UTC for all `createdAt`, `updatedAt` fields
   - No timezone conversion when saving

2. **Send UTC timestamps via WebSocket**
   - Always send timestamps with 'Z' suffix: `2025-12-13T01:22:00.000Z`
   - Don't convert to local timezone before sending

3. **Verify database timezone**
   - Ensure database is set to UTC
   - Check ORM configuration uses UTC

### Example Fix:

```typescript
// Message Service - When creating message
async createMessage(data: CreateMessageDto) {
  const message = await this.messageRepository.save({
    ...data,
    createdAt: new Date(), // TypeORM/Prisma will convert to UTC
    // OR explicitly:
    // createdAt: new Date().toISOString(), // Explicit UTC
  })
  
  // When broadcasting, send as-is (already UTC)
  this.gateway.server.emit('message:received', {
    ...message,
    createdAt: message.createdAt.toISOString(), // Ensure UTC format
  })
  
  return message
}
```

## 📊 Current vs Expected Behavior

### Current (Broken):
```
User sends at 3:22 AM local time
  ↓
Backend stores: 2025-12-13T02:22:00.000Z (wrong - 1 hour behind)
  ↓
Admin receives: Shows 2:22 AM (1 hour behind)
```

### Expected (Fixed):
```
User sends at 3:22 AM local time
  ↓
Backend stores: 2025-12-13T01:22:00.000Z (correct UTC)
  ↓
Admin receives: Shows 3:22 AM (correct - converted to admin's local time)
```

## 🎯 Quick Diagnostic

Run this in backend code when creating a message:

```typescript
console.log('Message creation debug:', {
  localTime: new Date().toLocaleString(),
  utcTime: new Date().toISOString(),
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  offset: new Date().getTimezoneOffset(),
})
```

**Expected output:**
- `utcTime` should match what's stored in database
- Database should store UTC, not local time

## 📝 Frontend Status

✅ **Frontend is correct:**
- Uses UTC timestamps for temp messages
- Converts UTC to local timezone for display
- Both admin and user use same formatting function
- No timezone conversion issues on frontend

## 🚨 Priority

**HIGH** - This causes confusion in support conversations and affects user experience.

## 📞 Next Steps

1. Backend team should verify database timezone is UTC
2. Check message creation code - ensure UTC storage
3. Verify WebSocket payload sends UTC timestamps
4. Test with same message - sender and receiver should see same relative time

---

## 🔧 Frontend Fix Applied

**Issue:** Even after backend fix, messages loaded from REST API on page reload were showing wrong timestamps.

**Root Cause:** Messages loaded from REST API weren't being normalized to UTC ISO strings before display.

**Fix Applied:**
- Added timestamp normalization in `loadMessages()` (user side) and `fetchMessages()` (admin side)
- All timestamps from REST API are now normalized to UTC ISO format: `date.toISOString()`
- This ensures consistency between WebSocket messages and REST API messages

**Files Changed:**
- `app/dashboard/components/SupportModal.tsx` - Normalize timestamps in `loadMessages()`
- `app/admin/support/page.tsx` - Normalize timestamps in `fetchMessages()`

**Status:** ✅ Frontend fix applied - should work correctly now even if backend sends inconsistent formats

---

**Last Updated:** 2025-12-13
**Status:** Backend fixed + Frontend normalization added

