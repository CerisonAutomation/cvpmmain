import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BedDouble, Bath, Users, Star, ArrowRight } from 'lucide-react';
import { useListings, normalizeListingSummary } from '@/lib/guesty/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';
import type { PropertyShowcaseData } from '@/lib/cms/types';
import type { Listing } from '@/lib/guesty/types';

interface Props {
  data: PropertyShowcaseData;
  className?: string;
}

export default function PropertyShowcaseBlock({ data, className = '' }: Props) {
  const { heading, limit = 3, propertyIds } = data;
  const { data: rawListings, isLoading } = useListings();

  const properties = useMemo(() => {
    const list = (Array.isArray(rawListings) ? rawListings : []) as Listing[];
    const filtered = propertyIds?.length
      ? list.filter((l) => propertyIds.includes(l._id))
      : list;
    return filtered.slice(0, limit).map((l) => normalizeListingSummary(l));
  }, [rawListings, limit, propertyIds]);

  const skeletonCount = limit ?? 3;

  return (
    <section className={`py-20 lg:py-32 ${className}`}>
      <div className="section-container">
        {heading && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-16"
          >
            <p className="micro-type text-primary mb-4 tracking-[0.2em]">Our Collection</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">{heading}</h2>
            <div className="mt-6 h-px w-20 bg-primary/30 mx-auto" />
          </motion.div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: skeletonCount }).map((_, i) => (
              <div key={i} className="rounded-sm border border-border/50 overflow-hidden">
                <Skeleton className="aspect-[4/5] w-full" />
                <div className="p-6 space-y-4">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((p, i) => (
              <motion.div
                key={p.id || String(i)}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link to={`/properties/${p.id}`} className="group block relative bg-card rounded-sm overflow-hidden border border-border/50 hover:border-primary/50 transition-all duration-500">
                  <div className="aspect-[4/5] overflow-hidden">
                    <img
                      src={p.heroImage || '/placeholder.svg'}
                      alt={p.title ?? 'Property image'}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-8 transform group-hover:-translate-y-2 transition-transform duration-500">
                    <div className="flex items-center gap-1.5 text-xs text-primary mb-3">
                      <Star size={14} fill="currentColor" aria-hidden />
                      <span className="font-semibold tracking-wider">{p.rating || '4.97'}</span>
                    </div>
                    <h3 className="font-serif text-2xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-500">
                      {p.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4 uppercase tracking-widest">{p.city}</p>
                    <div className="flex items-center gap-5 text-[10px] text-muted-foreground uppercase tracking-[0.1em]">
                      <span className="flex items-center gap-2"><BedDouble size={14} className="text-primary/70" /> {p.bedrooms} BED</span>
                      <span className="flex items-center gap-2"><Bath size={14} className="text-primary/70" /> {p.bathrooms} BATH</span>
                      <span className="flex items-center gap-2"><Users size={14} className="text-primary/70" /> {p.accommodates} GUESTS</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {data.propertyIds === undefined && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <Link
              to="/properties"
              className="group inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary hover:text-primary/80 transition-colors"
            >
              Discover Full Collection <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
