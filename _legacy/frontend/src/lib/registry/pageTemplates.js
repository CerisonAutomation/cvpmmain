import { SCHEMAS } from "./schemas";
import { uid, deepClone } from "./helpers";

export const PAGE_TEMPLATES = {
  home: { name:"Home Page", blocks:[
    { type:"header" }, { type:"hero" }, { type:"stats" }, { type:"features" },
    { type:"properties" }, { type:"owners_hero" }, { type:"testimonials" },
    { type:"pricing" }, { type:"about" }, { type:"cta" }, { type:"footer" },
  ]},
  owners: { name:"For Owners", blocks:[
    { type:"header" }, { type:"owners_hero" }, { type:"features" },
    { type:"pricing" }, { type:"testimonials" }, { type:"faq" },
    { type:"cta" }, { type:"footer" },
  ]},
  properties: { name:"Properties", blocks:[
    { type:"header" }, { type:"hero" }, { type:"properties" },
    { type:"guesty_listings" }, { type:"cta" }, { type:"footer" },
  ]},
  about: { name:"About Us", blocks:[
    { type:"header" }, { type:"hero" }, { type:"about" },
    { type:"stats" }, { type:"team" }, { type:"logos" },
    { type:"cta" }, { type:"footer" },
  ]},
  contact: { name:"Contact", blocks:[
    { type:"header" }, { type:"contact" }, { type:"map" }, { type:"footer" },
  ]},
  pricing: { name:"Pricing", blocks:[
    { type:"header" }, { type:"pricing" }, { type:"faq" },
    { type:"testimonials" }, { type:"cta" }, { type:"footer" },
  ]},
  landing: { name:"Minimal Landing", blocks:[
    { type:"hero" }, { type:"stats" }, { type:"features" },
    { type:"cta" }, { type:"footer" },
  ]},
};

Object.keys(PAGE_TEMPLATES).forEach(pageKey => {
  PAGE_TEMPLATES[pageKey].blocks = PAGE_TEMPLATES[pageKey].blocks.map((b, i) => ({
    id: b.id || `${b.type}_${pageKey}_${i}`,
    type: b.type,
    data: b.data || { ...(SCHEMAS[b.type]?.defaults || {}) },
    visible: b.visible !== false,
  }));
});

export const DEFAULT_PAGES = [
  { id:"p_home", name:"Home", slug:"/", published:true, blocks:[
    { id:"b_header", type:"header", data:SCHEMAS.header.defaults },
    { id:"b_hero", type:"hero", data:SCHEMAS.hero.defaults },
    { id:"b_stats", type:"stats", data:SCHEMAS.stats.defaults },
    { id:"b_features", type:"features", data:SCHEMAS.features.defaults },
    { id:"b_properties", type:"properties", data:SCHEMAS.properties.defaults },
    { id:"b_testi", type:"testimonials", data:SCHEMAS.testimonials.defaults },
    { id:"b_cta", type:"cta", data:SCHEMAS.cta.defaults },
    { id:"b_footer", type:"footer", data:SCHEMAS.footer.defaults },
  ]},
  { id:"p_owners", name:"Owners", slug:"/property-owners", published:true, blocks:[
    { id:"b_header2", type:"header", data:SCHEMAS.header.defaults },
    { id:"b_ohero", type:"owners_hero", data:SCHEMAS.owners_hero.defaults },
    { id:"b_feats", type:"features", data:SCHEMAS.features.defaults },
    { id:"b_price", type:"pricing", data:SCHEMAS.pricing.defaults },
    { id:"b_faq", type:"faq", data:SCHEMAS.faq.defaults },
    { id:"b_cta2", type:"cta", data:SCHEMAS.cta.defaults },
    { id:"b_footer2", type:"footer", data:SCHEMAS.footer.defaults },
  ]},
  { id:"p_properties", name:"Properties", slug:"/properties", published:true, blocks:[
    { id:"b_header3", type:"header", data:SCHEMAS.header.defaults },
    { id:"b_props", type:"properties", data:SCHEMAS.properties.defaults },
    { id:"b_footer3", type:"footer", data:SCHEMAS.footer.defaults },
  ]},
  { id:"p_contact", name:"Contact", slug:"/contact", published:false, blocks:[
    { id:"b_header4", type:"header", data:SCHEMAS.header.defaults },
    { id:"b_contact", type:"contact", data:SCHEMAS.contact.defaults },
    { id:"b_footer4", type:"footer", data:SCHEMAS.footer.defaults },
  ]},
];

export const PAGE_CONFIGS = {
  home: { name: "Home", slug: "/" },
  owners: { name: "For Owners", slug: "/property-owners" },
  properties: { name: "Properties", slug: "/properties" },
  about: { name: "About", slug: "/about" },
  contact: { name:"Contact", slug:"/contact" },
  pricing: { name:"Pricing", slug:"/pricing" },
};

export const SEO_PAGE_KEYS = Object.keys(PAGE_CONFIGS);
