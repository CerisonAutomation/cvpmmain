import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, BedDouble, Bath, Users, ExternalLink } from 'lucide-react';
import { usePrefetchListing } from '@/lib/guesty/hooks';
import ProgressiveImage from './ProgressiveImage';
import { useRef, useCallback } from 'react';

interface Props {
  id: string;
  title: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  accommodates: number;
  rating: number;
  basePrice: number;
  heroImage?: string;
  index?: number;
}

/**
 * Enterprise property card with:
 * - Hover prefetching (Airbnb pattern)
 * - Progressive image loading
 * - Staggered entrance animation
 */
export default function PropertyCard({
  id, title, city, bedrooms, bathrooms, accommodates,
  rating, basePrice, heroImage, index = 0,
}: Props) {
  const prefetch = usePrefetchListing();
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>();

  const onPointerEnter = useCallback(() => {
    // Prefetch after 100ms hover (Airbnb/Google pattern)
    hoverTimer.current = setTimeout(() => prefetch(id), 100);
  }, [id, prefetch]);

  const onPointerLeave = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  }, []);

  return (
    <Link
      to={`/properties/${id}`}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ delay: index * 0.04, duration: 0.3 }}
        className="group satin-surface rounded-md overflow-hidden"
      >
        <div className="relative overflow-hidden">
          {heroImage ? (
            <ProgressiveImage
              src={heroImage}
              alt={title}
              width={600}
              className="group-hover:scale-[1.03] transition-transform duration-500"
            />
          ) : (
            <div className="aspect-[4/3] bg-secondary flex items-center justify-center text-muted-foreground/20">
              <MapPin size={36} />
            </div>
          )}
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-2.5 py-1">
            <Star size={11} className="text-primary fill-primary" />
            <span className="text-[11px] font-semibold text-foreground">{rating}</span>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-2">
            <MapPin size={11} className="text-primary" /> {city}
          </div>
          <h3 className="font-serif text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors leading-tight">
            {title}
          </h3>
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground mb-4">
            <span className="flex items-center gap-1"><BedDouble size={12} /> {bedrooms}</span>
            <span className="flex items-center gap-1"><Bath size={12} /> {bathrooms}</span>
            <span className="flex items-center gap-1"><Users size={12} /> {accommodates}</span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-border/20">
            <p className="text-foreground font-semibold">
              €{basePrice}<span className="text-[11px] font-normal text-muted-foreground"> / night</span>
            </p>
            <span className="flex items-center gap-1 text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              View <ExternalLink size={11} />
            </span>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}
