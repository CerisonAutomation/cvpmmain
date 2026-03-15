/**
 * Tolerant normalizer for Guesty listing data.
 * Accepts any shape, never crashes on missing fields.
 * Stores raw upstream payload for debugging.
 */

import type { Listing } from './types';

// ── Normalized types ──

export interface NormalizedImage {
  id: string;
  thumbnail: string;
  regular: string;
  large: string;
  original: string;
  caption?: string;
}

export interface NormalizedAddress {
  full: string;
  city: string;
  country: string;
  street?: string;
  neighborhood?: string;
  zipcode?: string;
  lat?: number;
  lng?: number;
}

export interface NormalizedBedroom {
  name: string;
  beds: Array<{ type: string; count: number }>;
}

export interface NormalizedPricing {
  basePrice: number;
  currency: string;
  cleaningFee?: number;
  extraPersonFee?: number;
  weeklyFactor?: number;
  monthlyFactor?: number;
  petFee?: number;
}

export interface NormalizedPolicy {
  houseRules?: string;
  cancellation?: string;
  checkInTime?: string;
  checkOutTime?: string;
  checkInInstructions?: string;
  safetyInfo?: string;
  allowsChildren?: boolean;
  allowsPets?: boolean;
  allowsSmoking?: boolean;
  allowsEvents?: boolean;
}

export interface NormalizedListingSummary {
  id: string;
  title: string;
  nickname?: string;
  propertyType: string;
  roomType: string;
  heroImage: string;
  city: string;
  country: string;
  accommodates: number;
  bedrooms: number;
  bathrooms: number;
  beds: number;
  basePrice: number;
  currency: string;
  rating?: number;
  reviewsCount?: number;
  tags: string[];
  raw: unknown;
}

export interface NormalizedListingDetail extends NormalizedListingSummary {
  images: NormalizedImage[];
  address: NormalizedAddress;
  description: string;
  shortDescription?: string;
  space?: string;
  neighborhood?: string;
  transit?: string;
  interactionWithGuests?: string;
  amenities: string[];
  amenityLabels: string[];
  bedrooms_detail: NormalizedBedroom[];
  pricing: NormalizedPricing;
  policies: NormalizedPolicy;
  highlights: string[];
  taxes: Array<{ name: string; amount: number; type: string; units: string }>;
}

// ── Fallback image ──
const FALLBACK_IMG = '/placeholder.svg';

// ── Helper: safe string ──
function str(val: unknown, fallback = ''): string {
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  return fallback;
}
function num(val: unknown, fallback = 0): number {
  const n = Number(val);
  return isFinite(n) ? n : fallback;
}

// ── Normalize images from any shape ──
function normalizeImages(raw: Listing): NormalizedImage[] {
  const arr = (raw?.pictures || (raw as any)?.photos || (raw as any)?.images || (raw as any)?.gallery || []) as any[];
  if (!Array.isArray(arr)) return [];
  return arr.map((img: any, i: number) => ({
    id: str(img?._id || img?.id, `img-${i}`),
    thumbnail: str(img?.thumbnail || img?.small || img?.regular || img?.original || img?.url, FALLBACK_IMG),
    regular: str(img?.regular || img?.medium || img?.large || img?.original || img?.url, FALLBACK_IMG),
    large: str(img?.large || img?.original || img?.regular || img?.url, FALLBACK_IMG),
    original: str(img?.original || img?.large || img?.url, FALLBACK_IMG),
    caption: str(img?.caption || img?.alt),
  }));
}

// ── Normalize address ──
function normalizeAddress(raw: Listing): NormalizedAddress {
  const addr = ((raw as any)?.publishedAddress || raw?.address || (raw as any)?.location || {}) as any;
  return {
    full: str(addr?.full || addr?.formatted || addr?.display || ''),
    city: str(addr?.city || addr?.locality || addr?.town || ''),
    country: str(addr?.country || addr?.countryCode || ''),
    street: str(addr?.street || addr?.streetAddress),
    neighborhood: str(addr?.neighborhood || addr?.area || addr?.district),
    zipcode: str(addr?.zipcode || addr?.postalCode || addr?.zip),
    lat: addr?.lat != null ? num(addr.lat) : undefined,
    lng: addr?.lng != null ? num(addr.lng) : undefined,
  };
}

// ── Best description ──
function bestDescription(raw: Listing): string {
  const pd = (raw as any)?.publicDescription || raw?.description || {};
  if (typeof pd === 'string') return pd;
  return str(
    pd?.summary ||
    pd?.description ||
    pd?.space ||
    raw?.summary ||
    raw?.description ||
    raw?.longDescription ||
    raw?.shortDescription ||
    ''
  );
}

// ── Normalize amenities ──
function normalizeAmenities(raw: Listing): string[] {
  const arr = (raw?.amenities || raw?.amenityIds || []) as any[];
  if (!Array.isArray(arr)) return [];
  return arr.map((a: any) => {
    if (typeof a === 'string') return a;
    if (typeof a === 'object' && a?.name) return String(a.name);
    return '';
  }).filter(Boolean);
}

// ── Amenity label helper ──
function amenityToLabel(code: string): string {
  return code
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/\bAnd\b/g, '&')
    .replace(/\bOr\b/g, '/')
    .replace(/\bIn\b/g, 'in')
    .replace(/\bOn\b/g, 'on')
    .replace(/\bOf\b/g, 'of');
}

// ── Normalize bedrooms ──
function normalizeBedrooms(raw: Listing): NormalizedBedroom[] {
  const ba = (raw as any)?.bedArrangements as any;
  if (!ba?.details || !Array.isArray(ba.details)) return [];
  return (ba.details as any[]).map((room: any) => ({
    name: str(room?.roomName || room?.name, 'Room'),
    beds: Array.isArray(room?.beds) ? (room.beds as any[]).map((b: any) => ({
      type: str(b?.type, 'bed').replace(/([A-Z])/g, ' $1').trim(),
      count: num(b?.count, 1),
    })) : [],
  }));
}

// ── Normalize policies ──
function normalizePolicies(raw: Listing): NormalizedPolicy {
  const pd = (raw as any)?.publicDescription || {};
  return {
    houseRules: str(pd?.houseRules || raw?.houseRules),
    cancellation: str(raw?.cancellationPolicy || raw?.cancellation?.policyText),
    checkInTime: str(raw?.defaultCheckInTime || raw?.checkInTime),
    checkOutTime: str(raw?.defaultCheckOutTime || raw?.checkOutTime),
    checkInInstructions: str(pd?.access || raw?.checkInInstructions),
    safetyInfo: str(pd?.notes || raw?.safetyInfo),
    allowsChildren: pd?.guestControls?.allowsChildren,
    allowsPets: pd?.guestControls?.allowsPets,
    allowsSmoking: pd?.guestControls?.allowsSmoking,
    allowsEvents: pd?.guestControls?.allowsEvents,
  };
}

// ── Normalize taxes ──
function normalizeTaxes(raw: Listing): Array<{ name: string; amount: number; type: string; units: string }> {
  const taxes = (raw as any)?.taxes;
  if (!Array.isArray(taxes)) return [];
  return (taxes as any[]).map((t: any) => ({
    name: str(t?.name, 'Tax'),
    amount: num(t?.amount),
    type: str(t?.type),
    units: str(t?.units),
  }));
}

// ══════════════════════════════════════════════════════════════════════
// PUBLIC API
// ══════════════════════════════════════════════════════════════════════

export function normalizeListingSummary(raw: Listing): NormalizedListingSummary {
  const images = normalizeImages(raw);
  const addr = normalizeAddress(raw);
  return {
    id: str(raw?._id || raw?.id),
    title: str(raw?.title || raw?.name || raw?.publicName || raw?.nickname, 'Untitled Property'),
    nickname: str(raw?.nickname),
    propertyType: str(raw?.propertyType, 'APARTMENT'),
    roomType: str(raw?.roomType, 'Entire home/apt'),
    heroImage: images[0]?.large || images[0]?.original || FALLBACK_IMG,
    city: addr.city || addr.neighborhood || addr.full || 'Malta',
    country: addr.country || 'Malta',
    accommodates: num(raw?.accommodates || raw?.maxGuests, 2),
    bedrooms: num(raw?.bedrooms, 1),
    bathrooms: num(raw?.bathrooms, 1),
    beds: num(raw?.beds, 1),
    basePrice: num(raw?.prices?.basePrice || raw?.basePrice),
    currency: str(raw?.prices?.currency || raw?.currency, 'EUR'),
    rating: raw?.rating != null ? num(raw.rating) : undefined,
    reviewsCount: raw?.reviewsCount != null ? num(raw.reviewsCount) : undefined,
    tags: Array.isArray(raw?.tags) ? raw.tags.map(String) : [],
    raw,
  };
}

export function normalizeListingDetail(raw: Listing): NormalizedListingDetail {
  const summary = normalizeListingSummary(raw);
  const amenities = normalizeAmenities(raw);
  const pd = raw?.publicDescription || {};

  return {
    ...summary,
    images: normalizeImages(raw),
    address: normalizeAddress(raw),
    description: bestDescription(raw),
    shortDescription: str(raw?.shortDescription || pd?.summary),
    space: str(pd?.space || raw?.space),
    neighborhood: str(pd?.neighborhood || raw?.neighborhood),
    transit: str(pd?.transit || raw?.transit),
    interactionWithGuests: str(pd?.interactionWithGuests),
    amenities,
    amenityLabels: amenities.map(amenityToLabel),
    bedrooms_detail: normalizeBedrooms(raw),
    pricing: {
      basePrice: num(raw?.prices?.basePrice || raw?.basePrice),
      currency: str(raw?.prices?.currency || raw?.currency, 'EUR'),
      cleaningFee: raw?.prices?.cleaningFee != null ? num(raw.prices.cleaningFee) : undefined,
      extraPersonFee: raw?.prices?.extraPersonFee != null ? num(raw.prices.extraPersonFee) : undefined,
      weeklyFactor: raw?.prices?.weeklyPriceFactor != null ? num(raw.prices.weeklyPriceFactor) : undefined,
      monthlyFactor: raw?.prices?.monthlyPriceFactor != null ? num(raw.prices.monthlyPriceFactor) : undefined,
      petFee: raw?.prices?.petFee != null ? num(raw.prices.petFee) : undefined,
    },
    policies: normalizePolicies(raw),
    highlights: Array.isArray(raw?.tags) ? raw.tags.map(String) :
      Array.isArray(raw?.highlights) ? raw.highlights.map(String) : [],
    taxes: normalizeTaxes(raw),
  };
}
