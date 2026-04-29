"""Create user_profiles and wishlists tables in Supabase.

These are required by the frontend AuthContext bootstrap.
Run against Supabase database:
  python manage.py migrate --database=supabase
"""

from django.db import migrations


class Migration(migrations.Migration):

  dependencies = [
    ("payments", "0005_create_shipping_addresses_table"),
  ]

  operations = [
    migrations.RunSQL(
      sql="""
      -- =========================================================
      -- user_profiles
      -- =========================================================
      CREATE TABLE IF NOT EXISTS public.user_profiles (
        id          UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
        email       TEXT,
        full_name   TEXT,
        phone       TEXT,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE OR REPLACE FUNCTION public.set_user_profiles_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_user_profiles_set_updated_at ON public.user_profiles;
      CREATE TRIGGER trg_user_profiles_set_updated_at
      BEFORE UPDATE ON public.user_profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.set_user_profiles_updated_at();

      ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "User profiles are readable by owner only" ON public.user_profiles;
      CREATE POLICY "User profiles are readable by owner only"
        ON public.user_profiles
        FOR SELECT
        USING (auth.uid() = id);

      DROP POLICY IF EXISTS "User profiles are insertable by owner only" ON public.user_profiles;
      CREATE POLICY "User profiles are insertable by owner only"
        ON public.user_profiles
        FOR INSERT
        WITH CHECK (auth.uid() = id);

      DROP POLICY IF EXISTS "User profiles are updatable by owner only" ON public.user_profiles;
      CREATE POLICY "User profiles are updatable by owner only"
        ON public.user_profiles
        FOR UPDATE
        USING (auth.uid() = id)
        WITH CHECK (auth.uid() = id);

      -- =========================================================
      -- wishlists
      -- =========================================================
      CREATE TABLE IF NOT EXISTS public.wishlists (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id     UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
        product_id  TEXT NOT NULL,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- Prevent duplicates per user
      CREATE UNIQUE INDEX IF NOT EXISTS uniq_wishlists_user_product
        ON public.wishlists (user_id, product_id);

      CREATE INDEX IF NOT EXISTS idx_wishlists_user_id
        ON public.wishlists (user_id);

      ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Wishlists are readable by owner only" ON public.wishlists;
      CREATE POLICY "Wishlists are readable by owner only"
        ON public.wishlists
        FOR SELECT
        USING (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Wishlists are insertable by owner only" ON public.wishlists;
      CREATE POLICY "Wishlists are insertable by owner only"
        ON public.wishlists
        FOR INSERT
        WITH CHECK (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Wishlists are deletable by owner only" ON public.wishlists;
      CREATE POLICY "Wishlists are deletable by owner only"
        ON public.wishlists
        FOR DELETE
        USING (auth.uid() = user_id);
      """,
      reverse_sql="""
      -- wishlists
      DROP POLICY IF EXISTS "Wishlists are deletable by owner only" ON public.wishlists;
      DROP POLICY IF EXISTS "Wishlists are insertable by owner only" ON public.wishlists;
      DROP POLICY IF EXISTS "Wishlists are readable by owner only" ON public.wishlists;
      ALTER TABLE IF EXISTS public.wishlists DISABLE ROW LEVEL SECURITY;
      DROP INDEX IF EXISTS idx_wishlists_user_id;
      DROP INDEX IF EXISTS uniq_wishlists_user_product;
      DROP TABLE IF EXISTS public.wishlists;

      -- user_profiles
      DROP POLICY IF EXISTS "User profiles are updatable by owner only" ON public.user_profiles;
      DROP POLICY IF EXISTS "User profiles are insertable by owner only" ON public.user_profiles;
      DROP POLICY IF EXISTS "User profiles are readable by owner only" ON public.user_profiles;
      ALTER TABLE IF EXISTS public.user_profiles DISABLE ROW LEVEL SECURITY;
      DROP TRIGGER IF EXISTS trg_user_profiles_set_updated_at ON public.user_profiles;
      DROP FUNCTION IF EXISTS public.set_user_profiles_updated_at();
      DROP TABLE IF EXISTS public.user_profiles;
      """,
    ),
  ]
