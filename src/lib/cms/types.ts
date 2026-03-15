// ══════════════════════════════════════════════════════════
// CMS TYPE SYSTEM
// Production-safe, fully typed, Zod-ready
// ══════════════════════════════════════════════════════════

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface FooterLinkGroup {
  [section: string]: Array<{ label: string; href: string }>;
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
  navigation: NavItem[];
  footerLinks: FooterLinkGroup;
  social: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    twitter?: string;
  };
}

// ── Block types ──

export type BlockType =
  | 'hero_centered'
  | 'hero_split'
  | 'stats_row'
  | 'feature_grid'
  | 'text_block'
  | 'cta_banner'
  | 'faq_accordion'
  | 'property_showcase'
  | 'proof_strip'
  | 'process_steps'
  | 'pricing_table'
  | 'booking_search'
  | 'contact_form';

export interface ContentBlock<T extends string = string, D = unknown> {
  id: string;
  type: T;
  tags: string[];
  data: D;
}

export interface PageDefinition {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  blocks: ContentBlock[];
  meta?: {
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    noindex?: boolean;
  };
}

// ── Data shapes ──

export interface HeroCenteredData {
  tagline?: string;
  headline: string;
  body?: string;
  cta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  backgroundImage?: string;
}

export interface HeroSplitSide {
  tagline?: string;
  headline: string;
  body?: string;
  cta: { label: string; action?: 'wizard'; href?: string };
  proof?: string;
}

export interface HeroSplitData {
  left: HeroSplitSide;
  right: HeroSplitSide;
}

export interface StatItem {
  label: string;
  value: string;
  suffix?: string;
}

export interface StatsRowData {
  stats: StatItem[];
}

export interface FeatureItem {
  icon?: string;
  title: string;
  description: string;
}

export interface FeatureGridData {
  heading: {
    tagline?: string;
    headline: string;
    alignment?: 'left' | 'center' | 'right';
  };
  items: FeatureItem[];
  columns?: 2 | 3 | 4;
}

export interface TextBlockData {
  heading?: string;
  body: string;
  alignment?: 'left' | 'center' | 'right';
}

export interface CTABannerData {
  headline: string;
  body?: string;
  cta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  variant?: 'default' | 'gold' | 'dark';
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQAccordionData {
  heading?: string;
  items: FAQItem[];
}

export interface PropertyShowcaseData {
  heading?: string;
  limit?: number;
  ids?: string[];
}

export interface ProofItem {
  label: string;
  value: string;
  icon?: string;
}

export interface ProofStripData {
  items: ProofItem[];
}

export interface ProcessStep {
  title: string;
  description: string;
  icon?: string;
}

export interface ProcessStepsData {
  heading?: string;
  steps: ProcessStep[];
}

export interface PricingTier {
  name: string;
  price: string;
  subtitle?: string;
  features: string[];
  highlighted?: boolean;
  cta?: { label: string; href?: string; action?: 'wizard' };
}

export interface PricingTableData {
  heading?: string;
  tiers: PricingTier[];
}

export interface BookingSearchData {
  variant?: 'hero' | 'inline' | 'compact';
}
