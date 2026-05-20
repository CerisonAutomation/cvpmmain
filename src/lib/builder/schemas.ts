import { z } from "zod";

const BlockTypeSchema = z.enum([
  "header",
  "footer",
  "hero",
  "text",
  "about",
  "quote",
  "services",
  "process",
  "properties",
  "awards",
  "stats",
  "features",
  "pricing",
  "faq",
  "team",
  "logos",
  "testimonials",
  "image",
  "gallery",
  "video",
  "cta",
  "contact",
  "newsletter",
  "form",
  "divider",
  "spacer",
]);

export const BuilderBlockSchema = z.object({
  id: z.string().uuid("Invalid block ID"),
  type: BlockTypeSchema,
  data: z.record(z.unknown()),
  position: z.number().int().nonnegative(),
});

export type BuilderBlockInput = z.infer<typeof BuilderBlockSchema>;

export const BuilderThemeSchema = z.object({
  accent: z.string().optional(),
  bg: z.string().optional(),
  surface: z.string().optional(),
  text: z.string().optional(),
  fontHead: z.string().optional(),
  fontBody: z.string().optional(),
});

export const BuilderSEOSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  ogImage: z.string().optional(),
});

export const BuilderPageSchema = z.object({
  id: z.string().uuid("Invalid page ID"),
  owner_id: z.string().uuid("Invalid owner ID"),
  name: z.string().min(1, "Name is required").max(200),
  slug: z.string().min(1, "Slug is required").max(200),
  status: z.enum(["draft", "published"]),
  theme: BuilderThemeSchema,
  seo: BuilderSEOSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  blocks: z.array(BuilderBlockSchema).optional(),
});

export type BuilderPageInput = z.infer<typeof BuilderPageSchema>;

export const CreatePageInputSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
});

export type CreatePageInput = z.infer<typeof CreatePageInputSchema>;

export const UpdatePageInputSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(200).optional(),
  status: z.enum(["draft", "published"]).optional(),
  theme: BuilderThemeSchema.optional(),
  seo: BuilderSEOSchema.optional(),
});

export type UpdatePageInput = z.infer<typeof UpdatePageInputSchema>;

export const SaveBlocksInputSchema = z.object({
  pageId: z.string().uuid("Invalid page ID"),
  blocks: z.array(BuilderBlockSchema),
});

export type SaveBlocksInput = z.infer<typeof SaveBlocksInputSchema>;

export const AiCallInputSchema = z.object({
  mode: z.enum(["generate", "critique", "rewrite", "seo"]),
  prompt: z.string().min(1, "Prompt is required").max(5000),
  context: z.unknown().optional(),
  model: z.string().optional(),
});

export type AiCallInput = z.infer<typeof AiCallInputSchema>;

export const DbPageSchema = z.object({
  id: z.string().uuid(),
  owner_id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  status: z.enum(["draft", "published"]),
  theme: z.record(z.unknown()),
  seo: z.record(z.unknown()),
  created_at: z.string(),
  updated_at: z.string(),
});

export const DbBlockSchema = z.object({
  id: z.string().uuid(),
  page_id: z.string().uuid(),
  type: z.string(),
  data: z.record(z.unknown()),
  position: z.number().int(),
});

export const ListPagesResponseSchema = z.array(BuilderPageSchema);

export const LoadPageResponseSchema = BuilderPageSchema.nullable();

export const CreatePageResponseSchema = BuilderPageSchema;

export const UpdatePageResponseSchema = z.object({
  success: z.boolean(),
});

export const DeletePageResponseSchema = z.object({
  success: z.boolean(),
});

export const SaveBlocksResponseSchema = z.object({
  success: z.boolean(),
});

export const AiResponseSchema = z.object({
  mode: z.string(),
  model: z.string(),
  result: z.unknown(),
});
