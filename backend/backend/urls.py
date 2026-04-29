"""Root URL configuration for the Django backend.

Routing principles:
- Keep API routes modular by delegating to app-level `urls.py`.
- Provide a minimal `/api/` index endpoint for developer convenience.
- Do not expose secrets or dynamic internal details.
"""

from django.contrib import admin
from django.urls import include, path

from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(["GET"])
def api_index(_request):
  """Minimal API index.

  This is a convenience endpoint so visiting `/api/` does not 404.
  It intentionally returns only a static list of public API paths.
  """

  return Response(
    {
      "endpoints": [
        "/api/health/",
        "/api/payments/initiate/",
        "/api/payments/verify/",
        "/api/webhooks/chapa/",
      ]
    }
  )


urlpatterns = [
  path("admin/", admin.site.urls),

  # Developer-friendly API index
  path("api/", api_index, name="api-index"),

  # Actual API routes
  path("api/", include("payments.urls")),
]
