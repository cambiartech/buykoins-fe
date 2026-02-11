# Email blast (broadcast) – API & frontend

Admin feature to send an **announcement** to all users or to a chosen audience. Each recipient gets an in-app notification; connected clients receive it in real time via the Notifications WebSocket.

**Canonical backend spec:** see **`docs/email.md`** for full request/response and behaviour.

---

## API summary (from docs/email.md)

- **Endpoint:** `POST /admin/notifications/broadcast`
- **Auth:** Bearer JWT, **super_admin** only (others get 403).

### Request body

| Field           | Type     | Required | Description |
|-----------------|----------|----------|-------------|
| `title`         | string   | Yes      | Max **255** chars. |
| `message`       | string   | Yes      | Plain text or HTML. Max **50,000** chars. |
| `messageFormat` | string   | No       | `"plain"` or `"html"`. Default `"plain"`. Set `"html"` when sending rich text from a WYSIWYG. |
| `userIds`       | string[] | No       | Send only to these user IDs (UUIDs). If set, `audience` is ignored. Max **5,000** IDs. |
| `audience`      | string   | No       | When `userIds` is not set: who receives it. Default `"all"`. |

### `audience` values

- **`all`** – Every user.
- **`active`** – Only users with status `active` (excludes suspended/frozen).
- **`onboarded`** – Only users with onboarding status `completed`.

Use either **`userIds`** (specific users) or **`audience`** (filter). If both are sent, `userIds` wins.

### Response

- **201 Created:** `{ "success": true, "data": { "sent": number } }`  
  `sent` = number of users who received the announcement.

---

## Frontend implementation (this app)

### API client (`lib/api.ts`)

```ts
broadcastAnnouncement: async (params: {
  title: string
  message: string
  messageFormat?: 'plain' | 'html'
  userIds?: string[]
  audience?: 'all' | 'active' | 'onboarded'
}) => { ... }
```

- Only includes `messageFormat` when `'html'`.
- Only includes `userIds` when non-empty; otherwise sends `audience` when not `'all'`.

### Broadcast page (`/admin/broadcast`)

1. **Title** – Single line, max 255, required.
2. **Message** – Textarea, max 50,000. **Format toggle:** Plain / HTML (sets `messageFormat` when HTML).
3. **Who receives:**
   - **All users** → no `userIds`, no `audience` (or `audience: "all"`).
   - **Active users only** → `audience: "active"`.
   - **Onboarded users only** → `audience: "onboarded"`.
   - **Select users** → searchable user picker:
     - Search input (debounced) calls `api.admin.getUsers({ search, limit: 25 })`.
     - Click a result to add user to selection; show selected as chips with remove. Max 5,000 users.
     - Request sends `userIds` array.
4. **Submit** – Builds body from form; shows “Sent to N users” on success.

### Rendering announcements (in-app)

When showing a notification with `type === "announcement"`:

- If **`metadata.messageFormat === "html"`**, render `message` as sanitized HTML (e.g. DOMPurify then `dangerouslySetInnerHTML`).
- Otherwise render **plain text** (escape or text nodes only).

---

## Quick reference

| Item          | Value |
|---------------|--------|
| Method        | `POST` |
| Path          | `/admin/notifications/broadcast` |
| Auth          | JWT, **super_admin** only |
| Title max     | 255 |
| Message max   | 50,000 |
| userIds max   | 5,000 |
| Success       | 201 → `{ "success": true, "data": { "sent": number } }` |

Full details and examples: **`docs/email.md`**.
