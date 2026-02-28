import type {
  Listing, PropertyType, Amenity, Quote, QuoteRequest,
  City, CalendarDay, PaymentProvider, Review, UpsellFee,
  GuestyError, ReservationResponse, ErrorCode, RatePlan,
} from './types';

// Use the edge function proxy URL
const getProxyUrl = (): string => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    console.warn('VITE_SUPABASE_URL not set - Guesty API unavailable');
    return '';
  }
  return `${supabaseUrl}/functions/v1/guesty-proxy`;
};

const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

async function request<T>(params: Record<string, string>, method: 'GET' | 'POST' = 'GET', body?: unknown): Promise<T> {
  const proxyUrl = getProxyUrl();
  if (!proxyUrl) throw { error_code: 'INTERNAL_ERROR', message: 'API not configured' } as GuestyError;

  const url = new URL(proxyUrl);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${ANON_KEY}`,
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
    return request<Listing[]>({ action: 'listings', params: qp.toString() });
  }

  async getListing(id: string): Promise<Listing> {
    return request<Listing>({ action: 'listing', id });
  }

  async getCities(): Promise<City[]> {
    return request<City[]>({ action: 'cities' });
  }

  async getListingCalendar(listingId: string, from: string, to: string): Promise<CalendarDay[]> {
    return request<CalendarDay[]>({ action: 'calendar', id: listingId, from, to });
  }

  async createQuote(params: QuoteRequest): Promise<Quote> {
    return request<Quote>({ action: 'quote' }, 'POST', {
      listingId: params.listingId,
      checkInDateLocalized: params.checkInDateLocalized,
      checkOutDateLocalized: params.checkOutDateLocalized,
      guestsCount: params.guestsCount,
      ...(params.ratePlanId ? { ratePlanId: params.ratePlanId } : {}),
      ...(params.coupons?.length ? { coupon: params.coupons[0] } : {}),
    });
  }

  async getQuote(quoteId: string): Promise<Quote> {
    return request<Quote>({ action: 'quote-get', quoteId });
  }

  async createInstantReservation(quoteId: string, guestData: {
    guest: { firstName: string; lastName: string; email: string; phone: string };
    payment?: { token: string };
  }): Promise<ReservationResponse> {
    return request<ReservationResponse>({ action: 'instant-booking', quoteId }, 'POST', guestData);
  }

  async getReviews(params: { listingId?: string; limit?: number } = {}): Promise<Review[]> {
    const qp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined) qp.set(k, String(v));
    });
    return request<Review[]>({ action: 'reviews', params: qp.toString() });
  }

  async getRatePlans(listingId: string): Promise<RatePlan[]> {
    return request<RatePlan[]>({ action: 'rate-plans', id: listingId });
  }

  async getPaymentProvider(listingId: string): Promise<PaymentProvider> {
    return request<PaymentProvider>({ action: 'payment-provider', id: listingId });
  }

  async getUpsellFees(listingId: string): Promise<UpsellFee[]> {
    return request<UpsellFee[]>({ action: 'upsell-fees', id: listingId });
  }

  formatError(error: GuestyError): string {
    return error.message || 'An unexpected error occurred.';
  }

  isRetryableError(error: GuestyError): boolean {
    return ['RATE_LIMIT_EXCEEDED', 'QUOTA_EXCEEDED', 'INTERNAL_ERROR', 'SERVICE_UNAVAILABLE'].includes(error.error_code);
  }
}

export const guestyClient = new GuestyClient();
