/**
 * Block Renderer — Universal block-to-component mapping
 * Dynamically renders CMS blocks based on type.
 */

import type { ContentBlock, ProofStripData, StatsRowData, ProcessStepsData, PricingTableData, FAQAccordionData, CTABannerData, HeroCenteredData, FeatureGridData, TextBlockData } from '@/lib/cms/types';
import ProofStripBlock from './ProofStripBlock';
import StatsRowBlock from './StatsRowBlock';
import ProcessStepsBlock from './ProcessStepsBlock';
import PricingTableBlock from './PricingTableBlock';
import FAQAccordionBlock from './FAQAccordionBlock';
import CTABannerBlock from './CTABannerBlock';
import HeroCenteredBlock from './HeroCenteredBlock';
import FeatureGridBlock from './FeatureGridBlock';
import TextBlock from './TextBlock';

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
    case 'feature_grid':
      return <FeatureGridBlock data={block.data as FeatureGridData} />;
    case 'text_block':
      return <TextBlock data={block.data as TextBlockData} />;
    default:
      console.warn(`Unknown block type: ${block.type}`);
      return null;
  }
}
