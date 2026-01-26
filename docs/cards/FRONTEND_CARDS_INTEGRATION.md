# Frontend Cards Integration Guide

## Overview
This guide provides everything the frontend team needs to integrate the Sudo Africa Cards feature into the application. Users can create virtual cards, fund them from their wallet, and use them for digital purchases (TikTok coins, Netflix, Spotify, etc.).

## Table of Contents
1. [Authentication](#authentication)
2. [API Endpoints](#api-endpoints)
3. [Request/Response Examples](#requestresponse-examples)
4. [User Flows](#user-flows)
5. [Error Handling](#error-handling)
6. [UI/UX Recommendations](#uiux-recommendations)
7. [Integration Examples](#integration-examples)

---

## Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```javascript
headers: {
  'Authorization': `Bearer ${userToken}`,
  'Content-Type': 'application/json'
}
```

---

## API Endpoints

### Base URL
```
Production: https://your-api-domain.com/api
Development: http://localhost:3001/api
```

### User Endpoints

#### 1. Create Card
**POST** `/cards`

Create a new virtual card for the authenticated user.

**Request Body:**
```json
{
  "currency": "NGN",  // Optional, defaults to NGN
  "cardProgramId": "optional_program_id",  // Optional
  "metadata": {}  // Optional
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "user_uuid",
    "sudoCustomerId": "sudo_customer_uuid",
    "sudoCardId": "sudo_card_id",
    "cardNumber": "****1234",  // Masked
    "cardType": "virtual",
    "currency": "NGN",
    "status": "active",
    "balance": 0.00,
    "expiryMonth": "12",
    "expiryYear": "2025",
    "isDefault": true,
    "metadata": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### 2. Get All User Cards
**GET** `/cards`

Get all cards belonging to the authenticated user.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "cardNumber": "****1234",
      "cardType": "virtual",
      "currency": "NGN",
      "status": "active",
      "balance": 1000.00,
      "expiryMonth": "12",
      "expiryYear": "2025",
      "isDefault": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### 3. Get Card Details
**GET** `/cards/:id`

Get detailed information about a specific card.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "user_uuid",
    "sudoCustomerId": "sudo_customer_uuid",
    "sudoCardId": "sudo_card_id",
    "cardNumber": "****1234",
    "cardType": "virtual",
    "currency": "NGN",
    "status": "active",
    "balance": 1000.00,
    "expiryMonth": "12",
    "expiryYear": "2025",
    "isDefault": true,
    "metadata": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "sudoCustomer": {
      "id": "uuid",
      "sudoCustomerId": "sudo_customer_id",
      "status": "active"
    }
  }
}
```

#### 4. Update Card
**PATCH** `/cards/:id`

Update card status (freeze/unfreeze) or set as default.

**Request Body:**
```json
{
  "status": "frozen",  // Optional: "active" | "frozen" | "closed"
  "isDefault": true  // Optional: boolean
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "frozen",
    "isDefault": true,
    // ... other card fields
  }
}
```

#### 5. Fund Card from Wallet
**POST** `/cards/:id/fund`

Transfer funds from user's wallet to the card.

**Request Body:**
```json
{
  "amount": 1000.00  // Minimum: 0.01
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "card": {
      "id": "uuid",
      "balance": 1000.00,
      // ... other card fields
    },
    "transaction": {
      "id": "transaction_uuid",
      "userId": "user_uuid",
      "type": "withdrawal",
      "amount": 1000.00,
      "status": "completed",
      "description": "Card funding for card ending 1234",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

#### 6. Get Card Transactions
**GET** `/cards/:id/transactions?page=0&limit=25`

Get transaction history for a specific card.

**Query Parameters:**
- `page` (optional): Page number (default: 0)
- `limit` (optional): Items per page (default: 25, max: 100)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "cardId": "card_uuid",
      "userId": "user_uuid",
      "type": "purchase",  // "purchase" | "funding" | "refund" | "reversal" | "fee"
      "amount": 50.00,
      "currency": "NGN",
      "merchantName": "TikTok",
      "description": "TikTok Coins Purchase",
      "status": "completed",  // "pending" | "completed" | "failed" | "reversed"
      "reference": "ref_123",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 10,
    "pages": 1,
    "page": 0,
    "limit": 25
  }
}
```

#### 7. Set Default Card
**POST** `/cards/:id/set-default`

Set a card as the user's default card.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "isDefault": true,
    // ... other card fields
  }
}
```

#### 8. Delete/Deactivate Card
**DELETE** `/cards/:id`

Deactivate and close a card.

**Response (200):**
```json
{
  "success": true,
  "message": "Card deleted successfully"
}
```

---

## Request/Response Examples

### JavaScript/TypeScript Examples

#### Create Card
```typescript
async function createCard(token: string, currency: string = 'NGN') {
  const response = await fetch(`${API_BASE_URL}/cards`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ currency }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create card');
  }

  return await response.json();
}
```

#### Get User Cards
```typescript
async function getUserCards(token: string) {
  const response = await fetch(`${API_BASE_URL}/cards`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch cards');
  }

  return await response.json();
}
```

#### Fund Card
```typescript
async function fundCard(token: string, cardId: string, amount: number) {
  const response = await fetch(`${API_BASE_URL}/cards/${cardId}/fund`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fund card');
  }

  return await response.json();
}
```

#### Get Card Transactions
```typescript
async function getCardTransactions(
  token: string,
  cardId: string,
  page: number = 0,
  limit: number = 25
) {
  const response = await fetch(
    `${API_BASE_URL}/cards/${cardId}/transactions?page=${page}&limit=${limit}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }

  return await response.json();
}
```

#### Freeze Card
```typescript
async function freezeCard(token: string, cardId: string) {
  const response = await fetch(`${API_BASE_URL}/cards/${cardId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: 'frozen' }),
  });

  if (!response.ok) {
    throw new Error('Failed to freeze card');
  }

  return await response.json();
}
```

---

## User Flows

### Flow 1: Create and Fund a Card

1. **User clicks "Create Card"**
   - Show loading state
   - Call `POST /cards`
   - On success: Display card details
   - On error: Show error message

2. **User wants to fund the card**
   - Show funding form with amount input
   - Validate amount (minimum 0.01, check wallet balance)
   - Call `POST /cards/:id/fund`
   - On success: Update card balance, show success message
   - On error: Show specific error (insufficient balance, etc.)

### Flow 2: View Cards and Transactions

1. **User navigates to "My Cards"**
   - Call `GET /cards`
   - Display list of cards with:
     - Card number (masked)
     - Balance
     - Status (active/frozen)
     - Default badge
     - Expiry date

2. **User clicks on a card**
   - Call `GET /cards/:id`
   - Display card details
   - Show recent transactions (call `GET /cards/:id/transactions`)

### Flow 3: Manage Card

1. **User wants to freeze card**
   - Show confirmation dialog
   - Call `PATCH /cards/:id` with `{ status: 'frozen' }`
   - Update UI to show frozen state

2. **User wants to set default card**
   - Call `POST /cards/:id/set-default`
   - Update UI to show default badge

---

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "message": "Insufficient wallet balance",
  "errors": [
    {
      "field": "amount",
      "message": "Amount exceeds available balance"
    }
  ]
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized - Invalid or expired token"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "Card not found"
}
```

#### 500 Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

### Error Handling Example

```typescript
async function handleCardOperation(operation: () => Promise<any>) {
  try {
    const result = await operation();
    return { success: true, data: result };
  } catch (error: any) {
    if (error.response) {
      const errorData = error.response.data;
      return {
        success: false,
        message: errorData.message || 'An error occurred',
        errors: errorData.errors || [],
      };
    }
    return {
      success: false,
      message: error.message || 'Network error',
    };
  }
}
```

---

## UI/UX Recommendations

### Card Display

1. **Card List View**
   - Show card number as: `**** **** **** 1234`
   - Display balance prominently
   - Show status badge (Active/Frozen)
   - Highlight default card
   - Show expiry date: `MM/YY`

2. **Card Details View**
   - Display full card information
   - Show transaction history
   - Quick actions: Fund, Freeze, Set Default, Delete
   - Show card balance with currency symbol

3. **Funding Form**
   - Input field with currency symbol
   - Show available wallet balance
   - Validate minimum amount (0.01)
   - Show loading state during funding
   - Success animation/notification

4. **Transaction List**
   - Group by date
   - Show merchant name, amount, status
   - Color code: Green (completed), Yellow (pending), Red (failed)
   - Pagination controls

### User Feedback

1. **Loading States**
   - Show skeleton loaders while fetching cards
   - Disable buttons during operations
   - Show progress indicators

2. **Success Messages**
   - Toast notification for successful operations
   - Update UI immediately (optimistic updates)
   - Refresh data if needed

3. **Error Messages**
   - Show inline errors for form validation
   - Toast notifications for API errors
   - Retry buttons for failed operations

### Accessibility

- Use semantic HTML
- Provide ARIA labels
- Ensure keyboard navigation
- Support screen readers
- High contrast for status indicators

---

## Integration Examples

### React Example

```tsx
import { useState, useEffect } from 'react';

interface Card {
  id: string;
  cardNumber: string;
  balance: number;
  status: string;
  isDefault: boolean;
  expiryMonth: string;
  expiryYear: string;
}

function CardsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/cards`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch cards');

      const data = await response.json();
      setCards(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFundCard = async (cardId: string, amount: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/cards/${cardId}/fund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      // Refresh cards to update balance
      await fetchCards();
      alert('Card funded successfully!');
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return <div>Loading cards...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>My Cards</h1>
      {cards.map((card) => (
        <div key={card.id} className="card">
          <div className="card-number">{card.cardNumber}</div>
          <div className="card-balance">₦{card.balance.toFixed(2)}</div>
          <div className="card-status">{card.status}</div>
          {card.isDefault && <span className="badge">Default</span>}
          <button onClick={() => handleFundCard(card.id, 1000)}>
            Fund Card
          </button>
        </div>
      ))}
    </div>
  );
}
```

### Vue.js Example

```vue
<template>
  <div class="cards-page">
    <h1>My Cards</h1>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
      <div v-for="card in cards" :key="card.id" class="card">
        <div class="card-number">{{ card.cardNumber }}</div>
        <div class="card-balance">₦{{ card.balance.toFixed(2) }}</div>
        <button @click="fundCard(card.id, 1000)">Fund Card</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const cards = ref([]);
const loading = ref(true);
const error = ref(null);

const fetchCards = async () => {
  try {
    loading.value = true;
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/cards`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Failed to fetch cards');

    const data = await response.json();
    cards.value = data.data;
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const fundCard = async (cardId: string, amount: number) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/cards/${cardId}/fund`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) throw new Error('Failed to fund card');

    await fetchCards();
    alert('Card funded successfully!');
  } catch (err: any) {
    alert(`Error: ${err.message}`);
  }
};

onMounted(() => {
  fetchCards();
});
</script>
```

---

## Testing Checklist

Before going live, ensure:

- [ ] Card creation works
- [ ] Card funding from wallet works
- [ ] Card balance updates correctly
- [ ] Transaction history displays correctly
- [ ] Freeze/unfreeze functionality works
- [ ] Set default card works
- [ ] Error handling displays appropriate messages
- [ ] Loading states show during operations
- [ ] Success notifications appear
- [ ] Wallet balance validation works
- [ ] Minimum funding amount validation works
- [ ] Card deletion works
- [ ] Pagination works for transactions
- [ ] Mobile responsive design
- [ ] Accessibility features work

---

## Support

For backend API issues:
- Check API documentation
- Review error messages
- Contact backend team

For Sudo API issues:
- Check Sudo documentation: https://docs.sudo.africa
- Contact Sudo support through their dashboard

---

## Going Live Checklist

✅ Backend deployed and tested
✅ Environment variables configured
✅ Database migration run
✅ Settlement account created in Sudo
✅ Funding source configured
✅ API keys set (production)
✅ Frontend integrated and tested
✅ Error handling implemented
✅ User flows tested end-to-end
✅ Compliance requirements met

**You're ready to go live! 🚀**

