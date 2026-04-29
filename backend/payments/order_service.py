"""Order helpers.

Orders represent purchase intent only. They do not determine payment success.

All reads here use the Supabase service role key because:
- Django must validate ownership server-side.
- Client-provided ownership must never be trusted.

RLS still applies for regular clients; service role bypasses RLS.
"""

from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal, InvalidOperation
from typing import Any, Optional

from services.supabase_client import get_supabase_client


class OrderNotFound(RuntimeError):
  pass


class OrderOwnershipError(PermissionError):
  pass


@dataclass(frozen=True)
class OrderRecord:
  id: str
  user_id: str
  status: str
  is_mock: bool
  metadata: Optional[dict[str, Any]]


def get_order_by_id(order_id: str) -> OrderRecord:
  client = get_supabase_client()
  try:
    resp = client.table("orders").select("id,user_id,status,is_mock,metadata").eq("id", order_id).limit(1).execute()
  except Exception as exc:  # noqa: BLE001
    raise RuntimeError("Failed to read order from Supabase.") from exc

  data = getattr(resp, "data", None) or []
  if not data:
    raise OrderNotFound("Order not found.")

  row = data[0]
  metadata = row.get("metadata")
  if metadata is not None and not isinstance(metadata, dict):
    metadata = None

  return OrderRecord(
    id=row.get("id"),
    user_id=row.get("user_id"),
    status=row.get("status"),
    is_mock=bool(row.get("is_mock")),
    metadata=metadata,
  )


def require_order_owned_by_user(*, order_id: str, user_id: str) -> OrderRecord:
  order = get_order_by_id(order_id)
  if order.user_id != user_id:
    raise OrderOwnershipError("Order does not belong to the authenticated user.")
  return order
