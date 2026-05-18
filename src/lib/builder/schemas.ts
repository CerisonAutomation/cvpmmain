// Builder API boundary — Zod schemas validate all data crossing the
// Supabase "external" → "application" boundary before controller logic uses it.
import { z } from "zod";

export const BuilderPageSchema = z.object({
  id:         z.string().uuid(),
  owner_id:   z.string().uuid(),
  name:       z.string(),
  slug:       z.string(),
  status:     z.enum(["draft", "published"]),
  theme:      z.record(z.unknown()).default({}),
  seo:        z.record(z.unknown()).default({}),
  created_at: z.string(),
  updated_at: z.string(),
});

export const BuilderBlockSchema = z.object({
  id:        z.string().uuid(),
  page_id:   z.string().uuid(),
  type:      z.string(),
  data:      z.record(z.unknown()).default({}),
  position:  z.number().int().nonnegative(),
});
