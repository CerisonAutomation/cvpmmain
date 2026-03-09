/**
 * Block-Based CMS Type System
 * Every page is composed of typed content blocks.
 * All content is data-driven — zero hardcoded copy in components.
 */

// ── Block Types ──────────────────────────────────────

export type BlockType =
  | 'hero_split'
  | 'hero_centered'
  | 'section_heading'
  | 'feature_grid'
  | 'proof_strip'
  | 'property_showcase'
  | 'pricing_table'
  | 'faq_accordion'
  | 'process_steps'
  | 'cta_banner'
  | 'text_block'
  | 'testimonial_carousel'
  | 'stats_row'
  | 'image_text'
  | 'logo_strip';

export interface ContentBlock<T extends BlockType = BlockType, D = unknown> {
  id: string;
  type: T;
  data: D;
  tags?: string[];
  visibility?: 'public' | 'owners' | 'guests' | 'admin';
  order?: number;
}

// ── Block Data Schemas ───────────────────────────────

export interface HeroSplitData {
  left: {
    tagline: string;
    headline: string;
    body: string;
    cta: { label: string; action: 'wizard' | 'link'; href?: string };
    icon?: string;
    proof?: string;
  };
  right: {
    tagline: string;
    headline: string;
    body: string;
    cta: { label: string; href: string };
    icon?: string;
    proof?: string;
    backgroundImage?: string;
  };
}

export interface HeroCenteredData {
  tagline: string;
  headline: string;
  body: string;
  cta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  backgroundImage?: string;
}

export interface SectionHeadingData {
  tagline: string;
  headline: string;
  highlightWord?: string;
  body?: string;
  alignment?: 'left' | 'center';
}

export interface FeatureGridItem {
  icon: string;
  title: string;
  description: string;
}

export interface FeatureGridData {
  heading: SectionHeadingData;
  items: FeatureGridItem[];
  columns?: 2 | 3 | 4;
}

export interface ProofStripItem {
  icon: string;
  label: string;
  description: string;
}

export interface ProofStripData {
  items: ProofStripItem[];
}

export interface ProcessStep {
  step: string;
  icon: string;
  title: string;
  description: string;
}

export interface ProcessStepsData {
  heading: SectionHeadingData;
  steps: ProcessStep[];
}

export interface PricingPlan {
  name: string;
  price: string;
  subtitle: string;
  description: string;
  features: string[];
  highlighted: boolean;
  cta: { label: string; href: string };
}

export interface PricingTableData {
  heading: SectionHeadingData;
  plans: PricingPlan[];
  footnote?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQAccordionData {
  heading: SectionHeadingData;
  items: FAQItem[];
}

export interface CTABannerData {
  headline: string;
  body?: string;
  cta: { label: string; href: string };
  variant?: 'default' | 'gold' | 'minimal';
}

export interface StatsItem {
  value: string;
  label: string;
}

export interface StatsRowData {
  items: StatsItem[];
}

export interface TextBlockData {
  heading?: string;
  body: string;
  alignment?: 'left' | 'center';
}

export interface TestimonialItem {
  quote: string;
  author: string;
  role?: string;
  rating?: number;
}

export interface TestimonialCarouselData {
  heading: SectionHeadingData;
  items: TestimonialItem[];
}

export interface ImageTextData {
  heading: SectionHeadingData;
  body: string;
  image: string;
  imagePosition: 'left' | 'right';
  cta?: { label: string; href: string };
}

// ── Page Definition ──────────────────────────────────

export interface PageDefinition {
  slug: string;
  title: string;
  description: string;
  blocks: ContentBlock[];
  meta?: {
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    canonical?: string;
  };
  tags?: string[];
}

// ── Navigation ───────────────────────────────────────

export interface NavLink {
  label: string;
  href: string;
  children?: NavLink[];
}

export interface SiteConfig {
  brandName: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  locale: string;
  currency: string;
  timezone: string;
  navigation: NavLink[];
  footerLinks: Record<string, NavLink[]>;
  social?: Record<string, string>;
}
