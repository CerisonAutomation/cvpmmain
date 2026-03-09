import { useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin, Star, Users, BedDouble, Bath, ChevronLeft, ChevronRight,
  Wifi, Car, Waves, Wind, Coffee, Tv, Utensils, Flame, Shirt, Snowflake,
  Check, Calendar, Home, AlertCircle, Loader2, Lock, Share2, Heart,
  ArrowLeft, ChevronDown, Shield
} from 'lucide-react';
import Layout from '@/components/Layout';
import { PropertyDetailSkeleton } from '@/components/ui/skeleton-variants';
import { SEOHead, createPropertySchema, createBreadcrumbSchema } from '@/components/SEOHead';
import { ErrorState } from '@/components/ui/error-states';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useListing, useListingCalendar, useCreateQuote, useRatePlans,
  normalizeListingDetail
} from '@/lib/guesty/hooks';
import type { NormalizedListingDetail } from '@/lib/guesty/normalizer';
import type { CalendarDay } from '@/lib/guesty/types';

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

/** Generate month grid for calendar display */
function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = firstDay === 0 ? 6 : firstDay - 1; // Monday start
  const days: (number | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function toLocalDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [calMonth, setCalMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  // Live data
  const { data: rawListing, isLoading, error } = useListing(id);
  const quoteMutation = useCreateQuote();
  const { data: ratePlans } = useRatePlans(id);

  // Calendar: fetch 3 months ahead
  const calFrom = useMemo(() => {
    const d = new Date(calMonth.year, calMonth.month, 1);
    return toLocalDate(d);
  }, [calMonth]);
  const calTo = useMemo(() => {
    const d = new Date(calMonth.year, calMonth.month + 3, 0);
    return toLocalDate(d);
  }, [calMonth]);
  const { data: calendarData } = useListingCalendar(id, calFrom, calTo);

  // Build availability lookup
  const availabilityMap = useMemo(() => {
    const map = new Map<string, CalendarDay>();
    if (Array.isArray(calendarData)) {
      calendarData.forEach((day) => map.set(day.date, day));
    }
    return map;
  }, [calendarData]);

  const property: NormalizedListingDetail | null = rawListing ? normalizeListingDetail(rawListing) : null;

  const handleGetQuote = useCallback(() => {
    if (!id || !checkIn || !checkOut) return;
    quoteMutation.mutate({
      listingId: id,
      checkInDateLocalized: checkIn,
      checkOutDateLocalized: checkOut,
      guestsCount: guests,
    });
  }, [id, checkIn, checkOut, guests, quoteMutation]);

  const handleCalendarDayClick = useCallback((dateStr: string) => {
    const day = availabilityMap.get(dateStr);
    if (day && !day.available) return;
    const today = toLocalDate(new Date());
    if (dateStr < today) return;

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(dateStr);
      setCheckOut('');
    } else if (dateStr > checkIn) {
      setCheckOut(dateStr);
    } else {
      setCheckIn(dateStr);
      setCheckOut('');
    }
  }, [checkIn, checkOut, availabilityMap]);

  const navigateMonth = useCallback((delta: number) => {
    setCalMonth((prev) => {
      let m = prev.month + delta;
      let y = prev.year;
      if (m < 0) { m = 11; y--; }
      if (m > 11) { m = 0; y++; }
      return { year: y, month: m };
    });
  }, []);

  // Calculate nights
  const nightsCount = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
  }, [checkIn, checkOut]);

  if (isLoading) {
    return (
      <Layout>
        <PropertyDetailSkeleton />
      </Layout>
    );
  }

  if (error || !property) {
    return (
      <Layout>
        <ErrorState
          type="notfound"
          title="Property not found"
          message={error instanceof Error ? error.message : 'Unable to load this property'}
          onRetry={() => window.location.reload()}
        />
      </Layout>
    );
  }

  const images = property.images.length > 0 ? property.images : [{ id: '0', thumbnail: '/placeholder.svg', regular: '/placeholder.svg', large: '/placeholder.svg', original: '/placeholder.svg' }];
  const amenities = property.amenityLabels || [];
  const quote = quoteMutation.data;

  // Calendar grid
  const monthDays = getMonthDays(calMonth.year, calMonth.month);
  const todayStr = toLocalDate(new Date());

  return (
    <Layout>
      <SEOHead
        title={property.title}
        description={`${property.title} — ${property.bedrooms} bed, ${property.bathrooms} bath luxury rental in ${property.city}. From €${property.basePrice}/night.`}
        image={images[0]?.large || images[0]?.original}
        keywords={['Malta rental', property.city, property.title]}
        structuredData={createPropertySchema({
          name: property.title,
          description: property.description || '',
          image: images[0]?.original || '',
          address: { city: property.city, country: property.country || 'Malta' },
          price: property.basePrice,
          rating: property.rating,
        })}
      />
      {/* Back nav */}
      <div className="section-container py-3">
        <Link to="/properties" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} /> All Properties
        </Link>
      </div>

      {/* Image Gallery */}
      <section className="relative h-[50vh] md:h-[60vh] bg-secondary">
        <img
          src={images[currentImageIdx]?.large || images[currentImageIdx]?.original}
          alt={property.title}
          className="w-full h-full object-cover"
          loading="eager"
        />
        {images.length > 1 && (
          <>
            <button onClick={() => setCurrentImageIdx((currentImageIdx - 1 + images.length) % images.length)} className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm p-2.5 rounded-full hover:bg-background transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => setCurrentImageIdx((currentImageIdx + 1) % images.length)} className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm p-2.5 rounded-full hover:bg-background transition-colors">
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.slice(0, 8).map((_, i) => (
                <button key={i} onClick={() => setCurrentImageIdx(i)} className={`w-2 h-2 rounded-full transition-colors ${i === currentImageIdx ? 'bg-primary' : 'bg-foreground/30'}`} />
              ))}
              {images.length > 8 && <span className="text-[10px] text-foreground/50 ml-1">+{images.length - 8}</span>}
            </div>
          </>
        )}

        {/* Image counter & actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <span className="bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium">
            {currentImageIdx + 1} / {images.length}
          </span>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-10">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <MapPin size={16} className="text-primary" /> {property.city}{property.country ? `, ${property.country}` : ''}
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">{property.title}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Users size={16} /> {property.accommodates} guests</span>
              <span className="flex items-center gap-1.5"><BedDouble size={16} /> {property.bedrooms} {property.bedrooms === 1 ? 'bedroom' : 'bedrooms'}</span>
              <span className="flex items-center gap-1.5"><Bath size={16} /> {property.bathrooms} {property.bathrooms === 1 ? 'bathroom' : 'bathrooms'}</span>
              {property.rating != null && property.rating > 0 && (
                <span className="flex items-center gap-1.5"><Star size={16} className="text-primary fill-primary" /> {property.rating.toFixed(1)}</span>
              )}
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div>
              <h2 className="font-serif text-xl font-semibold mb-4">About this property</h2>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{property.description}</p>
            </div>
          )}

          {/* Availability Calendar */}
          <div>
            <h2 className="font-serif text-xl font-semibold mb-4">Availability</h2>
            <div className="satin-surface rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-accent rounded-lg transition-colors">
                  <ChevronLeft size={18} />
                </button>
                <h3 className="font-semibold text-sm">
                  {MONTH_NAMES[calMonth.month]} {calMonth.year}
                </h3>
                <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-accent rounded-lg transition-colors">
                  <ChevronRight size={18} />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                  <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground uppercase tracking-wider py-1">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {monthDays.map((day, i) => {
                  if (day === null) return <div key={`empty-${i}`} />;
                  const dateStr = `${calMonth.year}-${String(calMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const calDay = availabilityMap.get(dateStr);
                  const isPast = dateStr < todayStr;
                  const isBlocked = calDay ? !calDay.available : false;
                  const isCheckIn = dateStr === checkIn;
                  const isCheckOut = dateStr === checkOut;
                  const isInRange = checkIn && checkOut && dateStr > checkIn && dateStr < checkOut;
                  const isDisabled = isPast || isBlocked;

                  return (
                    <button
                      key={dateStr}
                      onClick={() => !isDisabled && handleCalendarDayClick(dateStr)}
                      disabled={isDisabled}
                      className={`
                        relative h-10 rounded-lg text-xs font-medium transition-all
                        ${isCheckIn || isCheckOut ? 'bg-primary text-primary-foreground' : ''}
                        ${isInRange ? 'bg-primary/15 text-foreground' : ''}
                        ${isDisabled ? 'text-muted-foreground/30 cursor-not-allowed line-through' : 'hover:bg-accent cursor-pointer'}
                        ${!isCheckIn && !isCheckOut && !isInRange && !isDisabled ? 'text-foreground' : ''}
                      `}
                    >
                      {day}
                      {calDay?.price && !isDisabled && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] text-muted-foreground">
                          €{Math.round(calDay.price)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary" /> Selected</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary/15" /> Stay</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-muted line-through" /> Unavailable</span>
              </div>
            </div>
          </div>

          {/* Sleeping Arrangements */}
          {property.bedrooms_detail.length > 0 && (
            <div>
              <h2 className="font-serif text-xl font-semibold mb-4">Sleeping Arrangements</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.bedrooms_detail.map((room, i) => (
                  <div key={i} className="p-4 satin-surface rounded-xl">
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
                  <div key={amenity} className="flex items-center gap-2.5 text-sm py-2">
                    {AMENITY_ICONS[amenity] || AMENITY_ICONS[property.amenities[amenities.indexOf(amenity)]] || <Check size={16} className="text-primary" />}
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
              {amenities.length > 12 && (
                <button onClick={() => setShowAllAmenities(!showAllAmenities)} className="text-primary text-sm mt-3 font-medium">
                  {showAllAmenities ? 'Show fewer' : `Show all ${amenities.length} amenities`}
                </button>
              )}
            </div>
          )}

          {/* Policies */}
          <div>
            <h2 className="font-serif text-xl font-semibold mb-4">House Rules &amp; Policies</h2>
            <div className="space-y-3 text-sm">
              {property.policies.checkInTime && (
                <div className="flex items-start gap-3">
                  <Calendar size={16} className="text-primary mt-0.5 shrink-0" />
                  <div><strong>Check-in:</strong> {property.policies.checkInTime}</div>
                </div>
              )}
              {property.policies.checkOutTime && (
                <div className="flex items-start gap-3">
                  <Calendar size={16} className="text-primary mt-0.5 shrink-0" />
                  <div><strong>Check-out:</strong> {property.policies.checkOutTime}</div>
                </div>
              )}
              {property.policies.cancellation && (
                <div className="flex items-start gap-3">
                  <Shield size={16} className="text-primary mt-0.5 shrink-0" />
                  <div><strong>Cancellation:</strong> {property.policies.cancellation}</div>
                </div>
              )}
              {property.policies.houseRules && (
                <div className="mt-3 p-4 satin-surface rounded-xl">
                  <p className="text-muted-foreground">{property.policies.houseRules}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Booking Sidebar ── */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 satin-surface border border-border/50 rounded-2xl p-6 shadow-lg space-y-5">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-bold text-foreground">€{property.basePrice}</span>
                <span className="text-muted-foreground text-sm"> / night</span>
              </div>
              {property.rating != null && property.rating > 0 && (
                <span className="flex items-center gap-1 text-sm">
                  <Star size={14} className="text-primary fill-primary" /> {property.rating.toFixed(1)}
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Check-in</Label>
                  <Input
                    type="date"
                    value={checkIn}
                    min={todayStr}
                    onChange={e => {
                      setCheckIn(e.target.value);
                      if (checkOut && e.target.value >= checkOut) setCheckOut('');
                    }}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Check-out</Label>
                  <Input
                    type="date"
                    value={checkOut}
                    min={checkIn || todayStr}
                    onChange={e => setCheckOut(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Guests</Label>
                <select
                  value={guests}
                  onChange={e => setGuests(Number(e.target.value))}
                  className="w-full mt-1 p-2.5 border border-input rounded-md bg-background text-sm text-foreground"
                >
                  {[...Array(property.accommodates || 10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? 'guest' : 'guests'}</option>
                  ))}
                </select>
              </div>

              {/* Price summary */}
              {nightsCount > 0 && !quote && (
                <div className="p-3 bg-accent/50 rounded-lg text-sm space-y-1">
                  <div className="flex justify-between text-muted-foreground">
                    <span>€{property.basePrice} × {nightsCount} {nightsCount === 1 ? 'night' : 'nights'}</span>
                    <span>€{(property.basePrice * nightsCount).toLocaleString()}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground pt-1">Get an exact quote below for final pricing incl. fees</p>
                </div>
              )}

              {/* Quote result */}
              {quote && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 satin-surface rounded-lg text-sm space-y-2 border border-primary/20"
                >
                  <div className="flex justify-between">
                    <span>Accommodation ({quote.nightsCount} {quote.nightsCount === 1 ? 'night' : 'nights'})</span>
                    <span>€{quote.priceBreakdown.accommodation?.toLocaleString()}</span>
                  </div>
                  {quote.priceBreakdown.cleaningFee != null && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Cleaning fee</span>
                      <span>€{quote.priceBreakdown.cleaningFee}</span>
                    </div>
                  )}
                  {quote.priceBreakdown.taxes != null && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Taxes &amp; charges</span>
                      <span>€{quote.priceBreakdown.taxes}</span>
                    </div>
                  )}
                  {quote.priceBreakdown.fees != null && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Service fees</span>
                      <span>€{quote.priceBreakdown.fees}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-foreground pt-2 border-t border-border/50">
                    <span>Total</span>
                    <span>€{quote.priceBreakdown.total?.toLocaleString()}</span>
                  </div>
                </motion.div>
              )}

              {quoteMutation.error && (
                <p className="text-sm text-destructive flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  {quoteMutation.error instanceof Error ? quoteMutation.error.message : 'Unable to retrieve quote'}
                </p>
              )}

              <Button
                onClick={handleGetQuote}
                disabled={!checkIn || !checkOut || quoteMutation.isPending}
                className="w-full h-12 text-sm font-semibold"
                size="lg"
              >
                {quoteMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Calendar className="w-4 h-4 mr-2" />
                )}
                {quote ? 'Update Quote' : 'Check Availability & Price'}
              </Button>

              {quote && (
                <Button variant="outline" className="w-full h-11 text-sm font-semibold" asChild>
                  <Link to={`/book?listing=${id}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&quoteId=${quote._id}`}>
                    Proceed to Booking
                  </Link>
                </Button>
              )}

              <div className="flex items-center gap-2 text-[11px] text-muted-foreground justify-center pt-1">
                <Lock size={12} />
                Secure booking · You won't be charged yet
              </div>
            </div>

            {/* Rate plans */}
            {Array.isArray(ratePlans) && ratePlans.length > 1 && (
              <div className="pt-3 border-t border-border/30">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Rate Plans</p>
                <div className="space-y-1.5">
                  {ratePlans.slice(0, 3).map(plan => (
                    <div key={plan._id} className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-accent/50 transition-colors">
                      <span className="font-medium">{plan.name}</span>
                      <span className="text-muted-foreground">from €{plan.pricing?.basePrice}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
