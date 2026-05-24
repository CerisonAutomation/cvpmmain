# Migration Map — `cpmprodmainfinalbest1` → current Lovable project

Staged at `_legacy/`. **Nothing destructive has run.** This document is the gate before Phase 1.

## Stack reconciliation

| Concern | Zip | Lovable target |
|---|---|---|
| Language | JSX (JS) | **TSX (strict TS + Zod)** — convert on copy |
| Router | react-router-dom v7 | already v6 here; upgrade to v7 OK |
| State | Context (CMS/EditMode/Modal) | keep; add TanStack Query (already present) |
| HTTP | `axios` → FastAPI | replace with `supabase.functions.invoke` |
| Realtime | `socket.io-client` → FastAPI WS | **Postgres Realtime** |
| Map | Leaflet | adopt (`bun add leaflet react-leaflet`) |
| Payments | Stripe Elements | adopt (`bun add @stripe/react-stripe-js @stripe/stripe-js`) — keep existing `stripe-webhook` edge fn |
| DnD | `@hello-pangea/dnd` | adopt for builder |
| CMS DB | Mongo (zip) | `cms_pages` / new `cms_blocks_v2` |

## Backend port — FastAPI route → Edge Function

| FastAPI route (LOC) | New Edge Function | DB tables touched | Notes |
|---|---|---|---|
| `booking.py` (536) | `booking-quote`, `booking-create`, `booking-confirm` | `bookings`, existing `guesty_api_cache` | Quote via existing `guesty-proxy`; Stripe PI on create; confirm via existing `stripe-webhook` |
| `cms.py` (326) | `cms-admin` (write) — public reads go direct via RLS | existing `cms_pages`, new `cms_blocks_v2`, existing `cms_site_config` | Block model in `cms_blocks_v2` rather than JSON-in-page so realtime per-block works |
| `media.py` (101) | `media-sign` | Supabase Storage bucket `media` (new) | Replace S3-style URLs with signed Storage URLs |
| `contact.py` (59) | `contact-submit` | new `leads` (or extend existing lead capture) | Email via Resend if configured, else DB-only |
| `admin.py` (174) | `admin-metrics` | reads across `bookings`, `leads`, `cms_pages` | Admin role gate via `has_role(auth.uid(),'admin')` |
| `auth.py` (38) | n/a — Supabase Auth replaces it | `user_roles` | Wire signup → first user auto-admin trigger? (no — manual) |
| `sitemap.py` (53) | `sitemap` (public) | reads `cms_pages`, properties | Returns `application/xml` |
| `websocket.py` (284) | **dropped** — replaced by Postgres Realtime channels | n/a | `CMSContext` subscribes to `cms_blocks_v2` changes |

## DB schema delta (proposed, executed in Phase 1)

```text
bookings           id, property_id, guest_id (nullable), check_in, check_out,
                   guests, currency, total_cents, status, stripe_payment_intent_id,
                   guesty_reservation_id, payload jsonb, created_at, updated_at
                   RLS: owner can read own (guest_id); admin all; service_role insert

leads              id, kind ('contact'|'owner'|'estimate'), payload jsonb,
                   email, name, status, created_at
                   RLS: admin read/write; public insert (rate-limited via edge fn)

cms_blocks_v2      id, page_slug, position, type, data jsonb, theme jsonb,
                   created_at, updated_at
                   RLS: public read where page is published; admin write

media_assets       id, bucket, path, mime, width, height, alt, created_at
                   RLS: public read; admin write
```
Plus Storage bucket `media` (public read).

## Frontend file-by-file decision (high level)

| Zip path | Decision | Target |
|---|---|---|
| `frontend/src/pages/LandingPage.jsx` | **port → TS** | `src/pages/Index.tsx` (replace) |
| `frontend/src/pages/PropertiesPage.jsx` | port → TS | `src/pages/Properties.tsx` (replace) |
| `frontend/src/pages/PropertyDetailPage.jsx` | port → TS, merge w/ booking sidebar | `src/pages/PropertyDetail.tsx` |
| `frontend/src/pages/CheckoutPage.jsx` | port → TS | new `src/pages/Checkout.tsx` |
| `frontend/src/pages/ConfirmationPage.jsx` | port → TS | new `src/pages/Confirmation.tsx` |
| `frontend/src/pages/CmsPage.jsx` | merge with current `CmsPage` | keep current shell, adopt zip's block renderer |
| `frontend/src/pages/admin/*` + `components/admin/{BlockLibrary,ThemeEditor,AIAssistant,MediaLibrary}.jsx` | **port → TS, REPLACES** current `src/pages/BuilderPage.tsx` + `src/lib/builder/*` | `src/pages/admin/Builder.tsx` and `src/lib/builder/*` |
| `frontend/src/components/blocks/Live*.jsx` (15 blocks) | port → TS | `src/components/blocks/live/*` (sit alongside existing static blocks) |
| `frontend/src/components/{Header,Footer,SearchWidget,StickyCallToAction,...}` | port → TS | replace current equivalents |
| `frontend/src/context/{CMSContext,EditModeContext,ModalContext}` | port → TS | `src/context/*` (new dir) |
| `frontend/src/lib/api.js` | **drop** — replaced by `supabase.functions.invoke` wrapper | `src/lib/api.ts` (rewritten) |
| `frontend/src/lib/websocket.js` | **drop** — Postgres Realtime takes over | n/a |
| `frontend/src/lib/sanitize.js`, `guestyPricing.js`, `amenityIcons.js`, `analytics.js`, `i18n.js` | port → TS | `src/lib/*` |
| `frontend/src/components/ui/*` (Radix wrappers) | **drop** — current shadcn set already covers them | n/a |
| `backend/**` | already covered above — code itself is **not copied into repo** | — |

## Pass plan (execution order)

1. **Phase 1 — schema migration** (one `supabase--migration` call). Awaits your approval.
2. **Phase 2 — edge functions** (7 functions, parallel writes).
3. **Phase 3a — lib/context port** (api.ts wrapper, CMS/EditMode/Modal contexts, sanitize/pricing/analytics).
4. **Phase 3b — blocks port** (15 Live* blocks → TSX in `src/components/blocks/live/`).
5. **Phase 3c — pages port** (Landing, Properties, PropertyDetail, Checkout, Confirmation, Owners).
6. **Phase 4 — admin builder replace** (delete current `BuilderPage.tsx`+`lib/builder/*`, install new).
7. **Phase 5 — cleanup**: `bun add` new deps, delete `_legacy/`, run tests, security scan, memory refresh.

## Open decisions (defaults assumed unless you object)

- **`react-router-dom` v7 upgrade**: yes (zip ships it).
- **Block storage**: per-block rows in `cms_blocks_v2`, not JSON-in-page. Enables Realtime per-block updates and AI-assisted single-block ops.
- **Auth signup**: keep current email+password; add Google provider only if you ask.
- **Map**: Leaflet (free, OSS) over Mapbox.
- **Page Builder collision**: zip's wins; current `BuilderPage.tsx` + `src/lib/builder/*` are deleted in Phase 4.
