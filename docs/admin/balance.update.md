# Admin Transactions & Balance System Updates

## Overview

This document outlines the recent updates to admin endpoints to support the new **dual balance system** (earnings and wallet) and new transaction types (card funding, wallet deposits, etc.).

---

## 🆕 New Transaction Types

The following transaction types have been added:

1. **`deposit`** - Wallet funding via Paystack (NGN)
2. **`card_funding`** - Funding virtual cards from wallet (NGN)
3. **`transfer_earnings_to_wallet`** - Internal transfer from earnings to wallet
4. **`card_purchase`** - Card purchases/transactions (future)

### Transaction Type Reference

| Type | Description | Currency | Source Balance | Destination |
|------|-------------|----------|----------------|-------------|
| `credit` | TikTok earnings approved by admin | USD | - | `earnings` |
| `withdrawal` | General withdrawal | USD | `earnings` | External |
| `payout` | Bank payout | USD | `earnings` | Bank account |
| `deposit` | Paystack wallet funding | NGN | External | `wallet` |
| `card_funding` | Fund card from wallet | NGN | `wallet` | Card |
| `transfer_earnings_to_wallet` | Internal transfer | USD/NGN | `earnings` | `wallet` |
| `card_purchase` | Card transaction | NGN | Card | Merchant |

---

## 📊 Updated Admin Endpoints

### 1. **GET `/api/admin/transactions`**

**Changes:**
- ✅ All transactions now include `currency` field
- ✅ New transaction types are visible (`deposit`, `card_funding`, `transfer_earnings_to_wallet`)
- ✅ Currency is automatically determined:
  - `NGN` for `deposit`, `card_funding` transactions
  - `USD` for `credit`, `withdrawal`, `payout` transactions
  - `NGN` if `amountInNgn` is present

**Response Example:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "userId": "uuid",
        "user": { ... },
        "type": "card_funding",
        "amount": 300.00,
        "currency": "NGN",
        "amountInNgn": 300.00,
        "status": "completed",
        "description": "Card funding for card ending 1590",
        "date": "2026-01-19T05:15:05.000Z"
      },
      {
        "id": "uuid",
        "type": "deposit",
        "amount": 2000.00,
        "currency": "NGN",
        "amountInNgn": 2000.00,
        "description": "Wallet deposit via Paystack - PAYSTACK_xxx"
      }
    ],
    "pagination": { ... }
  }
}
```

**Query Parameters:**
- `type`: Can now filter by `deposit`, `card_funding`, `transfer_earnings_to_wallet`, `card_purchase`

---

### 2. **GET `/api/admin/transactions/:id`**

**Changes:**
- ✅ Returns `currency` field
- ✅ User data includes both `earnings` and `wallet` balances

**Response Example:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "earnings": 500.00,
      "wallet": 300.00,
      "balance": 500.00  // Backward compatibility (maps to earnings)
    },
    "type": "card_funding",
    "amount": 300.00,
    "currency": "NGN",
    "amountInNgn": 300.00,
    "status": "completed",
    "description": "Card funding for card ending 1590"
  }
}
```

---

### 3. **GET `/api/admin/transactions/stats/summary`**

**Changes:**
- ✅ Added wallet-related statistics:
  - `totalWalletDeposits` - Total deposits to wallet (NGN)
  - `totalCardFunding` - Total card funding transactions (NGN)
  - `totalEarningsToWalletTransfers` - Total internal transfers

**Response Example:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalTransactions": 10,
      "totalCredits": 550.00,
      "totalWithdrawals": 300.00,
      "netBalance": 250.00,
      "totalVolume": 850.00,
      "totalWalletDeposits": 2000.00,        // NEW
      "totalCardFunding": 300.00,            // NEW
      "totalEarningsToWalletTransfers": 0,   // NEW
      "completedCredits": 550.00,
      "completedWithdrawals": 300.00,
      "completedNetBalance": 250.00
    },
    "byType": [
      { "type": "credit", "count": 2, "totalAmount": 550.00 },
      { "type": "deposit", "count": 1, "totalAmount": 2000.00 },
      { "type": "card_funding", "count": 1, "totalAmount": 300.00 }
    ],
    "byStatus": [ ... ]
  }
}
```

---

### 4. **GET `/api/admin/users`**

**Changes:**
- ✅ Returns both `earnings` and `wallet` fields
- ✅ Includes `balance` for backward compatibility (maps to `earnings`)

**Response Example:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "earnings": 500.00,
        "wallet": 300.00,
        "balance": 500.00  // Backward compatibility
      }
    ]
  }
}
```

---

### 5. **GET `/api/admin/users/:id`**

**Changes:**
- ✅ Returns both `earnings` and `wallet` fields
- ✅ Includes `balance` for backward compatibility

---

### 6. **GET `/api/admin/dashboard`**

**Changes:**
- ✅ Payout and credit request user data includes `earnings` and `wallet`
- ✅ All user balances are properly displayed

---

## 🎴 New Admin Card Management Endpoints

### 7. **GET `/api/admin/cards`**

**Description:** Retrieve all user virtual cards with pagination, search, and filtering.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 50)
- `search`: Search by user email, card number, or user ID
- `status`: Filter by status (`all`, `active`, `frozen`, `closed`)
- `currency`: Filter by currency (`NGN`, `USD`, etc.)

**Response Example:**
```json
{
  "success": true,
  "data": {
    "cards": [
      {
        "id": "uuid",
        "userId": "uuid",
        "user": {
          "id": "uuid",
          "email": "user@example.com",
          "firstName": "John",
          "lastName": "Doe"
        },
        "cardNumber": "5064 4171 0376 3115 90",
        "cardType": "virtual",
        "currency": "NGN",
        "status": "active",
        "balance": 300.00,
        "expiryMonth": "01",
        "expiryYear": "2029",
        "isDefault": true,
        "createdAt": "2026-01-11T16:15:51.869Z"
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

---

### 8. **GET `/api/admin/cards/:id`**

**Description:** Get detailed information about a specific card.

**Response Example:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "earnings": 500.00,
      "wallet": 300.00
    },
    "cardNumber": "5064 4171 0376 3115 90",
    "cardType": "virtual",
    "currency": "NGN",
    "status": "active",
    "balance": 300.00,
    "expiryMonth": "01",
    "expiryYear": "2029",
    "isDefault": true,
    "sudoCardId": "6963dac7d0e5dc1f001bdd89",
    "sudoCustomerId": "c8caa4ad-de1e-4815-9d37-7da7ad5cedfd",
    "createdAt": "2026-01-11T16:15:51.869Z",
    "updatedAt": "2026-01-11T16:15:51.910Z"
  }
}
```

---

### 9. **GET `/api/admin/cards/:id/transactions`**

**Description:** Get transaction history for a specific card.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 50)

**Response Example:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "cardId": "uuid",
        "userId": "uuid",
        "type": "purchase",
        "amount": 150.00,
        "currency": "NGN",
        "merchantName": "TikTok",
        "description": "TikTok Coins Purchase",
        "status": "completed",
        "reference": "TXN_xxx",
        "createdAt": "2026-01-19T10:30:00.000Z"
      },
      {
        "id": "uuid",
        "type": "funding",
        "amount": 300.00,
        "currency": "NGN",
        "description": "Card funding from wallet",
        "status": "completed",
        "createdAt": "2026-01-19T09:15:00.000Z"
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

**Card Transaction Types:**
- `purchase` - Card purchase/transaction
- `funding` - Card funding from wallet
- `refund` - Refund to card
- `reversal` - Transaction reversal
- `fee` - Card fees

---

### 10. **POST `/api/admin/cards/:id/freeze`**

**Description:** Freeze a card (prevent transactions).

**Response Example:**
```json
{
  "success": true,
  "message": "Card frozen successfully",
  "data": {
    "id": "uuid",
    "status": "frozen"
  }
}
```

---

### 11. **POST `/api/admin/cards/:id/unfreeze`**

**Description:** Unfreeze a card (restore transactions).

**Response Example:**
```json
{
  "success": true,
  "message": "Card unfrozen successfully",
  "data": {
    "id": "uuid",
    "status": "active"
  }
}
```

---

## 💰 Balance System Overview

### Two Balance Types

1. **`earnings`** (formerly `balance`)
   - TikTok earnings approved by admin
   - Used for payouts/withdrawals
   - Default currency: USD

2. **`wallet`** (new)
   - Paystack deposits
   - Used for card funding, airtime, etc.
   - Default currency: NGN

### Balance Flow

```
Paystack Deposit → wallet (NGN)
Admin Approval → earnings (USD)
Transfer → earnings → wallet
Card Funding → wallet → card (NGN)
Payout → earnings → bank (USD)
```

---

## 🔍 Transaction Currency Detection

The system automatically determines currency based on:

1. **Transaction Type:**
   - `deposit`, `card_funding` → `NGN`
   - `credit`, `withdrawal`, `payout` → `USD`

2. **Amount in NGN:**
   - If `amountInNgn` is present → `NGN`

3. **Default:**
   - Falls back to `USD` if unclear

---

## 📝 Frontend Integration Notes

### Displaying Transactions

1. **Show Currency:**
   ```typescript
   const displayAmount = transaction.currency === 'NGN' 
     ? `₦${transaction.amount.toLocaleString()}` 
     : `$${transaction.amount.toLocaleString()}`;
   ```

2. **Filter by Type:**
   - Use `type=deposit` to show wallet deposits
   - Use `type=card_funding` to show card funding transactions
   - Use `type=transfer_earnings_to_wallet` to show internal transfers

3. **Display User Balances:**
   ```typescript
   // Always show both balances
   <div>
     <span>Earnings: ${user.earnings}</span>
     <span>Wallet: ₦{user.wallet}</span>
   </div>
   ```

### Statistics Dashboard

Use the new wallet statistics:
- `totalWalletDeposits` - Total wallet funding
- `totalCardFunding` - Total card funding
- `totalEarningsToWalletTransfers` - Internal transfers

### Admin Card Management UI

1. **Card List View:**
   - Display cards with user information
   - Show card status (active, frozen, closed)
   - Show card balance and currency
   - Filter by status, currency, or search by user

2. **Card Details Modal:**
   - View full card information
   - See user's earnings and wallet balances
   - View card transaction history
   - Freeze/unfreeze card actions

3. **Card Actions:**
   ```typescript
   // Freeze card
   await api.admin.cards.freezeCard(cardId)
   
   // Unfreeze card
   await api.admin.cards.unfreezeCard(cardId)
   
   // Get card details
   const card = await api.admin.cards.getCard(cardId)
   
   // Get card transactions
   const transactions = await api.admin.cards.getCardTransactions(cardId, { page: 1, limit: 10 })
   ```

---

## 🚨 Important Notes

1. **Backward Compatibility:**
   - `balance` field still exists in responses (maps to `earnings`)
   - Frontend should migrate to use `earnings` and `wallet` explicitly

2. **Currency Handling:**
   - Card funding is in **NGN** (not USD)
   - Wallet deposits are in **NGN**
   - Always check the `currency` field

3. **Transaction Types:**
   - `card_funding` replaces generic `withdrawal` for card operations
   - `deposit` is for Paystack wallet funding
   - Filter by these types to see wallet-related activity

4. **Statistics:**
   - Wallet totals are separate from earnings totals
   - Use `totalWalletDeposits` and `totalCardFunding` for wallet metrics

5. **Card Management:**
   - Cards are virtual cards issued via Sudo Africa API
   - Card balances are separate from user wallet/earnings
   - Card funding creates a `card_funding` transaction
   - Card purchases create `card_purchase` transactions (future)
   - Admin can freeze/unfreeze cards for security
   - Card details include Sudo card ID and customer ID for reference

---

## 🔗 Related Documentation

- `DUAL_BALANCE_SYSTEM_GUIDE.md` - Full balance system documentation
- `FRONTEND_PAYMENT_INTEGRATION.md` - Payment integration guide
- `PAYSTACK_PAYMENT_INTEGRATION.md` - Paystack setup guide
- `docs/cards/FRONTEND_CARDS_INTEGRATION.md` - Virtual cards integration guide
- `docs/cards/SUDO_CARDS_SETUP.md` - Sudo Africa API setup

---

## 📅 Migration Checklist

- [x] Update transaction endpoints to include `currency`
- [x] Add wallet statistics to transaction stats
- [x] Update user endpoints to return `earnings` and `wallet`
- [x] Update dashboard to show dual balances
- [x] Change card funding transaction type to `card_funding`
- [x] Add `amountInNgn` to card funding transactions
- [x] Implement admin card management endpoints
- [x] Add card freeze/unfreeze functionality
- [x] Add card transaction history endpoints
- [x] Frontend: Admin cards management page
- [x] Frontend: Card details modal with transactions
- [ ] Frontend: Update transaction display to show currency
- [ ] Frontend: Update user balance display to show both balances
- [ ] Frontend: Add filters for new transaction types

---

## 🎴 Virtual Cards Feature Summary

### Overview
Users can create virtual cards to make purchases (TikTok coins, subscriptions, etc.). Cards are issued via Sudo Africa API and funded from the user's wallet balance.

### Card Lifecycle
1. **User Onboarding** - User completes Sudo customer onboarding (personal info, billing address, identity verification)
2. **Card Creation** - User creates a virtual card (NGN or USD)
3. **Card Funding** - User funds card from wallet balance (creates `card_funding` transaction)
4. **Card Usage** - User makes purchases with card (creates `card_purchase` transactions)
5. **Card Management** - Admin can view, freeze/unfreeze cards

### Card Statuses
- `active` - Card is active and can be used
- `frozen` - Card is frozen (no transactions allowed)
- `closed` - Card is closed (permanently disabled)

### Admin Capabilities
- View all user cards with search and filters
- View detailed card information
- View card transaction history
- Freeze/unfreeze cards for security
- Monitor card funding activity
- Track card purchases and usage

---

**Last Updated:** January 19, 2026
