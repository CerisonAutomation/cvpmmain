/**
 * BlockRenderer — universal CMS block dispatcher.
 * All casts now use proper imported types from cms/types.
 */
import type {
  ContentBlock,
  ProofStripData,
  StatsRowData,
  ProcessStepsData,
  PricingTableData,
  FAQAccordionData,
  CTABannerData,
  HeroCenteredData,
  HeroSplitData,
  FeatureGridData,
  TextBlockData,
  SectionHeadingData,
  TestimonialCarouselData,
  ImageTextData,
  LogoStripData,
  PropertyShowcaseData,
} from '@/lib/cms/types';
import ProofStripBlock from './ProofStripBlock';
import StatsRowBlock from './StatsRowBlock';
import ProcessStepsBlock from './ProcessStepsBlock';
import PricingTableBlock from './PricingTableBlock';
import FAQAccordionBlock from './FAQAccordionBlock';
import CTABannerBlock from './CTABannerBlock';
import HeroCenteredBlock from './HeroCenteredBlock';
import HeroSplitBlock from './HeroSplitBlock';
import FeatureGridBlock from './FeatureGridBlock';
import TextBlock from './TextBlock';
import SectionHeadingBlock from './SectionHeadingBlock';
import PropertyShowcaseBlock from './PropertyShowcaseBlock';
import TestimonialCarouselBlock from './TestimonialCarouselBlock';
import ImageTextBlock from './ImageTextBlock';
import LogoStripBlock from './LogoStripBlock';

interface Props {
  block: ContentBlock;
}

export default function BlockRenderer({ block }: Props) {
  switch (block.type) {
    case 'proof_strip':
      return <ProofStripBlock data={block.data as ProofStripData} />;
    case 'stats_row':
      return <StatsRowBlock data={block.data as StatsRowData} />;
    case 'process_steps':
      return <ProcessStepsBlock data={block.data as ProcessStepsData} />;
    case 'pricing_table':
      return <PricingTableBlock data={block.data as PricingTableData} />;
    case 'faq_accordion':
      return <FAQAccordionBlock data={block.data as FAQAccordionData} />;
    case 'cta_banner':
      return <CTABannerBlock data={block.data as CTABannerData} />;
    case 'hero_centered':
      return <HeroCenteredBlock data={block.data as HeroCenteredData} />;
    case 'hero_split':
      return <HeroSplitBlock data={block.data as HeroSplitData} />;
    case 'feature_grid':
      return <FeatureGridBlock data={block.data as FeatureGridData} />;
    case 'text_block':
      return <TextBlock data={block.data as TextBlockData} />;
    case 'section_heading':
      return <SectionHeadingBlock data={block.data as SectionHeadingData} />;
    case 'property_showcase':
      return <PropertyShowcaseBlock data={block.data as PropertyShowcaseData} />;
    case 'testimonial_carousel':
      return <TestimonialCarouselBlock data={block.data as TestimonialCarouselData} />;
    case 'image_text':
      return <ImageTextBlock data={block.data as ImageTextData} />;
    case 'logo_strip':
      return <LogoStripBlock data={block.data as LogoStripData} />;
    default:
      if (import.meta.env.DEV) console.warn(`[BlockRenderer] Unknown block type: "${block.type}"`);
      return null;
  }
}
