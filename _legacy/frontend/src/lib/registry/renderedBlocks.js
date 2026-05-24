/** Block types with a live React renderer — palette shows only these (+ search can show schema-only). */
export const RENDERED_BLOCK_TYPES = new Set([
  "hero",
  "owners",
  "owners_hero",
  "about",
  "properties",
  "testimonials",
  "cta",
  "stats",
  "features",
  "pricing",
  "faq",
  "text",
  "image",
  "spacer",
  "divider",
]);

export const isRenderedBlockType = (type) => RENDERED_BLOCK_TYPES.has(type);

/** header/footer rendered by App shell, not page canvas */
export const SHELL_BLOCK_TYPES = new Set(["header", "footer"]);
