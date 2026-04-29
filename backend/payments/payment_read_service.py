"""Payment read helpers (Supabase service role).

These helpers read payment ledger data from Supabase.
They do not call providers and do not update state.
"""

from __future__ import annotations

from typing import Optional

from services.supabase_client import get_supabase_client


def get_latest_payment_status_for_order(*, user_id: str, order_id: str) -> Optional[str]:
  """Return the latest payment status for a given order and user.

  Returns None if no payment record exists.
  """

  client = get_supabase_client()
  try:
    resp = (
      client.table("payments")
      .select("status,created_at")
      .eq("user_id", user_id)
      .eq("order_id", order_id)
      .order("created_at", desc=True)
      .limit(1)
      .execute()
    )
  except Exception as exc:  # noqa: BLE001
    raise RuntimeError("Failed to read payments from Supabase.") from exc

  data = getattr(resp, "data", None) or []
  if not data:
    return None

  return str((data[0] or {}).get("status") or "")
