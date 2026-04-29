"""Shared payment verification processor.

This module centralizes the authoritative verification algorithm so it is not
duplicated across endpoints (user-triggered verify and webhook processing).

STEP 12 additions:
- Development-only attempt tracking & retry caps.

Non-negotiable rules:
- Uses Chapa service layer for provider verification.
- Uses Supabase service role for all writes.
- Never transitions terminal payments.
- Does not alter webhook behavior (webhook still returns 200 always).
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
from typing import Literal, Optional

from django.conf import settings

from services.chapa import ChapaNetworkError, ChapaProviderError, ChapaServiceError, verify_transaction

from .order_write_service import update_order_status
from .payment_service import (
  TERMINAL_STATUSES,
  PaymentRecord,
  PaymentNotFound,
  get_payment_by_tx_ref,
  update_payment_status,
)


FinalStatus = Literal["verified", "failed", "cancelled", "pending"]


@dataclass(frozen=True)
class VerificationResult:
  status: FinalStatus
  # True if we performed a network call to Chapa.
  called_provider: bool


MAX_DEV_VERIFICATION_ATTEMPTS = 3


def _now_utc() -> datetime:
  return datetime.now(timezone.utc)


def _quantize_2dp(value: Decimal) -> Decimal:
  return value.quantize(Decimal("0.01"))


def _parse_amount_2dp(raw: Optional[str]) -> Optional[Decimal]:
  if raw is None:
    return None
  try:
    return Decimal(str(raw)).quantize(Decimal("0.01"))
  except (InvalidOperation, ValueError):
    return None


def _is_dev() -> bool:
  return getattr(settings, "DJANGO_ENV", None) == "development"


def _record_dev_attempt(tx_ref: str) -> None:
  """Increment attempt count + set last attempt timestamp (development only).

  This is best-effort and must never break verification.
  """

  if not _is_dev():
    return

  from services.supabase_client import get_supabase_client

  client = get_supabase_client()
  try:
    # Use SQL expression to avoid read-modify-write races.
    # PostgREST supports `verification_attempts` update with a literal value only;
    # for development, we accept best-effort by reading current values.
    current = client.table("payments").select("verification_attempts").eq("tx_ref", tx_ref).limit(1).execute()
    data = getattr(current, "data", None) or []
    attempts = int((data[0] or {}).get("verification_attempts") or 0) if data else 0

    client.table("payments").update(
      {
        "verification_attempts": attempts + 1,
        "last_verification_attempt_at": _now_utc().isoformat(),
      }
    ).eq("tx_ref", tx_ref).execute()
  except Exception:
    # Never fail verification because tracking failed.
    return


def _get_dev_attempts(tx_ref: str) -> int:
  if not _is_dev():
    return 0

  from services.supabase_client import get_supabase_client

  client = get_supabase_client()
  try:
    resp = client.table("payments").select("verification_attempts").eq("tx_ref", tx_ref).limit(1).execute()
    data = getattr(resp, "data", None) or []
    if not data:
      return 0
    return int((data[0] or {}).get("verification_attempts") or 0)
  except Exception:
    return 0


def verify_and_reconcile_by_tx_ref(*, tx_ref: str) -> VerificationResult:
  """Authoritatively verify a payment by tx_ref.

  Behavior:
  - If payment is terminal: returns current state (no provider call).
  - If pending:
      - (dev only) enforce max attempt cap
      - record attempt (dev only)
      - call Chapa verify
      - validate status/amount/currency
      - update payment status
      - update order status

  Raises:
  - PaymentNotFound if payment doesn't exist.
  - RuntimeError for unexpected persistence failures.
  """

  payment: PaymentRecord = get_payment_by_tx_ref(tx_ref)

  if payment.status in TERMINAL_STATUSES:
    return VerificationResult(status=payment.status, called_provider=False)

  if _is_dev():
    attempts = _get_dev_attempts(tx_ref)
    if attempts >= MAX_DEV_VERIFICATION_ATTEMPTS:
      # Do not attempt further; keep pending.
      return VerificationResult(status=payment.status, called_provider=False)

    _record_dev_attempt(tx_ref)

  # Call provider
  verified = verify_transaction(tx_ref=tx_ref)

  chapa_status = (verified.status or "").lower().strip()
  chapa_currency = (verified.currency or "").upper().strip()
  chapa_amount = _parse_amount_2dp(verified.amount)

  is_success = chapa_status in {"success", "successful", "paid"}
  amount_ok = chapa_amount is not None and _quantize_2dp(payment.amount) == chapa_amount
  currency_ok = chapa_currency and chapa_currency == payment.currency.upper().strip()

  final_payment_status: FinalStatus = "verified" if (is_success and amount_ok and currency_ok) else "failed"

  updated = update_payment_status(tx_ref=tx_ref, status=final_payment_status)

  order_status = "paid" if final_payment_status == "verified" else "payment_failed"
  try:
    update_order_status(order_id=payment.order_id, status=order_status)
  except Exception:
    # Best-effort consistency: do not leave verified payment without order update.
    if final_payment_status == "verified":
      update_payment_status(tx_ref=tx_ref, status="failed")
      final_payment_status = "failed"

  return VerificationResult(status=final_payment_status, called_provider=True)


def is_transient_verification_error(exc: Exception) -> bool:
  """Determine whether a verification error is likely transient.

  Used for dev-only retry/reconciliation.
  """

  return isinstance(exc, (ChapaNetworkError, ChapaProviderError))
