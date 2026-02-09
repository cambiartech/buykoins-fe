# WebSocket (Socket.IO) – Frontend connection

Railway serves the app on one URL. There is **no separate WebSocket endpoint**: Socket.IO runs on the **same host and port** as the API, under the API prefix.

---

## Why you see "websocket error" / "WebSocket connection failed"

If the console shows `wss://core.buykoins.com/socket.io/` **failing**, the client is using the **wrong path**.  
The backend serves Socket.IO at **`/api/socket.io`**, not `/socket.io`.  
**Fix:** Every Socket.IO client (notifications, support chat, widget) must use **`path: '/api/socket.io'`** in the connection options.

## Backend URL (example)

- API base: `https://core.buykoins.com/api`
- Socket.IO path: `https://core.buykoins.com/api/socket.io`
- Namespaces: `/notifications`, `/support`, `/widget`

## How the frontend must connect

1. **Base URL** = same as your API (e.g. `https://core.buykoins.com`), **no** `/api` at the end for the `io()` URL.
2. **Path** = `'/api/socket.io'` (must match the API prefix).
3. **Namespace** = use the one you need:
   - Notifications: `/notifications`
   - Support: `/support`
   - Widget: `/widget`

### Notifications (example)

```ts
import { io } from 'socket.io-client';

const API_BASE = 'https://core.buykoins.com'; // or from env

const socket = io(`${API_BASE}/notifications`, {
  path: '/api/socket.io',
  auth: { token: 'YOUR_JWT' }, // or however you send auth
  transports: ['websocket', 'polling'],
});
```

Wrong (will cause “Invalid namespace” or connection issues):

- Using default namespace: `io(API_BASE)` → use `io(\`${API_BASE}/notifications\`)` instead.
- Wrong path: `path: '/socket.io'` → use `path: '/api/socket.io'`.

## Railway

- No extra WebSocket endpoint or config: the same HTTP port does WebSocket upgrade.
- Set **CORS_ORIGIN** in Railway to your frontend origin(s), e.g. `https://www.buykoins.com` or `https://yourapp.vercel.app` (comma-separated if several). Otherwise the browser will block the WebSocket.

## Summary for frontend

| Setting    | Value                    |
|-----------|---------------------------|
| Base URL  | `https://core.buykoins.com` |
| **Path**  | **`'/api/socket.io'`** (required; default `/socket.io` will fail) |
| Namespace (notifications) | `'/notifications'` |
| Namespace (support)       | `'/support'`       |
| Namespace (widget)        | `'/widget'`        |

---

## Copy-paste checklist for frontend

Use this for **every** Socket.IO usage (notifications, support chat, widget):

1. **Base URL** = your API host, e.g. `https://core.buykoins.com` (no trailing slash, no `/api`).
2. **Path** = always `path: '/api/socket.io'` in the options object.
3. **Namespace** = one of:
   - Notifications: connect to `io(\`${baseUrl}/notifications\`, { path: '/api/socket.io', ... })`
   - Support chat: `io(\`${baseUrl}/support\`, { path: '/api/socket.io', ... })`
   - Widget: `io(\`${baseUrl}/widget\`, { path: '/api/socket.io', ... })`

Where to set it: wherever you create the Socket.IO client (e.g. `socketManager`, `widgetSocketManager`, or notification socket). Each must receive the same `path: '/api/socket.io'` in its options; the only difference is the namespace in the URL (`/notifications`, `/support`, `/widget`).
