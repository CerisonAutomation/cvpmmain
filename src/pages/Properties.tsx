import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import BookingSearchBar from '@/components/BookingSearchBar';
import { motion } from 'framer-motion';
import { MapPin, Star, Users, BedDouble } from 'lucide-react';
import propertyFives from '@/assets/property-fives.jpg';
import propertyPenthouse from '@/assets/property-penthouse.jpg';
import propertyUrsula from '@/assets/property-ursula.jpg';
import portfolio1 from '@/assets/portfolio-1.jpg';
import portfolio2 from '@/assets/portfolio-2.jpg';
import portfolio3 from '@/assets/portfolio-3.jpg';

// Mock property data — will be replaced by Guesty API calls via Cloud
const PROPERTIES = [
  { id: '1', title: 'The Fives Penthouse', location: 'Sliema', beds: 3, guests: 6, rating: 4.98, price: 185, image: propertyFives },
  { id: '2', title: 'Harbour View Suite', location: 'Valletta', beds: 2, guests: 4, rating: 4.95, price: 145, image: propertyPenthouse },
  { id: '3', title: 'Villa St Ursula', location: 'Mellieħa', beds: 4, guests: 8, rating: 4.97, price: 260, image: propertyUrsula },
  { id: '4', title: 'Modern Waterfront Flat', location: 'San Ġiljan', beds: 2, guests: 4, rating: 4.92, price: 130, image: portfolio1 },
  { id: '5', title: 'Gozo Farmhouse Retreat', location: 'Xagħra', beds: 3, guests: 6, rating: 4.99, price: 210, image: portfolio2 },
  { id: '6', title: 'Designer Loft Msida', location: 'Msida', beds: 1, guests: 2, rating: 4.90, price: 95, image: portfolio3 },
];

export default function Properties() {
  const [searchParams] = useSearchParams();
  const locationFilter = searchParams.get('location') || '';
  const [activeLocation, setActiveLocation] = useState(locationFilter);

  const filtered = activeLocation
    ? PROPERTIES.filter((p) => p.location.toLowerCase().includes(activeLocation.toLowerCase()))
    : PROPERTIES;

  return (
    <Layout>
      {/* Search bar section */}
      <section className="py-10 border-b border-border/30">
        <div className="section-container">
          <BookingSearchBar
            variant="page"
            onSearch={(params) => setActiveLocation(params.location)}
          />
        </div>
      </section>

      {/* Results */}
      <section className="py-12">
        <div className="section-container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-serif text-2xl font-semibold text-foreground">
                {activeLocation ? `Properties in ${activeLocation}` : 'All Properties'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">{filtered.length} properties available</p>
            </div>
            {activeLocation && (
              <button
                onClick={() => setActiveLocation('')}
                className="text-xs text-primary hover:underline"
              >
                Clear filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((property, i) => (
              <motion.article
                key={property.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group rounded-2xl border border-border/50 overflow-hidden bg-card hover:border-primary/30 transition-colors cursor-pointer"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-2.5 py-1">
                    <Star size={12} className="text-primary fill-primary" />
                    <span className="text-xs font-semibold text-foreground">{property.rating}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                    <MapPin size={12} className="text-primary" />
                    {property.location}
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {property.title}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1"><BedDouble size={13} /> {property.beds} bed{property.beds > 1 && 's'}</span>
                    <span className="flex items-center gap-1"><Users size={13} /> {property.guests} guests</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-border/30">
                    <p className="text-foreground font-semibold">
                      €{property.price}<span className="text-xs font-normal text-muted-foreground"> / night</span>
                    </p>
                    <span className="text-xs font-medium text-primary">View →</span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No properties found for "{activeLocation}"</p>
              <button onClick={() => setActiveLocation('')} className="mt-3 text-sm text-primary hover:underline">
                Show all properties
              </button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
