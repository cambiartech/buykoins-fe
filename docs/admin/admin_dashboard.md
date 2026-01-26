# Admin Dashboard API Documentation

## Overview

The admin dashboard endpoint provides a comprehensive overview of all actionable items that require admin attention, including new support messages, onboarding requests, payout requests, credit requests, and fraud alerts.

---

## Endpoint

### `GET /api/admin/dashboard`

**Authentication:** Required (Admin or Super Admin)

**Description:** Returns dashboard overview with summary statistics, new items requiring attention, and fraud alerts.

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "pendingCreditRequests": 12,
      "pendingOnboarding": 5,
      "pendingPayouts": 8,
      "totalUsers": 1234,
      "totalTransactions": 8456
    },
    "newSupportMessages": [
      {
        "id": "conv-uuid",
        "conversationId": "conv-uuid",
        "type": "onboarding",
        "status": "open",
        "userId": "user-uuid",
        "guestId": null,
        "user": {
          "id": "user-uuid",
          "email": "user@example.com",
          "firstName": "John",
          "lastName": "Doe",
          "username": "johndoe_123"
        },
        "unreadCount": 3,
        "lastMessageAt": "2025-12-13T10:30:00.000Z",
        "createdAt": "2025-12-13T09:00:00.000Z"
      }
    ],
    "newOnboardingRequests": [
      {
        "id": "onboarding-uuid",
        "onboardingRequestId": "onboarding-uuid",
        "userId": "user-uuid",
        "user": {
          "id": "user-uuid",
          "email": "user@example.com",
          "firstName": "John",
          "lastName": "Doe",
          "username": "johndoe_123",
          "phone": "+2348080957681"
        },
        "message": "I need help setting up my TikTok account",
        "submittedAt": "2025-12-13T10:00:00.000Z",
        "createdAt": "2025-12-13T10:00:00.000Z"
      }
    ],
    "newPayoutRequests": [
      {
        "id": "payout-uuid",
        "payoutId": "payout-uuid",
        "userId": "user-uuid",
        "user": {
          "id": "user-uuid",
          "email": "user@example.com",
          "firstName": "John",
          "lastName": "Doe",
          "username": "johndoe_123",
          "phone": "+2348080957681",
          "balance": 500.00
        },
        "amount": 100.00,
        "amountInNgn": 150000,
        "processingFee": 50,
        "netAmount": 149950,
        "bankAccount": {
          "accountNumber": "5903400017",
          "accountName": "John Doe",
          "bankName": "First City FCMB",
          "bankCode": "011"
        },
        "requestedAt": "2025-12-13T09:30:00.000Z",
        "createdAt": "2025-12-13T09:30:00.000Z"
      }
    ],
    "newCreditRequests": [
      {
        "id": "credit-uuid",
        "creditRequestId": "credit-uuid",
        "userId": "user-uuid",
        "user": {
          "id": "user-uuid",
          "email": "user@example.com",
          "firstName": "John",
          "lastName": "Doe",
          "username": "johndoe_123",
          "phone": "+2348080957681",
          "balance": 400.00
        },
        "amount": 500.00,
        "proofUrl": "https://storage.example.com/proofs/uuid.jpg",
        "submittedAt": "2025-12-13T09:00:00.000Z",
        "createdAt": "2025-12-13T09:00:00.000Z"
      }
    ],
    "fraudAlerts": [
      {
        "type": "multiple_pending_credit_requests",
        "severity": "high",
        "message": "User has 5 pending credit requests",
        "userId": "user-uuid",
        "user": {
          "id": "user-uuid",
          "email": "user@example.com",
          "firstName": "John",
          "lastName": "Doe",
          "username": "johndoe_123"
        },
        "count": 5,
        "action": "Review credit requests",
        "link": "/admin/credit-requests?userId=user-uuid"
      },
      {
        "type": "rapid_credit_requests",
        "severity": "high",
        "message": "User submitted 4 credit requests in the last 24 hours",
        "userId": "user-uuid",
        "user": {
          "id": "user-uuid",
          "email": "user@example.com",
          "firstName": "John",
          "lastName": "Doe",
          "username": "johndoe_123"
        },
        "count": 4,
        "timeWindow": "24 hours",
        "action": "Review for potential abuse",
        "link": "/admin/credit-requests?userId=user-uuid"
      }
    ]
  }
}
```

---

## Response Fields

### Summary Statistics

- `pendingCreditRequests` (number): Count of pending credit requests
- `pendingOnboarding` (number): Count of pending onboarding requests
- `pendingPayouts` (number): Count of pending payout requests
- `totalUsers` (number): Total active users
- `totalTransactions` (number): Total transactions

### New Support Messages

Array of support conversations with unread messages. Each item includes:
- `id` / `conversationId`: Conversation ID (for navigation)
- `type`: Conversation type (`onboarding`, `general`, `call_request`)
- `status`: Conversation status (`open`, `closed`, `resolved`)
- `userId`: User ID (if authenticated user)
- `guestId`: Guest ID (if anonymous user)
- `user`: User object with basic info
- `unreadCount`: Number of unread messages from user/guest
- `lastMessageAt`: Timestamp of last message
- `createdAt`: Conversation creation timestamp

**Navigation:** Click `conversationId` to navigate to `/admin/support/conversations/{conversationId}`

### New Onboarding Requests

Array of pending onboarding requests. Each item includes:
- `id` / `onboardingRequestId`: Onboarding request ID (for navigation)
- `userId`: User ID
- `user`: User object with contact info
- `message`: User's onboarding message
- `submittedAt`: When request was submitted
- `createdAt`: When request was created

**Navigation:** Click `onboardingRequestId` to navigate to user details and complete onboarding

### New Payout Requests

Array of pending payout requests. Each item includes:
- `id` / `payoutId`: Payout ID (for navigation)
- `userId`: User ID
- `user`: User object with balance info
- `amount`: Payout amount in USD
- `amountInNgn`: Payout amount in NGN
- `processingFee`: Processing fee in NGN
- `netAmount`: Net amount user will receive in NGN
- `bankAccount`: Bank account details (JSON)
- `requestedAt`: When payout was requested
- `createdAt`: When payout was created

**Navigation:** Click `payoutId` to navigate to `/admin/payouts/{payoutId}`

### New Credit Requests

Array of pending credit requests. Each item includes:
- `id` / `creditRequestId`: Credit request ID (for navigation)
- `userId`: User ID
- `user`: User object with balance info
- `amount`: Credit request amount
- `proofUrl`: URL to proof of earnings
- `submittedAt`: When request was submitted
- `createdAt`: When request was created

**Navigation:** Click `creditRequestId` to navigate to `/admin/credit-requests/{creditRequestId}`

### Fraud Alerts

Array of fraud alerts for suspicious activity. Each alert includes:

**Alert Types:**
1. `multiple_pending_credit_requests` - User has >3 pending credit requests
2. `multiple_rejected_credit_requests` - User has >5 rejected requests in 30 days
3. `multiple_pending_payouts` - User has >2 pending payout requests
4. `rapid_credit_requests` - User submitted >3 requests in 24 hours
5. `large_credit_request` - Credit request >= $10,000

**Alert Fields:**
- `type`: Alert type
- `severity`: `high` | `medium` | `low`
- `message`: Human-readable alert message
- `userId`: User ID
- `user`: User object
- `count`: Number of occurrences (for count-based alerts)
- `amount`: Amount (for large request alerts)
- `timeWindow`: Time window (for rapid request alerts)
- `action`: Recommended action
- `link`: Navigation link to review the issue

**Navigation:** Use `link` field to navigate directly to the relevant page

---

## Fraud Detection Rules

### 1. Multiple Pending Credit Requests
- **Rule:** User has more than 3 pending credit requests
- **Severity:** High
- **Action:** Review all pending requests for this user

### 2. Multiple Rejected Credit Requests
- **Rule:** User has more than 5 rejected requests in the last 30 days
- **Severity:** Medium
- **Action:** Review user activity and consider suspending if pattern continues

### 3. Multiple Pending Payouts
- **Rule:** User has more than 2 pending payout requests
- **Severity:** Medium
- **Action:** Review payout requests to ensure no duplicate processing

### 4. Rapid Credit Requests
- **Rule:** User submitted more than 3 credit requests in the last 24 hours
- **Severity:** High
- **Action:** Review for potential abuse or system manipulation

### 5. Large Credit Requests
- **Rule:** Credit request amount is $10,000 or more
- **Severity:** Medium
- **Action:** Review proof carefully and verify authenticity

---

## Frontend Implementation

### Display Dashboard

```javascript
// Fetch dashboard data
const response = await fetch('/api/admin/dashboard', {
  headers: { 'Authorization': `Bearer ${adminToken}` }
});
const { data } = await response.json();

// Display summary cards
displaySummaryCards(data.summary);

// Display new support messages
data.newSupportMessages.forEach(msg => {
  displaySupportMessage({
    id: msg.conversationId,
    user: msg.user,
    unreadCount: msg.unreadCount,
    onClick: () => navigate(`/admin/support/conversations/${msg.conversationId}`)
  });
});

// Display onboarding requests
data.newOnboardingRequests.forEach(req => {
  displayOnboardingRequest({
    id: req.onboardingRequestId,
    user: req.user,
    onClick: () => navigate(`/admin/users/${req.userId}`)
  });
});

// Display payout requests
data.newPayoutRequests.forEach(payout => {
  displayPayoutRequest({
    id: payout.payoutId,
    user: payout.user,
    amount: payout.amount,
    onClick: () => navigate(`/admin/payouts/${payout.payoutId}`)
  });
});

// Display credit requests
data.newCreditRequests.forEach(req => {
  displayCreditRequest({
    id: req.creditRequestId,
    user: req.user,
    amount: req.amount,
    onClick: () => navigate(`/admin/credit-requests/${req.creditRequestId}`)
  });
});

// Display fraud alerts
data.fraudAlerts.forEach(alert => {
  displayFraudAlert({
    severity: alert.severity,
    message: alert.message,
    user: alert.user,
    onClick: () => navigate(alert.link)
  });
});
```

### Navigation Links

All items include IDs for easy navigation:

- **Support Messages:** `/admin/support/conversations/{conversationId}`
- **Onboarding Requests:** `/admin/users/{userId}` (then complete onboarding)
- **Payout Requests:** `/admin/payouts/{payoutId}`
- **Credit Requests:** `/admin/credit-requests/{creditRequestId}`
- **Fraud Alerts:** Use the `link` field (varies by alert type)

---

## Example Response Structure

```typescript
interface DashboardOverview {
  summary: {
    pendingCreditRequests: number;
    pendingOnboarding: number;
    pendingPayouts: number;
    totalUsers: number;
    totalTransactions: number;
  };
  newSupportMessages: Array<{
    id: string;
    conversationId: string;
    type: string;
    status: string;
    userId?: string;
    guestId?: string;
    user?: UserInfo;
    unreadCount: number;
    lastMessageAt: string;
    createdAt: string;
  }>;
  newOnboardingRequests: Array<{
    id: string;
    onboardingRequestId: string;
    userId: string;
    user: UserInfo;
    message?: string;
    submittedAt: string;
    createdAt: string;
  }>;
  newPayoutRequests: Array<{
    id: string;
    payoutId: string;
    userId: string;
    user: UserInfo;
    amount: number;
    amountInNgn: number;
    processingFee: number;
    netAmount: number;
    bankAccount: BankAccountInfo;
    requestedAt: string;
    createdAt: string;
  }>;
  newCreditRequests: Array<{
    id: string;
    creditRequestId: string;
    userId: string;
    user: UserInfo;
    amount: number;
    proofUrl: string;
    submittedAt: string;
    createdAt: string;
  }>;
  fraudAlerts: Array<{
    type: string;
    severity: 'high' | 'medium' | 'low';
    message: string;
    userId: string;
    user: UserInfo;
    count?: number;
    amount?: number;
    timeWindow?: string;
    action: string;
    link: string;
  }>;
}
```

---

## Usage Notes

1. **Real-time Updates:** Dashboard should be refreshed periodically or use WebSocket for real-time updates
2. **Clickable Items:** All items include IDs for navigation - make them clickable in the UI
3. **Fraud Alerts:** Display with appropriate severity indicators (red for high, yellow for medium)
4. **Unread Counts:** Show badge with unread count for support messages
5. **Sorting:** Items are already sorted by most recent first

---

## Summary

The dashboard endpoint provides:
- ✅ Summary statistics for quick overview
- ✅ New support messages with unread counts and navigation IDs
- ✅ New onboarding requests with user info and navigation IDs
- ✅ New payout requests with full details and navigation IDs
- ✅ New credit requests with user info and navigation IDs
- ✅ Fraud alerts with severity levels and direct navigation links

All items are actionable and include IDs for easy navigation to detailed views!

