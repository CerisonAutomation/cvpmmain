// Enterprise-grade API client for CVPM Main
// All data from Supabase Edge Functions - NOT directly from database

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

  isNetworkError(): boolean {
    return this.code === "NETWORK_ERROR" || !this.status;
  }

  isRetryable(): boolean {
    return [
      ErrorCodes.RATE_LIMIT_EXCEEDED,
      ErrorCodes.QUOTA_EXCEEDED,
      "NETWORK_ERROR",
      "TIMEOUT",
    ].includes(this.code);
  }

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
    if (retries > 0 && error instanceof ApiError && error.isRetryable()) {
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

// Get API URL from environment
function getApiUrl(): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new ApiError("Supabase URL not configured", ErrorCodes.INTERNAL_ERROR, 500);
  }
  return supabaseUrl;
}

// =============================================================================
// PROPERTIES API - via Edge Function
// =============================================================================

/**
 * Fetch all properties via API (NOT directly from Supabase)
 */
export async function fetchProperties(
  params?: PropertySearchParams
): Promise<Property[]> {
  const apiUrl = getApiUrl();
  
  // Build query string
  const queryParams = new URLSearchParams();
  if (params?.destination) {
    queryParams.set("destination", sanitizeInput(params.destination));
  }
  if (params?.minPrice) {
    queryParams.set("minPrice", String(params.minPrice));
  }
  if (params?.maxPrice) {
    queryParams.set("maxPrice", String(params.maxPrice));
  }
  if (params?.guests) {
    queryParams.set("guests", String(params.guests));
  }

  const queryString = queryParams.toString();
  const url = `${apiUrl}/functions/v1/properties${queryString ? `?${queryString}` : ""}`;

  const response = await fetchWithRetry<{ data: Property[] }>(url);

  // Validate response data
  const validProperties = (response.data || [])
    .map((p) => validate(PropertySchema, p))
    .filter((r) => r.success)
    .map((r) => r.data);

  return validProperties;
}

/**
 * Fetch single property by slug via API
 */
export async function fetchProperty(slug: string): Promise<PropertyWithUnits | null> {
  const apiUrl = getApiUrl();
  const safeSlug = sanitizeInput(slug);

  const url = `${apiUrl}/functions/v1/properties?slug=${encodeURIComponent(safeSlug)}`;

  const response = await fetchWithRetry<{ data: PropertyWithUnits[] }>(url);

  if (!response.data || response.data.length === 0) {
    return null;
  }

  // Validate
  const validation = validate(PropertyWithUnitsSchema, response.data[0]);
  if (!validation.success) {
    throw new ApiError("Invalid property data", ErrorCodes.INTERNAL_ERROR, 500);
  }

  return validation.data;
}

/**
 * Fetch all destinations for search autocomplete via API
 */
export async function fetchDestinations(): Promise<string[]> {
  const properties = await fetchProperties();
  const destinations = properties.map((p) => p.destination);
  return [...new Set(destinations)];
}

// =============================================================================
// QUOTE API
// =============================================================================

/**
 * Create a quote - calls Edge Function for dynamic pricing
 */
export async function createQuote(request: QuoteRequest): Promise<QuoteResponse> {
  const validation = validate(QuoteRequestSchema, request);
  if (!validation.success) {
    throw new ApiError(
      "Invalid quote request",
      ErrorCodes.WRONG_REQUEST_PARAMETERS,
      400,
      { validationErrors: validation.errors.flatten() }
    );
  }

  const apiUrl = getApiUrl();

  return fetchWithRetry<QuoteResponse>(`${apiUrl}/functions/v1/quote`, {
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

  const apiUrl = getApiUrl();

  return fetchWithRetry<BookingResponse>(
    `${apiUrl}/functions/v1/create-pending`,
    {
      method: "POST",
      body: JSON.stringify({ quoteId, guest: guestValidation.data }),
    }
  );
}

// =============================================================================
// HEALTH CHECK
// =============================================================================

/**
 * Check if the API is available
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const apiUrl = getApiUrl();
    const response = await fetch(`${apiUrl}/functions/v1/properties?limit=1`);
    return response.ok;
  } catch {
    return false;
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

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
