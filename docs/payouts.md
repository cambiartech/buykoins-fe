# Payouts Module API Documentation

**Base URL**: `/api/user/payout`

**Authentication**: All endpoints require user authentication via JWT Bearer token.

**Prerequisites**: 
- User must have completed onboarding
- User must have at least one verified bank account (added and verified via OTP)

---

## Table of Contents

1. [Initiate Payout Request](#1-initiate-payout-request)
2. [Get Payout Status](#2-get-payout-status)
3. [Get Payout History](#3-get-payout-history)

---

## 1. Initiate Payout Request

**Endpoint**: `POST /api/user/payout`

**Description**: Request a payout/withdrawal. The system will use your verified bank account. You must have added and verified a bank account via OTP before requesting a payout.

**Headers**:
```
Authorization: Bearer <user_jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "amount": 100.00,
  "bankAccountId": "optional-bank-account-uuid"
}
```

**Request Body Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | number | Yes | Amount to withdraw in USD (minimum: 0.01) |
| `bankAccountId` | string (UUID) | No | ID of verified bank account to use. If omitted, primary verified bank account will be used |

**Example Request**:
```bash
curl -X POST \
  http://localhost:3001/api/user/payout \
  -H "Authorization: Bearer <user_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.00,
    "bankAccountId": "123e4567-e89b-12d3-a456-426614174000"
  }'
```

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "Payout request submitted successfully",
  "data": {
    "id": "payout-uuid-here",
    "amount": 100.00,
    "amountInNgn": 150000.00,
    "processingFee": 50.00,
    "netAmount": 149950.00,
    "bankAccount": {
      "accountNumber": "1234567890",
      "accountName": "John Doe",
      "bankName": "First Bank of Nigeria",
      "bankCode": "011"
    },
    "status": "pending",
    "requestedAt": "2025-12-09T10:00:00Z",
    "exchangeRate": 1500.00,
    "bankAccountId": "123e4567-e89b-12d3-a456-426614174000"
  }
}
```

**Response Fields**:
| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Payout request ID |
| `amount` | number | Amount in USD |
| `amountInNgn` | number | Amount converted to NGN |
| `processingFee` | number | Processing fee in NGN |
| `netAmount` | number | Net amount user will receive (amountInNgn - processingFee) |
| `bankAccount` | object | Bank account details (from verified bank account) |
| `status` | string | Payout status: `pending` |
| `requestedAt` | string (ISO 8601) | When the payout was requested |
| `exchangeRate` | number | Exchange rate used (USD to NGN) |
| `bankAccountId` | string (UUID) | ID of the bank account used |

**Error Responses**:
- `400 Bad Request`: 
  - Insufficient balance
  - Amount too small (processing fee exceeds amount)
  - User already has a pending payout request
  - No verified bank account found
- `401 Unauthorized`: Invalid or missing JWT token
- `403 Forbidden`: User has not completed onboarding
- `404 Not Found`: Specified bank account not found or not verified

**Important Notes**:
- **Bank Account Required**: You must have at least one verified bank account before requesting a payout
- **Balance Check**: Your balance must be sufficient to cover the payout amount
- **One Pending Request**: Only one pending payout request is allowed at a time
- **Exchange Rate**: Currently hardcoded at 1500.00 NGN per USD (will be dynamic in future)
- **Processing Fee**: Currently fixed at 50.00 NGN (will be dynamic in future)
- **Bank Account Selection**: If `bankAccountId` is not provided, the system uses your primary verified bank account, or any verified bank account if no primary is set

---

## 2. Get Payout Status

**Endpoint**: `GET /api/user/payout/:id`

**Description**: Get detailed information about a specific payout request.

**Headers**:
```
Authorization: Bearer <user_jwt_token>
```

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | Yes | Payout request ID |

**Example Request**:
```bash
curl -X GET \
  http://localhost:3001/api/user/payout/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer <user_jwt_token>"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "amount": 100.00,
    "amountInNgn": 150000.00,
    "processingFee": 50.00,
    "netAmount": 149950.00,
    "bankAccount": {
      "accountNumber": "1234567890",
      "accountName": "John Doe",
      "bankName": "First Bank of Nigeria",
      "bankCode": "011"
    },
    "status": "completed",
    "requestedAt": "2025-12-09T10:00:00Z",
    "processedAt": "2025-12-09T11:00:00Z",
    "completedAt": "2025-12-09T11:00:00Z",
    "transactionReference": "TXN123456789",
    "rejectionReason": null,
    "notes": "Payout processed successfully"
  }
}
```

**Response Fields**:
| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Payout request ID |
| `amount` | number | Amount in USD |
| `amountInNgn` | number | Amount converted to NGN |
| `processingFee` | number | Processing fee in NGN |
| `netAmount` | number | Net amount user will receive |
| `bankAccount` | object | Bank account details |
| `status` | string | Payout status: `pending`, `processing`, `completed`, or `rejected` |
| `requestedAt` | string (ISO 8601) | When the payout was requested |
| `processedAt` | string (ISO 8601) \| null | When admin started processing |
| `completedAt` | string (ISO 8601) \| null | When payout was completed |
| `transactionReference` | string \| null | Transaction reference from admin |
| `rejectionReason` | string \| null | Reason for rejection (if rejected) |
| `notes` | string \| null | Admin notes |

**Error Responses**:
- `401 Unauthorized`: Invalid or missing JWT token
- `404 Not Found`: Payout not found or doesn't belong to user

---

## 3. Get Payout History

**Endpoint**: `GET /api/user/payouts`

**Description**: Get paginated list of all payout requests for the authenticated user.

**Headers**:
```
Authorization: Bearer <user_jwt_token>
```

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number for pagination |
| `limit` | number | No | 10 | Number of items per page (max 50) |

**Example Request**:
```bash
curl -X GET \
  "http://localhost:3001/api/user/payouts?page=1&limit=10" \
  -H "Authorization: Bearer <user_jwt_token>"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "payouts": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "amount": 100.00,
        "amountInNgn": 150000.00,
        "processingFee": 50.00,
        "netAmount": 149950.00,
        "status": "completed",
        "requestedAt": "2025-12-09T10:00:00Z",
        "processedAt": "2025-12-09T11:00:00Z",
        "completedAt": "2025-12-09T11:00:00Z",
        "rejectionReason": null
      },
      {
        "id": "another-payout-uuid",
        "amount": 50.00,
        "amountInNgn": 75000.00,
        "processingFee": 50.00,
        "netAmount": 74950.00,
        "status": "pending",
        "requestedAt": "2025-12-09T09:00:00Z",
        "processedAt": null,
        "completedAt": null,
        "rejectionReason": null
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

**Response Fields**:
| Field | Type | Description |
|-------|------|-------------|
| `payouts` | array | List of payout requests (ordered by most recent first) |
| `pagination.currentPage` | number | Current page number |
| `pagination.totalPages` | number | Total number of pages |
| `pagination.totalItems` | number | Total number of payout requests |
| `pagination.itemsPerPage` | number | Number of items per page |

**Error Responses**:
- `401 Unauthorized`: Invalid or missing JWT token

---

## Workflow Example

### Complete Payout Flow

1. **User adds bank account** (if not already added):
   ```
   POST /api/user/bank-accounts
   Body: {
     "accountNumber": "1234567890",
     "accountName": "John Doe",
     "bankName": "First Bank of Nigeria",
     "bankCode": "011"
   }
   ```

2. **User verifies bank account with OTP**:
   ```
   POST /api/user/bank-accounts/:id/verify
   Body: {
     "verificationCode": "123456"
   }
   ```

3. **User requests payout**:
   ```
   POST /api/user/payout
   Body: {
     "amount": 100.00
   }
   ```

4. **User checks payout status**:
   ```
   GET /api/user/payout/:id
   ```

5. **Admin processes payout** (admin endpoint):
   ```
   POST /api/admin/payouts/:id/process
   Body: {
     "transactionReference": "TXN123456789",
     "notes": "Payout processed successfully"
   }
   ```

6. **User checks status again** (now shows `completed`):
   ```
   GET /api/user/payout/:id
   ```

7. **User views payout history**:
   ```
   GET /api/user/payouts?page=1&limit=10
   ```

---

## Status Codes Summary

| Status Code | Description |
|-------------|-------------|
| `200 OK` | Request successful |
| `201 Created` | Payout request created successfully |
| `400 Bad Request` | Invalid request data or business rule violation |
| `401 Unauthorized` | Missing or invalid authentication token |
| `403 Forbidden` | User has not completed onboarding |
| `404 Not Found` | Payout not found or bank account not found |

---

## Business Rules

1. **Onboarding Required**: Users must complete onboarding before requesting payouts
2. **Verified Bank Account Required**: Users must have at least one verified bank account
3. **Balance Validation**: User's balance must be sufficient to cover the payout amount
4. **One Pending Request**: Only one pending payout request is allowed at a time
5. **Exchange Rate**: Currently 1500.00 NGN per USD (will be dynamic)
6. **Processing Fee**: Currently 50.00 NGN fixed (will be dynamic)
7. **Bank Account Selection**: 
   - If `bankAccountId` provided, uses that verified account
   - Otherwise, uses primary verified account
   - If no primary, uses most recently verified account

---

## Calculation Example

**Request**: $100.00 USD

**Calculation**:
- Exchange Rate: 1500.00 NGN/USD
- Amount in NGN: 100.00 × 1500.00 = 150,000.00 NGN
- Processing Fee: 50.00 NGN
- Net Amount: 150,000.00 - 50.00 = 149,950.00 NGN

**User receives**: 149,950.00 NGN

---

## Testing Notes

1. **Test payout flow**:
   - Add and verify bank account first
   - Request payout with sufficient balance
   - Check payout status
   - View payout history

2. **Test validations**:
   - Request payout without verified bank account (should fail)
   - Request payout without completing onboarding (should fail)
   - Request payout with insufficient balance (should fail)
   - Request second payout while first is pending (should fail)

3. **Test bank account selection**:
   - Request payout without `bankAccountId` (uses primary)
   - Request payout with specific `bankAccountId` (uses that account)
   - Request payout with invalid `bankAccountId` (should fail)

---

**Last Updated**: 2025-12-09

