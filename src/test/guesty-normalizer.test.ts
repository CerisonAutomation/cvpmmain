import { describe, it, expect } from 'vitest';
import { normalizeListingSummary, normalizeListingDetail } from '../lib/guesty/normalizer';
import type { Listing } from '../lib/guesty/types';

describe('Guesty Normalizer', () => {
  const mockListing: any = {
    _id: 'listing_1',
    title: 'Luxury Villa',
    propertyType: 'VILLA',
    accommodates: 6,
    bedrooms: 3,
    bathrooms: 2,
    prices: {
      basePrice: 250,
      currency: 'EUR'
    },
    pictures: [
      { _id: 'pic_1', original: 'https://example.com/image.jpg' }
    ],
    address: {
      city: 'Valletta',
      country: 'Malta'
    }
  };

  it('should normalize a listing summary correctly', () => {
    const summary = normalizeListingSummary(mockListing as Listing);
    expect(summary.id).toBe('listing_1');
    expect(summary.title).toBe('Luxury Villa');
    expect(summary.city).toBe('Valletta');
    expect(summary.basePrice).toBe(250);
    expect(summary.heroImage).toBe('https://example.com/image.jpg');
  });

  it('should handle missing fields gracefully', () => {
    const emptyListing: any = { _id: 'empty' };
    const summary = normalizeListingSummary(emptyListing as Listing);
    expect(summary.title).toBe('Untitled Property');
    expect(summary.city).toBe('Malta');
    expect(summary.basePrice).toBe(0);
  });

  it('should normalize listing detail with amenities and policies', () => {
    const detailListing = {
      ...mockListing,
      amenities: ['WIFI', 'POOL'],
      publicDescription: {
        houseRules: 'No smoking'
      }
    };
    const detail = normalizeListingDetail(detailListing as Listing);
    expect(detail.amenities).toContain('WIFI');
    // The normalizer converts 'WIFI' to 'WIFI' in amenities,
    // and amenityToLabel('WIFI') should produce 'WIFI' or 'Wifi'
    expect(detail.amenityLabels).toContain('WIFI');
    expect(detail.policies.houseRules).toBe('No smoking');
  });
});
