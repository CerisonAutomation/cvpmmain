import type {
  ContentBlock,
  PageDefinition,
  SiteConfig,
  HeroCenteredData,
  HeroSplitData,
  StatsRowData,
  FeatureGridData,
  TextBlockData,
  CTABannerData,
  FAQAccordionData,
  PropertyShowcaseData,
  ProofStripData,
  ProcessStepsData,
  PricingTableData,
  BookingSearchData,
} from './types';

// ══════════════════════════════════════════════════════════
// SITE CONFIG — single source of truth
// ══════════════════════════════════════════════════════════

export const SITE_CONFIG: SiteConfig = {
  brandName: 'Christiano Vincenti',
  tagline: 'Property Management',
  email: 'info@christianopropertymanagement.com',
  phone: '+356 7979 0202',
  address: 'The Fives, San Ġiljan, Malta',
  locale: 'en-MT',
  currency: 'EUR',
  timezone: 'Europe/Malta',
  navigation: [
    {
      label: 'Owners',
      href: '/owners',
      children: [
        { label: 'How It Works',      href: '/owners' },
        { label: 'Pricing',           href: '/owners/pricing' },
        { label: 'Get Free Estimate', href: '/owners/estimate' },
        { label: 'Our Standards',     href: '/owners/standards' },
        { label: 'Owner Portal',      href: '/owners/portal' },
      ],
    },
    { label: 'Properties', href: '/properties' },
    { label: 'About',      href: '/about' },
    { label: 'Contact',    href: '/contact' },
  ],
  footerLinks: {
    guests: [
      { label: 'Properties', href: '/properties' },
      { label: 'Book Direct', href: '/book' },
      { label: 'Residential', href: '/residential' },
      { label: 'FAQ', href: '/faq' },
    ],
    owners: [
      { label: 'How It Works',   href: '/owners' },
      { label: 'Pricing',        href: '/owners/pricing' },
      { label: 'Free Estimate',  href: '/owners/estimate' },
      { label: 'Our Standards',  href: '/owners/standards' },
      { label: 'Owner Portal',   href: '/owners/portal' },
    ],
    insights: [
      { label: 'Valletta',      href: '/locations/valletta' },
      { label: "St Julian's",   href: '/locations/st-julians' },
      { label: 'Gozo',          href: '/locations/gozo' },
    ],
    company: [
      { label: 'About',   href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
    legal: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms',   href: '/terms' },
      { label: 'Cookies', href: '/cookies' },
    ],
  },
  social: {
    instagram: 'https://instagram.com/christianovincentipm',
    facebook:  'https://facebook.com/christianovincentipm',
  },
};

// ══════════════════════════════════════════════════════════
// CONTENT ACCESSORS
// ══════════════════════════════════════════════════════════

export function getPage(slug: string): PageDefinition | null {
  return PAGES[slug] ?? null;
}

export function getBlockById<T>(
  page: PageDefinition,
  id: string,
): ContentBlock<string, T> | null {
  return (page.blocks.find((b) => b.id === id) as ContentBlock<string, T>) ?? null;
}

// ══════════════════════════════════════════════════════════
// HOME PAGE
// ══════════════════════════════════════════════════════════

const homeHero: ContentBlock<'hero_split', HeroSplitData> = {
  id: 'home-hero',
  type: 'hero_split',
  tags: ['homepage', 'above-fold'],
  data: {
    left: {
      tagline: 'Owner Services',
      headline: 'Institutional',
      body: 'Radically transparent, institutional-grade management. Join 40+ owners who trust us with Malta\'s most valuable assets.',
      cta: { label: 'Initialize Management', action: 'wizard' },
      proof: 'MTA Licensed Operator · 40+ Properties · 8 Years',
    },
    right: {
      tagline: 'Guest Services',
      headline: 'Residential',
      body: 'A handpicked collection of luxury residences across Malta & Gozo. No platform fees. Direct booking, always.',
      cta: { label: 'Explore Collection', href: '/properties' },
      proof: '4.97 Average Rating · 2,000+ Reviews · 12 Channels',
    },
  },
};

const homeSearch: ContentBlock<'booking_search', BookingSearchData> = {
  id: 'home-search',
  type: 'booking_search',
  tags: ['homepage'],
  data: { variant: 'hero' },
};

const homeProof: ContentBlock<'proof_strip', ProofStripData> = {
  id: 'home-proof',
  type: 'proof_strip',
  tags: ['homepage', 'trust'],
  data: {
    items: [
      { label: 'Properties',    value: '45+' },
      { label: 'Guest Rating',  value: '4.97' },
      { label: 'Direct Bookings', value: '€2.4M+' },
      { label: 'Active Channels', value: '12+' },
    ],
  },
};

const homeProperties: ContentBlock<'property_showcase', PropertyShowcaseData> = {
  id: 'home-properties',
  type: 'property_showcase',
  tags: ['homepage'],
  data: { heading: 'Featured Collection', limit: 3 },
};

const homeStats: ContentBlock<'stats_row', StatsRowData> = {
  id: 'home-stats',
  type: 'stats_row',
  tags: ['homepage'],
  data: {
    stats: [
      { label: 'Managed Properties',  value: '45',   suffix: '+' },
      { label: 'Average Guest Rating', value: '4.97', suffix: '/5' },
      { label: 'Annual Direct Revenue', value: '€2.4M', suffix: '+' },
      { label: 'Local Support',        value: '24/7' },
    ],
  },
};

const homeProcess: ContentBlock<'process_steps', ProcessStepsData> = {
  id: 'home-process',
  type: 'process_steps',
  tags: ['homepage'],
  data: {
    heading: 'How We Work',
    steps: [
      { title: 'Onboarding',  description: 'Photography, expert listing setup, and MTA licensing handled.' },
      { title: 'Management', description: 'Full-service booking, cleaning, and guest communication.' },
      { title: 'Growth',     description: 'Dynamic pricing and multi-channel distribution to maximise returns.' },
    ],
  },
};

const homePricing: ContentBlock<'pricing_table', PricingTableData> = {
  id: 'home-pricing',
  type: 'pricing_table',
  tags: ['homepage', 'owners'],
  data: {
    heading: 'Simple, Transparent Pricing',
    tiers: [
      {
        name: 'Essentials',
        price: '15%',
        subtitle: 'of booking revenue',
        features: ['Professional Photography', 'Multi-channel Distribution', 'Dynamic Pricing', 'Guest Communication', 'Monthly Reporting', 'MTA Licence Guidance'],
        highlighted: false,
      },
      {
        name: 'Complete',
        price: '20%',
        subtitle: 'of booking revenue',
        features: ['Everything in Essentials', 'Cleaning Coordination', 'Maintenance at Cost', 'Linen & Amenities', 'Direct Booking Website', 'Owner Dashboard', 'Priority 24hr Support', 'Quarterly Strategy Review'],
        highlighted: true,
      },
    ],
  },
};

const homeFaq: ContentBlock<'faq_accordion', FAQAccordionData> = {
  id: 'home-faq',
  type: 'faq_accordion',
  tags: ['homepage', 'faq'],
  data: {
    heading: 'Frequently Asked Questions',
    items: [
      { question: 'Do I need an MTA licence?',         answer: 'Yes. All short-let properties in Malta require an MTA licence. We guide you through the full application as part of our service.' },
      { question: 'What areas do you cover?',          answer: 'We manage across all Malta and Gozo — with particular depth in Sliema, St Julian\'s, Valletta, Mdina, and Mellieħa.' },
      { question: 'How quickly can my property go live?', answer: 'Most properties are listed within 2–3 weeks: professional photography, listing creation, and pricing setup.' },
      { question: 'What happens with maintenance?',    answer: 'We coordinate all maintenance at cost — no markups, ever. You approve anything above a pre-agreed threshold.' },
      { question: 'Can I block dates for personal use?', answer: 'Absolutely. Full owner calendar control via the dashboard. Block any dates with no penalties.' },
      { question: 'What\'s in the monthly report?',    answer: 'Revenue, occupancy, guest reviews, expenses, and benchmarked market performance — every month.' },
    ],
  },
};

const homeCta: ContentBlock<'cta_banner', CTABannerData> = {
  id: 'home-cta',
  type: 'cta_banner',
  tags: ['homepage'],
  data: {
    headline: 'Ready to Experience Malta?',
    body: 'Book directly with us for the best rates and personalised service.',
    cta: { label: 'Explore Properties', href: '/properties' },
    variant: 'gold',
  },
};

// ══════════════════════════════════════════════════════════
// ABOUT PAGE
// ══════════════════════════════════════════════════════════

const aboutHero: ContentBlock<'hero_centered', HeroCenteredData> = {
  id: 'about-hero',
  type: 'hero_centered',
  tags: ['about'],
  data: {
    tagline: 'About Us',
    headline: 'Malta\'s Most Trusted Property Managers',
    body: 'Christiano Vincenti Property Management was founded on a simple belief: owners in Malta deserve a partner who treats their investment with the same care and ambition they do.',
    cta: { label: 'Get Free Estimate', href: '/owners/estimate' },
    backgroundImage: 'https://images.unsplash.com/photo-1512753360415-00582bc09e29?auto=format&fit=crop&q=80&w=2000',
  },
};

const aboutStats: ContentBlock<'stats_row', StatsRowData> = {
  id: 'about-stats',
  type: 'stats_row',
  tags: ['about'],
  data: {
    stats: [
      { label: 'Properties Managed', value: '40', suffix: '+' },
      { label: 'Guest Reviews',       value: '2,000', suffix: '+' },
      { label: 'Average Rating',      value: '4.97' },
      { label: 'Years in Malta',      value: '8', suffix: '+' },
    ],
  },
};

const aboutStory: ContentBlock<'text_block', TextBlockData> = {
  id: 'about-story',
  type: 'text_block',
  tags: ['about'],
  data: {
    heading: 'Built in Malta, for Malta',
    body: 'We started with a single apartment in Valletta and a conviction that short-stay guests in Malta deserved better.\n\nOver eight years we have grown that into a portfolio of 40+ handpicked properties, a team of dedicated local specialists, and a reputation built entirely on word of mouth and 5-star reviews.',
    alignment: 'left',
  },
};

const aboutValues: ContentBlock<'feature_grid', FeatureGridData> = {
  id: 'about-values',
  type: 'feature_grid',
  tags: ['about'],
  data: {
    heading: { tagline: 'What We Stand For', headline: 'Our Values', alignment: 'center' },
    items: [
      { icon: 'Shield',      title: 'Trust & Transparency', description: 'Every owner receives full monthly statements, real-time booking visibility, and honest advice — always.' },
      { icon: 'Heart',       title: 'Guest Obsession',      description: 'We treat every guest as if they are visiting for the first time. 5-star hospitality is our only standard.' },
      { icon: 'Users',       title: 'Owner Partnership',    description: 'Your property is your asset. We manage it as stewards, maximising returns while protecting your investment.' },
      { icon: 'CheckCircle', title: 'Local Excellence',     description: 'Deep roots in Malta mean the best suppliers, fastest response times, and a network no outsider can match.' },
    ],
    columns: 2,
  },
};

const aboutCta: ContentBlock<'cta_banner', CTABannerData> = {
  id: 'about-cta',
  type: 'cta_banner',
  tags: ['about'],
  data: {
    headline: 'Ready to Partner With Us?',
    body: 'Get a free income estimate for your Malta property and see what we can achieve together.',
    cta: { label: 'Get Free Estimate', href: '/owners/estimate' },
    variant: 'gold',
  },
};

// ══════════════════════════════════════════════════════════
// RESIDENTIAL PAGE
// ══════════════════════════════════════════════════════════

const residentialHero: ContentBlock<'hero_centered', HeroCenteredData> = {
  id: 'residential-hero',
  type: 'hero_centered',
  tags: ['residential'],
  data: {
    tagline: 'Residential Services',
    headline: 'Long-Let Property Management in Malta',
    body: 'For owners who prefer stable, long-term rental income — we handle every aspect of your residential tenancy.',
    cta: { label: 'Get a Free Consultation', href: '/contact' },
  },
};

const residentialServices: ContentBlock<'feature_grid', FeatureGridData> = {
  id: 'residential-services',
  type: 'feature_grid',
  tags: ['residential'],
  data: {
    heading: { headline: 'Our Services', alignment: 'center' },
    items: [
      { icon: 'Home',       title: 'Tenant Sourcing',   description: 'We find, vet, and place quality long-term tenants for your Malta property.' },
      { icon: 'FileCheck', title: 'Lease Management',  description: 'Fully compliant Maltese residential lease agreements drafted and administered on your behalf.' },
      { icon: 'Key',        title: 'Property Maintenance', description: 'Ongoing upkeep, inspections, and emergency response throughout the tenancy.' },
      { icon: 'Handshake', title: 'Tenant Relations',  description: 'We handle all communication, renewals, and end-of-tenancy processes.' },
    ],
    columns: 2,
  },
};

const residentialCta: ContentBlock<'cta_banner', CTABannerData> = {
  id: 'residential-cta',
  type: 'cta_banner',
  tags: ['residential'],
  data: {
    headline: 'Compare: Residential vs Short-Stay',
    body: 'Not sure which suits you? Our team will model both options for your specific property.',
    cta: { label: 'Free Income Comparison', href: '/owners/estimate' },
    variant: 'default',
  },
};

// ══════════════════════════════════════════════════════════
// OWNERS PAGE
// ══════════════════════════════════════════════════════════

const ownersHero: ContentBlock<'hero_centered', HeroCenteredData> = {
  id: 'owners-hero',
  type: 'hero_centered',
  tags: ['owners'],
  data: {
    tagline: 'Property Owners',
    headline: 'Maximise Your Malta Property Income',
    body: 'Radically transparent, institutional-grade management. Join 40+ owners who trust us with their most valuable assets.',
    cta: { label: 'Get Free Estimate', href: '/owners/estimate' },
    secondaryCta: { label: 'View Our Standards', href: '/owners/standards' },
  },
};

// ══════════════════════════════════════════════════════════
// CONTACT PAGE
// ══════════════════════════════════════════════════════════

const contactHero: ContentBlock<'hero_centered', HeroCenteredData> = {
  id: 'contact-hero',
  type: 'hero_centered',
  tags: ['contact'],
  data: {
    tagline: 'Contact Us',
    headline: "Let's talk",
    body: "Whether you're an owner looking to maximise your property's potential or a guest with a question, we're here to help.",
    cta: { label: 'Send Message', href: '#contact-form' },
  },
};

const contactForm: ContentBlock<'contact_form', { body: string }> = {
  id: 'contact-form-block',
  type: 'contact_form',
  tags: ['contact'],
  data: {
    body: "Whether you're an owner or a guest, we're here to help.",
  },
};

// ══════════════════════════════════════════════════════════
// FAQ PAGE
// ══════════════════════════════════════════════════════════

const faqHero: ContentBlock<'hero_centered', HeroCenteredData> = {
  id: 'faq-hero',
  type: 'hero_centered',
  tags: ['faq'],
  data: {
    tagline: 'FAQ',
    headline: 'Questions & Answers',
    body: 'Everything you need to know about renting and managing property in Malta.',
    cta: { label: 'Contact Us', href: '/contact' },
  },
};

const faqFull: ContentBlock<'faq_accordion', FAQAccordionData> = {
  id: 'faq-full',
  type: 'faq_accordion',
  tags: ['faq'],
  data: {
    heading: 'All Questions',
    items: [
      { question: 'Do I need an MTA licence?',            answer: 'Yes. All short-let properties in Malta require an MTA licence. We guide you through the full application.' },
      { question: 'What areas do you cover?',             answer: 'Malta and Gozo — with depth in Sliema, St Julian\'s, Valletta, Mdina, and Mellieħa.' },
      { question: 'How quickly can my property go live?', answer: 'Most properties go live within 2–3 weeks of onboarding.' },
      { question: 'What happens with maintenance issues?', answer: 'Coordinated through our trusted network, passed at cost — no markups.' },
      { question: 'Can I block dates for personal use?',  answer: 'Yes. Full owner calendar control, no penalties.' },
      { question: 'What\'s in the monthly report?',       answer: 'Revenue, occupancy, reviews, expenses, and market benchmarks.' },
      { question: 'Do you offer airport transfers?',      answer: 'Yes, we arrange private transfers for all guests.' },
      { question: 'Is there a minimum contract length?',  answer: 'No. We believe in earning your trust every month, not locking you in.' },
    ],
  },
};

const faqCta: ContentBlock<'cta_banner', CTABannerData> = {
  id: 'faq-cta',
  type: 'cta_banner',
  tags: ['faq'],
  data: {
    headline: 'Still have questions?',
    body: 'Our team is available 7 days a week.',
    cta: { label: 'Talk to the Team', href: '/contact' },
    variant: 'gold',
  },
};

// ══════════════════════════════════════════════════════════
// OWNERS PRICING PAGE
// ══════════════════════════════════════════════════════════

const ownersPricingHero: ContentBlock<'hero_centered', HeroCenteredData> = {
  id: 'owners-pricing-hero',
  type: 'hero_centered',
  tags: ['owners-pricing'],
  data: {
    tagline: 'Pricing',
    headline: 'Simple, Transparent Management Fees',
    body: 'No setup fees. No hidden costs. You only pay when you earn.',
    cta: { label: 'Get Free Estimate', href: '/owners/estimate' },
  },
};

// ══════════════════════════════════════════════════════════
// PAGE DEFINITIONS
// ══════════════════════════════════════════════════════════

export const PAGES: Record<string, PageDefinition> = {
  home: {
    slug: '/',
    title: 'Christiano Property Management — Luxury Malta Accommodations',
    description: 'Full-service short-let management across Malta & Gozo. Professional property management with transparent pricing.',
    tags: ['homepage'],
    blocks: [homeHero, homeSearch, homeProof, homeProperties, homeStats, homeProcess, homePricing, homeFaq, homeCta],
    meta: {
      ogTitle: 'Christiano Property Management — Malta\'s Premier Property Partner',
      ogDescription: 'Full-service short-let management across Malta & Gozo.',
    },
  },
  about: {
    slug: '/about',
    title: 'About Us — Christiano Property Management',
    description: 'Meet the team behind Malta\'s most trusted short-stay property management company.',
    tags: ['about'],
    blocks: [aboutHero, aboutStats, aboutStory, aboutValues, aboutCta],
    meta: { ogTitle: 'About Christiano Vincenti — Malta Property Management' },
  },
  residential: {
    slug: '/residential',
    title: 'Residential Property Management Malta — Long-Let Services',
    description: 'Professional residential property management in Malta.',
    tags: ['residential'],
    blocks: [residentialHero, residentialServices, residentialCta],
    meta: { ogTitle: 'Residential Property Management — Malta' },
  },
  owners: {
    slug: '/owners',
    title: 'Property Owners — Christiano Property Management',
    description: 'Maximise your property income in Malta with our professional management services.',
    tags: ['owners'],
    blocks: [ownersHero, homeStats, homeProcess, homePricing, aboutValues, homeCta],
    meta: { ogTitle: 'Property Owners — Malta Short-Let Management' },
  },
  contact: {
    slug: '/contact',
    title: 'Contact Us — Christiano Property Management',
    description: 'Get in touch with Malta\'s premier property management team.',
    tags: ['contact'],
    blocks: [contactHero, contactForm],
    meta: { ogTitle: 'Contact Christiano Property Management' },
  },
  faq: {
    slug: '/faq',
    title: 'FAQ — Christiano Property Management',
    description: 'Frequently asked questions about property management and short-let rentals in Malta.',
    tags: ['faq'],
    blocks: [faqHero, faqFull, faqCta],
    meta: { ogTitle: 'FAQ — Malta Property Management' },
  },
  'owners-pricing': {
    slug: '/owners/pricing',
    title: 'Pricing — Christiano Property Management',
    description: 'Simple, transparent property management fees for Malta short-let owners.',
    tags: ['owners-pricing'],
    blocks: [ownersPricingHero, homePricing, homeCta],
    meta: { ogTitle: 'Management Pricing — Malta' },
  },
};
