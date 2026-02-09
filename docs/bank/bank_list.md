# Bank Account Helper APIs - Sudo Integration

## Overview

Two new endpoints to improve bank account UX using Sudo's banking APIs:

1. **Get Banks List** - List of all Nigerian banks with codes
2. **Name Enquiry** - Verify account number and get account holder name

## Endpoints

### 1. Get Banks List

**Endpoint**: `GET /api/user/bank-accounts/banks`

**Authentication**: Required (JWT)

**Query Parameters**:
- `country` (optional) - Country code, defaults to "NG"

**Request**:
```http
GET /api/user/bank-accounts/banks?country=NG
Authorization: Bearer <token>
```

**Response** (will be logged to console first time):
```json
{
  "success": true,
  "data": {
    // Sudo's response structure (to be confirmed)
    "banks": [
      {
        "code": "011",
        "name": "First Bank of Nigeria"
      },
      {
        "code": "058",
        "name": "Guaranty Trust Bank"
      }
      // ... more banks
    ]
  }
}
```

---

### 2. Name Enquiry (Account Verification)

**Endpoint**: `POST /api/user/bank-accounts/name-enquiry`

**Authentication**: Required (JWT)

**Request**:
```http
POST /api/user/bank-accounts/name-enquiry
Authorization: Bearer <token>
Content-Type: application/json

{
  "bankCode": "011",
  "accountNumber": "1234567890"
}
```

**Validation**:
- `bankCode`: Exactly 3 digits
- `accountNumber`: Exactly 10 digits

**Response** (will be logged to console first time):
```json
{
  "success": true,
  "data": {
    // Sudo's response structure (to be confirmed)
    "accountName": "JOHN DOE",
    "accountNumber": "1234567890",
    "bankCode": "011"
  }
}
```

**Error Response**:
```json
{
  "statusCode": 400,
  "message": "Failed to verify account details",
  "error": "Bad Request"
}
```

---

## Frontend Integration

### Complete Bank Account Flow

```typescript
import axios from 'axios';

interface Bank {
  code: string;
  name: string;
}

interface NameEnquiryResult {
  accountName: string;
  accountNumber: string;
  bankCode: string;
}

// 1. Fetch banks list for dropdown
const fetchBanks = async (): Promise<Bank[]> => {
  const response = await axios.get('/api/user/bank-accounts/banks', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.data.banks; // Adjust based on actual Sudo response
};

// 2. Verify account and get account name
const verifyAccount = async (
  bankCode: string,
  accountNumber: string
): Promise<NameEnquiryResult> => {
  const response = await axios.post(
    '/api/user/bank-accounts/name-enquiry',
    {
      bankCode,
      accountNumber,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data.data; // Adjust based on actual Sudo response
};

// Usage in form
const handleAccountNumberBlur = async () => {
  if (accountNumber.length === 10 && bankCode) {
    try {
      setLoading(true);
      const result = await verifyAccount(bankCode, accountNumber);
      setAccountName(result.accountName); // Auto-fill account name!
      setError('');
    } catch (err) {
      setError('Unable to verify account. Please check your details.');
      setAccountName('');
    } finally {
      setLoading(false);
    }
  }
};
```

### React Component Example

```tsx
import React, { useState, useEffect } from 'react';

interface Bank {
  code: string;
  name: string;
}

export const AddBankAccountForm: React.FC = () => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch banks on mount
  useEffect(() => {
    const loadBanks = async () => {
      try {
        const response = await axios.get('/api/user/bank-accounts/banks', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBanks(response.data.data.banks);
      } catch (err) {
        console.error('Failed to load banks', err);
      }
    };
    loadBanks();
  }, []);

  // Auto-verify when account number is complete
  useEffect(() => {
    const verifyAccount = async () => {
      if (accountNumber.length === 10 && bankCode) {
        try {
          setLoading(true);
          setError('');
          const response = await axios.post(
            '/api/user/bank-accounts/name-enquiry',
            { bankCode, accountNumber },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setAccountName(response.data.data.accountName);
        } catch (err: any) {
          setError('Unable to verify account');
          setAccountName('');
        } finally {
          setLoading(false);
        }
      }
    };

    verifyAccount();
  }, [accountNumber, bankCode]);

  return (
    <form>
      <div>
        <label>Bank</label>
        <select
          value={bankCode}
          onChange={(e) => setBankCode(e.target.value)}
        >
          <option value="">Select Bank</option>
          {banks.map((bank) => (
            <option key={bank.code} value={bank.code}>
              {bank.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Account Number</label>
        <input
          type="text"
          maxLength={10}
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
          placeholder="1234567890"
        />
        {loading && <span>Verifying...</span>}
      </div>

      <div>
        <label>Account Name</label>
        <input
          type="text"
          value={accountName}
          readOnly
          placeholder="Account name will appear here"
        />
        {error && <span className="error">{error}</span>}
      </div>

      <button type="submit" disabled={!accountName}>
        Add Bank Account
      </button>
    </form>
  );
};
```

### Vue 3 Example

```vue
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import axios from 'axios';

interface Bank {
  code: string;
  name: string;
}

const banks = ref<Bank[]>([]);
const bankCode = ref('');
const accountNumber = ref('');
const accountName = ref('');
const loading = ref(false);
const error = ref('');

// Fetch banks on mount
onMounted(async () => {
  try {
    const response = await axios.get('/api/user/bank-accounts/banks', {
      headers: { Authorization: `Bearer ${token}` },
    });
    banks.value = response.data.data.banks;
  } catch (err) {
    console.error('Failed to load banks', err);
  }
});

// Auto-verify account when number is complete
watch([accountNumber, bankCode], async ([number, code]) => {
  if (number.length === 10 && code) {
    try {
      loading.value = true;
      error.value = '';
      const response = await axios.post(
        '/api/user/bank-accounts/name-enquiry',
        { bankCode: code, accountNumber: number },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      accountName.value = response.data.data.accountName;
    } catch (err) {
      error.value = 'Unable to verify account';
      accountName.value = '';
    } finally {
      loading.value = false;
    }
  }
});
</script>

<template>
  <form @submit.prevent="submitForm">
    <div>
      <label>Bank</label>
      <select v-model="bankCode">
        <option value="">Select Bank</option>
        <option
          v-for="bank in banks"
          :key="bank.code"
          :value="bank.code"
        >
          {{ bank.name }}
        </option>
      </select>
    </div>

    <div>
      <label>Account Number</label>
      <input
        v-model="accountNumber"
        type="text"
        maxlength="10"
        placeholder="1234567890"
      />
      <span v-if="loading">Verifying...</span>
    </div>

    <div>
      <label>Account Name</label>
      <input
        v-model="accountName"
        type="text"
        readonly
        placeholder="Account name will appear here"
      />
      <span v-if="error" class="error">{{ error }}</span>
    </div>

    <button type="submit" :disabled="!accountName">
      Add Bank Account
    </button>
  </form>
</template>
```

## Testing Steps

1. **Test Banks List**:
   ```bash
   curl http://localhost:3001/api/user/bank-accounts/banks?country=NG \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```
   - Check console for Sudo's response structure
   - Adjust frontend code based on actual structure

2. **Test Name Enquiry**:
   ```bash
   curl -X POST http://localhost:3001/api/user/bank-accounts/name-enquiry \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "bankCode": "011",
       "accountNumber": "1234567890"
     }'
   ```
   - Check console for Sudo's response structure
   - See what fields are returned (accountName, etc.)

## UX Flow

1. User opens "Add Bank Account" form
2. **Banks dropdown** populated from `/banks` endpoint
3. User selects bank from dropdown
4. User types account number
5. **When 10 digits entered**: Auto-call `/name-enquiry`
6. **Account name auto-fills** from Sudo response
7. User confirms and adds account

## Benefits

✅ **Better UX** - Auto-fill account name  
✅ **Validation** - Confirm account exists before adding  
✅ **Fewer errors** - Users see if account number is wrong  
✅ **Trust** - Users see their name appear (confirmation)  

## Console Logging

Both endpoints will **log Sudo's response to console** on first call so you can see the exact structure and adjust the frontend code accordingly.

Look for:
```
=== SUDO BANKS LIST RESPONSE ===
{ ... }
================================

=== SUDO NAME ENQUIRY RESPONSE ===
{ ... }
===================================
```

## Validation

- Bank code: Exactly 3 digits
- Account number: Exactly 10 digits
- Both are validated before calling Sudo

## Error Handling

If Sudo returns an error (invalid account, bank down, etc.), the endpoint returns:
```json
{
  "statusCode": 400,
  "message": "Failed to verify account details"
}
```

Frontend should handle this gracefully (show error, allow user to continue).

## Build Status

✅ Build successful  
✅ Two new endpoints added  
✅ Sudo API integrated  
✅ Console logging for response structure  
✅ Validation included  

Ready to test! Start the server and try the endpoints to see Sudo's response structure. 🚀
