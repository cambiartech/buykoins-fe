# Automated Widget Flow - Requirements & Implementation Plan

## Overview

This document outlines the requirements and implementation plan for an automated widget system that streamlines both **onboarding** and **withdrawal** processes. The widget will provide a seamless, user-friendly experience while automating backend operations.

---

## Core Principles

1. **User Experience First**: Minimize friction, maximize automation
2. **Backend-Driven**: Most logic handled server-side
3. **Context-Aware**: Widget adapts based on trigger (onboarding, withdrawal, deposit)
4. **Progressive Enhancement**: Works even if some steps fail
5. **Admin Oversight**: Admins can monitor and intervene when needed

---

## Widget Triggers

The widget can be automatically triggered in three scenarios:

### 1. **Onboarding Trigger**
- **When**: User clicks "Request Onboarding" or first-time user logs in
- **Context**: User needs to set up PayPal connection
- **Goal**: Complete PayPal authentication flow

### 2. **Withdrawal Trigger**
- **When**: User creates a withdrawal request
- **Context**: User wants to withdraw funds
- **Goal**: Collect withdrawal details and process via PayPal

### 3. **Deposit Trigger**
- **When**: A deposit is detected (via webhook or manual admin action)
- **Context**: Funds have been received, user needs to confirm
- **Goal**: Verify deposit amount and credit user's wallet

---

## Flow Diagrams

### Flow 1: Onboarding Widget Flow

```
┌─────────────────────────────────────────────────────────────┐
│ User Initiates Onboarding                                    │
│ (Clicks "Request Onboarding" or First Login)                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Widget Opens - Step 1: Request Credentials                   │
│ - User requests PayPal login credentials                    │
│ - Widget sends notification to admin                         │
│ - Admin receives notification and prepares credentials        │
│ - Message: "Admin will provide PayPal credentials shortly"  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Admin Provides Credentials                          │
│ - Admin sends PayPal login details (email/password)         │
│   via support chat or email                                 │
│ - Admin generates and sends 2FA auth code                   │
│ - Widget shows: "Check your messages for credentials"        │
│ - User receives credentials from admin                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Enter Auth Code                                      │
│ - Widget displays: "Enter the auth code sent by admin"      │
│ - Input field for 6-digit auth code                         │
│ - Validation: Code format and expiration                    │
│ - Help text: "Use this code to set up TikTok payment"       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 4: TikTok Setup Instructions                            │
│ - Widget shows step-by-step instructions:                   │
│   1. Go to TikTok Creator Fund settings                    │
│   2. Add payment method                                     │
│   3. Enter PayPal email (platform's PayPal)                 │
│   4. Use the auth code when prompted                        │
│ - "I've completed the setup" button                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 5: Confirmation                                         │
│ - User confirms: "I've set up TikTok to use the PayPal"     │
│ - Optional: Upload screenshot of TikTok payment setup       │
│ - Submit confirmation                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 6: Admin Verification                                   │
│ - Admin notified of completion                              │
│ - Admin can verify setup (optional)                         │
│ - Widget shows: "Admin will verify your setup"              │
│ - Status: "Pending Admin Verification"                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 7: Onboarding Complete                                 │
│ - Admin marks onboarding as complete                        │
│ - User status updated to "completed"                        │
│ - Success message: "You're all set! You can now submit     │
│   credit requests when you receive TikTok earnings."        │
│ - Widget closes, user can proceed                           │
└─────────────────────────────────────────────────────────────┘
```

### Flow 2: Withdrawal Widget Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Withdrawal Request Created                                  │
│ (User clicks "Withdraw" or Deposit Detected)               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Widget Opens - Step 1: Amount Confirmation                  │
│ - Display: Requested amount (if from request)              │
│   OR                                                         │
│ - Input: "How much?" (if deposit detected)                │
│ - Validation: Amount > 0, <= balance                       │
│ - Next: Proceed to proof collection                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Proof Collection (Optional)                         │
│ - Upload screenshot of PayPal transaction                  │
│ - Or skip if not required                                  │
│ - File validation: jpg, png, pdf, max 10MB                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 3: PayPal API Confirmation                            │
│ - Backend calls PayPal API to verify                       │
│ - Confirms transaction details                              │
│ - Validates amount matches                                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 4: Admin Notification                                  │
│ - Request sent to admin queue                              │
│ - Admin can review and approve                             │
│ - Widget shows "Pending Admin Approval"                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 5: Processing                                          │
│ - Admin approves (via admin panel or auto-approve)         │
│ - Backend processes via PayPal API                          │
│ - Wallet credited (for deposits)                           │
│   OR                                                         │
│ - Transaction created (for withdrawals)                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 6: Completion                                          │
│ - Success notification shown                                │
│ - Transaction details displayed                             │
│ - Widget closes                                            │
└─────────────────────────────────────────────────────────────┘
```

### Flow 3: Deposit Detection Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Deposit Detected (Webhook or Admin Action)                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Widget Auto-Opens                                           │
│ - Notification: "We detected a deposit!"                    │
│ - Shows detected amount (if available)                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ User Confirms Amount                                        │
│ - Input: "How much did you receive?"                       │
│ - OR: Confirm detected amount                              │
│ - Validation: Amount > 0                                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Continue with Withdrawal Widget Flow                        │
│ (Steps 2-6 from Flow 2)                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Technical Requirements

### Frontend Requirements

#### Widget Component Structure

```typescript
interface WidgetProps {
  trigger: 'onboarding' | 'withdrawal' | 'deposit'
  context?: {
    // For withdrawal
    amount?: number
    withdrawalRequestId?: string
    
    // For deposit
    detectedAmount?: number
    depositId?: string
    
    // For onboarding
    userId?: string
  }
  onComplete?: (result: WidgetResult) => void
  onClose?: () => void
}

interface WidgetResult {
  success: boolean
  data?: {
    onboardingStatus?: 'completed' | 'pending'
    transactionId?: string
    amount?: number
  }
  error?: string
}
```

#### Widget States

```typescript
type WidgetState = 
  | 'idle'
  | 'collecting-email'           // Onboarding: Step 1
  | 'authenticating'             // Onboarding: Step 2
  | 'verifying'                  // Onboarding: Step 3
  | 'collecting-amount'          // Withdrawal/Deposit: Step 1
  | 'collecting-proof'           // Withdrawal/Deposit: Step 2
  | 'confirming-paypal'          // Withdrawal/Deposit: Step 3
  | 'pending-admin'              // Withdrawal/Deposit: Step 4
  | 'processing'                 // Withdrawal/Deposit: Step 5
  | 'completed'                  // All flows: Final step
  | 'error'
```

#### UI Components Needed

1. **Widget Container**
   - Modal/overlay component
   - Responsive (mobile-friendly)
   - Dark/light theme support
   - Progress indicator
   - Close button (with confirmation if in progress)

2. **Step Components**
   - `EmailInputStep`: PayPal email collection
   - `OAuthRedirectStep`: PayPal OAuth flow
   - `AuthCodeInputStep`: Manual auth code entry
   - `AmountInputStep`: Amount confirmation/input
   - `FileUploadStep`: Screenshot/proof upload
   - `ConfirmationStep`: Final confirmation
   - `LoadingStep`: Processing states
   - `ErrorStep`: Error display and retry

3. **Shared Components**
   - Progress bar (shows current step)
   - Back button (navigate to previous step)
   - Skip button (for optional steps)
   - Help text/instructions

### Backend Requirements

#### New API Endpoints

##### 1. Initialize Widget Session

```
POST /api/widget/init
```

**Request:**
```json
{
  "trigger": "onboarding" | "withdrawal" | "deposit",
  "context": {
    "withdrawalRequestId": "uuid",  // Optional, for withdrawal
    "depositId": "uuid",             // Optional, for deposit
    "amount": 100.00                // Optional, pre-filled amount
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "widget_session_uuid",
    "currentStep": "collecting-email",
    "steps": [
      {
        "id": "collecting-email",
        "title": "Enter PayPal Email",
        "required": true,
        "order": 1
      },
      // ... more steps
    ],
    "config": {
      "allowSkip": false,
      "requireProof": true,
      "autoApprove": false
    }
  }
}
```

##### 2. Submit Widget Step Data

```
POST /api/widget/:sessionId/step
```

**Request (Onboarding - Request Credentials):**
```json
{
  "stepId": "request-credentials",
  "data": {}
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "nextStep": "waiting-for-admin",
    "message": "Admin has been notified. You'll receive PayPal credentials shortly."
  }
}
```

**Request (Onboarding - Enter Auth Code):**
```json
{
  "stepId": "enter-auth-code",
  "data": {
    "authCode": "123456"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "nextStep": "tiktok-setup-instructions",
    "valid": true,
    "message": "Auth code verified. Follow the instructions to set up TikTok."
  }
}
```

**Request (Onboarding - Confirm Setup):**
```json
{
  "stepId": "confirm-setup",
  "data": {
    "completed": true,
    "screenshotUrl": "https://s3.../screenshot.jpg" // Optional
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "nextStep": "pending-verification",
    "message": "Admin will verify your setup and complete onboarding."
  }
}
```

##### 3. Complete Widget Session

```
POST /api/widget/:sessionId/complete
```

**Request:**
```json
{
  "finalData": {
    // All collected data
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "result": {
      "onboardingStatus": "completed",
      "transactionId": "uuid",
      "amount": 100.00
    },
    "nextActions": [
      {
        "type": "redirect",
        "url": "/dashboard"
      }
    ]
  }
}
```

##### 4. Get Widget Session Status

```
GET /api/widget/:sessionId/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "currentStep": "collecting-amount",
    "progress": 0.5,
    "completedSteps": ["collecting-email", "authenticating"],
    "data": {
      "email": "user@example.com",
      "paypalConnected": true
    }
  }
}
```

##### 5. Request PayPal Credentials (Admin Action)

```
POST /api/admin/widget/:sessionId/provide-credentials
```

**Request:**
```json
{
  "paypalEmail": "platform@paypal.com",
  "paypalPassword": "encrypted_password", // Encrypted before sending
  "notes": "Credentials for user onboarding"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "authCode": "123456",
    "expiresAt": "2025-01-20T12:15:00Z",
    "message": "Credentials provided. Auth code sent to user."
  }
}
```

**Note**: Admin manually sends credentials to user via support chat or email. The widget tracks when user has received them.

##### 6. Process Withdrawal via PayPal

```
POST /api/widget/withdrawal/process
```

**Request:**
```json
{
  "sessionId": "uuid",
  "amount": 100.00,
  "proofUrl": "https://s3.../proof.jpg", // Optional
  "paypalTransactionId": "PAYPAL_TXN_123" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "uuid",
    "status": "pending" | "processing" | "completed",
    "adminNotificationSent": true
  }
}
```

##### 7. Verify Deposit and Credit Wallet

```
POST /api/widget/deposit/verify
```

**Request:**
```json
{
  "sessionId": "uuid",
  "amount": 100.00,
  "proofUrl": "https://s3.../proof.jpg",
  "paypalTransactionId": "PAYPAL_TXN_123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "uuid",
    "walletCredited": true,
    "newBalance": 150.00,
    "status": "completed"
  }
}
```

#### Database Schema Updates

##### Widget Sessions Table

```sql
CREATE TABLE widget_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  trigger_type VARCHAR(20) NOT NULL, -- 'onboarding', 'withdrawal', 'deposit'
  context JSONB, -- Stores context data (amount, request IDs, etc.)
  current_step VARCHAR(50) NOT NULL,
  completed_steps TEXT[] DEFAULT '{}',
  collected_data JSONB DEFAULT '{}',
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'completed', 'abandoned', 'error'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP, -- Session expires after 1 hour of inactivity
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_widget_sessions_user_id ON widget_sessions(user_id);
CREATE INDEX idx_widget_sessions_status ON widget_sessions(status);
CREATE INDEX idx_widget_sessions_expires_at ON widget_sessions(expires_at);
```

##### PayPal Auth Codes Table

```sql
CREATE TABLE widget_auth_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  session_id UUID NOT NULL REFERENCES widget_sessions(id),
  code VARCHAR(6) NOT NULL, -- 6-digit auth code
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES widget_sessions(id) ON DELETE CASCADE
);

CREATE INDEX idx_widget_auth_codes_user_id ON widget_auth_codes(user_id);
CREATE INDEX idx_widget_auth_codes_session_id ON widget_auth_codes(session_id);
CREATE INDEX idx_widget_auth_codes_code ON widget_auth_codes(code);
CREATE INDEX idx_widget_auth_codes_expires_at ON widget_auth_codes(expires_at);
```

**Note**: The platform uses a shared PayPal account. Users don't have individual PayPal connections. Instead, they use the platform's PayPal account to receive their TikTok earnings. The auth code is used to verify they've set up their TikTok account correctly.

#### PayPal Integration

##### Auth Code Management

```typescript
// Backend service for managing PayPal auth codes
class PayPalAuthCodeService {
  async generateAuthCode(userId: string, sessionId: string): Promise<string> {
    // Generate 6-digit auth code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Store code with expiration (15 minutes)
    await db.widgetAuthCodes.create({
      userId,
      sessionId,
      code,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      used: false
    })
    
    // Notify admin to send code to user
    await this.notifyAdmin(userId, code)
    
    return code
  }
  
  async validateAuthCode(userId: string, sessionId: string, code: string): Promise<boolean> {
    const authCode = await db.widgetAuthCodes.findOne({
      where: {
        userId,
        sessionId,
        code,
        used: false,
        expiresAt: { $gt: new Date() }
      }
    })
    
    if (!authCode) {
      return false
    }
    
    // Mark as used
    await db.widgetAuthCodes.update(
      { used: true, usedAt: new Date() },
      { where: { id: authCode.id } }
    )
    
    return true
  }
  
  async notifyAdmin(userId: string, code: string): Promise<void> {
    // Send notification to admin via support system
    // Admin will manually send code to user via chat/email
    await supportService.createAdminNotification({
      type: 'onboarding_auth_code',
      userId,
      message: `User ${userId} needs PayPal auth code: ${code}`,
      action: 'send_auth_code'
    })
  }
}
```

##### PayPal API Integration

```typescript
// Backend service for PayPal API operations
class PayPalAPIService {
  async verifyTransaction(transactionId: string, amount: number): Promise<boolean> {
    // Call PayPal API to verify transaction
    // Match amount and transaction details
    return true
  }
  
  async processWithdrawal(userId: string, amount: number): Promise<string> {
    // Process withdrawal via PayPal API
    // Return transaction ID
    return 'PAYPAL_TXN_123'
  }
  
  async getTransactionHistory(userId: string, limit: number = 10): Promise<Transaction[]> {
    // Fetch recent transactions
    return []
  }
}
```

---

## User Experience Flow

### Onboarding Widget UX

1. **Trigger**: User clicks "Request Onboarding" or first login
2. **Widget Opens**: Smooth slide-in animation
3. **Step 1 - Request Credentials**:
   - Clear heading: "Let's Set Up Your Payment Method"
   - Message: "We'll provide you with PayPal credentials to receive your TikTok earnings"
   - "Request Credentials" button
   - Status: "Notifying admin..."
4. **Step 2 - Waiting for Admin**:
   - Message: "Admin will send you PayPal login details shortly"
   - "Check your messages" indicator
   - "I've received the credentials" button (user clicks when ready)
5. **Step 3 - Enter Auth Code**:
   - Heading: "Enter Auth Code"
   - Input field: "6-digit code from admin"
   - Help text: "Use this code when setting up TikTok payment method"
   - "Continue" button
6. **Step 4 - TikTok Setup Instructions**:
   - Step-by-step guide with icons:
     - Step 1: Open TikTok Creator Fund
     - Step 2: Go to Payment Settings
     - Step 3: Add PayPal as payment method
     - Step 4: Enter the PayPal email (provided by admin)
     - Step 5: Enter the auth code when prompted
   - "I've completed the setup" checkbox/button
7. **Step 5 - Confirmation**:
   - Optional: Upload screenshot of TikTok payment setup
   - "Confirm Setup" button
8. **Step 6 - Pending Verification**:
   - Message: "Admin will verify your setup"
   - Status indicator: "Pending Admin Verification"
   - Widget can be closed, user will be notified
9. **Step 7 - Complete**:
   - Success message: "Onboarding complete!"
   - "You can now submit credit requests when you receive TikTok earnings"
   - Auto-close after 3 seconds or manual close

### Withdrawal Widget UX

1. **Trigger**: User creates withdrawal request OR deposit detected
2. **Widget Opens**: With context-aware message
   - Withdrawal: "Let's process your withdrawal"
   - Deposit: "We detected a deposit! Let's verify it"
3. **Step 1 - Amount**:
   - **Withdrawal**: Pre-filled amount, user can edit
   - **Deposit**: Input: "How much did you receive?"
   - Real-time validation
4. **Step 2 - Proof** (Optional):
   - Drag & drop file upload
   - Or skip button
   - Preview uploaded file
5. **Step 3 - Confirmation**:
   - Summary of details
   - "Confirm and Submit" button
6. **Step 4 - Processing**:
   - Loading animation
   - "Processing via PayPal..."
7. **Step 5 - Admin Queue**:
   - "Submitted for review"
   - "You'll be notified when processed"
8. **Step 6 - Complete**:
   - Success message
   - Transaction details
   - Close button

---

## Admin Integration

### Admin Panel Updates

#### Widget Session Monitoring

- **New Page**: `/admin/widget-sessions`
- **Features**:
  - View all active widget sessions
  - Filter by trigger type (onboarding, withdrawal, deposit)
  - View session progress and collected data
  - Manually complete or cancel sessions
  - View PayPal connection status

#### PayPal Credentials Management

- **New Section**: In user detail page (for onboarding)
- **Features**:
  - "Provide PayPal Credentials" button
  - Generate and send auth code
  - View auth code history
  - Mark credentials as sent
  - View user's TikTok setup confirmation

#### Auto-Approval Settings

- **New Setting**: In platform settings
- **Options**:
  - Auto-approve withdrawals under $X
  - Auto-approve deposits under $X
  - Require admin approval for all transactions
  - Require proof for all transactions

---

## Error Handling

### Common Error Scenarios

1. **PayPal OAuth Failed**
   - Show error message
   - Offer manual flow as fallback
   - Retry button

2. **Invalid Auth Code**
   - Clear error: "Invalid code. Please check and try again."
   - Resend code option (admin action)

3. **PayPal API Error**
   - Log error
   - Notify admin
   - Show user-friendly message: "We're having trouble connecting to PayPal. Our team has been notified."

4. **Session Expired**
   - Detect expired session
   - Show message: "Session expired. Please start over."
   - Auto-close widget

5. **Network Error**
   - Retry mechanism
   - Save progress locally (if possible)
   - Resume from last step

### Error Recovery

- **Auto-retry**: For transient errors (network, API timeouts)
- **Manual retry**: User-initiated retry button
- **Fallback flows**: Alternative paths when primary flow fails
- **Admin intervention**: Escalate to admin when needed

---

## Security Considerations

### Data Protection

1. **PayPal Credentials**:
   - Encrypt access tokens at rest
   - Use secure environment variables
   - Never log sensitive data

2. **Session Security**:
   - Encrypt session IDs in OAuth state
   - Validate session ownership
   - Expire sessions after inactivity

3. **API Security**:
   - Rate limiting on widget endpoints
   - Validate user ownership of resources
   - Sanitize all inputs

### Fraud Prevention

1. **Amount Validation**:
   - Verify amounts match PayPal transactions
   - Check for duplicate transactions
   - Flag suspicious patterns

2. **Proof Verification**:
   - Image analysis (optional, future)
   - Metadata validation
   - Admin review for large amounts

3. **Auth Code Security**:
   - Codes expire after 15 minutes
   - One-time use only
   - Rate limiting on code validation attempts
   - Admin can regenerate codes if needed

4. **Credential Security**:
   - Credentials never stored in plain text
   - Admin sends credentials via secure channel
   - Track when credentials are provided
   - Ability to revoke/reset if compromised

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Database schema updates
- [ ] Widget session management backend
- [ ] Basic widget component structure
- [ ] API endpoints for session management

### Phase 2: Onboarding Flow (Week 2-3)
- [ ] Credential request system
- [ ] Auth code generation and validation
- [ ] Admin credential provision interface
- [ ] TikTok setup instructions UI
- [ ] Setup confirmation flow
- [ ] Onboarding widget UI

### Phase 3: Withdrawal Flow (Week 3-4)
- [ ] Amount collection and validation
- [ ] File upload for proof
- [ ] PayPal API integration for withdrawals
- [ ] Admin notification system
- [ ] Withdrawal widget UI

### Phase 4: Deposit Flow (Week 4-5)
- [ ] Deposit detection (webhook or manual)
- [ ] Amount confirmation
- [ ] Wallet crediting logic
- [ ] Deposit widget UI

### Phase 5: Admin Integration (Week 5)
- [ ] Widget session monitoring page
- [ ] PayPal connections management
- [ ] Auto-approval settings
- [ ] Admin notifications

### Phase 6: Polish & Testing (Week 6)
- [ ] Error handling improvements
- [ ] Mobile responsiveness
- [ ] Loading states and animations
- [ ] Comprehensive testing
- [ ] Documentation

---

## Success Metrics

### User Experience
- **Onboarding completion rate**: Target 90%+ (vs. current manual process)
- **Time to complete onboarding**: Target < 5 minutes (vs. current days)
- **Withdrawal processing time**: Target < 24 hours (vs. current manual)

### Technical
- **Widget session success rate**: Target 95%+
- **PayPal connection success rate**: Target 90%+
- **Error recovery rate**: Target 80%+ (users successfully retry after error)

### Business
- **Reduced admin workload**: Target 70% reduction in manual onboarding tasks
- **Faster transaction processing**: Target 50% faster withdrawal processing
- **User satisfaction**: Target 4.5+ stars (if we add feedback)

---

## Open Questions & Decisions Needed

1. **Credential Delivery Method**:
   - How should admin send PayPal credentials to users? (Support chat, email, SMS?)
   - Should credentials be stored temporarily in the system or always sent manually?
   - How do we ensure security when sharing credentials?

2. **Proof Requirement**:
   - Always required or optional?
   - Different rules for different amounts?
   - Admin-configurable?

3. **Auto-Approval**:
   - Should we auto-approve small amounts?
   - What's the threshold?
   - Admin-configurable?

4. **Deposit Detection**:
   - Webhook from PayPal or manual admin action?
   - How do we detect deposits?
   - Real-time or batch processing?

5. **Widget Persistence**:
   - Should widget state persist across page refreshes?
   - How long should sessions last?
   - Should users be able to resume?

6. **Mobile Experience**:
   - Full-screen widget on mobile?
   - Inline widget on desktop?
   - Different flows for mobile vs desktop?

---

## Next Steps

1. **Review this document** with the team
2. **Answer open questions** and make decisions
3. **Prioritize features** for MVP vs future enhancements
4. **Create detailed technical specs** for each component
5. **Set up development environment** (PayPal sandbox, etc.)
6. **Begin Phase 1 implementation**

---

## Appendix: Example API Calls

### Initialize Onboarding Widget

```bash
curl -X POST http://localhost:3001/api/widget/init \
  -H "Authorization: Bearer <user_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "trigger": "onboarding"
  }'
```

### Request Credentials Step

```bash
curl -X POST http://localhost:3001/api/widget/<session_id>/step \
  -H "Authorization: Bearer <user_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "stepId": "request-credentials",
    "data": {}
  }'
```

### Submit Auth Code Step

```bash
curl -X POST http://localhost:3001/api/widget/<session_id>/step \
  -H "Authorization: Bearer <user_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "stepId": "enter-auth-code",
    "data": {
      "authCode": "123456"
    }
  }'
```

### Confirm TikTok Setup

```bash
curl -X POST http://localhost:3001/api/widget/<session_id>/step \
  -H "Authorization: Bearer <user_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "stepId": "confirm-setup",
    "data": {
      "completed": true,
      "screenshotUrl": "https://s3.../screenshot.jpg"
    }
  }'
```

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-XX  
**Author**: Development Team  
**Status**: Draft - Pending Review

