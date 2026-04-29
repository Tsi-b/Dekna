"""Webhook handlers.

Chapa webhooks are unauthenticated server-to-server callbacks.
We must:
- Always return HTTP 200 (event received)
- Never trust webhook payload amounts/currency/status
- Verify with Chapa via services.chapa before mutating authoritative state
- Be fully idempotent

No frontend context is used.
"""

from __future__ import annotations

from typing import Any, Optional

from django.http import HttpRequest
from rest_framework.decorators import api_view
from rest_framework.response import Response

from services.chapa import ChapaServiceError

from .payment_service import (
  TERMINAL_STATUSES,
  PaymentNotFound,
  get_payment_by_tx_ref,
)
from .verification_processor import verify_and_reconcile_by_tx_ref


def _extract_tx_ref(payload: Any) -> Optional[str]:
  """Best-effort extraction of tx_ref from a Chapa webhook payload."""

  if not isinstance(payload, dict):
    return None

  # Direct key (common in GET query params: ?trx_ref=...)
  if isinstance(payload.get("trx_ref"), str):
    return payload["trx_ref"]
  
  # Also check tx_ref variant
  if isinstance(payload.get("tx_ref"), str):
    return payload["tx_ref"]

  # Nested in data object (POST webhooks)
  data = payload.get("data")
  if isinstance(data, dict) and isinstance(data.get("tx_ref"), str):
    return data["tx_ref"]

  # Some providers nest differently; keep minimal.
  return None

@api_view(["GET", "POST"])
def chapa_webhook(request: HttpRequest):
  """Receive Chapa webhook events.

  Critical behavior:
  - No authentication.
  - Always returns 200.
  - Never creates payments.
  - Verifies with Chapa if payment is pending.
  - Accepts both GET (JSONP callback) and POST (standard webhook).
  """

  # Always acknowledge receipt.
  def ack() -> Response:
    return Response({"received": True}, status=200)

  # Parse payload safely from either GET params or POST body.
  try:
    if request.method == "GET":
      # Chapa sends GET requests with query parameters (JSONP style)
      payload = dict(request.GET.items())
    else:
      # Standard POST webhook
      payload = request.data
  except Exception:  # noqa: BLE001
    return ack()

  tx_ref = _extract_tx_ref(payload)
  if not tx_ref:
    return ack()

  # 3) Match existing payment by tx_ref.
  try:
    payment = get_payment_by_tx_ref(tx_ref)
  except PaymentNotFound:
    # Do not create payments from webhook.
    return ack()
  except Exception:
    return ack()

  # 4) Idempotency: already terminal => no processing.
  if payment.status in TERMINAL_STATUSES:
    return ack()

  # 5/6/7) Verify + update authoritatively (shared processor)
  try:
    verify_and_reconcile_by_tx_ref(tx_ref=tx_ref)
  except ChapaServiceError:
    # Provider temporary error; ack anyway to avoid retries storm.
    return ack()
  except Exception:
    return ack()

  return ack()


@api_view(["POST"])
def telebirr_webhook(request: HttpRequest):
  """Receive Telebirr C2B async payment-completion callbacks.

  Critical behaviour (mirrors chapa_webhook rules):
  - No authentication (server-to-server; IP allow-list in production).
  - Always returns HTTP 200 so Telebirr stops retrying.
  - Never creates payment records (only payment_service may do that).
  - Fully idempotent: skips processing if already in a terminal state.

  Telebirr posts a JSON body with at minimum:
    { "trade_status": "TRADE_SUCCESS" | "TRADE_FAIL", "merch_order_id": "..." }
  """
  from services.supabase_client import get_supabase_client as _get_client

  def ack() -> Response:
    return Response({"received": True}, status=200)

  try:
    payload = request.data
  except Exception:  # noqa: BLE001
    return ack()

  if not isinstance(payload, dict):
    return ack()

  trade_status   = payload.get("trade_status")
  merch_order_id = payload.get("merch_order_id")

  if not merch_order_id:
    return ack()

  client = _get_client()

  # Locate matching payment row by merchant order ID.
  try:
    resp = (
      client.table("payments")
      .select("id, order_id, status")
      .eq("c2b_merch_order_id", str(merch_order_id))
      .limit(1)
      .execute()
    )
    rows = getattr(resp, "data", None) or []
  except Exception:  # noqa: BLE001
    return ack()

  if not rows:
    return ack()

  payment = rows[0]

  # Idempotency: do not reprocess terminal payments.
  if payment.get("status") in TERMINAL_STATUSES:
    return ack()

  new_payment_status = "verified" if trade_status == "TRADE_SUCCESS" else "failed"
  new_order_status   = "paid"     if trade_status == "TRADE_SUCCESS" else "payment_failed"

  try:
    client.table("payments").update({"status": new_payment_status}).eq("id", payment["id"]).execute()
    client.table("orders").update({"status": new_order_status}).eq("id", payment["order_id"]).execute()
  except Exception:  # noqa: BLE001
    return ack()

  return ack()
