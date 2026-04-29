"""Chapa service layer (HTTP only).

This module is the single boundary for all communication with Chapa's API.

Non-negotiable separation of concerns:
- No database reads/writes
- No Supabase calls
- No Django ORM/models
- No business logic about whether a payment is "successful"

It only:
- Sends HTTP requests to Chapa (via `requests`)
- Injects the Chapa secret key via Authorization header
- Normalizes responses and errors into predictable structures

Upstream layers (views/business services) are responsible for:
- Validating inputs before calling this service
- Persisting intent/ledger records
- Determining and updating payment state after verification
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Optional

import requests
from django.conf import settings


CHAPA_BASE_URL = "https://api.chapa.co/v1"


# -----------------------------
# Normalized results
# -----------------------------


@dataclass(frozen=True)
class ChapaInitializeResult:
  tx_ref: str
  checkout_url: str


@dataclass(frozen=True)
class ChapaVerifyResult:
  # The transaction reference used when initializing.
  tx_ref: str

  # Provider-reported transaction fields (best-effort; may be None).
  status: Optional[str]
  amount: Optional[str]
  currency: Optional[str]
  charge: Optional[str]


# -----------------------------
# Normalized errors
# -----------------------------


class ChapaServiceError(RuntimeError):
  """Base error for all Chapa service failures.

  Message is safe to surface upstream (no secrets or raw provider payloads).
  """


class ChapaNetworkError(ChapaServiceError):
  """Network/timeout/DNS errors contacting Chapa."""


class ChapaProviderError(ChapaServiceError):
  """Chapa returned a non-2xx response or an unexpected payload."""


# -----------------------------
# Internal helpers
# -----------------------------


def _headers() -> dict[str, str]:
  # Secret key is loaded via environment and exposed through Django settings.
  # Never log this value.
  return {
    "Authorization": f"Bearer {settings.CHAPA_SECRET_KEY}",
    "Content-Type": "application/json",
  }


def _parse_json(resp: requests.Response) -> dict[str, Any]:
  try:
    data = resp.json()
  except Exception as exc:  # noqa: BLE001
    raise ChapaProviderError("Payment provider returned an invalid response.") from exc

  if not isinstance(data, dict):
    raise ChapaProviderError("Payment provider returned an invalid response.")

  return data


# -----------------------------
# Public API
# -----------------------------


def initialize_transaction(*, amount: str, currency: str, email: str, tx_ref: str, callback_url: str, return_url: str, timeout_seconds: int = 20) -> ChapaInitializeResult:
  """Initialize a transaction with Chapa.

  Inputs MUST be backend-validated before calling this method.
  This method does not persist anything.

  Chapa endpoint: POST /transaction/initialize
  """

  payload = {
    "amount": amount,
    "currency": currency,
    "email": email,
    "tx_ref": tx_ref,
    "callback_url": callback_url,
    "return_url": return_url,
  }

  try:
    resp = requests.post(
      f"{CHAPA_BASE_URL}/transaction/initialize",
      json=payload,
      headers=_headers(),
      timeout=timeout_seconds,
    )
  except Exception as exc:  # noqa: BLE001
    raise ChapaNetworkError("Failed to contact payment provider.") from exc

  if resp.status_code >= 400:
    # Development-only: surface provider error message to speed up integration.
    # Never include secrets (we don't log headers), and keep output concise.
    if getattr(settings, "DJANGO_ENV", None) == "development":
      try:
        provider_payload = resp.json()
      except Exception:  # noqa: BLE001
        provider_payload = {"message": resp.text[:500] if resp.text else ""}

      provider_message = (
        (provider_payload or {}).get("message")
        or ((provider_payload or {}).get("data") or {}).get("message")
        or "Payment provider rejected initialization request."
      )
      raise ChapaProviderError(f"Payment provider rejected initialization request: {provider_message}")

    raise ChapaProviderError("Payment provider rejected initialization request.")

  data = _parse_json(resp)
  checkout_url = (((data.get("data") or {}) if isinstance(data.get("data"), dict) else {}).get("checkout_url"))

  if not checkout_url or not isinstance(checkout_url, str):
    raise ChapaProviderError("Payment provider did not return a checkout URL.")

  return ChapaInitializeResult(tx_ref=tx_ref, checkout_url=checkout_url)


def verify_transaction(*, tx_ref: str, timeout_seconds: int = 20) -> ChapaVerifyResult:
  """Verify a transaction with Chapa.

  This method does not update any payment state.

  Chapa endpoint: GET /transaction/verify/{tx_ref}
  """

  try:
    resp = requests.get(
      f"{CHAPA_BASE_URL}/transaction/verify/{tx_ref}",
      headers=_headers(),
      timeout=timeout_seconds,
    )
  except Exception as exc:  # noqa: BLE001
    raise ChapaNetworkError("Failed to contact payment provider.") from exc

  if resp.status_code >= 400:
    raise ChapaProviderError("Payment provider rejected verification request.")

  data = _parse_json(resp)

  provider_data = data.get("data")
  if not isinstance(provider_data, dict):
    # Chapa typically nests verification fields in `data`.
    provider_data = {}

  # Normalize common fields. Keep them optional because provider payloads vary.
  status = provider_data.get("status")
  amount = provider_data.get("amount")
  currency = provider_data.get("currency")
  charge = provider_data.get("charge")

  return ChapaVerifyResult(
    tx_ref=tx_ref,
    status=str(status) if status is not None else None,
    amount=str(amount) if amount is not None else None,
    currency=str(currency) if currency is not None else None,
    charge=str(charge) if charge is not None else None,
  )
