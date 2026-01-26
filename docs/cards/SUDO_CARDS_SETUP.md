# Sudo Africa Cards Integration - Setup Guide

## Overview
This integration enables virtual card issuance for users to purchase digital services (TikTok coins, Netflix, Spotify, etc.) using Sudo Africa's card API.

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# Sudo Africa API Configuration
SUDO_API_KEY=your_sudo_api_key_here
SUDO_ENVIRONMENT=sandbox  # or 'production'
SUDO_API_BASE_URL=https://api.sandbox.sudo.cards  # or https://api.sudo.africa for production
SUDO_VAULT_ID=we0dsa28s  # Sandbox vault ID (or production vault ID)
SUDO_DEFAULT_CURRENCY=NGN
SUDO_DEFAULT_FUNDING_SOURCE_ID=your_funding_source_id
SUDO_DEFAULT_SETTLEMENT_ACCOUNT_ID=your_settlement_account_id
```

### Getting Your API Key

1. **Sandbox Environment:**
   - Go to https://app.sandbox.sudo.cards
   - Sign up or log in
   - Navigate to Developers page
   - Create an API key

2. **Production Environment:**
   - Go to https://app.sudo.africa
   - Complete production setup
   - Create an API key from Developers page

## Database Migration

Run the database migration to create the necessary tables:

```bash
psql -U postgres -d buytiktokcoins -f database/migrations/add-sudo-cards-tables.sql
```

Or if using a different database:

```bash
psql -U your_username -d your_database -f database/migrations/add-sudo-cards-tables.sql
```

## Initial Setup Steps

### 1. Create Settlement Account

Before issuing cards, you need to create a settlement account in Sudo:

```bash
# This can be done via Sudo Dashboard or API
# Dashboard: https://app.sandbox.sudo.cards/accounts
# Or use the API endpoint: POST /accounts
```

Set the account ID in `SUDO_DEFAULT_SETTLEMENT_ACCOUNT_ID`.

### 2. Create Funding Source

Create a default funding source:

```bash
# Dashboard: https://app.sandbox.sudo.cards/settings/funding-sources
# Or use the API endpoint: POST /funding-sources
```

Set the funding source ID in `SUDO_DEFAULT_FUNDING_SOURCE_ID`.

### 3. Test Card Creation

Use the sandbox environment to test card creation:

```bash
# Create a test card via API
POST /api/cards
Authorization: Bearer <user_jwt_token>
{
  "currency": "NGN"
}
```

## API Endpoints

### User Endpoints

- `POST /api/cards` - Create a new virtual card
- `GET /api/cards` - Get all user cards
- `GET /api/cards/:id` - Get card details
- `PATCH /api/cards/:id` - Update card (freeze/unfreeze, set default)
- `POST /api/cards/:id/fund` - Fund card from wallet
- `GET /api/cards/:id/transactions` - Get card transactions
- `POST /api/cards/:id/set-default` - Set card as default
- `DELETE /api/cards/:id` - Delete/deactivate card

### Admin Endpoints

- `GET /api/admin/cards` - Get all cards (with filters)
- `GET /api/admin/cards/:id` - Get card details (admin view)
- `GET /api/admin/cards/:id/transactions` - Get card transactions (admin view)
- `POST /api/admin/cards/:id/freeze` - Freeze card (admin)
- `POST /api/admin/cards/:id/unfreeze` - Unfreeze card (admin)

## Usage Examples

### Create a Card

```bash
curl -X POST https://your-api.com/api/cards \
  -H "Authorization: Bearer <user_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "currency": "NGN"
  }'
```

### Fund a Card from Wallet

```bash
curl -X POST https://your-api.com/api/cards/<card_id>/fund \
  -H "Authorization: Bearer <user_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000.00
  }'
```

### Get Card Transactions

```bash
curl -X GET "https://your-api.com/api/cards/<card_id>/transactions?page=0&limit=25" \
  -H "Authorization: Bearer <user_jwt_token>"
```

## Webhook Integration (Future)

To receive real-time transaction updates from Sudo, you'll need to:

1. Set up a webhook endpoint in your application
2. Configure the webhook URL in Sudo Dashboard
3. Handle incoming webhook events to sync card transactions

Example webhook endpoint structure:

```typescript
POST /api/webhooks/sudo
// Handle transaction events, authorization events, etc.
```

## Testing

### Sandbox Testing

1. Use the sandbox environment for development
2. Generate test cards using the simulator
3. Test card funding and transactions
4. Verify wallet integration

### Production Checklist

- [ ] API key configured
- [ ] Settlement account created
- [ ] Funding source configured
- [ ] Database migration run
- [ ] Environment variables set
- [ ] Webhook endpoint configured (if applicable)
- [ ] Error handling tested
- [ ] Card creation tested
- [ ] Card funding tested
- [ ] Transaction sync tested

## Troubleshooting

### Common Issues

1. **"Settlement account not configured"**
   - Ensure `SUDO_DEFAULT_SETTLEMENT_ACCOUNT_ID` is set
   - Create a settlement account in Sudo Dashboard

2. **"Failed to create customer"**
   - Check API key is valid
   - Verify user has required fields (email, firstName, lastName)

3. **"Insufficient wallet balance"**
   - User needs sufficient balance before funding card
   - Check user's wallet balance

4. **"Card not found"**
   - Verify card ID is correct
   - Check if card belongs to the user
   - Ensure card hasn't been deleted

## Frontend Integration

**See `FRONTEND_CARDS_INTEGRATION.md` for complete frontend integration guide.**

The frontend team needs:
- API endpoint documentation
- Request/response examples
- User flow diagrams
- Error handling patterns
- UI/UX recommendations
- Code examples (React, Vue, etc.)

All of this is documented in `FRONTEND_CARDS_INTEGRATION.md`.

## Support

For Sudo API documentation:
- Sandbox: https://docs.sudo.africa
- Support: Contact Sudo support through their dashboard

For platform-specific issues:
- Check application logs
- Review error messages
- Contact development team

For frontend integration:
- See `FRONTEND_CARDS_INTEGRATION.md`
- Contact frontend team lead

