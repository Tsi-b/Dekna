"""Create shipping_addresses table in Supabase.

Run against the Supabase database:
  python manage.py migrate --database=supabase

This table stores user-managed shipping addresses.
Guarantees (via RLS):
- Users can read/write only their own addresses.

"""

from django.db import migrations


class Migration(migrations.Migration):

  dependencies = [
    ("payments", "0004_add_payment_verification_attempt_tracking"),
  ]

  operations = [
    migrations.RunSQL(
      sql="""
      -- 1. Create shipping_addresses table
      CREATE TABLE IF NOT EXISTS public.shipping_addresses (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        -- Owner (Supabase authenticated user)
        user_id         UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,

        full_name       TEXT NOT NULL,
        address_line1   TEXT NOT NULL,
        address_line2   TEXT,
        city            TEXT NOT NULL,
        state_province  TEXT NOT NULL,
        postal_code     TEXT NOT NULL,
        country         TEXT NOT NULL,
        phone           TEXT,

        is_default      BOOLEAN NOT NULL DEFAULT FALSE,

        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- 2. updated_at trigger
      CREATE OR REPLACE FUNCTION public.set_shipping_addresses_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_shipping_addresses_set_updated_at ON public.shipping_addresses;

      CREATE TRIGGER trg_shipping_addresses_set_updated_at
      BEFORE UPDATE ON public.shipping_addresses
      FOR EACH ROW
      EXECUTE FUNCTION public.set_shipping_addresses_updated_at();

      -- 3. Helpful indexes
      CREATE INDEX IF NOT EXISTS idx_shipping_addresses_user_id_created_at
        ON public.shipping_addresses (user_id, created_at DESC);

      CREATE INDEX IF NOT EXISTS idx_shipping_addresses_user_id_is_default
        ON public.shipping_addresses (user_id, is_default DESC);

      -- Enforce at most one default address per user.
      -- NOTE: This index allows many non-default rows, but only one (user_id) where is_default is true.
      CREATE UNIQUE INDEX IF NOT EXISTS uniq_shipping_addresses_one_default_per_user
        ON public.shipping_addresses (user_id)
        WHERE is_default;

      -- Automatically keep only one default per user.
      -- If a row is inserted/updated with is_default=true, unset all other defaults for that user.
      CREATE OR REPLACE FUNCTION public.enforce_single_default_shipping_address()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.is_default IS TRUE THEN
          UPDATE public.shipping_addresses
          SET is_default = FALSE
          WHERE user_id = NEW.user_id
            AND id <> NEW.id
            AND is_default IS TRUE;
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_shipping_addresses_enforce_single_default
        ON public.shipping_addresses;

      CREATE TRIGGER trg_shipping_addresses_enforce_single_default
      AFTER INSERT OR UPDATE OF is_default ON public.shipping_addresses
      FOR EACH ROW
      WHEN (NEW.is_default IS TRUE)
      EXECUTE FUNCTION public.enforce_single_default_shipping_address();

      -- 4. Enable Row Level Security
      ALTER TABLE public.shipping_addresses ENABLE ROW LEVEL SECURITY;

      -- 5. RLS policies (PostgreSQL 14 compatible)

      DROP POLICY IF EXISTS "Shipping addresses are readable by their owner only"
        ON public.shipping_addresses;
      CREATE POLICY "Shipping addresses are readable by their owner only"
        ON public.shipping_addresses
        FOR SELECT
        USING (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Shipping addresses are insertable by their owner only"
        ON public.shipping_addresses;
      CREATE POLICY "Shipping addresses are insertable by their owner only"
        ON public.shipping_addresses
        FOR INSERT
        WITH CHECK (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Shipping addresses are updatable by their owner only"
        ON public.shipping_addresses;
      CREATE POLICY "Shipping addresses are updatable by their owner only"
        ON public.shipping_addresses
        FOR UPDATE
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Shipping addresses are deletable by their owner only"
        ON public.shipping_addresses;
      CREATE POLICY "Shipping addresses are deletable by their owner only"
        ON public.shipping_addresses
        FOR DELETE
        USING (auth.uid() = user_id);
      """,
      reverse_sql="""
      DROP POLICY IF EXISTS "Shipping addresses are deletable by their owner only"
        ON public.shipping_addresses;
      DROP POLICY IF EXISTS "Shipping addresses are updatable by their owner only"
        ON public.shipping_addresses;
      DROP POLICY IF EXISTS "Shipping addresses are insertable by their owner only"
        ON public.shipping_addresses;
      DROP POLICY IF EXISTS "Shipping addresses are readable by their owner only"
        ON public.shipping_addresses;

      ALTER TABLE IF EXISTS public.shipping_addresses DISABLE ROW LEVEL SECURITY;

      DROP INDEX IF EXISTS uniq_shipping_addresses_one_default_per_user;
      DROP INDEX IF EXISTS idx_shipping_addresses_user_id_is_default;
      DROP INDEX IF EXISTS idx_shipping_addresses_user_id_created_at;

      DROP TRIGGER IF EXISTS trg_shipping_addresses_enforce_single_default
        ON public.shipping_addresses;

      DROP FUNCTION IF EXISTS public.enforce_single_default_shipping_address();

      DROP TRIGGER IF EXISTS trg_shipping_addresses_set_updated_at
        ON public.shipping_addresses;

      DROP FUNCTION IF EXISTS public.set_shipping_addresses_updated_at();

      DROP TABLE IF EXISTS public.shipping_addresses;
      """,
    ),
  ]
