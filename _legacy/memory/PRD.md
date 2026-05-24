# Malta Stays Direct - PRD

## Original Problem Statement
Build a full-stack direct booking website for Christiano Vincenti Property Management with:
- **Guesty BEAPI** integration (canonical) for listings, calendar, quotes, coupons, reservations
- **Stripe** payment processing
- **AI-powered visual CMS Editor** (Puck-style admin)
- **Multi-step property owner inquiry forms**
- Premium UX with parallax + PWA
- **Standard WebSockets** (NO Supabase) for real-time edit collaboration
- **Leaflet / OpenStreetMap** (NO Google Maps)
- Specific white logo across header/footer/CMS
- **Mirror the live Guesty bookings flow** (malta.guestybookings.com) end-to-end

## Architecture

### Backend (FastAPI - Modular)
```
/app/backend/
├── server.py                       # Entry, Stripe webhook (instant/inquiry detect)
├── models/schemas.py               # Pydantic (CouponRequest=List[str], no AddonsRequest)
├── routes/
│   ├── booking.py                  # Listings, Quotes, Coupons (POST+DELETE), Checkout
│   ├── cms.py, admin.py, contact.py
│   ├── media.py, websocket.py
└── services/
    ├── guesty.py                   # OAuth, token cache (Mongo), 429/5xx retry+jitter, V3 helper
    └── image_service.py
```

### Frontend (React + Tailwind + Shadcn)
```
/app/frontend/src/
├── pages/
│   ├── LandingPage.jsx
│   ├── PropertiesPage.jsx          # Filter/sort + Explore Map CTA
│   ├── PropertyDetailPage.jsx      # Full Guesty breakdown + coupon + Leaflet
│   ├── CheckoutPage.jsx            # Same breakdown, no addons, ratePlanId from URL
│   ├── ConfirmationPage.jsx
│   ├── PropertyOwnersPage.jsx      # Anchor IDs (#why-us/#pricing/#services)
│   ├── MapPageLeaflet.jsx
│   └── AdminPage.jsx               # Visual block editor with lucide icons
├── components/
│   ├── PropertyCard.jsx            # Mirrors Guesty native (rating /5, desc, Book now)
│   ├── Header.jsx, Footer.jsx, SearchWidget.jsx
│   └── ui/                         # Shadcn
├── lib/
│   ├── guestyPricing.js            # buildBreakdown from invoiceItems
│   └── blocks.js                   # All CMS schemas with lucide icons
└── App.js                          # ScrollToHash for /path#anchor
```

## What's Been Implemented

### Feb 11, 2026 — Canonical Guesty Mirror (this iteration)
- **PropertyCard.jsx fully rewritten** to mirror malta.guestybookings.com:
  - Rating chip "4.85 (13 reviews)" — auto-convert from Guesty /10 to display /5
  - Description preview line-clamp-3
  - "From €X.XX / Per night / Additional charges may apply" disclaimer
  - "Book Now" gold CTA on every card (replaces "View Details")
- **PropertiesPage**: "Explore Map" CTA section at bottom routing to /map
- **PropertyDetailPage**: rate plan selector, cancellation policy chip, "I have a coupon" toggle, full Guesty breakdown (Subtotal / Fees / Subtotal before taxes / Taxes / Total — all from `money.invoiceItems`), Leaflet map (Google removed)
- **CheckoutPage**: addons UI removed entirely, ratePlanId honored from URL, breakdown identical to PropertyDetailPage
- **Backend**: `/api/quotes/{id}/coupons` POST + DELETE, simplified checkout (no addons), `/api/addons` deleted, listing/{id} no longer forwards bad params
- **Stripe webhook**: detects `listing.bookingType` and posts to `/instant` or `/inquiry`
- **services/guesty.py**: exponential backoff (429/5xx, max 3 retries + jitter), full canonical error mapping (INVALID_COUPON, COUPON_NOT_APPLICABLE, RATE_PLAN_NOT_FOUND, etc.), V3 helper
- **schemas.py**: CouponRequest.coupons is `List[str]`; AddonsRequest deleted

### Earlier Sessions
- Modular backend (routes/services/models), Mongo token cache, WebSocket integration
- Stripe checkout, AI text gen (Emergent LLM), full CMS admin
- Lucide icons in blocks.js (fixed admin createElement crash)
- Header anchor navigation (ScrollToHash) + lucide icons
- White logo applied across header/footer

## Backlog
- **P1** Optional: full canonical Stripe Elements + `ccToken` → Guesty `/instant` (so payouts route via Guesty's payment provider instead of our Stripe account). Requires Guesty admin Stripe Connect setup.
- **P2** Replace remaining `<img>` with `OptimizedImage` (WebP + lazy load via IntersectionObserver)
- **P2** Streaming `/api/ai/chat` for block generation
- **P2** Refactor 880-line `AdminPage.jsx` + per-block ErrorBoundary
- **P3** Rate-limit on our own backend (currently only Guesty rate-limit-aware)

## API Endpoints (canonical BEAPI)
- `GET /api/listings` — search with filters
- `GET /api/listings/{id}` — single listing (no checkIn/checkOut params)
- `GET /api/listings/{id}/calendar?from=&to=`
- `POST /api/quotes` — create reservation quote
- `GET /api/quotes/{id}`
- `POST /api/quotes/{id}/coupons` — apply (body: `{coupons: [code]}`)
- `DELETE /api/quotes/{id}/coupons/{code}` — remove
- `POST /api/reservations/instant/{quote_id}` / `POST /api/reservations/inquiry/{quote_id}`
- `POST /api/checkout/create-session` — Stripe Checkout
- `WS /ws` — live edit collaboration

## Environment Variables
- Backend `.env`: `MONGO_URL`, `DB_NAME`, `GUESTY_BEAPI_CLIENT_ID`, `GUESTY_BEAPI_CLIENT_SECRET`, `STRIPE_API_KEY`, `EMERGENT_LLM_KEY`
- Frontend `.env`: `REACT_APP_BACKEND_URL`

## Testing
- Backend: `/app/backend/tests/test_api.py` + `test_canonical_pricing.py`
- Frontend: Playwright via testing_agent
- Latest reports: `/app/test_reports/iteration_1.json`, `iteration_2.json`
- Canonical comparison checklist: `/app/memory/CANONICAL_COMPARISON.md`

## Credentials
- Admin key (default): `cvpm-admin-2026` — see `/app/memory/test_credentials.md`
