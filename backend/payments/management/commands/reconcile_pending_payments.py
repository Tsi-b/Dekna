"""Dev-only reconciliation for pending payments.

STEP 12: retry & reconciliation (development only).

This command:
- Finds stale PENDING payments in Supabase
- Enforces max 3 verification attempts per payment
- Re-runs backend-authoritative verification via the shared processor

It does NOT:
- Create new payments
- Change terminal payments
- Run in non-development environments

Usage:
  python manage.py reconcile_pending_payments [--min-age-minutes 10] [--limit 50]
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from services.supabase_client import get_supabase_client

from payments.verification_processor import (
  MAX_DEV_VERIFICATION_ATTEMPTS,
  is_transient_verification_error,
  verify_and_reconcile_by_tx_ref,
)


def _require_development() -> None:
  if getattr(settings, "DJANGO_ENV", None) != "development":
    raise CommandError(
      "reconcile_pending_payments is development-only. Set DJANGO_ENV=development to use it."
    )


def _now_utc() -> datetime:
  return datetime.now(timezone.utc)


class Command(BaseCommand):
  help = "Dev-only: reconcile stale pending payments by retrying Chapa verification (max 3 attempts)."

  def add_arguments(self, parser):
    parser.add_argument(
      "--min-age-minutes",
      type=int,
      default=10,
      help="Only process pending payments created at least this many minutes ago (default: 10).",
    )
    parser.add_argument(
      "--limit",
      type=int,
      default=50,
      help="Max number of pending payments to inspect in a single run (default: 50).",
    )

  def handle(self, *args: Any, **options: Any):
    _require_development()

    min_age_minutes = int(options.get("min_age_minutes") or 0)
    limit = int(options.get("limit") or 0)
    if min_age_minutes <= 0 or min_age_minutes > 24 * 60:
      raise CommandError("--min-age-minutes must be between 1 and 1440")
    if limit <= 0 or limit > 500:
      raise CommandError("--limit must be between 1 and 500")

    cutoff = _now_utc() - timedelta(minutes=min_age_minutes)

    client = get_supabase_client()

    # Fetch candidates. We filter further in Python to avoid relying on
    # PostgREST nuances for null/timestamptz comparisons.
    try:
      resp = (
        client.table("payments")
        .select("tx_ref,status,created_at,verification_attempts,last_verification_attempt_at")
        .eq("status", "pending")
        .limit(limit)
        .execute()
      )
    except Exception as exc:  # noqa: BLE001
      raise CommandError("Failed to query pending payments from Supabase.") from exc

    rows = getattr(resp, "data", None) or []
    if not rows:
      self.stdout.write("No pending payments found.")
      return

    processed = 0
    skipped = 0
    for row in rows:
      try:
        tx_ref = row.get("tx_ref")
        created_at_raw = row.get("created_at")
        attempts = int(row.get("verification_attempts") or 0)
      except Exception:
        skipped += 1
        continue

      if not tx_ref or not created_at_raw:
        skipped += 1
        continue

      # Parse created_at (ISO string).
      try:
        created_at = datetime.fromisoformat(str(created_at_raw).replace("Z", "+00:00"))
        if created_at.tzinfo is None:
          created_at = created_at.replace(tzinfo=timezone.utc)
      except Exception:
        skipped += 1
        continue

      if created_at > cutoff:
        continue

      if attempts >= MAX_DEV_VERIFICATION_ATTEMPTS:
        continue

      try:
        result = verify_and_reconcile_by_tx_ref(tx_ref=tx_ref)
        processed += 1
        self.stdout.write(f"{tx_ref}: {result.status} (called_provider={result.called_provider})")
      except Exception as exc:  # noqa: BLE001
        # Transient errors are expected during dev; leave pending.
        if is_transient_verification_error(exc):
          self.stdout.write(f"{tx_ref}: transient verification error; will retry later")
          continue

        self.stdout.write(f"{tx_ref}: unexpected error during reconciliation")

    self.stdout.write(
      self.style.SUCCESS(
        f"Done. processed={processed} skipped={skipped} cutoff_age_minutes={min_age_minutes}"
      )
    )
