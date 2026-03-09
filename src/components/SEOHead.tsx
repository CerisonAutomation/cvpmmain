/**
 * Enterprise SEO Component
 * - Dynamic meta tags
 * - Open Graph / Twitter Cards
 * - JSON-LD Structured Data
 */
import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  noindex?: boolean;
  structuredData?: object;
  keywords?: string[];
}

const SITE_NAME = 'Malta Luxury Stays';
const DEFAULT_IMAGE = '/og-image.jpg';
const BASE_URL = typeof window !== 'undefined' ? window.location.origin : '';

export function SEOHead({
  title,
  description,
  canonical,
  image = DEFAULT_IMAGE,
  type = 'website',
  noindex = false,
  structuredData,
  keywords = [],
}: SEOProps) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const canonicalUrl = canonical || (typeof window !== 'undefined' ? window.location.href : '');
  const imageUrl = image.startsWith('http') ? image : `${BASE_URL}${image}`;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Helper to set/update meta tags
    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // Standard meta
    setMeta('description', description);
    if (keywords.length) setMeta('keywords', keywords.join(', '));
    if (noindex) setMeta('robots', 'noindex,nofollow');

    // Open Graph
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', description, true);
    setMeta('og:image', imageUrl, true);
    setMeta('og:url', canonicalUrl, true);
    setMeta('og:type', type, true);
    setMeta('og:site_name', SITE_NAME, true);

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image', imageUrl);

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    // JSON-LD Structured Data
    if (structuredData) {
      let script = document.querySelector('#structured-data');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        script.setAttribute('id', 'structured-data');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }
  }, [fullTitle, description, canonicalUrl, imageUrl, type, noindex, structuredData, keywords]);

  return null;
}

// Predefined JSON-LD schemas
export function createPropertySchema(property: {
  name: string;
  description: string;
  image: string;
  address: { city: string; country: string };
  price: number;
  rating?: number;
  reviewCount?: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: property.name,
    description: property.description,
    image: property.image,
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.address.city,
      addressCountry: property.address.country,
    },
    priceRange: `€${property.price}+`,
    ...(property.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: property.rating,
        reviewCount: property.reviewCount || 1,
      },
    }),
  };
}

export function createOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+356-9999-9999',
      contactType: 'customer service',
      availableLanguage: ['English'],
    },
    sameAs: [],
  };
}

export function createBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function createFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
