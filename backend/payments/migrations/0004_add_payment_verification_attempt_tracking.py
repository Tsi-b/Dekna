"""Add verification attempt tracking fields to payments (Supabase).

STEP 12 requires tracking verification attempt count and last attempt timestamp.

This migration is run against the Supabase database:
  python manage.py migrate --database=supabase

Notes:
- Defaults preserve existing rows.
- We do not reset/overwrite verification history; terminal states remain unchanged.
"""

from django.db import migrations


class Migration(migrations.Migration):

  dependencies = [
    ("payments", "0003_expand_orders_status_for_payment_outcomes"),
  ]

  operations = [
    migrations.RunSQL(
      sql="""
      ALTER TABLE public.payments
        ADD COLUMN IF NOT EXISTS verification_attempts INTEGER NOT NULL DEFAULT 0;

      ALTER TABLE public.payments
        ADD COLUMN IF NOT EXISTS last_verification_attempt_at TIMESTAMPTZ;

      CREATE INDEX IF NOT EXISTS idx_payments_status_last_attempt
        ON public.payments (status, last_verification_attempt_at);
      """,
      reverse_sql="""
      DROP INDEX IF EXISTS idx_payments_status_last_attempt;

      ALTER TABLE public.payments
        DROP COLUMN IF EXISTS last_verification_attempt_at;

      ALTER TABLE public.payments
        DROP COLUMN IF EXISTS verification_attempts;
      """,
    )
  ]
