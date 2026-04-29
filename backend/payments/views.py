from __future__ import annotations

import logging
import time
import uuid

from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response

from services.chapa import (
  ChapaServiceError,
  initialize_transaction,
)
from services.telebirr import (
  TelebirrServiceError,
  create_preorder as telebirr_create_preorder,
)
from .order_service import OrderNotFound, OrderOwnershipError, require_order_owned_by_user
from .payment_service import (
  PaymentNotFound,
  PaymentOwnershipError,
  create_pending_payment,
  create_pending_c2b_payment,
  require_payment_owned_by_user,
)
from .pricing_service import OrderPricingError, calculate_payable_amount
from .verification_processor import verify_and_reconcile_by_tx_ref
from .newsletter_service import (
  subscribe_email,
  unsubscribe_email,
  InvalidEmailError,
  DuplicateSubscriptionError,
  NewsletterServiceError,
)
from .serializers import HealthSerializer
from .serializers_payments import (
  PaymentInitiateRequestSerializer,
  PaymentInitiateResponseSerializer,
  PaymentVerifyRequestSerializer,
  PaymentVerifyResponseSerializer,
)
from .serializers_orders import OrderStatusResponseSerializer
from .payment_read_service import get_latest_payment_status_for_order

logger = logging.getLogger(__name__)


@api_view(["GET"])
def health_check(request):
  """Simple health check endpoint to verify the backend is running."""

  serializer = HealthSerializer({"status": "ok"})
  return Response(serializer.data, status=200)


@api_view(["POST"])
def initiate_payment(request):
  """Initiate a payment for an existing order.

  Flow (backend-authoritative):
  1) Validate request payload.
  2) Fetch order from Supabase and require it belongs to the authenticated user.
  3) If the order is a mock order, require DJANGO_ENV=development.
  4) Create a *pending* payment ledger record in Supabase BEFORE calling Chapa.
  5) Initialize the transaction with Chapa and return the provider checkout URL.

  Notes:
  - Orders represent purchase intent only.
  - Payment success is determined later via backend verification (not implemented here).
  """

  user = getattr(request, "supabase_user", None) or {}
  user_id = user.get("id")
  email = user.get("email")
  if not user_id or not email:
    # Middleware should prevent this, but fail safe.
    return Response({"detail": "Authentication required."}, status=401)

  req_ser = PaymentInitiateRequestSerializer(data=request.data)
  req_ser.is_valid(raise_exception=True)
  order_id = str(req_ser.validated_data["order_id"])

  try:
    order = require_order_owned_by_user(order_id=order_id, user_id=user_id)
  except OrderNotFound:
    return Response({"detail": "Order not found."}, status=404)
  except OrderOwnershipError:
    # Avoid leaking order existence for other users.
    return Response({"detail": "Order not found."}, status=404)

  if order.is_mock and settings.DJANGO_ENV != "development":
    return Response({"detail": "Mock orders are disabled in this environment."}, status=403)

  # 4) Server-side pricing (do not trust frontend)
  try:
    payable = calculate_payable_amount(order)
  except OrderPricingError as exc:
    return Response({"detail": str(exc)}, status=400)

  tx_ref = f"tx-{uuid.uuid4()}"

  # 5) Record payment intent in Supabase before calling provider.
  try:
    create_pending_payment(
      user_id=user_id,
      order_id=order_id,
      tx_ref=tx_ref,
      amount=str(payable.amount),
      currency=payable.currency,
    )
  except Exception as exc:
    logger.error("Failed to create pending payment for order %s: %s", order_id, exc)
    return Response({"detail": "Failed to create payment record."}, status=500)

  # 6) Call provider via service boundary
  try:
    # Construct return URL with order_id and tx_ref for frontend tracking
    return_url_with_params = f"{settings.CHAPA_RETURN_URL}?order_id={order_id}&tx_ref={tx_ref}"
    
    result = initialize_transaction(
      amount=str(payable.amount),
      currency=payable.currency,
      email=email,
      tx_ref=tx_ref,
      callback_url=settings.CHAPA_CALLBACK_URL,
      return_url=return_url_with_params,
    )
  except ChapaServiceError as exc:
    logger.error("Chapa initialization failed for tx_ref %s: %s", tx_ref, exc)
    # Keep message safe and generic.
    return Response({"detail": str(exc)}, status=502)

  # 7) Minimal response
  resp_ser = PaymentInitiateResponseSerializer({"checkout_url": result.checkout_url})
  return Response(resp_ser.data, status=200)


@api_view(["GET"])
def get_order_status(request, order_id: str):
  """Get backend-derived order + payment status for an order.

  Contract:
  - Authenticated (Supabase JWT middleware)
  - Path param: order_id
  - Response: { order_status, payment_status }

  Security:
  - Validates the order exists and belongs to request.supabase_user['id'].
  - Does NOT expose tx_ref or any provider metadata.
  """

  user = getattr(request, "supabase_user", None) or {}
  user_id = user.get("id")
  if not user_id:
    return Response({"detail": "Authentication required."}, status=401)

  try:
    order = require_order_owned_by_user(order_id=str(order_id), user_id=user_id)
  except OrderNotFound:
    return Response({"detail": "Order not found."}, status=404)
  except OrderOwnershipError:
    return Response({"detail": "Order not found."}, status=404)

  payment_status = get_latest_payment_status_for_order(user_id=user_id, order_id=str(order_id))
  if not payment_status:
    payment_status = "pending"

  resp_ser = OrderStatusResponseSerializer({"order_status": order.status, "payment_status": payment_status})
  return Response(resp_ser.data, status=200)


@api_view(["POST"])
def verify_payment(request):
  """Verify an existing payment with Chapa (backend-authoritative).

  Contract:
  - Input: tx_ref only (strict)
  - Output: final backend-derived status only

  Idempotency:
  - If payment is already in a terminal state, do NOT call Chapa again.

  Validation:
  - Chapa status must indicate success
  - Chapa amount must EXACTLY equal stored payment amount
  - Chapa currency must EXACTLY equal stored payment currency

  Writes:
  - Update payment status (verified/failed)
  - Update related order status (paid/payment_failed)
  """

  user = getattr(request, "supabase_user", None) or {}
  user_id = user.get("id")
  if not user_id:
    return Response({"detail": "Authentication required."}, status=401)

  req_ser = PaymentVerifyRequestSerializer(data=request.data)
  req_ser.is_valid(raise_exception=True)
  tx_ref = req_ser.validated_data["tx_ref"]

  try:
    payment = require_payment_owned_by_user(tx_ref=tx_ref, user_id=user_id)
  except PaymentNotFound:
    return Response({"detail": "Payment not found."}, status=404)
  except PaymentOwnershipError:
    # Avoid leaking existence.
    return Response({"detail": "Payment not found."}, status=404)

  # Authoritative verification via shared processor
  try:
    result = verify_and_reconcile_by_tx_ref(tx_ref=tx_ref)
  except ChapaServiceError as exc:
    return Response({"detail": str(exc)}, status=502)
  except Exception:
    return Response({"detail": "Verification failed."}, status=500)

  resp_ser = PaymentVerifyResponseSerializer({"status": result.status})
  return Response(resp_ser.data, status=200)


@api_view(["POST"])
def initiate_c2b_payment(request):
  """Initiate a Telebirr C2B checkout for an existing order.

  Flow (backend-authoritative):
  1) Validate request payload: { order_id }.
  2) Fetch order from Supabase and assert it belongs to the authenticated user.
  3) Optionally block mock orders outside development.
  4) Recalculate payable amount server-side (never trust frontend).
  5) Write a *pending* Telebirr payment row to Supabase BEFORE calling the gateway.
  6) Call Telebirr gateway → receive signed H5 checkout URL.
  7) Return { checkout_url } to the frontend for browser redirect.

  Notes:
  - Completely separate from Chapa; neither service touches the other.
  - Uses the same Supabase JWT middleware for authentication.
  - Uses the existing PaymentInitiateRequestSerializer (same shape: { order_id }).
  - Uses the existing PaymentInitiateResponseSerializer (same shape: { checkout_url }).
  """

  user    = getattr(request, "supabase_user", None) or {}
  user_id = user.get("id")
  email   = user.get("email")
  if not user_id or not email:
    return Response({"detail": "Authentication required."}, status=401)

  req_ser = PaymentInitiateRequestSerializer(data=request.data)
  req_ser.is_valid(raise_exception=True)
  order_id = str(req_ser.validated_data["order_id"])

  try:
    order = require_order_owned_by_user(order_id=order_id, user_id=user_id)
  except OrderNotFound:
    return Response({"detail": "Order not found."}, status=404)
  except OrderOwnershipError:
    return Response({"detail": "Order not found."}, status=404)

  if order.is_mock and settings.DJANGO_ENV != "development":
    return Response({"detail": "Mock orders are disabled in this environment."}, status=403)

  try:
    payable = calculate_payable_amount(order)
  except OrderPricingError as exc:
    return Response({"detail": str(exc)}, status=400)

  merch_order_id = str(int(time.time()))

  # 5) Record payment intent BEFORE calling gateway (idempotency anchor).
  create_pending_c2b_payment(
    user_id=user_id,
    order_id=order_id,
    merch_order_id=merch_order_id,
    amount=str(payable.amount),
    currency=payable.currency,
  )

  # 6) Call Telebirr gateway.
  try:
    result = telebirr_create_preorder(
      title=f"DEKNA Order {order_id[:8]}",
      amount=str(payable.amount),
      merch_order_id=merch_order_id,
      order_id=order_id,  # Pass order_id for mock return URL
    )
  except TelebirrServiceError as exc:
    logger.error("Telebirr gateway error for order %s: %s", order_id, exc)
    return Response({"detail": str(exc)}, status=502)

  # 7) Return signed H5 checkout URL.
  resp_ser = PaymentInitiateResponseSerializer({"checkout_url": result.checkout_url})
  return Response(resp_ser.data, status=200)



# ── Newsletter Subscription ───────────────────────────────────────────────────


@api_view(["POST"])
def newsletter_subscribe(request):
  """Subscribe an email to the newsletter.

  Public endpoint (no authentication required).
  Validates email format and prevents duplicates.

  Request body:
    {
      "email": "user@example.com",
      "source": "homepage" (optional)
    }

  Response:
    {
      "success": true,
      "message": "Successfully subscribed to newsletter",
      "email": "user@example.com"
    }
  """
  email = request.data.get('email', '').strip()
  source = request.data.get('source', 'homepage')

  if not email:
    return Response({"detail": "Email is required."}, status=400)

  try:
    result = subscribe_email(email=email, source=source)
    return Response(result, status=201)

  except InvalidEmailError as e:
    return Response({"detail": str(e)}, status=400)

  except DuplicateSubscriptionError as e:
    return Response({"detail": "This email is already subscribed to our newsletter."}, status=409)

  except NewsletterServiceError as e:
    logger.error(f"Newsletter subscription error: {e}")
    return Response({"detail": "Failed to subscribe. Please try again later."}, status=500)


@api_view(["POST"])
def newsletter_unsubscribe(request):
  """Unsubscribe from newsletter using token.

  Public endpoint (no authentication required).

  Request body:
    {
      "token": "unsubscribe_token_here"
    }

  Response:
    {
      "success": true,
      "message": "Successfully unsubscribed from newsletter",
      "email": "user@example.com"
    }
  """
  token = request.data.get('token', '').strip()

  if not token:
    return Response({"detail": "Unsubscribe token is required."}, status=400)

  try:
    result = unsubscribe_email(token=token)
    return Response(result, status=200)

  except NewsletterServiceError as e:
    return Response({"detail": str(e)}, status=400)
