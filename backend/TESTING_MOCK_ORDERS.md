# Testing Mock Orders - Development Guide

This guide explains how to create and test mock orders for Chapa and Telebirr payment providers in development mode.

## Prerequisites

- `DJANGO_ENV=development` must be set in `backend/.env`
- Valid Supabase user ID (UUID format)

## Quick Start

### Method 1: Quick Test Orders Script (Recommended)

Create 10 pre-configured test orders (5 Chapa + 5 Telebirr) with varying amounts:

```bash
cd backend
python seed_test_orders.py <your-user-id>
```

**Example:**
```bash
python seed_test_orders.py 12345678-1234-1234-1234-123456789abc
```

**What it creates:**

**Chapa Orders:**
- Order 1: 50.00 ETB (Small order)
- Order 2: 150.00 ETB (Medium order)
- Order 3: 250.00 ETB (Standard order)
- Order 4: 500.00 ETB (Large order)
- Order 5: 1000.00 ETB (Premium order)

**Telebirr Orders:**
- Order 1: 75.00 ETB (Small order)
- Order 2: 200.00 ETB (Medium order)
- Order 3: 350.00 ETB (Standard order)
- Order 4: 750.00 ETB (Large order)
- Order 5: 1500.00 ETB (Premium order)

### Method 2: Django Management Command (Custom)

For custom orders with specific amounts:

```bash
cd backend
python manage.py seed_mock_orders --user-id <your-user-id> --count 5 --amount 250.00 --currency ETB
```

**Options:**
- `--user-id`: Your Supabase user UUID (required, can be used multiple times)
- `--count`: Number of orders to create (default: 3, max: 100)
- `--amount`: Order amount (default: 100.00)
- `--currency`: Currency code (default: ETB)
- `--metadata`: Optional JSON metadata

**Examples:**

Create 3 orders with 100 ETB each:
```bash
python manage.py seed_mock_orders --user-id <uuid>
```

Create 5 orders with 500 ETB each:
```bash
python manage.py seed_mock_orders --user-id <uuid> --count 5 --amount 500.00
```

Create orders for multiple users:
```bash
python manage.py seed_mock_orders --user-id <uuid1> --user-id <uuid2> --count 3
```

## Finding Your User ID

### Option 1: From Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to Authentication → Users
3. Copy the UUID from the user you want to test with

### Option 2: From Browser Console (if logged in)
```javascript
// Open browser console on your app
localStorage.getItem('supabase.auth.token')
// Look for the "user" object and copy the "id" field
```

### Option 3: From Database
```sql
SELECT id, email FROM auth.users LIMIT 10;
```

## Testing Payment Flows

### Chapa Payment Flow

1. **Create mock orders** (using either method above)
2. **Navigate to your app** and find an order in "created" status
3. **Initiate payment** via the frontend
4. **Backend will:**
   - Create a pending payment record
   - Call Chapa API (or mock in dev mode)
   - Return checkout URL
5. **Complete payment** on Chapa's page
6. **Webhook/callback** will update order status to "paid"

### Telebirr Payment Flow

1. **Create mock orders** (using either method above)
2. **Navigate to your app** and find an order in "created" status
3. **Initiate payment** via the frontend
4. **Backend will:**
   - Create a pending payment record
   - Call Telebirr gateway (or mock if `C2B_MOCK_ENABLED=true`)
   - Return checkout URL
5. **Complete payment** on Telebirr's page
6. **Webhook/callback** will update order status to "paid"

## Mock Mode vs Real Mode

### Chapa
- **Real mode**: Uses actual Chapa API with test keys
- **Test keys**: Already configured in `.env` (`CHASECK_TEST-...`)
- No mock mode needed - Chapa provides test environment

### Telebirr
- **Mock mode**: Set `C2B_MOCK_ENABLED=true` in `.env`
- **Real mode**: Set `C2B_MOCK_ENABLED=false` (requires VPN/network access to gateway)
- Mock mode returns fake checkout URLs for local testing

## Order Statuses

- `created`: Order created, no payment initiated
- `pending`: Payment initiated, awaiting confirmation
- `paid`: Payment successful
- `payment_failed`: Payment failed or rejected
- `cancelled`: Order cancelled by user

## Troubleshooting

### "seed_mock_orders is development-only"
**Solution:** Set `DJANGO_ENV=development` in `backend/.env`

### "Invalid user_id UUID"
**Solution:** Ensure you're using a valid UUID format (36 characters with 4 hyphens)

### "Failed to insert mock orders into Supabase"
**Solution:** 
- Check `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Verify `SUPABASE_URL` is correct
- Ensure the `orders` table exists in Supabase

### Orders not appearing in frontend
**Solution:**
- Verify the user_id matches your logged-in user
- Check RLS policies in Supabase allow reading your own orders
- Refresh the page or clear cache

## Cleanup

To remove test orders from Supabase:

```sql
-- Delete all mock orders for a specific user
DELETE FROM orders WHERE user_id = '<your-user-id>' AND is_mock = true;

-- Delete all mock orders (careful!)
DELETE FROM orders WHERE is_mock = true;
```

## Production Safety

⚠️ **Important:** Mock orders are **development-only**:
- The seeding commands will fail if `DJANGO_ENV != "development"`
- Mock orders have `is_mock = true` flag
- Production should never have `is_mock = true` orders
- Always validate `DJANGO_ENV` before allowing mock operations

## Next Steps

After creating mock orders:
1. Test the complete payment flow for both providers
2. Verify webhook handling updates order status correctly
3. Test payment verification endpoint
4. Check payment status page displays correctly
5. Verify order history shows accurate payment states

## Support

For issues or questions:
- Check backend logs: `python manage.py runserver`
- Check Supabase logs in dashboard
- Review payment provider documentation (Chapa/Telebirr)
