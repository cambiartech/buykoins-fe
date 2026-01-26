# WebSocket Support System - Backend Implementation Notes

## Overview
The frontend is now fully implemented for the support/chat system using Socket.io. This document outlines what the backend needs to implement and any important notes.

## WebSocket Connection

### Connection URL
- Development: `ws://localhost:3001/support`
- Production: `wss://yourdomain.com/support`

### Authentication
The frontend sends authentication in the socket handshake:

**For authenticated users:**
```javascript
{
  auth: {
    token: 'jwt-token-here'
  }
}
```

**For guest/anonymous users:**
```javascript
{
  auth: {
    guestId: 'guest_1234567890_abc123' // Optional, server generates if not provided
  }
}
```

### Connection Success Event
After successful connection, backend should emit:
```javascript
socket.emit('connection:success', {
  type: 'user' | 'admin' | 'guest',
  userId: 'uuid', // if type is 'user'
  adminId: 'uuid', // if type is 'admin'
  guestId: 'guest_1234567890_abc123' // if type is 'guest'
})
```

## Required WebSocket Events

### Client → Server Events

#### `message:send`
```javascript
{
  conversationId: 'uuid',
  message: 'Hello, I need help',
  messageType: 'text' // optional: 'text' | 'file' | 'system' | 'auth_code'
}
```

#### `conversation:join`
```javascript
{
  conversationId: 'uuid'
}
```

#### `conversation:leave`
```javascript
{
  conversationId: 'uuid'
}
```

#### `typing:start`
```javascript
{
  conversationId: 'uuid'
}
```

#### `typing:stop`
```javascript
{
  conversationId: 'uuid'
}
```

#### `message:read`
```javascript
{
  messageId: 'uuid'
}
```

### Server → Client Events

#### `message:received`
Emitted when a new message is received in a conversation.
```javascript
{
  id: 'uuid',
  conversationId: 'uuid',
  senderId: 'uuid' | null,
  senderType: 'user' | 'admin' | 'guest' | 'system',
  guestId: 'guest_1234567890_abc123' | null,
  message: 'Hello, how can I help?',
  messageType: 'text',
  isRead: false,
  createdAt: '2025-12-10T10:00:00.000Z'
}
```

#### `conversation:new_message`
Emitted to admins when a new message arrives in any conversation.
```javascript
{
  conversationId: 'uuid',
  message: { /* message object */ }
}
```

#### `typing:start`
```javascript
{
  conversationId: 'uuid',
  senderId: 'uuid' | 'guest_1234567890_abc123'
}
```

#### `typing:stop`
```javascript
{
  conversationId: 'uuid',
  senderId: 'uuid' | 'guest_1234567890_abc123'
}
```

#### `conversation:joined`
```javascript
{
  conversationId: 'uuid'
}
```

#### `conversation:left`
```javascript
{
  conversationId: 'uuid'
}
```

#### `message:error`
```javascript
{
  error: 'Error message'
}
```

## REST API Endpoints Required

### User Endpoints

1. **GET /api/support/conversation?type=general**
   - Get or create conversation for authenticated user
   - Requires: Bearer token
   - Returns: Conversation object

2. **POST /api/support/conversation/guest**
   - Get or create conversation for guest user
   - Public endpoint (no auth)
   - Body: `{ type?: 'general' | 'onboarding' | 'call_request', subject?: string }`
   - Returns: `{ conversation: {...}, guestId: '...' }`

3. **GET /api/support/conversation/:id/messages?page=1&limit=50**
   - Get messages for conversation
   - Requires: Bearer token (or guestId in query for guests)
   - Returns: `{ messages: [...], pagination: {...} }`

4. **GET /api/support/conversation/:id**
   - Get conversation details
   - Requires: Bearer token
   - Returns: Full conversation object with user/admin info

### Admin Endpoints

1. **GET /api/admin/support/conversations?page=1&limit=50&status=open&type=general**
   - Get all conversations (admin only)
   - Requires: Admin Bearer token
   - Returns: `{ conversations: [...], pagination: {...} }`

2. **POST /api/support/onboarding/generate-code**
   - Generate onboarding auth code (admin only)
   - Requires: Admin Bearer token
   - Body: `{ userId?: string, guestId?: string, conversationId?: string, deviceInfo?: string }`
   - Returns: `{ code: '123456', expiresAt: '...', conversationId: '...' }`
   - **Important:** Also send code via WebSocket `message:received` event with `messageType: 'auth_code'`

3. **POST /api/support/onboarding/verify-code**
   - Verify onboarding auth code (public)
   - Body: `{ code: '123456', userId?: string, guestId?: string }`
   - Returns: `{ success: true, data: { authCodeId: '...', userId: '...' } }`

## Important Notes

### 1. Real-time Message Delivery
- Messages should be delivered in real-time via WebSocket
- When a message is sent, broadcast it to all participants in the conversation room
- Use Socket.io rooms: `socket.join(conversationId)` when user joins conversation

### 2. Conversation Rooms
- When user/admin joins a conversation, add them to the room: `socket.join(conversationId)`
- When broadcasting messages, use: `io.to(conversationId).emit('message:received', message)`
- For admin notifications: `io.to('admin').emit('conversation:new_message', { conversationId, message })`

### 3. Guest ID Format
- Guest IDs should follow format: `guest_<timestamp>_<random_string>`
- Example: `guest_1234567890_abc123`
- Store guest IDs in database for conversation tracking

### 4. Message Ordering
- Messages should be ordered by `createdAt` (ascending for history)
- When loading history, return oldest first, frontend reverses for display

### 5. Read Receipts
- When `message:read` event is received, update message `isRead` status
- Broadcast read status to conversation participants

### 6. Typing Indicators
- Track typing state per conversation
- Broadcast typing start/stop to other participants in the conversation
- Auto-stop typing after 3 seconds of inactivity (frontend handles this)

### 7. Connection Persistence
- Frontend keeps socket connected even when modal closes (for faster reconnection)
- Backend should handle reconnection gracefully
- Maintain conversation room membership on reconnect

### 8. Error Handling
- If socket operation fails, emit `message:error` event
- Handle authentication failures gracefully
- Validate conversation access before allowing operations

### 9. Admin Features
- Admins should receive `conversation:new_message` for ALL conversations
- Admins can join any conversation
- Admin messages should have `senderType: 'admin'`

### 10. Security
- Validate JWT tokens on connection
- Verify user has access to conversation before allowing operations
- Rate limit message sending
- Sanitize message content

## Testing Checklist

- [ ] WebSocket connection with JWT token
- [ ] WebSocket connection with guest ID
- [ ] Guest ID generation when not provided
- [ ] Message sending and receiving in real-time
- [ ] Conversation room joining/leaving
- [ ] Typing indicators working
- [ ] Read receipts updating
- [ ] Admin receiving notifications for all conversations
- [ ] Message history loading with pagination
- [ ] Reconnection handling
- [ ] Error handling and validation

## Frontend Status

✅ All frontend code is complete and ready
✅ Socket.io-client installed and configured
✅ Real-time message handling implemented
✅ Typing indicators working
✅ Connection state management in place
✅ Error handling implemented
✅ Cleanup on component unmount
✅ Reconnection logic added

The frontend is production-ready and waiting for backend implementation.

