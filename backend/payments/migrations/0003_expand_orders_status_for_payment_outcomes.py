"""Expand orders status values for payment outcomes.

Orders represent purchase intent; however, STEP 10 requires the related order
status to reflect payment outcome (e.g., paid/failed).

This migration expands the CHECK constraint values.

Run against Supabase DB:
  python manage.py migrate --database=supabase
"""

from django.db import migrations


class Migration(migrations.Migration):

  dependencies = [
    ("payments", "0002_create_orders_table"),
  ]

  operations = [
    migrations.RunSQL(
      sql="""
      -- PostgreSQL CHECK constraints cannot be altered directly; we re-define it.
      ALTER TABLE public.orders
        DROP CONSTRAINT IF EXISTS orders_status_check;

      -- Recreate constraint with expanded statuses.
      ALTER TABLE public.orders
        ADD CONSTRAINT orders_status_check
        CHECK (status IN ('created', 'cancelled', 'paid', 'payment_failed'));
      """,
      reverse_sql="""
      ALTER TABLE public.orders
        DROP CONSTRAINT IF EXISTS orders_status_check;

      ALTER TABLE public.orders
        ADD CONSTRAINT orders_status_check
        CHECK (status IN ('created', 'cancelled'));
      """,
    )
  ]
