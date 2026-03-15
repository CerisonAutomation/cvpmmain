import type {
  ContentBlock,
  PageDefinition,
  HeroCenteredData,
  StatsRowData,
  FeatureGridData,
  TextBlockData,
  CTABannerData,
  FAQAccordionData,
  PropertyShowcaseData,
  ProofStripData,
  ProcessStepsData,
  PricingTableData,
  BookingSearchData
} from './types';

// ══════════════════════════════════════════════════════════
// GLOBAL CONFIG
// ══════════════════════════════════════════════════════════

export const SITE_CONFIG = {
  name: 'Christiano Vincenti Property Management',
  phone: '+356 7927 4688',
  email: 'info@christianopm.com',
  address: 'The Fives - Unit A7, Triq Charles Sciberras, San Ġiljan, Malta',
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
        { label: 'Owner Portal', href: '/owners/portal' },
      ],
    },
    { label: 'Properties', href: '/properties' },
    { label: 'Blog', href: '/blog' },
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
      { label: 'Owner Portal', href: '/owners/portal' },
    ],
    insights: [
      { label: 'Blog', href: '/blog' },
      { label: 'Sliema', href: '/locations/sliema' },
      { label: 'Valletta', href: '/locations/valletta' },
      { label: "St Julian's", href: '/locations/st-julians' },
      { label: 'Gozo', href: '/locations/gozo' },
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
  social: {
    instagram: 'https://instagram.com/christianovincentipm',
    facebook: 'https://facebook.com/christianovincentipm',
  }
};

// ══════════════════════════════════════════════════════════
// HOME PAGE BLOCKS
// ══════════════════════════════════════════════════════════

const homeHero: ContentBlock<'hero_centered', HeroCenteredData> = {
  id: 'home-hero',
  type: 'hero_centered',
  tags: ['homepage', 'above-fold'],
  data: {
    tagline: 'Premium Malta Accommodations',
    headline: 'Your Home in the Heart of the Mediterranean',
    body: 'Discover a handpicked collection of luxury holiday apartments and villas across Malta\'s most sought-after locations. Managed professionally, enjoyed personally.',
    cta: { label: 'Book Your Stay', href: '/properties' },
    secondaryCta: { label: 'Manage Your Property', href: '/owners' },
    backgroundImage: 'https://images.unsplash.com/photo-1523005415847-9d76370fc405?auto=format&fit=crop&q=80&w=2000'
  }
};

const homeSearch: ContentBlock<'booking_search', BookingSearchData> = {
  id: 'home-search',
  type: 'booking_search',
  tags: ['homepage'],
  data: {
    variant: 'hero'
  }
};

const homeProof: ContentBlock<'proof_strip', ProofStripData> = {
  id: 'home-proof',
  type: 'proof_strip',
  tags: ['homepage', 'trust'],
  data: {
    items: [
      { label: 'Properties', value: '45+' },
      { label: 'Guest Rating', value: '4.97' },
      { label: 'Direct Bookings', value: '€2.4M+' },
      { label: 'Active Channels', value: '12+' },
    ]
  }
};

const homeProperties: ContentBlock<'property_showcase', PropertyShowcaseData> = {
  id: 'home-properties',
  type: 'property_showcase',
  tags: ['homepage'],
  data: {
    heading: 'Featured Collection',
    limit: 3
  }
};

const homeStats: ContentBlock<'stats_row', StatsRowData> = {
  id: 'home-stats',
  type: 'stats_row',
  tags: ['homepage'],
  data: {
    stats: [
      { label: 'Managed Properties', value: '45', suffix: '+' },
      { label: 'Average Guest Rating', value: '4.97', suffix: '/5' },
      { label: 'Annual Direct Revenue', value: '€2.4M', suffix: '+' },
      { label: 'Local Support', value: '24/7' },
    ]
  }
};

const homeProcess: ContentBlock<'process_steps', ProcessStepsData> = {
  id: 'home-process',
  type: 'process_steps',
  tags: ['homepage'],
  data: {
    heading: 'How We Work',
    steps: [
      { title: 'Onboarding', description: 'We professionalise your property with photography and expert listing setup.' },
      { title: 'Management', description: 'Full-service handling of bookings, cleaning, and guest communication.' },
      { title: 'Growth', description: 'Dynamic pricing and multi-channel distribution to maximise your returns.' },
    ]
  }
};

const homePricing: ContentBlock<'pricing_table', PricingTableData> = {
  id: 'home-pricing',
  type: 'pricing_table',
  tags: ['homepage', 'owners'],
  data: {
    heading: 'Simple, Transparent Pricing',
    tiers: [
      {
        name: 'Full Management',
        price: '18%',
        features: ['Professional Photography', 'Multi-channel Distribution', '24/7 Guest Support', 'Cleaning & Maintenance Management'],
        highlighted: true
      }
    ]
  }
};

const homeFaq: ContentBlock<'faq_accordion', FAQAccordionData> = {
  id: 'home-faq',
  type: 'faq_accordion',
  tags: ['homepage', 'faq'],
  data: {
    heading: 'Frequently Asked Questions',
    items: [
      { question: 'Where are your properties located?', answer: 'We manage properties across Malta and Gozo, with a focus on Sliema, St Julian\'s, Valletta, and Mellieħa.' },
      { question: 'Do you offer airport transfers?', answer: 'Yes, we can arrange private transfers for all our guests to ensure a seamless arrival experience.' },
    ]
  }
};

const homeCta: ContentBlock<'cta_banner', CTABannerData> = {
  id: 'home-cta',
  type: 'cta_banner',
  tags: ['homepage'],
  data: {
    headline: 'Ready to Experience Malta?',
    body: 'Book directly with us for the best rates and personalized service.',
    cta: { label: 'Explore Properties', href: '/properties' },
    variant: 'gold'
  }
};

// ══════════════════════════════════════════════════════════
// ABOUT PAGE BLOCKS
// ══════════════════════════════════════════════════════════

const aboutHero: ContentBlock<'hero_centered', HeroCenteredData> = {
  id: 'about-hero',
  type: 'hero_centered',
  tags: ['about'],
  data: {
    tagline: 'About Us',
    headline: 'Malta\'s Most Trusted Property Managers',
    body: 'Christiano Vincenti Property Management was founded on a simple belief: property owners in Malta deserve a management partner who treats their investment with the same care and ambition they do.',
    cta: { label: 'Get Free Estimate', href: '/owners/estimate' },
    backgroundImage: 'https://images.unsplash.com/photo-1512753360415-00582bc09e29?auto=format&fit=crop&q=80&w=2000'
  }
};

const aboutStats: ContentBlock<'stats_row', StatsRowData> = {
  id: 'about-stats',
  type: 'stats_row',
  tags: ['about'],
  data: {
    stats: [
      { label: 'Properties Managed', value: '40', suffix: '+' },
      { label: 'Guest Reviews', value: '2,000', suffix: '+' },
      { label: 'Average Rating', value: '4.97', suffix: '' },
      { label: 'Years in Malta', value: '8', suffix: '+' },
    ]
  }
};

const aboutStory: ContentBlock<'text_block', TextBlockData> = {
  id: 'about-story',
  type: 'text_block',
  tags: ['about'],
  data: {
    heading: 'Built in Malta, for Malta',
    body: 'We started with a single apartment in Valletta and a conviction that short-stay guests in Malta deserved better — better-maintained properties, better communication, better experiences.\n\nOver eight years we have grown that conviction into a portfolio of 40+ handpicked properties, a team of dedicated local specialists, and a reputation built entirely on word of mouth and 5-star reviews.',
    alignment: 'left'
  }
};

const aboutValues: ContentBlock<'feature_grid', FeatureGridData> = {
  id: 'about-values',
  type: 'feature_grid',
  tags: ['about'],
  data: {
    heading: {
      tagline: 'What We Stand For',
      headline: 'Our Values',
      alignment: 'center'
    },
    items: [
      { icon: 'Shield', title: 'Trust & Transparency', description: 'Every owner receives full monthly statements, real-time booking visibility, and honest advice — always.' },
      { icon: 'Heart', title: 'Guest Obsession', description: 'We treat every guest as if they are visiting for the first time. 5-star hospitality is our only standard.' },
      { icon: 'Users', title: 'Owner Partnership', description: 'Your property is your asset. We manage it as stewards, maximising returns while protecting your investment.' },
      { icon: 'CheckCircle', title: 'Local Excellence', description: 'Deep roots in Malta mean the best suppliers, fastest response times, and a network no outsider can match.' },
    ],
    columns: 2
  }
};

const aboutCta: ContentBlock<'cta_banner', CTABannerData> = {
  id: 'about-cta',
  type: 'cta_banner',
  tags: ['about'],
  data: {
    headline: 'Ready to Partner With Us?',
    body: 'Get a free income estimate for your Malta property and see what we can achieve together.',
    cta: { label: 'Get Free Estimate', href: '/owners/estimate' },
    variant: 'gold'
  }
};

// ══════════════════════════════════════════════════════════
// RESIDENTIAL PAGE BLOCKS
// ══════════════════════════════════════════════════════════

const residentialHero: ContentBlock<'hero_centered', HeroCenteredData> = {
  id: 'residential-hero',
  type: 'hero_centered',
  tags: ['residential'],
  data: {
    tagline: 'Residential Services',
    headline: 'Long-Let Property Management in Malta',
    body: 'For owners who prefer stable, long-term rental income — we handle every aspect of your residential tenancy.',
    cta: { label: 'Get a Free Consultation', href: '/contact' }
  }
};

const residentialServices: ContentBlock<'feature_grid', FeatureGridData> = {
  id: 'residential-services',
  type: 'feature_grid',
  tags: ['residential'],
  data: {
    heading: {
      headline: 'Our Services',
      alignment: 'center'
    },
    items: [
      { icon: 'Home', title: 'Tenant Sourcing', description: 'We find, vet, and place quality long-term tenants for your Malta residential property.' },
      { icon: 'FileCheck', title: 'Lease Management', description: 'Fully compliant Maltese residential lease agreements drafted and administered on your behalf.' },
      { icon: 'Key', title: 'Property Maintenance', description: 'Ongoing property upkeep, inspections, and emergency response throughout the tenancy.' },
      { icon: 'Handshake', title: 'Tenant Relations', description: 'We handle all tenant communication, renewals, and end-of-tenancy processes.' },
    ],
    columns: 2
  }
};

const residentialCta: ContentBlock<'cta_banner', CTABannerData> = {
  id: 'residential-cta',
  type: 'cta_banner',
  tags: ['residential'],
  data: {
    headline: 'Compare: Residential vs Short-Stay',
    body: 'Not sure which suits you? Our team will help you model both options for your specific property.',
    cta: { label: 'Free Income Comparison', href: '/owners/estimate' },
    variant: 'default'
  }
};

// ══════════════════════════════════════════════════════════
// OWNERS PAGE BLOCKS
// ══════════════════════════════════════════════════════════

const ownersHero: ContentBlock<'hero_centered', HeroCenteredData> = {
  id: 'owners-hero',
  type: 'hero_centered',
  tags: ['owners'],
  data: {
    tagline: 'Property Owners',
    headline: 'Maximise Your Malta Property Income',
    body: 'Radically transparent, institutional-grade management for short-let and residential properties. Join 40+ owners who trust us with their most valuable assets.',
    cta: { label: 'Get Free Estimate', href: '/owners/estimate' },
    secondaryCta: { label: 'View Our Standards', href: '/owners/standards' }
  }
};

// ══════════════════════════════════════════════════════════
// CONTACT PAGE BLOCKS
// ══════════════════════════════════════════════════════════

const contactHero: ContentBlock<'hero_centered', HeroCenteredData> = {
  id: 'contact-hero',
  type: 'hero_centered',
  tags: ['contact'],
  data: {
    tagline: 'Contact Us',
    headline: 'Let\'s talk',
    body: 'Whether you\'re an owner looking to maximise your property\'s potential or a guest with a question, we\'re here to help.',
    cta: { label: 'Send Message', href: '#contact-form' }
  }
};

const contactForm: ContentBlock<'contact_form', any> = {
  id: 'contact-form-block',
  type: 'contact_form',
  tags: ['contact'],
  data: {
    body: "Whether you're an owner looking to maximise your property's potential or a guest with a question, we're here to help."
  }
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
    meta: {
      ogTitle: 'About Christiano Vincenti — Malta Property Management',
    },
  },
  residential: {
    slug: '/residential',
    title: 'Residential Property Management Malta — Long-Let Services',
    description: 'Professional residential property management in Malta. Tenant sourcing, lease management, maintenance, and more.',
    tags: ['residential'],
    blocks: [residentialHero, residentialServices, residentialCta],
    meta: {
      ogTitle: 'Residential Property Management — Malta',
    },
  },
  owners: {
    slug: '/owners',
    title: 'Property Owners — Christiano Property Management',
    description: 'Maximise your property income in Malta with our professional management services.',
    tags: ['owners'],
    blocks: [ownersHero, homeStats, homeProcess, homePricing, aboutValues, homeCta],
    meta: {
      ogTitle: 'Property Owners — Malta Short-Let Management',
    },
  },
  contact: {
    slug: '/contact',
    title: 'Contact Us — Christiano Property Management',
    description: 'Get in touch with Malta\'s premier property management team.',
    tags: ['contact'],
    blocks: [contactHero, contactForm],
    meta: {
      ogTitle: 'Contact Christiano Property Management',
    },
  },
  blog: {
    slug: '/blog',
    title: 'Blog — Christiano Property Management',
    description: 'Expert insights on Malta property management, rental market trends, and owner strategies.',
    tags: ['blog'],
    blocks: [],
    meta: {
      ogTitle: 'Malta Property Management Blog — Christiano Vincenti',
      ogDescription: 'Expert guides, market data, and owner strategies from Malta\'s leading property managers.',
    },
  },
};

// ══════════════════════════════════════════════════════════
// CONTENT ACCESSORS
// ══════════════════════════════════════════════════════════

export function getPage(slug: string): PageDefinition | null {
  return PAGES[slug] ?? null;
}
