"""Telebirr C2B service layer — HTTP only.

Design mirrors services/chapa.py:
- No database reads/writes
- No Supabase calls
- No Django ORM/models
- No business logic about payment success

Only:
- Fetches a Fabric auth token from the Telebirr gateway
- Sends a pre-order request (signed with SHA256withRSA)
- Assembles and returns the signed H5 checkout URL

Upstream layers (views/business services) are responsible for:
- Validating inputs before calling this service
- Persisting pending payment records
- Determining and updating payment state after callback/webhook
"""
from __future__ import annotations

import json
import time
import uuid
from base64 import b64decode, b64encode
from dataclasses import dataclass

import requests
import urllib3
from Crypto.Hash import SHA256
from Crypto.PublicKey import RSA
from Crypto.Signature import pss
from django.conf import settings

# Suppress SSL warnings for the self-signed Telebirr gateway cert.
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


# ── Normalised results ────────────────────────────────────────────────────────


@dataclass(frozen=True)
class TelebirrPreorderResult:
    prepay_id: str
    checkout_url: str


# ── Normalised errors ─────────────────────────────────────────────────────────


class TelebirrServiceError(RuntimeError):
    """Base error for all Telebirr failures."""


class TelebirrNetworkError(TelebirrServiceError):
    """Network / timeout / DNS errors contacting the gateway."""


class TelebirrProviderError(TelebirrServiceError):
    """Non-2xx response or unexpected payload from the gateway."""


# ── Internal helpers ──────────────────────────────────────────────────────────


def _nonce() -> str:
    return str(uuid.uuid1())


def _timestamp() -> str:
    return str(int(time.time()))


def _merch_order_id() -> str:
    return str(int(time.time()))


def _sign(params: dict) -> str:
    """SHA256withRSA signature over the canonical parameter string."""
    EXCLUDE = {"sign", "sign_type", "header", "refund_info", "openType", "raw_request"}
    parts: list[str] = []
    for k, v in params.items():
        if k in EXCLUDE:
            continue
        if k == "biz_content" and isinstance(v, dict):
            parts.extend(f"{ck}={cv}" for ck, cv in v.items())
        else:
            parts.append(f"{k}={v}")
    parts.sort()
    input_str = "&".join(parts)

    key_bytes = b64decode(settings.C2B_PRIVATE_KEY_PEM.encode("utf-8"))
    rsa_key   = RSA.import_key(key_bytes)
    digest    = SHA256.new(input_str.encode("utf-8"))
    sig       = pss.new(rsa_key).sign(digest)
    return b64encode(sig).decode("utf-8")


def _mock_preorder(merch_order_id: str, order_id: str | None = None) -> TelebirrPreorderResult:
    """Return a fake result without contacting the gateway.

    Only called when DJANGO_ENV=development AND C2B_MOCK_ENABLED=true.
    The checkout_url points to a mock payment page that simulates the Telebirr
    gateway interface, allowing developers to test success/failure/cancel flows.
    """
    fake_prepay_id = f"MOCK-{merch_order_id}"
    
    # Build mock payment page URL with all necessary parameters
    params = f"mock=1&prepay_id={fake_prepay_id}&merch_order_id={merch_order_id}"
    if order_id:
        params += f"&order_id={order_id}"
    
    # Point to mock payment page instead of directly to payment-status
    mock_payment_url = "http://localhost:8080/mock-telebirr-payment"
    checkout_url = f"{mock_payment_url}?{params}"
    
    return TelebirrPreorderResult(prepay_id=fake_prepay_id, checkout_url=checkout_url)


# ── Public API ────────────────────────────────────────────────────────────────


def get_fabric_token(*, timeout: int = 20) -> str:
    """Fetch a short-lived Fabric auth token from the Telebirr gateway."""
    url = f"{settings.C2B_BASE_URL}/payment/v1/token"
    headers = {
        "Content-Type": "application/json",
        "X-APP-Key":    settings.C2B_FABRIC_APP_ID,
    }
    payload = {"appSecret": settings.C2B_APP_SECRET}

    try:
        resp = requests.post(url, json=payload, headers=headers, verify=False, timeout=timeout)
    except Exception as exc:
        raise TelebirrNetworkError(
            f"Failed to contact Telebirr gateway (token): {type(exc).__name__}: {exc}"
        ) from exc

    if resp.status_code >= 400:
        raise TelebirrProviderError(
            f"Telebirr gateway rejected the token request: HTTP {resp.status_code} — {resp.text[:300]}"
        )

    try:
        token = resp.json()["token"]
    except Exception as exc:
        raise TelebirrProviderError(
            f"Telebirr gateway returned an unexpected token response: {resp.text[:300]}"
        ) from exc

    if not token or not isinstance(token, str):
        raise TelebirrProviderError("Telebirr gateway did not return a valid token.")

    return token


def create_preorder(
    *,
    title: str,
    amount: str,
    merch_order_id: str | None = None,
    order_id: str | None = None,
    timeout: int = 20,
) -> TelebirrPreorderResult:
    """Create a Telebirr pre-order and return the assembled H5 checkout URL.

    In development with C2B_MOCK_ENABLED=true, skips the real gateway and
    returns a mock result so the flow can be tested without network access.
    
    Args:
        title: Payment title shown to the user
        amount: Payment amount in ETB
        merch_order_id: Merchant order ID (auto-generated if not provided)
        order_id: Optional order ID to include in mock return URL for dev testing
        timeout: Request timeout in seconds
    """
    merch_order_id = merch_order_id or _merch_order_id()

    # ── Dev mock bypass ───────────────────────────────────────────────────────
    if settings.DJANGO_ENV == "development" and settings.C2B_MOCK_ENABLED:
        return _mock_preorder(merch_order_id, order_id=order_id)

    fabric_token = get_fabric_token(timeout=timeout)

    biz: dict = {
        "notify_url":            settings.C2B_NOTIFY_URL,
        "appid":                 settings.C2B_MERCHANT_APP_ID,
        "merch_code":            settings.C2B_MERCHANT_CODE,
        "merch_order_id":        merch_order_id,
        "trade_type":            "Checkout",
        "title":                 title,
        "total_amount":          amount,
        "trans_currency":        "ETB",
        "timeout_express":       "120m",
        "business_type":         "BuyGoods",
        "payee_identifier":      settings.C2B_MERCHANT_CODE,
        "payee_identifier_type": "04",
        "payee_type":            "5000",
        "redirect_url":          settings.C2B_RETURN_URL,
        "callback_info":         "DEKNA web checkout",
    }

    req: dict = {
        "nonce_str":   _nonce(),
        "method":      "payment.preorder",
        "timestamp":   _timestamp(),
        "version":     "1.0",
        "biz_content": biz,
        "sign_type":   "SHA256withRSA",
    }
    req["sign"] = _sign(req)

    headers = {
        "Content-Type":  "application/json",
        "X-APP-Key":     settings.C2B_FABRIC_APP_ID,
        "Authorization": fabric_token,
    }

    url = f"{settings.C2B_BASE_URL}/payment/v1/merchant/preOrder"
    try:
        resp = requests.post(url, data=json.dumps(req), headers=headers, verify=False, timeout=timeout)
    except Exception as exc:
        raise TelebirrNetworkError(
            f"Failed to contact Telebirr gateway (preorder): {type(exc).__name__}: {exc}"
        ) from exc

    if resp.status_code >= 400:
        raise TelebirrProviderError(
            f"Telebirr gateway rejected the pre-order request: HTTP {resp.status_code} — {resp.text[:300]}"
        )

    try:
        prepay_id = resp.json()["biz_content"]["prepay_id"]
    except Exception as exc:
        raise TelebirrProviderError(
            f"Telebirr gateway returned an unexpected pre-order response: {resp.text[:300]}"
        ) from exc

    if not prepay_id or not isinstance(prepay_id, str):
        raise TelebirrProviderError("Telebirr gateway did not return a valid prepay_id.")

    return TelebirrPreorderResult(prepay_id=prepay_id, checkout_url=_build_checkout_url(prepay_id))


def _build_checkout_url(prepay_id: str) -> str:
    """Assemble the signed raw-request query string for the H5 checkout page."""
    maps: dict = {
        "appid":      settings.C2B_MERCHANT_APP_ID,
        "merch_code": settings.C2B_MERCHANT_CODE,
        "nonce_str":  _nonce(),
        "prepay_id":  prepay_id,
        "timestamp":  _timestamp(),
        "sign_type":  "SHA256WithRSA",
    }
    raw  = "&".join(f"{k}={v}" for k, v in maps.items())
    sign = _sign(maps)
    raw += f"&sign={sign}&version=1.0&trade_type=Checkout"
    return f"{settings.C2B_BASE_URL}/payment/toCSCashierPage?{raw}"
