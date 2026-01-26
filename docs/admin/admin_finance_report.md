# Admin Finance/Charges Report API Documentation

This document describes the Finance/Charges Report endpoint for the BuyTikTokCoins platform. This endpoint provides comprehensive financial data for bookkeeping, including all fees, conversion charges, and financial metrics related to withdrawals and payouts.

## Base URL

The endpoint is prefixed with `/api/admin/finance`

## Authentication

All endpoints require admin authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <admin_jwt_token>
```

---

## Endpoint

### Get Finance/Charges Report

Retrieve comprehensive financial data for bookkeeping, including all processing fees, conversion charges, exchange rates, and transaction details.

**Endpoint:** `GET /api/admin/finance/report`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `type` | string | No | 'all' | Filter by transaction type: `all`, `payout`, `withdrawal` |
| `dateFrom` | string | No | - | Start date for date range filter (ISO 8601 format, e.g., `2025-12-01`) |
| `dateTo` | string | No | - | End date for date range filter (ISO 8601 format, e.g., `2025-12-31`) |

**Example Request:**

```bash
GET /api/admin/finance/report?dateFrom=2025-12-01&dateTo=2025-12-31&type=payout
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalTransactions": 150,
      "totalAmountUsd": 10000.00,
      "totalAmountNgn": 15000000.00,
      "totalProcessingFees": 7500.00,
      "totalNetAmount": 14992500.00,
      "averageExchangeRate": 1500.00
    },
    "transactions": [
      {
        "id": "daf30a53-d0cd-4962-a392-234ad2452bb6",
        "userId": "2b4073c2-e8af-4da9-a136-93ae2c03abaa",
        "user": {
          "id": "2b4073c2-e8af-4da9-a136-93ae2c03abaa",
          "email": "user@example.com",
          "firstName": "John",
          "lastName": "Doe"
        },
        "type": "payout",
        "amount": 50.00,
        "amountInNgn": 75000.00,
        "exchangeRate": 1500.00,
        "processingFee": 50.00,
        "netAmount": 74950.00,
        "status": "completed",
        "description": "Payout to First City Monument Bank 5903400017 - Payout daf30a53-d0cd-4962-a392-234ad2452bb6",
        "date": "2025-12-09T07:32:24.191Z",
        "createdAt": "2025-12-09T07:32:24.191Z"
      }
    ],
    "filters": {
      "dateFrom": "2025-12-01",
      "dateTo": "2025-12-31",
      "type": "payout"
    }
  }
}
```

**Response Fields Explanation:**

### Summary Object

- **totalTransactions**: Total number of withdrawal/payout transactions in the period
- **totalAmountUsd**: Total amount withdrawn in USD
- **totalAmountNgn**: Total amount converted to NGN (before fees)
- **totalProcessingFees**: Total processing fees collected in NGN
- **totalNetAmount**: Total net amount paid to users in NGN (after fees)
- **averageExchangeRate**: Average exchange rate used across all transactions

### Transaction Object

Each transaction includes:
- **id**: Transaction UUID
- **userId**: User ID
- **user**: User details (email, name)
- **type**: Transaction type (`payout` or `withdrawal`)
- **amount**: Amount in USD
- **amountInNgn**: Amount converted to NGN (at time of transaction)
- **exchangeRate**: Exchange rate used (USD to NGN)
- **processingFee**: Processing fee charged in NGN
- **netAmount**: Net amount paid to user in NGN (amountInNgn - processingFee)
- **status**: Transaction status
- **description**: Transaction description
- **date**: Transaction date
- **createdAt**: Creation timestamp

**Error Responses:**

- `401 Unauthorized`: Invalid or missing authentication token
- `403 Forbidden`: User does not have admin permissions
- `500 Internal Server Error`: Server error

---

## Use Cases

### 1. Monthly Finance Report

Get all financial data for a specific month:

```bash
GET /api/admin/finance/report?dateFrom=2025-12-01&dateTo=2025-12-31
```

### 2. Payout-Only Report

Get financial data for payouts only:

```bash
GET /api/admin/finance/report?type=payout&dateFrom=2025-12-01&dateTo=2025-12-31
```

### 3. Quarterly Report

Get financial data for a quarter:

```bash
GET /api/admin/finance/report?dateFrom=2025-10-01&dateTo=2025-12-31
```

### 4. All-Time Report

Get all financial data (no date filters):

```bash
GET /api/admin/finance/report
```

---

## Finance Data for Bookkeeping

This endpoint provides all the data needed for proper bookkeeping:

### 1. **Revenue (Processing Fees)**
- `totalProcessingFees`: Total fees collected from users
- Individual `processingFee` per transaction

### 2. **Currency Conversion**
- `totalAmountUsd`: Total USD withdrawn
- `totalAmountNgn`: Total NGN equivalent
- `averageExchangeRate`: Average rate used
- Individual `exchangeRate` per transaction

### 3. **Payments Made**
- `totalNetAmount`: Total NGN paid to users (after fees)
- Individual `netAmount` per transaction

### 4. **Transaction Details**
- Full transaction history with all financial data
- User information for reconciliation
- Dates for period-based reporting

---

## Example Calculations

**For a single transaction:**
- User withdraws: $50 USD
- Exchange rate: 1500 NGN/USD
- Amount in NGN: ₦75,000
- Processing fee: ₦50
- Net amount paid: ₦74,950

**For the summary:**
- Total USD withdrawn: $10,000
- Total NGN equivalent: ₦15,000,000
- Total fees collected: ₦7,500
- Net amount paid: ₦14,992,500

---

## Notes

- All amounts are in their respective currencies (USD or NGN)
- Exchange rates are stored at the time of transaction
- Processing fees are always in NGN
- Date range filters are inclusive of both start and end dates
- Only completed, pending, and rejected transactions are included
- The report focuses on withdrawals/payouts (transactions that have fees)

---

## Testing

### Example cURL Command

```bash
curl -X GET "http://localhost:3001/api/admin/finance/report?dateFrom=2025-12-01&dateTo=2025-12-31" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

---

## Support

For issues or questions regarding the Finance Report API, please contact the development team.

