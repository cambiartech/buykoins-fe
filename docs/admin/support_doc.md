# Support & Communication Module - API Documentation

## Overview

The Support & Communication module provides real-time chat functionality for both authenticated users and anonymous/guest users. It includes WebSocket-based messaging, onboarding auth codes, and is designed to support embed-style widgets (like Intercom).

**Base URL:** `/api/support`  
**WebSocket Namespace:** `/support`

**Authentication:**
- REST API: JWT Bearer token (for authenticated endpoints)
- WebSocket: JWT token in handshake OR guest mode (anonymous)

---

## WebSocket Connection

### Connection URL
```
ws://localhost:3001/support
```
or
```
wss://yourdomain.com/support (production)
```

### Authentication Methods

#### 1. Authenticated User (JWT)
```javascript
const socket = io('http://localhost:3001/support', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

#### 2. Anonymous/Guest User
```javascript
const socket = io('http://localhost:3001/support', {
  auth: {
    guestId: 'guest_1234567890_abc123' // Optional: provide existing guest ID
  }
});
```

If no `guestId` is provided, the server will generate one and return it in the `connection:success` event.

### Connection Events

#### `connection:success`
Emitted when connection is established successfully.

**Response:**
```json
{
  "type": "user" | "admin" | "guest",
  "userId": "uuid", // if type is "user"
  "adminId": "uuid", // if type is "admin"
  "guestId": "guest_1234567890_abc123" // if type is "guest"
}
```

**Example:**
```javascript
socket.on('connection:success', (data) => {
  console.log('Connected as:', data.type);
  if (data.guestId) {
    // Store guestId in localStorage for future connections
    localStorage.setItem('guestId', data.guestId);
  }
});
```

---

## WebSocket Events

### Client → Server Events

#### `message:send`
Send a message to a conversation.

**Payload:**
```json
{
  "conversationId": "uuid",
  "message": "Hello, I need help",
  "messageType": "text" // optional: "text" | "file" | "system" | "auth_code"
}
```

**Example:**
```javascript
socket.emit('message:send', {
  conversationId: '550e8400-e29b-41d4-a716-446655440000',
  message: 'Hello, I need help with onboarding'
});
```

#### `typing:start`
Indicate that user is typing.

**Payload:**
```json
{
  "conversationId": "uuid"
}
```

#### `typing:stop`
Indicate that user stopped typing.

**Payload:**
```json
{
  "conversationId": "uuid"
}
```

#### `message:read`
Mark a message as read.

**Payload:**
```json
{
  "messageId": "uuid"
}
```

#### `conversation:join`
Join a conversation room to receive real-time updates.

**Payload:**
```json
{
  "conversationId": "uuid"
}
```

#### `conversation:leave`
Leave a conversation room.

**Payload:**
```json
{
  "conversationId": "uuid"
}
```

### Server → Client Events

#### `message:received`
Emitted when a new message is received in a conversation.

**Payload:**
```json
{
  "id": "uuid",
  "conversationId": "uuid",
  "senderId": "uuid" | null,
  "senderType": "user" | "admin" | "guest" | "system",
  "guestId": "guest_1234567890_abc123" | null,
  "message": "Hello, how can I help?",
  "messageType": "text",
  "isRead": false,
  "createdAt": "2025-12-10T10:00:00.000Z"
}
```

**Example:**
```javascript
socket.on('message:received', (message) => {
  console.log('New message:', message.message);
  // Update UI with new message
});
```

#### `typing:start`
Emitted when someone starts typing.

**Payload:**
```json
{
  "conversationId": "uuid",
  "senderId": "uuid" | "guest_1234567890_abc123"
}
```

#### `typing:stop`
Emitted when someone stops typing.

**Payload:**
```json
{
  "conversationId": "uuid",
  "senderId": "uuid" | "guest_1234567890_abc123"
}
```

#### `message:read`
Emitted when a message is marked as read.

**Payload:**
```json
{
  "messageId": "uuid"
}
```

#### `conversation:new_message`
Emitted to admins when a new message arrives in any conversation.

**Payload:**
```json
{
  "conversationId": "uuid",
  "message": { /* message object */ }
}
```

#### `conversation:joined`
Emitted when successfully joined a conversation room.

**Payload:**
```json
{
  "conversationId": "uuid"
}
```

#### `conversation:left`
Emitted when successfully left a conversation room.

**Payload:**
```json
{
  "conversationId": "uuid"
}
```

#### `message:error`
Emitted when an error occurs (e.g., sending message failed).

**Payload:**
```json
{
  "error": "Error message"
}
```

---

## REST API Endpoints

### 1. Get or Create Conversation (Authenticated Users)

**Endpoint:** `GET /api/support/conversation`

**Description:** Get existing open conversation or create a new one for authenticated users.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `type` (optional): `"general"` | `"onboarding"` | `"call_request"` (default: `"general"`)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userId": "user-uuid",
    "guestId": null,
    "adminId": null,
    "type": "general",
    "subject": null,
    "status": "open",
    "priority": "normal",
    "lastMessageAt": null,
    "createdAt": "2025-12-10T10:00:00.000Z",
    "updatedAt": "2025-12-10T10:00:00.000Z"
  }
}
```

---

### 2. Get or Create Conversation (Anonymous/Guest Users)

**Endpoint:** `POST /api/support/conversation/guest`

**Description:** Get existing open conversation or create a new one for anonymous users. This endpoint is public (no auth required).

**Request Body:**
```json
{
  "type": "general", // optional: "general" | "onboarding" | "call_request"
  "subject": "Need help" // optional
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "userId": null,
      "guestId": "guest_1234567890_abc123",
      "adminId": null,
      "type": "general",
      "status": "open",
      "createdAt": "2025-12-10T10:00:00.000Z"
    },
    "guestId": "guest_1234567890_abc123" // Store this for future connections
  }
}
```

**Important:** Store the `guestId` in localStorage/sessionStorage for future WebSocket connections and API calls.

---

### 3. Get Conversation Messages

**Endpoint:** `GET /api/support/conversation/:id/messages`

**Description:** Get messages for a conversation with pagination.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Messages per page (default: 50, max: 100)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "uuid",
        "conversationId": "uuid",
        "senderId": "uuid",
        "senderType": "user",
        "guestId": null,
        "message": "Hello",
        "messageType": "text",
        "isRead": false,
        "createdAt": "2025-12-10T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 25,
      "page": 1,
      "limit": 50,
      "totalPages": 1
    }
  }
}
```

---

### 4. Get Conversation Details

**Endpoint:** `GET /api/support/conversation/:id`

**Description:** Get full conversation details including user/admin info and recent messages.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "adminId": "uuid",
    "type": "general",
    "status": "open",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John"
    },
    "admin": {
      "id": "uuid",
      "email": "admin@example.com",
      "firstName": "Admin"
    },
    "messages": [ /* array of messages */ ]
  }
}
```

---

### 5. Generate Onboarding Auth Code (Admin Only)

**Endpoint:** `POST /api/support/onboarding/generate-code`

**Description:** Generate an onboarding auth code. Admin only endpoint.

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Request Body:**
```json
{
  "userId": "uuid", // optional: if user is authenticated
  "guestId": "guest_1234567890_abc123", // optional: if anonymous user
  "conversationId": "uuid", // optional: link to conversation
  "deviceInfo": "{\"device\": \"iPhone\", \"os\": \"iOS 17\"}" // optional: JSON string
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Auth code generated successfully",
  "data": {
    "code": "123456",
    "expiresAt": "2025-12-10T10:15:00.000Z",
    "conversationId": "uuid"
  }
}
```

**Note:** The code is also sent via WebSocket to the user/guest in real-time.

---

### 6. Verify Onboarding Auth Code (Public)

**Endpoint:** `POST /api/support/onboarding/verify-code`

**Description:** Verify an onboarding auth code. Public endpoint (no auth required).

**Request Body:**
```json
{
  "code": "123456",
  "userId": "uuid", // optional: if user is authenticated
  "guestId": "guest_1234567890_abc123" // optional: if anonymous user
}
```

**Response (200 OK) - Valid Code:**
```json
{
  "success": true,
  "message": "Code verified successfully",
  "data": {
    "authCodeId": "uuid",
    "userId": "uuid" // if code was linked to a user
  }
}
```

**Response (200 OK) - Invalid Code:**
```json
{
  "success": false,
  "message": "Invalid or expired code"
}
```

---

## Frontend Implementation Guide

### 1. WebSocket Connection Setup

```javascript
import io from 'socket.io-client';

// Get token or guest ID
const token = localStorage.getItem('jwt_token');
const guestId = localStorage.getItem('guestId');

// Connect to WebSocket
const socket = io('http://localhost:3001/support', {
  auth: token ? { token } : { guestId },
  transports: ['websocket', 'polling'], // Fallback to polling if WebSocket fails
});

// Handle connection success
socket.on('connection:success', (data) => {
  console.log('Connected:', data);
  
  // Store guest ID if provided
  if (data.guestId && !localStorage.getItem('guestId')) {
    localStorage.setItem('guestId', data.guestId);
  }
});

// Handle connection errors
socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});
```

### 2. Create/Get Conversation

#### For Authenticated Users:
```javascript
const response = await fetch('http://localhost:3001/api/support/conversation?type=general', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const { data } = await response.json();
const conversationId = data.id;
```

#### For Anonymous Users:
```javascript
const response = await fetch('http://localhost:3001/api/support/conversation/guest', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ type: 'general' })
});
const { data } = await response.json();
const conversationId = data.conversation.id;
const guestId = data.guestId;

// Store guest ID
localStorage.setItem('guestId', guestId);
```

### 3. Join Conversation Room

```javascript
// Join conversation room to receive real-time messages
socket.emit('conversation:join', { conversationId });

socket.on('conversation:joined', () => {
  console.log('Joined conversation room');
});
```

### 4. Send Message

```javascript
socket.emit('message:send', {
  conversationId: conversationId,
  message: 'Hello, I need help',
  messageType: 'text'
});
```

### 5. Receive Messages

```javascript
socket.on('message:received', (message) => {
  console.log('New message:', message);
  // Add message to UI
  addMessageToChat(message);
});
```

### 6. Typing Indicators

```javascript
let typingTimeout;

// Start typing
const startTyping = () => {
  socket.emit('typing:start', { conversationId });
  
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    stopTyping();
  }, 3000); // Stop after 3 seconds of inactivity
};

// Stop typing
const stopTyping = () => {
  socket.emit('typing:stop', { conversationId });
};

// Listen for others typing
socket.on('typing:start', ({ senderId }) => {
  showTypingIndicator(senderId);
});

socket.on('typing:stop', ({ senderId }) => {
  hideTypingIndicator(senderId);
});
```

### 7. Load Message History

```javascript
const loadMessages = async (conversationId, page = 1) => {
  const response = await fetch(
    `http://localhost:3001/api/support/conversation/${conversationId}/messages?page=${page}&limit=50`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  const { data } = await response.json();
  return data.messages;
};
```

### 8. Mark Messages as Read

```javascript
socket.on('message:received', (message) => {
  // Mark as read when user views it
  if (message.senderType !== 'user' && message.senderType !== 'guest') {
    socket.emit('message:read', { messageId: message.id });
  }
});
```

---

## Embed Widget Implementation (Intercom-style)

### Basic Widget Structure

```html
<!-- Support Widget Button -->
<button id="support-widget-btn">💬 Support</button>

<!-- Support Widget Container (hidden by default) -->
<div id="support-widget" style="display: none;">
  <div class="widget-header">
    <h3>Support Chat</h3>
    <button id="close-widget">×</button>
  </div>
  <div class="widget-messages" id="messages-container"></div>
  <div class="widget-input">
    <input type="text" id="message-input" placeholder="Type a message...">
    <button id="send-btn">Send</button>
  </div>
</div>
```

### Widget JavaScript

```javascript
class SupportWidget {
  constructor() {
    this.socket = null;
    this.conversationId = null;
    this.guestId = localStorage.getItem('guestId');
    this.token = localStorage.getItem('jwt_token');
    this.init();
  }

  async init() {
    // Connect WebSocket
    this.connectWebSocket();
    
    // Get or create conversation
    await this.getOrCreateConversation();
    
    // Setup UI handlers
    this.setupUI();
  }

  connectWebSocket() {
    this.socket = io('http://localhost:3001/support', {
      auth: this.token ? { token: this.token } : { guestId: this.guestId },
    });

    this.socket.on('connection:success', (data) => {
      if (data.guestId) {
        this.guestId = data.guestId;
        localStorage.setItem('guestId', this.guestId);
      }
    });

    this.socket.on('message:received', (message) => {
      this.addMessage(message);
    });
  }

  async getOrCreateConversation() {
    if (this.token) {
      // Authenticated user
      const response = await fetch('http://localhost:3001/api/support/conversation', {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      const { data } = await response.json();
      this.conversationId = data.id;
    } else {
      // Anonymous user
      const response = await fetch('http://localhost:3001/api/support/conversation/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'general' })
      });
      const { data } = await response.json();
      this.conversationId = data.conversation.id;
      this.guestId = data.guestId;
      localStorage.setItem('guestId', this.guestId);
    }

    // Join conversation room
    this.socket.emit('conversation:join', { conversationId: this.conversationId });
    
    // Load message history
    await this.loadMessages();
  }

  async loadMessages() {
    const response = await fetch(
      `http://localhost:3001/api/support/conversation/${this.conversationId}/messages`,
      {
        headers: this.token ? { 'Authorization': `Bearer ${this.token}` } : {}
      }
    );
    const { data } = await response.json();
    
    data.messages.forEach(message => {
      this.addMessage(message);
    });
  }

  sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    
    if (!message) return;

    this.socket.emit('message:send', {
      conversationId: this.conversationId,
      message: message,
      messageType: 'text'
    });

    input.value = '';
  }

  addMessage(message) {
    const container = document.getElementById('messages-container');
    const messageEl = document.createElement('div');
    messageEl.className = `message ${message.senderType}`;
    messageEl.innerHTML = `
      <div class="message-content">${message.message}</div>
      <div class="message-time">${new Date(message.createdAt).toLocaleTimeString()}</div>
    `;
    container.appendChild(messageEl);
    container.scrollTop = container.scrollHeight;
  }

  setupUI() {
    document.getElementById('support-widget-btn').addEventListener('click', () => {
      document.getElementById('support-widget').style.display = 'block';
    });

    document.getElementById('close-widget').addEventListener('click', () => {
      document.getElementById('support-widget').style.display = 'none';
    });

    document.getElementById('send-btn').addEventListener('click', () => {
      this.sendMessage();
    });

    document.getElementById('message-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });
  }
}

// Initialize widget
new SupportWidget();
```

---

## Error Handling

### WebSocket Errors

```javascript
socket.on('connect_error', (error) => {
  console.error('Connection failed:', error);
  // Show error message to user
  // Retry connection after delay
});

socket.on('message:error', ({ error }) => {
  console.error('Message error:', error);
  // Show error notification
});
```

### API Errors

All REST endpoints follow the standard error format:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "conversationId",
      "message": "Conversation not found"
    }
  ]
}
```

---

## Testing

### Test WebSocket Connection

```javascript
// In browser console or test file
const socket = io('http://localhost:3001/support', {
  auth: { guestId: 'test_guest_123' }
});

socket.on('connection:success', (data) => {
  console.log('✅ Connected:', data);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error);
});
```

### Test Message Sending

```javascript
// After connecting and getting conversationId
socket.emit('message:send', {
  conversationId: 'your-conversation-id',
  message: 'Test message'
});

socket.on('message:received', (message) => {
  console.log('✅ Message received:', message);
});
```

---

## Notes

1. **Guest ID Persistence**: Always store `guestId` in localStorage/sessionStorage for anonymous users
2. **Reconnection**: Socket.io automatically handles reconnection. Store conversation ID to rejoin on reconnect
3. **Message Ordering**: Messages are ordered by `createdAt` (ascending for history, newest first for display)
4. **Rate Limiting**: Be mindful of message sending frequency to avoid rate limits
5. **Production**: Update WebSocket URL to use `wss://` (secure WebSocket) in production

---

## Next Steps

1. ✅ WebSocket connection setup
2. ✅ Basic chat UI
3. ✅ Message history loading
4. ✅ Typing indicators
5. ⏳ File attachments (coming in Phase 2)
6. ⏳ Call requests (coming in Phase 3)
7. ⏳ In-app calls (coming in Phase 4)

---

**Ready for frontend implementation!** 🚀

