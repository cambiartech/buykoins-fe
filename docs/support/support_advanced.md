# Support System Enhanced Features Documentation

## Overview

This document describes the enhanced features added to the support system, including image uploads, standard messages, conversation options, and conversation closing logic.

---

## 1. Image Upload Support

### Endpoint: `POST /api/support/conversation/:id/upload`

Allows users and admins to upload images (jpg, jpeg, png, webp) as part of support messages.

**Authentication:** Required (JWT)

**Request:**
- **Method:** `POST`
- **Content-Type:** `multipart/form-data`
- **Path Parameters:**
  - `id` (string, required): Conversation ID
- **Body:**
  - `file` (file, required): Image file (max 10MB)
  - `message` (string, optional): Optional message text to accompany the image

**Response:**
```json
{
  "success": true,
  "message": "File uploaded and message created successfully",
  "data": {
    "id": "message-uuid",
    "conversationId": "conversation-uuid",
    "senderId": "user-uuid",
    "senderType": "user",
    "guestId": null,
    "message": "📎 Image attachment",
    "messageType": "file",
    "fileUrl": "https://storage.example.com/support-messages/uuid.jpg",
    "fileName": "screenshot.png",
    "fileSize": 245678,
    "isRead": false,
    "readAt": null,
    "createdAt": "2025-12-12T15:30:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Invalid file type or size exceeded
- `401`: Unauthorized
- `404`: Conversation not found

**Example (cURL):**
```bash
curl -X POST \
  http://localhost:3001/api/support/conversation/{conversationId}/upload \
  -H "Authorization: Bearer {token}" \
  -F "file=@/path/to/image.jpg" \
  -F "message=Here's the screenshot you requested"
```

**WebSocket Integration:**
When an image is uploaded via the REST endpoint, it automatically broadcasts a `message:received` event to all participants in the conversation, including the file metadata.

---

## 2. Conversation Options

### Endpoint: `GET /api/support/conversation-options`

Returns available conversation options for users to choose from when initiating a support conversation.

**Authentication:** Public (no auth required)

**Request:**
- **Method:** `GET`

**Response:**
```json
{
  "success": true,
  "data": {
    "options": [
      {
        "id": "onboarding",
        "title": "Complete your Onboarding",
        "description": "Get help setting up your TikTok account and payment methods",
        "type": "onboarding"
      },
      {
        "id": "withdrawal",
        "title": "Just made a withdrawal",
        "description": "Track or get help with your withdrawal request",
        "type": "general"
      },
      {
        "id": "other",
        "title": "Others - Speak to Support",
        "description": "General support and inquiries",
        "type": "general"
      }
    ]
  }
}
```

**Usage:**
Frontend should display these options when a user wants to start a new conversation. Based on the selected option, create a conversation with the appropriate `type`:

- `onboarding` → Creates conversation with `type: "onboarding"`
- `withdrawal` or `other` → Creates conversation with `type: "general"`

---

## 3. Standard Messages/Templates

### Endpoint: `GET /api/support/standard-messages`

Returns pre-defined message templates for common support scenarios.

**Authentication:** Public (no auth required)

**Request:**
- **Method:** `GET`

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": {
      "welcome": {
        "onboarding": "Hello! I'm here to help you complete your onboarding. Let's get your TikTok account set up!",
        "general": "Hello! How can I help you today?",
        "withdrawal": "Hello! I can help you with your withdrawal. What would you like to know?"
      },
      "onboarding": {
        "step1": "To get started, I'll need to provide you with a special PayPal code. Please provide your TikTok account email.",
        "step2": "Great! Here's your PayPal code: [CODE]. Please enter this in your TikTok account settings.",
        "step3": "Once you've entered the code, please send me a screenshot of the confirmation screen so I can verify everything is set up correctly.",
        "step4": "Perfect! Your account is now set up. You can proceed to make withdrawals. Is there anything else you need help with?"
      },
      "withdrawal": {
        "pending": "Your withdrawal request is being processed. You'll receive a notification once it's completed.",
        "completed": "Your withdrawal has been completed successfully!",
        "rejected": "Your withdrawal request was rejected. Please contact support for more information."
      },
      "other": {
        "greeting": "Hello! I'm here to help. What can I assist you with today?",
        "closing": "Is there anything else I can help you with?"
      }
    }
  }
}
```

**Usage:**
- Frontend can use these templates to provide quick-reply buttons or auto-suggest messages
- Admin can use these when responding to users
- Replace `[CODE]` with the actual PayPal code when sending to users

---

## 4. Conversation Closing Logic

### How It Works

When a conversation is **closed** or **resolved** by an admin, the system automatically creates a **new conversation** when the user sends a new message.

**Behavior:**
1. User sends a message to a closed/resolved conversation
2. System detects the conversation is not `OPEN`
3. System automatically creates a new conversation with `status: "open"`
4. Message is sent to the new conversation

**Admin Endpoint to Close Conversation:**

`PATCH /api/admin/support/conversations/:id/status`

**Request Body:**
```json
{
  "status": "closed"  // or "resolved"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Conversation status updated successfully",
  "data": {
    "id": "conversation-uuid",
    "status": "closed",
    "updatedAt": "2025-12-12T15:30:00.000Z"
  }
}
```

**Important Notes:**
- When a conversation is closed, users can still view the conversation history
- New messages from users will automatically create a fresh ticket
- Admins can reopen closed conversations by setting status to `"open"`

---

## 5. Onboarding Flow Support

### Special Handling for Onboarding Conversations

When a user selects "Complete your Onboarding" from the conversation options:

1. **Conversation Type:** `type: "onboarding"`
2. **Admin Workflow:**
   - Admin provides TikTok account email/password
   - User enters credentials and takes screenshot
   - Admin sends special PayPal code
   - Admin verifies screenshot
   - Admin confirms user is set up
   - User can proceed to withdrawals

**Standard Messages for Onboarding:**
- Use `messages.onboarding.step1` through `step4` from the standard messages endpoint
- Replace `[CODE]` with the actual PayPal code

**Image Upload:**
- Users can upload screenshots using the image upload endpoint
- Admins can verify screenshots before sending the PayPal code

---

## 6. Message Types

The support system now supports different message types:

- `text`: Regular text message (default)
- `file`: Message with file/image attachment
- `system`: System-generated messages
- `auth_code`: Authentication code messages

**Message Object Structure:**
```json
{
  "id": "message-uuid",
  "conversationId": "conversation-uuid",
  "senderId": "user-uuid",
  "senderType": "user",
  "guestId": null,
  "message": "Message content",
  "messageType": "file",
  "fileUrl": "https://storage.example.com/file.jpg",
  "fileName": "screenshot.png",
  "fileSize": 245678,
  "isRead": false,
  "readAt": null,
  "createdAt": "2025-12-12T15:30:00.000Z"
}
```

---

## 7. WebSocket Events

### Updated `message:received` Event

When a message with a file is created, the WebSocket event includes file metadata:

```json
{
  "event": "message:received",
  "data": {
    "id": "message-uuid",
    "conversationId": "conversation-uuid",
    "senderId": "user-uuid",
    "senderType": "user",
    "message": "📎 Image attachment",
    "messageType": "file",
    "fileUrl": "https://storage.example.com/file.jpg",
    "fileName": "screenshot.png",
    "fileSize": 245678,
    "createdAt": "2025-12-12T15:30:00.000Z"
  }
}
```

---

## 8. Frontend Integration Guide

### Step 1: Display Conversation Options

When user clicks "Contact Support", show the options from `/api/support/conversation-options`:

```javascript
const options = await fetch('/api/support/conversation-options').then(r => r.json());
// Display options to user
```

### Step 2: Create Conversation Based on Selection

```javascript
const conversation = await fetch('/api/support/conversation', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ type: selectedOption.type })
});
```

### Step 3: Upload Images

```javascript
const formData = new FormData();
formData.append('file', imageFile);
formData.append('message', 'Optional message text');

const response = await fetch(`/api/support/conversation/${conversationId}/upload`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

### Step 4: Use Standard Messages

```javascript
const templates = await fetch('/api/support/standard-messages').then(r => r.json());
// Use templates.messages.welcome.onboarding, etc.
```

### Step 5: Handle Closed Conversations

When sending a message via WebSocket, if the conversation is closed, the backend will automatically create a new one. The frontend should handle the new conversation ID in the response.

---

## 9. Admin Features

### Closing Conversations

Admins can close conversations using:

```bash
PATCH /api/admin/support/conversations/:id/status
Body: { "status": "closed" }
```

### Viewing File Attachments

When viewing messages, check for `messageType: "file"` and display the `fileUrl` as an image.

### Onboarding Workflow

1. User selects "Complete your Onboarding"
2. Admin receives notification
3. Admin uses standard messages to guide user
4. User uploads screenshot via image upload endpoint
5. Admin verifies and sends PayPal code
6. Admin closes conversation when onboarding is complete

---

## 10. Future Enhancements

### Email Integration (Planned)

A future script will:
- Monitor the support email account
- Parse incoming emails
- Route messages to the appropriate conversation
- Reduce admin intervention for common queries

This will be implemented as a separate service that integrates with the support system.

---

## Summary

All requested features have been implemented:

✅ **Image Upload Support** - Users and admins can upload images  
✅ **Standard Messages** - Pre-defined templates for common scenarios  
✅ **Conversation Options** - Users can choose onboarding, withdrawal, or general support  
✅ **Conversation Closing** - Closed conversations trigger new ticket creation  
✅ **Onboarding Flow** - Special handling for onboarding conversations  
✅ **File Metadata** - All file information is stored and transmitted  

The system is ready for frontend integration and testing!

