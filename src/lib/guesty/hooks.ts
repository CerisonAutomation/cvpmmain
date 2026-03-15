import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { guestyClient } from './client';
import { normalizeListingSummary, normalizeListingDetail } from './normalizer';
import type { QuoteRequest, PropertyType, Amenity, GuestyError, UpsellFee } from './types';

// ── Cache TTLs (ms) ──────────────────────────────────────────────────────────
const CACHE = {
  LISTINGS:         15 * 60 * 1000,
  LISTING:          10 * 60 * 1000,
  QUOTE:             2 * 60 * 1000,
  CITIES:       24 * 60 * 60 * 1000,
  REVIEWS:       60 * 60 * 1000,
  CALENDAR:          5 * 60 * 1000,
  RATE_PLANS:       30 * 60 * 1000,
  PAYMENT_PROVIDER: 60 * 60 * 1000,
  UPSELL_FEES:      30 * 60 * 1000,
};

const retryFn = (failureCount: number, error: unknown) => {
  const err = error as GuestyError;
  if (['UNAUTHORIZED', '401', '403'].some(c => err?.error_code?.includes(c) || err?.message?.includes(c))) return false;
  return failureCount < 1;
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
} = {}) =>
  useQuery({
    queryKey: ['listings', params],
    queryFn: async () => {
      const raw = await guestyClient.getListings(params);
      return Array.isArray(raw) ? raw : [];
    },
    staleTime: CACHE.LISTINGS,
    refetchOnWindowFocus: false,
    retry: retryFn,
    retryDelay: (i) => Math.min(15000 * 2 ** i, 60000),
    placeholderData: [],
  });

/** Fetch single listing by ID */
export const useListing = (id: string | undefined) =>
  useQuery({
    queryKey: ['listing', id],
    queryFn: () => guestyClient.getListing(id!),
    enabled: !!id,
    staleTime: CACHE.LISTING,
    refetchOnWindowFocus: false,
  });

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
export const useListingCalendar = (listingId: string | undefined, from: string, to: string) =>
  useQuery({
    queryKey: ['calendar', listingId, from, to],
    queryFn: () => guestyClient.getListingCalendar(listingId!, from, to),
    enabled: !!listingId && !!from && !!to,
    staleTime: CACHE.CALENDAR,
  });

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
export const useQuote = (quoteId: string | undefined) =>
  useQuery({
    queryKey: ['quote', quoteId],
    queryFn: () => guestyClient.getQuote(quoteId!),
    enabled: !!quoteId,
    staleTime: CACHE.QUOTE,
  });

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
export const useReviews = (params: { listingId?: string; limit?: number } = {}) =>
  useQuery({
    queryKey: ['reviews', params],
    queryFn: () => guestyClient.getReviews(params),
    staleTime: CACHE.REVIEWS,
    retry: 1,
  });

/** Fetch cities */
export const useCities = () =>
  useQuery({
    queryKey: ['cities'],
    queryFn: () => guestyClient.getCities(),
    staleTime: CACHE.CITIES,
  });

/** Fetch rate plans for a listing */
export const useRatePlans = (listingId: string | undefined) =>
  useQuery({
    queryKey: ['ratePlans', listingId],
    queryFn: () => guestyClient.getRatePlans(listingId!),
    enabled: !!listingId,
    staleTime: CACHE.RATE_PLANS,
  });

/** Fetch payment provider for a listing */
export const usePaymentProvider = (listingId: string | undefined) =>
  useQuery({
    queryKey: ['paymentProvider', listingId],
    queryFn: () => guestyClient.getPaymentProvider(listingId!),
    enabled: !!listingId,
    staleTime: CACHE.PAYMENT_PROVIDER,
  });

/** Fetch upsell / add-on fees for a listing — shown before Stripe on Book.tsx */
export const useUpsellFees = (listingId: string | undefined) =>
  useQuery({
    queryKey: ['upsellFees', listingId],
    queryFn: () => guestyClient.getUpsellFees(listingId!),
    enabled: !!listingId,
    staleTime: CACHE.UPSELL_FEES,
    placeholderData: [] as UpsellFee[],
  });

// Re-export normalizers for convenience
export { normalizeListingSummary, normalizeListingDetail };
