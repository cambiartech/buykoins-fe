# Change Password - API Documentation

## Overview
This document describes the Change Password endpoint for the BuyTikTokCoins platform. This endpoint allows authenticated users to change their account password.

**Base URL**: `http://localhost:3001/api` (Development)  
**Authentication**: Required - JWT token must be included in the Authorization header

---

## Endpoint

### Change Password

**Endpoint:** `POST /api/auth/change-password`

**Description:** Change the password for the authenticated user. Requires the current password for verification.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "CurrentPassword123!",
  "newPassword": "NewSecurePassword123!"
}
```

**Validation Rules:**
- `currentPassword`: Required, must match the user's current password
- `newPassword`: Required, minimum 6 characters, must be different from current password

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Responses:**

**401 Unauthorized - Incorrect Current Password:**
```json
{
  "success": false,
  "message": "Current password is incorrect",
  "error": "Unauthorized",
  "statusCode": 401
}
```

**400 Bad Request - Same Password:**
```json
{
  "success": false,
  "message": "New password must be different from current password",
  "error": "Bad Request",
  "statusCode": 400
}
```

**400 Bad Request - Validation Error:**
```json
{
  "success": false,
  "message": [
    "currentPassword should not be empty",
    "newPassword must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

**404 Not Found - User Not Found:**
```json
{
  "success": false,
  "message": "User not found",
  "error": "Not Found",
  "statusCode": 404
}
```

---

## Security Features

### Password Requirements
- **Minimum Length**: 6 characters
- **Hashing**: Passwords are hashed using bcrypt with 10 salt rounds
- **Verification**: Current password must be verified before allowing change
- **Uniqueness**: New password must be different from current password

### Rate Limiting
- **Limit**: 5 requests per hour per user
- **Purpose**: Prevents brute force attacks and password enumeration

### Authentication
- **Required**: JWT token must be valid and not expired
- **User Context**: Password can only be changed for the authenticated user's account

---

## Usage Examples

### Example 1: Successful Password Change

**Request:**
```bash
curl -X POST http://localhost:3001/api/auth/change-password \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "OldPassword123!",
    "newPassword": "NewSecurePassword456!"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Example 2: Incorrect Current Password

**Request:**
```bash
curl -X POST http://localhost:3001/api/auth/change-password \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "WrongPassword",
    "newPassword": "NewPassword123!"
  }'
```

**Response:**
```json
{
  "success": false,
  "message": "Current password is incorrect",
  "error": "Unauthorized",
  "statusCode": 401
}
```

### Example 3: Same Password Error

**Request:**
```bash
curl -X POST http://localhost:3001/api/auth/change-password \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "MyPassword123!",
    "newPassword": "MyPassword123!"
  }'
```

**Response:**
```json
{
  "success": false,
  "message": "New password must be different from current password",
  "error": "Bad Request",
  "statusCode": 400
}
```

### Example 4: JavaScript/Fetch

```javascript
const changePassword = async (currentPassword, newPassword) => {
  const token = localStorage.getItem('token'); // Get token from storage
  
  const response = await fetch('http://localhost:3001/api/auth/change-password', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      currentPassword,
      newPassword,
    }),
  });

  const data = await response.json();
  
  if (data.success) {
    console.log('Password changed successfully');
    // Optionally logout user and require re-login
  } else {
    console.error('Error:', data.message);
  }
  
  return data;
};

// Usage
changePassword('OldPass123!', 'NewPass456!');
```

### Example 5: React Hook

```javascript
import { useState } from 'react';
import axios from 'axios';

const useChangePassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const changePassword = async (currentPassword, newPassword) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3001/api/auth/change-password',
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLoading(false);
      return { success: true, data: response.data };
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || 'Failed to change password';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  return { changePassword, loading, error };
};

// Usage in component
const ChangePasswordForm = () => {
  const { changePassword, loading, error } = useChangePassword();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    const result = await changePassword(
      formData.currentPassword,
      formData.newPassword
    );

    if (result.success) {
      alert('Password changed successfully!');
      // Optionally redirect or logout
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="password"
        placeholder="Current Password"
        value={formData.currentPassword}
        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
        required
      />
      <input
        type="password"
        placeholder="New Password"
        value={formData.newPassword}
        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
        required
        minLength={6}
      />
      <input
        type="password"
        placeholder="Confirm New Password"
        value={formData.confirmPassword}
        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Changing...' : 'Change Password'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
};
```

---

## Best Practices

### For Frontend Developers

1. **Password Confirmation**: Always include a "Confirm New Password" field in the UI (client-side validation)

2. **Show Password Requirements**: Display password requirements clearly:
   - Minimum 6 characters
   - Must be different from current password

3. **Error Handling**: Handle all error cases:
   - Incorrect current password (401)
   - Same password error (400)
   - Validation errors (400)
   - Network errors

4. **Success Flow**: After successful password change:
   - Show success message
   - Optionally log out user and require re-login with new password
   - Clear any cached authentication data

5. **Rate Limiting**: Inform users if they hit the rate limit (5 requests/hour)

6. **Security**:
   - Don't store passwords in plain text
   - Use secure password input fields (type="password")
   - Consider adding password strength indicator

### For Backend Integration

1. **Token Validation**: Ensure JWT token is valid before processing
2. **Password Hashing**: New password is automatically hashed using bcrypt
3. **Logging**: Consider logging password change events for security audit
4. **Session Management**: Optionally invalidate all existing sessions after password change

---

## Response Format

All responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
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

This endpoint requires JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

To obtain a token:
1. Sign up: `POST /api/auth/signup`
2. Verify email: `POST /api/auth/verify-email`
3. Login: `POST /api/auth/login`

---

## Rate Limiting

This endpoint is rate limited:
- **Limit**: 5 requests per hour per user
- **Purpose**: Prevents brute force attacks
- **Headers**: Rate limit information is included in response headers

---

## Swagger Documentation

Interactive API documentation is available at:
- Development: `http://localhost:3001/api/docs`

You can test the endpoint directly from the Swagger UI.

---

## Security Notes

1. **Password Hashing**: All passwords are hashed using bcrypt before storage. The original password is never stored.

2. **Current Password Verification**: The current password must be provided and verified before allowing a change. This prevents unauthorized password changes.

3. **Password Uniqueness**: The new password must be different from the current password to prevent users from "changing" to the same password.

4. **Rate Limiting**: Limited to 5 requests per hour to prevent brute force attacks and password enumeration attempts.

5. **Token Required**: Only authenticated users can change their password. The user ID is extracted from the JWT token.

---

## Related Endpoints

- **Login**: `POST /api/auth/login` - Login with new password after change
- **Forgot Password**: (To be implemented) - Reset password if forgotten
- **User Profile**: `GET /api/user/profile` - View user profile

---

## Support

For issues or questions, contact the backend team.

**Last Updated**: 2025-12-07

