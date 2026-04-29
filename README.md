# DEKNA — Children's E-Commerce Storefront

> A full-stack online storefront for children's books, toys, and gifts — built with React, TypeScript, and Django, backed by Supabase and Chapa payments.

---

## ✨ Features

- 🛍️ **Product Browsing** — Browse and filter collections (Books, Toys, Gifts) with category pages, search, and quick-view modals
- 🔐 **Authentication** — Supabase-powered sign-up / sign-in with email & password; session persistence across tabs
- 👤 **Account Management** — User profiles, multiple shipping addresses (with default), order history, and wishlists
- 🛒 **Cart & Checkout** — Multi-step checkout modal with address selection, order review, and payment initiation
- 💳 **Payment Processing** — Server-authoritative payment flow via [Chapa](https://chapa.co); amount never trusted from frontend
- 🔔 **Webhook Support** — Chapa webhook handler for asynchronous payment event reconciliation
- 🌗 **Light / Dark Theme** — Persistent theme selection with smooth transitions
- 📱 **Responsive Design** — Mobile-first layout with adaptive navigation
- 📄 **Legal Pages** — Privacy Policy, Terms of Service, Refund Policy, Returns & Refunds

---

## 🏗️ Architecture

DEKNA is split into two independently runnable services:

```
DEKNA/
├── src/                        # React frontend (Vite + TypeScript)
│   ├── components/             # UI components (Header, Cart, Checkout, Modals…)
│   ├── contexts/               # React Contexts (AuthContext, AppContext)
│   ├── hooks/                  # Custom hooks (useAuth, useTheme, useMobile…)
│   ├── pages/                  # Route-level page components
│   ├── lib/                    # Supabase client & shared utilities
│   ├── types/                  # Global TypeScript type definitions
│   └── data/                   # Static data (products, categories…)
│
└── backend/                    # Django REST API
    ├── backend/                # Django project settings, URLs, DB router
    ├── payments/               # Payment app (views, services, models, webhooks)
    ├── services/               # External service wrappers (Chapa, Supabase client)
    └── middleware/             # Supabase JWT authentication middleware
```

### Data Flow

```
Browser (React SPA)
  │── Supabase JS     ──► Supabase (Auth + Postgres DB)
  │── Django API ──────► Django REST Framework
                              │── Chapa API      (payment initiation + verification)
                              └── Supabase Admin (server-side order/payment writes)
```

The Django backend acts as a **security boundary**: it verifies Supabase JWTs, recalculates order pricing server-side, and is the only service that communicates with Chapa using secret keys.

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite 5 | Build tool & dev server |
| Tailwind CSS v3 | Utility-first styling |
| shadcn/ui (Radix UI) | Accessible component library |
| React Router v6 | Client-side routing |
| TanStack Query v5 | Server state & data fetching |
| Supabase JS v2 | Auth & realtime database client |
| React Hook Form + Zod | Forms & validation |
| Recharts | Data visualisation |
| Lucide React | Icon set |
| Sonner | Toast notifications |

### Backend

| Technology | Purpose |
|---|---|
| Django 5 | Web framework |
| Django REST Framework | REST API layer |
| Supabase (PostgreSQL) | Primary database |
| SQLite | Django internal bookkeeping only |
| Chapa | Ethiopian payment gateway |
| python-dotenv | Environment variable loading |
| psycopg2 | PostgreSQL driver |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18 and **npm** ≥ 9
- **Python** ≥ 3.11 and **pip**
- A [Supabase](https://supabase.com) project (free tier works)
- A [Chapa](https://chapa.co) merchant account and secret key

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/dekna.git
cd dekna
```

---

### 2. Frontend Setup

#### Install dependencies

```bash
npm install
```

#### Configure environment variables

Create a `.env` file in the project root:

```env
# Supabase (frontend — public keys only)
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>

# Django backend base URL
VITE_BACKEND_URL=http://127.0.0.1:8000
```

#### Start the dev server

```bash
npm run dev
```

The frontend will be available at **http://localhost:8080**.

---

### 3. Backend Setup

#### Create and activate a virtual environment

```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# macOS / Linux
python -m venv .venv
source .venv/bin/activate
```

#### Install Python dependencies

```bash
cd backend
pip install -r requirements.txt
```

#### Configure environment variables

Create a `backend/.env` file (never commit this file):

```env
# Required
DJANGO_ENV=development
CHAPA_SECRET_KEY=CHASECK_TEST-xxxxxxxxxxxxxxxxxxxx
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
SUPABASE_DB_CONNECTION_STRING=postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres

# Optional in development (defaults provided automatically)
CHAPA_CALLBACK_URL=http://127.0.0.1:8000/api/webhooks/chapa/
CHAPA_RETURN_URL=http://localhost:8080/payment-status

# Django
DJANGO_SECRET_KEY=change-me-in-production
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=127.0.0.1,localhost
```

#### Run migrations and start the server

```bash
python manage.py migrate
python manage.py runserver
```

The API will be available at **http://127.0.0.1:8000**.

---

## ⚙️ Configuration

### Frontend Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | ✅ | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous/public key |
| `VITE_BACKEND_URL` | ✅ | Base URL of the Django backend |

### Backend Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DJANGO_ENV` | ✅ | `development` or `production` |
| `CHAPA_SECRET_KEY` | ✅ | Chapa secret key (server-only) |
| `SUPABASE_URL` | ✅ | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (server-only) |
| `SUPABASE_DB_CONNECTION_STRING` | ✅ | PostgreSQL connection string for Supabase DB |
| `CHAPA_CALLBACK_URL` | ✅ (non-dev) | Webhook URL Chapa posts payment events to |
| `CHAPA_RETURN_URL` | ✅ (non-dev) | URL user is redirected to after payment |
| `DJANGO_SECRET_KEY` | ⚠️ | Django secret key (required and unique in production) |
| `DJANGO_DEBUG` | — | `True` or `False` (default: `True`) |
| `DJANGO_ALLOWED_HOSTS` | — | Comma-separated allowed host list |

> **Security note:** Never expose `SUPABASE_SERVICE_ROLE_KEY` or `CHAPA_SECRET_KEY` to the frontend or version control.

---

## 📡 API Reference

Base path: `http://127.0.0.1:8000/api/`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health/` | None | Backend health check |
| `POST` | `/api/payments/initiate/` | JWT | Initiate a Chapa payment for an order |
| `POST` | `/api/payments/verify/` | JWT | Verify a payment with Chapa (idempotent) |
| `GET` | `/api/orders/<uuid:order_id>/status/` | JWT | Get combined order + payment status |
| `POST` | `/api/webhooks/chapa/` | None (server-to-server) | Chapa payment event webhook |

All authenticated endpoints require a `Authorization: Bearer <supabase-jwt>` header. The `SupabaseJWTAuthenticationMiddleware` validates the token against Supabase before the view is reached.

---

## 🧪 Testing

### End-to-End Tests (Playwright)

Install the test browser:

```bash
npm run test:e2e:install
```

Run the E2E test suite:

```bash
npm run test:e2e
```

Test results are saved to `test-results/`.

### Linting

```bash
npm run lint
```

---

## 📜 Available Scripts

### Frontend (`package.json`)

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server on port 8080 |
| `npm run dev:clean` | Clear Vite cache and start fresh |
| `npm run build` | Production build to `dist/` |
| `npm run build:dev` | Development build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:e2e:install` | Install Playwright Chromium browser |
| `npm run clean:vite` | Remove `.vite` cache directories |

### Backend (`manage.py`)

| Command | Description |
|---|---|
| `python manage.py runserver` | Start Django development server |
| `python manage.py migrate` | Apply database migrations |
| `python manage.py makemigrations` | Generate new migration files |

---

## 🚢 Deployment

### Frontend

Build the static bundle and serve via any static host (Vercel, Netlify, Cloudflare Pages, etc.):

```bash
npm run build
# Output: dist/
```

Set all `VITE_*` variables in your host's environment/secrets panel, pointing `VITE_BACKEND_URL` at your deployed Django instance.

### Backend

1. Set `DJANGO_ENV=production` (or any value other than `development`).
2. Set `DJANGO_DEBUG=False` and configure `DJANGO_ALLOWED_HOSTS`.
3. Generate a strong, unique `DJANGO_SECRET_KEY`.
4. Provide `CHAPA_CALLBACK_URL` and `CHAPA_RETURN_URL` pointing at your production URLs.
5. Collect static files: `python manage.py collectstatic`.
6. Serve with a WSGI server such as **Gunicorn** behind a reverse proxy (NGINX/Caddy):

```bash
gunicorn backend.wsgi:application --bind 0.0.0.0:8000
```

---

## 🗄️ Database

DEKNA uses a **dual-database configuration**:

| Database | Role |
|---|---|
| **Supabase (PostgreSQL)** | All application data — users, profiles, orders, payments, addresses, wishlists |
| **SQLite** | Django's internal tables only (sessions, admin, migrations metadata) |

The `DatabaseRouter` in `backend/backend/db_router.py` transparently routes Supabase-native models to the `supabase` connection.

---

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes with clear messages.
4. Open a pull request describing what you changed and why.

Please follow the existing code style. Run `npm run lint` before submitting a pull request.

---

## 📄 License

This project is private and not currently published under an open-source license. Contact the maintainers for usage inquiries.


---

## 🧪 Testing & Development Tools

### Mock Order Testing

For testing payment flows in development, use the provided testing scripts:

#### Quick Test Orders (Recommended)
Create 10 pre-configured test orders (5 Chapa + 5 Telebirr) with varying amounts:

```bash
cd backend
python seed_test_orders.py <your-user-id>
```

This creates:
- **Chapa orders**: 50, 150, 250, 500, 1000 ETB
- **Telebirr orders**: 75, 200, 350, 750, 1500 ETB

#### Check Existing Orders
View all orders and payments for a user:

```bash
cd backend
python check_orders.py <your-user-id>
```

#### Custom Orders
Create custom mock orders with specific amounts:

```bash
cd backend
python manage.py seed_mock_orders --user-id <uuid> --count 5 --amount 250.00
```

📖 **Full documentation**: See [`backend/TESTING_MOCK_ORDERS.md`](backend/TESTING_MOCK_ORDERS.md) for complete testing guide.

---
