/**
 * Guesty Proxy — REQUEST validation schemas (Zod for Deno)
 *
 * These schemas validate data coming FROM the browser before it touches Guesty.
 * They are the security boundary: unknown/tampered params are rejected with 400
 * before any Guesty API call is made.
 *
 * OWASP input validation: https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
 */
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

// ── Allowed actions (allowlist — any other value → 400) ────────────────────
export const ActionSchema = z.enum([
  "listings",
  "listing",
  "calendar",
  "cities",
  "reviews",
  "rate-plans",
  "payment-provider",
  "upsell-fees",
  "quote",
  "quote-get",
  "instant-booking",
]);

// ── Primitive reusables ────────────────────────────────────────────────────

/** Guesty IDs: MongoDB ObjectID-ish — alphanumeric, 1-120 chars */
export const IdSchema = z
  .string()
  .trim()
  .min(1, "ID cannot be empty")
  .max(120, "ID too long")
  .regex(/^[\w\-]+$/, "ID contains invalid characters");

/** YYYY-MM-DD strict date */
export const IsoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD");

// ── listings (GET) ─────────────────────────────────────────────────────────
/**
 * Triggered when: useListings(params) mounts, or its params queryKey changes.
 * Common triggers:
 *  - /properties page loads (all listings, no filters)
 *  - User types in search box (search param changes)
 *  - User picks a city from the city filter dropdown
 *  - User applies bedroom/guest/price filters
 *  - User sorts by price or rating
 */
export const ListingsParamsSchema = z.object({
  minOccupancy: z.coerce.number().int().positive().max(50).optional(),
  minBedrooms:  z.coerce.number().int().nonnegative().max(20).optional(),
  minBathrooms: z.coerce.number().nonnegative().max(20).optional(),
  propertyType: z.enum([
    'APARTMENT', 'HOUSE', 'VILLA', 'CONDOMINIUM', 'STUDIO',
    'LOFT', 'CABIN', 'TOWNHOUSE', 'BUNGALOW', 'OTHER',
  ]).optional(),
  amenities:    z.string().trim().max(500).optional(),
  city:         z.string().trim().min(1).max(120).optional(),
  minPrice:     z.coerce.number().nonnegative().max(100_000).optional(),
  maxPrice:     z.coerce.number().nonnegative().max(100_000).optional(),
  sort:         z.enum(["price", "rating"]).optional(),
  search:       z.string().trim().max(120).optional(),
});

// ── listing (GET) ──────────────────────────────────────────────────────────
/**
 * Triggered when:
 *  - /properties/:id page loads (useListing(id))
 *  - User hovers a property card (usePrefetchListing)
 *  - Book.tsx mounts with a listingId search param
 */
export const ListingParamsSchema = z.object({
  id: IdSchema,
});

// ── calendar (GET) ─────────────────────────────────────────────────────────
/**
 * Triggered when:
 *  - Property detail page mounts and useListingCalendar(id, from, to) has all 3 values
 *  - User moves the date range picker (from/to change → new queryKey → new fetch)
 */
export const CalendarParamsSchema = z.object({
  id:   IdSchema,
  from: IsoDateSchema,
  to:   IsoDateSchema,
}).refine(
  ({ from, to }) => from <= to,
  { message: "'from' must be on or before 'to'", path: ["from"] }
);

// ── cities (GET) ───────────────────────────────────────────────────────────
/**
 * Triggered when:
 *  - Any component calling useCities() mounts (typically search/filter UI)
 *  - staleTime is 24 h so this fires at most once per day per isolate
 */
// No params — no schema needed.

// ── reviews (GET) ──────────────────────────────────────────────────────────
/**
 * Triggered when:
 *  - Homepage testimonials section mounts (no listingId, limit ~6)
 *  - Property detail page mounts (listingId set)
 */
export const ReviewsParamsSchema = z.object({
  listingId: IdSchema.optional(),
  limit:     z.coerce.number().int().positive().max(100).optional(),
});

// ── rate-plans / payment-provider / upsell-fees (GET) ─────────────────────
/**
 * rate-plans triggered when:
 *  - Property detail page mounts (useRatePlans(listingId))
 *  - staleTime 30 min; only fires once per listing per session
 *
 * payment-provider triggered when:
 *  - Book.tsx mounts with listingId (usePaymentProvider(listingId))
 *  - Needed before Stripe element can be configured
 *
 * upsell-fees triggered when:
 *  - Book.tsx mounts with listingId (useUpsellFees(listingId))
 *  - Displayed in the booking form BEFORE the submit/Stripe button
 */
export const SingleIdParamsSchema = z.object({
  id: IdSchema,
});

// ── quote (POST) ───────────────────────────────────────────────────────────
/**
 * Triggered when:
 *  - User clicks "Check availability" / "Book now" on a property detail page
 *  - useCreateQuote().mutate(params) is called
 *  - NOT triggered on page load — user-initiated only
 */
export const QuoteBodySchema = z.object({
  listingId:            IdSchema,
  checkInDateLocalized:  IsoDateSchema,
  checkOutDateLocalized: IsoDateSchema,
  guestsCount:          z.number().int().positive().max(50),
  ratePlanId:           IdSchema.optional(),
  coupon:               z.string().trim().max(80).optional(),
}).refine(
  ({ checkInDateLocalized, checkOutDateLocalized }) =>
    checkInDateLocalized < checkOutDateLocalized,
  { message: "checkOut must be after checkIn", path: ["checkOutDateLocalized"] }
);

// ── quote-get (GET) ────────────────────────────────────────────────────────
/**
 * Triggered when:
 *  - Book.tsx mounts with ?quoteId= in the URL (useQuote(quoteId))
 *  - staleTime is 2 min; re-fetches if user stays on the page >2 min
 */
export const QuoteGetParamsSchema = z.object({
  quoteId: IdSchema,
});

// ── instant-booking (POST) ─────────────────────────────────────────────────
/**
 * Triggered when:
 *  - User submits the booking form on Book.tsx (handleSubmit → bookingMutation.mutate)
 *  - Only fires after react-hook-form + zod validation on the frontend passes
 *  - This is the final write operation that creates the Guesty reservation
 */
export const InstantBookingSchema = z.object({
  quoteId: IdSchema,
  guest: z.object({
    firstName: z.string().trim().min(1).max(50),
    lastName:  z.string().trim().min(1).max(50),
    email:     z.string().trim().email().max(255),
    phone:     z.string().trim().min(7).max(25),
  }),
  payment: z.object({
    token: z.string().trim().min(1).max(500),
  }).optional(),
});
