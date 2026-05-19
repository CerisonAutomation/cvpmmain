// Builder data access — pages + blocks via Supabase
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import type { BuilderPage, BuilderBlock, BlockType } from "./types";
import {
  DbPageSchema,
  DbBlockSchema,
  CreatePageInputSchema,
  UpdatePageInputSchema,
  AiCallInputSchema,
  AiResponseSchema,
  BuilderBlockSchema,
} from "./schemas";

const TABLE_PAGES = "builder_pages" as const;
const TABLE_BLOCKS = "builder_blocks" as const;

const toPage = (
  p: z.infer<typeof DbPageSchema>,
  blocks?: z.infer<typeof DbBlockSchema>[]
): BuilderPage => ({
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
  const { data, error } = await (supabase as any)
    .from(TABLE_PAGES)
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  const validated = (data ?? []).map((p: unknown) => {
    const result = DbPageSchema.safeParse(p);
    if (!result.success) throw new Error(`Invalid page data: ${result.error.message}`);
    return toPage(result.data);
  });
  return validated;
}

export async function loadPage(id: string): Promise<BuilderPage | null> {
  // FIX #11: was sequential await-await (N+1). Now Promise.all — one round-trip.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const [pageRes, blocksRes] = await Promise.all([
    sb.from(TABLE_PAGES).select("*").eq("id", id).maybeSingle(),
    sb.from(TABLE_BLOCKS).select("*").eq("page_id", id).order("position", { ascending: true }),
  ]);
  if (pageRes.error) throw pageRes.error;
  if (blocksRes.error) throw blocksRes.error;
  if (!pageRes.data) return null;

  const pageResult = DbPageSchema.safeParse(pageRes.data);
  if (!pageResult.success) throw new Error(`Invalid page data: ${pageResult.error.message}`);

  const blocks = blocksRes.data ?? [];
  const validatedBlocks = blocks.map((b: unknown) => {
    const result = DbBlockSchema.safeParse(b);
    if (!result.success) throw new Error(`Invalid block data: ${result.error.message}`);
    return result.data;
  });

  return toPage(pageResult.data, validatedBlocks);
}

export async function createPage(input: { name: string; slug: string }): Promise<BuilderPage> {
  const validatedInput = CreatePageInputSchema.parse(input);
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData?.user?.id;
  if (!uid) throw new Error("Not signed in");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from(TABLE_PAGES)
    .insert({ owner_id: uid, name: validatedInput.name, slug: validatedInput.slug })
    .select("*")
    .single();
  if (error) throw error;
  const result = DbPageSchema.safeParse(data);
  if (!result.success) throw new Error(`Invalid created page data: ${result.error.message}`);
  return toPage(result.data);
}

export async function updatePage(
  id: string,
  patch: Partial<Pick<BuilderPage, "name" | "slug" | "status" | "theme" | "seo">>
) {
  const validatedPatch = UpdatePageInputSchema.parse(patch);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from(TABLE_PAGES).update(validatedPatch).eq("id", id);
  if (error) throw error;
}

export async function deletePage(id: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  // Cascade: delete blocks first, then the page
  await sb.from(TABLE_BLOCKS).delete().eq("page_id", id);
  const { error } = await sb.from(TABLE_PAGES).delete().eq("id", id);
  if (error) throw error;
}

// FIX #2: saveBlocks was delete-then-insert with no transaction.
// A network failure between the two would permanently erase all page content.
// Now uses upsert by ID + a targeted orphan delete — safe at every failure point.
export async function saveBlocks(pageId: string, blocks: BuilderBlock[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;

  if (blocks.length === 0) {
    const { error } = await sb.from(TABLE_BLOCKS).delete().eq("page_id", pageId);
    if (error) throw error;
    return;
  }

  const validatedBlocks = blocks.map((b, i) => {
    const result = BuilderBlockSchema.safeParse(b);
    if (!result.success) throw new Error(`Invalid block: ${result.error.message}`);
    return {
      id: result.data.id,
      page_id: pageId,
      type: result.data.type,
      data: result.data.data,
      position: i,
    };
  });

  // Upsert all current blocks — safe if insert fails (existing rows are untouched)
  const { error: upsertErr } = await sb
    .from(TABLE_BLOCKS)
    .upsert(validatedBlocks, { onConflict: "id" });
  if (upsertErr) throw upsertErr;

  // Delete any blocks that were removed since last save
  const keepIds = validatedBlocks.map((r) => r.id);
  const { error: deleteErr } = await sb
    .from(TABLE_BLOCKS)
    .delete()
    .eq("page_id", pageId)
    .not("id", "in", `(${keepIds.map((x) => `'${x}'`).join(",")})`);
  if (deleteErr) throw deleteErr;
}

export async function callAi(payload: {
  mode: "generate" | "critique" | "rewrite" | "seo";
  prompt: string;
  context?: unknown;
  model?: string;
}) {
  const validatedPayload = AiCallInputSchema.parse(payload);
  const { data, error } = await supabase.functions.invoke("ai-builder", { body: validatedPayload });
  if (error) throw error;
  const result = AiResponseSchema.safeParse(data);
  if (!result.success) throw new Error(`Invalid AI response: ${result.error.message}`);
  return result.data;
}
