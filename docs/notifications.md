# Admin Notifications System - Complete Documentation

## Overview

The notifications system provides real-time and persistent notifications for both users and admins. This document focuses on the admin notifications functionality.

---

## Table of Contents

1. [WebSocket Connection](#websocket-connection)
2. [REST API Endpoints](#rest-api-endpoints)
3. [Notification Types](#notification-types)
4. [Integration Points](#integration-points)
5. [Frontend Implementation](#frontend-implementation)

---

## WebSocket Connection

### Namespace
```
wss://your-api.com/notifications
```

### Authentication
Include JWT token in the connection:

```javascript
import { io } from 'socket.io-client';

const socket = io('https://your-api.com/notifications', {
  auth: {
    token: 'your-jwt-token'
  },
  transports: ['websocket', 'polling']
});
```

### Events

#### Server → Client Events

**1. `notification` - New Notification**
```javascript
socket.on('notification', (data) => {
  console.log('New notification:', data);
  // data structure:
  {
    id: 'uuid',
    type: 'new_credit_request',
    title: 'New Credit Request',
    message: 'New credit request of $100.00 from user',
    metadata: {
      userId: 'uuid',
      amount: 100,
      creditRequestId: 'uuid'
    },
    priority: 'medium',
    isRead: false,
    readAt: null,
    actionUrl: '/admin/credit-requests/uuid',
    createdAt: '2026-02-04T12:00:00Z'
  }
});
```

**2. `unread_count` - Unread Count Update**
```javascript
socket.on('unread_count', (data) => {
  console.log('Unread count:', data.count);
  // Update UI badge
});
```

**3. `error` - Connection Error**
```javascript
socket.on('error', (data) => {
  console.error('WebSocket error:', data.message);
});
```

#### Client → Server Events

**1. `mark_read` - Mark Notification as Read**
```javascript
socket.emit('mark_read', { notificationId: 'uuid' }, (response) => {
  console.log(response); // { success: true }
});
```

**2. `mark_all_read` - Mark All Notifications as Read**
```javascript
socket.emit('mark_all_read', {}, (response) => {
  console.log(response); // { success: true }
});
```

**3. `get_unread_count` - Get Current Unread Count**
```javascript
socket.emit('get_unread_count', {}, (response) => {
  console.log(response); // { success: true, count: 5 }
});
```

---

## REST API Endpoints

### Base URL
```
https://your-api.com/api
```

All endpoints require Bearer token authentication.

---

### 1. Get Admin Notifications

**Endpoint:** `GET /admin/notifications`

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 20) - Items per page
- `unreadOnly` (optional, default: false) - Filter unread only

**Example Request:**
```bash
curl -X GET "https://your-api.com/api/admin/notifications?page=1&limit=20&unreadOnly=false" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "new_credit_request",
        "title": "New Credit Request",
        "message": "New credit request of $100.00 from user",
        "metadata": {
          "userId": "uuid",
          "amount": 100,
          "creditRequestId": "uuid"
        },
        "priority": "medium",
        "isRead": false,
        "readAt": null,
        "actionUrl": "/admin/credit-requests/uuid",
        "createdAt": "2026-02-04T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

---

### 2. Get Unread Count

**Endpoint:** `GET /admin/notifications/unread-count`

**Example Request:**
```bash
curl -X GET "https://your-api.com/api/admin/notifications/unread-count" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

---

### 3. Mark Notification as Read

**Endpoint:** `POST /admin/notifications/:id/read`

**Example Request:**
```bash
curl -X POST "https://your-api.com/api/admin/notifications/uuid/read" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Example Response:**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### 4. Mark All Notifications as Read

**Endpoint:** `POST /admin/notifications/read-all`

**Example Request:**
```bash
curl -X POST "https://your-api.com/api/admin/notifications/read-all" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Example Response:**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

### 5. Delete Notification

**Endpoint:** `DELETE /admin/notifications/:id`

**Example Request:**
```bash
curl -X DELETE "https://your-api.com/api/admin/notifications/uuid" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Example Response:**
```json
{
  "success": true,
  "message": "Notification deleted"
}
```

---

## Notification Types

### Admin Notification Types

| Type | Description | Priority | Action URL |
|------|-------------|----------|------------|
| `new_credit_request` | User submitted a credit request | Medium | `/admin/credit-requests/:id` |
| `new_payout_request` | User requested a payout | Medium | `/admin/payouts/:id` |
| `new_onboarding_request` | User initiated onboarding | Medium | `/admin/users/:id` |
| `new_support_message` | New support message received | Medium | `/admin/support/:conversationId` |
| `fraud_alert` | Suspicious activity detected | Urgent | `/admin/users/:id` |

### Priority Levels

- **Low:** Informational notifications
- **Medium:** Standard notifications requiring attention
- **High:** Important notifications requiring prompt action
- **Urgent:** Critical notifications requiring immediate action

---

## Integration Points

### When Notifications Are Sent

#### 1. New Credit Request
**Trigger:** User submits a credit request via `POST /api/user/credit-requests`

**Recipients:** All active admins

**Notification Data:**
```javascript
{
  type: 'new_credit_request',
  title: 'New Credit Request',
  message: 'New credit request of $100.00 from user',
  metadata: {
    userId: 'uuid',
    amount: 100,
    creditRequestId: 'uuid'
  },
  priority: 'medium',
  actionUrl: '/admin/credit-requests/uuid'
}
```

---

#### 2. New Payout Request
**Trigger:** User requests a payout via `POST /api/user/payout`

**Recipients:** All active admins

**Notification Data:**
```javascript
{
  type: 'new_payout_request',
  title: 'New Payout Request',
  message: 'New payout request of $100.00 from user',
  metadata: {
    userId: 'uuid',
    amount: 100,
    payoutId: 'uuid'
  },
  priority: 'medium',
  actionUrl: '/admin/payouts/uuid'
}
```

---

#### 3. New Onboarding Request
**Trigger:** User initiates onboarding via `POST /api/user/onboarding/request`

**Recipients:** All active admins

**Notification Data:**
```javascript
{
  type: 'new_onboarding_request',
  title: 'New Onboarding Request',
  message: 'A new user has submitted an onboarding request',
  metadata: {
    userId: 'uuid',
    onboardingRequestId: 'uuid'
  },
  priority: 'medium',
  actionUrl: '/admin/users/uuid'
}
```

---

## Frontend Implementation

### React Example with Socket.IO

```javascript
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

function AdminNotifications({ token }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('https://your-api.com/notifications', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    // Listen for new notifications
    newSocket.on('notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      // Show toast/alert
      showNotificationToast(notification);
    });

    // Listen for unread count updates
    newSocket.on('unread_count', (data) => {
      setUnreadCount(data.count);
    });

    // Handle errors
    newSocket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => newSocket.close();
  }, [token]);

  // Fetch initial notifications
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const response = await fetch('https://your-api.com/api/admin/notifications', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    setNotifications(data.data.notifications);
    setUnreadCount(data.data.notifications.filter(n => !n.isRead).length);
  };

  const markAsRead = async (notificationId) => {
    await fetch(`https://your-api.com/api/admin/notifications/${notificationId}/read`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    // Update local state
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = async () => {
    await fetch('https://your-api.com/api/admin/notifications/read-all', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <div className="notifications-panel">
      <div className="notifications-header">
        <h3>Notifications</h3>
        {unreadCount > 0 && (
          <span className="badge">{unreadCount}</span>
        )}
        <button onClick={markAllAsRead}>Mark All Read</button>
      </div>
      <div className="notifications-list">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
            onClick={() => {
              markAsRead(notification.id);
              // Navigate to action URL
              window.location.href = notification.actionUrl;
            }}
          >
            <div className="notification-title">{notification.title}</div>
            <div className="notification-message">{notification.message}</div>
            <div className="notification-time">
              {new Date(notification.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function showNotificationToast(notification) {
  // Use your preferred toast library
  // e.g., react-toastify, react-hot-toast, etc.
  console.log('New notification:', notification);
}

export default AdminNotifications;
```

---

### Vue Example

```vue
<template>
  <div class="notifications-panel">
    <div class="notifications-header">
      <h3>Notifications</h3>
      <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
      <button @click="markAllAsRead">Mark All Read</button>
    </div>
    <div class="notifications-list">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="['notification-item', { unread: !notification.isRead }]"
        @click="handleNotificationClick(notification)"
      >
        <div class="notification-title">{{ notification.title }}</div>
        <div class="notification-message">{{ notification.message }}</div>
        <div class="notification-time">
          {{ formatDate(notification.createdAt) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { io } from 'socket.io-client';

export default {
  name: 'AdminNotifications',
  props: ['token'],
  data() {
    return {
      notifications: [],
      unreadCount: 0,
      socket: null
    };
  },
  mounted() {
    this.initializeSocket();
    this.fetchNotifications();
  },
  beforeUnmount() {
    if (this.socket) {
      this.socket.close();
    }
  },
  methods: {
    initializeSocket() {
      this.socket = io('https://your-api.com/notifications', {
        auth: { token: this.token },
        transports: ['websocket', 'polling']
      });

      this.socket.on('notification', (notification) => {
        this.notifications.unshift(notification);
        this.showNotificationToast(notification);
      });

      this.socket.on('unread_count', (data) => {
        this.unreadCount = data.count;
      });

      this.socket.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    },
    async fetchNotifications() {
      const response = await fetch('https://your-api.com/api/admin/notifications', {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      const data = await response.json();
      this.notifications = data.data.notifications;
      this.unreadCount = data.data.notifications.filter(n => !n.isRead).length;
    },
    async markAsRead(notificationId) {
      await fetch(`https://your-api.com/api/admin/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      const index = this.notifications.findIndex(n => n.id === notificationId);
      if (index !== -1) {
        this.notifications[index].isRead = true;
      }
    },
    async markAllAsRead() {
      await fetch('https://your-api.com/api/admin/notifications/read-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });
      this.notifications.forEach(n => n.isRead = true);
      this.unreadCount = 0;
    },
    handleNotificationClick(notification) {
      this.markAsRead(notification.id);
      this.$router.push(notification.actionUrl);
    },
    formatDate(date) {
      return new Date(date).toLocaleString();
    },
    showNotificationToast(notification) {
      // Use your preferred toast library
      console.log('New notification:', notification);
    }
  }
};
</script>
```

---

## Testing

### Test WebSocket Connection
```bash
# Install wscat
npm install -g wscat

# Connect to WebSocket
wscat -c "wss://your-api.com/notifications" -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test REST API
```bash
# Get notifications
curl -X GET "https://your-api.com/api/admin/notifications" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get unread count
curl -X GET "https://your-api.com/api/admin/notifications/unread-count" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Database Schema

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES admins(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  priority VARCHAR(20) DEFAULT 'medium',
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  action_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT check_recipient CHECK (
    (user_id IS NOT NULL AND admin_id IS NULL) OR 
    (user_id IS NULL AND admin_id IS NOT NULL)
  )
);

CREATE INDEX idx_notifications_admin_id ON notifications(admin_id);
CREATE INDEX idx_notifications_admin_unread ON notifications(admin_id, is_read) WHERE is_read = FALSE;
```

---

## Summary

The admin notifications system provides:

✅ **Real-time notifications** via WebSocket  
✅ **Persistent storage** in database  
✅ **REST API** for fetching and managing notifications  
✅ **Unread counts** for UI badges  
✅ **Mark as read** functionality  
✅ **Priority levels** for importance  
✅ **Action URLs** for navigation  
✅ **Metadata** for contextual information  

All admins are notified when:
- New credit request is submitted
- New payout request is created
- New onboarding request is initiated

Notifications are sent both via WebSocket (real-time) and stored in the database for persistence.
