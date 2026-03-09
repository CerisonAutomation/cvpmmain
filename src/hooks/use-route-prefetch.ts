/**
 * Enterprise Route Prefetching Hook
 * - Intelligent prefetching on link hover/focus
 * - Respects user data-saver preferences
 * - Prevents duplicate prefetches
 */
import { useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { guestyClient } from '@/lib/guesty/client';

const prefetchedRoutes = new Set<string>();

export function useRoutePrefetch() {
  const queryClient = useQueryClient();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const prefetchProperty = useCallback((id: string) => {
    const key = `property:${id}`;
    if (prefetchedRoutes.has(key)) return;
    
    // Respect data saver mode
    if ('connection' in navigator) {
      const conn = (navigator as any).connection;
      if (conn?.saveData || conn?.effectiveType === 'slow-2g') return;
    }

    prefetchedRoutes.add(key);
    queryClient.prefetchQuery({
      queryKey: ['listing', id],
      queryFn: () => guestyClient.getListing(id),
      staleTime: 10 * 60 * 1000,
    });
  }, [queryClient]);

  const prefetchListings = useCallback(() => {
    if (prefetchedRoutes.has('listings')) return;
    prefetchedRoutes.add('listings');
    queryClient.prefetchQuery({
      queryKey: ['listings', {}],
      queryFn: async () => {
        const raw = await guestyClient.getListings();
        if (Array.isArray(raw)) return raw;
        if (raw && typeof raw === 'object' && 'results' in raw) return (raw as any).results;
        return [];
      },
      staleTime: 15 * 60 * 1000,
    });
  }, [queryClient]);

  const onHover = useCallback((handler: () => void, delay = 80) => {
    return {
      onMouseEnter: () => {
        timeoutRef.current = setTimeout(handler, delay);
      },
      onMouseLeave: () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      },
      onFocus: handler,
    };
  }, []);

  return { prefetchProperty, prefetchListings, onHover };
}

// Preload critical images
export function preloadImage(src: string) {
  if (typeof window === 'undefined') return;
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  document.head.appendChild(link);
}

// Preload fonts
export function preloadFont(href: string) {
  if (typeof window === 'undefined') return;
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'font';
  link.type = 'font/woff2';
  link.crossOrigin = 'anonymous';
  link.href = href;
  document.head.appendChild(link);
}
