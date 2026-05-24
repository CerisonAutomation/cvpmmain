import { Helmet } from "react-helmet-async";
import { useCMS } from "@/context/CMSContext";

const ORG_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Christiano Property Management",
  url: "https://www.christianopropertymanagement.com",
  logo: "https://customer-assets.emergentagent.com/job_malta-stays-direct/artifacts/ta7za4jp_cv_logo_no_bg_gold.png",
  description: "Luxury short-term rental and property management across Malta.",
};

export const SEO = ({ title, description, image, url, type = "website", keywords, pageSeo = null, jsonLd = null }) => {
  const { cms } = useCMS();
  const brandName = cms.brand?.name || "Christiano Property Management";
  const baseTitle = `${brandName} | Malta Vacation Rentals`;
  const baseDesc = "Malta's premier luxury short-term rental management company.";

  const resolvedTitle = (pageSeo?.title || title || "");
  const resolvedDesc = (pageSeo?.description || description || "");
  const resolvedCanonical = pageSeo?.canonical || url || (typeof window !== 'undefined' ? window.location.href : "");

  const finalTitle = resolvedTitle ? `${String(resolvedTitle)} | ${brandName}` : baseTitle;
  const finalDesc = resolvedDesc ? String(resolvedDesc) : baseDesc;
  const finalImage = pageSeo?.ogImage || image || "https://images.unsplash.com/photo-1771218830084-fdd272e149a1?w=1200";
  const finalKeywords = keywords || "malta property, vacation rental malta";
  const noindex = !!pageSeo?.noindex;

  const ld = jsonLd || {
    ...ORG_JSON_LD,
    name: brandName,
    description: finalDesc,
  };

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDesc} />
      <meta name="keywords" content={finalKeywords} />
      {noindex && <meta name="robots" content="noindex" />}
      {resolvedCanonical && <link rel="canonical" href={resolvedCanonical} />}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDesc} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:url" content={resolvedCanonical} />
      <meta property="og:type" content={type} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDesc} />
      <meta name="twitter:image" content={finalImage} />
      <meta name="twitter:site" content="@christianopm" />
      <script type="application/ld+json">{JSON.stringify(ld)}</script>
    </Helmet>
  );
};

export const PropertySEO = ({ property }) => {
  if (!property) return null;
  const name = String(property.title || property.nickname || "Property");
  const desc = String(property.publicDescription?.summary?.slice(0, 160) || "");
  const img = String(property.picture?.thumbnail || "");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name,
    description: desc,
    image: img,
    address: {
      "@type": "PostalAddress",
      addressLocality: property.address?.city || "Malta",
      addressCountry: "MT",
    },
  };
  return (
    <SEO
      title={name}
      description={desc}
      image={img}
      type="website"
      jsonLd={jsonLd}
    />
  );
};
