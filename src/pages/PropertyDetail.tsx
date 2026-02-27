import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, Users, BedDouble, Bath, ChevronLeft, ChevronRight, Wifi, Car, Waves, Wind, Coffee, Tv, Utensils, Flame, Shirt, Snowflake, Check, ExternalLink, Calendar, Home } from 'lucide-react';
import Layout from '@/components/Layout';
import { useListing, useCreateQuote, useReviews } from '@/lib/guesty';
import { ALL_PROPERTIES } from '@/lib/properties-data';

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  WIRELESS_INTERNET: <Wifi size={16} />, INTERNET: <Wifi size={16} />,
  FREE_PARKING_ON_PREMISES: <Car size={16} />, HOT_TUB: <Waves size={16} />,
  AIR_CONDITIONING: <Snowflake size={16} />, HEATING: <Flame size={16} />,
  COFFEE_MAKER: <Coffee size={16} />, TV: <Tv size={16} />, CABLE_TV: <Tv size={16} />,
  KITCHEN: <Utensils size={16} />, WASHER: <Shirt size={16} />, DRYER: <Wind size={16} />,
};

const AMENITY_LABELS: Record<string, string> = {
  WIRELESS_INTERNET: 'Wi-Fi', INTERNET: 'Internet', FREE_PARKING_ON_PREMISES: 'Free Parking',
  HOT_TUB: 'Hot Tub', AIR_CONDITIONING: 'Air Conditioning', HEATING: 'Heating',
  COFFEE_MAKER: 'Coffee Maker', TV: 'TV', CABLE_TV: 'Cable TV', KITCHEN: 'Kitchen',
  WASHER: 'Washer', DRYER: 'Dryer', HAIR_DRYER: 'Hair Dryer', IRON: 'Iron',
  ESSENTIALS: 'Essentials', SHAMPOO: 'Shampoo', HANGERS: 'Hangers', BED_LINENS: 'Bed Linens',
  EXTRA_PILLOWS_AND_BLANKETS: 'Extra Pillows', FIRE_EXTINGUISHER: 'Fire Extinguisher',
  FIRST_AID_KIT: 'First Aid Kit', SMOKE_DETECTOR: 'Smoke Detector',
  CARBON_MONOXIDE_DETECTOR: 'CO Detector', ELEVATOR_IN_BUILDING: 'Elevator',
  PATIO_OR_BALCONY: 'Balcony/Patio', DISHWASHER: 'Dishwasher', REFRIGERATOR: 'Refrigerator',
  OVEN: 'Oven', STOVE: 'Stove', MICROWAVE: 'Microwave', COOKING_BASICS: 'Cooking Basics',
  DISHES_AND_SILVERWARE: 'Dishes & Silverware', BBQ_GRILL: 'BBQ Grill',
  GARDEN_OR_BACKYARD: 'Garden', LAPTOP_FRIENDLY_WORKSPACE: 'Workspace', GYM: 'Gym',
  PRIVATE_ENTRANCE: 'Private Entrance', HOT_WATER: 'Hot Water',
  LONG_TERM_STAYS_ALLOWED: 'Long-term OK', SUITABLE_FOR_CHILDREN: 'Child Friendly',
  PETS_ALLOWED: 'Pets Allowed',
};

export default function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [quoteResult, setQuoteResult] = useState<any>(null);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  const { data: listing, isLoading } = useListing(id);
  const { data: reviews } = useReviews(id ? { listingId: id, limit: 5 } : {});
  const createQuote = useCreateQuote();

  // Look up static data from the guide as fallback
  const staticProp = ALL_PROPERTIES.find(p => p.id === id);

  const property = useMemo(() => {
    if (listing) {
      return {
        title: listing.title,
        location: listing.address?.city || listing.publishedAddress?.city || listing.address?.full || 'Malta',
        beds: listing.bedrooms,
        baths: listing.bathrooms,
        guests: listing.accommodates,
        rating: listing.rating || 4.97,
        reviewsCount: listing.reviewsCount || 0,
        price: listing.prices?.basePrice || 0,
        currency: listing.prices?.currency || 'EUR',
        images: listing.pictures?.map(p => p.large || p.original) || [],
        amenities: listing.amenities || [],
        description: listing.publicDescription?.summary || '',
        space: listing.publicDescription?.space || '',
        neighborhood: listing.publicDescription?.neighborhood || '',
        transit: listing.publicDescription?.transit || '',
        houseRules: listing.publicDescription?.houseRules || '',
        notes: listing.publicDescription?.notes || '',
        access: listing.publicDescription?.access || '',
        checkInTime: listing.defaultCheckInTime || '15:00',
        checkOutTime: listing.defaultCheckOutTime || '11:00',
        propertyType: listing.propertyType || 'APARTMENT',
        cleaningFee: listing.prices?.cleaningFee,
        bedArrangements: listing.bedArrangements,
        bookingUrl: `https://malta.guestybookings.com/en/properties/${listing._id}`,
        lat: listing.publishedAddress?.lat || listing.address?.lat,
        lng: listing.publishedAddress?.lng || listing.address?.lng,
        tags: listing.tags || [],
      };
    }
    if (staticProp) {
      return {
        title: staticProp.title, location: staticProp.location,
        beds: staticProp.bedrooms, baths: staticProp.bathrooms, guests: staticProp.guests,
        rating: 4.97, reviewsCount: 0,
        price: staticProp.pricePerNight,
        currency: 'EUR',
        images: [] as string[],
        amenities: ['WIRELESS_INTERNET', 'AIR_CONDITIONING', 'KITCHEN', 'WASHER', 'TV', 'ESSENTIALS', 'BED_LINENS', 'HOT_WATER'],
        description: staticProp.summary,
        space: '', neighborhood: '', transit: '', houseRules: '', notes: '', access: '',
        checkInTime: '15:00', checkOutTime: '11:00',
        propertyType: 'APARTMENT',
        cleaningFee: undefined, bedArrangements: undefined,
        bookingUrl: staticProp.bookingUrl, lat: undefined, lng: undefined, tags: [] as string[],
      };
    }
    return null;
  }, [listing, staticProp]);

  const handleQuote = async () => {
    if (!id || !checkIn || !checkOut) {
      window.open(property?.bookingUrl, '_blank');
      return;
    }
    try {
      const quote = await createQuote.mutateAsync({
        listingId: id,
        checkInDateLocalized: checkIn,
        checkOutDateLocalized: checkOut,
        guestsCount: guests,
      });
      setQuoteResult(quote);
    } catch {
      window.open(property?.bookingUrl, '_blank');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground mt-4 text-sm">Loading property...</p>
        </div>
      </Layout>
    );
  }

  if (!property) {
    return (
      <Layout>
        <div className="py-20 text-center">
          <h1 className="font-serif text-2xl text-foreground mb-2">Property Not Found</h1>
          <p className="text-muted-foreground mb-6">This property doesn't exist or is no longer available.</p>
          <Link to="/properties" className="text-primary hover:underline text-sm">← Back to Properties</Link>
        </div>
      </Layout>
    );
  }

  const images = property.images.length > 0 ? property.images : [];
  const visibleAmenities = property.amenities.filter(a => AMENITY_LABELS[a]);
  const displayAmenities = showAllAmenities ? visibleAmenities : visibleAmenities.slice(0, 12);
  const today = new Date().toISOString().split('T')[0];

  return (
    <Layout>
      <div className="section-container py-8">
        <Link to="/properties" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
          <ChevronLeft size={16} /> Back to Properties
        </Link>

        {/* Image gallery */}
        {images.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 rounded-2xl overflow-hidden mb-8">
              <div className="md:col-span-2 md:row-span-2 relative aspect-[4/3] md:aspect-auto cursor-pointer" onClick={() => setCurrentImageIdx(0)}>
                <img src={images[0]} alt={property.title} className="w-full h-full object-cover" />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-background/80 to-transparent p-4 md:p-6">
                  <span className="px-2 py-0.5 bg-background/60 backdrop-blur-sm rounded text-[10px] text-muted-foreground uppercase tracking-wider">
                    {property.propertyType}
                  </span>
                </div>
              </div>
              {images.slice(1, 5).map((img, i) => (
                <div key={i} className="hidden md:block aspect-[4/3] cursor-pointer relative group" onClick={() => setCurrentImageIdx(i + 1)}>
                  <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              ))}
            </div>

            {/* Mobile carousel */}
            {images.length > 1 && (
              <div className="md:hidden relative mb-6">
                <div className="aspect-[16/9] relative rounded-xl overflow-hidden">
                  <motion.img key={currentImageIdx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={images[currentImageIdx]} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => setCurrentImageIdx(i => (i - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center">
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={() => setCurrentImageIdx(i => (i + 1) % images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center">
                    <ChevronRight size={16} />
                  </button>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-background/60 backdrop-blur-sm rounded-full text-xs">{currentImageIdx + 1} / {images.length}</div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="aspect-[21/9] rounded-2xl bg-secondary flex items-center justify-center mb-8">
            <div className="text-center text-muted-foreground/40">
              <Home size={48} className="mx-auto mb-2" />
              <p className="text-sm">Photos available on booking page</p>
            </div>
          </div>
        )}

        {/* Content grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-10">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <MapPin size={14} className="text-primary" /> {property.location}
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-4">{property.title}</h1>
              <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><BedDouble size={15} /> {property.beds} bedroom{property.beds !== 1 ? 's' : ''}</span>
                <span className="flex items-center gap-1.5"><Bath size={15} /> {property.baths} bathroom{property.baths !== 1 ? 's' : ''}</span>
                <span className="flex items-center gap-1.5"><Users size={15} /> Up to {property.guests} guests</span>
                <span className="flex items-center gap-1.5"><Star size={15} className="text-primary fill-primary" /> {property.rating} {property.reviewsCount > 0 && `(${property.reviewsCount} reviews)`}</span>
              </div>
            </div>

            {property.description && (
              <div>
                <h2 className="font-serif text-xl font-semibold text-foreground mb-3">About this property</h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{property.description}</p>
              </div>
            )}

            {property.space && (
              <div>
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2">The space</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{property.space}</p>
              </div>
            )}

            {property.access && (
              <div>
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2">Guest access</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{property.access}</p>
              </div>
            )}

            {property.bedArrangements?.details && property.bedArrangements.details.length > 0 && (
              <div>
                <h2 className="font-serif text-xl font-semibold text-foreground mb-3">Sleeping arrangements</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.bedArrangements.details.map((room, i) => (
                    <div key={i} className="satin-surface rounded-lg p-4 text-center">
                      <BedDouble size={24} className="text-primary mx-auto mb-2" />
                      <p className="text-xs font-semibold text-foreground mb-1">{room.roomName}</p>
                      {room.beds.map((bed, j) => (
                        <p key={j} className="text-xs text-muted-foreground">{bed.count}× {bed.type.replace(/([A-Z])/g, ' $1').trim()}</p>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {visibleAmenities.length > 0 && (
              <div>
                <h2 className="font-serif text-xl font-semibold text-foreground mb-3">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {displayAmenities.map(amenity => (
                    <div key={amenity} className="flex items-center gap-2.5 text-sm text-muted-foreground py-1.5">
                      <span className="text-primary">{AMENITY_ICONS[amenity] || <Check size={14} />}</span>
                      {AMENITY_LABELS[amenity]}
                    </div>
                  ))}
                </div>
                {visibleAmenities.length > 12 && (
                  <button onClick={() => setShowAllAmenities(!showAllAmenities)} className="mt-3 text-sm text-primary hover:underline">
                    {showAllAmenities ? 'Show less' : `Show all ${visibleAmenities.length} amenities`}
                  </button>
                )}
              </div>
            )}

            <div>
              <h2 className="font-serif text-xl font-semibold text-foreground mb-3">House rules</h2>
              <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Calendar size={14} className="text-primary" /> Check-in: {property.checkInTime}</div>
                <div className="flex items-center gap-2"><Calendar size={14} className="text-primary" /> Check-out: {property.checkOutTime}</div>
              </div>
              {property.houseRules && <p className="mt-3 text-sm text-muted-foreground whitespace-pre-line">{property.houseRules}</p>}
            </div>

            {property.neighborhood && (
              <div>
                <h2 className="font-serif text-xl font-semibold text-foreground mb-3">The neighbourhood</h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{property.neighborhood}</p>
              </div>
            )}

            {property.transit && (
              <div>
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2">Getting around</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{property.transit}</p>
              </div>
            )}

            {reviews && reviews.length > 0 && (
              <div>
                <h2 className="font-serif text-xl font-semibold text-foreground mb-4">Guest Reviews</h2>
                <div className="space-y-4">
                  {reviews.map(review => (
                    <div key={review._id} className="satin-surface rounded-lg p-5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-foreground">{review.guestName}</p>
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-primary fill-primary" />
                          <span className="text-xs text-foreground">{review.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{review.publicReview}</p>
                      <p className="text-xs text-muted-foreground/60 mt-2">{new Date(review.createdAt).toLocaleDateString('en-MT')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {property.lat && property.lng && (
              <div>
                <h2 className="font-serif text-xl font-semibold text-foreground mb-3">Location</h2>
                <div className="rounded-xl overflow-hidden border border-border/50">
                  <iframe
                    title="Property location"
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${property.lat},${property.lng}&zoom=15`}
                    className="w-full h-[300px]"
                    loading="lazy"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>

          {/* Booking sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 satin-surface rounded-2xl p-6 satin-glow">
              <div className="mb-5">
                <p className="text-2xl font-bold text-foreground">€{property.price}<span className="text-sm font-normal text-muted-foreground"> / night</span></p>
                {property.cleaningFee && <p className="text-xs text-muted-foreground mt-1">+ €{property.cleaningFee} cleaning fee</p>}
              </div>

              <div className="space-y-3 mb-5">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Check-in</label>
                  <input type="date" value={checkIn} min={today} onChange={e => setCheckIn(e.target.value)} className="form-input [color-scheme:dark]" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Check-out</label>
                  <input type="date" value={checkOut} min={checkIn || today} onChange={e => setCheckOut(e.target.value)} className="form-input [color-scheme:dark]" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Guests</label>
                  <select value={guests} onChange={e => setGuests(Number(e.target.value))} className="form-input">
                    {Array.from({ length: property.guests }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              {quoteResult && (
                <div className="mb-5 p-4 rounded-lg bg-secondary text-sm space-y-2">
                  <p className="font-semibold text-foreground">Price Breakdown</p>
                  {quoteResult.priceBreakdown?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-muted-foreground">
                      <span>{item.description}</span>
                      <span>€{item.value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-foreground pt-2 border-t border-border">
                    <span>Total</span>
                    <span>€{quoteResult.totalPrice}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleQuote}
                disabled={createQuote.isPending}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {createQuote.isPending ? 'Getting price...' : checkIn && checkOut ? 'Get Price Quote' : 'Check Availability'}
              </button>

              <a
                href={property.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 w-full py-2.5 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2"
              >
                Book on Guesty <ExternalLink size={12} />
              </a>

              <p className="text-[10px] text-muted-foreground/60 text-center mt-3">No charge until booking is confirmed</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
