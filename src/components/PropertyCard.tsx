import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, BedDouble, Bath, Users } from 'lucide-react';
import { usePrefetchListing } from '@/lib/guesty/hooks';
import ProgressiveImage from './ProgressiveImage';
import { useRef, useCallback, memo } from 'react';
import { block } from 'million/react';
import { MapPin, Star, Bed, Users, Bath } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  price: number;
  beds: number;
  guests: number;
  baths?: number;
  rating?: number;
  reviewCount?: number;
  image?: string;
  highlight?: boolean;
  className?: string;
}

export default function PropertyCard({
  id, title, location, price, beds, guests, baths, rating, reviewCount, image, highlight, className,
}: PropertyCardProps) {
  return (
    <Link
      to={`/properties/${id}`}
      className={cn(
        'group block rounded-2xl overflow-hidden border border-border/30 bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300',
        className,
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted/30">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-muted/20 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-primary/20" />
          </div>
        )}
        {/* Rating badge */}
        {rating && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-sm">
            <Star size={11} className="text-primary fill-primary" />
            <span className="text-xs font-semibold">{rating.toFixed(2)}</span>
          </div>
        )}
        {highlight && (
          <div className="absolute top-3 left-3">
            <span className="bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full">Featured</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors flex-1">{title}</h3>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <MapPin size={10} />
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1"><Bed size={11} />{beds} {beds === 1 ? 'bed' : 'beds'}</span>
          <span className="flex items-center gap-1"><Users size={11} />{guests} guests</span>
          {baths && <span className="flex items-center gap-1"><Bath size={11} />{baths} bath</span>}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-base">€{price}</span>
            <span className="text-xs text-muted-foreground ml-1">/night</span>
          </div>
          {reviewCount && (
            <span className="text-xs text-muted-foreground">{reviewCount} reviews</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default block(PropertyCard);
