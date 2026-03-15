import { z } from 'zod';

export const contentBlockSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  data: z.record(z.any()),
});

export type ContentBlock = z.infer<typeof contentBlockSchema>;

export const pageDefinitionSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().default(''),
  blocks: z.array(contentBlockSchema).default([]),
  tags: z.array(z.string()).default([]),
  meta: z.record(z.any()).default({}),
});

export type PageDefinition = z.infer<typeof pageDefinitionSchema>;
