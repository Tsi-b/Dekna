"""Payment helpers.

Payments are backend-authoritative and recorded in Supabase as an auditable ledger.

Rules enforced:
- A payment record (pending) is created BEFORE calling Chapa.
- Payment success is not inferred from frontend.
"""

from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal

from services.supabase_client import get_supabase_client


@dataclass(frozen=True)
class PaymentRecord:
  id: str
  user_id: str
  order_id: str
  tx_ref: str
  amount: Decimal
  currency: str
  status: str


def _row_to_payment(row: dict) -> PaymentRecord:
  return PaymentRecord(
    id=row.get("id"),
    user_id=row.get("user_id"),
    order_id=row.get("order_id"),
    tx_ref=row.get("tx_ref"),
    amount=Decimal(str(row.get("amount"))) if row.get("amount") is not None else Decimal("0"),
    currency=str(row.get("currency") or ""),
    status=str(row.get("status") or ""),
  )


def create_pending_payment(*, user_id: str, order_id: str, tx_ref: str, amount: str, currency: str) -> PaymentRecord:
  client = get_supabase_client()
  payload = {
    "user_id": user_id,
    "order_id": order_id,
    "tx_ref": tx_ref,
    "amount": amount,
    "currency": currency,
    "status": "pending",
    "provider": "chapa",
  }

  try:
    resp = client.table("payments").insert(payload).execute()
  except Exception as exc:  # noqa: BLE001
    raise RuntimeError("Failed to create payment record in Supabase.") from exc

  data = getattr(resp, "data", None) or []
  if not data:
    raise RuntimeError("Supabase insert returned no data; cannot confirm payment record.")

  return _row_to_payment(data[0])


class PaymentNotFound(RuntimeError):
  pass


class PaymentOwnershipError(PermissionError):
  pass


TERMINAL_STATUSES = {"verified", "failed", "cancelled"}


def get_payment_by_tx_ref(tx_ref: str) -> PaymentRecord:
  client = get_supabase_client()
  try:
    resp = client.table("payments").select("id,user_id,order_id,tx_ref,amount,currency,status").eq("tx_ref", tx_ref).limit(1).execute()
  except Exception as exc:  # noqa: BLE001
    raise RuntimeError("Failed to read payment from Supabase.") from exc

  data = getattr(resp, "data", None) or []
  if not data:
    raise PaymentNotFound("Payment not found.")

  return _row_to_payment(data[0])


def require_payment_owned_by_user(*, tx_ref: str, user_id: str) -> PaymentRecord:
  payment = get_payment_by_tx_ref(tx_ref)
  if payment.user_id != user_id:
    raise PaymentOwnershipError("Payment does not belong to the authenticated user.")
  return payment


def update_payment_status(*, tx_ref: str, status: str) -> PaymentRecord:
  client = get_supabase_client()
  try:
    resp = (
      client.table("payments")
      .update({"status": status})
      .eq("tx_ref", tx_ref)
      .execute()
    )
  except Exception as exc:  # noqa: BLE001
    raise RuntimeError("Failed to update payment status in Supabase.") from exc

  data = getattr(resp, "data", None) or []
  if not data:
    raise RuntimeError("Supabase update returned no data; cannot confirm payment update.")
  return _row_to_payment(data[0])


# ── Telebirr C2B ──────────────────────────────────────────────────────────────


def create_pending_c2b_payment(
  *,
  user_id: str,
  order_id: str,
  merch_order_id: str,
  amount: str,
  currency: str = "ETB",
) -> None:
  """Insert a pending Telebirr C2B payment row into Supabase.

  Must be called BEFORE the gateway pre-order request so the ledger always
  has a record of the payment intent, even if the gateway call fails.

  Uses a synthetic tx_ref of the form 'tb-{merch_order_id}' to allow
  uniform lookups via get_payment_by_tx_ref() across both providers.
  """
  client = get_supabase_client()
  payload = {
    "user_id":            user_id,
    "order_id":           order_id,
    "provider":           "telebirr",
    "tx_ref":             f"tb-{merch_order_id}",
    "c2b_merch_order_id": merch_order_id,
    "amount":             amount,
    "currency":           currency,
    "status":             "pending",
  }

  try:
    resp = client.table("payments").insert(payload).execute()
  except Exception as exc:  # noqa: BLE001
    raise RuntimeError(f"Failed to create Telebirr payment record in Supabase: {exc}") from exc

  data = getattr(resp, "data", None) or []
  if not data:
    raise RuntimeError("Supabase insert returned no data for Telebirr payment record.")
