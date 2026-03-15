import { useQuery } from '@tanstack/react-query';
import { getCmsPage } from '@/lib/dal';
import type { PageDefinition, ContentBlock } from '@/lib/cms/types';

export function getBlockByType<T>(page: PageDefinition | null, type: string) {
  if (!page) return null;
  const block = page.blocks.find((b: ContentBlock) => b.type === type);
  if (!block) return null;
  return block as { id: string; type: string; data: T };
}

export function useCmsPage(slug: string) {
  const { data, isLoading, isError } = useQuery<PageDefinition | null>({
    queryKey: ['cms', 'page', slug],
    queryFn: () => getCmsPage(slug),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(slug), // don't fire with empty slug
    retry: 1,
  });

  return { page: data ?? null, isLoading, isError };
}
