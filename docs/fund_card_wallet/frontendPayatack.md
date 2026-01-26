# Frontend Payment Integration Guide

## Quick Start

### 1. Install Paystack Popup

```html
<script src="https://js.paystack.co/v1/inline.js"></script>
```

Or for React/Next.js:
```bash
npm install react-paystack
```

### 2. Initialize Payment

```javascript
// Initialize payment
const response = await fetch('/api/payments/initialize', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 100000, // 1000 NGN in kobo
  })
});

const { data } = await response.json();
```

### 3. Open Paystack Popup

```javascript
const handler = PaystackPop.setup({
  key: 'pk_test_xxxxx', // Your Paystack public key
  email: user.email,
  amount: 100000,
  ref: data.reference,
  callback: async function(response) {
    // Verify payment
    await verifyPayment(data.reference);
  },
  onClose: function() {
    alert('Payment cancelled');
  }
});

handler.openIframe();
```

### 4. Verify Payment

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
    // Payment successful, update UI
    await refreshBalances();
  }
}
```

## Complete Example

```javascript
// PaymentService.js
class PaymentService {
  constructor(apiBaseUrl, token) {
    this.apiBaseUrl = apiBaseUrl;
    this.token = token;
    this.paystackPublicKey = 'pk_test_xxxxx'; // From env
  }

  async initializePayment(amountInNgn, callbackUrl) {
    const response = await fetch(`${this.apiBaseUrl}/payments/initialize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amountInNgn * 100, // Convert to kobo
        callbackUrl
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to initialize payment');
    }
    
    return await response.json();
  }

  async verifyPayment(reference) {
    const response = await fetch(`${this.apiBaseUrl}/payments/verify/${reference}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to verify payment');
    }
    
    return await response.json();
  }

  async getBalances() {
    const response = await fetch(`${this.apiBaseUrl}/payments/balance`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to get balances');
    }
    
    return await response.json();
  }

  async transferEarningsToWallet(amount) {
    const response = await fetch(`${this.apiBaseUrl}/payments/transfer-earnings-to-wallet`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount })
    });
    
    if (!response.ok) {
      throw new Error('Failed to transfer');
    }
    
    return await response.json();
  }

  openPaystackPopup(email, amount, reference, onSuccess, onClose) {
    const handler = PaystackPop.setup({
      key: this.paystackPublicKey,
      email,
      amount: amount * 100, // Convert to kobo
      ref: reference,
      callback: onSuccess,
      onClose: onClose
    });
    
    handler.openIframe();
  }
}

// Usage
const paymentService = new PaymentService('http://localhost:3001/api', token);

// Add funds
async function addFunds(amountInNgn) {
  try {
    // 1. Initialize
    const { data } = await paymentService.initializePayment(amountInNgn);
    
    // 2. Open popup
    paymentService.openPaystackPopup(
      user.email,
      amountInNgn,
      data.reference,
      async (response) => {
        if (response.status === 'success') {
          // 3. Verify
          await paymentService.verifyPayment(data.reference);
          // 4. Refresh balances
          const balances = await paymentService.getBalances();
          console.log('New balances:', balances.data);
        }
      },
      () => {
        console.log('Payment cancelled');
      }
    );
  } catch (error) {
    console.error('Payment error:', error);
  }
}

// Transfer earnings to wallet
async function transferToWallet(amount) {
  try {
    const result = await paymentService.transferEarningsToWallet(amount);
    console.log('Transfer successful:', result.data);
  } catch (error) {
    console.error('Transfer error:', error);
  }
}
```

## React Hook Example

```javascript
// usePayment.js
import { useState, useCallback } from 'react';

export function usePayment(apiBaseUrl, token) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const initializePayment = useCallback(async (amountInNgn) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${apiBaseUrl}/payments/initialize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amountInNgn * 100
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to initialize payment');
      }
      
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, token]);

  const verifyPayment = useCallback(async (reference) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${apiBaseUrl}/payments/verify/${reference}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to verify payment');
      }
      
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, token]);

  const getBalances = useCallback(async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/payments/balance`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to get balances');
      }
      
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [apiBaseUrl, token]);

  return {
    initializePayment,
    verifyPayment,
    getBalances,
    loading,
    error
  };
}
```

## UI Components

### Balance Display Component

```jsx
function BalanceCard({ earnings, wallet, onAddFunds, onTransfer }) {
  return (
    <div className="balance-card">
      <div className="earnings">
        <h3>Earnings</h3>
        <p className="amount">₦{earnings.toFixed(2)}</p>
        <p className="description">From TikTok earnings</p>
      </div>
      
      <div className="wallet">
        <h3>Wallet</h3>
        <p className="amount">₦{wallet.toFixed(2)}</p>
        <p className="description">For spending</p>
        <button onClick={onAddFunds}>Add Funds</button>
      </div>
      
      {earnings > 0 && (
        <div className="transfer">
          <button onClick={() => onTransfer(500)}>
            Transfer ₦500 to Wallet
          </button>
        </div>
      )}
    </div>
  );
}
```

### Payment Modal Component

```jsx
function PaymentModal({ isOpen, onClose, onSuccess }) {
  const [amount, setAmount] = useState(1000);
  const { initializePayment, verifyPayment, loading } = usePayment(apiUrl, token);

  const handlePayment = async () => {
    try {
      // Initialize
      const { data } = await initializePayment(amount);
      
      // Open Paystack popup
      const handler = PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: amount * 100,
        ref: data.reference,
        callback: async (response) => {
          if (response.status === 'success') {
            await verifyPayment(data.reference);
            onSuccess();
            onClose();
          }
        },
        onClose: () => {
          onClose();
        }
      });
      
      handler.openIframe();
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <h2>Add Funds to Wallet</h2>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        min="100"
        step="100"
      />
      <button onClick={handlePayment} disabled={loading}>
        {loading ? 'Processing...' : 'Pay ₦' + amount}
      </button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
}
```

## Important Notes

1. **Amounts**: Always send amounts in **kobo** (multiply NGN by 100)
2. **Reference**: Use the reference from initialize endpoint
3. **Verification**: Always verify payment after popup callback
4. **Error Handling**: Handle network errors and payment failures
5. **Balance Updates**: Refresh balances after successful payment

## Testing

Use Paystack test cards:
- **Success**: 4084084084084081
- **Declined**: 5060666666666666666
- **Insufficient Funds**: 5060666666666666667

CVV: Any 3 digits
Expiry: Any future date
PIN: Any 4 digits
