import { useQuery } from '@tanstack/react-query';
import { getCmsPage } from '@/lib/dal';
import type { PageDefinition } from '@/lib/cms/types';

export function useCmsPage(slug: string) {
  const { data, isLoading, isError } = useQuery<PageDefinition | null>({
    queryKey: ['cms', 'page', slug],
    queryFn: () => getCmsPage(slug),
    staleTime: 5 * 60 * 1000,
  });

  return { page: data, isLoading, isError };
}
