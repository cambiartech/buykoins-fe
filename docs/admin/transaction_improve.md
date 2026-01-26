# Admin Transactions Management API Documentation

This document describes the Admin Transactions Management endpoints for the BuyTikTokCoins platform. These endpoints allow administrators to view, filter, and analyze all platform transactions with flexible filtering capabilities designed to scale for future transaction types (giftcards, crypto, etc.).

## Important: Transaction Analysis Philosophy

Transactions are kept **separate** (each is a distinct event), but statistics are **smart** to show the actual financial state:

- **Credits** (money coming in): Sum of all credit transactions
- **Withdrawals/Payouts** (money going out): Sum of all withdrawal + payout transactions
- **Net Balance**: Credits - Withdrawals = Actual value remaining in user wallets
- **Total Volume**: Sum of absolute values = Total activity level (for reference)

**Example Journey:**
1. User requests credit: +$50 (credit transaction created)
2. Admin approves: Credits wallet
3. User withdraws: -$50 (payout transaction created)

**Statistics show:**
- Total Credits: $50
- Total Withdrawals: $50
- Net Balance: $0 ✅ (correct! no money left)
- Total Volume: $100 (shows activity level)

This prevents double-counting and accurately reflects the platform's financial state.

**Complex Scenario:**
- User receives multiple credits: $50 + $70 = $120 accumulated
- User withdraws $120 from accumulated balance
- Statistics show:
  - Total Credits: $120
  - Total Withdrawals: $120
  - Net Balance: $0 ✅
  - Total Volume: $240 (activity level)

## Base URL

All endpoints are prefixed with `/api/admin/transactions`

## Authentication

All endpoints require admin authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <admin_jwt_token>
```

---

## Endpoints

### 1. Get All Transactions

Retrieve all transactions with flexible filtering, pagination, and search capabilities.

**Endpoint:** `GET /api/admin/transactions`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number for pagination |
| `limit` | number | No | 10 | Number of items per page (max: 100) |
| `type` | string | No | 'all' | Filter by transaction type: `all`, `credit`, `withdrawal`, `payout`. Future types: `giftcard`, `crypto`, etc. |
| `status` | string | No | 'all' | Filter by status: `all`, `completed`, `pending`, `rejected` |
| `userId` | string | No | - | Filter by specific user ID |
| `search` | string | No | - | Search in description, user email, name, username, or user ID |
| `dateFrom` | string | No | - | Start date for date range filter (ISO 8601 format, e.g., `2025-12-01`) |
| `dateTo` | string | No | - | End date for date range filter (ISO 8601 format, e.g., `2025-12-31`) |

**Example Request:**

```bash
GET /api/admin/transactions?page=1&limit=20&type=credit&status=completed&dateFrom=2025-12-01&dateTo=2025-12-31&search=creator123
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "18be26bb-7b1c-4cb5-9f95-43af431ddd6d",
        "userId": "2b4073c2-e8af-4da9-a136-93ae2c03abaa",
        "user": {
          "id": "2b4073c2-e8af-4da9-a136-93ae2c03abaa",
          "email": "user@example.com",
          "firstName": "John",
          "lastName": "Doe",
          "phone": "+2348080957681",
          "username": "johndoe_1234"
        },
        "type": "credit",
        "amount": 500.00,
        "status": "completed",
        "description": "Credit from TikTok earnings - Request 44952328-6800-403d-a32c-0b98bff748c7",
        "referenceId": "44952328-6800-403d-a32c-0b98bff748c7",
        "date": "2025-12-09T06:42:53.019Z",
        "createdAt": "2025-12-09T06:42:53.019Z"
      },
      {
        "id": "daf30a53-d0cd-4962-a392-234ad2452bb6",
        "userId": "2b4073c2-e8af-4da9-a136-93ae2c03abaa",
        "user": {
          "id": "2b4073c2-e8af-4da9-a136-93ae2c03abaa",
          "email": "user@example.com",
          "firstName": "John",
          "lastName": "Doe",
          "phone": "+2348080957681",
          "username": "johndoe_1234"
        },
        "type": "payout",
        "amount": 250.00,
        "status": "pending",
        "description": "Payout request - daf30a53-d0cd-4962-a392-234ad2452bb6",
        "referenceId": "daf30a53-d0cd-4962-a392-234ad2452bb6",
        "date": "2025-12-09T07:32:24.191Z",
        "createdAt": "2025-12-09T07:32:24.191Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "itemsPerPage": 20
    },
    "filters": {
      "type": "credit",
      "status": "completed",
      "userId": null,
      "search": "creator123",
      "dateFrom": "2025-12-01",
      "dateTo": "2025-12-31"
    }
  }
}
```

**Transaction Types:**

- `credit`: Credits added to user accounts (from TikTok earnings, giftcards, etc.)
- `withdrawal`: Withdrawals from user accounts
- `payout`: Payouts processed to user bank accounts
- Future types: `giftcard`, `crypto`, etc. (will be automatically supported)

**Transaction Statuses:**

- `completed`: Transaction successfully completed
- `pending`: Transaction is pending processing
- `rejected`: Transaction was rejected

**Error Responses:**

- `401 Unauthorized`: Invalid or missing authentication token
- `403 Forbidden`: User does not have admin permissions
- `500 Internal Server Error`: Server error

---

### 2. Get Transaction by ID

Retrieve detailed information about a specific transaction.

**Endpoint:** `GET /api/admin/transactions/:id`

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Transaction UUID |

**Example Request:**

```bash
GET /api/admin/transactions/18be26bb-7b1c-4cb5-9f95-43af431ddd6d
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "18be26bb-7b1c-4cb5-9f95-43af431ddd6d",
    "userId": "2b4073c2-e8af-4da9-a136-93ae2c03abaa",
    "user": {
      "id": "2b4073c2-e8af-4da9-a136-93ae2c03abaa",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+2348080957681",
      "username": "johndoe_1234",
      "balance": 750.00
    },
    "type": "credit",
    "amount": 500.00,
    "status": "completed",
    "description": "Credit from TikTok earnings - Request 44952328-6800-403d-a32c-0b98bff748c7",
    "referenceId": "44952328-6800-403d-a32c-0b98bff748c7",
    "date": "2025-12-09T06:42:53.019Z",
    "createdAt": "2025-12-09T06:42:53.019Z",
    "updatedAt": "2025-12-09T06:42:53.019Z"
  }
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid or missing authentication token
- `403 Forbidden`: User does not have admin permissions
- `404 Not Found`: Transaction not found
- `500 Internal Server Error`: Server error

---

### 3. Get Transaction Statistics

Retrieve aggregated statistics and summaries for transactions with optional filtering.

**Endpoint:** `GET /api/admin/transactions/stats/summary`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `type` | string | No | 'all' | Filter by transaction type: `all`, `credit`, `withdrawal`, `payout` |
| `status` | string | No | 'all' | Filter by status: `all`, `completed`, `pending`, `rejected` |
| `dateFrom` | string | No | - | Start date for date range filter (ISO 8601 format) |
| `dateTo` | string | No | - | End date for date range filter (ISO 8601 format) |

**Example Request:**

```bash
GET /api/admin/transactions/stats/summary?type=all&status=completed&dateFrom=2025-12-01&dateTo=2025-12-31
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalTransactions": 1500,
      "totalCredits": 125000.00,
      "totalWithdrawals": 100000.00,
      "netBalance": 25000.00,
      "totalVolume": 225000.00,
      "completedCredits": 120000.00,
      "completedWithdrawals": 95000.00,
      "completedNetBalance": 25000.00
    },
    "byType": [
      {
        "type": "credit",
        "count": 800,
        "totalAmount": 125000.00
      },
      {
        "type": "payout",
        "count": 500,
        "totalAmount": 95000.00
      },
      {
        "type": "withdrawal",
        "count": 200,
        "totalAmount": 5000.00
      }
    ],
    "byStatus": [
      {
        "status": "completed",
        "count": 1200
      },
      {
        "status": "pending",
        "count": 250
      },
      {
        "status": "rejected",
        "count": 50
      }
    ]
  }
}
```

**Statistics Breakdown:**

The statistics provide a **smart analysis** that separates credits from withdrawals to show the actual value in the system:

- **summary**: Overall statistics with intelligent breakdown:
  - **totalTransactions**: Total count of all transactions
  - **totalCredits**: Sum of all credit transactions (money coming in)
  - **totalWithdrawals**: Sum of all withdrawal + payout transactions (money going out)
  - **netBalance**: Actual value in system = `totalCredits - totalWithdrawals` (this is the real money in wallets)
  - **totalVolume**: Total transaction volume = sum of absolute values (shows activity level, not net value)
  - **completedCredits**: Credits that are completed
  - **completedWithdrawals**: Withdrawals that are completed
  - **completedNetBalance**: Net balance for completed transactions only

- **byType**: Breakdown of transactions by type (credit, payout, withdrawal, etc.)
- **byStatus**: Breakdown of transactions by status (completed, pending, rejected)

**Example Scenario:**
- User credits $50 → `totalCredits: $50`
- User withdraws $50 → `totalWithdrawals: $50`
- Result: `netBalance: $0` (correct! no money left in system)
- `totalVolume: $100` (shows total activity, not net value)

This prevents double-counting and shows the actual financial state of the platform.

**Error Responses:**

- `401 Unauthorized`: Invalid or missing authentication token
- `403 Forbidden`: User does not have admin permissions
- `500 Internal Server Error`: Server error

---

## Filtering and Search

### Type Filtering

The `type` parameter supports filtering by transaction type. Current types:
- `credit`: Credits to user accounts
- `withdrawal`: Withdrawals from accounts
- `payout`: Payouts to bank accounts

**Future Scalability:** The system is designed to automatically support new transaction types (e.g., `giftcard`, `crypto`) without code changes. Simply add the new type to the `TransactionType` enum in the database, and it will be available for filtering.

### Status Filtering

Filter transactions by their processing status:
- `completed`: Successfully processed
- `pending`: Awaiting processing
- `rejected`: Rejected transactions

### Date Range Filtering

Use `dateFrom` and `dateTo` to filter transactions within a specific date range:
- Dates should be in ISO 8601 format (e.g., `2025-12-01`)
- `dateFrom` is inclusive (starts at 00:00:00)
- `dateTo` is inclusive (ends at 23:59:59)

**Example:**
```
dateFrom=2025-12-01&dateTo=2025-12-31
```

### Search Functionality

The `search` parameter performs a case-insensitive search across:
- Transaction description
- User email
- User username
- User first name
- User last name
- User ID

**Example:**
```
search=creator123
```

This will match transactions where:
- Description contains "creator123"
- User email contains "creator123"
- User username contains "creator123"
- User name contains "creator123"
- User ID contains "creator123"

### Combined Filters

All filters can be combined for precise queries:

```
GET /api/admin/transactions?type=credit&status=completed&dateFrom=2025-12-01&dateTo=2025-12-31&search=john&page=1&limit=20
```

This query will return:
- Only credit transactions
- That are completed
- Between December 1-31, 2025
- Where the user or description matches "john"
- Paginated with 20 items per page

---

## Pagination

All list endpoints support pagination:

- **page**: Page number (starts at 1)
- **limit**: Items per page (default: 10, max: 100)

**Response includes pagination metadata:**
```json
{
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "itemsPerPage": 20
  }
}
```

---

## Response Format

All endpoints follow a consistent response format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message here"
}
```

---

## Transaction Data Model

### Transaction Object

```typescript
{
  id: string;                    // UUID
  userId: string;                // UUID of the user
  user: {                        // User details (null if association fails)
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    username: string;
    balance?: number;             // Only in getTransactionById
  };
  type: 'credit' | 'withdrawal' | 'payout' | ...;  // Transaction type
  amount: number;                // Transaction amount (USD)
  status: 'completed' | 'pending' | 'rejected';
  description: string;           // Transaction description
  referenceId: string;           // Reference to related entity (credit_request, payout, etc.)
  date: string;                  // ISO 8601 date
  createdAt: string;             // ISO 8601 date
  updatedAt?: string;            // ISO 8601 date (only in getTransactionById)
}
```

---

## Use Cases

### 1. View All Transactions

Get a paginated list of all transactions:

```bash
GET /api/admin/transactions?page=1&limit=50
```

### 2. Filter by Type

View only credit transactions:

```bash
GET /api/admin/transactions?type=credit
```

### 3. Filter by Status

View only pending transactions:

```bash
GET /api/admin/transactions?status=pending
```

### 4. Search for User Transactions

Find all transactions for a specific user:

```bash
GET /api/admin/transactions?search=user@example.com
```

Or by user ID:

```bash
GET /api/admin/transactions?userId=2b4073c2-e8af-4da9-a136-93ae2c03abaa
```

### 5. Date Range Filtering

View transactions for a specific month:

```bash
GET /api/admin/transactions?dateFrom=2025-12-01&dateTo=2025-12-31
```

### 6. Combined Filters

Complex filtering example:

```bash
GET /api/admin/transactions?type=credit&status=completed&dateFrom=2025-12-01&dateTo=2025-12-31&page=1&limit=20
```

### 7. Get Statistics

Get overall transaction statistics:

```bash
GET /api/admin/transactions/stats/summary
```

Get statistics for a specific period:

```bash
GET /api/admin/transactions/stats/summary?dateFrom=2025-12-01&dateTo=2025-12-31
```

### 8. View Transaction Details

Get detailed information about a specific transaction:

```bash
GET /api/admin/transactions/18be26bb-7b1c-4cb5-9f95-43af431ddd6d
```

---

## Future Scalability

The transaction system is designed to be scalable and flexible:

1. **New Transaction Types**: To add new transaction types (e.g., `giftcard`, `crypto`):
   - Add the new type to the `TransactionType` enum in the database
   - The filtering system will automatically support it
   - No code changes required for basic filtering

2. **Extended Metadata**: The `description` and `referenceId` fields can store additional context for any transaction type.

3. **Custom Filters**: The flexible filtering system can be extended to support additional filters as needed.

---

## Notes

- All amounts are in USD
- Dates are returned in ISO 8601 format (UTC)
- The maximum limit per page is 100 transactions
- Search is case-insensitive
- Date range filters are inclusive of both start and end dates
- User association may fail in some cases; the system includes fallback logic to manually fetch user data

## Transaction Analysis Logic

### Why Keep Transactions Separate?

Each transaction represents a distinct event in the user journey:
- **Credit Transaction**: Created when admin approves a credit request
- **Payout Transaction**: Created when admin processes a payout
- **Withdrawal Transaction**: Created for other withdrawal types

A user might:
- Receive multiple credits ($50 + $70 = $120 accumulated)
- Withdraw $120 from their accumulated balance
- This creates 3 separate transactions (2 credits, 1 payout)

Keeping them separate allows tracking the full journey while statistics show the net result.

### Statistics Calculation

The statistics endpoint provides:
1. **Total Credits**: All money that entered the system
2. **Total Withdrawals**: All money that left the system
3. **Net Balance**: Credits - Withdrawals = Actual value in user wallets
4. **Total Volume**: Sum of absolute values = Activity level (for analytics)

This approach:
- ✅ Prevents double-counting
- ✅ Shows actual financial state
- ✅ Handles complex scenarios (multiple credits, single withdrawal)
- ✅ Provides activity metrics (total volume)

## Transaction Analysis Logic

### Why Keep Transactions Separate?

Each transaction represents a distinct event in the user journey:
- **Credit Transaction**: Created when admin approves a credit request
- **Payout Transaction**: Created when admin processes a payout
- **Withdrawal Transaction**: Created for other withdrawal types

A user might:
- Receive multiple credits ($50 + $70 = $120 accumulated)
- Withdraw $120 from their accumulated balance
- This creates 3 separate transactions (2 credits, 1 payout)

Keeping them separate allows tracking the full journey while statistics show the net result.

### Statistics Calculation

The statistics endpoint provides:
1. **Total Credits**: All money that entered the system
2. **Total Withdrawals**: All money that left the system
3. **Net Balance**: Credits - Withdrawals = Actual value in user wallets
4. **Total Volume**: Sum of absolute values = Activity level (for analytics)

This approach:
- ✅ Prevents double-counting
- ✅ Shows actual financial state
- ✅ Handles complex scenarios (multiple credits, single withdrawal)
- ✅ Provides activity metrics (total volume)

---

## Testing

### Example cURL Commands

**Get all transactions:**
```bash
curl -X GET "http://localhost:3001/api/admin/transactions?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

**Filter by type and status:**
```bash
curl -X GET "http://localhost:3001/api/admin/transactions?type=credit&status=completed" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

**Search transactions:**
```bash
curl -X GET "http://localhost:3001/api/admin/transactions?search=creator123" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

**Get statistics:**
```bash
curl -X GET "http://localhost:3001/api/admin/transactions/stats/summary?dateFrom=2025-12-01&dateTo=2025-12-31" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

**Get transaction by ID:**
```bash
curl -X GET "http://localhost:3001/api/admin/transactions/18be26bb-7b1c-4cb5-9f95-43af431ddd6d" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

---

## Support

For issues or questions regarding the Admin Transactions API, please contact the development team.

