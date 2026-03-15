import { useState, useEffect, useCallback } from 'react';

const WISHLIST_KEY = 'cvpm_wishlist';

/**
 * Enterprise Wishlist Hook
 * - LocalStorage persistence
 * - Reactive state
 * - Type-safe
 */
export function useWishlist() {
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_KEY);
      if (stored) {
        setWishlist(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load wishlist', e);
    }
  }, []);

  const toggleWishlist = useCallback((id: string) => {
    setWishlist((prev) => {
      const next = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];

      try {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save wishlist', e);
      }
      return next;
    });
  }, []);

  const isInWishlist = useCallback((id: string) => {
    return wishlist.includes(id);
  }, [wishlist]);

  return { wishlist, toggleWishlist, isInWishlist };
}
