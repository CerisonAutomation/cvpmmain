import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCmsPage } from '@/lib/dal';
import { getPage } from '@/lib/cms/content';
import { supabase } from '@/integrations/supabase/client';
import type { PageDefinition, ContentBlock } from '@/lib/cms/types';

export function getBlockByType<T>(page: PageDefinition | null, type: string) {
  if (!page) return null;
  const block = page.blocks.find((b: ContentBlock) => b.type === type);
  if (!block) return null;
  return block as { id: string; type: string; data: T };
}

export function useCmsPage(slug: string) {
  const queryClient = useQueryClient();
  const queryKey = ['cms', 'page', slug];

  const { data: dbPage, isLoading, isError } = useQuery<PageDefinition | null>({
    queryKey,
    queryFn: () => getCmsPage(slug),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(slug),
    retry: 1,
  });

  // Enable Supabase Realtime for CMS changes
  useEffect(() => {
    if (!slug) return;

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
        () => {
          console.log(`[Realtime] CMS page updated: ${slug}`);
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [slug, queryClient]);

  // Fallback to static content if not found in DB or while loading (optional)
  const staticPage = getPage(slug);
  const page = dbPage || staticPage;

  return {
    page: page ?? null,
    isLoading: isLoading && !staticPage,
    isError: isError && !staticPage
  };
}
