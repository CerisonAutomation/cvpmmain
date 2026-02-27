// Enterprise-grade API types for CVPM Main
// All data from Supabase - fully typed

import { z } from "zod";

// =============================================================================
// BASE TYPES - Core domain models
// =============================================================================

/**
 * Property listing from Supabase
 * All fields validated with Zod
 */
export const PropertySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  destination: z.string().min(1),
  description: z.string().nullable(),
  hero_image: z.string().url().nullable(),
  gallery: z.array(z.string().url()).nullable(),
  amenities: z.array(z.string()).nullable(),
  max_guests: z.number().int().positive(),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().int().min(0),
  price_per_night: z.number().positive(),
  rating: z.number().min(0).max(5).nullable(),
  guesty_listing_id: z.string().nullable(),
  guesty_property_id: z.string().nullable(),
  check_in: z.string().time().default("15:00"),
  check_out: z.string().time().default("11:00"),
  cancellation_policy: z.string().default("Flexible"),
  created_at: z.string().datetime(),
});

export type Property = z.infer<typeof PropertySchema>;

/**
 * Property unit (room/villa within a property)
 */
export const UnitSchema = z.object({
  id: z.string().uuid(),
  property_id: z.string().uuid(),
  name: z.string().min(1),
  max_guests: z.number().int().positive(),
  base_price: z.number().positive(),
  guesty_unit_id: z.string().nullable(),
  created_at: z.string().datetime(),
});

export type Unit = z.infer<typeof UnitSchema>;

/**
 * Rate plan for pricing
 */
export const RatePlanSchema = z.object({
  id: z.string().uuid(),
  unit_id: z.string().uuid(),
  title: z.string().min(1),
  currency: z.string().length(3).default("EUR"),
  weekend_multiplier: z.number().positive().default(1.2),
  min_nights: z.number().int().positive().default(1),
  created_at: z.string().datetime(),
});

export type RatePlan = z.infer<typeof RatePlanSchema>;

/**
 * Property with units and rate plans
 */
export const PropertyWithUnitsSchema = PropertySchema.extend({
  units: z.array(UnitSchema),
  rate_plans: z.array(RatePlanSchema).optional(),
});

export type PropertyWithUnits = z.infer<typeof PropertyWithUnitsSchema>;

// =============================================================================
// BOOKING TYPES - Quote and reservation schemas
// =============================================================================

/**
 * Quote request input
 */
export const QuoteRequestSchema = z.object({
  propertyId: z.string().uuid("Invalid property ID"),
  unitId: z.string().uuid("Invalid unit ID"),
  checkIn: z.string().date("Invalid check-in date"),
  checkOut: z.string().date("Invalid check-out date"),
  adults: z.number().int().positive().min(1).max(20),
  children: z.number().int().min(0).max(10).default(0),
});

export type QuoteRequest = z.infer<typeof QuoteRequestSchema>;

/**
 * Line item in a quote
 */
export const QuoteLineItemSchema = z.object({
  label: z.string(),
  amount: z.number().positive(),
});

export type QuoteLineItem = z.infer<typeof QuoteLineItemSchema>;

/**
 * Quote response from API
 */
export const QuoteResponseSchema = z.object({
  id: z.string().uuid(),
  propertyName: z.string(),
  currency: z.string().length(3),
  lineItems: z.array(QuoteLineItemSchema),
  total: z.number().positive(),
  nights: z.number().int().positive(),
  checkIn: z.string().date(),
  checkOut: z.string().date(),
  expiresAt: z.string().datetime(),
});

export type QuoteResponse = z.infer<typeof QuoteResponseSchema>;

/**
 * Guest information for booking
 */
export const GuestInfoSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email("Invalid email address"),
  phone: z.string().max(20).optional(),
});

export type GuestInfo = z.infer<typeof GuestInfoSchema>;

/**
 * Booking request
 */
export const BookingRequestSchema = z.object({
  quoteId: z.string().uuid("Invalid quote ID"),
  guest: GuestInfoSchema,
});

export type BookingRequest = z.infer<typeof BookingRequestSchema>;

/**
 * Booking response (Stripe PaymentIntent)
 */
export const BookingResponseSchema = z.object({
  clientSecret: z.string().min(1),
  paymentIntentId: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().length(3),
  expiresAt: z.string().datetime(),
});

export type BookingResponse = z.infer<typeof BookingResponseSchema>;

/**
 * Reservation from database
 */
export const ReservationSchema = z.object({
  id: z.string().uuid(),
  property_id: z.string().uuid(),
  guest_email: z.string().email(),
  guest_first_name: z.string(),
  guest_last_name: z.string(),
  guest_phone: z.string().nullable(),
  currency: z.string().length(3),
  total_amount: z.number().positive(),
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
  payment_status: z.enum(["pending", "paid", "failed", "refunded"]),
  stripe_payment_intent_id: z.string().nullable(),
  guesty_reservation_id: z.string().nullable(),
  check_in: z.string().date(),
  check_out: z.string().date(),
  created_at: z.string().datetime(),
});

export type Reservation = z.infer<typeof ReservationSchema>;

// =============================================================================
// API ERROR TYPES
// =============================================================================

/**
 * API error response
 */
export const ApiErrorSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.record(z.unknown()).optional(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

/**
 * Custom error codes
 */
export const ErrorCodes = {
  // Availability errors
  LISTING_NOT_FOUND: "LISTING_NOT_FOUND",
  LISTING_CALENDAR_BLOCKED: "LISTING_CALENDAR_BLOCKED",
  LISTING_UNAVAILABLE: "LISTING_UNAVAILABLE",
  
  // Booking errors
  MIN_NIGHT_MISMATCH: "MIN_NIGHT_MISMATCH",
  MAX_NIGHT_EXCEEDED: "MAX_NIGHT_EXCEEDED",
  ADVANCE_BOOKING_NOTICE: "ADVANCE_BOOKING_NOTICE",
  WINDOW_NOT_OPEN: "WINDOW_NOT_OPEN",
  
  // Guest & Pricing errors
  GUEST_COUNT_EXCEEDED: "GUEST_COUNT_EXCEEDED",
  INSUFFICIENT_GUESTS: "INSUFFICIENT_GUESTS",
  PRICE_CHANGED: "PRICE_CHANGED",
  PRICING_ERROR: "PRICING_ERROR",
  
  // Payment errors
  COUPON_NOT_FOUND: "COUPON_NOT_FOUND",
  COUPON_IS_DISABLED: "COUPON_IS_DISABLED",
  COUPON_MIN_NIGHT_MISMATCH: "COUPON_MIN_NIGHT_MISMATCH",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  PAYMENT_TOKEN_INVALID: "PAYMENT_TOKEN_INVALID",
  
  // Request errors
  WRONG_REQUEST_PARAMETERS: "WRONG_REQUEST_PARAMETERS",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",
  INVALID_DATE_RANGE: "INVALID_DATE_RANGE",
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  QUOTA_EXCEEDED: "QUOTA_EXCEEDED",
  
  // Server errors
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  FORBIDDEN: "FORBIDDEN",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  QUOTE_EXPIRED: "QUOTE_EXPIRED",
  QUOTE_NOT_FOUND: "QUOTE_NOT_FOUND",
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

// =============================================================================
// FILTER TYPES - Search and filter parameters
// =============================================================================

/**
 * Property search parameters
 */
export const PropertySearchParamsSchema = z.object({
  destination: z.string().optional(),
  checkIn: z.string().date().optional(),
  checkOut: z.string().date().optional(),
  guests: z.number().int().positive().optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  propertyType: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(20),
});

export type PropertySearchParams = z.infer<typeof PropertySearchParamsSchema>;

/**
 * Paginated response wrapper
 */
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    hasMore: z.boolean(),
  });

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validate data against schema and return typed result or errors
 */
export function validate<T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

/**
 * Validate and throw if invalid
 */
export function validateOrThrow<T extends z.ZodType>(
  schema: T,
  data: unknown,
  message = "Validation failed"
): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`${message}: ${result.error.message}`);
  }
  return result.data;
}

/**
 * Sanitize string input (prevent XSS)
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}

/**
 * Format price for display
 */
export function formatPrice(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Calculate number of nights
 */
export function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}
