# Admin Payout Management API Documentation

**Base URL**: `/api/admin/payouts`

**Authentication**: All endpoints require admin authentication via JWT Bearer token.

**Required Roles**: `admin` or `super_admin`

---

## Admin processing withdrawal requests (payments to user bank accounts)

When a user requests a **withdrawal** (payout), the admin **processes** it from the dashboard. That action:

1. **Sends the money** to the user’s bank account via **Sudo** (debit settlement account → user’s bank using `beneficiaryBankCode` + `beneficiaryAccountNumber`).
2. Marks the payout completed, deducts the user’s earnings balance, creates a transaction record, and sends email + notification.
3. Saves the **Sudo transfer ID** on the payout as `transactionReference` for reconciliation.

**Detailed flow, config, and errors**: see **[PAYOUT_SETTLEMENT_SUDO.md](./PAYOUT_SETTLEMENT_SUDO.md)**.

**Endpoints used by admin:**

- **Process a payout (withdrawal)** → `POST /api/admin/payouts/:id/process`
- **Check transfer status (reconciliation/disputes)** → `GET /api/admin/payouts/transfer-status/:transferId`

---

## Table of Contents

1. [List Payouts](#1-list-payouts)
2. [Get Payout by ID](#2-get-payout-by-id)
3. [Process/Approve Payout](#3-processapprove-payout)
4. [Get transfer status (reconciliation)](#4-get-transfer-status-reconciliation)
5. [Reject Payout](#5-reject-payout)

---

## 1. List Payouts

**Endpoint**: `GET /api/admin/payouts`

**Description**: Retrieve all payout requests with pagination and optional status filtering.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number for pagination |
| `limit` | number | No | 10 | Number of items per page (max 50) |
| `status` | string | No | `all` | Filter by status: `all`, `pending`, `processing`, `completed`, `rejected` |

**Example Request**:
```bash
GET /api/admin/payouts?page=1&limit=10&status=pending
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "payouts": [
      {
        "id": "uuid-here",
        "userId": "user-uuid-here",
        "user": {
          "id": "user-uuid-here",
          "email": "user@example.com",
          "firstName": "John",
          "lastName": "Doe",
          "phone": "+1234567890"
        },
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
        "processedAt": null,
        "completedAt": null,
        "processedBy": null,
        "transactionReference": null,
        "rejectionReason": null,
        "notes": null
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

---

## 2. Get Payout by ID

**Endpoint**: `GET /api/admin/payouts/:id`

**Description**: Retrieve detailed information about a specific payout request.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | Yes | Payout request ID |

**Example Request**:
```bash
GET /api/admin/payouts/123e4567-e89b-12d3-a456-426614174000
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "userId": "user-uuid-here",
    "user": {
      "id": "user-uuid-here",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890",
      "balance": 1000.00
    },
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
    "processedAt": null,
    "completedAt": null,
    "processedBy": null,
    "transactionReference": null,
    "rejectionReason": null,
    "notes": null
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing JWT token
- `403 Forbidden`: User does not have admin role
- `404 Not Found`: Payout not found

---

## 3. Process/Approve Payout

**Endpoint**: `POST /api/admin/payouts/:id/process`

**Description**: Process and approve a payout request. This will:
- Deduct the payout amount from user's balance
- Create a transaction record
- Mark payout as completed

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | Yes | Payout request ID |

**Request Body**:
```json
{
  "transactionReference": "TXN123456789",
  "notes": "Payout processed successfully"
}
```

**Request Body Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `transactionReference` | string | No | Transaction reference from bank/payment processor (max 100 chars) |
| `notes` | string | No | Optional notes for processing (max 500 chars) |

**Example Request**:
```bash
curl -X POST \
  http://localhost:3001/api/admin/payouts/123e4567-e89b-12d3-a456-426614174000/process \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionReference": "TXN123456789",
    "notes": "Payout processed successfully"
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Payout processed successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "status": "completed",
    "processedAt": "2025-12-09T11:00:00Z",
    "completedAt": "2025-12-09T11:00:00Z",
    "processedBy": "admin-uuid-here",
    "userBalance": 900.00
  }
}
```

**What Happens When Processed**:
- Payout status updated to `completed`
- User's balance deducted by the payout amount
- Transaction record created with type `withdrawal` and status `completed`
- Transaction description includes bank account details
- Processed timestamp and admin ID recorded
- Transaction reference saved (if provided)

**Error Responses**:
- `400 Bad Request`: 
  - Payout is already processed
  - User has insufficient balance
- `401 Unauthorized`: Invalid or missing JWT token
- `403 Forbidden`: User does not have admin role
- `404 Not Found`: Payout not found

**Important Notes**:
- Only `pending` payouts can be processed
- **Settlement**: Backend sends funds to the user’s bank via Sudo (see [PAYOUT_SETTLEMENT_SUDO.md](./PAYOUT_SETTLEMENT_SUDO.md)); on Sudo success, payout is completed and balance deducted
- On success, `data.transactionReference` is the Sudo transfer ID (use for [transfer status](#4-get-transfer-status-reconciliation))
- If Sudo transfer fails, payout is not completed and balance is not deducted

---

## 4. Get Transfer Status (Reconciliation)

**Endpoint**: `GET /api/admin/payouts/transfer-status/:transferId`

**Description**: Get the status of a Sudo transfer (for reconciliation or disputes). Use the payout’s `transactionReference` as `transferId` after processing.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters**:
| Parameter     | Type   | Required | Description                          |
|---------------|--------|----------|--------------------------------------|
| `transferId`  | string | Yes      | Sudo transfer ID (from payout’s `transactionReference`) |

**Example Request**:
```bash
GET /api/admin/payouts/transfer-status/674a1b2c3d4e5f6789012345
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "_id": "674a1b2c3d4e5f6789012345",
    "status": "completed",
    "amount": 149950,
    "debitAccountId": "...",
    "beneficiaryBankCode": "011",
    "beneficiaryAccountNumber": "1234567890",
    "narration": "Buykoins payout to John Doe - Payout ...",
    "paymentReference": "PAYOUT_...",
    "createdAt": "..."
  }
}
```

(Exact fields come from Sudo; see [PAYOUT_SETTLEMENT_SUDO.md](./PAYOUT_SETTLEMENT_SUDO.md).)

---

## 5. Reject Payout

**Endpoint**: `POST /api/admin/payouts/:id/reject`

**Description**: Reject a payout request with a reason. User's balance is NOT deducted.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | Yes | Payout request ID |

**Request Body**:
```json
{
  "rejectionReason": "Invalid bank account details or insufficient verification"
}
```

**Request Body Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `rejectionReason` | string | Yes | Reason for rejection (max 500 chars) |

**Example Request**:
```bash
curl -X POST \
  http://localhost:3001/api/admin/payouts/123e4567-e89b-12d3-a456-426614174000/reject \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "rejectionReason": "Invalid bank account details or insufficient verification"
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Payout rejected successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "status": "rejected",
    "processedAt": "2025-12-09T11:00:00Z",
    "processedBy": "admin-uuid-here",
    "rejectionReason": "Invalid bank account details or insufficient verification"
  }
}
```

**What Happens When Rejected**:
- Payout status updated to `rejected`
- Rejection reason saved
- Processed timestamp and admin ID recorded
- User's balance is **NOT** deducted
- No transaction record is created

**Error Responses**:
- `400 Bad Request`: 
  - Payout is already processed
  - Missing or invalid rejection reason
- `401 Unauthorized`: Invalid or missing JWT token
- `403 Forbidden`: User does not have admin role
- `404 Not Found`: Payout not found

**Important Notes**:
- Only `pending` payouts can be rejected
- Rejection reason is required
- Rejected payouts cannot be processed later (user must submit a new request)

---

## Workflow Example

### Complete Payout Processing Flow

1. **Admin views pending payouts**:
   ```
   GET /api/admin/payouts?status=pending
   ```

2. **Admin views specific payout details**:
   ```
   GET /api/admin/payouts/{id}
   ```

3. **Admin processes payout** (sends money to user’s bank via Sudo):
   ```
   POST /api/admin/payouts/{id}/process
   Body: {
     "transactionReference": "optional - else Sudo transfer ID is stored",
     "notes": "Payout processed successfully"
   }
   ```
   Backend: Sudo transfer (settlement account → user bank) → then marks payout completed, deducts balance, creates transaction. Response `data.transactionReference` is the Sudo transfer ID.

4. **Result**: 
   - Funds sent to user’s bank (Sudo)
   - User's balance deducted
   - Transaction created
   - Payout marked as completed
   - Email + notification sent
   - To check transfer status: `GET /api/admin/payouts/transfer-status/{transactionReference}`

### Rejection Flow

1. **Admin views payout**:
   ```
   GET /api/admin/payouts/{id}
   ```

2. **Admin rejects payout**:
   ```
   POST /api/admin/payouts/{id}/reject
   Body: {
     "rejectionReason": "Invalid bank account details"
   }
   ```

3. **Result**: 
   - Payout marked as rejected
   - User's balance **NOT** deducted
   - No transaction created
   - User can see rejection reason

---

## Status Codes Summary

| Status Code | Description |
|-------------|-------------|
| `200 OK` | Request successful |
| `400 Bad Request` | Invalid request data or business rule violation |
| `401 Unauthorized` | Missing or invalid authentication token |
| `403 Forbidden` | User does not have required admin role |
| `404 Not Found` | Payout not found |

---

## Testing Notes

1. **Test payout processing**:
   - Process pending payout (should deduct balance)
   - Check user balance before and after
   - Verify transaction is created
   - Try to process already processed payout (should fail)

2. **Test payout rejection**:
   - Reject pending payout
   - Verify user balance is NOT changed
   - Verify no transaction is created
   - Try to reject already processed payout (should fail)

3. **Test edge cases**:
   - Process payout when user has insufficient balance (should fail)
   - Process payout with transaction reference
   - Process payout without transaction reference
   - Reject payout without reason (should fail)

4. **Verify user experience**:
   - Check user's recent activities include payout
   - Check user's balance is updated after processing
   - Check payout status in user's payout history

---

**Last Updated**: 2025-12-09

