# BuyTikTokCoins - Backend API Documentation

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [User Endpoints](#user-endpoints)
4. [Admin Endpoints](#admin-endpoints)
5. [Data Models](#data-models)
6. [Error Handling](#error-handling)

---

## Overview

This document describes the backend API requirements for the BuyTikTokCoins platform. The platform enables TikTok creators to withdraw their earnings through a secure agency system.

### Base URL
```
Production: https://api.buytiktokcoins.com
Development: http://localhost:3001
```

### Authentication
Most endpoints require authentication via JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication

### 1. User Signup

**Endpoint:** `POST /api/auth/signup`

**Description:** Register a new user account with email verification.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "phone": "+1234567890"
}
```

**Validation Rules:**
- `email`: Required, valid email format, unique
- `password`: Required, minimum 6 characters
- `phone`: Required, valid phone number format (supports international format with +)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Account created successfully. Please check your email for verification code.",
  "data": {
    "userId": "user_123456",
    "email": "user@example.com",
    "phone": "+1234567890",
    "verificationCodeSent": true,
    "verificationExpiresAt": "2024-01-20T12:00:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors
- `409 Conflict`: Email already exists

---

### 2. Verify Email (Signup)

**Endpoint:** `POST /api/auth/verify-email`

**Description:** Verify user email with the code sent during signup.

**Request Body:**
```json
{
  "email": "user@example.com",
  "verificationCode": "123456"
}
```

**Validation Rules:**
- `email`: Required, valid email format
- `verificationCode`: Required, 6-digit numeric code

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "userId": "user_123456",
    "email": "user@example.com",
    "emailVerified": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid or expired verification code
- `404 Not Found`: Email not found

**Notes:**
- Verification code expires after 15 minutes
- Code should be 6 digits (numeric)
- After 3 failed attempts, user must request a new code

---

### 3. Resend Verification Code

**Endpoint:** `POST /api/auth/resend-verification`

**Description:** Resend email verification code.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Verification code resent successfully",
  "data": {
    "verificationExpiresAt": "2024-01-20T12:15:00Z"
  }
}
```

**Rate Limiting:**
- Maximum 3 resend requests per hour per email

---

### 4. User Login

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticate user and return JWT tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "rememberMe": false
}
```

**Validation Rules:**
- `email`: Required, valid email format
- `password`: Required, minimum 6 characters
- `rememberMe`: Optional boolean (default: false)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "user": {
      "id": "user_123456",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890",
      "onboardingStatus": "completed",
      "balance": 1250.50,
      "emailVerified": true
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid credentials
- `403 Forbidden`: Email not verified

---

### 5. Social Login (Google/TikTok)

**Endpoint:** `POST /api/auth/social-login`

**Description:** Authenticate user via OAuth provider.

**Request Body:**
```json
{
  "provider": "google", // or "tiktok"
  "accessToken": "oauth_access_token",
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "user": {
      "id": "user_123456",
      "email": "user@example.com",
      "firstName": "John",
      "onboardingStatus": "completed",
      "balance": 1250.50
    }
  }
}
```

---

### 6. Refresh Token

**Endpoint:** `POST /api/auth/refresh`

**Description:** Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "new_refresh_token_here"
  }
}
```

---

### 7. Admin Login

**Endpoint:** `POST /api/admin/auth/login`

**Description:** Authenticate admin user.

**Request Body:**
```json
{
  "email": "admin@buytiktokcoins.com",
  "password": "admin_password"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "admin": {
      "id": "admin_123",
      "email": "admin@buytiktokcoins.com",
      "role": "super_admin", // "admin" | "super_admin"
      "permissions": ["settings", "admin_management"],
      "firstName": "Admin",
      "lastName": "User"
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid credentials
- `403 Forbidden`: Insufficient permissions

---

## User Endpoints

### 1. Get User Dashboard

**Endpoint:** `GET /api/user/dashboard`

**Description:** Get user dashboard overview including balance, onboarding status, and recent transactions.

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
      "id": "user_123456",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890",
      "onboardingStatus": "completed", // "pending" | "completed"
      "balance": 1250.50,
      "emailVerified": true
    },
    "creditRequest": {
      "status": "none", // "none" | "pending" | "sent" | "rejected"
      "amount": null,
      "submittedAt": null
    },
    "recentTransactions": [
      {
        "id": "txn_1",
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

---

### 2. Create Credit Request

**Endpoint:** `POST /api/user/credit-request`

**Description:** Submit a new credit request with proof of TikTok earnings.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
amount: 500.00
proof: <file> (image or PDF)
```

**Validation Rules:**
- `amount`: Required, positive number, minimum 1.00
- `proof`: Required, file (image: jpg, jpeg, png, webp) or PDF, max 10MB

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Credit request submitted successfully",
  "data": {
    "id": "credit_req_123",
    "userId": "user_123456",
    "amount": 500.00,
    "status": "pending",
    "submittedAt": "2024-01-20T10:30:00Z",
    "proofUrl": "https://storage.example.com/proofs/credit_req_123.jpg"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Validation errors or invalid file
- `403 Forbidden`: User not onboarded
- `409 Conflict`: User already has a pending credit request

---

### 3. Get Credit Request Status

**Endpoint:** `GET /api/user/credit-request/status`

**Description:** Get current credit request status.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "pending", // "none" | "pending" | "sent" | "rejected"
    "amount": 500.00,
    "submittedAt": "2024-01-20T10:30:00Z",
    "processedAt": null,
    "rejectionReason": null
  }
}
```

---

### 4. Request Onboarding

**Endpoint:** `POST /api/user/onboarding/request`

**Description:** Request onboarding assistance from admin.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "message": "I need help setting up my TikTok account connection"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Onboarding request submitted successfully",
  "data": {
    "id": "onboarding_req_123",
    "userId": "user_123456",
    "status": "pending",
    "submittedAt": "2024-01-20T10:30:00Z"
  }
}
```

**Error Responses:**
- `409 Conflict`: User already has a pending onboarding request

---

### 5. Get Onboarding Status

**Endpoint:** `GET /api/user/onboarding/status`

**Description:** Get user onboarding status.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "pending", // "pending" | "completed"
    "requestId": "onboarding_req_123",
    "submittedAt": "2024-01-20T10:30:00Z",
    "completedAt": null
  }
}
```

---

### 6. Initiate Withdrawal

**Endpoint:** `POST /api/user/withdrawal`

**Description:** Request withdrawal to bank account.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "amount": 250.00,
  "bankAccountId": "bank_acc_123"
}
```

**Validation Rules:**
- `amount`: Required, positive number, must be <= available balance
- `bankAccountId`: Required if bank account required setting is enabled

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Withdrawal request submitted successfully",
  "data": {
    "id": "withdrawal_123",
    "userId": "user_123456",
    "amount": 250.00,
    "amountInNgn": 375000.00,
    "processingFee": 50.00,
    "netAmount": 374950.00,
    "status": "pending",
    "requestedAt": "2024-01-20T10:30:00Z",
    "estimatedCompletion": "2024-01-22T10:30:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Insufficient balance or validation errors
- `403 Forbidden`: Bank account not linked (if required)

---

### 7. Get Transactions

**Endpoint:** `GET /api/user/transactions`

**Description:** Get user transaction history with pagination and search.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 50)
- `search`: Search query (searches description and amount)
- `type`: Filter by type ("credit" | "withdrawal" | "pending")
- `status`: Filter by status ("completed" | "pending" | "rejected")

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "txn_1",
        "type": "credit",
        "amount": 500.00,
        "date": "2024-01-15T10:30:00Z",
        "status": "completed",
        "description": "Credit from TikTok earnings"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
}
```

---

### 8. Get User Profile

**Endpoint:** `GET /api/user/profile`

**Description:** Get user profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "user_123456",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "emailVerified": true,
    "onboardingStatus": "completed",
    "balance": 1250.50,
    "joinedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### 9. Update User Profile

**Endpoint:** `PUT /api/user/profile`

**Description:** Update user profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "user_123456",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  }
}
```

---

### 10. Get Today's Exchange Rate

**Endpoint:** `GET /api/user/exchange-rate`

**Description:** Get current USD to NGN exchange rate.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "usdToNgn": 1500.00,
    "lastUpdated": "2024-01-20T10:00:00Z"
  }
}
```

---

## Admin Endpoints

### 1. Get Admin Dashboard

**Endpoint:** `GET /api/admin/dashboard`

**Description:** Get admin dashboard overview with statistics.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "statistics": {
      "pendingRequests": 12,
      "onboardingRequests": 5,
      "totalUsers": 1234,
      "totalTransactions": 8456,
      "pendingPayouts": 8
    }
  }
}
```

---

### 2. Get Credit Requests

**Endpoint:** `GET /api/admin/credit-requests`

**Description:** Get all credit requests with filtering and pagination.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 50)
- `search`: Search by username or user ID
- `status`: Filter by status ("all" | "pending" | "approved" | "rejected")

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": "credit_req_123",
        "userId": "user_123456",
        "username": "@creator123",
        "userEmail": "user@example.com",
        "amount": 500.00,
        "proofUrl": "https://storage.example.com/proofs/credit_req_123.jpg",
        "status": "pending",
        "submittedAt": "2024-01-20T10:30:00Z",
        "processedAt": null,
        "processedBy": null,
        "rejectionReason": null
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
}
```

---

### 3. Approve Credit Request

**Endpoint:** `POST /api/admin/credit-requests/:id/approve`

**Description:** Approve a credit request and credit user's balance.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "notes": "Verified proof of earnings"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Credit request approved successfully",
  "data": {
    "id": "credit_req_123",
    "status": "approved",
    "processedAt": "2024-01-20T11:00:00Z",
    "processedBy": "admin_123",
    "userBalance": 1750.50
  }
}
```

**Error Responses:**
- `400 Bad Request`: Request already processed
- `404 Not Found`: Credit request not found

---

### 4. Reject Credit Request

**Endpoint:** `POST /api/admin/credit-requests/:id/reject`

**Description:** Reject a credit request.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "reason": "Proof of earnings is unclear or invalid"
}
```

**Validation Rules:**
- `reason`: Required, minimum 10 characters

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Credit request rejected",
  "data": {
    "id": "credit_req_123",
    "status": "rejected",
    "processedAt": "2024-01-20T11:00:00Z",
    "processedBy": "admin_123",
    "rejectionReason": "Proof of earnings is unclear or invalid"
  }
}
```

---

### 5. View Credit Request

**Endpoint:** `GET /api/admin/credit-requests/:id`

**Description:** Get detailed information about a specific credit request.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "credit_req_123",
    "userId": "user_123456",
    "user": {
      "id": "user_123456",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890"
    },
    "amount": 500.00,
    "proofUrl": "https://storage.example.com/proofs/credit_req_123.jpg",
    "status": "pending",
    "submittedAt": "2024-01-20T10:30:00Z",
    "processedAt": null,
    "processedBy": null,
    "rejectionReason": null
  }
}
```

---

### 6. Get Onboarding Requests

**Endpoint:** `GET /api/admin/onboarding-requests`

**Description:** Get all onboarding requests with filtering and pagination.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 50)
- `search`: Search by name, email, or phone
- `status`: Filter by status ("all" | "pending" | "completed")

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": "onboarding_req_123",
        "userId": "user_123456",
        "name": "John Doe",
        "email": "user@example.com",
        "phone": "+1234567890",
        "status": "pending",
        "submittedAt": "2024-01-20T10:30:00Z",
        "completedAt": null,
        "completedBy": null
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 10
    }
  }
}
```

---

### 7. Complete Onboarding

**Endpoint:** `POST /api/admin/onboarding-requests/:id/complete`

**Description:** Mark onboarding request as completed.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "notes": "Successfully connected TikTok account and verified payment method"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Onboarding completed successfully",
  "data": {
    "id": "onboarding_req_123",
    "status": "completed",
    "completedAt": "2024-01-20T11:00:00Z",
    "completedBy": "admin_123"
  }
}
```

---

### 8. Get Payout Requests

**Endpoint:** `GET /api/admin/payouts`

**Description:** Get all payout requests with filtering and pagination.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 50)
- `search`: Search by username or user ID
- `status`: Filter by status ("all" | "pending" | "processing" | "completed" | "rejected")

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "payouts": [
      {
        "id": "withdrawal_123",
        "userId": "user_123456",
        "username": "@creator123",
        "userEmail": "user@example.com",
        "amount": 250.00,
        "amountInNgn": 375000.00,
        "processingFee": 50.00,
        "netAmount": 374950.00,
        "bankAccount": {
          "accountNumber": "1234567890",
          "accountName": "John Doe",
          "bankName": "First Bank",
          "bankCode": "011"
        },
        "status": "pending",
        "requestedAt": "2024-01-20T10:30:00Z",
        "processedAt": null,
        "completedAt": null,
        "processedBy": null
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "itemsPerPage": 10
    }
  }
}
```

---

### 9. Approve Payout

**Endpoint:** `POST /api/admin/payouts/:id/approve`

**Description:** Approve a payout request and initiate bank transfer.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "notes": "Approved for processing"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Payout approved and processing initiated",
  "data": {
    "id": "withdrawal_123",
    "status": "processing",
    "processedAt": "2024-01-20T11:00:00Z",
    "processedBy": "admin_123",
    "estimatedCompletion": "2024-01-22T11:00:00Z"
  }
}
```

---

### 10. Reject Payout

**Endpoint:** `POST /api/admin/payouts/:id/reject`

**Description:** Reject a payout request.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "reason": "Bank account details do not match user information"
}
```

**Validation Rules:**
- `reason`: Required, minimum 10 characters

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Payout rejected",
  "data": {
    "id": "withdrawal_123",
    "status": "rejected",
    "processedAt": "2024-01-20T11:00:00Z",
    "processedBy": "admin_123",
    "rejectionReason": "Bank account details do not match user information"
  }
}
```

---

### 11. Mark Payout as Completed

**Endpoint:** `POST /api/admin/payouts/:id/complete`

**Description:** Mark a payout as completed after bank transfer is confirmed.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "transactionReference": "TXN123456789",
  "notes": "Transfer completed successfully"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Payout marked as completed",
  "data": {
    "id": "withdrawal_123",
    "status": "completed",
    "completedAt": "2024-01-20T12:00:00Z",
    "transactionReference": "TXN123456789"
  }
}
```

---

### 12. Get Users

**Endpoint:** `GET /api/admin/users`

**Description:** Get all users with filtering and pagination.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 50)
- `search`: Search by name, email, phone, or user ID
- `status`: Filter by status ("all" | "active" | "suspended" | "frozen")

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_123456",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "phone": "+1234567890",
        "balance": 1250.50,
        "status": "active", // "active" | "suspended" | "frozen"
        "onboardingStatus": "completed",
        "emailVerified": true,
        "joinedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 100,
      "itemsPerPage": 10
    }
  }
}
```

---

### 13. Suspend User

**Endpoint:** `POST /api/admin/users/:id/suspend`

**Description:** Suspend a user account.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "reason": "Violation of terms of service"
}
```

**Validation Rules:**
- `reason`: Required, minimum 10 characters

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User suspended successfully",
  "data": {
    "id": "user_123456",
    "status": "suspended",
    "suspendedAt": "2024-01-20T11:00:00Z",
    "suspendedBy": "admin_123"
  }
}
```

---

### 14. Unsuspend User

**Endpoint:** `POST /api/admin/users/:id/unsuspend`

**Description:** Unsuspend a user account.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User unsuspended successfully",
  "data": {
    "id": "user_123456",
    "status": "active"
  }
}
```

---

### 15. Freeze User Wallet

**Endpoint:** `POST /api/admin/users/:id/freeze-wallet`

**Description:** Freeze user wallet to prevent withdrawals.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "reason": "Suspicious activity detected"
}
```

**Validation Rules:**
- `reason`: Required, minimum 10 characters

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User wallet frozen successfully",
  "data": {
    "id": "user_123456",
    "walletStatus": "frozen",
    "frozenAt": "2024-01-20T11:00:00Z",
    "frozenBy": "admin_123"
  }
}
```

---

### 16. Unfreeze User Wallet

**Endpoint:** `POST /api/admin/users/:id/unfreeze-wallet`

**Description:** Unfreeze user wallet.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User wallet unfrozen successfully",
  "data": {
    "id": "user_123456",
    "walletStatus": "active"
  }
}
```

---

### 17. Get User Details

**Endpoint:** `GET /api/admin/users/:id`

**Description:** Get detailed information about a specific user.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "user_123456",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "balance": 1250.50,
    "status": "active",
    "onboardingStatus": "completed",
    "emailVerified": true,
    "joinedAt": "2024-01-01T00:00:00Z",
    "creditRequests": [
      {
        "id": "credit_req_123",
        "amount": 500.00,
        "status": "approved",
        "submittedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "payouts": [
      {
        "id": "withdrawal_123",
        "amount": 250.00,
        "status": "completed",
        "requestedAt": "2024-01-10T10:30:00Z"
      }
    ]
  }
}
```

---

### 18. Get All Transactions

**Endpoint:** `GET /api/admin/transactions`

**Description:** Get all platform transactions with filtering and pagination.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 50)
- `search`: Search by user email, username, or transaction ID
- `type`: Filter by type ("all" | "credit" | "withdrawal" | "payout")

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "txn_1",
        "userId": "user_123456",
        "userEmail": "user@example.com",
        "username": "@creator123",
        "type": "credit",
        "amount": 500.00,
        "status": "completed",
        "date": "2024-01-15T10:30:00Z",
        "description": "Credit from TikTok earnings"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 50,
      "totalItems": 500,
      "itemsPerPage": 10
    }
  }
}
```

---

### 19. Get Admin Management

**Endpoint:** `GET /api/admin/admins`

**Description:** Get all admin accounts with their roles and permissions.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Required Permissions:** `admin_management`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 50)
- `search`: Search by email or name
- `role`: Filter by role ("all" | "admin" | "super_admin")

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "admins": [
      {
        "id": "admin_123",
        "email": "admin@buytiktokcoins.com",
        "firstName": "Admin",
        "lastName": "User",
        "role": "super_admin", // "admin" | "super_admin"
        "permissions": ["settings", "admin_management"],
        "status": "active", // "active" | "disabled"
        "createdAt": "2024-01-01T00:00:00Z",
        "lastLoginAt": "2024-01-20T10:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 15,
      "itemsPerPage": 10
    }
  }
}
```

---

### 20. Create Admin

**Endpoint:** `POST /api/admin/admins`

**Description:** Create a new admin account.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Required Permissions:** `admin_management`

**Request Body:**
```json
{
  "email": "newadmin@buytiktokcoins.com",
  "password": "secure_password",
  "firstName": "New",
  "lastName": "Admin",
  "role": "admin",
  "permissions": ["settings"]
}
```

**Validation Rules:**
- `email`: Required, valid email format, unique
- `password`: Required, minimum 8 characters
- `firstName`: Required
- `lastName`: Required
- `role`: Required, "admin" or "super_admin"
- `permissions`: Optional array of permission strings

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Admin created successfully",
  "data": {
    "id": "admin_456",
    "email": "newadmin@buytiktokcoins.com",
    "firstName": "New",
    "lastName": "Admin",
    "role": "admin",
    "permissions": ["settings"],
    "status": "active"
  }
}
```

---

### 21. Update Admin

**Endpoint:** `PUT /api/admin/admins/:id`

**Description:** Update admin account details, role, or permissions.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Required Permissions:** `admin_management`

**Request Body:**
```json
{
  "firstName": "Updated",
  "lastName": "Admin",
  "role": "super_admin",
  "permissions": ["settings", "admin_management"]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Admin updated successfully",
  "data": {
    "id": "admin_456",
    "email": "newadmin@buytiktokcoins.com",
    "firstName": "Updated",
    "lastName": "Admin",
    "role": "super_admin",
    "permissions": ["settings", "admin_management"]
  }
}
```

---

### 22. Disable Admin

**Endpoint:** `POST /api/admin/admins/:id/disable`

**Description:** Disable an admin account.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Required Permissions:** `admin_management`

**Request Body:**
```json
{
  "reason": "No longer needed"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Admin disabled successfully",
  "data": {
    "id": "admin_456",
    "status": "disabled"
  }
}
```

---

### 23. Enable Admin

**Endpoint:** `POST /api/admin/admins/:id/enable`

**Description:** Enable a disabled admin account.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Required Permissions:** `admin_management`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Admin enabled successfully",
  "data": {
    "id": "admin_456",
    "status": "active"
  }
}
```

---

### 24. Get Platform Settings

**Endpoint:** `GET /api/admin/settings`

**Description:** Get current platform settings.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Required Permissions:** `settings`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "exchangeRate": {
      "usdToNgn": 1500.00,
      "lastUpdated": "2024-01-20T10:00:00Z"
    },
    "payoutSettings": {
      "minPayout": 1000.00,
      "maxPayout": 1000000.00,
      "processingFee": 50.00,
      "processingTime": "24-48 hours",
      "bankAccountRequired": true
    },
    "platformSettings": {
      "maintenanceMode": false,
      "allowNewRegistrations": true,
      "requireKYC": true,
      "autoApproveCredits": false
    }
  }
}
```

---

### 25. Update Platform Settings

**Endpoint:** `PUT /api/admin/settings`

**Description:** Update platform settings.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Required Permissions:** `settings`

**Request Body:**
```json
{
  "exchangeRate": {
    "usdToNgn": 1520.00
  },
  "payoutSettings": {
    "minPayout": 1000.00,
    "maxPayout": 1000000.00,
    "processingFee": 50.00,
    "processingTime": "24-48 hours",
    "bankAccountRequired": true
  },
  "platformSettings": {
    "maintenanceMode": false,
    "allowNewRegistrations": true,
    "requireKYC": true,
    "autoApproveCredits": false
  }
}
```

**Validation Rules:**
- `exchangeRate.usdToNgn`: Required, positive number
- `payoutSettings.minPayout`: Required, positive number, must be < maxPayout
- `payoutSettings.maxPayout`: Required, positive number, must be > minPayout
- `payoutSettings.processingFee`: Required, non-negative number
- `payoutSettings.processingTime`: Required string
- `payoutSettings.bankAccountRequired`: Required boolean
- `platformSettings.maintenanceMode`: Required boolean
- `platformSettings.allowNewRegistrations`: Required boolean
- `platformSettings.requireKYC`: Required boolean
- `platformSettings.autoApproveCredits`: Required boolean

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "data": {
    "exchangeRate": {
      "usdToNgn": 1520.00,
      "lastUpdated": "2024-01-20T11:00:00Z"
    },
    "payoutSettings": {
      "minPayout": 1000.00,
      "maxPayout": 1000000.00,
      "processingFee": 50.00,
      "processingTime": "24-48 hours",
      "bankAccountRequired": true
    },
    "platformSettings": {
      "maintenanceMode": false,
      "allowNewRegistrations": true,
      "requireKYC": true,
      "autoApproveCredits": false
    }
  }
}
```

---

## Data Models

### User Model
```typescript
interface User {
  id: string
  email: string
  password: string // hashed
  firstName: string
  lastName: string
  phone: string
  emailVerified: boolean
  verificationCode?: string
  verificationCodeExpiresAt?: Date
  onboardingStatus: "pending" | "completed"
  balance: number // in USD
  status: "active" | "suspended" | "frozen"
  walletStatus: "active" | "frozen"
  joinedAt: Date
  createdAt: Date
  updatedAt: Date
}
```

### Credit Request Model
```typescript
interface CreditRequest {
  id: string
  userId: string
  amount: number // in USD
  proofUrl: string
  status: "pending" | "approved" | "rejected"
  submittedAt: Date
  processedAt?: Date
  processedBy?: string // admin ID
  rejectionReason?: string
  createdAt: Date
  updatedAt: Date
}
```

### Onboarding Request Model
```typescript
interface OnboardingRequest {
  id: string
  userId: string
  message?: string
  status: "pending" | "completed"
  submittedAt: Date
  completedAt?: Date
  completedBy?: string // admin ID
  notes?: string
  createdAt: Date
  updatedAt: Date
}
```

### Payout/Withdrawal Model
```typescript
interface Payout {
  id: string
  userId: string
  amount: number // in USD
  amountInNgn: number
  processingFee: number // in NGN
  netAmount: number // in NGN
  bankAccount: {
    accountNumber: string
    accountName: string
    bankName: string
    bankCode: string
  }
  status: "pending" | "processing" | "completed" | "rejected"
  requestedAt: Date
  processedAt?: Date
  completedAt?: Date
  processedBy?: string // admin ID
  transactionReference?: string
  rejectionReason?: string
  createdAt: Date
  updatedAt: Date
}
```

### Transaction Model
```typescript
interface Transaction {
  id: string
  userId: string
  type: "credit" | "withdrawal" | "payout"
  amount: number
  status: "completed" | "pending" | "rejected"
  description: string
  date: Date
  createdAt: Date
}
```

### Admin Model
```typescript
interface Admin {
  id: string
  email: string
  password: string // hashed
  firstName: string
  lastName: string
  role: "admin" | "super_admin"
  permissions: string[]
  status: "active" | "disabled"
  createdAt: Date
  lastLoginAt?: Date
  updatedAt: Date
}
```

### Platform Settings Model
```typescript
interface PlatformSettings {
  exchangeRate: {
    usdToNgn: number
    lastUpdated: Date
  }
  payoutSettings: {
    minPayout: number // in NGN
    maxPayout: number // in NGN
    processingFee: number // in NGN
    processingTime: string
    bankAccountRequired: boolean
  }
  platformSettings: {
    maintenanceMode: boolean
    allowNewRegistrations: boolean
    requireKYC: boolean
    autoApproveCredits: boolean
  }
}
```

---

## Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "message": "Error message here",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### HTTP Status Codes
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Validation errors or invalid request
- `401 Unauthorized`: Authentication required or invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists or conflict
- `422 Unprocessable Entity`: Validation errors
- `500 Internal Server Error`: Server error

### Common Error Messages
- `"Email is required"`
- `"Invalid email format"`
- `"Email already exists"`
- `"Password must be at least 6 characters"`
- `"Invalid credentials"`
- `"Email not verified"`
- `"Verification code expired"`
- `"Invalid verification code"`
- `"Insufficient balance"`
- `"User not onboarded"`
- `"Credit request already pending"`
- `"Unauthorized access"`
- `"Resource not found"`

---

## Additional Notes

### Email Verification
- Verification codes are 6-digit numeric codes
- Codes expire after 15 minutes
- Maximum 3 verification attempts before requiring a new code
- Codes should be sent via email using a reliable email service

### File Uploads
- Credit request proofs: Images (jpg, jpeg, png, webp) or PDF
- Maximum file size: 10MB
- Files should be stored securely (e.g., AWS S3, Cloudinary)
- Generate unique file names to prevent conflicts

### Security Considerations
- All passwords must be hashed (use bcrypt or similar)
- JWT tokens should have expiration (e.g., 24 hours for access, 7 days for refresh)
- Implement rate limiting on authentication endpoints
- Use HTTPS in production
- Validate and sanitize all user inputs
- Implement CORS properly

### Rate Limiting
- Signup: 5 requests per hour per IP
- Login: 10 requests per hour per IP
- Verification code resend: 3 requests per hour per email
- API endpoints: 100 requests per minute per user

### Pagination
- Default page size: 10 items
- Maximum page size: 50 items
- Always return pagination metadata

### Date Formats
- All dates should be in ISO 8601 format (UTC)
- Example: `2024-01-20T10:30:00Z`

---

## Testing Recommendations

1. **Unit Tests**: Test all validation logic, business rules, and data transformations
2. **Integration Tests**: Test API endpoints with database interactions
3. **Authentication Tests**: Test JWT token generation, validation, and refresh
4. **Authorization Tests**: Test role-based access control
5. **File Upload Tests**: Test file validation, storage, and retrieval
6. **Email Tests**: Test email sending and verification code generation
7. **Error Handling Tests**: Test all error scenarios and edge cases

---

**Document Version:** 1.0  
**Last Updated:** January 2024

