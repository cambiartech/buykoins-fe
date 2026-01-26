# Admin Credit Request Management API Documentation

**Base URL**: `/api/admin/credit-requests`

**Authentication**: All endpoints require admin authentication via JWT Bearer token.

**Required Roles**: `admin` or `super_admin`

---

## Table of Contents

1. [List Credit Requests](#1-list-credit-requests)
2. [Get Credit Request by ID](#2-get-credit-request-by-id)
3. [Approve Credit Request](#3-approve-credit-request)
4. [Reject Credit Request](#4-reject-credit-request)

---

## 1. List Credit Requests

**Endpoint**: `GET /api/admin/credit-requests`

**Description**: Retrieve all credit requests with pagination and optional status filtering.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number for pagination |
| `limit` | number | No | 10 | Number of items per page (max 100) |
| `status` | string | No | `all` | Filter by status: `all`, `pending`, `approved`, `rejected` |

**Example Request**:
```bash
GET /api/admin/credit-requests?page=1&limit=10&status=pending
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "creditRequests": [
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
        "amount": 500.00,
        "proofUrl": "https://s3.amazonaws.com/bucket/proofs/file.jpg",
        "status": "pending",
        "submittedAt": "2025-12-09T10:00:00Z",
        "processedAt": null,
        "processedBy": null,
        "rejectionReason": null,
        "notes": null,
        "adminProofUrl": null
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

## 2. Get Credit Request by ID

**Endpoint**: `GET /api/admin/credit-requests/:id`

**Description**: Retrieve detailed information about a specific credit request.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
```

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | Yes | Credit request ID |

**Example Request**:
```bash
GET /api/admin/credit-requests/123e4567-e89b-12d3-a456-426614174000
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
      "balance": 1000.00,
      "onboardingStatus": "completed"
    },
    "amount": 500.00,
    "proofUrl": "https://s3.amazonaws.com/bucket/proofs/file.jpg",
    "status": "pending",
    "submittedAt": "2025-12-09T10:00:00Z",
    "processedAt": null,
    "processedBy": null,
    "rejectionReason": null,
    "notes": null,
    "adminProofUrl": null
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or missing JWT token
- `403 Forbidden`: User does not have admin role
- `404 Not Found`: Credit request not found

---

## 3. Approve Credit Request

**Endpoint**: `POST /api/admin/credit-requests/:id/approve`

**Description**: Approve a credit request. Admin can:
- Upload their own proof of verification
- Choose to credit user's balance OR remit directly to user's bank account
- Specify a different amount than requested (if needed)

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
Content-Type: multipart/form-data
```

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | Yes | Credit request ID |

**Request Body (multipart/form-data)**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `notes` | string | No | Optional notes for approval (max 500 chars) |
| `creditMethod` | string | No | `balance` (default) or `direct` - How to credit the user |
| `amount` | number | No | Amount to credit (if different from request amount) |
| `adminProof` | file | No | Admin's proof file (image or PDF, max 10MB) |

**Credit Method Options**:
- `balance`: Credit user's balance on the system (default)
- `direct`: Remit directly to user's verified primary bank account (requires user to have a verified bank account)

**Example Request (cURL)**:
```bash
curl -X POST \
  http://localhost:3001/api/admin/credit-requests/123e4567-e89b-12d3-a456-426614174000/approve \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -F "notes=Verified proof of earnings" \
  -F "creditMethod=balance" \
  -F "amount=500.00" \
  -F "adminProof=@/path/to/proof.jpg"
```

**Example Request (JavaScript/Fetch)**:
```javascript
const formData = new FormData();
formData.append('notes', 'Verified proof of earnings');
formData.append('creditMethod', 'balance');
formData.append('amount', '500.00');
formData.append('adminProof', fileInput.files[0]);

fetch('/api/admin/credit-requests/123e4567-e89b-12d3-a456-426614174000/approve', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`
  },
  body: formData
});
```

**Response (200 OK) - Balance Method**:
```json
{
  "success": true,
  "message": "Credit request approved successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "status": "approved",
    "processedAt": "2025-12-09T11:00:00Z",
    "processedBy": "admin-uuid-here",
    "creditMethod": "balance",
    "amount": 500.00,
    "userBalance": 1500.00,
    "bankAccount": null,
    "adminProofUrl": "https://s3.amazonaws.com/bucket/admin-proofs/file.jpg"
  }
}
```

**Response (200 OK) - Direct Method**:
```json
{
  "success": true,
  "message": "Credit request approved successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "status": "approved",
    "processedAt": "2025-12-09T11:00:00Z",
    "processedBy": "admin-uuid-here",
    "creditMethod": "direct",
    "amount": 500.00,
    "userBalance": 1000.00,
    "bankAccount": {
      "bankName": "First Bank of Nigeria",
      "accountNumber": "1234567890",
      "accountName": "John Doe"
    },
    "adminProofUrl": "https://s3.amazonaws.com/bucket/admin-proofs/file.jpg"
  }
}
```

**What Happens When Approved**:

1. **Balance Method** (`creditMethod: "balance"`):
   - Credit request status updated to `approved`
   - User's balance increased by the credit amount
   - Transaction record created with type `credit` and status `completed`
   - Admin proof URL saved (if provided)

2. **Direct Method** (`creditMethod: "direct"`):
   - Credit request status updated to `approved`
   - User's balance **NOT** updated (direct remittance)
   - Transaction record created with type `credit` and status `completed` (for tracking)
   - Transaction description includes bank account details
   - Admin proof URL saved (if provided)
   - Transaction appears in user's recent activities

**Error Responses**:
- `400 Bad Request`: 
  - Credit request is already processed
  - User does not have a verified primary bank account (for direct method)
  - Invalid file type or size for admin proof
- `401 Unauthorized`: Invalid or missing JWT token
- `403 Forbidden`: User does not have admin role
- `404 Not Found`: Credit request not found

**Important Notes**:
- Only `pending` credit requests can be approved
- For `direct` method, user must have a verified primary bank account
- Admin proof file must be image (jpg, jpeg, png, webp) or PDF, max 10MB
- If `amount` is not provided, the original request amount is used
- Direct remittances are tracked in transactions but don't update user balance

---

## 4. Reject Credit Request

**Endpoint**: `POST /api/admin/credit-requests/:id/reject`

**Description**: Reject a credit request with an optional rejection reason.

**Headers**:
```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | Yes | Credit request ID |

**Request Body**:
```json
{
  "rejectionReason": "Proof of earnings does not match the requested amount"
}
```

**Request Body Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `rejectionReason` | string | Yes | Reason for rejection (max 500 chars) |

**Example Request**:
```bash
curl -X POST \
  http://localhost:3001/api/admin/credit-requests/123e4567-e89b-12d3-a456-426614174000/reject \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "rejectionReason": "Proof of earnings does not match the requested amount"
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Credit request rejected successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "status": "rejected",
    "processedAt": "2025-12-09T11:00:00Z",
    "processedBy": "admin-uuid-here",
    "rejectionReason": "Proof of earnings does not match the requested amount"
  }
}
```

**What Happens When Rejected**:
- Credit request status updated to `rejected`
- Rejection reason saved
- Processed timestamp and admin ID recorded
- User's balance is **NOT** updated
- No transaction record is created

**Error Responses**:
- `400 Bad Request`: 
  - Credit request is already processed
  - Missing or invalid rejection reason
- `401 Unauthorized`: Invalid or missing JWT token
- `403 Forbidden`: User does not have admin role
- `404 Not Found`: Credit request not found

**Important Notes**:
- Only `pending` credit requests can be rejected
- Rejection reason is required
- Rejected requests cannot be approved later (user must submit a new request)

---

## Workflow Example

### Complete Approval Flow

1. **Admin views pending credit requests**:
   ```
   GET /api/admin/credit-requests?status=pending
   ```

2. **Admin views specific credit request details**:
   ```
   GET /api/admin/credit-requests/{id}
   ```

3. **Admin approves with balance credit**:
   ```
   POST /api/admin/credit-requests/{id}/approve
   Body: {
     "notes": "Verified proof",
     "creditMethod": "balance",
     "amount": 500.00
   }
   File: adminProof.jpg
   ```

4. **Result**: User's balance increased, transaction created, appears in user's recent activities

### Direct Remittance Flow

1. **Admin views credit request**:
   ```
   GET /api/admin/credit-requests/{id}
   ```

2. **Admin approves with direct remittance**:
   ```
   POST /api/admin/credit-requests/{id}/approve
   Body: {
     "notes": "Remitted directly to bank",
     "creditMethod": "direct",
     "amount": 500.00
   }
   File: adminProof.jpg
   ```

3. **Result**: 
   - User's balance **NOT** updated
   - Transaction created for tracking
   - Appears in user's recent activities
   - Bank account details included in transaction description

---

## Status Codes Summary

| Status Code | Description |
|-------------|-------------|
| `200 OK` | Request successful |
| `400 Bad Request` | Invalid request data or business rule violation |
| `401 Unauthorized` | Missing or invalid authentication token |
| `403 Forbidden` | User does not have required admin role |
| `404 Not Found` | Credit request not found |

---

## Testing Notes

1. **Test with different credit methods**:
   - Test `balance` method (should update user balance)
   - Test `direct` method (should NOT update balance, requires bank account)

2. **Test file upload**:
   - Upload valid image files (jpg, png, webp)
   - Upload PDF files
   - Test file size limits (max 10MB)
   - Test invalid file types

3. **Test edge cases**:
   - Approve already processed request (should fail)
   - Reject already processed request (should fail)
   - Direct remittance without bank account (should fail)
   - Approve with different amount than requested

4. **Verify transactions**:
   - Check that transactions are created correctly
   - Verify transaction descriptions
   - Check user's recent activities include credit requests

---

**Last Updated**: 2025-12-09

