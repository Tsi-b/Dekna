# Quick Reference - Testing Scripts

## 🚀 Quick Commands

### Create Test Orders
```bash
# Create 10 test orders (5 Chapa + 5 Telebirr)
python seed_test_orders.py <user-id>
```

### Check Orders
```bash
# View all orders for a user
python check_orders.py <user-id>
```

### Custom Orders
```bash
# Create custom amount orders
python manage.py seed_mock_orders --user-id <uuid> --count 5 --amount 500.00
```

---

## 📋 Test Order Amounts

### Chapa Orders (5 orders)
| Order | Amount | Label |
|-------|--------|-------|
| 1 | 50 ETB | Small order |
| 2 | 150 ETB | Medium order |
| 3 | 250 ETB | Standard order |
| 4 | 500 ETB | Large order |
| 5 | 1000 ETB | Premium order |

### Telebirr Orders (5 orders)
| Order | Amount | Label |
|-------|--------|-------|
| 1 | 75 ETB | Small order |
| 2 | 200 ETB | Medium order |
| 3 | 350 ETB | Standard order |
| 4 | 750 ETB | Large order |
| 5 | 1500 ETB | Premium order |

---

## 🔧 Environment Setup

Required in `backend/.env`:
```bash
DJANGO_ENV=development
SUPABASE_SERVICE_ROLE_KEY=your-key
SUPABASE_URL=your-url
```

For Telebirr mock mode:
```bash
C2B_MOCK_ENABLED=true
```

---

## 🎯 Testing Workflow

1. **Create orders**: `python seed_test_orders.py <user-id>`
2. **Check orders**: `python check_orders.py <user-id>`
3. **Test payment**: Use frontend to initiate payment
4. **Verify status**: Check order status in frontend or run check script again

---

## 🗑️ Cleanup

Remove all mock orders:
```sql
DELETE FROM orders WHERE user_id = '<user-id>' AND is_mock = true;
```

---

## 📚 Full Documentation

See [`TESTING_MOCK_ORDERS.md`](TESTING_MOCK_ORDERS.md) for complete guide.
