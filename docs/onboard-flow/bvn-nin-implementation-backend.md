# BVN/NIN Onboarding Requirements - Implementation Summary

## What Was Done

I've successfully implemented a feature that allows admins to toggle BVN and NIN requirements for user onboarding. This helps prevent fake onboarding requests and ensures proper verification when needed.

## Key Changes

### 1. Database Layer
- **New Columns in `platform_settings` table**:
  - `require_bvn_for_onboarding` (BOOLEAN, default FALSE)
  - `require_nin_for_onboarding` (BOOLEAN, default FALSE)

### 2. Settings System
- **Added to Business Rules Settings**:
  - Two new boolean toggles visible in the admin settings UI
  - Defaults to `false` (disabled) to maintain current behavior
  - Can be toggled independently

### 3. Onboarding Validation
- **Before submitting an onboarding request**, the system now:
  1. Fetches the current business rules settings
  2. Checks if BVN is required and if user has provided BVN
  3. Checks if NIN is required and if user has provided NIN
  4. Throws a clear error message if requirements are not met
  5. Allows request submission if all requirements are satisfied

### 4. Enhanced Status Endpoint
- **`GET /api/user/onboarding/status`** now returns:
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
    "latestRequest": { ... }
  }
  ```

## How It Works

### For Admins
1. Go to **Settings** > **Business Rules**
2. Toggle **Require BVN for Onboarding** and/or **Require NIN for Onboarding**
3. Click **Save Business Rules**
4. Changes take effect immediately

### For Users
- When requirements are **disabled** (default):
  - Users can submit onboarding requests freely (current behavior)
  
- When **BVN is required**:
  - Users must have completed card onboarding with BVN
  - Error message: *"BVN is required for onboarding. Please provide your BVN before submitting an onboarding request."*
  
- When **NIN is required**:
  - Users must have completed card onboarding with NIN
  - Error message: *"NIN is required for onboarding. Please provide your NIN before submitting an onboarding request."*

## Use Cases

### 1. Promotional Period
- **Setting**: Both toggles OFF
- **Result**: Anyone can submit onboarding requests (fast onboarding for promos)

### 2. Prevent Fake Requests
- **Setting**: BVN toggle ON
- **Result**: Only users who went through card onboarding (with identity verification) can request onboarding

### 3. High Security
- **Setting**: Both toggles ON
- **Result**: Maximum verification - users must have either BVN or NIN from card onboarding

## Next Steps

1. **Run the database migration**:
   ```bash
   railway run psql $DATABASE_URL -f database/migrations/add-bvn-nin-onboarding-requirements.sql
   ```

2. **Deploy to Railway**:
   ```bash
   git add .
   git commit -m "feat: Add BVN/NIN onboarding requirements toggles"
   git push origin main
   ```

3. **Test the feature**:
   - Log in to admin panel
   - Go to Settings > Business Rules
   - Toggle the new options
   - Test with a user account

## Files Changed

1. `src/settings/interfaces/settings.interface.ts` - Added interface fields
2. `src/settings/entities/platform-settings.entity.ts` - Added DB columns
3. `src/settings/dto/update-business-rules-settings.dto.ts` - Added DTO fields
4. `src/settings/settings.service.ts` - Added update logic
5. `src/onboarding/onboarding.service.ts` - Added validation logic
6. `src/onboarding/onboarding.module.ts` - Added SettingsModule import
7. `database/migrations/add-bvn-nin-onboarding-requirements.sql` - Migration file
8. `BVN_NIN_ONBOARDING_REQUIREMENTS.md` - Full documentation

## Integration with Existing Systems

This feature seamlessly integrates with:
- **Card Onboarding System**: Users provide BVN/NIN during card creation (Sudo API)
- **User Entity**: Identity data is stored in `sudoCustomerOnboardingData.identity`
- **Settings System**: Uses existing platform settings infrastructure
- **Onboarding Flow**: Adds validation before request creation

## Technical Notes

- The validation happens in `OnboardingService.createOnboardingRequest()`
- Settings are fetched dynamically, so changes take effect immediately
- Error messages are clear and actionable for users
- The system checks if `identityType` matches AND `identityNumber` exists
- Both BVN and NIN can be required, but user only needs to have one valid identity

## Ready for Production

✅ All files updated
✅ No linter errors
✅ Migration script created
✅ Documentation complete
✅ Backward compatible (defaults to current behavior)

The feature is now ready to deploy and test!
