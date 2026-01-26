# Paystack Payment Integration & Dual Balance System

## Overview

This document describes the Paystack payment integration and the new dual balance system (earnings + wallet) implemented in the backend.

## Environment Variables

Add these to your `.env` file:

```env
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_xxxxx  # Your Paystack secret key
PAYSTACK_PUBLIC_KEY=pk_test_xxxxx  # Your Paystack public key (for frontend)
PAYSTACK_BASE_URL=https://api.paystack.co  # Production URL (or https://api.paystack.co for sandbox)
PAYSTACK_WEBHOOK_SECRET=xxxxx  # Webhook secret from Paystack dashboard
PAYSTACK_CURRENCY=NGN  # Default currency
```

## Database Migration

Run the migration to add the wallet field and payment_transactions table:

```bash
psql -U your_user -d buytiktokcoins -f database/migrations/add-wallet-and-earnings-balance.sql
```

## Dual Balance System

### Earnings vs Wallet

- **Earnings**: TikTok earnings balance (from credit requests, widget deposits)
- **Wallet**: Spending balance (for card topups, airtime, digital purchases)
- Users can transfer funds from earnings to wallet

### Balance Flow

1. **TikTok Earnings** → `earnings` balance
2. **Paystack Deposits** → `wallet` balance
3. **Transfer** → `earnings` → `wallet`
4. **Card Funding** → Deducts from `wallet`
5. **Payouts** → Deducts from `earnings`

## API Endpoints

### 1. Initialize Payment

**POST** `/api/payments/initialize`

Initialize a Paystack payment. Returns authorization URL for Paystack popup.

**Request:**
```json
{
  "amount": 100000,  // Amount in kobo (100000 = 1000 NGN)
  "callbackUrl": "https://yourapp.com/payment/callback",  // Optional
  "metadata": {}  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "authorizationUrl": "https://checkout.paystack.com/xxxxx",
    "reference": "PAY_XXXXXXXX",
    "accessCode": "xxxxx"
  }
}
```

**Frontend Integration:**
```javascript
// 1. Call initialize endpoint
const response = await fetch('/api/payments/initialize', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 100000, // 1000 NGN in kobo
    callbackUrl: window.location.origin + '/payment/callback'
  })
});

const { data } = await response.json();

// 2. Open Paystack popup
const handler = PaystackPop.setup({
  key: 'pk_test_xxxxx', // Your public key
  email: user.email,
  amount: 100000,
  ref: data.reference,
  callback: function(response) {
    // 3. Verify payment
    verifyPayment(data.reference);
  },
  onClose: function() {
    // Handle popup close
  }
});

handler.openIframe();
```

### 2. Verify Payment

**POST** `/api/payments/verify/:reference`

Verify a payment after user completes it. This credits the user's wallet.

**Request:** No body needed, reference is in URL

**Response:**
```json
{
  "success": true,
  "data": {
    "reference": "PAY_XXXXXXXX",
    "amount": 1000.00,
    "status": "success",
    "paymentMethod": "card"
  }
}
```

**Frontend Integration:**
```javascript
async function verifyPayment(reference) {
  const response = await fetch(`/api/payments/verify/${reference}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const result = await response.json();
  if (result.success) {
    // Update wallet balance in UI
    // Show success message
  }
}
```

### 3. Get Balances

**GET** `/api/payments/balance`

Get user's earnings and wallet balances.

**Response:**
```json
{
  "success": true,
  "data": {
    "earnings": 5000.00,  // TikTok earnings
    "wallet": 1000.00     // Spending wallet
  }
}
```

### 4. Transfer Earnings to Wallet

**POST** `/api/payments/transfer-earnings-to-wallet`

Transfer funds from earnings to wallet.

**Request:**
```json
{
  "amount": 500.00  // Amount in NGN
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "earnings": 4500.00,
    "wallet": 1500.00
  }
}
```

### 5. Webhook Endpoint

**POST** `/api/payments/webhook`

Paystack webhook endpoint (no auth required). Automatically verifies payments when Paystack sends webhook events.

**Note:** Configure this URL in your Paystack dashboard webhook settings.

## Transaction Types

New transaction types added:

- `DEPOSIT`: Paystack payment deposit to wallet
- `TRANSFER_EARNINGS_TO_WALLET`: Transfer from earnings to wallet

## Card Funding

Card funding now uses the **wallet** balance instead of earnings:

- **Before**: Card funding deducted from `balance` (earnings)
- **After**: Card funding deducts from `wallet`

**Endpoint:** `POST /api/cards/:id/fund`

The endpoint automatically checks and deducts from the wallet balance.

## Frontend Integration Flow

### Complete Payment Flow

```javascript
// 1. User clicks "Add Funds"
async function addFunds(amountInNgn) {
  const amountInKobo = amountInNgn * 100;
  
  // Initialize payment
  const initResponse = await fetch('/api/payments/initialize', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: amountInKobo,
      callbackUrl: `${window.location.origin}/payment/success`
    })
  });
  
  const { data } = await initResponse.json();
  
  // Open Paystack popup
  const handler = PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: user.email,
    amount: amountInKobo,
    ref: data.reference,
    callback: async function(response) {
      if (response.status === 'success') {
        // Verify payment
        await verifyPayment(data.reference);
        // Refresh wallet balance
        await refreshBalances();
        // Show success message
      }
    },
    onClose: function() {
      // Handle user closing popup
    }
  });
  
  handler.openIframe();
}

// 2. Verify payment
async function verifyPayment(reference) {
  const response = await fetch(`/api/payments/verify/${reference}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
}

// 3. Refresh balances
async function refreshBalances() {
  const response = await fetch('/api/payments/balance', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const { data } = await response.json();
  // Update UI with earnings and wallet
  updateBalanceUI(data.earnings, data.wallet);
}

// 4. Transfer earnings to wallet
async function transferToWallet(amount) {
  const response = await fetch('/api/payments/transfer-earnings-to-wallet', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ amount })
  });
  
  const { data } = await response.json();
  // Update UI
  updateBalanceUI(data.earnings, data.wallet);
}
```

## User Balance Display

Update your UI to show both balances:

```javascript
// Example React component
function BalanceDisplay() {
  const [balances, setBalances] = useState({ earnings: 0, wallet: 0 });
  
  useEffect(() => {
    fetchBalances();
  }, []);
  
  return (
    <div>
      <div>
        <h3>Earnings</h3>
        <p>₦{balances.earnings.toFixed(2)}</p>
        <p>From TikTok earnings</p>
      </div>
      <div>
        <h3>Wallet</h3>
        <p>₦{balances.wallet.toFixed(2)}</p>
        <p>For spending (cards, airtime, etc.)</p>
        <button onClick={() => addFunds(1000)}>Add Funds</button>
      </div>
      <div>
        <button onClick={() => transferToWallet(500)}>
          Transfer ₦500 to Wallet
        </button>
      </div>
    </div>
  );
}
```

## Error Handling

All endpoints return standard error responses:

```json
{
  "statusCode": 400,
  "message": "Insufficient earnings balance",
  "error": "Bad Request"
}
```

Common errors:
- `Insufficient earnings balance`: Not enough earnings to transfer
- `Insufficient wallet balance`: Not enough wallet balance for card funding
- `Payment transaction not found`: Invalid payment reference
- `Invalid webhook signature`: Webhook verification failed

## Testing

1. Use Paystack test keys for development
2. Test with Paystack test cards: https://paystack.com/docs/payments/test-payments
3. Test webhook using Paystack's webhook testing tool

## Security Notes

1. **Never expose secret key** in frontend code
2. **Always verify payments** on the backend
3. **Use webhooks** for production (more reliable than callback)
4. **Validate webhook signatures** (implemented in webhook endpoint)

## Migration Notes

- Existing `balance` field is now `earnings`
- New `wallet` field defaults to 0
- Backward compatibility: `balance` getter/setter maps to `earnings`
- All existing code using `user.balance` will continue to work
