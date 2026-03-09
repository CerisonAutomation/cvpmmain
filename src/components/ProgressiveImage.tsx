import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
  /** Width hint for srcset generation */
  width?: number;
}

/**
 * Progressive image with:
 * - IntersectionObserver lazy loading
 * - CSS blur-up placeholder
 * - Smooth fade-in on load
 */
export default function ProgressiveImage({ src, alt, className, aspectRatio = '4/3', width }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { rootMargin: '200px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Build optimized src (Guesty images support width params)
  const optimizedSrc = src && width
    ? src.includes('?') ? `${src}&w=${width}` : `${src}?w=${width}`
    : src;

  return (
    <div
      ref={ref}
      className={cn('overflow-hidden bg-secondary', className)}
      style={{ aspectRatio }}
    >
      {inView && (
        <img
          src={optimizedSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={cn(
            'w-full h-full object-cover transition-all duration-500',
            loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.02]'
          )}
        />
      )}
    </div>
  );
}
