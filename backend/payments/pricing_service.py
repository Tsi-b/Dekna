"""Order pricing (server-side).

STEP 9 requires backend-only amount calculation.

This module derives a payable amount/currency from backend-owned order data.
It does not call payment providers and does not write to the database.

Current implementation:
- Reads `amount` and `currency` from the order's stored `metadata`.
  This keeps frontend untrusted and makes the backend the single source.

Expected metadata shape (flexible):
{
  "amount": "100.00",
  "currency": "ETB"
}

If these are missing/invalid, payment initiation must fail.
"""

from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal, InvalidOperation

from .order_service import OrderRecord


class OrderPricingError(ValueError):
  """Raised when the backend cannot derive a valid payable amount from the order."""


@dataclass(frozen=True)
class PayableAmount:
  amount: Decimal
  currency: str


def calculate_payable_amount(order: OrderRecord) -> PayableAmount:
  metadata = order.metadata or {}

  raw_amount = metadata.get("amount")
  raw_currency = metadata.get("currency")

  if raw_amount is None or raw_currency is None:
    raise OrderPricingError("Order pricing is missing.")

  try:
    amount = Decimal(str(raw_amount))
  except (InvalidOperation, ValueError) as exc:
    raise OrderPricingError("Order amount is invalid.") from exc

  if amount < 0:
    raise OrderPricingError("Order amount must be non-negative.")

  currency = str(raw_currency).upper().strip()
  if not currency or len(currency) > 10:
    raise OrderPricingError("Order currency is invalid.")

  # Optional: enforce 2 decimal places max to align with payments table.
  quantized = amount.quantize(Decimal("0.01"))

  return PayableAmount(amount=quantized, currency=currency)
