"""
Supabase client initialization for the Django backend.

This module uses the Supabase *service role* key exclusively and is intended
for trusted, server-side operations only (e.g., writing verified payment data).

It MUST NOT:
- Use the Supabase anon/public key.
- Be imported or exposed in any way to frontend code.
- Leak credentials via logs, responses, or error messages.
"""

from __future__ import annotations

from typing import Optional

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from supabase import Client, create_client


_supabase_client: Optional[Client] = None


def get_supabase_client() -> Client:
  """
  Lazily initialize and return a singleton Supabase client.

  Uses the SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from Django settings.
  Raises ImproperlyConfigured if configuration is invalid.
  """

  global _supabase_client

  if _supabase_client is not None:
    return _supabase_client

  url = getattr(settings, "SUPABASE_URL", None)
  service_role_key = getattr(settings, "SUPABASE_SERVICE_ROLE_KEY", None)

  if not url or not service_role_key:
    # Do not log keys; only complain about missing configuration.
    raise ImproperlyConfigured(
      "Supabase configuration is missing. SUPABASE_URL and "
      "SUPABASE_SERVICE_ROLE_KEY must be set in the backend environment."
    )

  try:
    client = create_client(url, service_role_key)
  except Exception as exc:  # noqa: BLE001
    # Surface a safe, non-secret-bearing error.
    raise ImproperlyConfigured(
      "Failed to initialize Supabase client with the provided configuration."
    ) from exc

  _supabase_client = client
  return _supabase_client


def insert_payment_record(table_name: str, payload: dict) -> dict:
  """
  Insert a payment-related record into Supabase using the service role key.

  This helper assumes:
  - The table is managed server-side (e.g., 'payments' in Supabase).
  - The payload has already been validated and represents a *trusted*,
    backend-derived view of a verified payment (e.g., after Chapa verification).

  It does NOT:
  - Trust or sanitize raw frontend 'success' flags.
  - Expose Supabase client or credentials.
  """

  client = get_supabase_client()

  try:
    response = client.table(table_name).insert(payload).execute()
  except Exception as exc:  # noqa: BLE001
    # Do not leak internals; propagate a controlled error upward.
    raise RuntimeError("Failed to insert payment record into Supabase.") from exc

  # Return only the structured data portion, never credentials.
  # The exact shape depends on supabase-py; we keep this generic.
  return getattr(response, "data", response)




