# Admin Transactions & Balance System Updates

## ⚠️ CRITICAL: Currency Field

**Every transaction response now includes a `currency` field** (`"USD"` or `"NGN"`). 

**The frontend MUST use this field to display the correct currency symbol.**

- `currency: "NGN"` → Display as `₦2,000.00`
- `currency: "USD"` → Display as `$2,000.00`

**DO NOT assume all transactions are USD.** Deposits and card funding are in NGN.

---

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

**IMPORTANT:** Every transaction response now includes a `currency` field (`"USD"` or `"NGN"`). The frontend **MUST** use this field to display the correct currency symbol.

### Currency Detection Logic (Priority Order):

1. **Transaction Type (Highest Priority):**
   - **NGN Transactions:**
     - `deposit` → Wallet funding via Paystack
     - `card_funding` → Card funding from wallet
     - `transfer_earnings_to_wallet` → Internal transfer
     - `card_purchase` → Card purchases
   
   - **USD Transactions:**
     - `credit` → TikTok earnings
     - `withdrawal` → General withdrawals
     - `payout` → Bank payouts

2. **Amount in NGN:**
   - If `amountInNgn` is present → `NGN`

3. **Default:**
   - Falls back to `USD` if unclear

### Example Response:

```json
{
  "id": "uuid",
  "type": "deposit",
  "amount": 2000.00,
  "currency": "NGN",  // ← USE THIS FIELD!
  "amountInNgn": 2000.00,
  "description": "Wallet deposit via Paystack"
}
```

**Frontend MUST check `currency` field:**
- If `currency === "NGN"` → Display as `₦2,000.00`
- If `currency === "USD"` → Display as `$2,000.00`

---

## 📝 Frontend Integration Notes

### Displaying Transactions

1. **ALWAYS Check Currency Field (CRITICAL):**
   ```typescript
   // ✅ CORRECT - Use currency field
   const displayAmount = transaction.currency === 'NGN' 
     ? `₦${transaction.amount.toLocaleString()}` 
     : `$${transaction.amount.toLocaleString()}`;
   
   // ❌ WRONG - Don't assume USD
   const displayAmount = `$${transaction.amount.toLocaleString()}`;
   ```

2. **Handle Sign Correctly:**
   ```typescript
   // Deposits and credits are positive
   // Withdrawals, payouts, card funding are negative
   const sign = ['deposit', 'credit'].includes(transaction.type) ? '+' : '-';
   const displayAmount = transaction.currency === 'NGN'
     ? `${sign}₦${Math.abs(transaction.amount).toLocaleString()}`
     : `${sign}$${Math.abs(transaction.amount).toLocaleString()}`;
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

---

## 🔗 Related Documentation

- `DUAL_BALANCE_SYSTEM_GUIDE.md` - Full balance system documentation
- `FRONTEND_PAYMENT_INTEGRATION.md` - Payment integration guide
- `PAYSTACK_PAYMENT_INTEGRATION.md` - Paystack setup guide

---

## 📅 Migration Checklist

- [x] Update transaction endpoints to include `currency`
- [x] Add wallet statistics to transaction stats
- [x] Update user endpoints to return `earnings` and `wallet`
- [x] Update dashboard to show dual balances
- [x] Change card funding transaction type to `card_funding`
- [x] Add `amountInNgn` to card funding transactions
- [ ] Frontend: Update transaction display to show currency
- [ ] Frontend: Update user balance display to show both balances
- [ ] Frontend: Add filters for new transaction types

---

**Last Updated:** January 19, 2026
