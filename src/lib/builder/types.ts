// Page Builder — domain types
export type BlockType =
  | "header" | "footer" | "hero" | "text" | "about" | "quote"
  | "services" | "process" | "properties" | "awards"
  | "stats" | "features" | "pricing" | "faq" | "team" | "logos"
  | "testimonials" | "image" | "gallery" | "video"
  | "cta" | "contact" | "newsletter" | "form"
  | "divider" | "spacer";

export interface BuilderBlock {
  id: string;
  type: BlockType;
  data: Record<string, unknown>;
  position: number;
}

export interface BuilderTheme {
  accent?: string;
  bg?: string;
  surface?: string;
  text?: string;
  fontHead?: string;
  fontBody?: string;
}

export interface BuilderSEO {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
}

export interface BuilderPage {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  status: "draft" | "published";
  theme: BuilderTheme;
  seo: BuilderSEO;
  created_at: string;
  updated_at: string;
  blocks?: BuilderBlock[];
}

export type Device = "desktop" | "tablet" | "mobile";
