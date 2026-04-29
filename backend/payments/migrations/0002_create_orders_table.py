"""
Migration to create the orders table in Supabase.

This migration should be run against the 'supabase' database using:
    python manage.py migrate --database=supabase

Guarantees:
- Orders represent purchase intent ONLY.
- Users may READ only their own orders (RLS).
- Users may NOT write/modify orders (no INSERT/UPDATE/DELETE policies).
- Backend writes occur using Supabase service role key (bypasses RLS).
"""

from django.db import migrations


class Migration(migrations.Migration):

  dependencies = [
    ("payments", "0001_create_payments_table"),
  ]

  operations = [
    migrations.RunSQL(
      sql="""
      -- 1. Create orders table
      CREATE TABLE IF NOT EXISTS public.orders (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        -- Who this order belongs to (Supabase authenticated user)
        user_id       UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,

        -- A human/business identifier for linking from other systems (optional)
        external_ref  TEXT,

        -- Order intent status (NOT payment status)
        status        TEXT NOT NULL DEFAULT 'created'
                    CONSTRAINT orders_status_check
                    CHECK (status IN ('created', 'cancelled')),

        -- Development-only marker for seeded orders. Not used for auth decisions.
        is_mock       BOOLEAN NOT NULL DEFAULT FALSE,

        -- Optional metadata for auditability/debugging
        metadata      JSONB,

        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- 2. Trigger function to keep updated_at in sync
      CREATE OR REPLACE FUNCTION public.set_orders_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_orders_set_updated_at ON public.orders;

      CREATE TRIGGER trg_orders_set_updated_at
      BEFORE UPDATE ON public.orders
      FOR EACH ROW
      EXECUTE FUNCTION public.set_orders_updated_at();

      -- 3. Helpful index
      CREATE INDEX IF NOT EXISTS idx_orders_user_id_created_at
        ON public.orders (user_id, created_at DESC);

      -- 4. Enable Row Level Security
      ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

      -- 5. RLS policy: users can only read their own orders
      DROP POLICY IF EXISTS "Orders are readable by their owner only"
        ON public.orders;

      CREATE POLICY "Orders are readable by their owner only"
        ON public.orders
        FOR SELECT
        USING (auth.uid() = user_id);

      -- NOTE: No INSERT/UPDATE/DELETE policies are defined.
      -- With RLS enabled, this means authenticated users cannot write/modify orders.
      """,
      reverse_sql="""
      DROP POLICY IF EXISTS "Orders are readable by their owner only"
        ON public.orders;

      ALTER TABLE IF EXISTS public.orders
        DISABLE ROW LEVEL SECURITY;

      DROP TRIGGER IF EXISTS trg_orders_set_updated_at
        ON public.orders;

      DROP FUNCTION IF EXISTS public.set_orders_updated_at();

      DROP INDEX IF EXISTS idx_orders_user_id_created_at;

      DROP TABLE IF EXISTS public.orders;
      """,
    ),
  ]
