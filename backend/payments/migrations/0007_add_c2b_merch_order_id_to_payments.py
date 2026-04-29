"""Add c2b_merch_order_id column to payments table.

Required for Telebirr C2B payment records.

Run against Supabase database:
  python manage.py migrate --database=supabase
"""

from django.db import migrations


class Migration(migrations.Migration):

  dependencies = [
    ("payments", "0006_create_user_profiles_and_wishlists_tables"),
  ]

  operations = [
    migrations.RunSQL(
      sql="""
      ALTER TABLE public.payments
        ADD COLUMN IF NOT EXISTS c2b_merch_order_id TEXT;

      CREATE INDEX IF NOT EXISTS idx_payments_c2b_merch_order_id
        ON public.payments (c2b_merch_order_id)
        WHERE c2b_merch_order_id IS NOT NULL;
      """,
      reverse_sql="""
      DROP INDEX IF EXISTS idx_payments_c2b_merch_order_id;
      ALTER TABLE public.payments DROP COLUMN IF EXISTS c2b_merch_order_id;
      """,
    )
  ]
