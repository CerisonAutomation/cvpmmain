import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllCmsPages, upsertCmsPage, deleteCmsPage } from '@/lib/dal';
import type { PageDefinition } from '@/lib/cms/types';

export function useCmsPages() {
  return useQuery<PageDefinition[]>({
    queryKey: ['cms', 'pages'],
    queryFn: getAllCmsPages,
    staleTime: 60_000,
  });
}

export function useCmsPageMutation() {
  const qc = useQueryClient();

  const upsert = useMutation<void, Error, PageDefinition>({
    mutationFn: upsertCmsPage,
    onSuccess: (_, page) => {
      qc.invalidateQueries({ queryKey: ['cms', 'pages'] });
      qc.invalidateQueries({ queryKey: ['cms', 'page', page.slug] });
    },
  });

  const remove = useMutation<void, Error, string>({
    mutationFn: deleteCmsPage,
    onSuccess: (_, slug) => {
      qc.invalidateQueries({ queryKey: ['cms', 'pages'] });
      qc.removeQueries({ queryKey: ['cms', 'page', slug] });
    },
  });

  return { upsert, remove };
}
