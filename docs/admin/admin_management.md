# Admin Management API Documentation

This document describes the Admin Management endpoints for the BuyTikTokCoins platform. These endpoints allow super admins to create, manage, and assign roles/permissions to other administrators.

## Base URL

All endpoints are prefixed with `/api/admin/admins`

## Authentication

All endpoints require **super admin** authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <super_admin_jwt_token>
```

**Note:** Only super admins can access these endpoints. Regular admins will receive a 403 Forbidden error.

---

## Permissions System

### Available Permissions

The system uses a granular permission system organized by module:

#### Credit Requests Module
- `credit_requests:view` - View credit requests
- `credit_requests:approve` - Approve credit requests
- `credit_requests:reject` - Reject credit requests

#### Onboarding Module
- `onboarding:view` - View onboarding requests
- `onboarding:complete` - Complete user onboarding

#### Payouts Module
- `payouts:view` - View payout requests
- `payouts:process` - Process payouts
- `payouts:reject` - Reject payouts

#### Users Module
- `users:view` - View users
- `users:suspend` - Suspend users
- `users:unsuspend` - Unsuspend users

#### Transactions Module
- `transactions:view` - View transactions

#### Finance Module
- `finance:view` - View finance reports

#### Admin Management Module
- `admins:view` - View admins (super admin only)
- `admins:create` - Create admins (super admin only)
- `admins:update` - Update admins (super admin only)
- `admins:suspend` - Suspend admins (super admin only)
- `admins:delete` - Delete admins (super admin only)

#### Settings Module
- `settings:view` - View platform settings
- `settings:update` - Update platform settings

### Default Permissions

When creating a regular admin (role: `admin`) without specifying permissions, they automatically receive:
- All Credit Requests permissions
- All Onboarding permissions
- All Payouts permissions
- All Users permissions
- All Transactions permissions
- All Finance permissions

**Super admins** have all permissions automatically and cannot have their permissions restricted.

---

## Endpoints

### 1. Get All Admins

Retrieve all admins with pagination and filtering.

**Endpoint:** `GET /api/admin/admins`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number for pagination |
| `limit` | number | No | 10 | Number of items per page (max: 50) |
| `search` | string | No | - | Search by email, first name, or last name |
| `role` | string | No | 'all' | Filter by role: `all`, `admin`, `super_admin` |
| `status` | string | No | 'all' | Filter by status: `all`, `active`, `disabled` |

**Example Request:**

```bash
GET /api/admin/admins?page=1&limit=20&role=admin&status=active&search=john
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "admins": [
      {
        "id": "uuid",
        "email": "admin@buytiktokcoins.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "admin",
        "permissions": [
          "credit_requests:view",
          "credit_requests:approve",
          "users:view",
          "payouts:view"
        ],
        "status": "active",
        "lastLoginAt": "2025-12-09T10:30:00.000Z",
        "createdAt": "2025-12-01T08:00:00.000Z",
        "updatedAt": "2025-12-09T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 20
    }
  }
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid or missing authentication token
- `403 Forbidden`: User is not a super admin
- `500 Internal Server Error`: Server error

---

### 2. Get Admin by ID

Retrieve detailed information about a specific admin.

**Endpoint:** `GET /api/admin/admins/:id`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Admin UUID |

**Example Request:**

```bash
GET /api/admin/admins/uuid-here
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "admin@buytiktokcoins.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "admin",
    "permissions": [
      "credit_requests:view",
      "credit_requests:approve",
      "users:view",
      "payouts:view"
    ],
    "status": "active",
    "lastLoginAt": "2025-12-09T10:30:00.000Z",
    "createdAt": "2025-12-01T08:00:00.000Z",
    "updatedAt": "2025-12-09T10:30:00.000Z"
  }
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid or missing authentication token
- `403 Forbidden`: User is not a super admin
- `404 Not Found`: Admin not found
- `500 Internal Server Error`: Server error

---

### 3. Create Admin

Create a new admin account with specified role and permissions.

**Endpoint:** `POST /api/admin/admins`

**Request Body:**

```json
{
  "email": "newadmin@buytiktokcoins.com",
  "password": "SecurePassword123!",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "admin",
  "permissions": [
    "credit_requests:view",
    "credit_requests:approve",
    "users:view",
    "payouts:view",
    "payouts:process"
  ]
}
```

**Field Descriptions:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Admin email address (must be unique) |
| `password` | string | Yes | Admin password (min 8 characters) |
| `firstName` | string | Yes | Admin first name |
| `lastName` | string | Yes | Admin last name |
| `role` | string | No | Admin role: `admin` or `super_admin` (default: `admin`) |
| `permissions` | string[] | No | Array of permission strings. If not provided and role is `admin`, default permissions are assigned |

**Response (201 Created):**

```json
{
  "success": true,
  "message": "Admin created successfully",
  "data": {
    "id": "uuid",
    "email": "newadmin@buytiktokcoins.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "admin",
    "permissions": [
      "credit_requests:view",
      "credit_requests:approve",
      "users:view",
      "payouts:view",
      "payouts:process"
    ],
    "status": "active",
    "createdAt": "2025-12-09T12:00:00.000Z"
  }
}
```

**Error Responses:**

- `400 Bad Request`: Email already exists or validation error
- `401 Unauthorized`: Invalid or missing authentication token
- `403 Forbidden`: User is not a super admin
- `500 Internal Server Error`: Server error

---

### 4. Update Admin

Update an existing admin's information, permissions, or role.

**Endpoint:** `PATCH /api/admin/admins/:id`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Admin UUID |

**Request Body (all fields optional):**

```json
{
  "email": "updated@buytiktokcoins.com",
  "password": "NewSecurePassword123!",
  "firstName": "Jane",
  "lastName": "Updated",
  "role": "admin",
  "permissions": [
    "credit_requests:view",
    "credit_requests:approve",
    "users:view"
  ],
  "status": "active"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Admin updated successfully",
  "data": {
    "id": "uuid",
    "email": "updated@buytiktokcoins.com",
    "firstName": "Jane",
    "lastName": "Updated",
    "role": "admin",
    "permissions": [
      "credit_requests:view",
      "credit_requests:approve",
      "users:view"
    ],
    "status": "active",
    "updatedAt": "2025-12-09T12:30:00.000Z"
  }
}
```

**Special Rules:**
- Only super admins can modify super admin accounts
- Email must be unique if changed
- Password is hashed before storage
- Permissions can be updated for regular admins

**Error Responses:**

- `400 Bad Request`: Email already exists or validation error
- `401 Unauthorized`: Invalid or missing authentication token
- `403 Forbidden`: User is not a super admin, or attempting to modify super admin without super admin role
- `404 Not Found`: Admin not found
- `500 Internal Server Error`: Server error

---

### 5. Suspend Admin

Suspend an admin account (sets status to `disabled`).

**Endpoint:** `POST /api/admin/admins/:id/suspend`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Admin UUID |

**Request Body (optional):**

```json
{
  "reason": "Violation of company policy"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Admin suspended successfully",
  "data": {
    "id": "uuid",
    "status": "disabled",
    "updatedAt": "2025-12-09T13:00:00.000Z"
  }
}
```

**Special Rules:**
- Cannot suspend super admin accounts
- Cannot suspend your own account
- Suspended admins cannot log in

**Error Responses:**

- `400 Bad Request`: Attempting to suspend own account
- `401 Unauthorized`: Invalid or missing authentication token
- `403 Forbidden`: User is not a super admin, or attempting to suspend super admin
- `404 Not Found`: Admin not found
- `500 Internal Server Error`: Server error

---

### 6. Unsuspend Admin

Reactivate a suspended admin account (sets status to `active`).

**Endpoint:** `POST /api/admin/admins/:id/unsuspend`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Admin UUID |

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Admin unsuspended successfully",
  "data": {
    "id": "uuid",
    "status": "active",
    "updatedAt": "2025-12-09T13:30:00.000Z"
  }
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid or missing authentication token
- `403 Forbidden`: User is not a super admin
- `404 Not Found`: Admin not found
- `500 Internal Server Error`: Server error

---

### 7. Delete Admin

Delete an admin account (soft delete - sets status to `disabled`).

**Endpoint:** `DELETE /api/admin/admins/:id`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Admin UUID |

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Admin deleted successfully",
  "data": {
    "id": "uuid",
    "status": "disabled",
    "deletedAt": "2025-12-09T14:00:00.000Z"
  }
}
```

**Special Rules:**
- Cannot delete super admin accounts
- Cannot delete your own account
- This is a soft delete (status set to disabled)

**Error Responses:**

- `400 Bad Request`: Attempting to delete own account
- `401 Unauthorized`: Invalid or missing authentication token
- `403 Forbidden`: User is not a super admin, or attempting to delete super admin
- `404 Not Found`: Admin not found
- `500 Internal Server Error`: Server error

---

### 8. Get Available Permissions

Get a list of all available permissions organized by module.

**Endpoint:** `GET /api/admin/admins/permissions/available`

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "permissions": [
      "credit_requests:view",
      "credit_requests:approve",
      "credit_requests:reject",
      "onboarding:view",
      "onboarding:complete",
      "payouts:view",
      "payouts:process",
      "payouts:reject",
      "users:view",
      "users:suspend",
      "users:unsuspend",
      "transactions:view",
      "finance:view",
      "admins:view",
      "admins:create",
      "admins:update",
      "admins:suspend",
      "admins:delete",
      "settings:view",
      "settings:update"
    ],
    "groups": {
      "CREDIT_REQUESTS": [
        "credit_requests:view",
        "credit_requests:approve",
        "credit_requests:reject"
      ],
      "ONBOARDING": [
        "onboarding:view",
        "onboarding:complete"
      ],
      "PAYOUTS": [
        "payouts:view",
        "payouts:process",
        "payouts:reject"
      ],
      "USERS": [
        "users:view",
        "users:suspend",
        "users:unsuspend"
      ],
      "TRANSACTIONS": [
        "transactions:view"
      ],
      "FINANCE": [
        "finance:view"
      ],
      "ADMINS": [
        "admins:view",
        "admins:create",
        "admins:update",
        "admins:suspend",
        "admins:delete"
      ],
      "SETTINGS": [
        "settings:view",
        "settings:update"
      ]
    }
  }
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid or missing authentication token
- `403 Forbidden`: User is not a super admin
- `500 Internal Server Error`: Server error

---

## Use Cases

### 1. Create Admin with Custom Permissions

Create an admin that can only view and approve credit requests:

```bash
POST /api/admin/admins
{
  "email": "creditadmin@buytiktokcoins.com",
  "password": "SecurePass123!",
  "firstName": "Credit",
  "lastName": "Admin",
  "role": "admin",
  "permissions": [
    "credit_requests:view",
    "credit_requests:approve"
  ]
}
```

### 2. Create Admin with Default Permissions

Create an admin without specifying permissions (gets default permissions):

```bash
POST /api/admin/admins
{
  "email": "standardadmin@buytiktokcoins.com",
  "password": "SecurePass123!",
  "firstName": "Standard",
  "lastName": "Admin",
  "role": "admin"
}
```

### 3. Update Admin Permissions

Grant additional permissions to an existing admin:

```bash
PATCH /api/admin/admins/{id}
{
  "permissions": [
    "credit_requests:view",
    "credit_requests:approve",
    "credit_requests:reject",
    "users:view",
    "payouts:view",
    "payouts:process"
  ]
}
```

### 4. Suspend Admin Temporarily

Suspend an admin account:

```bash
POST /api/admin/admins/{id}/suspend
{
  "reason": "Temporary suspension for investigation"
}
```

### 5. Search for Admins

Find admins by name or email:

```bash
GET /api/admin/admins?search=john&status=active
```

---

## Security Considerations

1. **Super Admin Protection:**
   - Super admins cannot be suspended or deleted
   - Only super admins can modify super admin accounts
   - Super admins have all permissions automatically

2. **Self-Protection:**
   - Admins cannot suspend or delete their own accounts
   - This prevents accidental lockout

3. **Password Security:**
   - Passwords are hashed using bcrypt (10 salt rounds)
   - Passwords are never returned in API responses

4. **Permission Validation:**
   - All permissions are validated against the available permissions list
   - Invalid permissions are rejected

---

## Notes

- All admin management operations are logged (via `createdBy`/`updatedBy` tracking)
- Suspended/deleted admins cannot log in
- Permissions are checked on every request via the `RolesGuard`
- Super admins bypass permission checks (have all permissions)
- Email addresses must be unique across all admins

---

## Testing

### Example cURL Commands

**Get all admins:**
```bash
curl -X GET "http://localhost:3001/api/admin/admins?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_JWT_TOKEN"
```

**Create admin:**
```bash
curl -X POST "http://localhost:3001/api/admin/admins" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newadmin@buytiktokcoins.com",
    "password": "SecurePass123!",
    "firstName": "New",
    "lastName": "Admin",
    "role": "admin",
    "permissions": ["credit_requests:view", "credit_requests:approve"]
  }'
```

**Update admin:**
```bash
curl -X PATCH "http://localhost:3001/api/admin/admins/{id}" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permissions": ["credit_requests:view", "users:view"]
  }'
```

**Suspend admin:**
```bash
curl -X POST "http://localhost:3001/api/admin/admins/{id}/suspend" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Policy violation"}'
```

**Get available permissions:**
```bash
curl -X GET "http://localhost:3001/api/admin/admins/permissions/available" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_JWT_TOKEN"
```

---

## Support

For issues or questions regarding the Admin Management API, please contact the development team.

