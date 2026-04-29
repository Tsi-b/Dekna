"""Database routing for multi-database setup.

This project uses:
- `default` (SQLite) for Django internal tables (admin/auth/sessions/etc.)
- `supabase` (Postgres) for application data tables managed in Supabase (payments/orders)

Critical rule:
- The `payments` app migrations must run ONLY on the `supabase` database.
  They include Postgres-specific SQL (schema `public`, RLS policies, triggers).

This router ensures `python manage.py migrate` (default DB) will not attempt to
apply `payments` migrations on SQLite.
"""

from __future__ import annotations


class DatabaseRouter:
  """Route migrations and (optionally) ORM operations by app label."""

  SUPABASE_APPS = {"payments"}

  def allow_migrate(self, db: str, app_label: str, model_name: str | None = None, **hints):
    # Payments app is managed in Supabase Postgres only.
    if app_label in self.SUPABASE_APPS:
      return db == "supabase"

    # All other apps migrate only on default.
    if db == "supabase":
      return False

    return True
