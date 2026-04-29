"""Order write helpers (Supabase service role).

Orders are stored in Supabase and protected by RLS for normal clients.
Backend writes use the service role key.

This module contains ONLY persistence helpers for orders.
"""

from __future__ import annotations

from services.supabase_client import get_supabase_client


def update_order_status(*, order_id: str, status: str) -> dict:
  client = get_supabase_client()
  try:
    resp = client.table("orders").update({"status": status}).eq("id", order_id).execute()
  except Exception as exc:  # noqa: BLE001
    raise RuntimeError("Failed to update order status in Supabase.") from exc

  data = getattr(resp, "data", None) or []
  if not data:
    raise RuntimeError("Supabase update returned no data; cannot confirm order update.")

  return data[0]
