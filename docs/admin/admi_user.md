# Admin User Management - API Documentation

## Overview
This document describes the Admin User Management endpoints for the BuyTikTokCoins platform. These endpoints allow admins to view users, manage onboarding, and suspend/unsuspend user accounts.

**Base URL**: `http://localhost:3001/api` (Development)  
**Authentication**: All endpoints require JWT token with admin or super_admin role

---

## Endpoints

### 1. Get All Users

**Endpoint:** `GET /api/admin/users`

**Description:** Get all users with filtering, search, and pagination. Perfect for finding users that need onboarding.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 50)
- `search` (optional): Search by name, email, phone, or username
- `status` (optional): Filter by status - `"all"` | `"active"` | `"suspended"` | `"frozen"` (default: "all")
- `onboardingStatus` (optional): Filter by onboarding status - `"all"` | `"pending"` | `"completed"` (default: "all")

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "username": "john_doe_1234",
        "phone": "+1234567890",
        "balance": 1250.50,
        "status": "active",
        "onboardingStatus": "pending",
        "emailVerified": true,
        "walletStatus": "active",
        "joinedAt": "2024-01-01T00:00:00Z",
        "createdAt": "2024-01-01T00:00:00Z"
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

**Use Cases:**
- **Find users needing onboarding**: `GET /api/admin/users?onboardingStatus=pending`
- **Search for specific user**: `GET /api/admin/users?search=john`
- **View suspended users**: `GET /api/admin/users?status=suspended`
- **Combined filters**: `GET /api/admin/users?onboardingStatus=pending&status=active&page=1&limit=20`

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Insufficient permissions (not admin)

---

### 2. Get User by ID

**Endpoint:** `GET /api/admin/users/:id`

**Description:** Get detailed information about a specific user, including their latest onboarding request.

**Headers:**
```
Authorization: Bearer <admin_token>
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
    "username": "john_doe_1234",
    "phone": "+1234567890",
    "balance": 1250.50,
    "status": "active",
    "onboardingStatus": "pending",
    "emailVerified": true,
    "walletStatus": "active",
    "joinedAt": "2024-01-01T00:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-20T10:30:00Z",
    "onboardingRequest": {
      "id": "uuid",
      "message": "I need help setting up my TikTok account",
      "status": "pending",
      "submittedAt": "2024-01-15T10:30:00Z",
      "completedAt": null,
      "notes": null
    }
  }
}
```

**Note:** If user has no onboarding request, `onboardingRequest` will be `null`.

**Error Responses:**
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: User not found

---

### 3. Complete User Onboarding

**Endpoint:** `POST /api/admin/users/:id/complete-onboarding`

**Description:** Mark a user as onboarded and store onboarding notes (bank account, PayPal, payment method details, etc.) for record keeping. This is critical for tying incoming funds to creators.

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "notes": "Bank: First Bank of Nigeria, Account Number: 1234567890, Account Name: John Doe. PayPal: john.doe@example.com. Payment method set up on user's device on 2024-01-20. Meeting completed successfully. User understands the process."
}
```

**Validation Rules:**
- `notes`: Required, minimum 10 characters
- Should include: Bank account details, PayPal (if applicable), payment method setup confirmation, any relevant meeting notes

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Onboarding completed successfully",
  "data": {
    "userId": "uuid",
    "onboardingStatus": "completed",
    "onboardingRequest": {
      "id": "uuid",
      "status": "completed",
      "completedAt": "2024-01-20T11:00:00Z",
      "completedBy": "admin_uuid",
      "notes": "Bank: First Bank of Nigeria, Account Number: 1234567890..."
    }
  }
}
```

**What Happens:**
1. User's `onboardingStatus` is updated to `"completed"`
2. Onboarding request is marked as `"completed"`
3. Notes are stored in the database for record keeping
4. User can now submit credit requests

**Error Responses:**
- `400 Bad Request`: User already onboarded or validation errors
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: User not found

**Example Request:**
```bash
curl -X POST http://localhost:3001/api/admin/users/uuid/complete-onboarding \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Bank: First Bank, Account: 1234567890, PayPal: user@example.com. Payment method configured on device."
  }'
```

---

### 4. Suspend User

**Endpoint:** `POST /api/admin/users/:id/suspend`

**Description:** Suspend a user account. Suspended users cannot login or use the platform.

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "Violation of terms of service - multiple fraudulent credit requests"
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
    "id": "uuid",
    "status": "suspended"
  }
}
```

**Error Responses:**
- `400 Bad Request`: User already suspended or validation errors
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: User not found

---

### 5. Unsuspend User

**Endpoint:** `POST /api/admin/users/:id/unsuspend`

**Description:** Restore a suspended user account to active status.

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
    "id": "uuid",
    "status": "active"
  }
}
```

**Error Responses:**
- `400 Bad Request`: User is not suspended
- `401 Unauthorized`: Invalid or missing token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: User not found

---

## Complete Onboarding Workflow

### Step-by-Step Process

1. **View Users Needing Onboarding**
   ```
   GET /api/admin/users?onboardingStatus=pending
   ```
   - Shows all users with `onboardingStatus: "pending"`
   - Use pagination to browse through users

2. **View User Details**
   ```
   GET /api/admin/users/:id
   ```
   - See user's full profile
   - Check if they have an onboarding request message
   - View their current balance and status

3. **Set Up Payment Method**
   - Admin contacts user
   - Sets up payment method on user's device
   - Configures TikTok account connection
   - Schedules/conducts meeting if needed

4. **Complete Onboarding with Notes**
   ```
   POST /api/admin/users/:id/complete-onboarding
   {
     "notes": "Bank: [Bank Name], Account: [Account Number], PayPal: [PayPal Email]. Payment method set up on [Date]. Meeting notes: [Details]"
   }
   ```
   - **Important**: Include all payment details in notes
   - This links incoming funds to the creator
   - Notes are stored permanently for record keeping

5. **User Can Now Submit Credit Requests**
   - Once onboarding is completed, user can submit credit requests
   - User's `onboardingStatus` is now `"completed"`

---

## Frontend Implementation Examples

### React Hook for User Management

```javascript
import { useState } from 'react';
import axios from 'axios';

const useAdminUsers = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getUsers = async (filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: filters.page || 1,
        limit: filters.limit || 10,
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.onboardingStatus && { onboardingStatus: filters.onboardingStatus }),
      });

      const response = await axios.get(
        `http://localhost:3001/api/admin/users?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLoading(false);
      return { success: true, data: response.data.data };
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || 'Failed to fetch users';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const getUserById = async (userId) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        `http://localhost:3001/api/admin/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLoading(false);
      return { success: true, data: response.data.data };
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || 'Failed to fetch user';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const completeOnboarding = async (userId, notes) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(
        `http://localhost:3001/api/admin/users/${userId}/complete-onboarding`,
        { notes },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLoading(false);
      return { success: true, data: response.data.data };
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || 'Failed to complete onboarding';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const suspendUser = async (userId, reason) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(
        `http://localhost:3001/api/admin/users/${userId}/suspend`,
        { reason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLoading(false);
      return { success: true, data: response.data.data };
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || 'Failed to suspend user';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const unsuspendUser = async (userId) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(
        `http://localhost:3001/api/admin/users/${userId}/unsuspend`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLoading(false);
      return { success: true, data: response.data.data };
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || 'Failed to unsuspend user';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  return {
    getUsers,
    getUserById,
    completeOnboarding,
    suspendUser,
    unsuspendUser,
    loading,
    error,
  };
};

export default useAdminUsers;
```

### React Component Example

```javascript
import React, { useState, useEffect } from 'react';
import useAdminUsers from './hooks/useAdminUsers';

const UserManagement = () => {
  const {
    getUsers,
    getUserById,
    completeOnboarding,
    suspendUser,
    unsuspendUser,
    loading,
    error,
  } = useAdminUsers();

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    onboardingStatus: 'pending', // Show pending users by default
    status: 'all',
    search: '',
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [onboardingNotes, setOnboardingNotes] = useState('');

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    const result = await getUsers(filters);
    if (result.success) {
      setUsers(result.data.users);
      setPagination(result.data.pagination);
    }
  };

  const handleViewUser = async (userId) => {
    const result = await getUserById(userId);
    if (result.success) {
      setSelectedUser(result.data);
    }
  };

  const handleCompleteOnboarding = async (userId) => {
    if (!onboardingNotes || onboardingNotes.length < 10) {
      alert('Please provide onboarding notes (minimum 10 characters)');
      return;
    }

    const result = await completeOnboarding(userId, onboardingNotes);
    if (result.success) {
      alert('Onboarding completed successfully!');
      setOnboardingNotes('');
      setSelectedUser(null);
      loadUsers(); // Refresh list
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  return (
    <div className="user-management">
      <h1>User Management</h1>

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search users..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
        />
        <select
          value={filters.onboardingStatus}
          onChange={(e) => setFilters({ ...filters, onboardingStatus: e.target.value, page: 1 })}
        >
          <option value="all">All Users</option>
          <option value="pending">Pending Onboarding</option>
          <option value="completed">Onboarded</option>
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="frozen">Frozen</option>
        </select>
      </div>

      {/* Users List */}
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Balance</th>
            <th>Onboarding</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.firstName} {user.lastName}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>${user.balance.toFixed(2)}</td>
              <td>
                <span className={`badge ${user.onboardingStatus === 'completed' ? 'success' : 'warning'}`}>
                  {user.onboardingStatus}
                </span>
              </td>
              <td>
                <span className={`badge ${user.status === 'active' ? 'success' : 'danger'}`}>
                  {user.status}
                </span>
              </td>
              <td>
                <button onClick={() => handleViewUser(user.id)}>View</button>
                {user.onboardingStatus === 'pending' && (
                  <button onClick={() => setSelectedUser(user)}>Onboard</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        <button
          disabled={pagination.currentPage === 1}
          onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
        >
          Previous
        </button>
        <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
        <button
          disabled={pagination.currentPage === pagination.totalPages}
          onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
        >
          Next
        </button>
      </div>

      {/* Onboarding Modal */}
      {selectedUser && selectedUser.onboardingStatus === 'pending' && (
        <div className="modal">
          <h2>Complete Onboarding: {selectedUser.firstName} {selectedUser.lastName}</h2>
          <p><strong>Email:</strong> {selectedUser.email}</p>
          <p><strong>Phone:</strong> {selectedUser.phone}</p>

          <label>
            Onboarding Notes (Required - min 10 characters):
            <textarea
              rows={6}
              placeholder="Bank: [Bank Name], Account: [Account Number], PayPal: [PayPal Email]. Payment method set up on [Date]. Meeting notes: [Details]"
              value={onboardingNotes}
              onChange={(e) => setOnboardingNotes(e.target.value)}
            />
            <small>Include bank account, PayPal, payment method setup details, and any meeting notes</small>
          </label>

          <div className="modal-actions">
            <button onClick={() => handleCompleteOnboarding(selectedUser.id)}>
              Complete Onboarding
            </button>
            <button onClick={() => {
              setSelectedUser(null);
              setOnboardingNotes('');
            }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
```

---

## Data Types

### User Status Values
- `"active"` - User account is active
- `"suspended"` - User account is suspended
- `"frozen"` - User account is frozen

### Onboarding Status Values
- `"pending"` - User has not completed onboarding
- `"completed"` - User has completed onboarding

### Wallet Status Values
- `"active"` - Wallet is active
- `"frozen"` - Wallet is frozen

---

## Important Notes

### Onboarding Notes Format

When completing onboarding, the notes should include:

1. **Bank Account Details:**
   - Bank name
   - Account number
   - Account name

2. **PayPal Details (if applicable):**
   - PayPal email address

3. **Payment Method Setup:**
   - Confirmation that payment method was set up on user's device
   - Date of setup

4. **Meeting Notes (if applicable):**
   - Meeting date/time
   - Key discussion points
   - Any agreements or instructions

**Example:**
```
Bank: First Bank of Nigeria, Account Number: 1234567890, Account Name: John Doe. 
PayPal: john.doe@example.com. 
Payment method configured on user's device on 2024-01-20. 
Meeting completed on 2024-01-20 at 2:00 PM. User understands the process and has agreed to terms.
```

### Why Notes Are Critical

- **Fund Tracking**: Notes link incoming funds to specific creators
- **Record Keeping**: Permanent record of payment method details
- **Audit Trail**: Complete history of onboarding process
- **Support**: Reference for customer support inquiries

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error message",
  "error": "Error type",
  "statusCode": 400
}
```

**Common Error Codes:**
- `400` - Bad Request (validation errors, user already onboarded, etc.)
- `401` - Unauthorized (invalid or missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (user not found)

---

## Authentication

All endpoints require JWT authentication with admin or super_admin role:

```
Authorization: Bearer <admin_jwt_token>
```

To obtain an admin token:
1. Login: `POST /api/admin/auth/login`
2. Use the returned token in subsequent requests

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

## Support

For issues or questions, contact the backend team.

**Last Updated**: 2025-12-07

