import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, BedDouble, Bath, Users } from 'lucide-react';
import { usePrefetchListing } from '@/lib/guesty/hooks';
import ProgressiveImage from './ProgressiveImage';
import { useRef, useCallback, memo } from 'react';

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
 * Premium property card
 * - Image-first, sharp edges
 * - Dense information display
 * - Hover prefetching
 */
function PropertyCard({
  id, title, city, bedrooms, bathrooms, accommodates,
  rating, basePrice, heroImage, index = 0,
}: Props) {
  const prefetch = usePrefetchListing();
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>();

  const onPointerEnter = useCallback(() => {
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
      aria-label={`View details for ${title} in ${city}`}
    >
      <motion.article
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-32px' }}
        transition={{ delay: index * 0.03, duration: 0.25 }}
        className="group border border-border/40 bg-card overflow-hidden"
      >
        {/* Image */}
        <div className="relative overflow-hidden">
          {heroImage ? (
            <ProgressiveImage
              src={heroImage}
              alt={title}
              width={600}
              className="group-hover:scale-[1.02] transition-transform duration-400"
            />
          ) : (
            <div className="aspect-[4/3] bg-secondary flex items-center justify-center text-muted-foreground/20">
              <MapPin size={28} />
            </div>
          )}
          {/* Rating badge */}
          <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-background/85 backdrop-blur-sm px-1.5 py-0.5">
            <Star size={9} className="text-primary fill-primary" />
            <span className="text-[10px] font-semibold text-foreground">{rating}</span>
          </div>
        </div>

        {/* Content - compact */}
        <div className="p-3.5">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1.5">
            <MapPin size={9} className="text-primary" /> {city}
          </div>
          
          <h3 className="font-serif text-base font-semibold text-foreground mb-2 group-hover:text-primary transition-colors leading-tight line-clamp-1">
            {title}
          </h3>
          
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-3">
            <span className="flex items-center gap-0.5"><BedDouble size={10} /> {bedrooms}</span>
            <span className="flex items-center gap-0.5"><Bath size={10} /> {bathrooms}</span>
            <span className="flex items-center gap-0.5"><Users size={10} /> {accommodates}</span>
          </div>
          
          <div className="flex items-center justify-between pt-2.5 border-t border-border/20">
            <p className="text-foreground font-semibold numeric">
              €{basePrice}<span className="text-[10px] font-normal text-muted-foreground"> / night</span>
            </p>
            <span className="text-[10px] font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              View →
            </span>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}

export default memo(PropertyCard);
