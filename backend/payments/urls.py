from django.urls import path

from .views import (
  health_check,
  initiate_payment,
  verify_payment,
  get_order_status,
  initiate_c2b_payment,
  newsletter_subscribe,
  newsletter_unsubscribe,
)
from .webhooks import chapa_webhook, telebirr_webhook

urlpatterns = [
  path("health/", health_check, name="health-check"),

  # ── Chapa ─────────────────────────────────────────────────────────────────
  path("payments/chapa/initiate/", initiate_payment, name="payments-chapa-initiate"),
  path("payments/chapa/verify/",   verify_payment,   name="payments-chapa-verify"),

  # ── Telebirr C2B ──────────────────────────────────────────────────────────
  path("payments/telebirr/initiate/", initiate_c2b_payment, name="payments-telebirr-initiate"),

  # ── Orders ────────────────────────────────────────────────────────────────
  path("orders/<uuid:order_id>/status/", get_order_status, name="orders-status"),

  # ── Newsletter ────────────────────────────────────────────────────────────
  path("newsletter/subscribe/", newsletter_subscribe, name="newsletter-subscribe"),
  path("newsletter/unsubscribe/", newsletter_unsubscribe, name="newsletter-unsubscribe"),

  # ── Webhooks (unauthenticated server-to-server) ───────────────────────────
  path("webhooks/chapa/",    chapa_webhook,    name="webhooks-chapa"),
  path("webhooks/telebirr/", telebirr_webhook, name="webhooks-telebirr"),

  # ── Legacy aliases (keep old paths working during transition) ─────────────
  path("payments/initiate/",     initiate_payment,    name="payments-initiate-legacy"),
  path("payments/verify/",       verify_payment,      name="payments-verify-legacy"),
  path("payments/c2b/initiate/", initiate_c2b_payment, name="payments-c2b-initiate-legacy"),
]


