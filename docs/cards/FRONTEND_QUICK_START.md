# Frontend Cards Integration - Quick Start

## 🚀 Quick Reference

### Base URL
```
/api/cards
```

### Authentication
All requests require JWT token in header:
```
Authorization: Bearer <user_token>
```

---

## 📋 Essential Endpoints

### 1. Create Card
```javascript
POST /api/cards
Body: { "currency": "NGN" }
```

### 2. Get All Cards
```javascript
GET /api/cards
```

### 3. Fund Card
```javascript
POST /api/cards/:id/fund
Body: { "amount": 1000.00 }
```

### 4. Get Card Transactions
```javascript
GET /api/cards/:id/transactions?page=0&limit=25
```

### 5. Freeze/Unfreeze Card
```javascript
PATCH /api/cards/:id
Body: { "status": "frozen" } // or "active"
```

### 6. Set Default Card
```javascript
POST /api/cards/:id/set-default
```

### 7. Delete Card
```javascript
DELETE /api/cards/:id
```

---

## 💡 Key Features to Implement

1. **Card Creation Flow**
   - Button: "Create New Card"
   - Show loading state
   - Display new card with masked number

2. **Card List View**
   - Show all user cards
   - Display: Card number (masked), Balance, Status, Default badge
   - Quick actions: Fund, Freeze, Set Default

3. **Funding Flow**
   - Input amount
   - Validate against wallet balance
   - Show success/error messages
   - Update card balance immediately

4. **Transaction History**
   - List all transactions for a card
   - Show: Merchant, Amount, Status, Date
   - Pagination support

---

## ⚠️ Important Notes

- **Minimum funding amount**: 0.01
- **Card numbers are masked**: Show as `****1234`
- **Balance updates**: Refresh after funding
- **Error handling**: Always show user-friendly messages
- **Loading states**: Show during all API calls

---

## 📚 Full Documentation

See `FRONTEND_CARDS_INTEGRATION.md` for:
- Complete API reference
- Request/response examples
- Code examples (React, Vue)
- Error handling patterns
- UI/UX recommendations
- Testing checklist

---

## ✅ Pre-Launch Checklist

- [ ] Card creation works
- [ ] Funding from wallet works
- [ ] Transaction history displays
- [ ] Freeze/unfreeze works
- [ ] Error messages are user-friendly
- [ ] Loading states implemented
- [ ] Mobile responsive
- [ ] Tested end-to-end

---

**Ready to integrate! 🎉**

