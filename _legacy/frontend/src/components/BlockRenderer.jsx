import { memo, lazy, Suspense } from "react";
import { getBlock, SHELL_BLOCK_TYPES, isRenderedBlockType } from "@/lib/registry";
import { BlockErrorBoundary } from "@/components/BlockErrorBoundary";
import { normalizeBlockData } from "@/components/blocks/normalizeData";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useCMS } from "@/context/CMSContext";

const LiveHero = lazy(() => import("@/components/blocks/LiveHero").then(m => ({ default: m.LiveHero })));
const LiveOwners = lazy(() => import("@/components/blocks/LiveOwners").then(m => ({ default: m.LiveOwners })));
const LiveAbout = lazy(() => import("@/components/blocks/LiveAbout").then(m => ({ default: m.LiveAbout })));
const LiveProperties = lazy(() => import("@/components/blocks/LiveProperties").then(m => ({ default: m.LiveProperties })));
const LiveTestimonials = lazy(() => import("@/components/blocks/LiveTestimonials").then(m => ({ default: m.LiveTestimonials })));
const LiveCTA = lazy(() => import("@/components/blocks/LiveCTA").then(m => ({ default: m.LiveCTA })));
const LiveStats = lazy(() => import("@/components/blocks/LiveStats").then(m => ({ default: m.LiveStats })));
const LiveFeatures = lazy(() => import("@/components/blocks/LiveFeatures").then(m => ({ default: m.LiveFeatures })));
const LiveSpacer = lazy(() => import("@/components/blocks/LiveSpacer").then(m => ({ default: m.LiveSpacer })));
const LiveDivider = lazy(() => import("@/components/blocks/LiveDivider").then(m => ({ default: m.LiveDivider })));
const LiveText = lazy(() => import("@/components/blocks/LiveText").then(m => ({ default: m.LiveText })));
const LiveImage = lazy(() => import("@/components/blocks/LiveImage").then(m => ({ default: m.LiveImage })));
const LivePricing = lazy(() => import("@/components/blocks/LivePricing").then(m => ({ default: m.LivePricing })));
const LiveFaq = lazy(() => import("@/components/blocks/LiveFaq").then(m => ({ default: m.LiveFaq })));

const COMPONENT_MAP = {
  hero: LiveHero,
  owners: LiveOwners,
  owners_hero: LiveOwners,
  about: LiveAbout,
  properties: LiveProperties,
  testimonials: LiveTestimonials,
  cta: LiveCTA,
  stats: LiveStats,
  features: LiveFeatures,
  spacer: LiveSpacer,
  divider: LiveDivider,
  text: LiveText,
  image: LiveImage,
  pricing: LivePricing,
  faq: LiveFaq,
};

const TYPE_ALIASES = { owners_hero: "owners" };

function resolveTheme(cmsTheme, themeProp) {
  if (themeProp) return themeProp;
  const c = cmsTheme?.colors || {};
  return {
    accent: c.gold || "#D4AF37",
    accentHover: c.goldHover || "#E5C158",
    bg: c.bgDark || "#0F0F10",
    surface: c.bgCard || "#161618",
    text: c.textPrimary || "#F5F5F0",
    muted: c.textSecondary || "#A1A1AA",
  };
}

export const BlockRenderer = memo(({ block, isEditing = false, onEdit, theme: themeProp }) => {
  const { cms } = useCMS();
  const type = block?.type;
  if (!type || SHELL_BLOCK_TYPES.has(type)) return null;

  const def = getBlock(type);
  if (!def && !isRenderedBlockType(type)) return null;

  const mapKey = TYPE_ALIASES[type] || type;
  const Component = COMPONENT_MAP[mapKey];
  if (!Component) {
    if (!isEditing) return null;
    return (
      <div className="py-8 px-6 border border-dashed border-[#D4AF37]/30 text-center text-sm text-[#A1A1AA]">
        Block &quot;{type}&quot; — add a renderer to ship on the live site
      </div>
    );
  }

  const merged = { ...(def?.defaults || {}), ...(block?.data || {}) };
  const data = normalizeBlockData(type, merged);
  const theme = resolveTheme(cms?.theme, themeProp);
  const handleEdit = isEditing && onEdit
    ? (field, value) => onEdit(block.id, field, value)
    : undefined;

  const isHero = type === "hero" || type === "owners_hero";
  const noAnim = type === "spacer" || type === "divider" || isEditing;

  const rendered = (
    <BlockErrorBoundary blockType={type}>
      <Suspense fallback={<div className="h-24 bg-[#161618] animate-pulse" />}>
        <Component d={data} onEdit={handleEdit} theme={theme} isEditing={isEditing} />
      </Suspense>
    </BlockErrorBoundary>
  );

  if (noAnim || isHero) return rendered;
  return <ScrollReveal>{rendered}</ScrollReveal>;
});

export default BlockRenderer;
