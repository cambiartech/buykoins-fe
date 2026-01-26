# Admin Onboarding Management API Documentation

**Base URL**: `/api/admin/users`

**Authentication**: All endpoints require admin authentication via JWT Bearer token.

**Required Roles**: `admin` or `super_admin`

---

## Table of Contents

1. [Complete User Onboarding](#1-complete-user-onboarding)
2. [Get User Details (with Onboarding Info)](#2-get-user-details-with-onboarding-info)
3. [List Users (Filter by Onboarding Status)](#3-list-users-filter-by-onboarding-status)

---

## 1. Complete User Onboarding

**Endpoint**: `POST /api/admin/users/:id/complete-onboarding`

**Description**: Complete a user's onboarding process. This marks the user as onboarded and allows them to submit credit requests and request payouts. Admin must provide onboarding notes (bank account details, payment methods, etc.) for record keeping.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | Yes | User ID |

**Request Body**:
```json
{
  "notes": "Bank: First Bank of Nigeria, Account: 1234567890, PayPal: user@example.com, Payment method verified"
}
```

**Request Body Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `notes` | string | Yes | Onboarding notes including bank account details, payment methods, and any other relevant information (max 1000 chars) |

**Example Request**:
```bash
curl -X POST \
  http://localhost:3001/api/admin/users/123e4567-e89b-12d3-a456-426614174000/complete-onboarding \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Bank: First Bank of Nigeria, Account: 1234567890, PayPal: user@example.com, Payment method verified"
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Onboarding completed successfully",
  "data": {
    "userId": "123e4567-e89b-12d3-a456-426614174000",
    "onboardingStatus": "completed",
    "onboardingRequest": {
      "id": "onboarding-request-uuid",
      "status": "completed",
      "completedAt": "2025-12-09T11:00:00Z",
      "completedBy": "admin-uuid-here",
      "notes": "Bank: First Bank of Nigeria, Account: 1234567890, PayPal: user@example.com, Payment method verified"
    }
  }
}
```

**What Happens When Completed**:
- User's `onboardingStatus` is updated to `completed`
- If user has a pending onboarding request, it's marked as `completed`
- If no onboarding request exists, one is created automatically
- Onboarding notes are saved for record keeping
- User can now:
  - Submit credit requests
  - Request payouts
  - Access all platform features

**Error Responses**:
- `400 Bad Request`: User is already onboarded
- `401 Unauthorized`: Invalid or missing JWT token
- `403 Forbidden`: User does not have admin role
- `404 Not Found`: User not found

**Important Notes**:
- Onboarding notes are required and should include:
  - Bank account details (bank name, account number)
  - Payment methods set up (PayPal, bank transfer, etc.)
  - Any other relevant information for record keeping
- Once onboarded, users can submit credit requests and request payouts
- The system automatically creates an onboarding request if the user hasn't submitted one

---

## 2. Get User Details (with Onboarding Info)

**Endpoint**: `GET /api/admin/users/:id`

**Description**: Get detailed user information including their latest onboarding request details.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | Yes | User ID |

**Example Request**:
```bash
GET /api/admin/users/123e4567-e89b-12d3-a456-426614174000
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "username": "user_1234",
    "phone": "+1234567890",
    "balance": 1000.00,
    "status": "active",
    "onboardingStatus": "pending",
    "emailVerified": true,
    "walletStatus": "active",
    "joinedAt": "2025-12-09T10:00:00Z",
    "createdAt": "2025-12-09T10:00:00Z",
    "updatedAt": "2025-12-09T10:00:00Z",
    "onboardingRequest": {
      "id": "onboarding-request-uuid",
      "message": "I need help setting up my payment method",
      "status": "pending",
      "submittedAt": "2025-12-09T10:30:00Z",
      "completedAt": null,
      "notes": null
    }
  }
}
```

**Response (200 OK) - Completed Onboarding**:
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "username": "user_1234",
    "phone": "+1234567890",
    "balance": 1000.00,
    "status": "active",
    "onboardingStatus": "completed",
    "emailVerified": true,
    "walletStatus": "active",
    "joinedAt": "2025-12-09T10:00:00Z",
    "createdAt": "2025-12-09T10:00:00Z",
    "updatedAt": "2025-12-09T11:00:00Z",
    "onboardingRequest": {
      "id": "onboarding-request-uuid",
      "message": "I need help setting up my payment method",
      "status": "completed",
      "submittedAt": "2025-12-09T10:30:00Z",
      "completedAt": "2025-12-09T11:00:00Z",
      "notes": "Bank: First Bank of Nigeria, Account: 1234567890, PayPal: user@example.com"
    }
  }
}
```

**Response Fields**:
| Field | Type | Description |
|-------|------|-------------|
| `onboardingStatus` | string | User's onboarding status: `pending` or `completed` |
| `onboardingRequest` | object \| null | Latest onboarding request details |
| `onboardingRequest.id` | string (UUID) | Onboarding request ID |
| `onboardingRequest.message` | string \| null | User's message (if provided) |
| `onboardingRequest.status` | string | Request status: `pending` or `completed` |
| `onboardingRequest.submittedAt` | string (ISO 8601) | When the request was submitted |
| `onboardingRequest.completedAt` | string (ISO 8601) \| null | When admin completed the onboarding |
| `onboardingRequest.notes` | string \| null | Admin notes (bank account, payment methods, etc.) |

**Error Responses**:
- `401 Unauthorized`: Invalid or missing JWT token
- `403 Forbidden`: User does not have admin role
- `404 Not Found`: User not found

---

## 3. List Users (Filter by Onboarding Status)

**Endpoint**: `GET /api/admin/users`

**Description**: List all users with pagination and optional filtering by onboarding status. Useful for finding users who need onboarding.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number for pagination |
| `limit` | number | No | 10 | Number of items per page (max 50) |
| `status` | string | No | `all` | Filter by user status: `all`, `active`, `suspended` |
| `onboardingStatus` | string | No | `all` | Filter by onboarding status: `all`, `pending`, `completed` |
| `search` | string | No | - | Search by email, name, phone, or username |

**Example Request**:
```bash
GET /api/admin/users?page=1&limit=10&onboardingStatus=pending
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user-uuid",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "username": "user_1234",
        "phone": "+1234567890",
        "balance": 0.00,
        "status": "active",
        "onboardingStatus": "pending",
        "emailVerified": true,
        "walletStatus": "active",
        "joinedAt": "2025-12-09T10:00:00Z",
        "createdAt": "2025-12-09T10:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 47,
      "itemsPerPage": 10
    }
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing JWT token
- `403 Forbidden`: User does not have admin role

**Use Cases**:
- Find all users who need onboarding: `?onboardingStatus=pending`
- Find all onboarded users: `?onboardingStatus=completed`
- Search for specific user: `?search=user@example.com`

---

## Workflow Example

### Complete Onboarding Flow

1. **Admin views users needing onboarding**:
   ```
   GET /api/admin/users?onboardingStatus=pending
   ```

2. **Admin views specific user details**:
   ```
   GET /api/admin/users/:id
   ```

3. **Admin reviews user's onboarding request** (if submitted):
   - Check `onboardingRequest.message` for user's request
   - Review user's profile information

4. **Admin sets up payment method** (offline):
   - Set up bank account or PayPal
   - Install payment method on user's device
   - Schedule meeting if needed

5. **Admin completes onboarding with notes**:
   ```
   POST /api/admin/users/:id/complete-onboarding
   Body: {
     "notes": "Bank: First Bank, Account: 1234567890, PayPal: user@example.com, Payment verified on 2025-12-09"
   }
   ```

6. **User can now**:
   - Submit credit requests
   - Request payouts
   - Access all features

---

## Status Codes Summary

| Status Code | Description |
|-------------|-------------|
| `200 OK` | Request successful |
| `400 Bad Request` | Invalid request data or business rule violation |
| `401 Unauthorized` | Missing or invalid authentication token |
| `403 Forbidden` | User does not have required admin role |
| `404 Not Found` | User not found |

---

## Business Rules

1. **Onboarding Notes Required**: Admin must provide notes when completing onboarding
2. **One-Time Process**: Users can only be onboarded once (status changes from `pending` to `completed`)
3. **Automatic Request Creation**: If user hasn't submitted an onboarding request, one is created automatically when admin completes onboarding
4. **Record Keeping**: Onboarding notes should include:
   - Bank account details (bank name, account number)
   - Payment methods (PayPal, bank transfer, etc.)
   - Any other relevant information
5. **Feature Access**: Once onboarded, users can:
   - Submit credit requests
   - Request payouts
   - Access all platform features

---

## Testing Notes

1. **Test onboarding completion**:
   - Complete onboarding for pending user
   - Check user's onboarding status is updated
   - Verify onboarding request is marked as completed
   - Try to complete onboarding for already onboarded user (should fail)

2. **Test user listing**:
   - List users with `onboardingStatus=pending` (should show only pending users)
   - List users with `onboardingStatus=completed` (should show only completed users)
   - Search for users by email/name

3. **Test edge cases**:
   - Complete onboarding without notes (should fail - notes required)
   - Complete onboarding for user who never submitted request (should create request automatically)
   - View user details before and after onboarding completion

---

**Last Updated**: 2025-12-09

