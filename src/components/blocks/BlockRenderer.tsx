import React, { Suspense, lazy } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import type { ContentBlock } from '@/lib/cms/types';
import { FadeInView } from '@/components/PageTransition';

// Lazy load blocks for performance
const HeroSplitBlock = lazy(() => import('./HeroSplitBlock'));
const HeroCenteredBlock = lazy(() => import('./HeroCenteredBlock'));
const TextBlock = lazy(() => import('./TextBlock'));
const SectionHeadingBlock = lazy(() => import('./SectionHeadingBlock'));
const FeatureGridBlock = lazy(() => import('./FeatureGridBlock'));
const ProofStripBlock = lazy(() => import('./ProofStripBlock'));
const StatsRowBlock = lazy(() => import('./StatsRowBlock'));
const ProcessStepsBlock = lazy(() => import('./ProcessStepsBlock'));
const PricingTableBlock = lazy(() => import('./PricingTableBlock'));
const FAQAccordionBlock = lazy(() => import('./FAQAccordionBlock'));
const CTABannerBlock = lazy(() => import('./CTABannerBlock'));
const TestimonialCarouselBlock = lazy(() => import('./TestimonialCarouselBlock'));
const ImageTextBlock = lazy(() => import('./ImageTextBlock'));
const LogoStripBlock = lazy(() => import('./LogoStripBlock'));
const PropertyShowcaseBlock = lazy(() => import('./PropertyShowcaseBlock'));
const BookingSearchBlock = lazy(() => import('./BookingSearchBlock'));
const ContactFormBlock = lazy(() => import('./ContactFormBlock'));

const BLOCK_COMPONENTS: Record<string, React.ComponentType<any>> = {
  hero_split: HeroSplitBlock,
  hero_centered: HeroCenteredBlock,
  text_block: TextBlock,
  section_heading: SectionHeadingBlock,
  feature_grid: FeatureGridBlock,
  proof_strip: ProofStripBlock,
  stats_row: StatsRowBlock,
  process_steps: ProcessStepsBlock,
  pricing_table: PricingTableBlock,
  faq_accordion: FAQAccordionBlock,
  cta_banner: CTABannerBlock,
  testimonial_carousel: TestimonialCarouselBlock,
  image_text: ImageTextBlock,
  logo_strip: LogoStripBlock,
  property_showcase: PropertyShowcaseBlock,
  booking_search: BookingSearchBlock,
  contact_form: ContactFormBlock,
};

function BlockErrorFallback({ resetErrorBoundary }: { resetErrorBoundary: () => void }) {
  return (
    <div className="py-8 text-center border border-dashed border-destructive/30 rounded-lg">
      <AlertTriangle className="w-5 h-5 text-destructive mx-auto mb-2" />
      <p className="text-xs text-muted-foreground mb-2">Block failed to load</p>
      <button onClick={resetErrorBoundary} className="text-[10px] text-primary hover:underline flex items-center gap-1 mx-auto">
        <RefreshCw size={10} /> Retry
      </button>
    </div>
  );
}

function BlockSkeleton() {
  return (
    <div className="w-full h-32 bg-secondary/20 animate-pulse rounded-lg" />
  );
}

const BlockRenderer: React.FC<{ block: ContentBlock }> = ({ block }) => {
  const Component = BLOCK_COMPONENTS[block.type];

  if (!Component) {
    console.warn(`[BlockRenderer] Unknown block type: ${block.type}`);
    return null;
  }

  return (
    <ErrorBoundary FallbackComponent={BlockErrorFallback}>
      <Suspense fallback={<BlockSkeleton />}>
        <FadeInView>
          <Component data={block.data} />
        </FadeInView>
      </Suspense>
    </ErrorBoundary>
  );
};

export default React.memo(BlockRenderer);
