# BuyTikTokCoins - Product Overview

## Table of Contents
1. [Product Vision](#product-vision)
2. [Problem Statement](#problem-statement)
3. [Solution Overview](#solution-overview)
4. [Target Users](#target-users)
5. [Core Features](#core-features)
6. [User Journeys](#user-journeys)
7. [Business Logic](#business-logic)
8. [Key Workflows](#key-workflows)
9. [Technical Requirements](#technical-requirements)

---

## Product Vision

**BuyTikTokCoins** is a financial intermediary platform that enables TikTok creators to withdraw their earnings from TikTok Creator Fund and monetization features. The platform acts as an agency that facilitates the withdrawal process by allowing creators to link their TikTok accounts, verify earnings, and receive payments in their local currency (NGN - Nigerian Naira).

### Mission
To empower TikTok creators, especially in regions where direct TikTok payouts are limited, by providing a seamless, secure, and compliant way to access their earnings.

---

## Problem Statement

### The Challenge
1. **Geographic Limitations**: TikTok's Creator Fund and monetization features have limited payout options in many countries, particularly in Africa (e.g., Nigeria).
2. **Currency Barriers**: Creators earn in USD but need local currency (NGN) for daily expenses.
3. **Complex Withdrawal Process**: Direct TikTok payouts can be complicated, require specific payment methods, and may have high transaction fees.
4. **Trust & Verification**: Creators need a trusted intermediary to verify earnings and process withdrawals securely.

### Our Solution
We act as a registered agency that:
- Allows creators to join our agency and add our account as their payment method on TikTok
- Verifies and confirms withdrawals from TikTok
- Credits creators' local accounts in USD
- Processes withdrawals to creators' Nigerian bank accounts in NGN

---

## Solution Overview

### How It Works

1. **Creator Onboarding**
   - Creator signs up on the platform
   - Completes onboarding process with admin assistance
   - Links TikTok account and sets up our agency account as payment method on TikTok

2. **Earning & Credit Flow**
   - Creator earns money on TikTok (via Creator Fund, gifts, etc.)
   - Creator initiates a withdrawal on TikTok to our agency account
   - Creator submits credit request on our platform with:
     - Amount earned
     - Proof of earnings (screenshot/PDF from TikTok)
   - Admin reviews and verifies the proof
   - Upon approval, amount is credited to creator's balance on our platform

3. **Withdrawal to Bank**
   - Creator requests withdrawal to their Nigerian bank account
   - Amount is converted from USD to NGN using current exchange rate
   - Processing fee is deducted
   - Admin processes the bank transfer
   - Creator receives funds in their bank account

---

## Target Users

### Primary Users: TikTok Creators
- **Location**: Primarily Nigeria and other African countries
- **Profile**: Active TikTok creators with monetization enabled
- **Needs**: 
  - Access to TikTok earnings
  - Local currency conversion
  - Reliable withdrawal process
  - Support and guidance

### Secondary Users: Platform Administrators
- **Role**: Manage the platform, verify transactions, assist creators
- **Responsibilities**:
  - Review and approve credit requests
  - Process payouts
  - Manage user accounts
  - Configure platform settings
  - Provide customer support

---

## Core Features

### For Creators (User Dashboard)

1. **Account Management**
   - Sign up with email and phone number
   - Email verification with 6-digit code
   - Profile management
   - Theme preferences (light/dark mode)

2. **Onboarding System**
   - First-time users request onboarding assistance
   - Admin helps set up TikTok account connection
   - Status tracking (pending/completed)

3. **Credit Request System**
   - Submit credit requests with:
     - Amount (USD)
     - Proof of earnings (image or PDF)
   - Track request status:
     - `none`: No active request
     - `pending`: Awaiting admin review
     - `sent`: Approved and credited to balance
     - `rejected`: Request denied with reason

4. **Balance Management**
   - View available balance in USD
   - Real-time balance updates
   - Transaction history

5. **Withdrawal System**
   - Request withdrawal to Nigerian bank account
   - Automatic USD to NGN conversion
   - Processing fee calculation
   - Status tracking (pending/processing/completed/rejected)

6. **Transaction History**
   - View all transactions (credits, withdrawals)
   - Search and filter functionality
   - Detailed transaction information

7. **Support**
   - Live chat
   - FAQ section
   - Email support

8. **Exchange Rate Information**
   - View current USD to NGN rate
   - Rate update timestamp

### For Administrators (Admin Dashboard)

1. **Dashboard Overview**
   - Key statistics:
     - Pending credit requests
     - Onboarding requests
     - Total users
     - Total transactions
     - Pending payouts

2. **Credit Request Management**
   - View all credit requests
   - Search and filter by status
   - Review proof of earnings
   - Approve or reject requests
   - Add notes and rejection reasons

3. **Onboarding Management**
   - View onboarding requests
   - Complete onboarding for users
   - Track onboarding status

4. **Payout Management**
   - View all payout requests
   - Approve payouts
   - Process bank transfers
   - Mark payouts as completed
   - Reject payouts with reasons

5. **User Management**
   - View all users
   - Search and filter users
   - Suspend/unsuspend users
   - Freeze/unfreeze user wallets
   - View user details and transaction history

6. **Transaction Monitoring**
   - View all platform transactions
   - Search and filter transactions
   - Monitor transaction status

7. **Admin Management**
   - Create admin accounts
   - Manage admin roles and permissions
   - Enable/disable admins
   - Role-based access control:
     - `admin`: Standard admin access
     - `super_admin`: Full access including admin management and settings

8. **Platform Settings**
   - Exchange rate management (USD to NGN)
   - Payout settings:
     - Minimum/maximum payout limits
     - Processing fees
     - Processing time
     - Bank account requirement toggle
   - Platform settings:
     - Maintenance mode
     - Allow new registrations
     - Require KYC verification
     - Auto-approve credits (not recommended)

---

## User Journeys

### Journey 1: New Creator Signup & First Withdrawal

1. **Signup**
   - Creator visits landing page
   - Clicks "Register"
   - Fills signup form (email, password, phone)
   - Receives verification code via email
   - Verifies email with code
   - Account created

2. **Onboarding**
   - Creator logs in
   - Sees onboarding banner (first-time user)
   - Requests onboarding assistance
   - Admin contacts creator
   - Admin helps creator:
     - Link TikTok account
     - Add agency account as payment method
     - Verify setup
   - Admin marks onboarding as completed

3. **First Credit Request**
   - Creator earns money on TikTok
   - Creator withdraws from TikTok to agency account
   - Creator submits credit request:
     - Enters amount
     - Uploads proof (screenshot/PDF)
   - Request status: `pending`
   - Admin reviews proof
   - Admin approves request
   - Request status: `sent`
   - Creator's balance is credited

4. **First Withdrawal**
   - Creator views balance
   - Creator clicks "Withdraw to Bank"
   - Creator enters amount (if multiple bank accounts, selects one)
   - System calculates:
     - Amount in NGN (using current exchange rate)
     - Processing fee
     - Net amount
   - Creator confirms withdrawal
   - Request status: `pending`
   - Admin approves and processes
   - Request status: `processing`
   - Bank transfer completed
   - Request status: `completed`
   - Creator receives funds

### Journey 2: Returning Creator - Regular Withdrawal

1. **Credit Request**
   - Creator has completed onboarding
   - Creator earns on TikTok
   - Creator submits credit request with proof
   - Admin approves
   - Balance credited

2. **Withdrawal**
   - Creator requests withdrawal
   - Admin processes
   - Funds transferred

### Journey 3: Admin Workflow - Daily Operations

1. **Morning Review**
   - Admin logs in
   - Views dashboard statistics
   - Checks pending credit requests
   - Reviews proofs and approves/rejects

2. **Onboarding Assistance**
   - Views pending onboarding requests
   - Contacts creators
   - Assists with setup
   - Marks as completed

3. **Payout Processing**
   - Views pending payouts
   - Approves payouts
   - Processes bank transfers
   - Marks as completed

4. **User Management**
   - Monitors user activity
   - Handles support requests
   - Manages user accounts (suspend/freeze if needed)

---

## Business Logic

### Credit Request Flow

1. **Submission**
   - Creator can only have ONE pending credit request at a time
   - Creator must be onboarded (onboarding status = `completed`)
   - Amount must be positive (minimum $1.00)
   - Proof file must be valid (image or PDF, max 10MB)

2. **Review Process**
   - Admin reviews proof of earnings
   - Admin verifies:
     - Amount matches TikTok earnings
     - Proof is legitimate
     - Creator account is in good standing
   - Admin can:
     - Approve: Credit is added to creator's balance
     - Reject: Provide reason, creator can submit new request

3. **Approval**
   - When approved:
     - Creator's balance increases by requested amount
     - Transaction record created
     - Status changes to `sent`
   - Creator can immediately request withdrawal

### Withdrawal Flow

1. **Request Validation**
   - Creator must have sufficient balance
   - If `bankAccountRequired` setting is enabled, creator must have linked bank account
   - Amount must be within min/max limits (in NGN)
   - Creator wallet must not be frozen

2. **Conversion & Fees**
   - Amount converted from USD to NGN using current exchange rate
   - Processing fee calculated (in NGN)
   - Net amount = (Amount in NGN) - Processing Fee

3. **Processing**
   - Admin approves payout
   - Status: `processing`
   - Admin initiates bank transfer
   - Admin marks as `completed` with transaction reference
   - Creator's balance is debited

4. **Rejection**
   - Admin can reject with reason
   - Creator's balance remains unchanged
   - Creator can submit new request

### Exchange Rate Management

- Exchange rate is set by admin in platform settings
- Rate is displayed to users on dashboard
- Rate is used for all USD to NGN conversions
- Rate should be updated regularly to reflect market rates
- Historical rate changes should be logged for audit purposes

### Onboarding Logic

- New users have `onboardingStatus: "pending"` by default
- Users cannot submit credit requests until onboarding is completed
- Onboarding is completed by admin after assisting creator
- Once completed, creator can use all platform features

### User Status Management

**User Status:**
- `active`: Normal operation
- `suspended`: Account suspended, cannot login
- `frozen`: Account active but wallet frozen (cannot withdraw)

**Wallet Status:**
- `active`: Normal operation
- `frozen`: Cannot withdraw, but can receive credits

**Use Cases:**
- Suspend user: For violations, security issues
- Freeze wallet: For suspicious activity, investigation

---

## Key Workflows

### Workflow 1: Credit Request Approval

```
Creator submits credit request
    ↓
Status: pending
    ↓
Admin reviews proof
    ↓
[Decision Branch]
    ├─ Approve → Balance credited → Status: sent
    └─ Reject → Reason provided → Status: rejected
```

### Workflow 2: Payout Processing

```
Creator requests withdrawal
    ↓
System validates (balance, limits, bank account)
    ↓
Amount converted USD → NGN
    ↓
Processing fee calculated
    ↓
Status: pending
    ↓
Admin approves
    ↓
Status: processing
    ↓
Admin processes bank transfer
    ↓
Admin marks completed with reference
    ↓
Status: completed
    ↓
Balance debited
```

### Workflow 3: Onboarding Completion

```
New user signs up
    ↓
Onboarding status: pending
    ↓
User requests onboarding
    ↓
Admin contacts user
    ↓
Admin assists with TikTok setup
    ↓
Admin verifies setup
    ↓
Admin marks onboarding complete
    ↓
Onboarding status: completed
    ↓
User can now submit credit requests
```

### Workflow 4: Email Verification

```
User signs up
    ↓
6-digit code generated
    ↓
Code sent to email
    ↓
Code expires in 15 minutes
    ↓
User enters code
    ↓
[Validation]
    ├─ Valid → Email verified → User can login
    └─ Invalid/Expired → Error → User can request new code
```

---

## Technical Requirements

### Security Requirements

1. **Authentication**
   - JWT tokens for API authentication
   - Token expiration (24 hours access, 7 days refresh)
   - Secure password hashing (bcrypt)
   - Email verification required before login

2. **Authorization**
   - Role-based access control (RBAC)
   - Admin permissions system
   - User status checks (suspended users cannot login)
   - Wallet status checks (frozen wallets cannot withdraw)

3. **Data Protection**
   - All sensitive data encrypted
   - File uploads stored securely
   - Payment information encrypted
   - Audit logs for admin actions

4. **Rate Limiting**
   - Prevent abuse on authentication endpoints
   - Limit API requests per user
   - Prevent spam on verification codes

### Data Requirements

1. **User Data**
   - Email, password (hashed), phone
   - Profile information
   - Balance (USD)
   - Status flags

2. **Transaction Data**
   - All credits and withdrawals
   - Status tracking
   - Timestamps
   - Admin actions

3. **File Storage**
   - Credit request proofs (images/PDFs)
   - Secure storage with unique filenames
   - Access control (only admins and request owner)

4. **Audit Trail**
   - All admin actions logged
   - User status changes
   - Balance changes
   - Settings changes

### Integration Requirements

1. **Email Service**
   - Send verification codes
   - Send notifications
   - Transactional emails

2. **File Storage**
   - Store proof files
   - Generate secure URLs
   - Handle file uploads

3. **Bank Transfer (Future)**
   - Integration with Nigerian banks
   - Payment gateway integration
   - Transaction tracking

### Performance Requirements

1. **Response Times**
   - API responses < 500ms
   - File uploads < 5 seconds
   - Dashboard load < 2 seconds

2. **Scalability**
   - Support 10,000+ users
   - Handle concurrent requests
   - Efficient database queries

3. **Reliability**
   - 99.9% uptime
   - Data backup and recovery
   - Error handling and logging

---

## Important Business Rules

1. **One Pending Credit Request**
   - Users can only have ONE pending credit request at a time
   - Must wait for approval/rejection before submitting new request

2. **Onboarding Requirement**
   - Users cannot submit credit requests until onboarding is completed
   - Onboarding is a one-time process

3. **Balance Management**
   - Credits increase balance
   - Withdrawals decrease balance
   - Balance cannot go negative
   - All amounts in USD until conversion

4. **Exchange Rate**
   - Set by admin
   - Applied at time of withdrawal request
   - Should be updated regularly

5. **Processing Fees**
   - Fixed amount in NGN
   - Deducted from withdrawal amount
   - Set by admin in platform settings

6. **Payout Limits**
   - Minimum and maximum limits in NGN
   - Enforced at withdrawal request
   - Set by admin in platform settings

7. **Bank Account Requirement**
   - Can be toggled by admin
   - If enabled, users must link bank account before withdrawal

8. **Auto-Approve Credits**
   - Optional setting (not recommended)
   - If enabled, credit requests auto-approve
   - Should only be used for trusted users

---

## Success Metrics

### User Metrics
- Number of registered creators
- Onboarding completion rate
- Credit request approval rate
- Average time to process credit requests
- Average withdrawal amount
- User retention rate

### Financial Metrics
- Total credits processed
- Total payouts processed
- Average processing time
- Exchange rate accuracy
- Fee collection

### Operational Metrics
- Admin response time
- Support ticket resolution time
- System uptime
- Error rate
- Transaction success rate

---

## Future Enhancements

1. **Automated Verification**
   - AI-powered proof verification
   - Automatic credit approval for trusted users

2. **Multiple Payment Methods**
   - Bank transfers
   - Mobile money
   - Cryptocurrency

3. **Advanced Analytics**
   - Creator earnings dashboard
   - Revenue trends
   - Performance insights

4. **Mobile App**
   - Native iOS/Android apps
   - Push notifications
   - Mobile-optimized experience

5. **Multi-Currency Support**
   - Support for other African currencies
   - Dynamic exchange rates

---

**Document Version:** 1.0  
**Last Updated:** January 2024

