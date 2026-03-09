/**
 * CMS Content Store — Enterprise-Grade JSON-Driven Content
 * Single source of truth. All components read from here.
 * Zero hardcoded copy. Complete data-driven architecture.
 */

import type {
  SiteConfig,
  PageDefinition,
  ContentBlock,
  HeroSplitData,
  HeroCenteredData,
  ProofStripData,
  ProcessStepsData,
  PricingTableData,
  FAQAccordionData,
  StatsRowData,
  CTABannerData,
  FeatureGridData,
  TextBlockData,
  ImageTextData,
  SectionHeadingData,
} from './types';

// ══════════════════════════════════════════════════════════
// SITE CONFIGURATION
// ══════════════════════════════════════════════════════════

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
  social: {
    instagram: 'https://instagram.com/christianopm',
    facebook: 'https://facebook.com/christianopm',
    linkedin: 'https://linkedin.com/company/christianopm',
  },
};

// ══════════════════════════════════════════════════════════
// HOME PAGE BLOCKS
// ══════════════════════════════════════════════════════════

const homeHero: ContentBlock<'hero_split', HeroSplitData> = {
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

const homeProof: ContentBlock<'proof_strip', ProofStripData> = {
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

const homeStats: ContentBlock<'stats_row', StatsRowData> = {
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

const homeProcess: ContentBlock<'process_steps', ProcessStepsData> = {
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

const homePricing: ContentBlock<'pricing_table', PricingTableData> = {
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

const homeFaq: ContentBlock<'faq_accordion', FAQAccordionData> = {
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

const homeCta: ContentBlock<'cta_banner', CTABannerData> = {
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

// ══════════════════════════════════════════════════════════
// OWNERS PAGE BLOCKS
// ══════════════════════════════════════════════════════════

const ownersHero: ContentBlock<'hero_centered', HeroCenteredData> = {
  id: 'owners-hero',
  type: 'hero_centered',
  tags: ['owners', 'above-fold'],
  data: {
    tagline: 'For Property Owners',
    headline: 'Turn your property into a performing asset',
    body: 'Full-service short-let management across Malta and Gozo. We handle everything — you receive monthly payouts and transparent reports.',
    cta: { label: 'Get Your Free Estimate', href: '/owners/estimate' },
    secondaryCta: { label: 'View Pricing', href: '/owners/pricing' },
  },
};

const ownersStats: ContentBlock<'stats_row', StatsRowData> = {
  id: 'owners-stats',
  type: 'stats_row',
  tags: ['owners', 'trust'],
  data: {
    items: [
      { value: '€2.4M+', label: 'Revenue Generated' },
      { value: '45+', label: 'Properties Managed' },
      { value: '4.97', label: 'Average Rating' },
      { value: '94%', label: 'Occupancy Rate' },
    ],
  },
};

const ownersTrust: ContentBlock<'feature_grid', FeatureGridData> = {
  id: 'owners-trust',
  type: 'feature_grid',
  tags: ['owners', 'features'],
  data: {
    heading: {
      tagline: 'Why Christiano Vincenti',
      headline: 'The difference is in the detail',
      highlightWord: 'detail',
      alignment: 'center',
    },
    items: [
      { icon: 'Shield', title: 'No Hidden Markups', description: 'Maintenance passed at cost, always. Full transparency on every invoice.' },
      { icon: 'BarChart3', title: 'Owner Dashboard', description: 'Live bookings, revenue & statements. Access your data 24/7.' },
      { icon: 'Clock', title: '24hr Response', description: 'Guaranteed reply time for owners and guests. No exceptions.' },
      { icon: 'TrendingUp', title: 'Dynamic Pricing', description: 'AI-optimised nightly rates based on demand, seasonality, and events.' },
    ],
    columns: 4,
  },
};

const ownersProcess: ContentBlock<'process_steps', ProcessStepsData> = {
  id: 'owners-process',
  type: 'process_steps',
  tags: ['owners', 'process'],
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

const ownersPricing: ContentBlock<'pricing_table', PricingTableData> = {
  id: 'owners-pricing',
  type: 'pricing_table',
  tags: ['owners', 'pricing'],
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

const ownersFaq: ContentBlock<'faq_accordion', FAQAccordionData> = {
  id: 'owners-faq',
  type: 'faq_accordion',
  tags: ['owners', 'faq'],
  data: {
    heading: {
      tagline: 'FAQ',
      headline: 'Owner questions answered',
      highlightWord: 'answered',
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
      {
        question: 'How do you handle guest check-ins?',
        answer: 'We offer flexible check-in options including smart locks, lockboxes, or personal meet-and-greet depending on your property and preferences.',
      },
      {
        question: 'What if a guest damages my property?',
        answer: 'All bookings are covered by platform protection policies. We also document property condition before and after each stay and handle any damage claims on your behalf.',
      },
    ],
  },
};

const ownersCta: ContentBlock<'cta_banner', CTABannerData> = {
  id: 'owners-cta',
  type: 'cta_banner',
  tags: ['owners', 'conversion'],
  data: {
    headline: 'Ready to begin?',
    body: 'Tell us about your property and we\'ll provide a detailed rental income projection within 24 hours.',
    cta: { label: 'Start Free Estimate', href: '/owners/estimate' },
    variant: 'gold',
  },
};

// ══════════════════════════════════════════════════════════
// ABOUT PAGE BLOCKS
// ══════════════════════════════════════════════════════════

const aboutHero: ContentBlock<'hero_centered', HeroCenteredData> = {
  id: 'about-hero',
  type: 'hero_centered',
  tags: ['about', 'above-fold'],
  data: {
    tagline: 'About Us',
    headline: 'Malta\'s Premier Property Partner',
    body: 'Christiano Vincenti Property Management is a full-service short-let and residential property management company based in Malta. We combine institutional-grade operational standards with the personal touch of a boutique operator.',
    cta: { label: 'Get in Touch', href: '/contact' },
  },
};

const aboutMission: ContentBlock<'text_block', TextBlockData> = {
  id: 'about-mission',
  type: 'text_block',
  tags: ['about', 'story'],
  data: {
    heading: 'Our Mission',
    body: 'To set the benchmark for property management in the Maltese Islands by combining cutting-edge technology, transparent operations, and genuine hospitality. We believe every property deserves to perform at its full potential — and every guest deserves a five-star experience.',
    alignment: 'left',
  },
};

const aboutStory: ContentBlock<'text_block', TextBlockData> = {
  id: 'about-story',
  type: 'text_block',
  tags: ['about', 'story'],
  data: {
    heading: 'Our Story',
    body: 'Founded in Malta with deep roots in the local property market, Christiano Vincenti grew from a passion for hospitality and a frustration with the status quo. Too many property owners were either over-charged, under-serviced, or left in the dark about their own investments. We set out to change that — building a management platform that puts owners first with radical transparency, no hidden markups, and institutional-level reporting.',
    alignment: 'left',
  },
};

const aboutWhyMalta: ContentBlock<'text_block', TextBlockData> = {
  id: 'about-why-malta',
  type: 'text_block',
  tags: ['about', 'market'],
  data: {
    heading: 'Why Malta & Gozo',
    body: 'Malta is one of Europe\'s fastest-growing short-let markets, with year-round sunshine, a thriving tourism sector, and strong demand from business travellers, digital nomads, and holidaymakers alike. With an average occupancy rate exceeding 90% in prime areas, the islands offer exceptional rental yields when managed professionally. Our deep understanding of Malta Tourism Authority (MTA) regulations, local pricing dynamics, and seasonal demand patterns gives our owners a measurable edge.',
    alignment: 'left',
  },
};

const aboutValues: ContentBlock<'feature_grid', FeatureGridData> = {
  id: 'about-values',
  type: 'feature_grid',
  tags: ['about', 'values'],
  data: {
    heading: {
      tagline: 'Our Values',
      headline: 'What drives us',
      highlightWord: 'drives',
      alignment: 'center',
    },
    items: [
      { icon: 'Shield', title: 'Transparency', description: 'No hidden fees or markups. Maintenance at cost. Monthly statements with full breakdowns.' },
      { icon: 'Sparkles', title: 'Excellence', description: 'Professional photography, dynamic pricing, and 5-star guest communication as standard.' },
      { icon: 'Clock', title: 'Accountability', description: '24-hour guaranteed response times. Every property gets a dedicated account manager.' },
      { icon: 'Lightbulb', title: 'Innovation', description: 'AI-powered pricing optimisation, multi-platform distribution, and real-time owner dashboards.' },
    ],
    columns: 2,
  },
};

const aboutStats: ContentBlock<'stats_row', StatsRowData> = {
  id: 'about-stats',
  type: 'stats_row',
  tags: ['about', 'numbers'],
  data: {
    items: [
      { value: '€2.4M+', label: 'Total revenue generated for our property owners across Malta and Gozo.' },
      { value: '45+', label: 'Professionally managed across Sliema, St Julian\'s, Valletta, Mdina, Mellieħa, and Gozo.' },
      { value: '4.97', label: 'Average guest review score — consistently in the top 1% in Malta.' },
      { value: '94%', label: 'Average annual occupancy rate, outperforming market averages.' },
    ],
  },
};

const aboutCta: ContentBlock<'cta_banner', CTABannerData> = {
  id: 'about-cta',
  type: 'cta_banner',
  tags: ['about', 'conversion'],
  data: {
    headline: 'Partner with Malta\'s most trusted property managers',
    body: 'Whether you\'re an owner looking to maximise returns or a guest seeking exceptional accommodation, we\'re here to help.',
    cta: { label: 'Get in Touch', href: '/contact' },
    variant: 'default',
  },
};

// ══════════════════════════════════════════════════════════
// CONTACT PAGE BLOCKS
// ══════════════════════════════════════════════════════════

const contactHero: ContentBlock<'hero_centered', HeroCenteredData> = {
  id: 'contact-hero',
  type: 'hero_centered',
  tags: ['contact', 'above-fold'],
  data: {
    tagline: 'Get in Touch',
    headline: 'Let\'s talk',
    body: 'Whether you\'re an owner looking to maximise your property\'s potential or a guest with a question, we\'re here to help.',
    cta: { label: 'Send Message', href: '#contact-form' },
  },
};

const contactInfo: ContentBlock<'feature_grid', FeatureGridData> = {
  id: 'contact-info',
  type: 'feature_grid',
  tags: ['contact', 'info'],
  data: {
    heading: {
      tagline: 'Contact Details',
      headline: 'Reach us directly',
      alignment: 'left',
    },
    items: [
      { icon: 'Mail', title: 'Email', description: 'info@christianopm.com' },
      { icon: 'Phone', title: 'Phone', description: '+356 7927 4688' },
      { icon: 'MapPin', title: 'Location', description: 'Malta & Gozo' },
      { icon: 'Clock', title: 'Response Time', description: 'Within 24 hours' },
    ],
    columns: 2,
  },
};

const contactFaq: ContentBlock<'faq_accordion', FAQAccordionData> = {
  id: 'contact-faq',
  type: 'faq_accordion',
  tags: ['contact', 'faq'],
  data: {
    heading: {
      tagline: 'Before You Reach Out',
      headline: 'Quick answers',
      highlightWord: 'answers',
      alignment: 'left',
    },
    items: [
      {
        question: 'What\'s your typical response time?',
        answer: 'We respond to all enquiries within 24 hours during business days. Urgent guest matters are addressed within 2 hours.',
      },
      {
        question: 'Do you offer property viewings?',
        answer: 'Yes, we can arrange viewings for prospective owners. Contact us to schedule a convenient time.',
      },
      {
        question: 'Where are your offices located?',
        answer: 'We operate across Malta and Gozo, with team members based in Sliema, Valletta, and Victoria (Gozo).',
      },
    ],
  },
};

// ══════════════════════════════════════════════════════════
// STANDARDS PAGE BLOCKS
// ══════════════════════════════════════════════════════════

const standardsHero: ContentBlock<'hero_centered', HeroCenteredData> = {
  id: 'standards-hero',
  type: 'hero_centered',
  tags: ['standards', 'above-fold'],
  data: {
    tagline: 'Our Standards',
    headline: 'The Christiano Vincenti Difference',
    body: 'Every property in our portfolio is held to institutional-grade standards. From the linens on the bed to the speed of our guest responses, we\'ve codified what excellence looks like — and we deliver it consistently.',
    cta: { label: 'See Pricing', href: '/owners/pricing' },
  },
};

const standardsHospitality: ContentBlock<'feature_grid', FeatureGridData> = {
  id: 'standards-hospitality',
  type: 'feature_grid',
  tags: ['standards', 'hospitality'],
  data: {
    heading: {
      tagline: 'Hospitality Standards',
      headline: 'Guest experience excellence',
      highlightWord: 'excellence',
      alignment: 'center',
    },
    items: [
      { icon: 'Gift', title: '5-Star Welcome Pack', description: 'Every guest receives a curated welcome including local snacks, water, a personalised guidebook, and premium toiletries upon arrival.' },
      { icon: 'MessageCircle', title: 'Sub-1-Hour Response', description: 'Guest messages are answered within 60 minutes during business hours, and within 2 hours overnight. Average response time: 18 minutes.' },
      { icon: 'Camera', title: 'Professional Photography', description: 'Every listing features architectural-quality photography with optimal lighting, staging, and composition — refreshed annually.' },
      { icon: 'TrendingUp', title: 'Smart Pricing', description: 'AI-driven dynamic pricing adjusted daily based on demand, seasonality, local events, and competitive analysis to maximise revenue.' },
    ],
    columns: 2,
  },
};

const standardsProperty: ContentBlock<'feature_grid', FeatureGridData> = {
  id: 'standards-property',
  type: 'feature_grid',
  tags: ['standards', 'property'],
  data: {
    heading: {
      tagline: 'Property Standards',
      headline: 'Hotel-grade quality',
      highlightWord: 'quality',
      alignment: 'center',
    },
    items: [
      { icon: 'Bed', title: 'Hotel-Grade Linens', description: '300-thread-count cotton sheets, professional laundering after every checkout, with regular replacement schedules.' },
      { icon: 'Sparkles', title: 'Deep Clean Protocol', description: '42-point cleaning checklist between every guest, including kitchen appliances, behind furniture, and all touch points.' },
      { icon: 'ShieldCheck', title: 'Safety Compliance', description: 'Fire extinguishers, smoke detectors, carbon monoxide detectors, first aid kits, and emergency procedures in every property.' },
      { icon: 'Wrench', title: 'Maintenance at Cost', description: 'All maintenance is coordinated through our vetted contractor network and passed through at cost — zero markups, always.' },
    ],
    columns: 2,
  },
};

const standardsReporting: ContentBlock<'feature_grid', FeatureGridData> = {
  id: 'standards-reporting',
  type: 'feature_grid',
  tags: ['standards', 'reporting'],
  data: {
    heading: {
      tagline: 'Transparency & Reporting',
      headline: 'Complete visibility',
      highlightWord: 'visibility',
      alignment: 'center',
    },
    items: [
      { icon: 'FileText', title: 'Monthly Owner Statements', description: 'Detailed monthly reports covering revenue, occupancy, expenses, guest reviews, and market benchmarking.' },
      { icon: 'BarChart3', title: 'Real-Time Dashboard', description: 'Access your owner dashboard 24/7 to view bookings, calendar, earnings, and upcoming maintenance.' },
      { icon: 'Calendar', title: 'Quarterly Strategy Review', description: 'Every quarter, we review your property\'s performance and recommend pricing, furnishing, or listing optimisations.' },
      { icon: 'TrendingUp', title: 'Annual Performance Report', description: 'Comprehensive yearly summary with ROI analysis, market comparison, and forward-looking revenue projections.' },
    ],
    columns: 2,
  },
};

const standardsCta: ContentBlock<'cta_banner', CTABannerData> = {
  id: 'standards-cta',
  type: 'cta_banner',
  tags: ['standards', 'conversion'],
  data: {
    headline: 'Experience the difference',
    body: 'See how our standards translate into real results for your property.',
    cta: { label: 'Get Free Estimate', href: '/owners/estimate' },
    variant: 'gold',
  },
};

// ══════════════════════════════════════════════════════════
// FAQ PAGE BLOCKS
// ══════════════════════════════════════════════════════════

const faqHero: ContentBlock<'hero_centered', HeroCenteredData> = {
  id: 'faq-hero',
  type: 'hero_centered',
  tags: ['faq', 'above-fold'],
  data: {
    tagline: 'Help Centre',
    headline: 'Frequently Asked Questions',
    body: 'Find answers to the most common questions about our property management services.',
    cta: { label: 'Contact Us', href: '/contact' },
  },
};

const faqOwners: ContentBlock<'faq_accordion', FAQAccordionData> = {
  id: 'faq-owners',
  type: 'faq_accordion',
  tags: ['faq', 'owners'],
  data: {
    heading: {
      tagline: 'For Owners',
      headline: 'Property management questions',
      highlightWord: 'management',
      alignment: 'left',
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

const faqGuests: ContentBlock<'faq_accordion', FAQAccordionData> = {
  id: 'faq-guests',
  type: 'faq_accordion',
  tags: ['faq', 'guests'],
  data: {
    heading: {
      tagline: 'For Guests',
      headline: 'Booking & stay questions',
      highlightWord: 'stay',
      alignment: 'left',
    },
    items: [
      {
        question: 'How do I book a property?',
        answer: 'You can book directly through our website or via our listings on Airbnb, Booking.com, and Vrbo. Direct bookings receive priority support and the best rates.',
      },
      {
        question: 'What\'s included in my stay?',
        answer: 'All stays include fresh linens, towels, toiletries, WiFi, and a welcome pack. Specific amenities vary by property and are listed on each property page.',
      },
      {
        question: 'What are check-in and check-out times?',
        answer: 'Standard check-in is 3:00 PM and check-out is 11:00 AM. Early check-in or late check-out may be available upon request, subject to availability.',
      },
      {
        question: 'What if I need help during my stay?',
        answer: 'Our guest support team is available 24/7. You\'ll receive direct contact details upon booking confirmation.',
      },
    ],
  },
};

const faqCta: ContentBlock<'cta_banner', CTABannerData> = {
  id: 'faq-cta',
  type: 'cta_banner',
  tags: ['faq', 'conversion'],
  data: {
    headline: 'Still have questions?',
    body: 'Our team is ready to help with any specific enquiries.',
    cta: { label: 'Contact Us', href: '/contact' },
    variant: 'minimal',
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
    blocks: [homeHero, homeProof, homeStats, homeProcess, homePricing, homeFaq, homeCta],
    meta: {
      ogTitle: 'Christiano Property Management — Malta\'s Premier Property Partner',
      ogDescription: 'Full-service short-let management across Malta & Gozo.',
    },
  },
  owners: {
    slug: '/owners',
    title: 'Property Owners — Christiano Property Management',
    description: 'Turn your Malta property into a performing asset. Full-service management with transparent pricing and no hidden fees.',
    tags: ['owners'],
    blocks: [ownersHero, ownersStats, homeProof, ownersProcess, ownersTrust, ownersPricing, ownersFaq, ownersCta],
    meta: {
      ogTitle: 'Property Owners — Malta Short-Let Management',
      ogDescription: 'Maximize your property\'s income with Malta\'s most transparent property manager.',
    },
  },
  about: {
    slug: '/about',
    title: 'About Us — Christiano Property Management',
    description: 'Malta\'s premier property partner. Institutional-grade standards with boutique personal service.',
    tags: ['about'],
    blocks: [aboutHero, aboutMission, aboutStory, aboutWhyMalta, aboutValues, aboutStats, aboutCta],
    meta: {
      ogTitle: 'About Christiano Vincenti — Malta Property Management',
      ogDescription: 'Full-service property management combining institutional standards with personal service.',
    },
  },
  contact: {
    slug: '/contact',
    title: 'Contact Us — Christiano Property Management',
    description: 'Get in touch with Malta\'s premier property management team. We respond within 24 hours.',
    tags: ['contact'],
    blocks: [contactHero, contactInfo, contactFaq],
    meta: {
      ogTitle: 'Contact Christiano Property Management',
      ogDescription: 'Reach Malta\'s most trusted property managers. Response guaranteed within 24 hours.',
    },
  },
  standards: {
    slug: '/owners/standards',
    title: 'Our Standards — Christiano Property Management',
    description: 'Institutional-grade hospitality and property standards. The Christiano Vincenti difference.',
    tags: ['standards', 'owners'],
    blocks: [standardsHero, standardsHospitality, standardsProperty, standardsReporting, standardsCta],
    meta: {
      ogTitle: 'Our Standards — Christiano Property Management',
      ogDescription: 'Discover the institutional-grade standards that set us apart.',
    },
  },
  faq: {
    slug: '/faq',
    title: 'FAQ — Christiano Property Management',
    description: 'Frequently asked questions about Malta property management services.',
    tags: ['faq'],
    blocks: [faqHero, faqOwners, faqGuests, faqCta],
    meta: {
      ogTitle: 'Frequently Asked Questions — Christiano Property Management',
      ogDescription: 'Find answers to common questions about property management in Malta.',
    },
  },
};

// ══════════════════════════════════════════════════════════
// CONTENT ACCESSORS
// ══════════════════════════════════════════════════════════

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

export function getAllBlocksByType<T = unknown>(page: PageDefinition, type: string): ContentBlock<any, T>[] {
  return page.blocks.filter(b => b.type === type) as ContentBlock<any, T>[];
}
