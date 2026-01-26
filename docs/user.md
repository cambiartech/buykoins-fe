# User Module - API Documentation

## Overview
This document describes the User module endpoints for the BuyTikTokCoins platform. All endpoints require JWT authentication.

**Base URL**: `http://localhost:3001/api` (Development)  
**Authentication**: All endpoints require `Authorization: Bearer <token>` header

---

## Endpoints

### 1. Get User Dashboard

**Endpoint:** `GET /api/user/dashboard`

**Description:** Get user dashboard overview including balance, onboarding status, recent transactions, and current credit request status.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890",
      "username": "user_1234",
      "onboardingStatus": "completed",
      "balance": 1250.50,
      "emailVerified": true
    },
    "creditRequest": {
      "status": "none",
      "amount": null,
      "submittedAt": null
    },
    "recentTransactions": [
      {
        "id": "uuid",
        "type": "credit",
        "amount": 500.00,
        "date": "2024-01-15T10:30:00Z",
        "status": "completed",
        "description": "Credit from TikTok earnings"
      }
    ],
    "todayRate": {
      "usdToNgn": 1500.00,
      "lastUpdated": "2024-01-20T10:00:00Z"
    }
  }
}
```

**Credit Request Status Values:**
- `"none"` - No credit request exists
- `"pending"` - Credit request is pending approval
- `"sent"` - Credit request was approved
- `"rejected"` - Credit request was rejected

**Transaction Types:**
- `"credit"` - Money credited to account
- `"withdrawal"` - Withdrawal request
- `"payout"` - Payout transaction

**Transaction Status Values:**
- `"completed"` - Transaction completed
- `"pending"` - Transaction pending
- `"rejected"` - Transaction rejected

**Onboarding Status Values:**
- `"pending"` - Onboarding not completed
- `"completed"` - Onboarding completed

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: User not found

---

### 2. Get User Profile

**Endpoint:** `GET /api/user/profile`

**Description:** Get complete user profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "username": "user_1234",
    "phone": "+1234567890",
    "emailVerified": true,
    "onboardingStatus": "completed",
    "balance": 1250.50,
    "status": "active",
    "walletStatus": "active",
    "joinedAt": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T10:30:00Z"
  }
}
```

**User Status Values:**
- `"active"` - User account is active
- `"suspended"` - User account is suspended
- `"frozen"` - User account is frozen

**Wallet Status Values:**
- `"active"` - Wallet is active
- `"frozen"` - Wallet is frozen

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: User not found

---

### 3. Update User Profile

**Endpoint:** `PATCH /api/user/profile`

**Description:** Update user profile information (firstName, lastName, phone).

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Validation Rules:**
- `firstName`: Optional, string, 1-100 characters
- `lastName`: Optional, string, 1-100 characters
- `phone`: Optional, valid phone number format (international format with +)

**Note:** All fields are optional. Only provided fields will be updated.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "username": "user_1234",
    "phone": "+1234567890",
    "emailVerified": true,
    "onboardingStatus": "completed",
    "balance": 1250.50,
    "status": "active",
    "walletStatus": "active",
    "joinedAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-20T10:30:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors (invalid phone number format, etc.)
- `401 Unauthorized`: Invalid or missing token
- `404 Not Found`: User not found

**Example Request:**
```bash
curl -X PATCH http://localhost:3001/api/user/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe"
  }'
```

---

## Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

To obtain a token:
1. Sign up: `POST /api/auth/signup`
2. Verify email: `POST /api/auth/verify-email`
3. Login: `POST /api/auth/login`

---

## Response Format

All endpoints follow a consistent response format:

**Success Response:**
```json
{
  "success": true,
  "message": "Optional success message",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "error": "Error type",
  "statusCode": 400
}
```

---

## Data Types

- **UUID**: String format (e.g., "550e8400-e29b-41d4-a716-446655440000")
- **Decimal**: Number format (e.g., 1250.50)
- **Date**: ISO 8601 format (e.g., "2024-01-20T10:30:00Z")
- **Boolean**: true/false

---

## Rate Limiting

All endpoints are subject to rate limiting:
- Default: 100 requests per 60 seconds per IP
- Rate limit headers are included in responses

---

## Swagger Documentation

Interactive API documentation is available at:
- Development: `http://localhost:3001/api/docs`

You can test endpoints directly from the Swagger UI.

---

## Notes

1. **Balance**: Stored in USD. Conversion to NGN uses the current exchange rate from `todayRate.usdToNgn`.

2. **Recent Transactions**: Returns the last 10 transactions ordered by date (newest first).

3. **Credit Request Status**: 
   - If no credit request exists, `status` will be `"none"` and `amount`/`submittedAt` will be `null`
   - If a credit request exists, it shows the latest one

4. **Exchange Rate**: Currently hardcoded at 1500.00 NGN per USD. Will be dynamic when admin settings module is implemented.

5. **Profile Updates**: 
   - Email cannot be changed via this endpoint
   - Username is auto-generated and cannot be changed
   - Password changes require a separate endpoint (to be implemented)

---

## Support

For issues or questions, contact the backend team.

**Last Updated**: 2025-12-07

