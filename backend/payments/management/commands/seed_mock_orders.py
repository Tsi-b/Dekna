"""Dev-only: seed mock orders into Supabase.

This command exists solely to enable end-to-end payment flow testing in local
development environments.

Safety properties:
- Hard-fails unless DJANGO_ENV=development.
- Uses the Supabase SERVICE ROLE key (server-side only).
- Inserts orders directly into `public.orders`.
- Does not change RLS policies; normal clients still cannot write orders.

Usage:
  python manage.py seed_mock_orders --user-id <uuid> [--count 3]

You can pass multiple --user-id flags.
"""

from __future__ import annotations

import json
from typing import Any
from uuid import UUID

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from services.supabase_client import get_supabase_client


def _require_development() -> None:
  if getattr(settings, "DJANGO_ENV", None) != "development":
    raise CommandError(
      "seed_mock_orders is development-only. Set DJANGO_ENV=development to use it."
    )


class Command(BaseCommand):
  help = "Seed dev-only mock orders into Supabase for one or more users."

  def add_arguments(self, parser):
    parser.add_argument(
      "--user-id",
      action="append",
      dest="user_ids",
      required=True,
      help="Supabase auth.users UUID. Can be provided multiple times.",
    )
    parser.add_argument(
      "--count",
      type=int,
      default=3,
      help="Number of mock orders to create per user (default: 3).",
    )
    parser.add_argument(
      "--metadata",
      type=str,
      default=None,
      help="Optional JSON metadata applied to all created orders.",
    )
    parser.add_argument(
      "--amount",
      type=str,
      default="100.00",
      help="Mock order amount to store in order metadata (default: 100.00).",
    )
    parser.add_argument(
      "--currency",
      type=str,
      default="ETB",
      help="Mock order currency to store in order metadata (default: ETB).",
    )

  def handle(self, *args: Any, **options: Any):
    _require_development()

    user_ids_raw = options.get("user_ids") or []
    count = int(options.get("count") or 0)
    if count <= 0 or count > 100:
      raise CommandError("--count must be between 1 and 100")

    metadata_raw = options.get("metadata")
    metadata = None
    if metadata_raw:
      try:
        metadata = json.loads(metadata_raw)
      except json.JSONDecodeError as exc:
        raise CommandError("--metadata must be valid JSON") from exc

    # Always include backend-controlled pricing keys in metadata for server-side pricing.
    amount = str(options.get("amount") or "100.00")
    currency = str(options.get("currency") or "ETB").upper().strip()
    base_metadata = {"amount": amount, "currency": currency}
    if metadata is not None:
      # Merge user-provided metadata on top, but keep pricing keys authoritative.
      merged = dict(metadata)
      merged.update(base_metadata)
      metadata = merged
    else:
      metadata = base_metadata

    # Validate UUIDs early to fail loudly.
    user_ids: list[str] = []
    for u in user_ids_raw:
      try:
        user_ids.append(str(UUID(u)))
      except Exception as exc:  # noqa: BLE001
        raise CommandError(f"Invalid --user-id UUID: {u}") from exc

    client = get_supabase_client()

    created_total = 0
    for user_id in user_ids:
      rows = []
      for i in range(count):
        rows.append(
          {
            "user_id": user_id,
            "external_ref": f"mock-{user_id[:8]}-{i+1}",
            "status": "created",
            "is_mock": True,
            "metadata": metadata,
          }
        )

      try:
        resp = client.table("orders").insert(rows).execute()
      except Exception as exc:  # noqa: BLE001
        # Dev-friendly error surfacing: include provider error message without secrets.
        raise CommandError(f"Failed to insert mock orders into Supabase: {exc}") from exc

      data = getattr(resp, "data", None)
      # `data` is typically a list of inserted rows.
      if not data:
        raise CommandError("Supabase insert returned no data; cannot confirm seeding.")

      created_total += len(data)
      self.stdout.write(
        self.style.SUCCESS(
          f"Seeded {len(data)} mock orders for user_id={user_id}. Example order id={data[0].get('id')}"
        )
      )

    self.stdout.write(self.style.SUCCESS(f"Done. Total mock orders created: {created_total}"))
