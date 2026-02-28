/**
 * Site Configuration - Central JSON config for all site content.
 * Now uses API for property data - no hardcoded properties.
 */

// Property types now come from Guesty hooks

export interface PropertyConfig {
  id: string;
  title: string;
  location: string;
  type: string;
  guests: number;
  beds: number;
  baths: number;
  pricePerNight: string;
  image: string;
  bookingUrl: string;
  featured: boolean;
  summary: string;
}

export interface PlanConfig {
  name: string;
  price: string;
  subtitle: string;
  description: string;
  features: string[];
  highlighted: boolean;
}

export interface FAQConfig {
  question: string;
  answer: string;
}

export interface SiteConfig {
  company: typeof COMPANY_INFO;
  properties: PropertyConfig[];
  plans: PlanConfig[];
  faqs: FAQConfig[];
}

// Company info - minimal config
export const COMPANY_INFO = {
  name: "Christiano Vincenti",
  email: "info@christianovincenti.com",
  phone: "+356 1234 5678",
  address: "Malta",
  website: "https://christianovincenti.com",
  bookingUrl: "",
};

// Default FAQs
export const DEFAULT_FAQS: FAQConfig[] = [
  {
    question: "What areas do you cover?",
    answer: "We manage properties across Malta and Gozo, including St Julian's, Valletta, Sliema, Gzira, and more.",
  },
  {
    question: "What are your fees?",
    answer: "Our management fees start at 15% of booking revenue. We offer Essential (15%), Premium (25%), and Enterprise (custom) plans.",
  },
  {
    question: "Do you handle cleaning?",
    answer: "Yes, professional cleaning between guests is included in our Premium and Enterprise plans.",
  },
];

// Default plans
export const DEFAULT_PLANS: PlanConfig[] = [
  {
    name: "Essential",
    price: "15%",
    subtitle: "per booking",
    description: "Perfect for property owners who want hands-off management.",
    features: [
      "Guest verification",
      "24/7 support",
      "Dynamic pricing",
      "Listing optimization",
    ],
    highlighted: false,
  },
  {
    name: "Premium",
    price: "25%",
    subtitle: "per booking",
    description: "Full-service management for maximum returns.",
    features: [
      "Everything in Essential",
      "Professional cleaning",
      "Key handover",
      "Maintenance team",
      "Insurance coverage",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    subtitle: "tailored pricing",
    description: "For portfolio owners and property managers.",
    features: [
      "Everything in Premium",
      "Dedicated account manager",
      "Multiple properties",
      "Revenue reporting",
      "Legal support",
    ],
    highlighted: false,
  },
];

// Site config - loads from API
export function getSiteConfig(properties?: any[]): SiteConfig {
  const propertyConfigs: PropertyConfig[] = (properties || []).map((p) => ({
    id: p.id,
    title: p.name,
    location: p.destination,
    type: "Apartment",
    guests: p.max_guests,
    beds: p.bedrooms,
    baths: p.bathrooms,
    pricePerNight: `€${p.price_per_night}`,
    image: p.hero_image || "",
    bookingUrl: "", // Internal booking
    featured: true,
    summary: p.description || "",
  }));

  return {
    company: COMPANY_INFO,
    properties: propertyConfigs,
    plans: DEFAULT_PLANS,
    faqs: DEFAULT_FAQS,
  };
}

// Update site config (for admin)
export function updateSiteConfig(config: Partial<SiteConfig>): SiteConfig {
  const current = getSiteConfig();
  return {
    ...current,
    ...config,
    company: config.company || current.company,
    properties: config.properties || current.properties,
    plans: config.plans || current.plans,
    faqs: config.faqs || current.faqs,
  };
}

