# Newsletter Setup Guide

## Quick Start

### 1. Run Migration

```bash
cd backend
python manage.py migrate
```

Expected output:
```
Running migrations:
  Applying payments.0008_create_newsletter_subscribers_table... OK
```

### 2. Verify Table Creation

Connect to your Supabase database and run:

```sql
SELECT * FROM newsletter_subscribers LIMIT 1;
```

### 3. Test API Endpoint

```bash
# Subscribe
curl -X POST http://localhost:8000/api/newsletter/subscribe/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","source":"test"}'

# Expected response:
# {"success":true,"message":"Successfully subscribed to newsletter","email":"test@example.com","reactivated":false}
```

### 4. Test Frontend

1. Start backend: `python manage.py runserver`
2. Start frontend: `npm run dev` (in root directory)
3. Open http://localhost:8080
4. Scroll to footer
5. Enter email and click Subscribe

## Sending Newsletters

### Option 1: Query Subscribers Directly

```python
from services.supabase_client import get_supabase_client

supabase = get_supabase_client()
result = supabase.table('newsletter_subscribers')\
    .select('email')\
    .eq('is_active', True)\
    .execute()

emails = [sub['email'] for sub in result.data]
print(f"Active subscribers: {len(emails)}")
```

### Option 2: Use Service Function

```python
from payments.newsletter_service import get_active_subscribers_count

count = get_active_subscribers_count()
print(f"Total active subscribers: {count}")
```

## Integration with Email Services

### SendGrid Example

```bash
pip install sendgrid
```

```python
import os
import sendgrid
from sendgrid.helpers.mail import Mail
from services.supabase_client import get_supabase_client

def send_newsletter(subject, html_content):
    # Get subscribers
    supabase = get_supabase_client()
    result = supabase.table('newsletter_subscribers')\
        .select('email')\
        .eq('is_active', True)\
        .execute()
    
    # Send emails
    sg = sendgrid.SendGridAPIClient(api_key=os.environ.get('SENDGRID_API_KEY'))
    
    for subscriber in result.data:
        message = Mail(
            from_email='newsletter@dekna.com',
            to_emails=subscriber['email'],
            subject=subject,
            html_content=html_content
        )
        
        try:
            response = sg.send(message)
            print(f"Sent to {subscriber['email']}: {response.status_code}")
        except Exception as e:
            print(f"Error sending to {subscriber['email']}: {e}")

# Usage
send_newsletter(
    subject="New Products This Week!",
    html_content="<h1>Check out our latest arrivals...</h1>"
)
```

## Monitoring

### Check Subscription Stats

```sql
-- Total active subscribers
SELECT COUNT(*) as total_subscribers
FROM newsletter_subscribers
WHERE is_active = true;

-- Subscriptions by source
SELECT source, COUNT(*) as count
FROM newsletter_subscribers
WHERE is_active = true
GROUP BY source
ORDER BY count DESC;

-- Recent subscriptions
SELECT email, subscribed_at, source
FROM newsletter_subscribers
WHERE is_active = true
ORDER BY subscribed_at DESC
LIMIT 10;

-- Unsubscribe rate
SELECT 
  COUNT(CASE WHEN is_active = true THEN 1 END) as active,
  COUNT(CASE WHEN is_active = false THEN 1 END) as unsubscribed,
  ROUND(
    COUNT(CASE WHEN is_active = false THEN 1 END) * 100.0 / COUNT(*),
    2
  ) as unsubscribe_rate_percent
FROM newsletter_subscribers;
```

## Troubleshooting

### Migration Fails

**Error:** `relation "newsletter_subscribers" already exists`

**Solution:**
```sql
-- Drop table and re-run migration
DROP TABLE IF EXISTS newsletter_subscribers CASCADE;
```

Then run: `python manage.py migrate`

### API Returns 500 Error

**Check:**
1. Backend logs: Look for Python errors
2. Supabase connection: Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env`
3. Table exists: Run `SELECT * FROM newsletter_subscribers LIMIT 1;`

### Frontend Can't Connect

**Check:**
1. Backend running: `http://localhost:8000/api/health/`
2. CORS settings: Verify `CORS_ALLOWED_ORIGINS` in Django settings
3. Frontend env: Check `VITE_BACKEND_URL` in frontend `.env`

## Next Steps

1. ✅ Set up email service (SendGrid, Mailchimp, etc.)
2. ✅ Create newsletter templates
3. ✅ Schedule regular newsletters
4. ✅ Add unsubscribe page
5. ✅ Monitor subscription metrics
6. ✅ Add rate limiting (optional)

## Support

For issues or questions, check:
- Main documentation: `NEWSLETTER_IMPLEMENTATION.md`
- Backend logs: `python manage.py runserver`
- Database: Supabase dashboard
- API: `http://localhost:8000/api/newsletter/subscribe/`
