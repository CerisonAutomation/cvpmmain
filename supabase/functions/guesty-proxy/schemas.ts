/**
 * Guesty Proxy — REQUEST validation schemas (Zod for Deno)
 *
 * These schemas validate data coming FROM the browser before it touches Guesty.
 * They are the security boundary: unknown/tampered params are rejected with 400
 * before any Guesty API call is made.
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
  "quote-coupons",
  "instant-booking",
  "inquiry-booking",
  "instant-charge",
  "reservation-details",
  "verify-payment",
  "payouts",
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
export const ListingsParamsSchema = z.object({
  minOccupancy: z.coerce.number().int().positive().max(50).optional(),
  minBedrooms:  z.coerce.number().int().nonnegative().max(20).optional(),
  minBathrooms: z.coerce.number().nonnegative().max(20).optional(),
  propertyType: z.enum([
    "APARTMENT", "HOUSE", "VILLA", "CONDOMINIUM", "STUDIO",
    "LOFT", "CABIN", "TOWNHOUSE", "BUNGALOW", "OTHER",
  ]).optional(),
  amenities: z.string().trim().max(500).optional(),
  city:      z.string().trim().min(1).max(120).optional(),
  minPrice:  z.coerce.number().nonnegative().max(100_000).optional(),
  maxPrice:  z.coerce.number().nonnegative().max(100_000).optional(),
  sort:      z.enum(["price", "rating"]).optional(),
  search:    z.string().trim().max(120).optional(),
});

// ── listing (GET) ──────────────────────────────────────────────────────────
export const ListingParamsSchema = z.object({ id: IdSchema });

// ── calendar (GET) ─────────────────────────────────────────────────────────
export const CalendarParamsSchema = z
  .object({ id: IdSchema, from: IsoDateSchema, to: IsoDateSchema })
  .refine(({ from, to }) => from <= to, {
    message: "'from' must be on or before 'to'",
    path: ["from"],
  });

// ── reviews (GET) ──────────────────────────────────────────────────────────
export const ReviewsParamsSchema = z.object({
  listingId: IdSchema.optional(),
  limit:     z.coerce.number().int().positive().max(100).optional(),
});

// ── rate-plans / payment-provider / upsell-fees (GET) ─────────────────────
export const SingleIdParamsSchema = z.object({ id: IdSchema });

// ── quote (POST) ───────────────────────────────────────────────────────────
export const QuoteBodySchema = z
  .object({
    listingId:             IdSchema,
    checkInDateLocalized:  IsoDateSchema,
    checkOutDateLocalized: IsoDateSchema,
    guestsCount:           z.number().int().positive().max(50),
    ratePlanId:            IdSchema.optional(),
    coupon:                z.string().trim().max(80).optional(),
    coupons:               z.array(z.string().trim().max(80)).max(5).optional(),
  })
  .refine(
    ({ checkInDateLocalized, checkOutDateLocalized }) =>
      checkInDateLocalized < checkOutDateLocalized,
    { message: "checkOut must be after checkIn", path: ["checkOutDateLocalized"] }
  );

// ── quote-get (GET) ────────────────────────────────────────────────────────
export const QuoteGetParamsSchema = z.object({ quoteId: IdSchema });

// ── instant-booking (POST) ─────────────────────────────────────────────────
export const InstantBookingSchema = z.object({
  quoteId: IdSchema,
  guest: z.object({
    firstName: z.string().trim().min(1).max(50),
    lastName:  z.string().trim().min(1).max(50),
    email:     z.string().trim().email().max(255),
    phone:     z.string().trim().min(7).max(25),
  }),
  payment: z
    .object({ token: z.string().trim().min(1).max(500) })
    .optional(),
});
