import { SCHEMAS } from "./schemas";
import { AI_METADATA } from "./aiMetadata";
import { CATEGORIES } from "./categories";
import { PAGE_TEMPLATES, PAGE_CONFIGS, SEO_PAGE_KEYS } from "./pageTemplates";
import { THEME, FONT_PAIRS, COLOR_PRESETS } from "./theme";
import { uid, deepClone } from "./helpers";

function buildRegistry() {
  const out = {};
  for (const [type, def] of Object.entries(SCHEMAS)) {
    out[type] = {
      type,
      componentKey: def.componentKey || type,
      label: def.label || type,
      category: def.category || "content",
      icon: def.icon || null,
      schema: def.fields || {},
      defaults: def.defaults || {},
      aiFields: def.aiFields || [],
      editor: null,
      renderer: null,
      ai: AI_METADATA[type] || def.ai || { useCases: [], requiredModels: [], prompts: {} },
    };
  }
  return out;
}

export const registry = buildRegistry();

export const getBlock = (type) => registry[type];

export const listBlocks = (category) =>
  Object.values(registry).filter(b => !category || b.category === category);

export const listAiBlocks = (useCase) =>
  Object.values(registry).filter(b => b.ai?.useCases?.includes(useCase));

export const searchBlocks = (query) => {
  const q = query.toLowerCase();
  return Object.values(registry).filter(b =>
    b.label.toLowerCase().includes(q) ||
    b.type.includes(q) ||
    (b.aiFields || []).some(f => f.includes(q))
  );
};

export const populatedCategories = () => {
  const seen = new Set();
  for (const b of Object.values(registry)) seen.add(b.category);
  return CATEGORIES.filter(c => seen.has(c.id));
};

export const suggestBlocksFor = (pageBlocks, count = 3) => {
  const currentTypes = new Set(pageBlocks.map(b => b.type));
  const candidates = Object.values(registry)
    .filter(b => !currentTypes.has(b.type) && b.ai?.useCases?.length > 0)
    .sort(() => Math.random() - 0.5);
  return candidates.slice(0, count).map(b => ({
    type: b.type,
    label: b.label,
    reason: `${b.ai.useCases.join(", ")} — ${(b.ai.prompts?.generate || "").slice(0, 60)}...`,
  }));
};

const pageSeo = {
  home:      { title:"CVPM | Luxury Property Management Malta", description:"Full-service short-let property management across Malta & Gozo. Transparent fees, Superhost expertise.", keywords:"Malta property management, Airbnb Malta, short-term rental Malta", ogImage:"", canonical:"" },
  owners:    { title:"For Property Owners | CVPM Malta", description:"List your property with Malta's premier management team. 9+ years Superhost experience.", keywords:"property owners Malta, rental management Malta, landlord services Malta", ogImage:"", canonical:"" },
  properties:{ title:"Properties | CVPM Malta", description:"Browse luxury short-term rentals across Malta & Gozo. Book direct with best rates.", keywords:"Malta vacation rentals, Malta apartments, Malta villas short-term", ogImage:"", canonical:"" },
  about:     { title:"About | CVPM Malta", description:"Meet Christiano Vincenti PM — 9+ years of Superhost excellence in Malta.", keywords:"about CVPM, Malta property management team, Christiano Vincenti", ogImage:"", canonical:"" },
  contact:   { title:"Contact | CVPM Malta", description:"Get in touch with Christiano Vincenti PM. We respond within 4 hours.", keywords:"contact CVPM, Malta property management contact", ogImage:"", canonical:"" },
  pricing:   { title:"Pricing | CVPM Malta", description:"Simple, transparent property management pricing. No hidden fees.", keywords:"property management pricing Malta, CVPM fees, management costs", ogImage:"", canonical:"" },
};

export const getSeoDefaults = (pageId) => pageSeo[pageId] || { title:"", description:"", keywords:"", ogImage:"", canonical:"" };

export default registry;
