# Bank Accounts Module API Documentation

**Base URL**: `/api/user/bank-accounts`

**Authentication**: All endpoints require user authentication via JWT Bearer token.

**Security**: All bank account additions require OTP verification via email to prevent unauthorized access.

---

## Table of Contents

1. [Add Bank Account](#1-add-bank-account)
2. [Verify Bank Account](#2-verify-bank-account)
3. [Get User Bank Accounts](#3-get-user-bank-accounts)
4. [Set Primary Bank Account](#4-set-primary-bank-account)
5. [Delete Bank Account](#5-delete-bank-account)

---

## 1. Add Bank Account

**Endpoint**: `POST /api/user/bank-accounts`

**Description**: Add a bank account. An OTP verification code will be sent to your email. You must verify the bank account with the OTP before it can be used for payouts.

**Headers**:
```
Authorization: Bearer <user_jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "accountNumber": "1234567890",
  "accountName": "John Doe",
  "bankName": "First Bank of Nigeria",
  "bankCode": "011"
}
```

**Request Body Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `accountNumber` | string | Yes | Bank account number (10-50 characters) |
| `accountName` | string | Yes | Account holder name (2-255 characters) |
| `bankName` | string | Yes | Bank name (2-100 characters) |
| `bankCode` | string | Yes | Bank code (3-20 characters) |

**Example Request**:
```bash
curl -X POST \
  http://localhost:3001/api/user/bank-accounts \
  -H "Authorization: Bearer <user_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "accountNumber": "1234567890",
    "accountName": "John Doe",
    "bankName": "First Bank of Nigeria",
    "bankCode": "011"
  }'
```

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "Verification code sent to your email",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "expiresIn": 15
  }
}
```

**Response Fields**:
| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Bank account ID (use this for verification) |
| `expiresIn` | number | OTP expiration time in minutes |

**Error Responses**:
- `400 Bad Request`: 
  - Bank account already added and verified
  - Invalid account details
- `401 Unauthorized`: Invalid or missing JWT token

**Important Notes**:
- **OTP Required**: An OTP will be sent to your registered email address
- **OTP Expiration**: The OTP expires in 15 minutes
- **Development Mode**: In development, the OTP is logged to console instead of email
- **Duplicate Accounts**: If you try to add the same account number and bank code, it will update the existing unverified account and send a new OTP

---

## 2. Verify Bank Account

**Endpoint**: `POST /api/user/bank-accounts/:id/verify`

**Description**: Verify a bank account using the OTP code sent to your email. The bank account must be verified before it can be used for payouts.

**Headers**:
```
Authorization: Bearer <user_jwt_token>
Content-Type: application/json
```

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | Yes | Bank account ID (from add bank account response) |

**Request Body**:
```json
{
  "verificationCode": "123456"
}
```

**Request Body Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `verificationCode` | string | Yes | 6-digit OTP code from email |

**Example Request**:
```bash
curl -X POST \
  http://localhost:3001/api/user/bank-accounts/123e4567-e89b-12d3-a456-426614174000/verify \
  -H "Authorization: Bearer <user_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "verificationCode": "123456"
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Bank account verified successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "isVerified": true,
    "isPrimary": true
  }
}
```

**Response Fields**:
| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Bank account ID |
| `isVerified` | boolean | Verification status (always `true` on success) |
| `isPrimary` | boolean | Whether this is the primary bank account |

**Error Responses**:
- `400 Bad Request`: 
  - Invalid verification code
  - Verification code expired
  - Bank account already verified
  - No verification code found
- `401 Unauthorized`: Invalid or missing JWT token
- `404 Not Found`: Bank account not found

**Important Notes**:
- **First Account**: The first verified bank account is automatically set as primary
- **OTP Expiration**: OTP codes expire after 15 minutes
- **One-Time Use**: Each OTP can only be used once
- **Resend OTP**: If OTP expires, add the bank account again to receive a new OTP

---

## 3. Get User Bank Accounts

**Endpoint**: `GET /api/user/bank-accounts`

**Description**: Get all bank accounts for the authenticated user.

**Headers**:
```
Authorization: Bearer <user_jwt_token>
```

**Example Request**:
```bash
curl -X GET \
  http://localhost:3001/api/user/bank-accounts \
  -H "Authorization: Bearer <user_jwt_token>"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "accountNumber": "1234567890",
      "accountName": "John Doe",
      "bankName": "First Bank of Nigeria",
      "bankCode": "011",
      "isVerified": true,
      "isPrimary": true,
      "createdAt": "2025-12-09T10:00:00Z"
    },
    {
      "id": "another-bank-account-uuid",
      "accountNumber": "9876543210",
      "accountName": "John Doe",
      "bankName": "GTBank",
      "bankCode": "058",
      "isVerified": true,
      "isPrimary": false,
      "createdAt": "2025-12-09T11:00:00Z"
    }
  ]
}
```

**Response Fields**:
| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Bank account ID |
| `accountNumber` | string | Bank account number |
| `accountName` | string | Account holder name |
| `bankName` | string | Bank name |
| `bankCode` | string | Bank code |
| `isVerified` | boolean | Whether the account is verified |
| `isPrimary` | boolean | Whether this is the primary bank account |
| `createdAt` | string (ISO 8601) | When the account was added |

**Error Responses**:
- `401 Unauthorized`: Invalid or missing JWT token

**Important Notes**:
- Results are ordered by primary status first, then by creation date (most recent first)
- Only verified bank accounts can be used for payouts
- Primary bank account is used by default for payouts if no specific account is selected

---

## 4. Set Primary Bank Account

**Endpoint**: `POST /api/user/bank-accounts/:id/set-primary`

**Description**: Set a verified bank account as the primary account. The primary account is used by default for payouts.

**Headers**:
```
Authorization: Bearer <user_jwt_token>
```

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | Yes | Bank account ID |

**Example Request**:
```bash
curl -X POST \
  http://localhost:3001/api/user/bank-accounts/123e4567-e89b-12d3-a456-426614174000/set-primary \
  -H "Authorization: Bearer <user_jwt_token>"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Bank account set as primary successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "isPrimary": true
  }
}
```

**Error Responses**:
- `400 Bad Request`: Bank account is not verified (only verified accounts can be primary)
- `401 Unauthorized`: Invalid or missing JWT token
- `404 Not Found`: Bank account not found

**Important Notes**:
- Only verified bank accounts can be set as primary
- Setting a new primary account automatically removes primary status from the previous primary account
- Primary account is used by default when requesting payouts without specifying a `bankAccountId`

---

## 5. Delete Bank Account

**Endpoint**: `DELETE /api/user/bank-accounts/:id`

**Description**: Delete a bank account. Primary bank accounts cannot be deleted.

**Headers**:
```
Authorization: Bearer <user_jwt_token>
```

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | Yes | Bank account ID |

**Example Request**:
```bash
curl -X DELETE \
  http://localhost:3001/api/user/bank-accounts/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer <user_jwt_token>"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Bank account deleted successfully"
}
```

**Error Responses**:
- `400 Bad Request`: Cannot delete primary bank account (set another as primary first)
- `401 Unauthorized`: Invalid or missing JWT token
- `404 Not Found`: Bank account not found

**Important Notes**:
- Primary bank accounts cannot be deleted
- To delete a primary account, first set another verified account as primary
- Deleted bank accounts cannot be recovered

---

## Workflow Example

### Complete Bank Account Setup Flow

1. **Add bank account**:
   ```
   POST /api/user/bank-accounts
   Body: {
     "accountNumber": "1234567890",
     "accountName": "John Doe",
     "bankName": "First Bank of Nigeria",
     "bankCode": "011"
   }
   ```
   Response: OTP sent to email

2. **Check email for OTP** (or console in development mode)

3. **Verify bank account**:
   ```
   POST /api/user/bank-accounts/:id/verify
   Body: {
     "verificationCode": "123456"
   }
   ```
   Response: Account verified and set as primary

4. **View all bank accounts**:
   ```
   GET /api/user/bank-accounts
   ```

5. **Add another bank account** (optional):
   ```
   POST /api/user/bank-accounts
   Body: { ... }
   ```

6. **Set different account as primary** (optional):
   ```
   POST /api/user/bank-accounts/:id/set-primary
   ```

7. **Now can request payouts** using verified bank accounts:
   ```
   POST /api/user/payout
   Body: {
     "amount": 100.00
   }
   ```

---

## Status Codes Summary

| Status Code | Description |
|-------------|-------------|
| `200 OK` | Request successful |
| `201 Created` | Bank account added, OTP sent |
| `400 Bad Request` | Invalid request data or business rule violation |
| `401 Unauthorized` | Missing or invalid authentication token |
| `404 Not Found` | Bank account not found |

---

## Business Rules

1. **OTP Verification Required**: All bank accounts must be verified with OTP before use
2. **One Primary Account**: Only one bank account can be primary at a time
3. **Primary Account Protection**: Primary accounts cannot be deleted
4. **Verified Accounts Only**: Only verified accounts can be:
   - Set as primary
   - Used for payouts
5. **OTP Expiration**: OTP codes expire after 15 minutes
6. **Resend OTP**: Adding the same account again sends a new OTP

---

## Security Features

1. **OTP Verification**: Prevents unauthorized users from adding bank accounts
2. **Email Verification**: OTP is sent to registered email address
3. **Account Ownership**: Users can only manage their own bank accounts
4. **Primary Account Protection**: Primary accounts require setting another primary before deletion

---

## Testing Notes

1. **Test bank account flow**:
   - Add bank account
   - Check email/console for OTP
   - Verify with correct OTP
   - Try to verify with wrong OTP (should fail)
   - Try to verify with expired OTP (should fail)

2. **Test primary account**:
   - First verified account becomes primary automatically
   - Set another account as primary
   - Try to delete primary account (should fail)
   - Set different primary, then delete old primary (should work)

3. **Test edge cases**:
   - Add duplicate account (updates existing and sends new OTP)
   - Verify already verified account (should fail)
   - Delete non-existent account (should fail)

---

**Last Updated**: 2025-12-09

