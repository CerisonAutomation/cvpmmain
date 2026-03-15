import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import BookingSearchBar from '@/components/BookingSearchBar';
import MaltaMap, { MALTA_LOCALITIES_COORDS, type MapLocation } from '@/components/MaltaMap';
import PropertyCard from '@/components/PropertyCard';
import { PropertyCardSkeleton } from '@/components/ui/skeleton-variants';
import { ErrorState } from '@/components/ui/error-states';
import { SEOHead } from '@/components/SEOHead';
import { LiveRegion } from '@/components/ui/accessibility';
import { motion } from 'framer-motion';
import { Map, LayoutGrid } from 'lucide-react';
import { useListings, normalizeListingSummary } from '@/lib/guesty/hooks';
import type { NormalizedListingSummary } from '@/lib/guesty/normalizer';
import { For } from 'million/react';

export default function Properties() {
  const [searchParams] = useSearchParams();
  const locationFilter = searchParams.get('location') || '';
  const [activeLocation, setActiveLocation] = useState(locationFilter);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const { data: rawListings, isLoading, error, refetch } = useListings();

  const properties: NormalizedListingSummary[] = useMemo(() => {
    const list = Array.isArray(rawListings) ? rawListings : [];
    return list.map((l) => normalizeListingSummary(l));
  }, [rawListings]);

  const mapLocations = useMemo(() => {
    return MALTA_LOCALITIES_COORDS.map(loc => {
      const matches = properties.filter(p =>
        p.city?.toLowerCase().includes(loc.name.toLowerCase().split(' ')[0]) ||
        loc.name.toLowerCase().includes(p.city?.toLowerCase().split(',')[0].trim().toLowerCase())
      );
      return { ...loc, price: matches[0]?.basePrice, count: matches.length || undefined };
    });
  }, [properties]);

  const filtered = activeLocation
    ? properties.filter((p) => p.city?.toLowerCase().includes(activeLocation.toLowerCase()))
    : properties;

  const handleMapClick = (loc: MapLocation) => {
    setActiveLocation(loc.name === activeLocation ? '' : loc.name.split(' ')[0]);
    setViewMode('grid');
  };

  if (isLoading) {
    return (
      <Layout>
        <SEOHead title="Properties" description="Browse our collection of luxury holiday rentals across Malta." />
        <section className="py-8 border-b border-border/30">
          <div className="section-container">
            <BookingSearchBar variant="page" onSearch={(params) => setActiveLocation(params.location)} />
          </div>
        </section>
        <section className="py-10">
          <div className="section-container">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <SEOHead title="Properties" description="Browse our collection of luxury holiday rentals across Malta." />
        <section className="py-6 border-b border-border/20">
          <div className="section-container">
            <BookingSearchBar variant="page" onSearch={(params) => setActiveLocation(params.location)} />
          </div>
        </section>
        <section className="py-12">
          <div className="section-container">
            <ErrorState
              type="ratelimit"
              title="Unable to load properties"
              message="Our booking system is experiencing high demand. Please try again."
              onRetry={() => refetch()}
            />
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead
        title={activeLocation ? `Properties in ${activeLocation}` : 'All Properties'}
        description={`Browse ${filtered.length} luxury holiday rentals${activeLocation ? ` in ${activeLocation}` : ''} across Malta.`}
        keywords={['Malta properties', 'holiday rentals', activeLocation || 'Malta'].filter(Boolean)}
      />
      <LiveRegion>
        {filtered.length} properties {activeLocation ? `in ${activeLocation}` : 'available'}
      </LiveRegion>
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
            <For each={filtered}>
              {(property, i) => (
                <PropertyCard
                  key={property.id || i}
                  id={property.id}
                  title={property.title}
                  city={property.city}
                  bedrooms={property.bedrooms}
                  bathrooms={property.bathrooms}
                  accommodates={property.accommodates}
                  rating={property.rating || 4.97}
                  basePrice={property.basePrice}
                  heroImage={property.heroImage}
                  index={i}
                />
              )}
            </For>
          </div>

          {filtered.length === 0 && !isLoading && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No properties found{activeLocation ? ` for "${activeLocation}"` : ''}</p>
              {activeLocation && <button onClick={() => setActiveLocation('')} className="mt-3 text-sm text-primary hover:underline">Show all properties</button>}
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
