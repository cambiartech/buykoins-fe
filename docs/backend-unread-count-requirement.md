# Backend Support Required: Unread Message Counts

## Issue

The frontend unread count badges have been **disabled** because accurate unread message counting requires backend support. The current frontend-only implementation is unreliable and misleading.

## Current Problem

1. **Frontend-only calculation is inaccurate** - Can't reliably track unread messages across all conversations
2. **Counts don't reset properly** - Messages marked as read on one device don't reflect on others
3. **Duplicate counting** - Same message can be counted multiple times
4. **Misleading users** - Shows incorrect counts that don't match actual unread messages

## Required Backend Support

### 1. Add `unreadCount` to Conversation Objects

When fetching conversations, each conversation should include an `unreadCount` field:

```typescript
interface Conversation {
  id: string
  userId?: string | null
  guestId?: string | null
  adminId?: string | null
  type: 'general' | 'onboarding' | 'call_request'
  status: 'open' | 'closed' | 'resolved'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  lastMessageAt?: string | null
  unreadCount: number  // ✅ ADD THIS
  createdAt: string
  updatedAt: string
  // ...
}
```

### 2. Update Unread Count Logic

**For Admin:**
- Count messages where `senderType === 'user' || senderType === 'guest'` AND `isRead === false`
- Count should be per conversation
- Total unread = sum of all conversation unreadCounts

**For User:**
- Count messages where `senderType === 'admin' || senderType === 'system'` AND `isRead === false`
- Count should be for their conversation(s)

### 3. Update Counts When Messages Are Read

When a message is marked as read via `message:read` WebSocket event:
- Update the `isRead` field in database
- Recalculate `unreadCount` for that conversation
- Broadcast updated `unreadCount` to relevant clients

### 4. API Endpoints to Update

**GET `/api/support/admin/conversations`** (Admin)
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "uuid",
        "userId": "uuid",
        "unreadCount": 5,  // ✅ ADD THIS
        // ... other fields
      }
    ]
  }
}
```

**GET `/api/support/conversation`** (User)
```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "uuid",
      "unreadCount": 3,  // ✅ ADD THIS
      // ... other fields
    }
  }
}
```

### 5. WebSocket Events

**When new message arrives:**
- Increment `unreadCount` for the receiving party's conversation
- Broadcast updated count via `conversation:unread_count_updated` event

**When message is read:**
- Decrement `unreadCount` for that conversation
- Broadcast updated count

**New WebSocket Event:**
```typescript
// conversation:unread_count_updated
{
  conversationId: string
  unreadCount: number
  totalUnreadCount?: number  // For admin: total across all conversations
}
```

## Implementation Notes

1. **Database Query Optimization:**
   - Use SQL COUNT() to calculate unread messages efficiently
   - Cache counts if needed, but update on message read/send

2. **Real-time Updates:**
   - When message is sent → increment count for receiver
   - When message is read → decrement count
   - Broadcast to all connected clients for that conversation

3. **Multi-device Support:**
   - Count should be shared across all devices for same user/admin
   - When message is read on one device, count should update on all devices

## Frontend Status

✅ **Sound notifications** - Working correctly  
✅ **Message display** - Working correctly  
❌ **Unread count badges** - **DISABLED** until backend provides accurate counts

## Priority

**MEDIUM** - Feature is nice-to-have but not critical. Sound notifications still work for alerting users to new messages.

---

**Last Updated:** 2025-12-13  
**Status:** Waiting for backend implementation

