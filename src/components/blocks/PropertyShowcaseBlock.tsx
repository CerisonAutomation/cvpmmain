import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BedDouble, Bath, Users, Star, ArrowRight } from 'lucide-react';
import { useListings, normalizeListingSummary } from '@/lib/guesty/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';
import type { PropertyShowcaseData } from '@/lib/cms/types';

interface Props {
  data: PropertyShowcaseData;
  className?: string;
}

export default function PropertyShowcaseBlock({ data, className = '' }: Props) {
  const { heading, limit = 3, propertyIds } = data;
  const { data: rawListings, isLoading } = useListings();

  const properties = useMemo(() => {
    const list = Array.isArray(rawListings) ? rawListings : [];
    const filtered = propertyIds?.length
      ? list.filter((l: any) => propertyIds.includes(l._id ?? l.id))
      : list;
    return filtered.slice(0, limit).map((l: any) => normalizeListingSummary(l));
  }, [rawListings, limit, propertyIds]);

  const skeletonCount = limit ?? 3;

  return (
    <section className={`py-16 ${className}`}>
      <div className="section-container">
        {heading && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="section-heading">{heading}</h2>
          </motion.div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true" aria-label="Loading properties">
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border/50 overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p, i) => (
              <motion.div
                key={p.id || String(i)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`/properties/${p.id}`} className="group block satin-surface rounded-2xl overflow-hidden">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={p.heroImage || '/placeholder.svg'}
                      alt={p.title ?? 'Property image'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      width={600}
                      height={450}
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-1 text-xs text-primary mb-2">
                      <Star size={12} fill="currentColor" aria-hidden />
                      <span>{p.rating || '4.9'}</span>
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3">{p.city}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><BedDouble size={12} aria-hidden /> {p.bedrooms} bed</span>
                      <span className="flex items-center gap-1"><Bath size={12} aria-hidden /> {p.bathrooms} bath</span>
                      <span className="flex items-center gap-1"><Users size={12} aria-hidden /> {p.accommodates}</span>
                    </div>
                    {(p.basePrice ?? 0) > 0 && (
                      <p className="mt-3 text-sm font-semibold text-foreground">
                        €{p.basePrice}<span className="text-xs font-normal text-muted-foreground">/night</span>
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
            {!properties.length && (
              <p className="col-span-3 text-center text-sm text-muted-foreground py-12">No properties found.</p>
            )}
          </div>
        )}

        {data.propertyIds === undefined && (
          // Only show generic CTA when not pinning specific IDs
          <div className="text-center mt-10">
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              View all properties <ArrowRight size={14} aria-hidden />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
