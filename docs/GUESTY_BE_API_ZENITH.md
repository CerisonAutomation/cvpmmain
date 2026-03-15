# Guesty Booking Engine API Zenith Cheat Sheet

## Environments & Base URLs
- **Production API base**: `https://booking.guesty.com/api/`
- **Sandbox API base**: `https://booking-sandbox.guesty.com/`
- **OAuth2 token endpoint**: `https://booking.guesty.com/oauth2/token`
- **GuestyPay tokenization**: `https://pay.guesty.com/api/tokenize/v2`

## Authentication (OAuth2)
**Endpoint**: `POST https://booking.guesty.com/oauth2/token`
- `grant_type`: `client_credentials`
- `scope`: `booking_engine:api`
- `client_id`: {YOUR_CLIENT_ID}
- `client_secret`: {YOUR_CLIENT_SECRET}

**Token Lifecycle**:
- 24h lifetime.
- Cache server-side (e.g., Redis).
- Refresh ~5 min before expiry.

## Full Endpoint Surface (v2)

### Listings & Discovery
1. `GET /api/listings`: Catalogue and availability/price discovery.
2. `GET /api/listings/{listingId}`: Single listing detail.
3. `GET /api/listings/cities`: City autocomplete/search.
4. `GET /api/listings/{listingId}/calendar`: Availability calendar.
5. `GET /api/listings/{listingId}/payment-provider`: Required for Stripe tokenization.

### Quotes
6. `POST /api/reservations/quotes`: Create a price-lock snapshot (TTL 24h).
7. `GET /api/reservations/quotes/{quoteId}`: Retrieve quote details and rate plans.
8. `POST /api/reservations/quotes/{quoteId}/coupons`: Update/replace coupons in a quote.

### Reservations (The Zenith Flow)
9. `POST /api/reservations/quotes/{quoteId}/instant`: Create instant reservation.
10. `POST /api/reservations/quotes/{quoteId}/inquiry`: Create inquiry reservation.
11. `POST /api/reservations/quotes/{quoteId}/instant-charge`: Charge-first reservation variant.
12. `GET /api/reservations/{reservationId}/details`: Retrieve reservation summary.
13. `POST /api/reservations/{reservationId}/verify-payment`: Finalize 3DS/pending auth payments.

### Extra Surface
14. `GET /api/reservations/payouts/list`: Payout schedule preview.
15. `GET /api/reviews`: Multi-channel reviews.
16. `GET /api/reservations/upsell/{inquiryId}/{listingId}`: Retrieve available upsell fees.
17. `POST /api/reservations/upsell/{quoteId}`: Update upsell on a quote.
18. `PUT /api/metasearch/pointofsale/{pointofsale}`: Upsert metasearch (Google) config.
19. `GET /api/metasearch/pointofsale/{pointofsale}`: Get metasearch config.

## Implementation Guidelines
- **Idempotency**: Implement client-level idempotency for quotes and reservations.
- **Rate Limits**: 5 req/s, 275/min. Use a request queue and respect `Retry-After`.
- **Security**: Never transit raw card data. Store access tokens server-only.
- **Consistency**: Wait up to 60s for BE reservations to sync with the Open API for alterations.
