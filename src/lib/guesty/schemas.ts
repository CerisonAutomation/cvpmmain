/**
 * Guesty response schemas (Zod) — validate data coming FROM the proxy/Guesty API.
 * These are the "output" schemas: they parse and strip unknown fields.
 *
 * Separate from proxy request schemas (in supabase/functions/guesty-proxy/schemas.ts)
 * which validate data coming FROM the frontend browser.
 */
import { z } from 'zod';

// ── Primitives ─────────────────────────────────────────────────────────────

const IsoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}/, 'Must be ISO date (YYYY-MM-DD...)');

const CurrencyCodeSchema = z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'ILS']);

export const PropertyTypeSchema = z.enum([
  'APARTMENT', 'HOUSE', 'VILLA', 'CONDOMINIUM', 'STUDIO',
  'LOFT', 'CABIN', 'TOWNHOUSE', 'BUNGALOW', 'OTHER',
]);

// Amenity is an open string union — allow any string but keep common ones typed
export const AmenitySchema = z.string().min(1);

// ── Address ────────────────────────────────────────────────────────────────

export const GuestyAddressSchema = z.object({
  full: z.string(),
  city: z.string(),
  country: z.string().optional(),
  state: z.string().optional(),
  street: z.string().optional(),
  zipcode: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

// ── Picture ────────────────────────────────────────────────────────────────

export const GuestyPictureSchema = z.object({
  _id: z.string(),
  original: z.string().url(),
  thumbnail: z.string().url().optional(),
  medium: z.string().url().optional(),
  large: z.string().url().optional(),
  caption: z.string().optional(),
  sort: z.number().optional(),
  tags: z.array(z.string()).optional(),
}).passthrough();

// ── Pricing ────────────────────────────────────────────────────────────────

export const GuestyPricingSchema = z.object({
  // Guesty may return any currency string for unlisted currencies
  currency: z.union([CurrencyCodeSchema, z.string()]),
  basePrice: z.number().nonnegative(),
  cleaningFee: z.number().nonnegative().optional(),
  securityDeposit: z.number().nonnegative().optional(),
  weeklyDiscount: z.number().min(0).max(100).optional(),
  monthlyDiscount: z.number().min(0).max(100).optional(),
  minNights: z.number().int().positive().optional(),
  maxNights: z.number().int().positive().optional(),
});

// ── Listing ────────────────────────────────────────────────────────────────

export const GuestyListingSchema = z.object({
  _id: z.string().min(1),
  title: z.string().min(1),
  nickname: z.string(),
  description: z.string().optional(),
  summary: z.string().optional(),
  pictures: z.array(GuestyPictureSchema).default([]),
  address: GuestyAddressSchema,
  propertyType: z.union([PropertyTypeSchema, z.string()]),  // tolerant for new types
  roomType: z.string().optional(),
  bedrooms: z.number().int().nonnegative(),
  roomsCount: z.number().int().nonnegative().default(0),
  bedsCount: z.number().int().nonnegative().default(0),
  bathrooms: z.number().nonnegative(),
  bathroomsCount: z.number().nonnegative().default(0),
  accommodates: z.number().int().positive(),
  amenities: z.array(AmenitySchema).default([]),
  pricing: GuestyPricingSchema,
  availability: z.object({
    isAvailable: z.boolean(),
    nextAvailableDate: IsoDateSchema.optional(),
  }),
  reviews: z.object({
    count: z.number().int().nonnegative(),
    averageRating: z.number().min(0).max(5),
    summary: z.string().optional(),
  }).optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    accuracy: z.string().optional(),
  }).optional(),
  published: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
}).passthrough();

// ── Calendar ───────────────────────────────────────────────────────────────

export const GuestyCalendarDaySchema = z.object({
  date: IsoDateSchema,
  available: z.boolean(),
  price: z.number().nonnegative().optional(),
  minimumStay: z.number().int().positive().optional(),
  maximumStay: z.number().int().positive().optional(),
  checkIn: z.boolean().optional(),
  checkOut: z.boolean().optional(),
  reason: z.string().optional(),
  note: z.string().optional(),
}).passthrough();

// ── City ───────────────────────────────────────────────────────────────────

export const GuestyCitySchema = z.object({
  _id: z.string(),
  name: z.string().min(1),
  country: z.string().min(1),
  state: z.string().optional(),
  count: z.number().int().nonnegative(),
  center: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
}).passthrough();

// ── Review ─────────────────────────────────────────────────────────────────

export const GuestyReviewSchema = z.object({
  _id: z.string(),
  listingId: z.string(),
  guestName: z.string(),
  rating: z.number().min(0).max(5),
  title: z.string().optional(),
  publicReview: z.string(),
  comment: z.string().default(''),
  createdAt: z.string(),
  verified: z.boolean().default(false),
  public: z.boolean().default(true),
}).passthrough();

// ── Rate Plan ──────────────────────────────────────────────────────────────

export const GuestyRatePlanSchema = z.object({
  _id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  pricing: z.object({
    basePrice: z.number().nonnegative(),
    currency: z.string(),
    weeklyDiscount: z.number().min(0).max(100).optional(),
    monthlyDiscount: z.number().min(0).max(100).optional(),
  }),
  minNights: z.number().int().positive().optional(),
  maxNights: z.number().int().positive().optional(),
}).passthrough();

// ── Quote ──────────────────────────────────────────────────────────────────

export const GuestyQuoteSchema = z.object({
  _id: z.string(),
  listingId: z.string(),
  checkInDateLocalized: IsoDateSchema,
  checkOutDateLocalized: IsoDateSchema,
  guestsCount: z.number().int().positive(),
  nightsCount: z.number().int().positive(),
  currency: z.string(),
  priceBreakdown: z.object({
    accommodation: z.number().nonnegative(),
    cleaningFee: z.number().nonnegative().optional(),
    securityDeposit: z.number().nonnegative().optional(),
    taxes: z.number().nonnegative().optional(),
    fees: z.number().nonnegative().optional(),
    discounts: z.number().optional(),
    total: z.number().nonnegative(),
  }),
  available: z.boolean(),
  reason: z.string().optional(),
  expiresAt: z.string().optional(),
}).passthrough();

// ── Upsell Fee ─────────────────────────────────────────────────────────────
/**
 * Guesty returns `price` (not `amount`). The field `price` is canonical here.
 * Book.tsx and all components MUST use `fee.price`.
 */
export const GuestyUpsellFeeSchema = z.object({
  _id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  currency: z.string(),
  type: z.enum(['per_night', 'per_stay', 'per_guest']),
  required: z.boolean().default(false),
}).passthrough();

// ── Payment Provider ───────────────────────────────────────────────────────

export const GuestyPaymentProviderSchema = z.object({
  name: z.string(),
  supportedCurrencies: z.array(z.string()).default([]),
  supportedCards: z.array(z.string()).default([]),
  configuration: z.record(z.unknown()).default({}),
}).passthrough();

// ── Listing filter params (frontend → proxy query string) ──────────────────
/**
 * These are the params the frontend can pass to `action=listings`.
 * Used by useListings() hook. Validated on the proxy side via ListingsParamsSchema
 * (supabase/functions/guesty-proxy/schemas.ts).
 *
 * This client-side schema gives you type-safe filter construction:
 *   const filters = ListingsFilterSchema.parse({ minBedrooms: '2', sort: 'price' });
 */
export const ListingsFilterSchema = z.object({
  minOccupancy:  z.coerce.number().int().positive().optional(),
  minBedrooms:   z.coerce.number().int().nonnegative().optional(),
  minBathrooms:  z.coerce.number().nonnegative().optional(),
  propertyType:  z.union([PropertyTypeSchema, z.string()]).optional(),
  amenities:     z.array(AmenitySchema).optional(),
  city:          z.string().trim().max(120).optional(),
  minPrice:      z.coerce.number().nonnegative().optional(),
  maxPrice:      z.coerce.number().nonnegative().optional(),
  sort:          z.enum(['price', 'rating']).optional(),
  search:        z.string().trim().max(120).optional(),
});

export type ListingsFilter = z.infer<typeof ListingsFilterSchema>;

// ── Reservation Response ───────────────────────────────────────────────────

export const GuestyReservationSchema = z.object({
  _id: z.string(),
  confirmationCode: z.string(),
  status: z.enum(['inquiry', 'tentative', 'confirmed', 'cancelled', 'expired']),
  listingId: z.string(),
  checkInDateLocalized: IsoDateSchema,
  checkOutDateLocalized: IsoDateSchema,
  guestsCount: z.number().int().positive(),
  nightsCount: z.number().int().positive(),
  guest: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
  money: z.object({
    currency: z.string(),
    totalPaid: z.number().nonnegative(),
    fees: z.number().optional(),
    taxes: z.number().optional(),
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
}).passthrough();
