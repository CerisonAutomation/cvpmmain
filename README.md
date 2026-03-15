# CVPM — Cerison Vacation Property Management

> **Production-grade vacation rental booking platform** for Malta properties.  
> Vite · React 18 · TypeScript · Tailwind CSS · shadcn/ui · Supabase · Stripe · Guesty · Vercel

[![Deploy Status](https://img.shields.io/badge/deploy-vercel-black?logo=vercel)](https://vercel.com)
[![Supabase](https://img.shields.io/badge/backend-supabase-3ecf8e?logo=supabase)](https://supabase.com)
[![License](https://img.shields.io/badge/license-private-red)](#)

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Environment Variables](#environment-variables)
6. [Local Development](#local-development)
7. [Database Setup](#database-setup)
8. [Edge Functions](#edge-functions)
9. [Stripe Integration](#stripe-integration)
10. [Guesty Integration](#guesty-integration)
11. [Deployment](#deployment)
12. [Production Plan & Roadmap](#production-plan--roadmap)
13. [Known Issues & Audit Findings](#known-issues--audit-findings)
14. [Testing](#testing)
15. [Contributing](#contributing)

---

## Overview

CVPM is a direct-booking vacation rental platform for **20 Malta properties**. It replaces reliance on OTAs (Airbnb, Booking.com) with a first-party, commission-free booking engine synced bidirectionally with **Guesty PMS** and powered by **Stripe** for payment processing.

**Core user flows:**
- Guest browses properties → selects dates/guests → receives dynamic quote → pays via Stripe → reservation confirmed
- Owner portal: revenue estimates, property management pack, standards, residential services
- Admin dashboard: reservation management, property CRUD, Guesty sync status

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Vercel CDN / Edge                  │
│              Vite + React 18 SPA (PWA)               │
│  Pages: Index · Properties · PropertyDetail · Book   │
│         Owners · Admin · Contact · FAQ · About       │
└────────────────────┬────────────────────────────────┘
                     │ HTTPS
┌────────────────────▼────────────────────────────────┐
│              Supabase (BaaS)                         │
│  ┌──────────────┐  ┌──────────────────────────────┐ │
│  │  PostgreSQL  │  │     Edge Functions (Deno)    │ │
│  │  + RLS       │  │  quote · create-pending      │ │
│  │  + pgcrypto  │  │  stripe-webhook · guesty-sync│ │
│  └──────────────┘  └──────────────────────────────┘ │
└────────────────────┬────────────────────────────────┘
                     │
          ┌──────────┴──────────┐
          │                     │
   ┌──────▼──────┐     ┌───────▼───────┐
   │   Stripe    │     │  Guesty API   │
   │  Payments   │     │  PMS Sync     │
   └─────────────┘     └───────────────┘
```

### Data Flow — Booking

```
Guest selects dates
  → POST /functions/v1/quote           (calculates dynamic price)
  → POST /functions/v1/create-pending  (creates pending_reservation + Stripe PaymentIntent)
  → Stripe.js confirmPayment()         (client-side card capture)
  → POST /functions/v1/stripe-webhook  (payment_intent.succeeded → confirms reservation)
  → Email confirmation (TODO: Resend)
```

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend framework | Vite + React | 18.3.x |
| Language | TypeScript | 5.8.x |
| Styling | Tailwind CSS + shadcn/ui | 3.4.x |
| Animations | Framer Motion | 12.x |
| State / Data fetching | TanStack Query | v5 |
| Forms | React Hook Form + Zod | 7.x / 3.x |
| Backend / DB | Supabase (PostgreSQL + Edge Functions) | 2.x |
| Payments | Stripe | latest |
| PMS | Guesty Open API | v1 |
| Auth | Supabase Auth (email/magic-link) | — |
| Build pipeline | Turborepo | latest |
| Deployment | Vercel (Remote Cache enabled) | — |
| Testing | Vitest + Playwright | 3.x / 1.x |
| Package manager | Bun | latest |

---

## Project Structure

```
cvpmmain/
├── src/
│   ├── pages/              # Route-level page components
│   │   ├── Index.tsx         # Home / hero
│   │   ├── Properties.tsx    # Property listing grid
│   │   ├── PropertyDetail.tsx# Single property + booking widget
│   │   ├── Book.tsx          # Checkout + Stripe
│   │   ├── Admin.tsx         # Admin dashboard
│   │   ├── Owners.tsx        # Owner acquisition page
│   │   ├── OwnersEstimate.tsx# Revenue calculator
│   │   ├── OwnerPortalPage.tsx # Owner auth portal
│   │   └── ...               # About, Contact, FAQ, Legal
│   ├── components/         # Shared UI components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # API clients, utilities
│   ├── integrations/       # Supabase typed client
│   └── content/            # Static CMS content
├── supabase/
│   ├── functions/          # Deno edge functions
│   └── migrations/         # SQL migration files
├── public/                 # Static assets + PWA manifest
├── docs/                   # ADRs, specs, diagrams
├── .github/
│   └── workflows/
│       ├── ci.yml            # Lint · Typecheck · Test · Build (Turbo cached)
│       └── supabase.yml      # Supabase migration deploy
├── turbo.json              # Turborepo pipeline + remote cache config
├── vercel.json             # Vercel routing + security headers + CSP
├── vite.config.ts
├── tailwind.config.ts
└── vitest.config.ts
```

---

## Environment Variables

Copy `.env.example` to `.env` and populate all values before running locally.

```bash
cp .env.example .env
```

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | ✅ | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase anon/public key |
| `VITE_STRIPE_PUBLISHABLE_KEY` | ✅ | Stripe publishable key |
| `VITE_APP_URL` | ✅ | Canonical app URL (no trailing slash) |

> ⚠️ **Never commit real secrets.** Stripe secret key, Guesty credentials, and webhook secrets live **only** in Supabase Edge Function secrets — never in frontend env vars.

---

## Local Development

### Prerequisites

- [Bun](https://bun.sh) ≥ 1.1
- [Supabase CLI](https://supabase.com/docs/guides/cli) ≥ 1.200
- Node.js ≥ 20 (for tooling compatibility)

### Setup

```bash
# 1. Clone
git clone https://github.com/CerisonAutomation/cvpmmain.git
cd cvpmmain

# 2. Install dependencies
bun install

# 3. Configure environment
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from Supabase dashboard

# 4. Start Supabase locally
supabase start

# 5. Run migrations + seed
supabase db reset

# 6. Serve edge functions locally
supabase functions serve

# 7. Link Turborepo remote cache (one-time)
bunx turbo login
bunx turbo link

# 8. Start dev server
bun dev
```

App runs at `http://localhost:8080`  
Supabase Studio at `http://localhost:54323`

---

## Database Setup

### Schema Overview

| Table | Purpose |
|---|---|
| `properties` | 20 Malta vacation rental listings |
| `units` | Individual bookable units per property |
| `rate_plans` | Pricing rules (base rate, weekend multiplier, min stay) |
| `reservations` | Confirmed, paid bookings |
| `pending_reservations` | Quotes with Stripe PaymentIntent (TTL: 30 min) |
| `reservation_units` | Date ranges with `EXCLUDE USING gist` overlap prevention |
| `owner_leads` | Owner acquisition form submissions |

### Apply migrations

```bash
# Against remote Supabase project
supabase db push --db-url "$DATABASE_URL"

# Or reset local with seed data
supabase db reset
```

### RLS Policies

All tables use **Row Level Security**. Public reads are enabled on `properties`, `units`, and `rate_plans`. Write access to `reservations` and `pending_reservations` is restricted to the service role (edge functions only). Admin access requires a verified `admin` role claim in the JWT.

---

## Edge Functions

All backend logic runs as **Supabase Edge Functions** (Deno/TypeScript), deployed at:
`https://<project-ref>.supabase.co/functions/v1/<function-name>`

### Deploy

```bash
# Set secrets (one-time)
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
supabase secrets set GUESTY_BE_CLIENT_ID=xxx
supabase secrets set GUESTY_BE_CLIENT_SECRET=xxx

# Deploy all functions
supabase functions deploy quote
supabase functions deploy create-pending
supabase functions deploy stripe-webhook
```

### Function Reference

| Function | Method | Auth | Description |
|---|---|---|---|
| `quote` | POST | anon | Calculate total price for property/dates/guests |
| `create-pending` | POST | anon | Create `pending_reservation` + Stripe `PaymentIntent` |
| `stripe-webhook` | POST | webhook-sig | Handle `payment_intent.succeeded` / `payment_failed` |
| `guesty-sync` | POST | service | Pull listings from Guesty → upsert `properties` |

---

## Stripe Integration

1. Create a [Stripe account](https://stripe.com) and retrieve API keys
2. Add **publishable key** to frontend `.env` as `VITE_STRIPE_PUBLISHABLE_KEY`
3. Add **secret key** to Supabase secrets (never frontend)
4. Configure webhook in Stripe Dashboard:
   - URL: `https://<project-ref>.supabase.co/functions/v1/stripe-webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
5. Add webhook signing secret to Supabase secrets as `STRIPE_WEBHOOK_SECRET`

---

## Guesty Integration

The platform syncs property data bidirectionally with **Guesty Open API (v1)**:

- **Inbound sync** (`guesty-sync` edge function): Pulls listings, pricing, and availability from Guesty into the local `properties` and `rate_plans` tables
- **Outbound push** (TODO): On confirmed reservation, create booking in Guesty to update channel availability

Credentials use **Guesty's Business Engagement OAuth2** (client_credentials flow) — secrets stored in Supabase secrets only.

---

## Deployment

### Vercel (Frontend)

Connect the GitHub repo to Vercel for automatic preview + production deploys on push to `main`.

Required environment variables (Vercel Dashboard → Settings → Environment Variables):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `VITE_APP_URL`

Vercel automatically injects `TURBO_TOKEN` and `TURBO_TEAM` for remote caching — no manual secret setup needed.

`vercel.json` configures:
- SPA fallback routing (all routes → `index.html`)
- Security headers (HSTS, CSP, X-Frame-Options, Permissions-Policy)
- Immutable cache on `/assets/` (hashed filenames)

### Supabase (Backend)

```bash
supabase db push --db-url "$DATABASE_URL"
supabase functions deploy --all
```

---

## Production Plan & Roadmap

> Priority-ordered. P0 = blocking for live launch. P1 = required within 2 weeks. P2 = next sprint.

### 🔴 P0 — Launch Blockers

| # | Task | Area | File/Target |
|---|---|---|---|
| 1 | Remove `.env` from git history, rotate all keys | Security | `git filter-repo` + GitHub secrets |
| 2 | Add Zod validation to all API calls + form inputs | Security | `src/lib/`, `Book.tsx` |
| 3 | Add `ErrorBoundary` wrappers at App + route level | Reliability | `App.tsx` |
| 4 | Replace all `any` types with strict TypeScript | Type Safety | All `src/**/*.tsx` |
| 5 | Implement `VITE_STRIPE_PUBLISHABLE_KEY` in Book.tsx | Payments | `Book.tsx` |
| 6 | Add pending_reservation TTL cleanup (pg cron trigger) | DB | `supabase/migrations/` |
| 7 | Verify all RLS policies — no anonymous write access | Security | `supabase/migrations/` |
| 8 | Add CORS + Origin validation to all edge functions | Security | `supabase/functions/*/index.ts` |

### 🟠 P1 — Pre-Launch Polish

| # | Task | Area | Notes |
|---|---|---|---|
| 9 | Skeleton loaders on Properties, PropertyDetail, Book | UX | TanStack Query `isPending` |
| 10 | Wire Sonner toasts to all async mutations | UX | Already installed |
| 11 | Retry with exponential backoff on all Supabase calls | Reliability | `src/lib/api.ts` |
| 12 | Image optimization — WebP + lazy loading + blur placeholders | Performance | All `<img>` tags |
| 13 | Route-level code splitting (`React.lazy` + `Suspense`) | Performance | `App.tsx` routes |
| 14 | Booking confirmation email via Resend | UX | `stripe-webhook` function |
| 15 | Admin auth guard — verify JWT admin role claim | Security | `Admin.tsx` |
| 16 | WCAG 2.1 AA — ARIA labels, focus management, contrast | a11y | All components |
| 17 | `react-helmet-async` OG tags on all pages | SEO | Already installed |
| 18 | Sentry init in `main.tsx` for runtime error capture | Observability | `main.tsx` |

### 🟡 P2 — Growth Sprint

| # | Task | Area | Notes |
|---|---|---|---|
| 19 | Guesty outbound: push confirmed reservations to PMS | Integration | New edge function |
| 20 | Real-time availability calendar (Supabase Realtime) | Feature | `PropertyDetail.tsx` |
| 21 | Wishlist / favourites (localStorage → Supabase) | Feature | New hook + UI |
| 22 | Multi-language support (en/de/fr/mt) | Growth | react-i18next |
| 23 | Owner portal — live revenue dashboard with Recharts | Feature | `OwnerPortalPage.tsx` |
| 24 | Reviews & ratings system | Trust | New table + UI |
| 25 | Sitemap.xml + robots.txt generation at build time | SEO | vite plugin |
| 26 | Playwright E2E suite: full booking flow, admin CRUD | Testing | `tests/e2e/` |

### 🔵 P3 — Scale & Intelligence

| # | Task | Notes |
|---|---|---|
| 27 | Dynamic pricing AI — demand-based rate model | Supabase + Python cron |
| 28 | Upsell engine — airport transfer, experiences at checkout | New tables + checkout step |
| 29 | Property CMS (owner self-service listing edits) | Admin + Supabase Storage |
| 30 | Channel manager iCal export for Airbnb/Booking.com | Edge function |
| 31 | Marketing automation — abandoned booking re-engagement | Resend sequences |

---

## Known Issues & Audit Findings

### 🔴 Critical

- **`.env` committed to repo** — contains live credentials. **Rotate all keys immediately.** Remove from git history with `git filter-repo`.
- **No error boundaries** — any unhandled exception crashes the entire SPA.
- **Admin page has no auth gate** — `Admin.tsx` is publicly accessible.

### 🟠 High

- `any` types used extensively in API layer and page components.
- No Zod validation on `quote` and `create-pending` request bodies.
- No CSRF mitigation on edge function endpoints.
- No input sanitization on contact/owner lead forms.

### 🟡 Medium

- No skeleton loading states — layout shifts on data fetch.
- No retry logic on Supabase query failures.
- Images unoptimized (no WebP, no lazy loading).
- Missing ARIA labels throughout.
- `lucide-react` pinned at `0.462.0` — update to latest.

### 🟢 Low

- `bun.lockb` and `bun.lock` both present — delete `bun.lockb`.
- `test.txt` and `verify_cms.py` in repo root — remove before launch.
- `progress.md`, `findings.md`, `task_plan.md` should move to `docs/`.

---

## Testing

```bash
# Unit tests (Vitest)
bun test

# Watch mode
bun test:watch

# Full CI pipeline (lint + typecheck + test + build, Turbo cached)
bun run ci

# E2E tests (Playwright)
bunx playwright test

# E2E with UI
bunx playwright test --ui
```

### Test Coverage Targets

| Layer | Tool | Target |
|---|---|---|
| Unit — hooks, utils, lib | Vitest + Testing Library | 80%+ |
| Integration — page flows | Vitest + msw | 70%+ |
| E2E — full booking flow | Playwright | Critical paths 100% |
| Visual regression | Playwright screenshots | Key pages |

---

## Contributing

This is a private repository. Internal contributors should:

1. Branch from `main` using `feat/`, `fix/`, `chore/` prefixes
2. Run `bun run ci` before opening a PR (Turbo will cache unchanged tasks)
3. All PRs require passing CI and one approval
4. Reference the P0/P1/P2 task number in PR title (e.g. `fix(P0-3): replace any types in api.ts`)

---

<p align="center">Built by <a href="https://github.com/CerisonAutomation">Cerison Automation</a> · Malta 🇲🇹</p>
