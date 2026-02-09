# BVN/NIN Onboarding Requirements Feature

## Overview

This feature allows administrators to control whether users must provide their Bank Verification Number (BVN) or National Identification Number (NIN) before they can submit an onboarding request. This helps prevent fake onboarding requests and ensures proper user verification when needed.

## Business Rules Settings

Two new toggle fields have been added to the **Business Rules** section of Platform Settings:

### 1. Require BVN for Onboarding
- **Field**: `requireBvnForOnboarding`
- **Type**: Boolean
- **Default**: `false`
- **Description**: When enabled, users must have BVN data in their `sudoCustomerOnboardingData` before submitting an onboarding request

### 2. Require NIN for Onboarding
- **Field**: `requireNinForOnboarding`
- **Type**: Boolean
- **Default**: `false`
- **Description**: When enabled, users must have NIN data in their `sudoCustomerOnboardingData` before submitting an onboarding request

## How It Works

### Admin Configuration

Admins can toggle these requirements on/off via the Settings page:

1. Navigate to **Settings** > **Business Rules**
2. Toggle **Require BVN for Onboarding** and/or **Require NIN for Onboarding**
3. Click **Save Business Rules**

### User Experience

When a user tries to submit an onboarding request:

1. **If BVN is required**: System checks if `user.sudoCustomerOnboardingData.identity.identityType === 'BVN'` and `identityNumber` is present
2. **If NIN is required**: System checks if `user.sudoCustomerOnboardingData.identity.identityType === 'NIN'` and `identityNumber` is present
3. **If requirements are not met**: User receives a clear error message indicating which identity document is required
4. **If requirements are met**: Onboarding request is created successfully

### Error Messages

Users will receive specific error messages:
- `"BVN is required for onboarding. Please provide your BVN before submitting an onboarding request."`
- `"NIN is required for onboarding. Please provide your NIN before submitting an onboarding request."`

## API Endpoints

### Update Business Rules (Admin)
```http
PATCH /api/admin/settings/business-rules
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "requireBvnForOnboarding": true,
  "requireNinForOnboarding": false
}
```

### Get Business Rules Settings
```http
GET /api/admin/settings/business-rules
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "minCreditRequestAmount": null,
  "maxCreditRequestAmount": null,
  "creditRequestCooldownHours": 24,
  "payoutRequestCooldownHours": 24,
  "maxActiveCreditRequests": 1,
  "maxActivePayoutRequests": 1,
  "requireBvnForOnboarding": true,
  "requireNinForOnboarding": false
}
```

### Get Onboarding Status (User)
```http
GET /api/user/onboarding/status
Authorization: Bearer <user-token>
```

**Response:**
```json
{
  "onboardingStatus": "pending",
  "requirements": {
    "bvnRequired": true,
    "ninRequired": false,
    "hasBvn": true,
    "hasNin": false,
    "canSubmitRequest": true
  },
  "latestRequest": {
    "id": "uuid",
    "message": "Please verify my account",
    "status": "pending",
    "submittedAt": "2026-02-07T20:00:00.000Z",
    "completedAt": null,
    "notes": null
  }
}
```

### Submit Onboarding Request (User)
```http
POST /api/user/onboarding/request
Authorization: Bearer <user-token>
Content-Type: application/json

{
  "message": "Please verify my account"
}
```

**Success Response (200):**
```json
{
  "id": "uuid",
  "message": "Please verify my account",
  "status": "pending",
  "submittedAt": "2026-02-07T20:00:00.000Z"
}
```

**Error Response (400) - BVN Required:**
```json
{
  "statusCode": 400,
  "message": "BVN is required for onboarding. Please provide your BVN before submitting an onboarding request.",
  "error": "Bad Request"
}
```

## Database Migration

Run the following migration to add the new columns:

```bash
# Using Railway CLI
railway run psql $DATABASE_URL -f database/migrations/add-bvn-nin-onboarding-requirements.sql

# Using local psql
psql -U <username> -d <database> -f database/migrations/add-bvn-nin-onboarding-requirements.sql
```

The migration adds:
- `require_bvn_for_onboarding` column (BOOLEAN, default FALSE)
- `require_nin_for_onboarding` column (BOOLEAN, default FALSE)

## Use Cases

### 1. Promotional Period (No Verification Required)
- **Scenario**: Running a promo to onboard users quickly
- **Configuration**: Set both `requireBvnForOnboarding` and `requireNinForOnboarding` to `false`
- **Result**: Users can submit onboarding requests without BVN/NIN

### 2. Standard Operation (BVN Required)
- **Scenario**: Normal operations, require basic verification
- **Configuration**: Set `requireBvnForOnboarding` to `true`, `requireNinForOnboarding` to `false`
- **Result**: Users must provide BVN before onboarding

### 3. High Security (Both Required)
- **Scenario**: Need maximum verification for compliance
- **Configuration**: Set both `requireBvnForOnboarding` and `requireNinForOnboarding` to `true`
- **Result**: Users must provide either BVN or NIN before onboarding

### 4. Prevent Fake Onboarding Requests
- **Scenario**: Experiencing spam onboarding requests
- **Configuration**: Enable at least one requirement
- **Result**: Only users who have completed card onboarding (which requires BVN/NIN) can submit onboarding requests

## Frontend Integration

### Display Requirements Status
```typescript
// Fetch onboarding status
const response = await fetch('/api/user/onboarding/status', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();

// Check if user can submit request
if (!data.requirements.canSubmitRequest) {
  if (data.requirements.bvnRequired && !data.requirements.hasBvn) {
    showError('Please provide your BVN to submit an onboarding request');
  }
  if (data.requirements.ninRequired && !data.requirements.hasNin) {
    showError('Please provide your NIN to submit an onboarding request');
  }
  
  // Disable onboarding request button
  disableOnboardingButton();
} else {
  // Enable onboarding request button
  enableOnboardingButton();
}
```

### Admin Settings UI
```typescript
// Update business rules
const updateSettings = async (data) => {
  await fetch('/api/admin/settings/business-rules', {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requireBvnForOnboarding: data.requireBvnForOnboarding,
      requireNinForOnboarding: data.requireNinForOnboarding
    })
  });
};
```

## Technical Details

### Data Structure

User's identity data is stored in `sudoCustomerOnboardingData`:

```typescript
interface SudoCustomerOnboardingData {
  dob?: string;
  billingAddress?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  identity?: {
    identityType?: 'BVN' | 'NIN';
    identityNumber?: string;
  };
  onboardingStep?: string;
  onboardingCompleted?: boolean;
}
```

### Validation Logic

The system validates identity in `OnboardingService.createOnboardingRequest()`:

```typescript
// Check if BVN is required
if (businessRules.requireBvnForOnboarding) {
  const hasBvn = user.sudoCustomerOnboardingData?.identity?.identityType === 'BVN' &&
                 user.sudoCustomerOnboardingData?.identity?.identityNumber;
  if (!hasBvn) {
    throw new BadRequestException('BVN is required for onboarding...');
  }
}

// Check if NIN is required
if (businessRules.requireNinForOnboarding) {
  const hasNin = user.sudoCustomerOnboardingData?.identity?.identityType === 'NIN' &&
                 user.sudoCustomerOnboardingData?.identity?.identityNumber;
  if (!hasNin) {
    throw new BadRequestException('NIN is required for onboarding...');
  }
}
```

## Files Modified

1. **src/settings/interfaces/settings.interface.ts** - Added fields to `BusinessRulesSettings` interface
2. **src/settings/entities/platform-settings.entity.ts** - Added database columns
3. **src/settings/dto/update-business-rules-settings.dto.ts** - Added DTO fields
4. **src/settings/settings.service.ts** - Added update logic and response mapping
5. **src/onboarding/onboarding.service.ts** - Added validation logic
6. **src/onboarding/onboarding.module.ts** - Added `SettingsModule` import
7. **database/migrations/add-bvn-nin-onboarding-requirements.sql** - Database migration

## Testing Checklist

- [ ] Run database migration
- [ ] Test enabling BVN requirement via admin settings
- [ ] Test enabling NIN requirement via admin settings
- [ ] Test user with no identity data cannot submit onboarding request when required
- [ ] Test user with BVN can submit request when BVN is required
- [ ] Test user with NIN can submit request when NIN is required
- [ ] Test user can submit request when no requirements are enabled
- [ ] Test onboarding status endpoint returns correct requirements
- [ ] Test frontend displays correct error messages
- [ ] Test toggling requirements on/off works seamlessly

## Deployment Steps

1. **Deploy Backend Changes**:
   ```bash
   git add .
   git commit -m "Add BVN/NIN onboarding requirements feature"
   git push origin main
   ```

2. **Run Migration on Railway**:
   ```bash
   railway run psql $DATABASE_URL -f database/migrations/add-bvn-nin-onboarding-requirements.sql
   ```

3. **Verify Settings**:
   - Log in to admin panel
   - Navigate to Settings > Business Rules
   - Confirm new toggles are visible
   - Test toggling on/off and saving

4. **Test User Flow**:
   - Create a test user without BVN/NIN
   - Enable BVN requirement
   - Attempt onboarding request (should fail)
   - Add BVN to user via card onboarding
   - Attempt onboarding request (should succeed)

## Notes

- This feature integrates with the existing Sudo card onboarding flow, where users provide BVN/NIN
- Users who have completed card onboarding will already have the required identity data
- The requirements can be toggled on/off instantly without requiring user re-authentication
- Both BVN and NIN requirements can be enabled simultaneously, but users only need one valid identity type
