import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { guestyClient } from './client';
import { normalizeListingSummary, normalizeListingDetail } from './normalizer';
import type { QuoteRequest, PropertyType, Amenity, Listing, Quote } from './types';

// ── Cache Configuration ──
const CACHE = {
  LISTINGS: 10 * 60 * 1000,
  LISTING: 5 * 60 * 1000,
  QUOTE: 2 * 60 * 1000,
  CITIES: 24 * 60 * 60 * 1000,
  REVIEWS: 30 * 60 * 1000,
  CALENDAR: 60 * 60 * 1000,
};

/** Fetch all listings with optional filters */
export const useListings = (params: {
  minOccupancy?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  propertyType?: PropertyType;
  amenities?: Amenity[];
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price' | 'rating';
  search?: string;
} = {}) => {
  return useQuery({
    queryKey: ['listings', params],
    queryFn: () => guestyClient.getListings(params),
    staleTime: CACHE.LISTINGS,
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (i) => Math.min(1000 * 2 ** i, 30000),
  });
};

/** Fetch single listing by ID */
export const useListing = (id: string | undefined) => {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => guestyClient.getListing(id!),
    enabled: !!id,
    staleTime: CACHE.LISTING,
    refetchOnWindowFocus: false,
  });
};

/** Prefetch a listing on hover */
export const usePrefetchListing = () => {
  const queryClient = useQueryClient();
  return useCallback((id: string) => {
    queryClient.prefetchQuery({
      queryKey: ['listing', id],
      queryFn: () => guestyClient.getListing(id),
      staleTime: CACHE.LISTING,
    });
  }, [queryClient]);
};

/** Fetch listing calendar availability */
export const useListingCalendar = (listingId: string | undefined, from: string, to: string) => {
  return useQuery({
    queryKey: ['calendar', listingId, from, to],
    queryFn: () => guestyClient.getListingCalendar(listingId!, from, to),
    enabled: !!listingId && !!from && !!to,
    staleTime: CACHE.CALENDAR,
  });
};

/** Create a reservation quote */
export const useCreateQuote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: QuoteRequest) => guestyClient.createQuote(params),
    onSuccess: (data) => {
      queryClient.setQueryData(['quote', data._id], data);
    },
  });
};

/** Retrieve a quote */
export const useQuote = (quoteId: string | undefined) => {
  return useQuery({
    queryKey: ['quote', quoteId],
    queryFn: () => guestyClient.getQuote(quoteId!),
    enabled: !!quoteId,
    staleTime: CACHE.QUOTE,
  });
};

/** Create instant booking from quote */
export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      quoteId: string;
      guest: { firstName: string; lastName: string; email: string; phone: string };
      payment?: { token: string };
    }) => guestyClient.createInstantReservation(params.quoteId, {
      guest: params.guest,
      payment: params.payment,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
};

/** Fetch reviews */
export const useReviews = (params: { listingId?: string; limit?: number } = {}) => {
  return useQuery({
    queryKey: ['reviews', params],
    queryFn: () => guestyClient.getReviews(params),
    staleTime: CACHE.REVIEWS,
    retry: 1,
  });
};

/** Fetch cities */
export const useCities = () => {
  return useQuery({
    queryKey: ['cities'],
    queryFn: () => guestyClient.getCities(),
    staleTime: CACHE.CITIES,
  });
};

/** Fetch rate plans for a listing */
export const useRatePlans = (listingId: string | undefined) => {
  return useQuery({
    queryKey: ['ratePlans', listingId],
    queryFn: () => guestyClient.getRatePlans(listingId!),
    enabled: !!listingId,
    staleTime: 30 * 60 * 1000,
  });
};

/** Fetch payment provider for a listing */
export const usePaymentProvider = (listingId: string | undefined) => {
  return useQuery({
    queryKey: ['paymentProvider', listingId],
    queryFn: () => guestyClient.getPaymentProvider(listingId!),
    enabled: !!listingId,
    staleTime: 60 * 60 * 1000,
  });
};

// Re-export normalizers for convenience
export { normalizeListingSummary, normalizeListingDetail };
