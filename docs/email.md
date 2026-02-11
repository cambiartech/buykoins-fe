# Broadcast (announcement / email blast) API – Frontend

This doc describes the **admin-only** broadcast endpoint and how to handle announcements on the client (including formatted text and targeting).

---

## Endpoint

- **Method:** `POST`
- **URL:** `/api/admin/notifications/broadcast` (with your API base, e.g. `https://core.buykoins.com/api`)
- **Auth:** Bearer JWT (admin). **Only `super_admin`** can call this.

---

## Request body

| Field           | Type     | Required | Description |
|----------------|----------|----------|-------------|
| `title`        | string   | Yes      | Notification title. Max 255 chars. |
| `message`      | string   | Yes      | Body. Plain text or HTML. Max 50,000 chars. |
| `messageFormat`| string   | No       | `"plain"` or `"html"`. Default `"plain"`. Set to `"html"` when sending rich text from an editor (e.g. WYSIWYG). |
| `userIds`      | string[] | No       | Send only to these user IDs (UUIDs). If set, `audience` is ignored. Max 5,000 IDs. |
| `audience`     | string   | No       | When `userIds` is not set: who receives the announcement. Default `"all"`. |

### `audience` values

- **`all`** – Every user.
- **`active`** – Only users with status `active` (excludes suspended/frozen).
- **`onboarded`** – Only users with onboarding status `completed`.

Use either **`userIds`** (specific users) or **`audience`** (filter). If both are sent, `userIds` wins.

---

## Examples

**Broadcast to everyone (plain text):**
```json
{
  "title": "Scheduled maintenance",
  "message": "We will perform maintenance on Sunday 2–4 AM UTC. Services may be briefly unavailable."
}
```

**Broadcast to onboarded users only:**
```json
{
  "title": "New payout option",
  "message": "You can now request payouts to mobile money. Check your dashboard.",
  "audience": "onboarded"
}
```

**Rich text from an editor (HTML):**
```json
{
  "title": "Policy update",
  "message": "<p>Our <strong>Terms of Service</strong> have been updated.</p><p>Key changes:</p><ul><li>Section 3.2</li><li>Section 5.1</li></ul>",
  "messageFormat": "html"
}
```

**Send to specific users:**
```json
{
  "title": "Your account",
  "message": "Please complete your profile.",
  "userIds": ["uuid-1", "uuid-2", "uuid-3"]
}
```

---

## Response

- **201 Created**
```json
{
  "success": true,
  "data": { "sent": 42 }
}
```
`sent` is the number of users who received the announcement (created + pushed over WebSocket).

---

## Client behaviour

### 1. Sending the request

- Use the same API base URL as the rest of the app.
- Send admin JWT in `Authorization: Bearer <token>`.
- Only super_admin should see/call the “Broadcast” or “Email blast” form; others get 403.

### 2. Form / editor

- **Title:** single line, max 255 characters.
- **Message:** 
  - If using a **plain textarea**, send `message` as-is and omit `messageFormat` (or set `"plain"`).
  - If using a **rich text / WYSIWYG editor** (e.g. TipTap, Quill, CKEditor), send the editor’s HTML output in `message` and set **`messageFormat: "html"`**.
- **Targeting:**
  - “All users” → omit `userIds` and `audience` (or `audience: "all"`).
  - “Active users only” → `audience: "active"`.
  - “Onboarded users only” → `audience: "onboarded"`.
  - “Select users” → pass the chosen user IDs in `userIds` (e.g. from a multi-select or table selection).

### 3. Displaying announcements (in-app)

When listing or showing a notification with `type === "announcement"`:

- If **`metadata.messageFormat === "html"`**, render `message` as HTML in a safe way (e.g. sanitize with a library like DOMPurify, then use `dangerouslySetInnerHTML` or equivalent).
- Otherwise treat `message` as **plain text** (escape or use text nodes only).

Example (React-style):

```ts
// When rendering one notification
const isHtml = notification.metadata?.messageFormat === 'html';
const content = isHtml
  ? { __html: sanitize(notification.message) }  // sanitize first
  : null;

// In JSX:
{isHtml ? (
  <div dangerouslySetInnerHTML={content} />
) : (
  <p>{notification.message}</p>
)}
```

---

## WebSocket

Announcements are also pushed in real time to connected clients on the **notifications** namespace.

- **Path:** `path: '/api/socket.io'`
- **Namespace:** `/notifications`
- **Event:** `notification`

Payload shape matches a single notification object (including `metadata.messageFormat` when it’s HTML). Same rendering rule: if `metadata.messageFormat === 'html'`, render `message` as sanitized HTML; otherwise as plain text.

See **WEBSOCKET_FRONTEND.md** for connection details (base URL, path, auth).

---

## Summary

| Need | Backend choice |
|------|-----------------|
| Formatted / rich text | Send HTML in `message`, set `messageFormat: "html"`. |
| Select users | Send `userIds: ["id1", "id2", ...]`. |
| Active users only | Set `audience: "active"`. |
| Onboarded only | Set `audience: "onboarded"`. |
| Everyone | Omit `userIds` and use default `audience` or `audience: "all"`. |

Frontend: build the form (title, editor for message, audience/user picker), call `POST /api/admin/notifications/broadcast`, and render announcements using `metadata.messageFormat` for plain vs HTML.
