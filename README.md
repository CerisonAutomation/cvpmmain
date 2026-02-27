# CVPM Main - Vacation Rental Booking Platform

Production-ready booking platform with Supabase, Guesty, and Stripe integration.

## Quick Deploy

### 1. Supabase Setup

```bash
# Create Supabase project and get credentials
# Run the migration with seed data
supabase db push --db-url $DATABASE_URL
```

### 2. Deploy Edge Functions

```bash
# Set secrets
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
supabase secrets set GUESTY_BE_CLIENT_ID=your_guesty_client_id
supabase secrets set GUESTY_BE_CLIENT_SECRET=your_guesty_client_secret

# Deploy functions
supabase functions deploy quote
supabase functions deploy create-pending
supabase functions deploy stripe-webhook
```

### 3. Configure Stripe

1. Create Stripe account
2. Get API keys from Stripe Dashboard
3. Set webhook URL: `https://your-project.supabase.co/functions/v1/stripe-webhook`
4. Add webhook events: `payment_intent.succeeded`, `payment_intent.payment_failed`

### 4. Deploy Frontend

```bash
# Deploy to Vercel
npm run build
vercel deploy --prod
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |

## Features

- ✅ Dynamic property data from PostgreSQL (not hardcoded)
- ✅ Real-time availability checking
- ✅ Dynamic pricing with weekend multipliers
- ✅ Double-booking prevention (PostgreSQL exclusion constraints)
- ✅ Stripe payment integration
- ✅ Guesty API sync ready
- ✅ PWA offline support
- ✅ 20 Malta properties pre-seeded

## Tech Stack

- **Frontend**: Vite + React + TypeScript + Tailwind
- **Backend**: Supabase Edge Functions (Deno)
- **Database**: PostgreSQL with RLS
- **Payments**: Stripe
- **PMS**: Guesty API
- **Deployment**: Vercel

## Database Schema

- `properties` - 20 Malta vacation rentals
- `units` - Property units
- `rate_plans` - Pricing rules (weekend rates)
- `reservations` - Confirmed bookings
- `pending_reservations` - Quotes awaiting payment
- `reservation_units` - Booking date ranges (overlap-protected)

## API Endpoints

| Function | Purpose |
|----------|---------|
| `quote` | Calculate dynamic pricing |
| `create-pending` | Create booking + Stripe PaymentIntent |
| `stripe-webhook` | Confirm reservation after payment |
