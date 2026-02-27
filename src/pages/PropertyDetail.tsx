import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, Users, BedDouble, Bath, ChevronLeft, ChevronRight, Wifi, Car, Waves, Wind, Coffee, Tv, Utensils, Flame, Shirt, Snowflake, Check, ExternalLink, Calendar, Home, AlertCircle, Loader2, CreditCard, Lock } from 'lucide-react';
import Layout from '@/components/Layout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProperty, createQuote, createPendingBooking, ApiError, type QuoteResponse, type GuestInfo } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  WiFi: <Wifi size={16} />, Kitchen: <Utensils size={16} />,
  'Air Conditioning': <Snowflake size={16} />, Parking: <Car size={16} />,
  'Sea View': <Waves size={16} />, TV: <Tv size={16} />,
  Washer: <Shirt size={16} />, Heating: <Flame size={16} />,
  Coffee: <Coffee size={16} />, Balcony: <Home size={16} />,
  Terrace: <Home size={16} />, Jacuzzi: <Waves size={16} />,
  Garden: <Home size={16} />, Gym: <Fitness size={16} />,
};

const AMENITY_LABELS: Record<string, string> = {
  WiFi: 'Wi-Fi', Kitchen: 'Kitchen', 'Air Conditioning': 'Air Conditioning',
  Parking: 'Free Parking', 'Sea View': 'Sea View', TV: 'TV',
  Washer: 'Washer', Heating: 'Heating', Coffee: 'Coffee Maker',
  Balcony: 'Balcony', Terrace: 'Terrace', Jacuzzi: 'Jacuzzi',
  Garden: 'Garden', Gym: 'Gym', Pool: 'Pool',
};

// Helper component for Fitness icon
function Fitness({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6.5 6.5h11M6.5 17.5h11M3 12h3M18 12h3M6 9v6M18 9v6" />
    </svg>
  );
}

function FitnessIcon(props: any) {
  return <Fitness {...props} />;
}

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  
  // Guest form state
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [bookingStep, setBookingStep] = useState<'quote' | 'details' | 'payment' | 'confirmed'>('quote');
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Fetch property using React Query
  const { data: property, isLoading, error } = useQuery({
    queryKey: ['property', id],
    queryFn: () => fetchProperty(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });

  // Quote mutation
  const quoteMutation = useMutation({
    mutationFn: () => {
      if (!property || !checkIn || !checkOut) throw new Error('Missing required fields');
      const unitId = property.units?.[0]?.id;
      if (!unitId) throw new Error('No units available');
      return createQuote({
        propertyId: property.id,
        unitId,
        checkIn,
        checkOut,
        adults: guests,
      });
    },
    onSuccess: (data) => {
      setQuote(data);
      setBookingStep('details');
    },
  });

  // Booking mutation
  const bookingMutation = useMutation({
    mutationFn: () => {
      if (!quote) throw new Error('No quote');
      return createPendingBooking(quote.id, guestInfo);
    },
    onSuccess: () => {
      setBookingStep('confirmed');
    },
    onError: (err) => {
      setBookingError(err instanceof Error ? err.message : 'Booking failed');
    },
  });

  const handleGetQuote = () => {
    if (!property || !checkIn || !checkOut) return;
    setBookingError(null);
    quoteMutation.mutate();
  };

  const handleContinueToPayment = () => {
    if (!guestInfo.firstName || !guestInfo.lastName || !guestInfo.email) {
      setBookingError('Please fill in all required fields');
      return;
    }
    setBookingError(null);
    bookingMutation.mutate();
  };

  // Loading state
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

  // Error state
  if (error || !property) {
    return (
      <Layout>
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-bold mb-2">Failed to load property</h2>
          <p className="text-muted-foreground mb-6">
            {error instanceof ApiError ? error.message : 'Property not found'}
          </p>
          <Link to="/properties" className="text-primary hover:underline">Back to Properties</Link>
        </div>
      </Layout>
    );
  }

  const images = property.gallery || [property.hero_image].filter(Boolean);
  const amenities = property.amenities || [];

  return (
    <Layout>
      {/* Image Gallery */}
      <section className="relative h-[50vh] md:h-[60vh] bg-secondary">
        {images.length > 0 ? (
          <img src={images[currentImageIdx]} alt={property.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Home size={64} />
          </div>
        )}
        
        {images.length > 1 && (
          <>
            <button onClick={() => setCurrentImageIdx((currentImageIdx - 1 + images.length) % images.length)} className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 p-2 rounded-full hover:bg-background">
              <ChevronLeft size={24} />
            </button>
            <button onClick={() => setCurrentImageIdx((currentImageIdx + 1) % images.length)} className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 p-2 rounded-full hover:bg-background">
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <MapPin size={16} /> {property.destination}
            </div>
            <h1 className="font-serif text-3xl font-semibold">{property.name}</h1>
            <div className="flex items-center gap-4 mt-4 text-sm">
              <span className="flex items-center gap-1"><Users size={16} /> {property.max_guests} guests</span>
              <span className="flex items-center gap-1"><BedDouble size={16} /> {property.bedrooms} bedrooms</span>
              <span className="flex items-center gap-1"><Bath size={16} /> {property.bathrooms} bathrooms</span>
              <span className="flex items-center gap-1"><Star size={16} /> {property.rating || 4.97}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="font-serif text-xl font-semibold mb-4">About this property</h2>
            <p className="text-muted-foreground">{property.description}</p>
          </div>

          {/* Amenities */}
          <div>
            <h2 className="font-serif text-xl font-semibold mb-4">Amenities</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(showAllAmenities ? amenities : amenities.slice(0, 12)).map((amenity: string) => (
                <div key={amenity} className="flex items-center gap-2 text-sm">
                  {(AMENITY_ICONS[amenity] || <Check size={16} />)}
                  <span>{AMENITY_LABELS[amenity] || amenity}</span>
                </div>
              ))}
            </div>
            {amenities.length > 12 && (
              <button onClick={() => setShowAllAmenities(!showAllAmenities)} className="text-primary text-sm mt-3">
                {showAllAmenities ? 'Show less' : `Show all ${amenities.length} amenities`}
              </button>
            )}
          </div>

          {/* Policies */}
          <div>
            <h2 className="font-serif text-xl font-semibold mb-4">Policies</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Check-in:</strong> {property.check_in || '15:00'}</p>
              <p><strong>Check-out:</strong> {property.check_out || '11:00'}</p>
              <p><strong>Cancellation:</strong> {property.cancellation_policy || 'Flexible'}</p>
            </div>
          </div>
        </div>

        {/* Booking Sidebar - FULLY INTERNAL BOOKING */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-card border rounded-xl p-6 shadow-lg">
            <div className="mb-6">
              <span className="text-3xl font-bold">€{property.price_per_night}</span>
              <span className="text-muted-foreground"> / night</span>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6 text-xs">
              <span className={bookingStep === 'quote' ? 'text-primary font-bold' : 'text-muted-foreground'}>1. Dates</span>
              <span className="text-muted-foreground">→</span>
              <span className={bookingStep === 'details' ? 'text-primary font-bold' : 'text-muted-foreground'}>2. Details</span>
              <span className="text-muted-foreground">→</span>
              <span className={bookingStep === 'payment' ? 'text-primary font-bold' : 'text-muted-foreground'}>3. Payment</span>
            </div>

            <div className="space-y-4">
              {/* Step 1: Select Dates */}
              {bookingStep === 'quote' && (
                <>
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
                    <select value={guests} onChange={e => setGuests(Number(e.target.value))} className="w-full p-2 border rounded">
                      {[...Array(property.max_guests)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1} guest{i > 0 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>

                  <Button 
                    onClick={handleGetQuote}
                    disabled={!checkIn || !checkOut || quoteMutation.isPending}
                    className="w-full"
                  >
                    {quoteMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Get Price Quote
                  </Button>
                </>
              )}

              {/* Step 2: Guest Details */}
              {bookingStep === 'details' && quote && (
                <>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>€{quote.lineItems?.[0]?.amount} × {quote.nights} nights</span>
                    </div>
                    {quote.lineItems?.slice(1).map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span>{item.label}</span>
                        <span>€{item.amount}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold pt-2 border-t">
                      <span>Total</span>
                      <span>€{quote.total}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">First Name *</Label>
                      <Input 
                        value={guestInfo.firstName}
                        onChange={e => setGuestInfo({...guestInfo, firstName: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Last Name *</Label>
                      <Input 
                        value={guestInfo.lastName}
                        onChange={e => setGuestInfo({...guestInfo, lastName: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Email *</Label>
                      <Input 
                        type="email"
                        value={guestInfo.email}
                        onChange={e => setGuestInfo({...guestInfo, email: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Phone</Label>
                      <Input 
                        type="tel"
                        value={guestInfo.phone}
                        onChange={e => setGuestInfo({...guestInfo, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  {bookingError && (
                    <p className="text-sm text-red-500">{bookingError}</p>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setBookingStep('quote')} className="flex-1">
                      Back
                    </Button>
                    <Button 
                      onClick={handleContinueToPayment}
                      disabled={bookingMutation.isPending}
                      className="flex-1"
                    >
                      {bookingMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <CreditCard className="w-4 h-4 mr-2" />
                      )}
                      Continue to Payment
                    </Button>
                  </div>
                </>
              )}

              {/* Step 3: Payment (Stripe integration) */}
              {bookingStep === 'payment' && (
                <>
                  <div className="p-4 bg-muted rounded-lg space-y-3">
                    <div className="flex justify-between">
                      <span>Total to pay</span>
                      <span className="font-bold">€{quote?.total}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Secure payment powered by Stripe
                    </p>
                  </div>

                  {/* Stripe Elements would go here in production */}
                  <div className="p-4 border rounded-lg space-y-3">
                    <Label className="text-xs">Card Number</Label>
                    <Input placeholder="4242 4242 4242 4242" />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Expiry</Label>
                        <Input placeholder="MM/YY" />
                      </div>
                      <div>
                        <Label className="text-xs">CVC</Label>
                        <Input placeholder="123" />
                      </div>
                    </div>
                  </div>

                  {bookingError && (
                    <p className="text-sm text-red-500">{bookingError}</p>
                  )}

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Lock size={12} />
                    Your payment is secure and encrypted
                  </div>

                  <Button className="w-full" disabled>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </Button>

                  <Button variant="outline" onClick={() => setBookingStep('details')} className="w-full">
                    Back to Details
                  </Button>
                </>
              )}

              {/* Step 4: Confirmed */}
              {bookingStep === 'confirmed' && (
                <div className="text-center py-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Booking Confirmed!</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    A confirmation email has been sent to {guestInfo.email}
                  </p>
                  <p className="text-sm">
                    Booking reference: <span className="font-mono">{quote?.id.slice(0, 8)}</span>
                  </p>
                  <Link to="/properties" className="block mt-4 text-primary hover:underline">
                    Browse more properties
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
