# Balance System Summary

## Quick Reference

### Two Balances

| Balance | Purpose | Sources | Usage |
|---------|---------|---------|-------|
| **Earnings** | TikTok earnings & platform credits | Credit requests, Widget deposits | Payouts, Transfers to wallet |
| **Wallet** | Spending money | Paystack payments, Transfers | Card funding, Airtime, Subscriptions |

### Key Rules

1. ✅ **Credit requests** → Always go to **earnings**
2. ✅ **Paystack payments** → Always go to **wallet**
3. ✅ **Widget deposits** → Always go to **earnings**
4. ✅ **Payouts** → Always deduct from **earnings**
5. ✅ **Card funding** → Always deducts from **wallet**

## Documentation Files

### For Everyone
- **DUAL_BALANCE_SYSTEM_GUIDE.md** - Complete system overview
- **BALANCE_SYSTEM_SUMMARY.md** - This file (quick reference)

### For Admins
- **ADMIN_BALANCE_SYSTEM_GUIDE.md** - Admin-specific guide

### For Developers
- **PAYSTACK_PAYMENT_INTEGRATION.md** - Backend integration guide
- **FRONTEND_PAYMENT_INTEGRATION.md** - Frontend integration guide

### For Future Planning
- **FUTURE_VIRTUAL_ACCOUNTS.md** - Virtual accounts roadmap

## What Changed

### Before
- Single `balance` field
- All credits/debits used same balance

### After
- `earnings` field (renamed from `balance`)
- `wallet` field (NEW)
- Separate balances for different purposes

## Migration Impact

### Existing Functionality
- ✅ Credit requests → Still work, now go to `earnings`
- ✅ Widget deposits → Still work, now go to `earnings`
- ✅ Payouts → Still work, now deduct from `earnings`

### New Functionality
- ✅ Paystack payments → NEW, go to `wallet`
- ✅ Transfer earnings to wallet → NEW
- ✅ Card funding from wallet → NEW

## Future Plans

### Virtual Accounts (Planned)
- Permanent virtual account numbers
- Automatic wallet funding
- Direct debit support
- See `FUTURE_VIRTUAL_ACCOUNTS.md` for details

## Support

For questions:
- Admins: See `ADMIN_BALANCE_SYSTEM_GUIDE.md`
- Developers: See integration guides
- General: See `DUAL_BALANCE_SYSTEM_GUIDE.md`
