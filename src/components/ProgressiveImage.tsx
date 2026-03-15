import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
  /** Width hint for srcset generation */
  width?: number;
  /** High priority for LCP images */
  priority?: boolean;
}

/**
 * Enterprise Progressive Image Component
 * - IntersectionObserver lazy loading (except for priority)
 * - explicit aspect ratio to prevent CLS
 * - srcset support for responsive delivery
 * - smooth fade-in and scale-in
 */
export default function ProgressiveImage({
  src,
  alt,
  className,
  aspectRatio = '4/3',
  width,
  priority = false
}: Props) {
  const [loaded, setLoaded] = useState(false);
  const [inView, setInView] = useState(priority);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) return;

    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { rootMargin: '250px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [priority]);

  // Build optimized src (Guesty images support width params)
  const getOptimizedSrc = (w?: number) => {
    if (!src) return '';
    const connector = src.includes('?') ? '&' : '?';
    return w ? `${src}${connector}w=${w}` : src;
  };

  const optimizedSrc = getOptimizedSrc(width);

  // Create srcset for responsive delivery
  const srcset = width ? [
    `${getOptimizedSrc(Math.round(width * 0.5))} ${Math.round(width * 0.5)}w`,
    `${getOptimizedSrc(width)} ${width}w`,
    `${getOptimizedSrc(width * 2)} ${width * 2}w`,
  ].join(', ') : undefined;

  return (
    <div
      ref={ref}
      className={cn('overflow-hidden bg-secondary relative', className)}
      style={{ aspectRatio }}
    >
      {/* Aspect ratio spacer to prevent CLS */}
      <div style={{ width: '100%', paddingBottom: `calc(1 / (${aspectRatio}) * 100%)` }} />

      {inView && (
        <img
          src={optimizedSrc}
          srcSet={srcset}
          sizes={width ? `${width}px` : '100vw'}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out',
            loaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-[1.03] blur-sm'
          )}
        />
      )}
    </div>
  );
}
