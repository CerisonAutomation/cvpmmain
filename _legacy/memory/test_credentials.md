# Test Credentials

## Admin / CMS Editor
- URL: `/admin`
- Admin Key: `cvpm-admin-2026`
- This is the default seeded key in CMSContext.jsx. Login screen pre-hints the default.
- Stored in localStorage as `cvpm_admin_key` after first successful login.

## Backend Guesty BEAPI
- Configured in `/app/backend/.env` via `GUESTY_BEAPI_CLIENT_ID` and `GUESTY_BEAPI_CLIENT_SECRET`.
- Token caching via MongoDB.

## Stripe (test mode)
- Configured in `/app/backend/.env` via `STRIPE_API_KEY` and `STRIPE_PUBLISHABLE_KEY`.

## No user accounts
- No public end-user auth (guests book without account).
- No JWT/Emergent Auth required for current scope.
