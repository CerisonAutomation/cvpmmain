import { z } from 'zod';

// ── Per-block data schemas (strongly typed) ──

export const proofStripDataSchema = z.object({
  items: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
});
export type ProofStripData = z.infer<typeof proofStripDataSchema>;

export const statsRowDataSchema = z.object({
  stats: z.array(z.object({ label: z.string(), value: z.string(), suffix: z.string().optional() })).default([]),
});
export type StatsRowData = z.infer<typeof statsRowDataSchema>;

export const processStepsDataSchema = z.object({
  heading: z.string().default(''),
  steps: z.array(z.object({ title: z.string(), description: z.string() })).default([]),
});
export type ProcessStepsData = z.infer<typeof processStepsDataSchema>;

export const pricingTableDataSchema = z.object({
  heading: z.string().default(''),
  tiers: z.array(z.object({
    name: z.string(),
    price: z.string(),
    features: z.array(z.string()).default([]),
    highlighted: z.boolean().optional(),
  })).default([]),
});
export type PricingTableData = z.infer<typeof pricingTableDataSchema>;

export const faqAccordionDataSchema = z.object({
  heading: z.string().default(''),
  items: z.array(z.object({
    question: z.string(),
    answer: z.string(),
    category: z.string().optional(),
  })).default([]),
  showFilters: z.boolean().optional(),
});
export type FAQAccordionData = z.infer<typeof faqAccordionDataSchema>;

export const ctaBannerDataSchema = z.object({
  headline: z.string().default(''),
  body: z.string().optional(),
  cta: z.object({
    label: z.string(),
    href: z.string(),
  }),
  variant: z.enum(['default', 'gold', 'outline']).default('default'),
});
export type CTABannerData = z.infer<typeof ctaBannerDataSchema>;

export const heroCenteredDataSchema = z.object({
  tagline: z.string().optional(),
  headline: z.string().default(''),
  body: z.string().optional(),
  backgroundImage: z.string().optional(),
  cta: z.object({
    label: z.string(),
    href: z.string(),
  }),
  secondaryCta: z.object({
    label: z.string(),
    href: z.string(),
  }).optional(),
});
export type HeroCenteredData = z.infer<typeof heroCenteredDataSchema>;

export const heroSplitDataSchema = z.object({
  tagline: z.string().optional(),
  headline: z.string().default(''),
  body: z.string().optional(),
  image: z.string().optional(),
  cta: z.object({
    label: z.string(),
    href: z.string(),
  }),
  secondaryCta: z.object({
    label: z.string(),
    href: z.string(),
  }).optional(),
  reversed: z.boolean().optional(),
});
export type HeroSplitData = z.infer<typeof heroSplitDataSchema>;

export const featureGridDataSchema = z.object({
  heading: z.object({
    tagline: z.string().optional(),
    headline: z.string(),
    highlightWord: z.string().optional(),
    alignment: z.enum(['left', 'center']).default('center'),
  }).optional(),
  items: z.array(z.object({
    icon: z.string().optional(),
    title: z.string(),
    description: z.string(),
  })).default([]),
  columns: z.number().default(3),
});
export type FeatureGridData = z.infer<typeof featureGridDataSchema>;

export const textBlockDataSchema = z.object({
  heading: z.string().optional(),
  body: z.string().default(''),
  alignment: z.enum(['left', 'center', 'right']).optional(),
});
export type TextBlockData = z.infer<typeof textBlockDataSchema>;

export const sectionHeadingDataSchema = z.object({
  tagline: z.string().optional(),
  headline: z.string().default(''),
  highlightWord: z.string().optional(),
  alignment: z.enum(['left', 'center', 'right']).optional(),
});
export type SectionHeadingData = z.infer<typeof sectionHeadingDataSchema>;

export const testimonialCarouselDataSchema = z.object({
  testimonials: z.array(z.object({
    author: z.string(),
    role: z.string().optional(),
    text: z.string(),
    rating: z.number().min(1).max(5).optional(),
  })).default([]),
});
export type TestimonialCarouselData = z.infer<typeof testimonialCarouselDataSchema>;

export const imageTextDataSchema = z.object({
  image: z.string().default(''),
  alt: z.string().default(''),
  heading: z.string().optional(),
  body: z.string().default(''),
  reversed: z.boolean().optional(),
});
export type ImageTextData = z.infer<typeof imageTextDataSchema>;

export const logoStripDataSchema = z.object({
  logos: z.array(z.object({ src: z.string(), alt: z.string() })).default([]),
});
export type LogoStripData = z.infer<typeof logoStripDataSchema>;

export const propertyShowcaseDataSchema = z.object({
  heading: z.string().optional(),
  propertyIds: z.array(z.string()).optional(),
  limit: z.number().optional(),
});
export type PropertyShowcaseData = z.infer<typeof propertyShowcaseDataSchema>;

export const bookingSearchDataSchema = z.object({
  variant: z.enum(['hero', 'default']).default('default'),
});
export type BookingSearchData = z.infer<typeof bookingSearchDataSchema>;

export const contactFormDataSchema = z.object({
  heading: z.string().optional(),
  body: z.string().optional(),
});
export type ContactFormData = z.infer<typeof contactFormDataSchema>;

// ── Core CMS types ──

export const BLOCK_TYPES = [
  { type: 'hero_split',           label: 'Hero Split' },
  { type: 'hero_centered',        label: 'Hero Centered' },
  { type: 'text_block',           label: 'Text Block' },
  { type: 'section_heading',      label: 'Section Heading' },
  { type: 'feature_grid',         label: 'Feature Grid' },
  { type: 'proof_strip',          label: 'Proof Strip' },
  { type: 'stats_row',            label: 'Stats Row' },
  { type: 'process_steps',        label: 'Process Steps' },
  { type: 'pricing_table',        label: 'Pricing Table' },
  { type: 'faq_accordion',        label: 'FAQ Accordion' },
  { type: 'cta_banner',           label: 'CTA Banner' },
  { type: 'testimonial_carousel', label: 'Testimonial Carousel' },
  { type: 'image_text',           label: 'Image + Text' },
  { type: 'logo_strip',           label: 'Logo Strip' },
  { type: 'property_showcase',    label: 'Property Showcase' },
  { type: 'booking_search',       label: 'Booking Search' },
  { type: 'contact_form',         label: 'Contact Form' },
] as const;

export type BlockType = typeof BLOCK_TYPES[number]['type'];

export interface ContentBlock<T extends BlockType = BlockType, D = any> {
  id: string;
  type: T;
  data: D;
  tags?: string[];
}

export const contentBlockSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  data: z.record(z.any()),
  tags: z.array(z.string()).optional(),
});

export const pageDefinitionSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().default(''),
  blocks: z.array(contentBlockSchema).default([]),
  tags: z.array(z.string()).default([]),
  meta: z.record(z.any()).default({}),
});

export type PageDefinition = z.infer<typeof pageDefinitionSchema>;
