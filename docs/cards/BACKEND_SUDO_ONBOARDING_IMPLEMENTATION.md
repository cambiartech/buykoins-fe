# Backend Sudo Customer Onboarding Implementation Guide

## Overview

This guide details the backend changes needed to support the Sudo customer onboarding flow. The frontend collects user information (DOB, billing address, identity verification) before creating a Sudo customer, which is required for card creation.

**Status**: Frontend is complete and ready. Backend implementation needed.

**Reference**: Sudo API Documentation - https://docs.sudo.africa/reference/create-customer

## Table of Contents

1. [Database Schema Changes](#database-schema-changes)
2. [API Endpoints](#api-endpoints)
3. [Service Layer Updates](#service-layer-updates)
4. [DTOs and Validation](#dtos-and-validation)
5. [Integration with Sudo API](#integration-with-sudo-api)
6. [Error Handling](#error-handling)
7. [Testing](#testing)

---

## Database Schema Changes

### 1. Add Field to Users Table

**Migration File**: `database/migrations/add-sudo-onboarding-data-to-users.sql`

```sql
-- Add sudoCustomerOnboardingData JSON field to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS "sudoCustomerOnboardingData" JSONB DEFAULT NULL;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_sudo_customer_onboarding 
ON users USING GIN ("sudoCustomerOnboardingData");

-- Add comment
COMMENT ON COLUMN users."sudoCustomerOnboardingData" IS 'Stores Sudo customer onboarding progress: dob, billingAddress, identity, onboardingStep, onboardingCompleted';
```

**Or if using TypeORM/Sequelize migration:**

```typescript
// TypeORM example
export class AddSudoOnboardingDataToUsers1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('users', new TableColumn({
      name: 'sudoCustomerOnboardingData',
      type: 'jsonb',
      isNullable: true,
      default: null,
    }));

    await queryRunner.createIndex('users', new TableIndex({
      name: 'idx_users_sudo_customer_onboarding',
      columnNames: ['sudoCustomerOnboardingData'],
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('users', 'idx_users_sudo_customer_onboarding');
    await queryRunner.dropColumn('users', 'sudoCustomerOnboardingData');
  }
}
```

### 2. Update User Entity/Model

**File**: `src/users/entities/user.entity.ts` (or similar)

```typescript
import { Column, Entity, ... } from 'typeorm';

@Entity('users')
export class User {
  // ... existing fields ...

  @Column({ type: 'jsonb', nullable: true, default: null })
  sudoCustomerOnboardingData?: {
    dob?: string; // ISO date string
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
    onboardingStep?: string; // 'welcome' | 'personal-info' | 'billing-address' | 'identity' | 'review'
    onboardingCompleted?: boolean;
  };

  // ... rest of fields ...
}
```

---

## API Endpoints

### 1. Save Onboarding Step

**Endpoint**: `POST /api/cards/onboarding/save-step`

**Controller**: `src/cards/cards.controller.ts`

```typescript
@Post('onboarding/save-step')
@UseGuards(JwtAuthGuard)
async saveOnboardingStep(
  @Request() req,
  @Body() saveStepDto: SaveOnboardingStepDto,
) {
  return this.cardsService.saveOnboardingStep(req.user.id, saveStepDto);
}
```

**DTO**: `src/cards/dto/save-onboarding-step.dto.ts`

```typescript
import { IsString, IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SaveOnboardingStepDto {
  @IsString()
  step: 'personal-info' | 'billing-address' | 'identity';

  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  data: {
    // For personal-info step
    dob?: string;
    
    // For billing-address step
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    
    // For identity step
    identityType?: 'BVN' | 'NIN';
    identityNumber?: string;
  };
}
```

**Service Method**: `src/cards/cards.service.ts`

```typescript
async saveOnboardingStep(userId: string, dto: SaveOnboardingStepDto) {
  const user = await this.usersService.findById(userId);
  if (!user) {
    throw new NotFoundException('User not found');
  }

  // Get existing onboarding data or initialize
  const existingData = user.sudoCustomerOnboardingData || {};
  
  // Update based on step
  let updatedData: any = { ...existingData };
  
  switch (dto.step) {
    case 'personal-info':
      updatedData.dob = dto.data.dob;
      updatedData.onboardingStep = 'personal-info';
      break;
    
    case 'billing-address':
      updatedData.billingAddress = {
        line1: dto.data.line1,
        line2: dto.data.line2,
        city: dto.data.city,
        state: dto.data.state,
        postalCode: dto.data.postalCode,
        country: dto.data.country || 'NG',
      };
      updatedData.onboardingStep = 'billing-address';
      break;
    
    case 'identity':
      updatedData.identity = {
        identityType: dto.data.identityType,
        identityNumber: dto.data.identityNumber,
      };
      updatedData.onboardingStep = 'identity';
      break;
  }

  // Save to user
  await this.usersService.update(userId, {
    sudoCustomerOnboardingData: updatedData,
  });

  return {
    success: true,
    message: 'Step saved successfully',
    data: {
      currentStep: updatedData.onboardingStep,
      onboardingData: updatedData,
    },
  };
}
```

### 2. Get Onboarding Status

**Endpoint**: `GET /api/cards/onboarding/status`

**Controller**:

```typescript
@Get('onboarding/status')
@UseGuards(JwtAuthGuard)
async getOnboardingStatus(@Request() req) {
  return this.cardsService.getOnboardingStatus(req.user.id);
}
```

**Service Method**:

```typescript
async getOnboardingStatus(userId: string) {
  const user = await this.usersService.findById(userId);
  if (!user) {
    throw new NotFoundException('User not found');
  }

  const onboardingData = user.sudoCustomerOnboardingData || {};
  const hasSudoCustomer = !!user.sudoCustomerId;

  return {
    success: true,
    data: {
      hasSudoCustomer,
      sudoCustomerId: user.sudoCustomerId || null,
      onboardingCompleted: onboardingData.onboardingCompleted || false,
      currentStep: onboardingData.onboardingStep || 'welcome',
      onboardingData: onboardingData,
    },
  };
}
```

### 3. Complete Onboarding

**Endpoint**: `POST /api/cards/onboarding/complete`

**Controller**:

```typescript
@Post('onboarding/complete')
@UseGuards(JwtAuthGuard)
async completeOnboarding(@Request() req) {
  return this.cardsService.completeOnboarding(req.user.id);
}
```

**Service Method**:

```typescript
async completeOnboarding(userId: string) {
  const user = await this.usersService.findById(userId);
  if (!user) {
    throw new NotFoundException('User not found');
  }

  // Check if already has Sudo customer
  if (user.sudoCustomerId) {
    return {
      success: true,
      message: 'Sudo customer already exists',
      data: {
        sudoCustomerId: user.sudoCustomerId,
      },
    };
  }

  const onboardingData = user.sudoCustomerOnboardingData || {};

  // Validate all required fields
  if (!onboardingData.dob) {
    throw new BadRequestException('Date of birth is required');
  }

  if (!onboardingData.billingAddress?.line1 || 
      !onboardingData.billingAddress?.city ||
      !onboardingData.billingAddress?.state ||
      !onboardingData.billingAddress?.postalCode) {
    throw new BadRequestException('Complete billing address is required');
  }

  if (!onboardingData.identity?.identityType || 
      !onboardingData.identity?.identityNumber) {
    throw new BadRequestException('Identity verification is required');
  }

  // Validate identity number format (11 digits)
  if (!/^\d{11}$/.test(onboardingData.identity.identityNumber)) {
    throw new BadRequestException('Identity number must be 11 digits');
  }

  // Validate DOB (must be 18+)
  const dob = new Date(onboardingData.dob);
  const today = new Date();
  const age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()) 
    ? age - 1 
    : age;
  
  if (actualAge < 18) {
    throw new BadRequestException('You must be at least 18 years old');
  }

  try {
    // Create Sudo customer
    const sudoCustomer = await this.sudoApiService.createCustomer({
      type: 'individual',
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      phoneNumber: user.phone || '',
      status: 'active',
      emailAddress: user.email,
      billingAddress: {
        line1: onboardingData.billingAddress.line1,
        line2: onboardingData.billingAddress.line2 || '',
        city: onboardingData.billingAddress.city,
        state: onboardingData.billingAddress.state,
        postalCode: onboardingData.billingAddress.postalCode,
        country: onboardingData.billingAddress.country || 'NG',
      },
      individual: {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        dob: onboardingData.dob, // Format: YYYY-MM-DD
        identity: {
          type: onboardingData.identity.identityType,
          number: onboardingData.identity.identityNumber,
        },
      },
    });

    // Save Sudo customer ID to user
    await this.usersService.update(userId, {
      sudoCustomerId: sudoCustomer.id,
      sudoCustomerOnboardingData: {
        ...onboardingData,
        onboardingCompleted: true,
        onboardingStep: 'completed',
      },
    });

    // Create or update SudoCustomer record in database
    await this.sudoCustomersService.createOrUpdate({
      userId: userId,
      sudoCustomerId: sudoCustomer.id,
      status: 'active',
    });

    return {
      success: true,
      message: 'Onboarding completed successfully',
      data: {
        sudoCustomerId: sudoCustomer.id,
      },
    };
  } catch (error) {
    // Handle Sudo API errors
    if (error.response) {
      const errorMessage = error.response.data?.message || 'Failed to create Sudo customer';
      throw new BadRequestException(errorMessage);
    }
    throw new InternalServerErrorException('Failed to complete onboarding');
  }
}
```

---

## Service Layer Updates

### 1. Update Card Creation Flow

**File**: `src/cards/cards.service.ts`

Update the `createCardForUser` method:

```typescript
async createCardForUser(userId: string, cardData: CreateCardDto) {
  const user = await this.usersService.findById(userId);
  if (!user) {
    throw new NotFoundException('User not found');
  }

  // Check if user has Sudo customer ID
  if (!user.sudoCustomerId) {
    // Check if onboarding is completed
    const onboardingData = user.sudoCustomerOnboardingData || {};
    
    if (!onboardingData.onboardingCompleted) {
      throw new BadRequestException({
        message: 'Please complete your profile setup before creating a card',
        onboardingRequired: true,
      });
    }

    // Onboarding completed but customer not created - try to create now
    try {
      await this.completeOnboarding(userId);
      // Refresh user to get updated sudoCustomerId
      const updatedUser = await this.usersService.findById(userId);
      if (!updatedUser.sudoCustomerId) {
        throw new BadRequestException('Failed to create Sudo customer. Please try again.');
      }
    } catch (error) {
      throw new BadRequestException({
        message: error.message || 'Failed to create Sudo customer',
        onboardingRequired: true,
      });
    }
  }

  // Get or create Sudo customer record
  let sudoCustomer = await this.sudoCustomersService.findByUserId(userId);
  
  if (!sudoCustomer) {
    // Create SudoCustomer record if it doesn't exist
    sudoCustomer = await this.sudoCustomersService.create({
      userId: userId,
      sudoCustomerId: user.sudoCustomerId,
      status: 'active',
    });
  }

  // Proceed with card creation using existing logic
  // ... rest of card creation code ...
}
```

### 2. Sudo API Service Method

**File**: `src/cards/sudo/sudo-api.service.ts`

Ensure you have a `createCustomer` method:

```typescript
async createCustomer(customerData: {
  type: 'individual' | 'company';
  name: string;
  phoneNumber: string;
  status: 'active' | 'inactive';
  emailAddress?: string;
  billingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  individual?: {
    firstName: string;
    lastName: string;
    dob: string; // YYYY-MM-DD format
    identity: {
      type: 'BVN' | 'NIN';
      number: string;
    };
  };
}): Promise<any> {
  const url = `${this.apiBaseUrl}/customers`;
  
  const payload = {
    type: customerData.type,
    name: customerData.name,
    phoneNumber: customerData.phoneNumber,
    status: customerData.status,
    billingAddress: customerData.billingAddress,
    ...(customerData.emailAddress && { emailAddress: customerData.emailAddress }),
    ...(customerData.individual && { individual: customerData.individual }),
  };

  try {
    const response = await this.httpService.axiosRef.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data?.message || 'Failed to create customer';
      throw new Error(errorMessage);
    }
    throw error;
  }
}
```

---

## DTOs and Validation

### Create DTOs File

**File**: `src/cards/dto/save-onboarding-step.dto.ts`

```typescript
import { IsString, IsObject, IsOptional, IsIn, Matches, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PersonalInfoData {
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date of birth must be in YYYY-MM-DD format' })
  dob?: string;
}

class BillingAddressData {
  @IsString()
  line1?: string;

  @IsOptional()
  @IsString()
  line2?: string;

  @IsString()
  city?: string;

  @IsString()
  state?: string;

  @IsString()
  @Matches(/^\d{6}$/, { message: 'Postal code must be 6 digits' })
  postalCode?: string;

  @IsOptional()
  @IsString()
  country?: string;
}

class IdentityData {
  @IsIn(['BVN', 'NIN'])
  identityType?: 'BVN' | 'NIN';

  @IsString()
  @Matches(/^\d{11}$/, { message: 'Identity number must be 11 digits' })
  identityNumber?: string;
}

export class SaveOnboardingStepDto {
  @IsString()
  @IsIn(['personal-info', 'billing-address', 'identity'])
  step: 'personal-info' | 'billing-address' | 'identity';

  @IsObject()
  data: PersonalInfoData | BillingAddressData | IdentityData;
}
```

---

## Error Handling

### Custom Exception for Onboarding

**File**: `src/common/exceptions/onboarding-required.exception.ts`

```typescript
import { BadRequestException } from '@nestjs/common';

export class OnboardingRequiredException extends BadRequestException {
  constructor(message = 'Please complete your profile setup before creating a card') {
    super({
      message,
      onboardingRequired: true,
    });
  }
}
```

### Update Error Responses

Ensure error responses include the `onboardingRequired` flag when appropriate:

```typescript
catch (error) {
  if (error instanceof OnboardingRequiredException) {
    throw error;
  }
  
  if (error.message?.includes('onboarding') || 
      error.message?.includes('Sudo customer')) {
    throw new OnboardingRequiredException(error.message);
  }
  
  throw error;
}
```

---

## Integration Points

### 1. User Service Update

**File**: `src/users/users.service.ts`

Ensure the `update` method handles JSON fields:

```typescript
async update(userId: string, updateData: Partial<User>) {
  // Handle JSON fields properly
  if (updateData.sudoCustomerOnboardingData) {
    // Ensure it's properly serialized
    updateData.sudoCustomerOnboardingData = updateData.sudoCustomerOnboardingData as any;
  }
  
  await this.userRepository.update(userId, updateData);
  return this.findById(userId);
}
```

### 2. Sudo Customers Service

**File**: `src/cards/sudo-customers.service.ts`

Ensure you have methods to manage SudoCustomer records:

```typescript
async createOrUpdate(data: {
  userId: string;
  sudoCustomerId: string;
  status: string;
}) {
  const existing = await this.sudoCustomerRepository.findOne({
    where: { userId: data.userId },
  });

  if (existing) {
    existing.sudoCustomerId = data.sudoCustomerId;
    existing.status = data.status;
    return this.sudoCustomerRepository.save(existing);
  }

  return this.sudoCustomerRepository.save({
    userId: data.userId,
    sudoCustomerId: data.sudoCustomerId,
    status: data.status,
  });
}

async findByUserId(userId: string) {
  return this.sudoCustomerRepository.findOne({
    where: { userId },
  });
}
```

---

## Response Format Examples

### Save Step Response

```json
{
  "success": true,
  "message": "Step saved successfully",
  "data": {
    "currentStep": "billing-address",
    "onboardingData": {
      "dob": "1990-01-15",
      "billingAddress": {
        "line1": "123 Main Street",
        "city": "Lagos",
        "state": "Lagos",
        "postalCode": "100001",
        "country": "NG"
      },
      "onboardingStep": "billing-address"
    }
  }
}
```

### Get Status Response

```json
{
  "success": true,
  "data": {
    "hasSudoCustomer": false,
    "sudoCustomerId": null,
    "onboardingCompleted": false,
    "currentStep": "identity",
    "onboardingData": {
      "dob": "1990-01-15",
      "billingAddress": { ... },
      "identity": {
        "identityType": "BVN",
        "identityNumber": "12345678901"
      },
      "onboardingStep": "identity"
    }
  }
}
```

### Complete Onboarding Response

```json
{
  "success": true,
  "message": "Onboarding completed successfully",
  "data": {
    "sudoCustomerId": "cus_abc123xyz"
  }
}
```

### Error Response (Onboarding Required)

```json
{
  "success": false,
  "message": "Please complete your profile setup before creating a card",
  "onboardingRequired": true
}
```

---

## Testing Checklist

### Unit Tests

- [ ] `saveOnboardingStep` saves data correctly for each step
- [ ] `getOnboardingStatus` returns correct status
- [ ] `completeOnboarding` validates all required fields
- [ ] `completeOnboarding` creates Sudo customer via API
- [ ] `completeOnboarding` saves `sudoCustomerId` to user
- [ ] `createCardForUser` checks for Sudo customer
- [ ] `createCardForUser` triggers onboarding if needed

### Integration Tests

- [ ] Save step endpoint works correctly
- [ ] Get status endpoint returns saved data
- [ ] Complete onboarding creates Sudo customer
- [ ] Card creation works after onboarding
- [ ] Error handling works correctly

### Edge Cases

- [ ] User with partial onboarding data
- [ ] User with completed onboarding but no customer ID
- [ ] Sudo API failure during customer creation
- [ ] Invalid identity number format
- [ ] Underage user (less than 18)
- [ ] Missing required fields

---

## Environment Variables

Ensure these are set:

```env
SUDO_API_KEY=your_sudo_api_key
SUDO_API_BASE_URL=https://api.sandbox.sudo.cards  # or production URL
SUDO_ENVIRONMENT=sandbox  # or production
```

---

## Summary

The backend needs to:

1. **Database**: Add `sudoCustomerOnboardingData` JSON field to users table
2. **Endpoints**: Implement 3 new endpoints for onboarding flow
3. **Service**: Add methods to save steps, get status, and complete onboarding
4. **Validation**: Validate all required fields before creating Sudo customer
5. **Integration**: Call Sudo API to create customer with collected data
6. **Card Creation**: Update to check for Sudo customer before creating card

The frontend is already implemented and ready to work once these backend changes are in place.

