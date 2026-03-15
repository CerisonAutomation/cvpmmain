/**
 * Data Access Layer (DAL)
 * Typed abstraction over all database operations.
 * Zero raw queries in components — everything goes through here.
 */
import { supabase } from '@/integrations/supabase/client';
import { pageDefinitionSchema } from '@/lib/cms/types';
import type { PageDefinition } from '@/lib/cms/types';

// ── CMS Pages ──

export async function getCmsPage(slug: string): Promise<PageDefinition | null> {
  const { data, error } = await supabase
    .from('cms_pages')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  if (error || !data) return null;

  const parsed = pageDefinitionSchema.safeParse({
    slug: data.slug,
    title: data.title,
    description: data.description,
    blocks: (data.blocks as any[]) || [],
    meta: (data.meta as any) || {},
    tags: data.tags || [],
  });
  if (!parsed.success) {
    console.error('[DAL] getCmsPage parse error', slug, parsed.error.flatten());
    return null;
  }
  return parsed.data;
}

export async function getAllCmsPages(): Promise<PageDefinition[]> {
  const { data, error } = await supabase
    .from('cms_pages')
    .select('*')
    .eq('published', true)
    .order('slug');

  if (error || !data) return [];

  return data.flatMap((d) => {
    const parsed = pageDefinitionSchema.safeParse({
      slug: d.slug,
      title: d.title,
      description: d.description,
      blocks: (d.blocks as any[]) || [],
      meta: (d.meta as any) || {},
      tags: d.tags || [],
    });
    if (!parsed.success) {
      console.error('[DAL] getAllCmsPages parse error', d.slug, parsed.error.flatten());
      return [];
    }
    return [parsed.data];
  });
}

// ── Site Config ──

export async function getSiteConfig(): Promise<Record<string, unknown> | null> {
  const { data, error } = await supabase
    .from('cms_site_config')
    .select('config')
    .eq('id', 'singleton')
    .maybeSingle();

  if (error || !data) return null;
  return data.config as Record<string, unknown>;
}

// ── API Cache (read-only from frontend) ──

export async function getCachedApiResponse<T = unknown>(key: string): Promise<T | null> {
  const { data, error } = await supabase
    .from('guesty_api_cache')
    .select('response_data, cached_at, ttl_seconds')
    .eq('cache_key', key)
    .maybeSingle();

  if (error || !data) return null;

  const age = (Date.now() - new Date(data.cached_at).getTime()) / 1000;
  if (age > data.ttl_seconds) return null;

  return data.response_data as T;
}

// ── CMS Admin Operations ──

export async function upsertCmsPage(page: PageDefinition & { published?: boolean }) {
  const safePage = pageDefinitionSchema.parse(page);

  const { error } = await supabase.from('cms_pages').upsert(
    {
      slug: safePage.slug,
      title: safePage.title,
      description: safePage.description,
      blocks: safePage.blocks as any,
      meta: safePage.meta as any,
      tags: safePage.tags || [],
      published: page.published ?? true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'slug' },
  );
  if (error) throw error;
}

export async function deleteCmsPage(slug: string) {
  const { error } = await supabase.from('cms_pages').delete().eq('slug', slug);
  if (error) throw error;
}

// ── User Roles ──

export async function getUserRole(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();
  return data?.role ?? null;
}

// ── AI Concierge ──

type Msg = { role: 'user' | 'assistant'; content: string };

export async function streamAiChat({
  messages,
  onDelta,
  onDone,
  onError,
  signal,
}: {
  messages: Msg[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError?: (err: Error) => void;
  signal?: AbortSignal;
}) {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-concierge`;

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // FIX: was VITE_SUPABASE_PUBLISHABLE_KEY (undefined) — correct key is ANON_KEY
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ messages }),
      signal,
    });

    if (!resp.ok || !resp.body) {
      const err = await resp.json().catch(() => ({ error: 'Stream failed' }));
      throw new Error(err.error || `HTTP ${resp.status}`);
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let idx: number;
      while ((idx = buffer.indexOf('\n')) !== -1) {
        let line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (!line.startsWith('data: ')) continue;

        const json = line.slice(6).trim();
        if (json === '[DONE]') { onDone(); return; }

        try {
          const parsed = JSON.parse(json);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onDelta(content);
        } catch {
          buffer = line + '\n' + buffer;
          break;
        }
      }
    }

    onDone();
  } catch (e) {
    if ((e as Error).name === 'AbortError') return;
    onError?.(e as Error);
  }
}
