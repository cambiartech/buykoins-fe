# Platform Settings Module - API Documentation

## Overview

The Platform Settings module allows admins to manage all platform configuration settings. Settings are organized into logical categories for better management and type safety.

**Base URL:** `/api/admin/settings`

**Authentication:** All endpoints require admin authentication (Bearer token)

**Permissions:**
- `settings:view` - Required to view settings
- `settings:update` - Required to update settings
- Super admins have all permissions

---

## Endpoints

### 1. Get All Settings

**Endpoint:** `GET /api/admin/settings`

**Description:** Retrieve all platform settings grouped by category.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Required Permissions:** `settings:view`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "financial": {
      "exchangeRateUsdToNgn": 1500.00,
      "exchangeRateLastUpdated": "2025-12-09T10:00:00.000Z",
      "processingFee": 50.00,
      "processingFeeType": "fixed",
      "processingFeePercentage": null,
      "minPayout": 1000.00,
      "maxPayout": 1000000.00,
      "dailyPayoutLimit": null,
      "monthlyPayoutLimit": null
    },
    "operations": {
      "maintenanceMode": false,
      "maintenanceMessage": null,
      "allowNewRegistrations": true,
      "requireEmailVerification": true,
      "requireKyc": false,
      "autoApproveCredits": false,
      "autoApproveThreshold": null,
      "autoVerifySupport": false
    },
    "payment": {
      "bankAccountRequired": true,
      "requireVerifiedBankAccount": true,
      "processingTime": "24-48 hours",
      "processingTimeBusinessDays": 2
    },
    "businessRules": {
      "minCreditRequestAmount": null,
      "maxCreditRequestAmount": null,
      "creditRequestCooldownHours": 24,
      "payoutRequestCooldownHours": 24,
      "maxActiveCreditRequests": 1,
      "maxActivePayoutRequests": 1
    },
    "platformInfo": {
      "platformName": "BuyTikTokCoins",
      "supportEmail": null,
      "supportPhone": null,
      "termsOfServiceUrl": null,
      "privacyPolicyUrl": null
    },
    "extended": {},
    "metadata": {
      "updatedAt": "2025-12-09T10:00:00.000Z",
      "updatedBy": null
    }
  }
}
```

---

### 2. Get Settings by Category

**Endpoint:** `GET /api/admin/settings/:category`

**Description:** Retrieve settings for a specific category.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Required Permissions:** `settings:view`

**Path Parameters:**
- `category` (string, required) - One of: `financial`, `operations`, `payment`, `business-rules`, `platform-info`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "exchangeRateUsdToNgn": 1500.00,
    "exchangeRateLastUpdated": "2025-12-09T10:00:00.000Z",
    "processingFee": 50.00,
    "processingFeeType": "fixed",
    "processingFeePercentage": null,
    "minPayout": 1000.00,
    "maxPayout": 1000000.00,
    "dailyPayoutLimit": null,
    "monthlyPayoutLimit": null
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Invalid category: invalid_category"
}
```

---

### 3. Update Financial Settings

**Endpoint:** `PATCH /api/admin/settings/financial`

**Description:** Update financial-related settings (exchange rates, fees, payout limits).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Required Permissions:** `settings:update`

**Request Body:**
```json
{
  "exchangeRateUsdToNgn": 1520.00,
  "processingFee": 50.00,
  "processingFeeType": "fixed",
  "processingFeePercentage": null,
  "minPayout": 1000.00,
  "maxPayout": 1000000.00,
  "dailyPayoutLimit": 50000.00,
  "monthlyPayoutLimit": 500000.00
}
```

**Validation Rules:**
- `exchangeRateUsdToNgn`: Optional, number, min: 0
- `processingFee`: Optional, number, min: 0
- `processingFeeType`: Optional, enum: `"fixed"` or `"percentage"`
- `processingFeePercentage`: Optional, number, min: 0, max: 100
- `minPayout`: Optional, number, min: 0
- `maxPayout`: Optional, number, min: 0, must be > minPayout
- `dailyPayoutLimit`: Optional, number, min: 0
- `monthlyPayoutLimit`: Optional, number, min: 0

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Financial settings updated successfully",
  "data": {
    "exchangeRateUsdToNgn": 1520.00,
    "exchangeRateLastUpdated": "2025-12-09T10:30:00.000Z",
    "processingFee": 50.00,
    "processingFeeType": "fixed",
    "processingFeePercentage": null,
    "minPayout": 1000.00,
    "maxPayout": 1000000.00,
    "dailyPayoutLimit": 50000.00,
    "monthlyPayoutLimit": 500000.00
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Maximum payout must be greater than minimum payout"
}
```

---

### 4. Update Operations Settings

**Endpoint:** `PATCH /api/admin/settings/operations`

**Description:** Update platform operations settings (maintenance mode, registrations, auto-approve, etc.).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Required Permissions:** `settings:update`

**Request Body:**
```json
{
  "maintenanceMode": false,
  "maintenanceMessage": "We are currently performing scheduled maintenance.",
  "allowNewRegistrations": true,
  "requireEmailVerification": true,
  "requireKyc": false,
  "autoApproveCredits": false,
  "autoApproveThreshold": 100.00,
  "autoVerifySupport": false
}
```

**Validation Rules:**
- `maintenanceMode`: Optional, boolean
- `maintenanceMessage`: Optional, string
- `allowNewRegistrations`: Optional, boolean
- `requireEmailVerification`: Optional, boolean
- `requireKyc`: Optional, boolean
- `autoApproveCredits`: Optional, boolean
- `autoApproveThreshold`: Optional, number, min: 0
- `autoVerifySupport`: Optional, boolean (for support/admin auto-verification)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Operations settings updated successfully",
  "data": {
    "maintenanceMode": false,
    "maintenanceMessage": "We are currently performing scheduled maintenance.",
    "allowNewRegistrations": true,
    "requireEmailVerification": true,
    "requireKyc": false,
    "autoApproveCredits": false,
    "autoApproveThreshold": 100.00,
    "autoVerifySupport": false
  }
}
```

---

### 5. Update Payment Settings

**Endpoint:** `PATCH /api/admin/settings/payment`

**Description:** Update payment and banking-related settings.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Required Permissions:** `settings:update`

**Request Body:**
```json
{
  "bankAccountRequired": true,
  "requireVerifiedBankAccount": true,
  "processingTime": "24-48 hours",
  "processingTimeBusinessDays": 2
}
```

**Validation Rules:**
- `bankAccountRequired`: Optional, boolean
- `requireVerifiedBankAccount`: Optional, boolean
- `processingTime`: Optional, string
- `processingTimeBusinessDays`: Optional, number, min: 0

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Payment settings updated successfully",
  "data": {
    "bankAccountRequired": true,
    "requireVerifiedBankAccount": true,
    "processingTime": "24-48 hours",
    "processingTimeBusinessDays": 2
  }
}
```

---

### 6. Update Business Rules Settings

**Endpoint:** `PATCH /api/admin/settings/business-rules`

**Description:** Update business rules and limits (cooldowns, max requests, etc.).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Required Permissions:** `settings:update`

**Request Body:**
```json
{
  "minCreditRequestAmount": 10.00,
  "maxCreditRequestAmount": 10000.00,
  "creditRequestCooldownHours": 24,
  "payoutRequestCooldownHours": 24,
  "maxActiveCreditRequests": 1,
  "maxActivePayoutRequests": 1
}
```

**Validation Rules:**
- `minCreditRequestAmount`: Optional, number, min: 0
- `maxCreditRequestAmount`: Optional, number, min: 0, must be > minCreditRequestAmount
- `creditRequestCooldownHours`: Optional, number, min: 0
- `payoutRequestCooldownHours`: Optional, number, min: 0
- `maxActiveCreditRequests`: Optional, number, min: 1
- `maxActivePayoutRequests`: Optional, number, min: 1

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Business rules settings updated successfully",
  "data": {
    "minCreditRequestAmount": 10.00,
    "maxCreditRequestAmount": 10000.00,
    "creditRequestCooldownHours": 24,
    "payoutRequestCooldownHours": 24,
    "maxActiveCreditRequests": 1,
    "maxActivePayoutRequests": 1
  }
}
```

---

### 7. Update Platform Information Settings

**Endpoint:** `PATCH /api/admin/settings/platform-info`

**Description:** Update platform information (name, support contact, legal links).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Required Permissions:** `settings:update`

**Request Body:**
```json
{
  "platformName": "BuyTikTokCoins",
  "supportEmail": "support@buytiktokcoins.com",
  "supportPhone": "+2348080957681",
  "termsOfServiceUrl": "https://buytiktokcoins.com/terms",
  "privacyPolicyUrl": "https://buytiktokcoins.com/privacy"
}
```

**Validation Rules:**
- `platformName`: Optional, string
- `supportEmail`: Optional, string
- `supportPhone`: Optional, string
- `termsOfServiceUrl`: Optional, valid URL
- `privacyPolicyUrl`: Optional, valid URL

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Platform information settings updated successfully",
  "data": {
    "platformName": "BuyTikTokCoins",
    "supportEmail": "support@buytiktokcoins.com",
    "supportPhone": "+2348080957681",
    "termsOfServiceUrl": "https://buytiktokcoins.com/terms",
    "privacyPolicyUrl": "https://buytiktokcoins.com/privacy"
  }
}
```

---

### 8. Update Extended Settings (JSONB)

**Endpoint:** `PATCH /api/admin/settings/extended`

**Description:** Update extended settings stored in JSONB (for future extensibility without migrations).

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Required Role:** `super_admin` (only super admins can update extended settings)

**Request Body:**
```json
{
  "featureFlag1": true,
  "customSetting": "value",
  "abTestConfig": {
    "variant": "A",
    "percentage": 50
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Extended settings updated successfully",
  "data": {
    "featureFlag1": true,
    "customSetting": "value",
    "abTestConfig": {
      "variant": "A",
      "percentage": 50
    }
  }
}
```

---

## Settings Categories Explained

### Financial Settings
Controls all financial aspects:
- Exchange rates (USD to NGN)
- Processing fees (fixed or percentage)
- Payout limits (min, max, daily, monthly)

### Operations Settings
Controls platform operations:
- Maintenance mode and messages
- User registration controls
- Email verification requirements
- KYC requirements
- Auto-approve credits (with threshold)
- Auto verify support (for support/admin operations)

### Payment Settings
Controls payment and banking:
- Bank account requirements
- Processing time settings

### Business Rules Settings
Controls business logic:
- Credit/payout request limits
- Cooldown periods
- Max active requests per user

### Platform Information Settings
Platform metadata:
- Platform name
- Support contact information
- Legal document URLs

### Extended Settings (JSONB)
Flexible storage for future settings without database migrations.

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message",
  "errors": [
    {
      "field": "maxPayout",
      "message": "Maximum payout must be greater than minimum payout"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

---

## Notes

1. **Type Safety**: All settings are strongly typed with TypeScript interfaces
2. **Validation**: All updates are validated with class-validator
3. **Audit Trail**: All updates track `updatedBy` and `updatedAt`
4. **Default Values**: All settings have sensible defaults
5. **Singleton Pattern**: Only one settings record exists (auto-created if missing)
6. **Permissions**: Regular admins can view/update, super admins can also update extended settings

---

## Integration with Other Modules

The Settings service is used by:
- **Payouts Module**: Uses exchange rate and processing fee settings
- **Credit Requests Module**: Can use auto-approve settings
- **Auth Module**: Can check maintenance mode and registration settings

Example usage in services:
```typescript
// Get exchange rate
const financial = await this.settingsService.getSettingsByCategory('financial');
const exchangeRate = financial.exchangeRateUsdToNgn;

// Check maintenance mode
const operations = await this.settingsService.getSettingsByCategory('operations');
if (operations.maintenanceMode) {
  throw new ServiceUnavailableException(operations.maintenanceMessage);
}
```

