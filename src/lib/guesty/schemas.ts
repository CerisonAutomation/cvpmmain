import { z } from 'zod';

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

export const GuestyPictureSchema = z.object({
  _id: z.string(),
  original: z.string(),
  thumbnail: z.string().optional(),
  medium: z.string().optional(),
  large: z.string().optional(),
  caption: z.string().optional(),
  sort: z.number().optional(),
  tags: z.array(z.string()).optional(),
});

export const GuestyPricingSchema = z.object({
  currency: z.string(),
  basePrice: z.number(),
  cleaningFee: z.number().optional(),
  securityDeposit: z.number().optional(),
  weeklyDiscount: z.number().optional(),
  monthlyDiscount: z.number().optional(),
  minNights: z.number().optional(),
  maxNights: z.number().optional(),
});

export const GuestyListingSchema = z.object({
  _id: z.string(),
  title: z.string(),
  nickname: z.string(),
  description: z.string().optional(),
  summary: z.string().optional(),
  pictures: z.array(GuestyPictureSchema),
  address: GuestyAddressSchema,
  propertyType: z.string(),
  roomType: z.string().optional(),
  bedrooms: z.number(),
  roomsCount: z.number(),
  bedsCount: z.number(),
  bathrooms: z.number(),
  bathroomsCount: z.number(),
  accommodates: z.number(),
  amenities: z.array(z.string()),
  pricing: GuestyPricingSchema,
  availability: z.object({
    isAvailable: z.boolean(),
    nextAvailableDate: z.string().optional(),
  }),
  reviews: z.object({
    count: z.number(),
    averageRating: z.number(),
    summary: z.string().optional(),
  }).optional(),
}).passthrough();

export const GuestyQuoteSchema = z.object({
  _id: z.string(),
  listingId: z.string(),
  checkInDateLocalized: z.string(),
  checkOutDateLocalized: z.string(),
  guestsCount: z.number(),
  nightsCount: z.number(),
  currency: z.string(),
  priceBreakdown: z.object({
    accommodation: z.number(),
    cleaningFee: z.number().optional(),
    securityDeposit: z.number().optional(),
    taxes: z.number().optional(),
    fees: z.number().optional(),
    discounts: z.number().optional(),
    total: z.number(),
  }),
  available: z.boolean(),
  reason: z.string().optional(),
}).passthrough();

export const GuestyCalendarDaySchema = z.object({
  date: z.string(),
  available: z.boolean(),
  price: z.number().optional(),
  minimumStay: z.number().optional(),
  maximumStay: z.number().optional(),
  checkIn: z.boolean().optional(),
  checkOut: z.boolean().optional(),
}).passthrough();

export const GuestyCitySchema = z.object({
  _id: z.string(),
  name: z.string(),
  country: z.string(),
  count: z.number(),
}).passthrough();

export const GuestyReviewSchema = z.object({
  _id: z.string(),
  listingId: z.string(),
  guestName: z.string(),
  rating: z.number(),
  publicReview: z.string(),
  createdAt: z.string(),
}).passthrough();

export const GuestyRatePlanSchema = z.object({
  _id: z.string(),
  name: z.string(),
  pricing: z.object({
    basePrice: z.number(),
    currency: z.string(),
  }),
}).passthrough();
