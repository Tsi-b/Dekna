"""
Supabase JWT verification middleware for Django.

This middleware trusts Supabase as the single authentication authority and
verifies incoming JWTs against Supabase, using the backend's service-role
credentials. It does NOT reimplement auth; it only validates tokens that
Supabase issued.

Behavior:
  - Reads Authorization header in the form: "Bearer <JWT>"
  - For protected API paths, requires a valid Supabase JWT
  - On success, attaches `request.supabase_user` with trusted user info
  - On failure, returns 401 Unauthorized for protected endpoints

Notes:
  - No cookies or Django auth models are used.
  - Tokens are never logged or exposed in responses.
"""

from __future__ import annotations

from typing import Callable, Optional

from django.http import HttpRequest, JsonResponse
from django.utils.deprecation import MiddlewareMixin

from services.supabase_client import get_supabase_client


class SupabaseJWTAuthenticationMiddleware(MiddlewareMixin):
  """
  Middleware to authenticate requests using Supabase-issued JWTs.

  Only "protected" API routes are enforced; others (such as health checks)
  pass through without requiring authentication.
  """

  # Paths under /api/ that do NOT require auth (e.g., health checks)
  PUBLIC_PATH_PREFIXES = [
    "/api/health/",
    # Webhooks are received server-to-server and must not require user auth.
    "/api/webhooks/",
  ]

  def process_request(self, request: HttpRequest):
    """
    Authenticate the request if it targets a protected API path.

    If authentication fails for a protected path, short-circuit with a 401
    response. For public paths, authentication is skipped but never blocks.
    """

    path = request.path or ""

    # Only enforce auth for /api/ paths that are not explicitly public.
    if not path.startswith("/api/"):
      # Non-API routes (e.g., admin) are left to other mechanisms.
      return None

    if any(path.startswith(prefix) for prefix in self.PUBLIC_PATH_PREFIXES):
      # Public API endpoint; no auth required.
      return None

    # Always allow CORS preflight requests through — CORS middleware handles them.
    if request.method == "OPTIONS":
      return None

    auth_header = request.headers.get("Authorization") or request.META.get("HTTP_AUTHORIZATION", "")
    token = self._extract_bearer_token(auth_header)

    if not token:
      return self._unauthorized("Authentication credentials were not provided.")

    # Verify the token with Supabase using the backend's service role client.
    client = get_supabase_client()

    try:
      # supabase-py v2 style: auth.get_user(token) verifies and returns the user.
      result = client.auth.get_user(token)
      supabase_user = getattr(result, "user", None) or getattr(result, "data", None)
    except Exception:
      # Treat any verification error as authentication failure.
      return self._unauthorized("Invalid or expired authentication token.")

    if not supabase_user:
      return self._unauthorized("Invalid or expired authentication token.")

    # Attach trusted Supabase user info to the request for downstream views.
    # Do NOT expose token or sensitive internals here.
    request.supabase_user = {
      "id": getattr(supabase_user, "id", None) or supabase_user.get("id"),
      "email": getattr(supabase_user, "email", None) or supabase_user.get("email"),
      "raw": supabase_user,
    }

    return None

  @staticmethod
  def _extract_bearer_token(auth_header: str) -> Optional[str]:
    """
    Extract the Bearer token from an Authorization header.

    Accepts headers of the form:
      - "Bearer <token>"
      - case-insensitive "bearer"
    Returns None for missing/malformed headers.
    """

    if not auth_header:
      return None

    parts = auth_header.strip().split()
    if len(parts) != 2:
      return None

    scheme, token = parts
    if scheme.lower() != "bearer":
      return None

    return token

  @staticmethod
  def _unauthorized(message: str) -> JsonResponse:
    """
    Return a 401 Unauthorized JSON response with a generic error message.
    No token contents or internal details are exposed.
    """

    return JsonResponse({"detail": message}, status=401)




