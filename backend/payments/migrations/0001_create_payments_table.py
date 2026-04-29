# """
# Migration to create the payments table in Supabase.

# This migration should be run against the 'supabase' database using:
#     python manage.py migrate --database=supabase

# It creates the payments table with appropriate fields, constraints, RLS policies,
# and audit triggers for secure payment tracking.
# """


from django.db import migrations


class Migration(migrations.Migration):

    dependencies = []

    operations = [
        migrations.RunSQL(
            sql="""
            -- 1. Create payments table
            CREATE TABLE IF NOT EXISTS public.payments (
              id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),

              -- Who this payment belongs to (Supabase authenticated user)
              user_id       UUID NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,

              -- Business-level order identifier from your backend
              order_id      TEXT NOT NULL,

              -- Unique transaction reference used with Chapa
              tx_ref        TEXT NOT NULL UNIQUE,

              -- Monetary fields
              amount        NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
              currency      TEXT NOT NULL DEFAULT 'ETB',

              -- Payment lifecycle status - backend-controlled
              status        TEXT NOT NULL DEFAULT 'pending'
                          CHECK (
                            status IN (
                              'pending',
                              'initialized',
                              'processing',
                              'verified',
                              'failed',
                              'cancelled'
                            )
                          ),

              -- Optional metadata for auditing and debugging
              provider      TEXT NOT NULL DEFAULT 'chapa',
              raw_provider_response JSONB,

              -- Timestamps for auditability
              created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
              updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            -- 2. Trigger function to keep updated_at in sync
            CREATE OR REPLACE FUNCTION public.set_payments_updated_at()
            RETURNS TRIGGER AS $$
            BEGIN
              NEW.updated_at = NOW();
              RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            -- 3. Trigger (PostgreSQL does NOT support IF NOT EXISTS here)
            DROP TRIGGER IF EXISTS trg_payments_set_updated_at ON public.payments;

            CREATE TRIGGER trg_payments_set_updated_at
            BEFORE UPDATE ON public.payments
            FOR EACH ROW
            EXECUTE FUNCTION public.set_payments_updated_at();

            -- 4. Helpful indexes
            CREATE INDEX IF NOT EXISTS idx_payments_user_id_created_at
              ON public.payments (user_id, created_at DESC);

            CREATE INDEX IF NOT EXISTS idx_payments_order_id
              ON public.payments (order_id);

            -- 5. Enable Row Level Security
            ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

            -- 6. RLS policy (PostgreSQL 14 compatible)
            DROP POLICY IF EXISTS "Payments are readable by their owner only"
              ON public.payments;

            CREATE POLICY "Payments are readable by their owner only"
              ON public.payments
              FOR SELECT
              USING (auth.uid() = user_id);
            """,
            reverse_sql="""
            DROP POLICY IF EXISTS "Payments are readable by their owner only"
              ON public.payments;

            ALTER TABLE IF EXISTS public.payments
              DISABLE ROW LEVEL SECURITY;

            DROP TRIGGER IF EXISTS trg_payments_set_updated_at
              ON public.payments;

            DROP FUNCTION IF EXISTS public.set_payments_updated_at();

            DROP INDEX IF EXISTS idx_payments_order_id;
            DROP INDEX IF EXISTS idx_payments_user_id_created_at;

            DROP TABLE IF EXISTS public.payments;
            """
        ),
    ]





