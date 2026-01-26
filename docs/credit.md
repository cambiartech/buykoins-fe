# Credit Requests Module - API Documentation

## Overview
This document describes the Credit Requests module endpoints for the BuyTikTokCoins platform. All endpoints require JWT authentication.

**Base URL**: `http://localhost:3001/api` (Development)  
**Authentication**: All endpoints require `Authorization: Bearer <token>` header

---

## Endpoints

### 1. Submit Credit Request

**Endpoint:** `POST /api/user/credit-request`

**Description:** Submit a new credit request with proof of TikTok earnings. Users must be onboarded and can only have one pending request at a time.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
amount: 500.00
proof: <file> (image or PDF, max 10MB)
```

**Validation Rules:**
- `amount`: Required, positive number, minimum 1.00 USD
- `proof`: Required, file must be:
  - Image formats: jpg, jpeg, png, webp
  - PDF format: pdf
  - Maximum file size: 10MB

**Business Rules:**
- User must have completed onboarding (`onboardingStatus: "completed"`)
- User cannot have more than one pending credit request at a time
- If a pending request exists, user must wait for it to be processed before submitting a new one

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Credit request submitted successfully",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "amount": 500.00,
    "status": "pending",
    "submittedAt": "2024-01-20T10:30:00Z",
    "proofUrl": "https://storage.example.com/proofs/uuid.jpg"
  }
}
```

**Status Values:**
- `"pending"` - Request is pending admin approval
- `"approved"` - Request was approved (credit sent)
- `"rejected"` - Request was rejected

**Error Responses:**
- `400 Bad Request`: 
  - Validation errors (invalid amount, file type, or file size)
  - Missing required fields
- `403 Forbidden`: User has not completed onboarding
- `409 Conflict`: User already has a pending credit request

**Example Request (cURL):**
```bash
curl -X POST http://localhost:3001/api/user/credit-request \
  -H "Authorization: Bearer <token>" \
  -F "amount=500.00" \
  -F "proof=@/path/to/proof.jpg"
```

**Example Request (JavaScript/Fetch):**
```javascript
const formData = new FormData();
formData.append('amount', '500.00');
formData.append('proof', fileInput.files[0]);

const response = await fetch('http://localhost:3001/api/user/credit-request', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  body: formData,
});
```

---

### 2. Get Credit Request Status

**Endpoint:** `GET /api/user/credit-request/status`

**Description:** Get the current/latest credit request status for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "pending",
    "amount": 500.00,
    "submittedAt": "2024-01-20T10:30:00Z",
    "processedAt": null,
    "rejectionReason": null
  }
}
```

**Status Values:**
- `"none"` - No credit request exists
- `"pending"` - Request is pending approval
- `"sent"` - Request was approved (credit sent)
- `"rejected"` - Request was rejected

**Response Fields:**
- `status`: Current status of the credit request
- `amount`: Amount requested (in USD)
- `submittedAt`: Date and time when request was submitted
- `processedAt`: Date and time when request was processed (null if pending)
- `rejectionReason`: Reason for rejection (null if not rejected)

**Note:** If no credit request exists, `status` will be `"none"` and other fields will be `null`.

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token

---

### 3. Get Credit Request History

**Endpoint:** `GET /api/user/credit-request/history`

**Description:** Get all credit requests for the authenticated user, ordered by submission date (newest first).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "amount": 500.00,
      "status": "pending",
      "submittedAt": "2024-01-20T10:30:00Z",
      "processedAt": null,
      "rejectionReason": null,
      "proofUrl": "https://storage.example.com/proofs/uuid.jpg"
    },
    {
      "id": "uuid",
      "amount": 300.00,
      "status": "approved",
      "submittedAt": "2024-01-15T10:30:00Z",
      "processedAt": "2024-01-16T14:20:00Z",
      "rejectionReason": null,
      "proofUrl": "https://storage.example.com/proofs/uuid.jpg"
    },
    {
      "id": "uuid",
      "amount": 200.00,
      "status": "rejected",
      "submittedAt": "2024-01-10T10:30:00Z",
      "processedAt": "2024-01-11T09:15:00Z",
      "rejectionReason": "Proof of earnings is unclear",
      "proofUrl": "https://storage.example.com/proofs/uuid.jpg"
    }
  ]
}
```

**Response Fields:**
- `id`: Unique identifier for the credit request
- `amount`: Amount requested (in USD)
- `status`: Status of the request (`pending`, `approved`, `rejected`)
- `submittedAt`: Date and time when request was submitted
- `processedAt`: Date and time when request was processed (null if pending)
- `rejectionReason`: Reason for rejection (null if not rejected)
- `proofUrl`: URL to the proof file uploaded

**Note:** Returns an empty array `[]` if user has no credit requests.

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token

---

## File Upload Guidelines

### Supported File Types
- **Images**: jpg, jpeg, png, webp
- **Documents**: pdf

### File Size Limit
- Maximum: **10MB**

### File Upload Best Practices
1. **Image Files**: 
   - Use clear, high-quality images
   - Ensure text/numbers are readable
   - Recommended formats: PNG or JPEG

2. **PDF Files**:
   - Ensure PDF is not password-protected
   - Verify all pages are included
   - Check file size before upload

3. **File Naming**:
   - Original filename is preserved but stored with a UUID in S3
   - Files are stored in the `credit-proofs/` folder

### File Storage
- Files are uploaded to AWS S3
- Files are stored privately (not publicly accessible)
- Proof URLs are provided in responses for admin access

---

## Business Logic

### Onboarding Requirement
Users must complete onboarding before submitting credit requests. If a user attempts to submit a request without completing onboarding, they will receive a `403 Forbidden` error with the message:
```
"You must complete onboarding before submitting credit requests"
```

### One Pending Request Rule
Users can only have **one pending credit request** at a time. If a user attempts to submit a new request while one is pending, they will receive a `409 Conflict` error with the message:
```
"You already have a pending credit request. Please wait for it to be processed."
```

### Request Status Flow
1. **Submitted** → Status: `pending`
2. **Admin Reviews** → Status remains `pending`
3. **Admin Approves** → Status: `approved`, `processedAt` is set
4. **Admin Rejects** → Status: `rejected`, `processedAt` and `rejectionReason` are set

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

## Rate Limiting

All endpoints are subject to rate limiting:
- Default: 100 requests per 60 seconds per IP
- Rate limit headers are included in responses

---

## Swagger Documentation

Interactive API documentation is available at:
- Development: `http://localhost:3001/api/docs`

You can test endpoints directly from the Swagger UI, including file uploads.

---

## Notes

1. **Amount**: All amounts are in USD. Conversion to NGN happens during payout processing.

2. **Proof Files**: Files are stored securely in AWS S3. The `proofUrl` in responses is a public URL that can be used by admins to view the proof.

3. **Status Mapping**: 
   - Database status `pending` → API status `pending`
   - Database status `approved` → API status `sent`
   - Database status `rejected` → API status `rejected`

4. **File Validation**: File validation happens both on the client side (via ParseFilePipe) and server side (in the service) for security.

5. **Error Handling**: All validation errors return detailed messages to help users correct their requests.

---

## Support

For issues or questions, contact the backend team.

**Last Updated**: 2025-12-07

