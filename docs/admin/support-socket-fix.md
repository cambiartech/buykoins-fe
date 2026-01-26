# WebSocket Connection Fix - Implementation Complete

## ✅ What Was Fixed

### 1. WebSocket Adapter Configuration
- Created custom `SocketIOAdapter` that properly handles CORS
- Configured adapter in `main.ts` to use the custom adapter
- Ensures WebSocket connections respect CORS settings

### 2. CORS Configuration
- Updated gateway CORS to work with the adapter
- Added support for both development (all origins) and production (configured origin)
- Enabled credentials for authenticated connections

### 3. Authentication Improvements
- Token can now be read from multiple locations:
  - `handshake.auth.token` (recommended)
  - `handshake.query.token` (alternative)
  - `handshake.headers.authorization` (fallback)
- Better error messages for connection failures

### 4. Error Handling
- Added `connection:error` event that emits to client before disconnect
- Better logging for debugging connection issues
- Error stack traces logged for troubleshooting

### 5. Health Check Endpoint
- Added `GET /api/support/health` endpoint
- Returns WebSocket server status and connection URL

---

## 🔌 How to Connect (Frontend)

### Connection URL

**Development:**
```
http://localhost:3001/support
```

**Production:**
```
https://yourdomain.com/support
```

**Important:** Socket.io uses HTTP/HTTPS URLs, NOT `ws://` or `wss://`

### For Authenticated Users

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3001/support', {
  auth: {
    token: 'your-jwt-token-here'
  },
  transports: ['websocket', 'polling'], // Fallback to polling if WebSocket fails
});

socket.on('connection:success', (data) => {
  console.log('Connected as:', data.type);
  console.log('User ID:', data.userId);
});
```

### For Anonymous/Guest Users

```javascript
const socket = io('http://localhost:3001/support', {
  auth: {
    guestId: localStorage.getItem('guestId') // Optional: provide existing guest ID
  },
  transports: ['websocket', 'polling'],
});

socket.on('connection:success', (data) => {
  console.log('Connected as:', data.type);
  console.log('Guest ID:', data.guestId);
  
  // Store guest ID for future connections
  if (data.guestId) {
    localStorage.setItem('guestId', data.guestId);
  }
});
```

### Error Handling

```javascript
socket.on('connect_error', (error) => {
  console.error('Connection failed:', error);
  // Error object contains details about the failure
});

socket.on('connection:error', (error) => {
  console.error('Connection error:', error.message);
  console.error('Error code:', error.code);
});
```

---

## 🧪 Testing the Connection

### 1. Test Health Check

```bash
curl http://localhost:3001/api/support/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "WebSocket server is running",
  "timestamp": "2025-12-12T14:50:00.000Z",
  "websocket": {
    "namespace": "/support",
    "url": "ws://localhost:3001/support"
  }
}
```

### 2. Test WebSocket Connection

Open browser console and run:

```javascript
const socket = io('http://localhost:3001/support', {
  auth: { guestId: 'test_guest_123' }
});

socket.on('connection:success', (data) => {
  console.log('✅ Connected!', data);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error);
});
```

### 3. Check Server Logs

When frontend connects, you should see:
```
[SupportGateway] Client connected: <socket-id> (user|admin|guest)
```

---

## 🔍 Troubleshooting

### Issue: "Cannot connect to socket"

**Possible Causes:**
1. **Wrong URL format** - Using `ws://` instead of `http://`
   - ✅ Correct: `http://localhost:3001/support`
   - ❌ Wrong: `ws://localhost:3001/support`

2. **CORS blocking** - Frontend origin not allowed
   - Check `CORS_ORIGIN` in `.env` file
   - In development, all origins are allowed

3. **Token not passed correctly**
   - Ensure token is in `auth.token` in handshake
   - Check token is valid and not expired

4. **Server not running**
   - Verify server is running on port 3001
   - Check health endpoint: `GET /api/support/health`

### Issue: "Connection succeeds but no events received"

**Possible Causes:**
1. **Not joining conversation room**
   - Call `socket.emit('conversation:join', { conversationId })`
   - Wait for `conversation:joined` event

2. **Wrong namespace**
   - Ensure connecting to `/support` namespace
   - Full URL: `http://localhost:3001/support`

### Issue: "JWT expired" warning in logs

**This is normal!** The system automatically falls back to guest mode if JWT is expired or invalid. The connection will still succeed as a guest.

---

## 📋 Connection Checklist

Before reporting connection issues, verify:

- [ ] Server is running (`npm run start`)
- [ ] Health check endpoint works (`GET /api/support/health`)
- [ ] Using correct URL format (`http://` not `ws://`)
- [ ] Token is valid (if authenticated)
- [ ] CORS origin is configured correctly
- [ ] Browser console shows connection attempts
- [ ] Server logs show connection attempts

---

## 🚀 Quick Test Script

Save this as `test-websocket.html` and open in browser:

```html
<!DOCTYPE html>
<html>
<head>
  <title>WebSocket Test</title>
  <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
</head>
<body>
  <h1>WebSocket Connection Test</h1>
  <button onclick="testConnection()">Test Connection</button>
  <div id="output"></div>

  <script>
    function testConnection() {
      const output = document.getElementById('output');
      output.innerHTML = 'Connecting...<br>';

      const socket = io('http://localhost:3001/support', {
        auth: { guestId: 'test_' + Date.now() },
        transports: ['websocket', 'polling']
      });

      socket.on('connection:success', (data) => {
        output.innerHTML += `✅ Connected! Type: ${data.type}<br>`;
        if (data.guestId) {
          output.innerHTML += `Guest ID: ${data.guestId}<br>`;
        }
      });

      socket.on('connect_error', (error) => {
        output.innerHTML += `❌ Connection error: ${error.message}<br>`;
      });

      socket.on('connection:error', (error) => {
        output.innerHTML += `❌ Server error: ${error.message}<br>`;
      });

      socket.on('connect', () => {
        output.innerHTML += '🔌 Socket connected<br>';
      });

      socket.on('disconnect', () => {
        output.innerHTML += '🔌 Socket disconnected<br>';
      });
    }
  </script>
</body>
</html>
```

---

## 📝 Notes

1. **Connection URL**: Always use `http://` or `https://`, never `ws://` or `wss://` with Socket.io
2. **Guest ID**: Store guest ID in localStorage for anonymous users
3. **Reconnection**: Socket.io handles reconnection automatically
4. **Transports**: Both `websocket` and `polling` are enabled for maximum compatibility
5. **CORS**: In development, all origins are allowed. In production, configure `CORS_ORIGIN` in `.env`

---

## ✅ Status

All fixes have been implemented and tested. The WebSocket server should now accept connections from the frontend.

**Next Steps:**
1. Test connection from frontend
2. Verify `connection:success` event is received
3. Test message sending/receiving
4. Report any remaining issues

---

**Last Updated**: 2025-12-12

