# Testing Tools Index

Complete guide to mock order testing tools for DEKNA payment development.

---

## 📁 Files Overview

### 🔧 Executable Scripts

| File | Purpose | Usage |
|------|---------|-------|
| `seed_test_orders.py` | Create 10 pre-configured test orders | `python seed_test_orders.py <user-id>` |
| `check_orders.py` | View existing orders and payments | `python check_orders.py <user-id>` |
| `manage.py seed_mock_orders` | Create custom orders | `python manage.py seed_mock_orders --user-id <uuid> --count 5` |

### 📚 Documentation

| File | Content |
|------|---------|
| `TESTING_MOCK_ORDERS.md` | Complete testing guide with all details |
| `QUICK_REFERENCE.md` | Quick command reference card |
| `TESTING_SUMMARY.txt` | Plain text summary |
| `TESTING_INDEX.md` | This file - overview of all testing files |

### 📝 Examples

| File | Content |
|------|---------|
| `EXAMPLE_USAGE.sh` | Bash script examples (Linux/Mac) |
| `EXAMPLE_USAGE.bat` | Batch script examples (Windows) |

---

## 🚀 Quick Start

### 1. Get Your User ID

From Supabase dashboard:
- Go to Authentication → Users
- Copy the UUID

Or from browser console (if logged in):
```javascript
localStorage.getItem('supabase.auth.token')
```

### 2. Create Test Orders

```bash
cd backend
python seed_test_orders.py <your-user-id>
```

Creates:
- 5 Chapa orders: 50, 150, 250, 500, 1000 ETB
- 5 Telebirr orders: 75, 200, 350, 750, 1500 ETB

### 3. Verify Orders

```bash
python check_orders.py <your-user-id>
```

Shows:
- All orders with status
- Payment records
- Order details and metadata

### 4. Test Payments

- Open frontend
- Navigate to orders
- Initiate payment
- Complete flow
- Verify status updates

---

## 📖 Documentation Guide

### For Quick Reference
→ Read `QUICK_REFERENCE.md`

### For Complete Guide
→ Read `TESTING_MOCK_ORDERS.md`

### For Examples
→ See `EXAMPLE_USAGE.bat` (Windows) or `EXAMPLE_USAGE.sh` (Linux/Mac)

### For Summary
→ Read `TESTING_SUMMARY.txt`

---

## 🎯 Common Tasks

### Create Standard Test Orders
```bash
python seed_test_orders.py <user-id>
```

### Create Custom Amount Orders
```bash
python manage.py seed_mock_orders --user-id <uuid> --count 5 --amount 500.00
```

### Check Order Status
```bash
python check_orders.py <user-id>
```

### Create Orders for Multiple Users
```bash
python manage.py seed_mock_orders \
  --user-id <uuid1> \
  --user-id <uuid2> \
  --count 3
```

### Create Orders with Metadata
```bash
python manage.py seed_mock_orders \
  --user-id <uuid> \
  --count 2 \
  --metadata '{"test": "value"}'
```

---

## 🔍 What Each Script Does

### `seed_test_orders.py`
- Creates 10 orders automatically
- 5 for Chapa (50-1000 ETB)
- 5 for Telebirr (75-1500 ETB)
- Each labeled (Small, Medium, Standard, Large, Premium)
- All marked as mock orders
- All start in "created" status

### `check_orders.py`
- Lists all orders for a user
- Groups by status
- Shows order details
- Displays payment records
- Provides summary statistics

### `manage.py seed_mock_orders`
- Django management command
- Flexible custom order creation
- Supports multiple users
- Custom amounts and metadata
- Configurable count

---

## ⚙️ Configuration

Required in `backend/.env`:

```bash
# Required for all scripts
DJANGO_ENV=development
SUPABASE_SERVICE_ROLE_KEY=your-key
SUPABASE_URL=your-url

# For Telebirr mock mode
C2B_MOCK_ENABLED=true

# Payment provider keys
CHAPA_SECRET_KEY=CHASECK_TEST-...
C2B_MERCHANT_APP_ID=...
```

---

## 🧹 Cleanup

### Remove All Mock Orders for User
```sql
DELETE FROM orders WHERE user_id = '<user-id>' AND is_mock = true;
```

### Remove All Mock Orders (Careful!)
```sql
DELETE FROM orders WHERE is_mock = true;
```

### Remove Specific Order
```sql
DELETE FROM orders WHERE id = '<order-id>';
```

---

## 🛡️ Safety Features

- ✅ Only works in development mode
- ✅ Requires `DJANGO_ENV=development`
- ✅ All orders marked with `is_mock=true`
- ✅ UUID validation
- ✅ Supabase connection validation
- ✅ Clear error messages

---

## 🐛 Troubleshooting

### Script won't run
- Check `DJANGO_ENV=development` in `.env`
- Verify Python environment is activated
- Ensure you're in `backend/` directory

### Invalid user ID error
- Use proper UUID format (36 chars, 4 hyphens)
- Example: `12345678-1234-1234-1234-123456789abc`

### Supabase connection error
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Check `SUPABASE_URL` is correct
- Test Supabase connection

### Orders not showing in frontend
- Verify user ID matches logged-in user
- Check RLS policies in Supabase
- Refresh frontend page

---

## 📞 Support

For issues:
1. Check error messages in terminal
2. Review backend logs
3. Check Supabase dashboard logs
4. Verify environment variables
5. Read full documentation in `TESTING_MOCK_ORDERS.md`

---

## 🎓 Learning Path

1. **Start here**: `QUICK_REFERENCE.md`
2. **Try examples**: `EXAMPLE_USAGE.bat` or `.sh`
3. **Deep dive**: `TESTING_MOCK_ORDERS.md`
4. **Reference**: This file (`TESTING_INDEX.md`)

---

## ✅ Checklist

Before testing:
- [ ] `DJANGO_ENV=development` set
- [ ] Supabase credentials configured
- [ ] User ID obtained
- [ ] Backend server running
- [ ] Frontend server running

Testing workflow:
- [ ] Create test orders
- [ ] Verify orders created
- [ ] Test Chapa payment flow
- [ ] Test Telebirr payment flow
- [ ] Verify status updates
- [ ] Check payment records
- [ ] Clean up test data

---

**Last Updated**: 2026-04-27
**Version**: 1.0
**Maintainer**: DEKNA Development Team
