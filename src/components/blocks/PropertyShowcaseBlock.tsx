import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BedDouble, Bath, Users, Star, ArrowRight } from 'lucide-react';
import { useListings, normalizeListingSummary } from '@/lib/guesty/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';

interface PropertyShowcaseData {
  heading?: { tagline: string; headline: string; body?: string };
  maxItems?: number;
  cta?: { label: string; href: string };
}

interface Props {
  data: PropertyShowcaseData;
  className?: string;
}

export default function PropertyShowcaseBlock({ data, className = '' }: Props) {
  const { heading, maxItems = 3, cta } = data;
  const { data: rawListings, isLoading } = useListings();

  const properties = useMemo(() => {
    const list = Array.isArray(rawListings) ? rawListings : [];
    return list.slice(0, maxItems).map((l: any) => normalizeListingSummary(l));
  }, [rawListings, maxItems]);

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
            <p className="micro-type text-primary mb-3">{heading.tagline}</p>
            <h2 className="section-heading">{heading.headline}</h2>
            {heading.body && <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto">{heading.body}</p>}
          </motion.div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(maxItems)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-border/50 overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="p-5 space-y-3"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/2" /></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p, i) => (
              <motion.div
                key={p.id || i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={`/properties/${p.id}`} className="group block satin-surface rounded-2xl overflow-hidden">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={p.heroImage || '/placeholder.svg'}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-1 text-xs text-primary mb-2">
                      <Star size={12} fill="currentColor" /> {p.rating || '4.9'}
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3">{p.city}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><BedDouble size={12} /> {p.bedrooms}</span>
                      <span className="flex items-center gap-1"><Bath size={12} /> {p.bathrooms}</span>
                      <span className="flex items-center gap-1"><Users size={12} /> {p.accommodates}</span>
                    </div>
                    {p.basePrice > 0 && (
                      <p className="mt-3 text-sm font-semibold text-foreground">
                        €{p.basePrice}<span className="text-xs font-normal text-muted-foreground">/night</span>
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {cta && (
          <div className="text-center mt-10">
            <Link
              to={cta.href}
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              {cta.label} <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
