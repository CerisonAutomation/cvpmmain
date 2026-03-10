/**
 * checkout.ts — Client-side checkout service
 *
 * Calls the checkout-service Supabase Edge Function to:
 *   1. Persist the quote
 *   2. Create a booking record
 *   3. Create a Stripe PaymentIntent
 *
 * Returns { bookingId, clientSecret } needed for Stripe Elements.
 */

import type { Quote } from './guesty/types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON_KEY = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY) as string;

export interface GuestDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface CheckoutResult {
  bookingId: string;
  clientSecret: string;
  paymentIntentId: string;
  status: string;
}

export interface CheckoutError {
  error: string;
}

export async function initiateCheckout(params: {
  quote: Quote;
  listingId: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  guest: GuestDetails;
  couponCode?: string;
}): Promise<CheckoutResult> {
  const { quote, listingId, checkIn, checkOut, guestsCount, guest, couponCode } = params;

  const payload = {
    quoteId: quote._id,
    listingId,
    checkIn,
    checkOut,
    guestsCount,
    currency: quote.currency || 'EUR',
    totalAmount: quote.priceBreakdown.total,
    nightsCount: quote.nightsCount,
    priceBreakdown: {
      accommodation: quote.priceBreakdown.accommodation,
      cleaningFee: quote.priceBreakdown.cleaningFee,
      serviceFee: quote.priceBreakdown.fees,
      taxes: quote.priceBreakdown.taxes,
    },
    guest,
    couponCode: couponCode || undefined,
    userAgent: navigator.userAgent,
  };

  const res = await fetch(`${SUPABASE_URL}/functions/v1/checkout-service`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Checkout failed (${res.status})`);
  }

  return data as CheckoutResult;
}

export async function fetchBookingStatus(bookingId: string): Promise<{
  booking: {
    id: string;
    status: string;
    confirmation_code: string | null;
    guesty_reservation_id: string | null;
    check_in: string;
    check_out: string;
    total_amount: number;
    currency: string;
    guest_first_name: string;
    guest_last_name: string;
    guest_email: string;
    listing_id: string;
  };
  events: Array<{ event_type: string; from_status: string; to_status: string; created_at: string }>;
}> {
  const res = await fetch(
    `${SUPABASE_URL}/functions/v1/reservation-status?bookingId=${encodeURIComponent(bookingId)}`,
    {
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
      },
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error || 'Failed to fetch booking status');
  }

  return res.json();
}
