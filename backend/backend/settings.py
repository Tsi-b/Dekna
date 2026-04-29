import os
from pathlib import Path

from django.core.exceptions import ImproperlyConfigured
from dotenv import load_dotenv

# Base directory of the Django backend project
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from backend/.env if present.
# In production, prefer real environment variables managed by the host.
env_path = BASE_DIR / ".env"
if env_path.exists():
  load_dotenv(env_path)


# ---------------------------------------------------------------------------
# Critical environment validation
# ---------------------------------------------------------------------------

REQUIRED_ENV_VARS = [
  "CHAPA_SECRET_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_URL",
  "SUPABASE_DB_CONNECTION_STRING",
  "DJANGO_ENV",
]

missing_vars = [name for name in REQUIRED_ENV_VARS if not os.getenv(name)]
if missing_vars:
  # Fail fast and loudly if any required configuration is missing.
  raise ImproperlyConfigured(
    "Missing required environment variables for backend configuration: "
    f"{', '.join(missing_vars)}. "
    "These are required for secure communication with Chapa and Supabase."
  )


# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "dev-not-secure-change-me")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv("DJANGO_DEBUG", "True").lower() == "true"

ALLOWED_HOSTS: list[str] = os.getenv("DJANGO_ALLOWED_HOSTS", "127.0.0.1,localhost").split(",")


# Application definition

INSTALLED_APPS = [
  "django.contrib.admin",
  "django.contrib.auth",
  "django.contrib.contenttypes",
  "django.contrib.sessions",
  "django.contrib.messages",
  "django.contrib.staticfiles",
  # Third-party
  "corsheaders",
  "rest_framework",
  # Local apps
  "payments",
]

MIDDLEWARE = [
  "django.middleware.security.SecurityMiddleware",
  "corsheaders.middleware.CorsMiddleware",  # Must be before CommonMiddleware
  "django.contrib.sessions.middleware.SessionMiddleware",
  "django.middleware.common.CommonMiddleware",
  "django.middleware.csrf.CsrfViewMiddleware",
  "django.contrib.auth.middleware.AuthenticationMiddleware",
  "django.contrib.messages.middleware.MessageMiddleware",
  "django.middleware.clickjacking.XFrameOptionsMiddleware",
  # Supabase JWT verification for protected API endpoints
  "middleware.supabase_auth.SupabaseJWTAuthenticationMiddleware",
]

# Route Supabase-managed app migrations to the Supabase database.
DATABASE_ROUTERS = [
  "backend.db_router.DatabaseRouter",
]

ROOT_URLCONF = "backend.urls"

TEMPLATES = [
  {
    "BACKEND": "django.template.backends.django.DjangoTemplates",
    "DIRS": [],
    "APP_DIRS": True,
    "OPTIONS": {
      "context_processors": [
        "django.template.context_processors.debug",
        "django.template.context_processors.request",
        "django.contrib.auth.context_processors.auth",
        "django.contrib.messages.context_processors.messages",
      ],
    },
  },
]

WSGI_APPLICATION = "backend.wsgi.application"



# Database
# Default SQLite DB for Django's own bookkeeping.
# Supabase database is configured separately for migration purposes.
DATABASES = {
  "default": {
    "ENGINE": "django.db.backends.sqlite3",
    "NAME": BASE_DIR / "db.sqlite3",
  },
  "supabase": {
    "ENGINE": "django.db.backends.postgresql",
    "NAME": os.getenv("SUPABASE_DB_NAME", "postgres"),
    "USER": os.getenv("SUPABASE_DB_USER", "postgres"),
    "PASSWORD": os.getenv("SUPABASE_DB_PASSWORD", ""),
    "HOST": os.getenv("SUPABASE_DB_HOST", ""),
    "PORT": os.getenv("SUPABASE_DB_PORT", "5432"),
    "OPTIONS": {
      "sslmode": "require",
    },
  },
}

# If SUPABASE_DB_CONNECTION_STRING is provided, parse it instead of individual vars.
# Connection string format: postgresql://user:password@host:port/dbname
db_connection_string = os.getenv("SUPABASE_DB_CONNECTION_STRING")
if db_connection_string:
  from urllib.parse import urlparse
  parsed = urlparse(db_connection_string)
  DATABASES["supabase"].update({
    "NAME": parsed.path[1:] if parsed.path else "postgres",  # Remove leading /
    "USER": parsed.username or "postgres",
    "PASSWORD": parsed.password or "",
    "HOST": parsed.hostname or "",
    "PORT": str(parsed.port) if parsed.port else "5432",
  })


# Password validation
AUTH_PASSWORD_VALIDATORS = [
  {
    "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
  },
  {
    "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
  },
  {
    "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
  },
  {
    "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
  },
]


# Internationalization
LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"


DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# Django REST Framework configuration
REST_FRAMEWORK = {
  "DEFAULT_AUTHENTICATION_CLASSES": [],
  "DEFAULT_PERMISSION_CLASSES": [
    "rest_framework.permissions.AllowAny",
  ],
}


# Backend-only configuration for future integrations (Chapa, Supabase, etc.).
# These are intentionally NOT exposed to the frontend and must be provided via
# environment variables or backend/.env (in development).
CHAPA_SECRET_KEY = os.environ["CHAPA_SECRET_KEY"]
SUPABASE_SERVICE_ROLE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
SUPABASE_URL = os.environ["SUPABASE_URL"]
DJANGO_ENV = os.environ["DJANGO_ENV"]

# Chapa redirect configuration (not secret, but must be server-controlled).
# In production-like environments, these must be explicitly configured.
CHAPA_CALLBACK_URL = os.getenv("CHAPA_CALLBACK_URL")
CHAPA_RETURN_URL = os.getenv("CHAPA_RETURN_URL")

if DJANGO_ENV != "development":
  if not CHAPA_CALLBACK_URL or not CHAPA_RETURN_URL:
    raise ImproperlyConfigured(
      "Missing required environment variables for payment redirects: "
      "CHAPA_CALLBACK_URL and CHAPA_RETURN_URL must be set outside development."
    )
else:
  # Safe defaults for local development only.
  CHAPA_CALLBACK_URL = CHAPA_CALLBACK_URL or "http://localhost:8000/api/payments/chapa/callback"
  CHAPA_RETURN_URL = CHAPA_RETURN_URL or "http://localhost:5173/payment/return"


# ── Telebirr C2B ─────────────────────────────────────────────────────────────
# All values must be provided via environment variables or backend/.env.
# Never hard-code credentials here.
C2B_BASE_URL        = os.getenv("C2B_BASE_URL", "https://196.188.120.3:38443/apiaccess/payment/gateway")
C2B_FABRIC_APP_ID   = os.getenv("C2B_FABRIC_APP_ID", "")
C2B_APP_SECRET      = os.getenv("C2B_APP_SECRET", "")
C2B_MERCHANT_APP_ID = os.getenv("C2B_MERCHANT_APP_ID", "")
C2B_MERCHANT_CODE   = os.getenv("C2B_MERCHANT_CODE", "")
C2B_PRIVATE_KEY_PEM = os.getenv("C2B_PRIVATE_KEY_PEM", "")  # base64-encoded RSA private key
C2B_NOTIFY_URL      = os.getenv("C2B_NOTIFY_URL", "http://localhost:8000/api/webhooks/telebirr/")
C2B_RETURN_URL      = os.getenv("C2B_RETURN_URL", "http://localhost:8080/payment-status")

# In development, set C2B_MOCK_ENABLED=true in backend/.env to bypass the
# real Telebirr gateway (useful when the gateway IP is unreachable locally).
C2B_MOCK_ENABLED = os.getenv("C2B_MOCK_ENABLED", "false").lower() == "true"

# ── CORS ─────────────────────────────────────────────────────────────────────
# In development allow the Vite dev server. In production set CORS_ALLOWED_ORIGINS
# via environment variable (comma-separated list of origins).
_cors_origins_env = os.getenv("CORS_ALLOWED_ORIGINS", "")
if _cors_origins_env:
  CORS_ALLOWED_ORIGINS = [o.strip() for o in _cors_origins_env.split(",") if o.strip()]
elif DJANGO_ENV == "development":
  CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:8080",
    "http://localhost:8081",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:8081",
  ]
else:
  CORS_ALLOWED_ORIGINS = []

CORS_ALLOW_CREDENTIALS = True

# Validate required C2B credentials.
# In development: print a warning so the server starts without credentials.
# In production:  fail fast — the endpoint cannot function without them.
_C2B_REQUIRED_VARS = [
  "C2B_FABRIC_APP_ID",
  "C2B_APP_SECRET",
  "C2B_MERCHANT_APP_ID",
  "C2B_MERCHANT_CODE",
  "C2B_PRIVATE_KEY_PEM",
]
_c2b_missing = [v for v in _C2B_REQUIRED_VARS if not os.getenv(v)]
if _c2b_missing:
  if DJANGO_ENV == "development":
    import warnings
    warnings.warn(
      "Telebirr C2B credentials not set: "
      f"{', '.join(_c2b_missing)}. "
      "The /api/payments/c2b/initiate/ endpoint will fail at runtime. "
      "Add them to backend/.env when ready.",
      stacklevel=2,
    )
  else:
    raise ImproperlyConfigured(
      "Missing required Telebirr C2B environment variables: "
      f"{', '.join(_c2b_missing)}. "
      "Add them to your production environment."
    )
