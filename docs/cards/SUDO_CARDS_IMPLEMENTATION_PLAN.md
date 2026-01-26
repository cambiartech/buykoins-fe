# Sudo Africa Cards Integration - Implementation Plan

## Overview
Integration of Sudo Africa's card API to enable virtual card issuance for users to purchase digital services (TikTok coins, Netflix, Spotify, etc.).

## Architecture

### 1. Configuration
- **File**: `src/config/sudo.config.ts`
- **Environment Variables**:
  - `SUDO_API_KEY` - OAuth 2.0 Bearer Token
  - `SUDO_API_BASE_URL` - API base URL (sandbox or production)
  - `SUDO_ENVIRONMENT` - 'sandbox' or 'production'
  - `SUDO_VAULT_ID` - Vault ID for card tokenization
  - `SUDO_DEFAULT_CURRENCY` - Default currency (e.g., 'NGN', 'USD')
  - `SUDO_DEFAULT_FUNDING_SOURCE_ID` - Default funding source ID

### 2. Database Schema

#### `sudo_customers` Table
- Links our users to Sudo customers
- Fields: `id`, `user_id` (FK), `sudo_customer_id`, `status`, `created_at`, `updated_at`

#### `cards` Table
- Stores virtual cards issued to users
- Fields: `id`, `user_id` (FK), `sudo_customer_id`, `sudo_card_id`, `card_number` (masked), `card_type`, `currency`, `status`, `balance`, `expiry_date`, `is_default`, `metadata`, `created_at`, `updated_at`

#### `card_transactions` Table
- Tracks card usage and transactions
- Fields: `id`, `card_id` (FK), `user_id` (FK), `sudo_transaction_id`, `type`, `amount`, `currency`, `merchant_name`, `description`, `status`, `reference`, `metadata`, `created_at`, `updated_at`

#### `funding_sources` Table
- Stores funding source information
- Fields: `id`, `sudo_funding_source_id`, `type`, `currency`, `status`, `metadata`, `created_at`, `updated_at`

### 3. Service Layer

#### `SudoApiService` (`src/cards/sudo/sudo-api.service.ts`)
- Handles all HTTP requests to Sudo Africa API
- Methods:
  - `createCustomer(userData)` - Create customer in Sudo
  - `getCustomer(sudoCustomerId)` - Get customer details
  - `updateCustomer(sudoCustomerId, data)` - Update customer
  - `createCard(customerId, cardData)` - Create virtual card
  - `getCard(sudoCardId)` - Get card details
  - `updateCard(sudoCardId, data)` - Update card (freeze/unfreeze)
  - `getCardTransactions(sudoCardId, filters)` - Get card transactions
  - `createAccount(accountData)` - Create settlement account
  - `getAccountBalance(accountId)` - Get account balance
  - `createFundingSource(data)` - Create funding source
  - `fundTransfer(data)` - Transfer funds to card
  - `digitalizeCard(sudoCardId)` - Digitalize card for mobile wallets

#### `CardsService` (`src/cards/cards.service.ts`)
- Business logic for card management
- Methods:
  - `createCardForUser(userId, cardData)` - Create card for user
  - `getUserCards(userId)` - Get all user cards
  - `getCardById(cardId, userId)` - Get specific card
  - `freezeCard(cardId, userId)` - Freeze card
  - `unfreezeCard(cardId, userId)` - Unfreeze card
  - `fundCardFromWallet(cardId, userId, amount)` - Fund card from user wallet
  - `getCardTransactions(cardId, userId, filters)` - Get card transactions
  - `setDefaultCard(cardId, userId)` - Set default card
  - `deleteCard(cardId, userId)` - Delete/deactivate card

### 4. Controller Layer

#### `CardsController` (`src/cards/cards.controller.ts`)
**User Endpoints:**
- `POST /api/cards` - Create virtual card
- `GET /api/cards` - Get user's cards
- `GET /api/cards/:id` - Get card details
- `PATCH /api/cards/:id` - Update card (freeze/unfreeze, set default)
- `POST /api/cards/:id/fund` - Fund card from wallet
- `GET /api/cards/:id/transactions` - Get card transactions
- `DELETE /api/cards/:id` - Delete/deactivate card

**Admin Endpoints:**
- `GET /api/admin/cards` - Get all cards (with filters)
- `GET /api/admin/cards/:id` - Get card details (admin view)
- `GET /api/admin/cards/:id/transactions` - Get card transactions (admin view)
- `POST /api/admin/cards/:id/freeze` - Freeze card (admin)
- `POST /api/admin/cards/:id/unfreeze` - Unfreeze card (admin)

### 5. Integration Points

#### Wallet Integration
- When user funds card from wallet, deduct from `users.balance`
- Create transaction record in `transactions` table
- Link card funding to transaction system

#### Transaction System
- Card transactions should be tracked in both `card_transactions` and `transactions` tables
- Add new `TransactionType`: `CARD_PURCHASE`, `CARD_FUNDING`
- Link card transactions to user's transaction history

### 6. Key Features

1. **Virtual Card Creation**
   - User requests card creation
   - System creates Sudo customer if not exists
   - Creates virtual card via Sudo API
   - Stores card details in database
   - Returns card info (masked PAN, expiry, CVV)

2. **Card Funding**
   - User can fund card from wallet balance
   - System transfers funds via Sudo API
   - Updates card balance
   - Creates transaction record

3. **Card Management**
   - Freeze/unfreeze cards
   - Set default card
   - View card transactions
   - Delete/deactivate cards

4. **Transaction Tracking**
   - Track all card usage
   - Link to merchant information
   - Support filtering and pagination

### 7. Error Handling

- Handle Sudo API errors gracefully
- Retry logic for transient failures
- Proper error messages for users
- Logging for debugging

### 8. Security

- Store sensitive card data securely (masked PAN only)
- Never expose full card numbers
- Use Sudo's tokenization for card operations
- Validate user ownership before card operations

### 9. Testing Strategy

- Test with Sudo sandbox environment first
- Test card creation, funding, transactions
- Test error scenarios
- Test admin operations

## Implementation Order

1. ✅ Configuration setup
2. Install axios
3. Create Sudo API service
4. Create database entities
5. Create database migration
6. Create DTOs
7. Create cards service
8. Create cards controller
9. Add admin endpoints
10. Integrate with wallet/transaction system
11. Add platform settings
12. Testing

## API Endpoints Summary

### User Endpoints
- `POST /api/cards` - Create card
- `GET /api/cards` - List cards
- `GET /api/cards/:id` - Get card
- `PATCH /api/cards/:id` - Update card
- `POST /api/cards/:id/fund` - Fund card
- `GET /api/cards/:id/transactions` - Get transactions
- `DELETE /api/cards/:id` - Delete card

### Admin Endpoints
- `GET /api/admin/cards` - List all cards
- `GET /api/admin/cards/:id` - Get card (admin)
- `GET /api/admin/cards/:id/transactions` - Get transactions (admin)
- `POST /api/admin/cards/:id/freeze` - Freeze card
- `POST /api/admin/cards/:id/unfreeze` - Unfreeze card

