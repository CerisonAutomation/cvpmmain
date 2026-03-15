/**
 * Guesty Booking Engine API types
 * Source: https://booking-api-docs.guesty.com/
 */

export type UUID = string;
export type Email = string;
export type PhoneNumber = string;
export type ISODateString = string;
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'ILS';

export type PropertyType =
  | 'APARTMENT' | 'HOUSE' | 'VILLA' | 'CONDOMINIUM' | 'STUDIO'
  | 'LOFT' | 'CABIN' | 'TOWNHOUSE' | 'BUNGALOW' | 'OTHER';

export type Amenity =
  | 'AIR_CONDITIONING' | 'WIFI' | 'KITCHEN' | 'POOL' | 'PARKING'
  | 'WASHER' | 'DRYER' | 'TV' | 'HEATING' | 'HOT_TUB' | 'GYM'
  | 'ELEVATOR_IN_BUILDING' | 'PATIO_OR_BALCONY' | 'GARDEN_OR_BACKYARD'
  | 'DISHWASHER' | 'BBQ_GRILL' | 'IRON' | 'HAIR_DRYER' | 'ESSENTIALS'
  | 'FREE_PARKING_ON_PREMISES' | 'COFFEE_MAKER' | string;

export interface Address {
  full: string;
  country?: string;
  state?: string;
  city: string;
  street?: string;
  zipcode?: string;
  lat?: number;
  lng?: number;
}

export interface Picture {
  _id: UUID;
  original: string;
  thumbnail?: string;
  medium?: string;
  large?: string;
  caption?: string;
  sort?: number;
  tags?: string[];
}

export interface Pricing {
  currency: CurrencyCode;
  basePrice: number;
  cleaningFee?: number;
  securityDeposit?: number;
  weeklyDiscount?: number;
  monthlyDiscount?: number;
  minNights?: number;
  maxNights?: number;
}

export interface Listing {
  _id: UUID;
  title: string;
  nickname: string;
  description?: string;
  summary?: string;
  pictures: Picture[];
  address: Address;
  propertyType: PropertyType;
  roomType?: string;
  bedrooms: number;
  roomsCount: number;
  bedsCount: number;
  bathrooms: number;
  bathroomsCount: number;
  accommodates: number;
  amenities: Amenity[];
  pricing: Pricing;
  availability: {
    isAvailable: boolean;
    nextAvailableDate?: ISODateString;
  };
  reviews?: {
    count: number;
    averageRating: number;
    summary?: string;
  };
  host?: {
    _id: UUID;
    name: string;
    email: Email;
    phone?: PhoneNumber;
    picture?: string;
  };
  policies?: {
    checkInTime?: string;
    checkOutTime?: string;
    cancellationPolicy?: string;
    smokingAllowed?: boolean;
    petsAllowed?: boolean;
    partiesAllowed?: boolean;
  };
  location?: {
    lat: number;
    lng: number;
    accuracy?: string;
  };
  createdAt: ISODateString;
  updatedAt: ISODateString;
  published: boolean;
  [key: string]: unknown;
}

export interface CalendarDay {
  date: string;
  available: boolean;
  price?: number;
  minimumStay?: number;
  maximumStay?: number;
  checkIn?: boolean;
  checkOut?: boolean;
  reason?: string;
  note?: string;
}

export interface City {
  _id: string;
  name: string;
  country: string;
  state?: string;
  count: number;
  center?: { lat: number; lng: number };
}

export interface Review {
  _id: string;
  listingId: string;
  guestName: string;
  rating: number;
  title?: string;
  publicReview: string;
  comment: string;
  createdAt: string;
  verified: boolean;
  public: boolean;
}

export interface QuoteRequest {
  listingId: string;
  checkInDateLocalized: string;
  checkOutDateLocalized: string;
  guestsCount: number;
  ratePlanId?: string;
  /** Comma-separated in BE API v2 */
  coupons?: string;
  upsellFees?: string[];
  message?: string;
}

export interface Quote {
  _id: string;
  listingId: string;
  checkInDateLocalized: string;
  checkOutDateLocalized: string;
  guestsCount: number;
  nightsCount: number;
  currency: string;
  priceBreakdown: {
    accommodation: number;
    cleaningFee?: number;
    securityDeposit?: number;
    taxes?: number;
    fees?: number;
    discounts?: number;
    total: number;
  };
  ratePlan?: RatePlan;
  ratePlans?: RatePlan[];
  coupons?: Coupon[];
  upsellFees?: UpsellFee[];
  available: boolean;
  reason?: string;
  createdAt: string;
  expiresAt: string;
}

export interface RatePlan {
  _id: string;
  name: string;
  description?: string;
  pricing: {
    basePrice: number;
    currency: string;
    weeklyDiscount?: number;
    monthlyDiscount?: number;
  };
  totalPrice?: number;
  nightlyPrice?: number;
  fees?: Array<{ type?: string; amount?: number }>;
  taxes?: Array<{ type?: string; amount?: number }>;
  inquiryId?: string;
  minNights?: number;
  maxNights?: number;
}

export interface Coupon {
  _id: string;
  code: string;
  name: string;
  discount: { type: 'percentage' | 'fixed'; value: number; currency?: string };
  minNights?: number;
  validFrom: string;
  validTo: string;
  active: boolean;
}

/**
 * UpsellFee — returned by GET /listings/:id/upsell-fees
 * Field is `price` (NOT `amount`) — matches Guesty API response.
 */
export interface UpsellFee {
  _id: string;
  name: string;
  description?: string;
  /** Monetary value in the listing's currency */
  price: number;
  currency: string;
  /** Determines how the fee is applied */
  type: 'per_night' | 'per_stay' | 'per_guest';
  /** If true, fee is always included in the quote */
  required: boolean;
}

export interface PaymentProvider {
  name: string;
  supportedCurrencies: string[];
  supportedCards: string[];
  configuration: Record<string, unknown>;
}

export interface ReservationResponse {
  _id: string;
  confirmationCode?: string;
  status: 'inquiry' | 'tentative' | 'confirmed' | 'cancelled' | 'expired' | 'reserved' | string;
  listingId: string;
  quoteId?: string;
  ratePlanId?: string;
  checkInDateLocalized?: string;
  checkOutDateLocalized?: string;
  checkInDate?: string;
  checkOutDate?: string;
  guestsCount: number;
  nightsCount?: number;
  guest: Guest;
  money?: {
    currency: string;
    totalPaid: number;
    fees?: number;
    taxes?: number;
  };
  totalPrice?: number;
  balanceDue?: number;
  currency?: string;
  createdAt: string;
  updatedAt: string;
}

export type ErrorCode =
  | 'LISTING_NOT_FOUND' | 'LISTING_CALENDAR_BLOCKED' | 'LISTING_UNAVAILABLE'
  | 'MIN_NIGHT_MISMATCH' | 'MAX_NIGHT_EXCEEDED' | 'ADVANCE_BOOKING_NOTICE' | 'WINDOW_NOT_OPEN'
  | 'GUEST_COUNT_EXCEEDED' | 'INSUFFICIENT_GUESTS' | 'PRICE_CHANGED' | 'PRICING_ERROR'
  | 'COUPON_NOT_FOUND' | 'COUPON_IS_DISABLED' | 'COUPON_MIN_NIGHT_MISMATCH'
  | 'COUPON_MAXIMUM_USES_EXCEEDED' | 'COUPON_EXPIRATION_DATE_EXCEEDED' | 'COUPON_OUT_OF_CHECKIN_RANGE'
  | 'PAYMENT_FAILED' | 'PAYMENT_TOKEN_INVALID' | 'WRONG_PAYMENT_CONFIG'
  | 'WRONG_REQUEST_PARAMETERS' | 'MISSING_REQUIRED_FIELD' | 'INVALID_DATE_RANGE'
  | 'RATE_LIMIT_EXCEEDED' | 'QUOTA_EXCEEDED'
  | 'NOT_FOUND' | 'UNAUTHORIZED' | 'TOKEN_EXPIRED' | 'FORBIDDEN'
  | 'SERVICE_UNAVAILABLE' | 'INTERNAL_ERROR'
  | 'COUPON_UNEXPECTED_ERROR' | 'CREATE_RESERVATION_ERROR';

export interface GuestyError {
  error_code: ErrorCode;
  message: string;
  retryable?: boolean;
  data?: {
    errors?: string[];
    details?: Record<string, unknown>;
  };
}
