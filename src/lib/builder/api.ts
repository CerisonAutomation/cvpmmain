// Builder data access — pages + blocks via Supabase
import { supabase } from "@/integrations/supabase/client";
import type { BuilderPage, BuilderBlock, BlockType } from "./types";

const TABLE_PAGES = "builder_pages" as const;
const TABLE_BLOCKS = "builder_blocks" as const;

type DbPage = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  status: "draft" | "published";
  theme: Record<string, unknown>;
  seo: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};
type DbBlock = {
  id: string;
  page_id: string;
  type: string;
  data: Record<string, unknown>;
  position: number;
};

const toPage = (p: DbPage, blocks?: DbBlock[]): BuilderPage => ({
  ...p,
  theme: (p.theme ?? {}) as BuilderPage["theme"],
  seo: (p.seo ?? {}) as BuilderPage["seo"],
  blocks: blocks?.map((b) => ({
    id: b.id,
    type: b.type as BlockType,
    data: b.data ?? {},
    position: b.position,
  })),
});

export async function listPages(): Promise<BuilderPage[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).from(TABLE_PAGES).select("*").order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((p: DbPage) => toPage(p));
}

export async function loadPage(id: string): Promise<BuilderPage | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data: page, error } = await sb.from(TABLE_PAGES).select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!page) return null;
  const { data: blocks, error: bErr } = await sb.from(TABLE_BLOCKS).select("*").eq("page_id", id).order("position", { ascending: true });
  if (bErr) throw bErr;
  return toPage(page, blocks ?? []);
}

export async function createPage(input: { name: string; slug: string }): Promise<BuilderPage> {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData?.user?.id;
  if (!uid) throw new Error("Not signed in");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).from(TABLE_PAGES).insert({ owner_id: uid, name: input.name, slug: input.slug }).select("*").single();
  if (error) throw error;
  return toPage(data);
}

export async function updatePage(id: string, patch: Partial<Pick<BuilderPage, "name" | "slug" | "status" | "theme" | "seo">>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from(TABLE_PAGES).update(patch).eq("id", id);
  if (error) throw error;
}

export async function deletePage(id: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from(TABLE_PAGES).delete().eq("id", id);
  if (error) throw error;
}

export async function saveBlocks(pageId: string, blocks: BuilderBlock[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  await sb.from(TABLE_BLOCKS).delete().eq("page_id", pageId);
  if (blocks.length === 0) return;
  const rows = blocks.map((b, i) => ({
    id: b.id,
    page_id: pageId,
    type: b.type,
    data: b.data,
    position: i,
  }));
  const { error } = await sb.from(TABLE_BLOCKS).insert(rows);
  if (error) throw error;
}

export async function callAi(payload: { mode: "generate" | "critique" | "rewrite" | "seo"; prompt: string; context?: unknown; model?: string }) {
  const { data, error } = await supabase.functions.invoke("ai-builder", { body: payload });
  if (error) throw error;
  return data as { mode: string; model: string; result: unknown };
}
