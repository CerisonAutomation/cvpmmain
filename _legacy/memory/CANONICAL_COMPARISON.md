## Booking-Flow Canonical Comparison vs. malta.guestybookings.com

Snapshot date: Feb 11, 2026

### Listings page (/properties vs /en/properties)

| Element | Guesty Native | Our Implementation |
|---|---|---|
| Search bar (dates + guests + search) | Top of page | ✓ `SearchWidget compact` in header |
| Filter row (Property type, Amenities, Bedrooms, Bathrooms + Apply) | Below search | ✓ Sticky filter bar + Sheet (mobile) |
| Sort dropdown | Right side | ✓ 5 options (Recommended, Price low/high, Rating, Bedrooms) |
| Property count | "20 properties" | ✓ "20 properties available" |
| Card thumbnail | Top of card | ✓ aspect-[4/3] image with property type badge |
| Card title (linked) | Bold large | ✓ Playfair Display, gold hover |
| Card rating + reviews ("4.85 (13 reviews)") | /5 scale | ✓ Auto-convert /10 → /5, rounded to 0.05 |
| Card location | "Valletta, Malta" | ✓ MapPin + locationText |
| Card description preview | line-clamp-3 truncation | ✓ publicDescription.summary line-clamp-3 |
| Card capacity (Guests/Beds/Baths) | Icon row | ✓ Users/Bed/Bath icons |
| Card "From €X Per night" | Bold price | ✓ Playfair gold "€X.XX" + "From" + "Per night" |
| Card "Additional charges may apply" | Tiny disclaimer | ✓ text-[10px] muted disclaimer |
| Card "Book now" button | Primary CTA | ✓ Gold button on every card |
| Footer "Explore Map" section | Bottom of page | ✓ MapPin CTA → /map route |
| View mode toggle (Grid/List) | Not in Guesty | + Bonus: our addition |
| Compact dates filter | Built into search | ✓ inside SearchWidget |

### Property detail page (/property/:id vs /en/properties/:id)

| Element | Guesty Native | Our Implementation |
|---|---|---|
| Photo gallery (hero) | Carousel/grid | ✓ Image gallery component |
| Title | Large | ✓ Playfair Display |
| Location | City, country | ✓ |
| Description | Long-form | ✓ publicDescription.summary |
| Amenities by category | Grouped | ✓ AMENITY_CATEGORIES |
| Map (Location) | Embedded | ✓ Leaflet + OSM marker |
| Booking widget — Price/night | "€X /night" | ✓ Dynamic from quote.subtotal/nights |
| Booking widget — Check-in/out | Date picker | ✓ shadcn Calendar in popover |
| Booking widget — Guests | Counter | ✓ +/- buttons |
| Booking widget — Rate plan selector | When multiple plans | ✓ Renders only when ratePlans.length > 1 |
| Booking widget — Cancellation badge | "Moderate cancellation" | ✓ describeCancellationPolicy() |
| Booking widget — "I have a coupon" | Toggle | ✓ POST /quotes/{id}/coupons + DELETE |
| Booking widget — Subtotal | "Subtotal (N nights)" | ✓ from money.fareAccommodation |
| Booking widget — Fees breakdown | Cleaning + Payment Processing | ✓ All non-tax invoiceItems |
| Booking widget — Subtotal before taxes | money.subTotalPrice | ✓ |
| Booking widget — Taxes (VAT + Eco Tax) | Individual lines | ✓ All TAX type invoiceItems |
| Booking widget — Total | money.hostPayout | ✓ |
| Book Now button | Adapts to bookingType | ✓ "Book Now" vs "Request to Book" |

### Checkout page

| Element | Guesty Native | Our Implementation |
|---|---|---|
| Guest info form (first/last/email/phone) | Required | ✓ react-hook-form with validation |
| Special requests | Textarea | ✓ |
| Full Guesty breakdown | Subtotal → Fees → Taxes → Total | ✓ same component as PropertyDetailPage |
| Cancellation policy | Listed | ✓ describeCancellationPolicy() |
| Hardcoded eco-tax notice | NOT shown | ✓ REMOVED |
| Hardcoded add-ons | NOT shown | ✓ REMOVED (cot/highchair/etc.) |
| Payment | Card via Guesty processor | ⚠ Stripe Checkout (our account) — see Note below |

### Backend canonical adherence

| Item | Guesty Spec | Our Implementation |
|---|---|---|
| BEAPI endpoints | booking.guesty.com/api/* | ✓ All canonical paths |
| OAuth client_credentials | 24h token, max 3 renewals/24h | ✓ MongoDB token cache with stampede protection |
| Rate limiting (5/s, 275/min, 16500/hr) | Backoff on 429 | ✓ Exponential + jitter, max 3 retries |
| Token error handling | 401 → refresh + retry | ✓ Token cache invalidation |
| `/listings` search | With filters | ✓ All filters forwarded |
| `/listings/{id}` | No checkIn/checkOut params | ✓ FIXED (was forwarding them) |
| `/listings/{id}/calendar` | from/to params | ✓ |
| `/reservations/quotes` | POST with listing/dates/guests | ✓ |
| `/reservations/quotes/{id}` | GET | ✓ |
| `/reservations/quotes/{id}/coupons` | POST list, DELETE single | ✓ Both routes |
| `/reservations/quotes/{id}/instant` | Create reservation | ✓ |
| `/reservations/quotes/{id}/inquiry` | Request to book | ✓ |
| Stripe webhook → reservation finalization | Detects bookingType | ✓ Falls back to /inquiry if listing requires it |
| Error code mapping | INVALID_COUPON, LISTING_NOT_AVAILABLE, etc. | ✓ Full mapping + Guesty fallback message |

### Notes / Open canonical items
- **Payment routing**: Today we use our own Stripe Checkout, then create the Guesty reservation server-side via webhook (no ccToken). For full canonical, would need Stripe Elements (or GuestyPay JS SDK) configured with Guesty's payment provider keys → pass `ccToken` to `/instant`. This requires Guesty admin Stripe Connect setup.
- **V3 availability-pricing**: doc mentions V3 at `/api/availability-pricing/api/v3/...` but probe returned 404 for this BEAPI account. The V1 deprecation in the doc refers to the Open API at `api.guesty.com`, not BEAPI at `booking.guesty.com` — our BEAPI paths are canonical and stable.

### File map
- `/app/frontend/src/components/PropertyCard.jsx` — rating chip + description + Book now + Additional charges
- `/app/frontend/src/pages/PropertiesPage.jsx` — Explore Map CTA at bottom
- `/app/frontend/src/pages/PropertyDetailPage.jsx` — Guesty-style breakdown + coupon + rate plans + Leaflet map
- `/app/frontend/src/pages/CheckoutPage.jsx` — same breakdown + no addons + ratePlanId from URL
- `/app/frontend/src/lib/guestyPricing.js` — buildBreakdown, formatMoney, describeCancellationPolicy
- `/app/backend/services/guesty.py` — retry/backoff, V3 helper, full error map
- `/app/backend/routes/booking.py` — coupons (POST list + DELETE), no addons
- `/app/backend/server.py` — webhook with instant/inquiry detection
