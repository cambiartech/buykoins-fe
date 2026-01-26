# Onboarding Module API Documentation

**Base URL**: `/api/user/onboarding`

**Authentication**: All endpoints require user authentication via JWT Bearer token.

---

## Table of Contents

1. [Submit Onboarding Request](#1-submit-onboarding-request)
2. [Get Onboarding Status](#2-get-onboarding-status)

---

## 1. Submit Onboarding Request

**Endpoint**: `POST /api/user/onboarding/request`

**Description**: Submit an onboarding request. Users must complete onboarding before they can submit credit requests or request payouts.

**Headers**:
```
Authorization: Bearer <user_jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "message": "I need help setting up my payment method"
}
```

**Request Body Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | string | No | Optional message for the onboarding request (max 1000 chars) |

**Example Request**:
```bash
curl -X POST \
  http://localhost:3001/api/user/onboarding/request \
  -H "Authorization: Bearer <user_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I need help setting up my payment method"
  }'
```

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "Onboarding request submitted successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "message": "I need help setting up my payment method",
    "status": "pending",
    "submittedAt": "2025-12-09T10:00:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: User already has a pending onboarding request
- `401 Unauthorized`: Invalid or missing JWT token
- `409 Conflict`: User has already completed onboarding

**Important Notes**:
- Only one pending onboarding request is allowed at a time
- Users who have already completed onboarding cannot submit new requests
- Admin will process the request and mark onboarding as completed
- Once onboarding is completed, users can submit credit requests and request payouts

---

## 2. Get Onboarding Status

**Endpoint**: `GET /api/user/onboarding/status`

**Description**: Get the current onboarding status and details of the latest onboarding request.

**Headers**:
```
Authorization: Bearer <user_jwt_token>
```

**Example Request**:
```bash
curl -X GET \
  http://localhost:3001/api/user/onboarding/status \
  -H "Authorization: Bearer <user_jwt_token>"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "onboardingStatus": "pending",
    "latestRequest": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "message": "I need help setting up my payment method",
      "status": "pending",
      "submittedAt": "2025-12-09T10:00:00Z",
      "completedAt": null,
      "notes": null
    }
  }
}
```

**Response (200 OK) - Completed**:
```json
{
  "success": true,
  "data": {
    "onboardingStatus": "completed",
    "latestRequest": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "message": "I need help setting up my payment method",
      "status": "completed",
      "submittedAt": "2025-12-09T10:00:00Z",
      "completedAt": "2025-12-09T11:00:00Z",
      "notes": "Bank: First Bank, Account: 1234567890, PayPal: user@example.com"
    }
  }
}
```

**Response (200 OK) - No Request Yet**:
```json
{
  "success": true,
  "data": {
    "onboardingStatus": "pending",
    "latestRequest": null
  }
}
```

**Response Fields**:
| Field | Type | Description |
|-------|------|-------------|
| `onboardingStatus` | string | Current onboarding status: `pending` or `completed` |
| `latestRequest` | object \| null | Details of the latest onboarding request |
| `latestRequest.id` | string (UUID) | Onboarding request ID |
| `latestRequest.message` | string \| null | Message submitted with the request |
| `latestRequest.status` | string | Request status: `pending` or `completed` |
| `latestRequest.submittedAt` | string (ISO 8601) | When the request was submitted |
| `latestRequest.completedAt` | string (ISO 8601) \| null | When the request was completed by admin |
| `latestRequest.notes` | string \| null | Admin notes (bank account details, payment method, etc.) |

**Error Responses**:
- `401 Unauthorized`: Invalid or missing JWT token

---

## Workflow Example

### Complete Onboarding Flow

1. **User submits onboarding request**:
   ```
   POST /api/user/onboarding/request
   Body: {
     "message": "I need help setting up my payment method"
   }
   ```

2. **User checks onboarding status**:
   ```
   GET /api/user/onboarding/status
   ```

3. **Admin completes onboarding** (admin endpoint):
   ```
   POST /api/admin/users/:id/complete-onboarding
   Body: {
     "notes": "Bank: First Bank, Account: 1234567890"
   }
   ```

4. **User checks status again** (now shows `completed`):
   ```
   GET /api/user/onboarding/status
   ```

5. **User can now**:
   - Submit credit requests
   - Request payouts
   - Access all features

---

## Status Codes Summary

| Status Code | Description |
|-------------|-------------|
| `200 OK` | Request successful |
| `201 Created` | Onboarding request created successfully |
| `400 Bad Request` | Invalid request data or business rule violation |
| `401 Unauthorized` | Missing or invalid authentication token |
| `409 Conflict` | User already has pending request or has completed onboarding |

---

## Business Rules

1. **One Pending Request**: Users can only have one pending onboarding request at a time
2. **Completion Required**: Users must complete onboarding before:
   - Submitting credit requests
   - Requesting payouts
3. **Admin Processing**: Only admins can complete onboarding requests
4. **Status Tracking**: Onboarding status is stored on the user record and updated when admin completes the request

---

## Testing Notes

1. **Test onboarding flow**:
   - Submit request without message (should work)
   - Submit request with message (should work)
   - Try to submit second request while first is pending (should fail)
   - Check status after submission
   - After admin completes, check status again

2. **Test edge cases**:
   - User who already completed onboarding tries to submit new request (should fail)
   - Check status for user who never submitted request (should return null latestRequest)

---

**Last Updated**: 2025-12-09

