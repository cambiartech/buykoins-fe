# Dual Balance System Guide

## Overview

The platform now uses a **dual balance system** with two separate balances for each user:
- **Earnings**: TikTok earnings and platform credits
- **Wallet**: Spending balance for digital purchases

## Balance Types

### 1. Earnings Balance (`earnings`)

**Purpose**: Stores TikTok earnings and platform credits

**Sources**:
- ✅ Admin-approved credit requests (TikTok earnings)
- ✅ Widget deposits (PayPal deposits via widget)
- ✅ Any manual admin credits

**Usage**:
- Withdrawals/payouts to bank accounts
- Transfers to wallet (for spending)

**Important**: All existing functionality that previously used `balance` now uses `earnings`. This includes:
- Credit request approvals
- Widget deposits
- Payout deductions

### 2. Wallet Balance (`wallet`)

**Purpose**: Spending balance for digital purchases and services

**Sources**:
- ✅ Paystack payment deposits (new)
- ✅ Transfers from earnings balance

**Usage**:
- Virtual card funding
- Airtime purchases
- Digital service subscriptions
- Other spending activities

**Important**: This is a NEW balance type. Previously, all spending came from the main balance.

## Balance Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    EARNINGS BALANCE                         │
│  (TikTok Earnings & Platform Credits)                      │
└─────────────────────────────────────────────────────────────┘
         │                                    │
         │                                    │
         ▼                                    ▼
┌────────────────────┐              ┌────────────────────┐
│  Credit Requests   │              │  Widget Deposits   │
│  (Admin Approved)  │              │  (PayPal)          │
└────────────────────┘              └────────────────────┘
         │                                    │
         │                                    │
         └──────────────┬─────────────────────┘
                        │
                        ▼
              ┌──────────────────┐
              │  Earnings Balance│
              └──────────────────┘
                        │
                        │ Transfer
                        ▼
              ┌──────────────────┐
              │  Wallet Balance  │
              └──────────────────┘
                        │
                        │
         ┌──────────────┼──────────────┐
         │              │              │
         ▼              ▼              ▼
    ┌─────────┐  ┌──────────┐  ┌─────────────┐
    │  Cards  │  │ Airtime  │  │ Subscriptions│
    └─────────┘  └──────────┘  └─────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    WALLET BALANCE                           │
│  (Spending Balance)                                         │
└─────────────────────────────────────────────────────────────┘
         │                                    │
         │                                    │
         ▼                                    ▼
┌────────────────────┐              ┌────────────────────┐
│  Paystack Payments │              │  Earnings Transfer │
│  (New Deposits)    │              │  (User Initiated)  │
└────────────────────┘              └────────────────────┘
```

## What Goes Where?

### → Earnings Balance

| Action | Source | Destination | Notes |
|--------|--------|-------------|-------|
| Admin approves credit request | Credit Request | `earnings` | TikTok earnings |
| Widget deposit | PayPal via Widget | `earnings` | Manual deposit |
| Admin manual credit | Admin Panel | `earnings` | Direct admin credit |

### → Wallet Balance

| Action | Source | Destination | Notes |
|--------|--------|-------------|-------|
| Paystack payment | Paystack Gateway | `wallet` | User deposits via Paystack |
| Transfer from earnings | User Transfer | `wallet` | User-initiated transfer |

### ← Deductions

| Action | From Balance | Purpose |
|--------|--------------|---------|
| Payout/Withdrawal | `earnings` | Bank transfer |
| Card funding | `wallet` | Virtual card top-up |
| Airtime purchase | `wallet` | Airtime top-up |
| Digital subscriptions | `wallet` | Service payments |

## Migration Notes

### Database Changes

The `users` table now has:
- `earnings` (DECIMAL) - Renamed from `balance`
- `wallet` (DECIMAL) - New field, defaults to 0

**Migration**: `database/migrations/add-wallet-and-earnings-balance.sql`

### Backward Compatibility

- API responses include both `earnings` and `wallet`
- Some endpoints may still return `balance` (maps to `earnings`) for backward compatibility
- Frontend should update to use `earnings` and `wallet` explicitly

## Admin Guide

### Understanding User Balances

When viewing a user in the admin panel, you'll see:

```json
{
  "earnings": 5000.00,  // TikTok earnings
  "wallet": 1000.00     // Spending wallet
}
```

### Approving Credit Requests

**Important**: When you approve a credit request, the funds go to **earnings**, NOT wallet.

**Process**:
1. User submits credit request with proof
2. Admin reviews and approves
3. Funds are credited to `earnings` balance
4. User can then:
   - Request payout (deducts from `earnings`)
   - Transfer to wallet (for spending)

### Manual Credits

If you need to manually credit a user:
- Use the credit request approval flow
- Or use direct balance update (goes to `earnings`)

### Monitoring Balances

- **Earnings**: Check for pending payouts
- **Wallet**: Check for spending activity (cards, airtime, etc.)

## User Experience

### Balance Display

Users should see both balances clearly:

```
┌─────────────────────────────────────┐
│  Earnings: ₦5,000.00                │
│  From TikTok earnings               │
│  [Transfer to Wallet] [Withdraw]    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Wallet: ₦1,000.00                   │
│  For spending (cards, airtime, etc.)│
│  [Add Funds]                        │
└─────────────────────────────────────┘
```

### Transfer Flow

1. User has earnings from TikTok
2. User wants to fund a card
3. User transfers from earnings to wallet
4. User funds card from wallet

## API Changes

### Endpoints Returning Balances

All user endpoints now return:
```json
{
  "earnings": 5000.00,
  "wallet": 1000.00,
  "balance": 5000.00  // Backward compatibility (maps to earnings)
}
```

### New Endpoints

- `POST /api/payments/initialize` - Initialize Paystack payment
- `POST /api/payments/verify/:reference` - Verify payment
- `GET /api/payments/balance` - Get user balances
- `POST /api/payments/transfer-earnings-to-wallet` - Transfer funds

## Future: Virtual Accounts

### Planned Integration

We're planning to integrate with bank providers to offer:
- **Permanent virtual account numbers** for each user
- **Direct debit** capabilities
- **Automatic wallet funding** when funds are received

### How It Will Work

1. User gets a unique virtual account number
2. User shares account number with payers
3. When funds are received:
   - Automatically credited to `wallet`
   - User can immediately use for spending
4. Direct debit setup for recurring payments

### Timeline

- **Phase 1** (Current): Paystack integration for wallet funding
- **Phase 2** (Planned): Virtual account integration
- **Phase 3** (Future): Direct debit and recurring payments

### Benefits

- Faster funding (no manual transfer needed)
- Better user experience
- Support for recurring payments
- Integration with Nigerian banking system

## Technical Details

### Transaction Types

New transaction types:
- `DEPOSIT`: Paystack payment to wallet (NGN)
- `CARD_FUNDING`: Card funding from wallet (NGN)
- `TRANSFER_EARNINGS_TO_WALLET`: Internal transfer
- `CARD_PURCHASE`: Card purchases (NGN)

Existing types (still use earnings):
- `CREDIT`: Credit request approval (USD)
- `WITHDRAWAL`: Payout to bank (USD)
- `PAYOUT`: Same as withdrawal (USD)

### Transaction Currency

**IMPORTANT**: All transaction responses now include a `currency` field (`"USD"` or `"NGN"`).

- **NGN Transactions**: `deposit`, `card_funding`, `card_purchase`, `transfer_earnings_to_wallet`
- **USD Transactions**: `credit`, `withdrawal`, `payout`

**Frontend MUST check the `currency` field** to display the correct currency symbol:
- `currency: "NGN"` → Display as `₦2,000.00`
- `currency: "USD"` → Display as `$2,000.00`

Example transaction response:
```json
{
  "id": "uuid",
  "type": "deposit",
  "amount": 2000.00,
  "currency": "NGN",
  "amountInNgn": 2000.00,
  "status": "completed",
  "description": "Wallet deposit via Paystack"
}
```

### Database Schema

```sql
-- Users table
earnings DECIMAL(15, 2) DEFAULT 0.00  -- TikTok earnings
wallet DECIMAL(15, 2) DEFAULT 0.00    -- Spending wallet

-- Transactions table
type ENUM(
  'credit',                    -- To earnings
  'withdrawal',                 -- From earnings
  'payout',                    -- From earnings
  'deposit',                    -- To wallet (Paystack)
  'transfer_earnings_to_wallet' -- Internal transfer
)
```

## Best Practices

### For Admins

1. ✅ Always approve credit requests → goes to `earnings`
2. ✅ Monitor both balances separately
3. ✅ Understand that wallet is for spending only
4. ✅ Use earnings for payouts

### For Developers

1. ✅ Use `earnings` for TikTok-related credits
2. ✅ Use `wallet` for spending operations
3. ✅ Always check balance before operations
4. ✅ Create transaction records for all balance changes

### For Users

1. ✅ Earnings = money you can withdraw
2. ✅ Wallet = money for spending
3. ✅ Transfer earnings to wallet when needed
4. ✅ Add funds to wallet via Paystack

## FAQ

**Q: Why two balances?**
A: To separate earnings (withdrawable) from spending money (for digital purchases).

**Q: Can I withdraw from wallet?**
A: No, only from earnings. Transfer to earnings first if needed.

**Q: Where do credit requests go?**
A: Always to `earnings` balance.

**Q: Can I fund wallet directly?**
A: Yes, via Paystack payments or transfer from earnings.

**Q: What happens to existing balances?**
A: Existing `balance` is renamed to `earnings`. New `wallet` starts at 0.

## Support

For questions or issues:
- Check API documentation
- Review transaction history
- Contact admin for balance inquiries
