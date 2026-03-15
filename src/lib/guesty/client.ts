import { z } from 'zod';
import type {
  Listing, PropertyType, Amenity, Quote, QuoteRequest,
  City, CalendarDay, PaymentProvider, Review, UpsellFee,
  GuestyError, ReservationResponse, ErrorCode, RatePlan, Guest,
} from './types';
import {
  GuestyListingSchema,
  GuestyQuoteSchema,
  GuestyCalendarDaySchema,
  GuestyCitySchema,
  GuestyReviewSchema,
  GuestyRatePlanSchema,
} from './schemas';
import { config } from '../env';

// Use the edge function proxy URL
const getProxyUrl = (): string => {
  return `${config.VITE_SUPABASE_URL}/functions/v1/guesty-proxy`;
};

async function request<T>(params: Record<string, string>, method: 'GET' | 'POST' = 'GET', body?: unknown): Promise<T> {
  const proxyUrl = getProxyUrl();
  const url = new URL(proxyUrl);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${config.VITE_SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  };

  const opts: RequestInit = {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  };

  const res = await fetch(url.toString(), opts);

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({
      error_code: 'INTERNAL_ERROR' as ErrorCode,
      message: `HTTP ${res.status}: ${res.statusText}`,
    }));

    throw {
      error_code: errorData.error_code || 'INTERNAL_ERROR',
      message: errorData.error || errorData.message || 'Unknown error',
      data: errorData,
    } as GuestyError;
  }

  return res.json() as Promise<T>;
}

class GuestyClient {
  private validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
    const result = schema.safeParse(data);
    if (!result.success) {
      console.error('Guesty API Validation Error:', result.error.format());
      return data as T;
    }
    return result.data;
  }

  async getListings(params: {
    minOccupancy?: number;
    minBedrooms?: number;
    minBathrooms?: number;
    propertyType?: PropertyType;
    amenities?: Amenity[];
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: 'price' | 'rating';
  } = {}): Promise<Listing[]> {
    const qp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        qp.set(k, Array.isArray(v) ? v.join(',') : String(v));
      }
    });
    const data = await request<unknown>({ action: 'listings', params: qp.toString() });

    const rawListings = (data && typeof data === 'object' && 'results' in data)
      ? (data as Record<string, unknown>).results
      : data;

    return this.validate(z.array(GuestyListingSchema), rawListings);
  }

  async getListing(id: string): Promise<Listing> {
    const data = await request<unknown>({ action: 'listing', id });
    return this.validate(GuestyListingSchema, data);
  }

  async getCities(): Promise<City[]> {
    const data = await request<unknown>({ action: 'cities' });
    return this.validate(z.array(GuestyCitySchema), data);
  }

  async getListingCalendar(listingId: string, from: string, to: string): Promise<CalendarDay[]> {
    const data = await request<unknown>({ action: 'calendar', id: listingId, from, to });
    return this.validate(z.array(GuestyCalendarDaySchema), data);
  }

  async createQuote(params: QuoteRequest): Promise<Quote> {
    const data = await request<unknown>({ action: 'quote' }, 'POST', {
      listingId: params.listingId,
      checkInDateLocalized: params.checkInDateLocalized,
      checkOutDateLocalized: params.checkOutDateLocalized,
      guestsCount: params.guestsCount,
      ...(params.ratePlanId ? { ratePlanId: params.ratePlanId } : {}),
      ...(params.coupons ? { coupons: params.coupons } : {}),
    });
    return this.validate(GuestyQuoteSchema, data);
  }

  async getQuote(quoteId: string): Promise<Quote> {
    const data = await request<unknown>({ action: 'quote-get', quoteId });
    return this.validate(GuestyQuoteSchema, data);
  }

  async updateQuoteCoupons(quoteId: string, coupons: string[]): Promise<Quote> {
    const data = await request<unknown>({ action: 'quote-coupons', quoteId }, 'POST', { coupons });
    return this.validate(GuestyQuoteSchema, data);
  }

  async createInstantReservation(quoteId: string, params: {
    ratePlanId: string;
    ccToken: string;
    guest: Guest;
    policy?: any;
  }): Promise<ReservationResponse> {
    return request<ReservationResponse>({ action: 'instant-booking', quoteId }, 'POST', params);
  }

  async createInquiryReservation(quoteId: string, params: {
    ratePlanId: string;
    guest: Guest;
    reservedUntil?: number;
    ccToken?: string;
    policy?: any;
  }): Promise<ReservationResponse> {
    return request<ReservationResponse>({ action: 'inquiry-booking', quoteId }, 'POST', params);
  }

  async createInstantChargeReservation(quoteId: string, params: {
    ratePlanId: string;
    guest: Guest;
    confirmationToken?: string;
    initialPaymentMethodId?: string;
    reservedUntil?: number;
    reuse?: boolean;
    policy?: any;
    notes?: any;
  }): Promise<ReservationResponse> {
    return request<ReservationResponse>({ action: 'instant-charge', quoteId }, 'POST', params);
  }

  async getReservationDetails(reservationId: string): Promise<ReservationResponse> {
    return request<ReservationResponse>({ action: 'reservation-details', reservationId });
  }

  async verifyPayment(reservationId: string, params: {
    paymentId: string;
    threeDSResult?: any;
  }): Promise<{ status: string }> {
    return request<{ status: string }>({ action: 'verify-payment', reservationId }, 'POST', params);
  }

  async getReviews(params: { listingId?: string; limit?: number } = {}): Promise<Review[]> {
    const qp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) qp.set(k, String(v));
    });
    const data = await request<unknown>({ action: 'reviews', params: qp.toString() });
    return this.validate(z.array(GuestyReviewSchema), data);
  }

  async getRatePlans(listingId: string): Promise<RatePlan[]> {
    const data = await request<unknown>({ action: 'rate-plans', id: listingId });
    return this.validate(z.array(GuestyRatePlanSchema), data);
  }

  async getPaymentProvider(listingId: string): Promise<PaymentProvider> {
    return request<PaymentProvider>({ action: 'payment-provider', id: listingId });
  }

  async getUpsellFees(listingId: string, inquiryId?: string): Promise<UpsellFee[]> {
    return request<UpsellFee[]>({
      action: 'upsell-fees',
      id: listingId,
      ...(inquiryId ? { inquiryId } : {})
    });
  }

  formatError(error: GuestyError): string {
    return error.message || 'An unexpected error occurred.';
  }

  isRetryableError(error: GuestyError): boolean {
    return ['RATE_LIMIT_EXCEEDED', 'QUOTA_EXCEEDED', 'INTERNAL_ERROR', 'SERVICE_UNAVAILABLE'].includes(error.error_code);
  }
}

export const guestyClient = new GuestyClient();
