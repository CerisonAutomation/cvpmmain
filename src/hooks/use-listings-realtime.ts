import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useListingsRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Listen for cache invalidations in Supabase
    const channel = supabase
      .channel('guesty-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guesty_api_cache',
        },
        (payload) => {
          console.log('[Realtime] Guesty cache update:', payload);
          // Invalidate listings queries to force refetch from proxy
          queryClient.invalidateQueries({ queryKey: ['listings'] });

          // If a specific listing was updated, we could find its ID from the cache key
          // but for simplicity and robustness, we refresh the main lists.
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
