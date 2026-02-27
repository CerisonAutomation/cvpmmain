// src/lib/api.ts
// Dynamic API client - fetches ALL data from Supabase/Edge Functions (NOT hardcoded)

import { supabase } from '@/integrations/supabase/client';

export interface Property {
  id: string;
  name: string;
  slug: string;
  destination: string;
  description: string | null;
  hero_image: string | null;
  gallery: string[] | null;
  amenities: string[] | null;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  price_per_night: number;
  rating: number | null;
  guesty_listing_id: string | null;
  check_in: string;
  check_out: string;
  cancellation_policy: string;
}

export interface Unit {
  id: string;
  property_id: string;
  name: string;
  max_guests: number;
  base_price: number;
  guesty_unit_id: string | null;
}

export interface RatePlan {
  id: string;
  unit_id: string;
  title: string;
  currency: string;
  weekend_multiplier: number;
  min_nights: number;
}

export interface PropertyWithUnits extends Property {
  units: Unit[];
  rate_plans?: RatePlan[];
}

// =============================================================================
// PROPERTIES API - All data from Supabase (NOT hardcoded)
// =============================================================================

/**
 * Fetch ALL properties from Supabase
 * Dynamic - no hardcoded data
 */
export async function fetchProperties(params?: {
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
}): Promise<Property[]> {
  let query = supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false });

  if (params?.destination) {
    query = query.ilike('destination', `%${params.destination}%`);
  }

  if (params?.minPrice) {
    query = query.gte('price_per_night', params.minPrice);
  }

  if (params?.maxPrice) {
    query = query.lte('price_per_night', params.maxPrice);
  }

  if (params?.guests) {
    query = query.gte('max_guests', params.guests);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);
  return data || [];
}

/**
 * Fetch single property by slug with units and rate plans
 */
export async function fetchProperty(slug: string): Promise<PropertyWithUnits | null> {
  // First get the property
  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .select('*')
    .eq('slug', slug)
    .single();

  if (propertyError || !property) {
    return null;
  }

  // Then get its units
  const { data: units, error: unitsError } = await supabase
    .from('units')
    .select('*')
    .eq('property_id', property.id);

  if (unitsError) {
    throw new Error(unitsError.message);
  }

  // Get rate plans for each unit
  const unitIds = units?.map(u => u.id) || [];
  let ratePlans: RatePlan[] = [];

  if (unitIds.length > 0) {
    const { data: plans } = await supabase
      .from('rate_plans')
      .select('*')
      .in('unit_id', unitIds);
    
    ratePlans = plans || [];
  }

  // Attach units and rate plans to property
  return {
    ...property,
    units: units || [],
    rate_plans: ratePlans,
  };
}

/**
 * Fetch all destinations (for search autocomplete)
 */
export async function fetchDestinations(): Promise<string[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('destination')
    .order('destination');

  if (error) throw new Error(error.message);
  
  // Return unique destinations
  const destinations = data?.map(p => p.destination) || [];
  return [...new Set(destinations)];
}

// =============================================================================
// QUOTE API - Calls Edge Function for dynamic pricing
// =============================================================================

export interface QuoteRequest {
  propertyId: string;
  unitId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children?: number;
}

export interface QuoteResponse {
  id: string;
  propertyName: string;
  currency: string;
  lineItems: { label: string; amount: number }[];
  total: number;
  nights: number;
  checkIn: string;
  checkOut: string;
  expiresAt: string;
}

/**
 * Create a quote - calls Edge Function for dynamic pricing
 */
export async function createQuote(request: QuoteRequest): Promise<QuoteResponse> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  
  const response = await fetch(`${supabaseUrl}/functions/v1/quote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create quote');
  }

  return response.json();
}

// =============================================================================
// BOOKING API - Creates pending reservation + Stripe PaymentIntent
// =============================================================================

export interface GuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface BookingResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  expiresAt: string;
}

/**
 * Create pending booking and get Stripe PaymentIntent
 */
export async function createPendingBooking(
  quoteId: string,
  guest: GuestInfo
): Promise<BookingResponse> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  
  const response = await fetch(`${supabaseUrl}/functions/v1/create-pending`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ quoteId, guest }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create booking');
  }

  return response.json();
}

// =============================================================================
// RESERVATIONS API - For authenticated users
// =============================================================================

/**
 * Fetch user's reservations (requires auth)
 */
export async function fetchReservations(): Promise<any[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Must be logged in');
  }

  const { data, error } = await supabase
    .from('reservations')
    .select('*, property:properties(name, destination)')
    .eq('guest_email', user.email)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}
