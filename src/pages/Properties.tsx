import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import BookingSearchBar from '@/components/BookingSearchBar';
import MaltaMap, { MALTA_LOCALITIES_COORDS, type MapLocation } from '@/components/MaltaMap';
import { motion } from 'framer-motion';
import { MapPin, Star, Users, BedDouble, Bath, ExternalLink, Map, LayoutGrid } from 'lucide-react';
import { fetchProperties } from '@/lib/api';

/** Fetch properties from server (Supabase) - NOT hardcoded */
function useProperties() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProperties()
      .then(setProperties)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { properties, loading, error };
}

// Map locations with prices
function buildMapLocations(properties: any[]) {
  return MALTA_LOCALITIES_COORDS.map(loc => {
    const matches = properties.filter(p =>
      p.destination?.toLowerCase().includes(loc.name.toLowerCase().split(' ')[0]) ||
      loc.name.toLowerCase().includes(p.destination?.toLowerCase().split(',')[0].trim().toLowerCase())
    );
    return { ...loc, price: matches[0]?.price_per_night, count: matches.length || undefined };
  });
}

export default function Properties() {
  const [searchParams] = useSearchParams();
  const locationFilter = searchParams.get('location') || '';
  const [activeLocation, setActiveLocation] = useState(locationFilter);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const { properties, loading, error } = useProperties();
  const mapLocations = buildMapLocations(properties);

  const filtered = activeLocation
    ? properties.filter((p) => p.destination?.toLowerCase().includes(activeLocation.toLowerCase()))
    : properties;

  const handleMapClick = (loc: MapLocation) => {
    setActiveLocation(loc.name === activeLocation ? '' : loc.name.split(' ')[0]);
    setViewMode('grid');
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

  if (error) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="text-red-500">Error loading properties: {error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-8 border-b border-border/30">
        <div className="section-container">
          <BookingSearchBar variant="page" onSearch={(params) => setActiveLocation(params.location)} />
        </div>
      </section>

      <section className="py-10">
        <div className="section-container">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-serif text-2xl font-semibold text-foreground">
                {activeLocation ? `Properties in ${activeLocation}` : 'All Properties'}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">{filtered.length} properties available</p>
            </div>
            <div className="flex items-center gap-2">
              {activeLocation && (
                <button onClick={() => setActiveLocation('')} className="text-xs text-primary hover:underline mr-2">Clear filter</button>
              )}
              <div className="flex border border-border rounded-lg overflow-hidden">
                <button onClick={() => setViewMode('grid')} className={`flex items-center gap-1.5 px-3 py-2 text-xs transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                  <LayoutGrid size={13} /> Grid
                </button>
                <button onClick={() => setViewMode('map')} className={`flex items-center gap-1.5 px-3 py-2 text-xs transition-colors ${viewMode === 'map' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                  <Map size={13} /> Map
                </button>
              </div>
            </div>
          </div>

          {viewMode === 'map' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
              <MaltaMap locations={mapLocations.filter(l => l.count)} onLocationClick={handleMapClick} className="h-[400px]" />
              <p className="text-xs text-muted-foreground mt-2 text-center">Click a pin to filter properties by area</p>
            </motion.div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((property, i) => (
              <Link to={`/properties/${property.slug}`} key={property.id}>
                <motion.article
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="group rounded-2xl border border-border/50 overflow-hidden bg-card hover:border-primary/30 transition-colors"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                    {property.hero_image ? (
                      <img src={property.hero_image} alt={property.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                        <MapPin size={40} />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-2.5 py-1">
                      <Star size={12} className="text-primary fill-primary" />
                      <span className="text-xs font-semibold text-foreground">{property.rating || 4.97}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                      <MapPin size={12} className="text-primary" /> {property.destination}
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors leading-snug">
                      {property.name}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1"><BedDouble size={13} /> {property.bedrooms}</span>
                      <span className="flex items-center gap-1"><Bath size={13} /> {property.bathrooms}</span>
                      <span className="flex items-center gap-1"><Users size={13} /> {property.max_guests}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border/30">
                      <p className="text-foreground font-semibold">€{property.price_per_night}<span className="text-xs font-normal text-muted-foreground"> / night</span></p>
                      <span className="flex items-center gap-1 text-xs font-semibold text-primary">View <ExternalLink size={11} /></span>
                    </div>
                  </div>
                </motion.article>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No properties found for "{activeLocation}"</p>
              <button onClick={() => setActiveLocation('')} className="mt-3 text-sm text-primary hover:underline">Show all properties</button>
            </div>
          )}

          <div className="mt-16 satin-surface rounded-2xl p-8 text-center satin-glow">
            <p className="micro-type text-primary mb-3">Own a property in Malta?</p>
            <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">List your property with us</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">Join our curated portfolio and maximise your rental income with full-service management.</p>
            <Link to="/owners/estimate" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded font-semibold text-sm hover:opacity-90 transition-opacity">Get Free Estimate</Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
