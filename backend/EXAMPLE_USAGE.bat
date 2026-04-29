@echo off
REM Example usage of mock order testing scripts for Windows
REM This is a reference file - update USER_ID with your actual Supabase user UUID

REM ============================================================================
REM CONFIGURATION
REM ============================================================================

REM Replace this with your actual Supabase user ID
SET USER_ID=12345678-1234-1234-1234-123456789abc

REM ============================================================================
REM EXAMPLE 1: Create Quick Test Orders
REM ============================================================================

echo.
echo ============================================================================
echo Creating 10 test orders (5 Chapa + 5 Telebirr)...
echo ============================================================================
python seed_test_orders.py %USER_ID%

REM ============================================================================
REM EXAMPLE 2: Check Created Orders
REM ============================================================================

echo.
echo ============================================================================
echo Checking orders for user...
echo ============================================================================
python check_orders.py %USER_ID%

REM ============================================================================
REM EXAMPLE 3: Create Custom Orders
REM ============================================================================

echo.
echo ============================================================================
echo Creating 3 custom orders with 999 ETB each...
echo ============================================================================
python manage.py seed_mock_orders --user-id %USER_ID% --count 3 --amount 999.00

REM ============================================================================
REM EXAMPLE 4: Create Orders for Multiple Users
REM ============================================================================

REM Uncomment and update with actual user IDs
REM SET USER_ID_1=11111111-1111-1111-1111-111111111111
REM SET USER_ID_2=22222222-2222-2222-2222-222222222222
REM 
REM echo.
REM echo ============================================================================
REM echo Creating orders for multiple users...
REM echo ============================================================================
REM python manage.py seed_mock_orders --user-id %USER_ID_1% --user-id %USER_ID_2% --count 5 --amount 500.00

REM ============================================================================
REM EXAMPLE 5: Create Orders with Custom Metadata
REM ============================================================================

REM echo.
REM echo ============================================================================
REM echo Creating orders with custom metadata...
REM echo ============================================================================
REM python manage.py seed_mock_orders --user-id %USER_ID% --count 2 --amount 750.00 --metadata "{\"test_scenario\": \"bulk_order\", \"priority\": \"high\"}"

REM ============================================================================
REM NOTES
REM ============================================================================

echo.
echo ============================================================================
echo NOTES:
echo ============================================================================
echo 1. Make sure DJANGO_ENV=development in backend/.env
echo 2. Get your user ID from Supabase dashboard or browser console
echo 3. All created orders will have is_mock=true
echo 4. Orders start in "created" status
echo 5. Use the frontend to test payment flows
echo.
echo For cleanup, run this SQL in Supabase:
echo DELETE FROM orders WHERE user_id = 'your-user-id' AND is_mock = true;
echo ============================================================================

pause
