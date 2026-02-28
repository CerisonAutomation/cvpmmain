// Enterprise-grade API client — thin wrapper over edge functions
// All property data comes from Guesty via guesty-proxy edge function

import { z } from "zod";

// Re-export Guesty hooks as the primary data layer
export { useListings, useListing, useCreateQuote, useCreateBooking, useReviews } from "@/lib/guesty/hooks";
export { normalizeListingSummary, normalizeListingDetail } from "@/lib/guesty/normalizer";

// ── Error class ──
export class ApiError extends Error {
  constructor(
    message: string,
    public code: string = "INTERNAL_ERROR",
    public status: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
  }
}
