/**
 * CMS Content Store — JSON-driven content for all pages.
 * Single source of truth. All components read from here.
 */

import type {
  SiteConfig,
  PageDefinition,
  ContentBlock,
  HeroSplitData,
  ProofStripData,
  ProcessStepsData,
  PricingTableData,
  FAQAccordionData,
  StatsRowData,
  CTABannerData,
} from './types';

// ── Site Configuration ───────────────────────────────

export const SITE_CONFIG: SiteConfig = {
  brandName: 'Christiano Vincenti',
  tagline: 'Property Management',
  email: 'info@christianopropertymanagement.com',
  phone: '+356 7979 0202',
  address: 'Malta & Gozo',
  locale: 'en-MT',
  currency: 'EUR',
  timezone: 'Europe/Malta',
  navigation: [
    {
      label: 'Owners',
      href: '/owners',
      children: [
        { label: 'How It Works', href: '/owners' },
        { label: 'Pricing', href: '/owners/pricing' },
        { label: 'Get Free Estimate', href: '/owners/estimate' },
        { label: 'Our Standards', href: '/owners/standards' },
      ],
    },
    { label: 'Properties', href: '/properties' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
  footerLinks: {
    guests: [
      { label: 'Properties', href: '/properties' },
      { label: 'Book Direct', href: '/book' },
      { label: 'Residential', href: '/residential' },
      { label: 'FAQ', href: '/faq' },
    ],
    owners: [
      { label: 'How It Works', href: '/owners' },
      { label: 'Pricing', href: '/owners/pricing' },
      { label: 'Free Estimate', href: '/owners/estimate' },
      { label: 'Our Standards', href: '/owners/standards' },
    ],
    company: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
    legal: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Cookies', href: '/cookies' },
    ],
  },
};

// ── Home Page Blocks ─────────────────────────────────

const heroBlock: ContentBlock<'hero_split', HeroSplitData> = {
  id: 'home-hero',
  type: 'hero_split',
  tags: ['homepage', 'above-fold'],
  data: {
    left: {
      tagline: 'Owner Services',
      headline: 'Institutional',
      body: 'Maximize your asset\'s performance through our proprietary operational protocols. Professional stewardship for Malta\'s most distinguished portfolios.',
      cta: { label: 'Initialize Management', action: 'wizard' },
      icon: 'FileText',
      proof: 'MTA Licensed Operator · Securing Malta\'s Premier Properties',
    },
    right: {
      tagline: 'Guest Services',
      headline: 'Residential',
      body: 'Access our hand-curated collection of verified luxury residences. Defining a new standard for Mediterranean stays.',
      cta: { label: 'Explore Collection', href: '/properties' },
      icon: 'Key',
      proof: '4.97 Average Rating · info@christianopm.com',
      backgroundImage: '/src/assets/hero-residential.jpg',
    },
  },
};

const proofBlock: ContentBlock<'proof_strip', ProofStripData> = {
  id: 'home-proof',
  type: 'proof_strip',
  tags: ['homepage', 'trust'],
  data: {
    items: [
      { icon: 'Shield', label: 'No Hidden Markups', description: 'Maintenance at cost' },
      { icon: 'BarChart3', label: 'Owner Dashboard', description: 'Monthly statements' },
      { icon: 'Clock', label: '24hr Response', description: 'Guaranteed reply' },
      { icon: 'Star', label: '5-Star Reviews', description: 'Guest satisfaction' },
    ],
  },
};

const statsBlock: ContentBlock<'stats_row', StatsRowData> = {
  id: 'home-stats',
  type: 'stats_row',
  tags: ['homepage', 'trust'],
  data: {
    items: [
      { value: '€2.4M+', label: 'Revenue Generated' },
      { value: '45+', label: 'Properties Managed' },
      { value: '4.97', label: 'Average Rating' },
      { value: '94%', label: 'Occupancy Rate' },
    ],
  },
};

const processBlock: ContentBlock<'process_steps', ProcessStepsData> = {
  id: 'home-process',
  type: 'process_steps',
  tags: ['homepage', 'owners'],
  data: {
    heading: {
      tagline: 'How It Works',
      headline: 'Three steps to stress-free income',
      highlightWord: 'stress-free',
      alignment: 'center',
    },
    steps: [
      {
        step: '01',
        icon: 'ClipboardCheck',
        title: 'Free Assessment',
        description: 'Tell us about your property and goals. We\'ll analyse your potential income and recommend the right plan.',
      },
      {
        step: '02',
        icon: 'Camera',
        title: 'We Set You Up',
        description: 'Professional photography, listing optimisation, pricing strategy, and MTA licensing support — all handled.',
      },
      {
        step: '03',
        icon: 'Rocket',
        title: 'You Earn More',
        description: 'We manage bookings, guests, cleaning, and maintenance. You receive monthly payouts and transparent reports.',
      },
    ],
  },
};

const pricingBlock: ContentBlock<'pricing_table', PricingTableData> = {
  id: 'home-pricing',
  type: 'pricing_table',
  tags: ['homepage', 'owners', 'pricing'],
  data: {
    heading: {
      tagline: 'Pricing',
      headline: 'Simple, transparent pricing',
      highlightWord: 'transparent',
      alignment: 'center',
    },
    plans: [
      {
        name: 'Essentials',
        price: '15%',
        subtitle: 'of booking revenue',
        description: 'Perfect for owners who want professional listing management with hands-on involvement.',
        features: [
          'Professional photography',
          'Multi-platform listing',
          'Dynamic pricing',
          'Guest communication',
          'Monthly reporting',
          'MTA licence guidance',
        ],
        highlighted: false,
        cta: { label: 'Get Started', href: '/owners/estimate' },
      },
      {
        name: 'Complete',
        price: '20%',
        subtitle: 'of booking revenue',
        description: 'Full hands-off management. We handle everything so you don\'t have to lift a finger.',
        features: [
          'Everything in Essentials',
          'Cleaning coordination',
          'Maintenance at cost',
          'Linen & amenities',
          'Direct booking website',
          'Owner dashboard access',
          'Priority 24hr support',
          'Quarterly strategy review',
        ],
        highlighted: true,
        cta: { label: 'Get Started', href: '/owners/estimate' },
      },
    ],
    footnote: 'No setup fees. No hidden costs. You only pay when you earn.',
  },
};

const faqBlock: ContentBlock<'faq_accordion', FAQAccordionData> = {
  id: 'home-faq',
  type: 'faq_accordion',
  tags: ['homepage', 'faq'],
  data: {
    heading: {
      tagline: 'FAQ',
      headline: 'Common questions',
      highlightWord: 'questions',
      alignment: 'center',
    },
    items: [
      {
        question: 'Do I need an MTA licence to rent short-term in Malta?',
        answer: 'Yes. All short-let properties in Malta require a Malta Tourism Authority (MTA) licence. We guide you through the entire application process as part of our service.',
      },
      {
        question: 'What areas do you cover?',
        answer: 'We manage properties across all of Malta and Gozo, with particular expertise in Sliema, St Julian\'s, Valletta, Mdina, and Mellieħa.',
      },
      {
        question: 'How quickly can my property go live?',
        answer: 'Most properties are listed within 2–3 weeks of onboarding. This includes professional photography, listing creation, and pricing setup.',
      },
      {
        question: 'What happens with maintenance issues?',
        answer: 'We coordinate all maintenance through our trusted network. Costs are passed through at cost — no markups, ever. You approve anything above a pre-agreed threshold.',
      },
      {
        question: 'Can I block dates for personal use?',
        answer: 'Absolutely. You have full control over your calendar through our owner dashboard. Block dates anytime with no penalties.',
      },
      {
        question: 'What\'s included in the monthly reporting?',
        answer: 'You receive a detailed monthly statement covering revenue, occupancy, guest reviews, expenses, and a performance summary compared to market benchmarks.',
      },
    ],
  },
};

const ctaBlock: ContentBlock<'cta_banner', CTABannerData> = {
  id: 'home-cta',
  type: 'cta_banner',
  tags: ['homepage', 'conversion'],
  data: {
    headline: 'Ready to maximize your property\'s potential?',
    body: 'Get a free, no-obligation assessment of your property\'s earning potential.',
    cta: { label: 'Get Your Free Assessment', href: '/owners/estimate' },
    variant: 'default',
  },
};

// ── Page Definitions ─────────────────────────────────

export const PAGES: Record<string, PageDefinition> = {
  home: {
    slug: '/',
    title: 'Christiano Property Management — Luxury Malta Accommodations',
    description: 'Full-service short-let management across Malta & Gozo. Professional property management with transparent pricing.',
    tags: ['homepage'],
    blocks: [heroBlock, proofBlock, statsBlock, processBlock, pricingBlock, faqBlock, ctaBlock],
    meta: {
      ogTitle: 'Christiano Property Management — Malta\'s Premier Property Partner',
      ogDescription: 'Full-service short-let management across Malta & Gozo.',
    },
  },
};

// ── Content Accessors ────────────────────────────────

export function getPage(slug: string): PageDefinition | null {
  return PAGES[slug] ?? null;
}

export function getBlocksByTag(page: PageDefinition, tag: string): ContentBlock[] {
  return page.blocks.filter(b => b.tags?.includes(tag));
}

export function getBlockById<T = unknown>(page: PageDefinition, id: string): ContentBlock<any, T> | null {
  return (page.blocks.find(b => b.id === id) as ContentBlock<any, T>) ?? null;
}

export function getBlockByType<T = unknown>(page: PageDefinition, type: string): ContentBlock<any, T> | null {
  return (page.blocks.find(b => b.type === type) as ContentBlock<any, T>) ?? null;
}
