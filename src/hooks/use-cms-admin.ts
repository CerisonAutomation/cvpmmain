/**
 * useCmsAdmin — CRUD operations for CMS pages (admin only)
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { PageDefinition, ContentBlock } from '@/lib/cms/types';

function rowToPage(row: any): PageDefinition {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description || '',
    blocks: (row.blocks as ContentBlock[]) || [],
    meta: (row.meta as any) || {},
    tags: row.tags || [],
  };
}

export function useCmsPages() {
  return useQuery({
    queryKey: ['cms-admin-pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_pages')
        .select('*')
        .order('slug');
      if (error) throw error;
      return data.map(rowToPage);
    },
  });
}

export function useCmsPageMutation() {
  const qc = useQueryClient();

  const upsert = useMutation({
    mutationFn: async (page: PageDefinition & { published?: boolean }) => {
      const { error } = await supabase.from('cms_pages').upsert({
        slug: page.slug,
        title: page.title,
        description: page.description,
        blocks: page.blocks as any,
        meta: page.meta as any,
        tags: page.tags || [],
        published: page.published ?? true,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cms-admin-pages'] });
      qc.invalidateQueries({ queryKey: ['cms-page'] });
    },
  });

  const remove = useMutation({
    mutationFn: async (slug: string) => {
      const { error } = await supabase.from('cms_pages').delete().eq('slug', slug);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cms-admin-pages'] });
    },
  });

  return { upsert, remove };
}
