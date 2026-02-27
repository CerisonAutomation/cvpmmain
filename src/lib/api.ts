// Enterprise-grade API client for CVPM Main
// All data from Supabase - fully typed with validation and error handling

import { supabase } from "@/integrations/supabase/client";
import {
  // Types
  type Property,
  type PropertyWithUnits,
  type Unit,
  type RatePlan,
  type QuoteRequest,
  type QuoteResponse,
  type GuestInfo,
  type BookingResponse,
  type Reservation,
  type PropertySearchParams,
  // Validation
  validate,
  sanitizeInput,
  // Schemas
  PropertySchema,
  PropertyWithUnitsSchema,
  QuoteRequestSchema,
  GuestInfoSchema,
  PropertySearchParamsSchema,
  // Error codes
  ErrorCodes,
} from "./types";

// =============================================================================
// CONFIGURATION
// =============================================================================

const API_CONFIG = {
  // Request timeout in milliseconds
  TIMEOUT: 30000,
  // Maximum retry attempts
  MAX_RETRIES: 3,
  // Retry delay base (exponential backoff)
  RETRY_DELAY: 1000,
  // Cache duration in milliseconds
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
} as const;

// =============================================================================
// ERROR HANDLING
// =============================================================================

/**
 * Custom API Error class with error codes
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public code: string = ErrorCodes.INTERNAL_ERROR,
    public status: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
  }

  /**
   * Check if error is a network error
   */
  isNetworkError(): boolean {
    return this.code === "NETWORK_ERROR" || !this.status;
  }

  /**
   * Check if error is retryable
   */
  isRetryable(): boolean {
    return [
      ErrorCodes.RATE_LIMIT_EXCEEDED,
      ErrorCodes.QUOTA_EXCEEDED,
      "NETWORK_ERROR",
      "TIMEOUT",
    ].includes(this.code);
  }

  /**
   * Check if error is an authentication error
   */
  isAuthError(): boolean {
    return [ErrorCodes.UNAUTHORIZED, ErrorCodes.TOKEN_EXPIRED].includes(
      this.code as typeof ErrorCodes extends Record<string, infer U> ? U : never
    );
  }
}

/**
 * Handle fetch response and convert to ApiError
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { error: response.statusText };
    }

    // Map HTTP status to error code
    const statusCodeMap: Record<number, string> = {
      400: ErrorCodes.WRONG_REQUEST_PARAMETERS,
      401: ErrorCodes.UNAUTHORIZED,
      403: ErrorCodes.FORBIDDEN,
      404: ErrorCodes.NOT_FOUND,
      409: ErrorCodes.LISTING_CALENDAR_BLOCKED,
      429: ErrorCodes.RATE_LIMIT_EXCEEDED,
      500: ErrorCodes.INTERNAL_ERROR,
    };

    throw new ApiError(
      errorData.error || "An error occurred",
      statusCodeMap[response.status] || ErrorCodes.INTERNAL_ERROR,
      response.status,
      errorData
    );
  }

  return response.json();
}

/**
 * Fetch with timeout and retry logic
 */
async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retries = API_CONFIG.MAX_RETRIES
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    return await handleResponse<T>(response);
  } catch (error) {
    // Check if we should retry
    if (retries > 0 && error instanceof ApiError && error.isRetryable()) {
      // Exponential backoff
      const delay = API_CONFIG.RETRY_DELAY * (API_CONFIG.MAX_RETRIES - retries + 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1);
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError("Request timed out", "TIMEOUT", 408);
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      error instanceof Error ? error.message : "Network error",
      "NETWORK_ERROR"
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

// =============================================================================
// PROPERTIES API
// =============================================================================

/**
 * Fetch all properties with optional filters
 * Server-pulled data - NOT hardcoded
 */
export async function fetchProperties(
  params?: PropertySearchParams
): Promise<Property[]> {
  // Validate params if provided
  if (params) {
    const validation = validate(PropertySearchParamsSchema, params);
    if (!validation.success) {
      throw new ApiError(
        "Invalid search parameters",
        ErrorCodes.WRONG_REQUEST_PARAMETERS,
        400
      );
    }
  }

  let query = supabase.from("properties").select("*");

  // Apply filters
  if (params?.destination) {
    query = query.ilike("destination", `%${sanitizeInput(params.destination)}%`);
  }

  if (params?.minPrice) {
    query = query.gte("price_per_night", params.minPrice);
  }

  if (params?.maxPrice) {
    query = query.lte("price_per_night", params.maxPrice);
  }

  if (params?.guests) {
    query = query.gte("max_guests", params.guests);
  }

  // Order by creation date
  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    throw new ApiError(
      error.message,
      ErrorCodes.INTERNAL_ERROR,
      500
    );
  }

  // Validate response data
  const validProperties = (data || [])
    .map((p) => validate(PropertySchema, p))
    .filter((r) => r.success)
    .map((r) => r.data);

  return validProperties;
}

/**
 * Fetch single property by slug with units and rate plans
 */
export async function fetchProperty(slug: string): Promise<PropertyWithUnits | null> {
  // Sanitize input
  const safeSlug = sanitizeInput(slug);

  // First get the property
  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("*")
    .eq("slug", safeSlug)
    .single();

  if (propertyError || !property) {
    return null;
  }

  // Validate property
  const propertyValidation = validate(PropertySchema, property);
  if (!propertyValidation.success) {
    throw new ApiError(
      "Invalid property data",
      ErrorCodes.INTERNAL_ERROR,
      500
    );
  }

  // Then get its units
  const { data: units, error: unitsError } = await supabase
    .from("units")
    .select("*")
    .eq("property_id", property.id);

  if (unitsError) {
    throw new ApiError(unitsError.message, ErrorCodes.INTERNAL_ERROR, 500);
  }

  // Validate units
  const validUnits = (units || [])
    .map((u) => validate(UnitSchema, u))
    .filter((r) => r.success)
    .map((r) => r.data);

  // Get rate plans for each unit
  const unitIds = validUnits.map((u) => u.id);
  let ratePlans: RatePlan[] = [];

  if (unitIds.length > 0) {
    const { data: plans } = await supabase
      .from("rate_plans")
      .select("*")
      .in("unit_id", unitIds);

    ratePlans = (plans || [])
      .map((p) => validate(RatePlanSchema, p))
      .filter((r) => r.success)
      .map((r) => r.data);
  }

  return {
    ...propertyValidation.data,
    units: validUnits,
    rate_plans: ratePlans,
  };
}

/**
 * Fetch all destinations for search autocomplete
 */
export async function fetchDestinations(): Promise<string[]> {
  const { data, error } = await supabase
    .from("properties")
    .select("destination")
    .order("destination");

  if (error) {
    throw new ApiError(error.message, ErrorCodes.INTERNAL_ERROR, 500);
  }

  // Return unique destinations
  const destinations = (data || []).map((p) => p.destination);
  return [...new Set(destinations)];
}

// =============================================================================
// QUOTE API
// =============================================================================

/**
 * Create a quote - calls Edge Function for dynamic pricing
 */
export async function createQuote(request: QuoteRequest): Promise<QuoteResponse> {
  // Validate request
  const validation = validate(QuoteRequestSchema, request);
  if (!validation.success) {
    throw new ApiError(
      "Invalid quote request",
      ErrorCodes.WRONG_REQUEST_PARAMETERS,
      400,
      { validationErrors: validation.errors.flatten() }
    );
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  return fetchWithRetry<QuoteResponse>(`${supabaseUrl}/functions/v1/quote`, {
    method: "POST",
    body: JSON.stringify(request),
  });
}

// =============================================================================
// BOOKING API
// =============================================================================

/**
 * Create pending booking and get Stripe PaymentIntent
 */
export async function createPendingBooking(
  quoteId: string,
  guest: GuestInfo
): Promise<BookingResponse> {
  // Validate inputs
  const guestValidation = validate(GuestInfoSchema, guest);
  if (!guestValidation.success) {
    throw new ApiError(
      "Invalid guest information",
      ErrorCodes.WRONG_REQUEST_PARAMETERS,
      400,
      { validationErrors: guestValidation.errors.flatten() }
    );
  }

  if (!quoteId) {
    throw new ApiError(
      "Quote ID is required",
      ErrorCodes.MISSING_REQUIRED_FIELD,
      400
    );
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  return fetchWithRetry<BookingResponse>(
    `${supabaseUrl}/functions/v1/create-pending`,
    {
      method: "POST",
      body: JSON.stringify({ quoteId, guest: guestValidation.data }),
    }
  );
}

// =============================================================================
// RESERVATIONS API
// =============================================================================

/**
 * Fetch user's reservations (requires auth)
 */
export async function fetchReservations(): Promise<Reservation[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new ApiError("Must be logged in", ErrorCodes.UNAUTHORIZED, 401);
  }

  const { data, error } = await supabase
    .from("reservations")
    .select("*, property:properties(name, destination)")
    .eq("guest_email", user.email)
    .order("created_at", { ascending: false });

  if (error) {
    throw new ApiError(error.message, ErrorCodes.INTERNAL_ERROR, 500);
  }

  return (data || []) as Reservation[];
}

// =============================================================================
// HEALTH CHECK
// =============================================================================

/**
 * Check if the API is available
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from("properties").select("id").limit(1);
    return !error;
  } catch {
    return false;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

// Re-export types for convenience
export type {
  Property,
  PropertyWithUnits,
  Unit,
  RatePlan,
  QuoteRequest,
  QuoteResponse,
  GuestInfo,
  BookingResponse,
  Reservation,
  PropertySearchParams,
} from "./types";

// Export error class
export { ApiError, ErrorCodes };
