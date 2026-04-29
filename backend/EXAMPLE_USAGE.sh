#!/bin/bash
# Example usage of mock order testing scripts
# This is a reference file - update USER_ID with your actual Supabase user UUID

# ============================================================================
# CONFIGURATION
# ============================================================================

# Replace this with your actual Supabase user ID
USER_ID="12345678-1234-1234-1234-123456789abc"

# ============================================================================
# EXAMPLE 1: Create Quick Test Orders
# ============================================================================

echo "📦 Creating 10 test orders (5 Chapa + 5 Telebirr)..."
python seed_test_orders.py $USER_ID

# ============================================================================
# EXAMPLE 2: Check Created Orders
# ============================================================================

echo ""
echo "🔍 Checking orders for user..."
python check_orders.py $USER_ID

# ============================================================================
# EXAMPLE 3: Create Custom Orders
# ============================================================================

echo ""
echo "📦 Creating 3 custom orders with 999 ETB each..."
python manage.py seed_mock_orders --user-id $USER_ID --count 3 --amount 999.00

# ============================================================================
# EXAMPLE 4: Create Orders for Multiple Users
# ============================================================================

# Uncomment and update with actual user IDs
# USER_ID_1="11111111-1111-1111-1111-111111111111"
# USER_ID_2="22222222-2222-2222-2222-222222222222"
# 
# echo ""
# echo "📦 Creating orders for multiple users..."
# python manage.py seed_mock_orders \
#   --user-id $USER_ID_1 \
#   --user-id $USER_ID_2 \
#   --count 5 \
#   --amount 500.00

# ============================================================================
# EXAMPLE 5: Create Orders with Custom Metadata
# ============================================================================

# echo ""
# echo "📦 Creating orders with custom metadata..."
# python manage.py seed_mock_orders \
#   --user-id $USER_ID \
#   --count 2 \
#   --amount 750.00 \
#   --metadata '{"test_scenario": "bulk_order", "priority": "high"}'

# ============================================================================
# NOTES
# ============================================================================

# 1. Make sure DJANGO_ENV=development in backend/.env
# 2. Get your user ID from Supabase dashboard or browser console
# 3. All created orders will have is_mock=true
# 4. Orders start in "created" status
# 5. Use the frontend to test payment flows

# ============================================================================
# CLEANUP
# ============================================================================

# To remove all mock orders for a user (run in psql or Supabase SQL editor):
# DELETE FROM orders WHERE user_id = '<user-id>' AND is_mock = true;
