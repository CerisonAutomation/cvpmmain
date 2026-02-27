import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, Users, BedDouble, Bath, ChevronLeft, ChevronRight, Wifi, Car, Waves, Wind, Coffee, Tv, Utensils, Flame, Shirt, Snowflake, Check, ExternalLink, Calendar, Home } from 'lucide-react';
import Layout from '@/components/Layout';
import { fetchProperty, createQuote } from '@/lib/api';

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
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [quoteResult, setQuoteResult] = useState<any>(null);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    fetchProperty(id)
      .then(data => {
        if (data) {
          setProperty(data);
        } else {
          setError('Property not found');
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleGetQuote = async () => {
    if (!property || !checkIn || !checkOut) return;
    
    setQuoteLoading(true);
    try {
      const unitId = property.units?.[0]?.id;
      if (!unitId) {
        setError('No units available');
        return;
      }
      
      const quote = await createQuote({
        propertyId: property.id,
        unitId,
        checkIn,
        checkOut,
        adults: guests,
      });
      setQuoteResult(quote);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setQuoteLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (error || !property) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="text-red-500">{error || 'Property not found'}</p>
          <Link to="/properties" className="text-primary hover:underline mt-4 inline-block">Back to Properties</Link>
        </div>
      </Layout>
    );
  }

  const images = property.gallery || [property.hero_image].filter(Boolean);
  const amenities = property.amenities || [];
  const unit = property.units?.[0];

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
                  {AMENITY_ICONS[amenity] || <Check size={16} />}
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

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-card border rounded-xl p-6 shadow-lg">
            <div className="mb-6">
              <span className="text-3xl font-bold">€{property.price_per_night}</span>
              <span className="text-muted-foreground"> / night</span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Check-in</label>
                  <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Check-out</label>
                  <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} className="w-full p-2 border rounded" />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Guests</label>
                <select value={guests} onChange={e => setGuests(Number(e.target.value))} className="w-full p-2 border rounded">
                  {[...Array(property.max_guests)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1} guest{i > 0 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={handleGetQuote}
                disabled={!checkIn || !checkOut || quoteLoading}
                className="w-full py-3 bg-primary text-primary-foreground rounded font-semibold hover:opacity-90 disabled:opacity-50"
              >
                {quoteLoading ? 'Calculating...' : quoteResult ? 'Update Quote' : 'Get Quote'}
              </button>
            </div>

            {quoteResult && (
              <div className="mt-6 pt-6 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span>€{quoteResult.lineItems?.[0]?.amount} × {quoteResult.nights} nights</span>
                </div>
                {quoteResult.lineItems?.slice(1).map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{item.label}</span>
                    <span>€{item.amount}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>€{quoteResult.total}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Expires: {new Date(quoteResult.expiresAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
