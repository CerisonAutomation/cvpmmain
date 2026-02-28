import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, Users, BedDouble, Bath, ChevronLeft, ChevronRight, Wifi, Car, Waves, Wind, Coffee, Tv, Utensils, Flame, Shirt, Snowflake, Check, Calendar, Home, AlertCircle, Loader2, Lock } from 'lucide-react';
import Layout from '@/components/Layout';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useListing, useCreateQuote, normalizeListingDetail } from '@/lib/guesty/hooks';
import type { NormalizedListingDetail } from '@/lib/guesty/normalizer';

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  WiFi: <Wifi size={16} />, WIFI: <Wifi size={16} />,
  Kitchen: <Utensils size={16} />, KITCHEN: <Utensils size={16} />,
  'Air Conditioning': <Snowflake size={16} />, AIR_CONDITIONING: <Snowflake size={16} />,
  Parking: <Car size={16} />, FREE_PARKING_ON_PREMISES: <Car size={16} />,
  TV: <Tv size={16} />, Washer: <Shirt size={16} />, WASHER: <Shirt size={16} />,
  Heating: <Flame size={16} />, HEATING: <Flame size={16} />,
  Coffee: <Coffee size={16} />, COFFEE_MAKER: <Coffee size={16} />,
  POOL: <Waves size={16} />, Pool: <Waves size={16} />,
};

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  // Live data from Guesty via edge function
  const { data: rawListing, isLoading, error } = useListing(id);
  const quoteMutation = useCreateQuote();

  // Normalize the listing data
  const property: NormalizedListingDetail | null = rawListing ? normalizeListingDetail(rawListing) : null;

  const handleGetQuote = () => {
    if (!id || !checkIn || !checkOut) return;
    quoteMutation.mutate({
      listingId: id,
      checkInDateLocalized: checkIn,
      checkOutDateLocalized: checkOut,
      guestsCount: guests,
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="h-[50vh] bg-secondary animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !property) {
    return (
      <Layout>
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-bold mb-2">Property not found</h2>
          <p className="text-muted-foreground mb-6">
            {error instanceof Error ? error.message : 'Unable to load this property'}
          </p>
          <Link to="/properties" className="text-primary hover:underline">Back to Properties</Link>
        </div>
      </Layout>
    );
  }

  const images = property.images.length > 0 ? property.images : [{ id: '0', thumbnail: '/placeholder.svg', regular: '/placeholder.svg', large: '/placeholder.svg', original: '/placeholder.svg' }];
  const amenities = property.amenityLabels || [];
  const quote = quoteMutation.data;

  return (
    <Layout>
      {/* Image Gallery */}
      <section className="relative h-[50vh] md:h-[60vh] bg-secondary">
        <img
          src={images[currentImageIdx]?.large || images[currentImageIdx]?.original}
          alt={property.title}
          className="w-full h-full object-cover"
        />
        {images.length > 1 && (
          <>
            <button onClick={() => setCurrentImageIdx((currentImageIdx - 1 + images.length) % images.length)} className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 p-2 rounded-full hover:bg-background">
              <ChevronLeft size={24} />
            </button>
            <button onClick={() => setCurrentImageIdx((currentImageIdx + 1) % images.length)} className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 p-2 rounded-full hover:bg-background">
              <ChevronRight size={24} />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.slice(0, 8).map((_, i) => (
                <button key={i} onClick={() => setCurrentImageIdx(i)} className={`w-2 h-2 rounded-full transition-colors ${i === currentImageIdx ? 'bg-white' : 'bg-white/40'}`} />
              ))}
            </div>
          </>
        )}
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <MapPin size={16} /> {property.city}, {property.country}
            </div>
            <h1 className="font-serif text-3xl font-semibold">{property.title}</h1>
            <div className="flex items-center gap-4 mt-4 text-sm">
              <span className="flex items-center gap-1"><Users size={16} /> {property.accommodates} guests</span>
              <span className="flex items-center gap-1"><BedDouble size={16} /> {property.bedrooms} bedrooms</span>
              <span className="flex items-center gap-1"><Bath size={16} /> {property.bathrooms} bathrooms</span>
              {property.rating && (
                <span className="flex items-center gap-1"><Star size={16} className="text-primary fill-primary" /> {property.rating}</span>
              )}
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div>
              <h2 className="font-serif text-xl font-semibold mb-4">About this property</h2>
              <p className="text-muted-foreground whitespace-pre-line">{property.description}</p>
            </div>
          )}

          {/* Bedrooms */}
          {property.bedrooms_detail.length > 0 && (
            <div>
              <h2 className="font-serif text-xl font-semibold mb-4">Sleeping Arrangements</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.bedrooms_detail.map((room, i) => (
                  <div key={i} className="p-4 border border-border/50 rounded-xl">
                    <p className="font-medium text-sm mb-1">{room.name}</p>
                    {room.beds.map((bed, j) => (
                      <p key={j} className="text-xs text-muted-foreground">{bed.count}× {bed.type}</p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Amenities */}
          {amenities.length > 0 && (
            <div>
              <h2 className="font-serif text-xl font-semibold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {(showAllAmenities ? amenities : amenities.slice(0, 12)).map((amenity: string) => (
                  <div key={amenity} className="flex items-center gap-2 text-sm">
                    {AMENITY_ICONS[amenity] || AMENITY_ICONS[property.amenities[amenities.indexOf(amenity)]] || <Check size={16} />}
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
              {amenities.length > 12 && (
                <button onClick={() => setShowAllAmenities(!showAllAmenities)} className="text-primary text-sm mt-3">
                  {showAllAmenities ? 'Show less' : `Show all ${amenities.length} amenities`}
                </button>
              )}
            </div>
          )}

          {/* Policies */}
          <div>
            <h2 className="font-serif text-xl font-semibold mb-4">Policies</h2>
            <div className="space-y-2 text-sm">
              {property.policies.checkInTime && <p><strong>Check-in:</strong> {property.policies.checkInTime}</p>}
              {property.policies.checkOutTime && <p><strong>Check-out:</strong> {property.policies.checkOutTime}</p>}
              {property.policies.cancellation && <p><strong>Cancellation:</strong> {property.policies.cancellation}</p>}
              {property.policies.houseRules && (
                <div>
                  <strong>House Rules:</strong>
                  <p className="text-muted-foreground mt-1">{property.policies.houseRules}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-card border rounded-xl p-6 shadow-lg">
            <div className="mb-6">
              <span className="text-3xl font-bold">€{property.basePrice}</span>
              <span className="text-muted-foreground"> / night</span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Check-in</Label>
                  <Input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Check-out</Label>
                  <Input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} />
                </div>
              </div>

              <div>
                <Label className="text-xs">Guests</Label>
                <select value={guests} onChange={e => setGuests(Number(e.target.value))} className="w-full p-2 border rounded text-sm">
                  {[...Array(property.accommodates || 10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1} guest{i > 0 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              {/* Quote result */}
              {quote && (
                <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>{quote.nightsCount} nights</span>
                    <span>€{quote.priceBreakdown.accommodation}</span>
                  </div>
                  {quote.priceBreakdown.cleaningFee && (
                    <div className="flex justify-between">
                      <span>Cleaning fee</span>
                      <span>€{quote.priceBreakdown.cleaningFee}</span>
                    </div>
                  )}
                  {quote.priceBreakdown.taxes && (
                    <div className="flex justify-between">
                      <span>Taxes</span>
                      <span>€{quote.priceBreakdown.taxes}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>€{quote.priceBreakdown.total}</span>
                  </div>
                </div>
              )}

              {quoteMutation.error && (
                <p className="text-sm text-destructive">
                  {quoteMutation.error instanceof Error ? quoteMutation.error.message : 'Failed to get quote'}
                </p>
              )}

              <Button
                onClick={handleGetQuote}
                disabled={!checkIn || !checkOut || quoteMutation.isPending}
                className="w-full"
              >
                {quoteMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Calendar className="w-4 h-4 mr-2" />
                )}
                {quote ? 'Update Quote' : 'Check Availability'}
              </Button>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Lock size={12} />
                Secure booking · No charge yet
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
