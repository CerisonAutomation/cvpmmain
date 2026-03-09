/**
 * useCmsPage — Enterprise CMS hook with DB-first + static fallback + realtime sync
 *
 * Strategy:
 * 1. Return static content immediately (zero latency)
 * 2. Fetch from DB in background
 * 3. Subscribe to realtime changes
 * 4. Merge: DB wins if available, static as fallback
 */

import { useEffect, useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getPage as getStaticPage } from '@/lib/cms/content';
import type { PageDefinition, ContentBlock } from '@/lib/cms/types';

function dbRowToPage(row: any): PageDefinition {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description || '',
    blocks: (row.blocks as ContentBlock[]) || [],
    meta: (row.meta as any) || {},
    tags: row.tags || [],
  };
}

async function fetchDbPage(slug: string): Promise<PageDefinition | null> {
  const { data, error } = await supabase
    .from('cms_pages')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  if (error || !data) return null;
  return dbRowToPage(data);
}

/**
 * Returns page definition with:
 * - Instant static fallback
 * - Background DB fetch
 * - Realtime subscription for live updates
 */
export function useCmsPage(slug: string): {
  page: PageDefinition | null;
  isLoading: boolean;
  source: 'static' | 'db';
} {
  const staticPage = getStaticPage(slug);
  const queryClient = useQueryClient();

  const { data: dbPage, isLoading } = useQuery({
    queryKey: ['cms-page', slug],
    queryFn: () => fetchDbPage(slug),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`cms-page-${slug}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cms_pages',
          filter: `slug=eq.${slug}`,
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            queryClient.setQueryData(['cms-page', slug], null);
          } else {
            const updated = dbRowToPage(payload.new);
            queryClient.setQueryData(['cms-page', slug], updated);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [slug, queryClient]);

  // DB wins if available, static as instant fallback
  const page = dbPage || staticPage;
  const source = dbPage ? 'db' : 'static';

  return { page, isLoading, source };
}

/**
 * Helper to get a block by type from a page
 */
export function getBlockByType<T = unknown>(
  page: PageDefinition | null,
  type: string
): ContentBlock<any, T> | null {
  if (!page) return null;
  return (page.blocks.find((b) => b.type === type) as ContentBlock<any, T>) ?? null;
}

/**
 * Helper to get a block by ID from a page
 */
export function getBlockById<T = unknown>(
  page: PageDefinition | null,
  id: string
): ContentBlock<any, T> | null {
  if (!page) return null;
  return (page.blocks.find((b) => b.id === id) as ContentBlock<any, T>) ?? null;
}
