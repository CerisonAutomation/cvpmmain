/**
 * Block Renderer — Universal block-to-component mapping
 * Dynamically renders CMS blocks based on type.
 */

import type { ContentBlock, BlockType } from '@/lib/cms/types';
import { 
  ProofStripBlock, 
  StatsRowBlock, 
  ProcessStepsBlock, 
  PricingTableBlock, 
  FAQAccordionBlock, 
  CTABannerBlock,
  HeroCenteredBlock,
  FeatureGridBlock,
  TextBlock,
} from './index';

interface Props {
  block: ContentBlock;
}

export default function BlockRenderer({ block }: Props) {
  switch (block.type) {
    case 'proof_strip':
      return <ProofStripBlock data={block.data} />;
    case 'stats_row':
      return <StatsRowBlock data={block.data} />;
    case 'process_steps':
      return <ProcessStepsBlock data={block.data} />;
    case 'pricing_table':
      return <PricingTableBlock data={block.data} />;
    case 'faq_accordion':
      return <FAQAccordionBlock data={block.data} />;
    case 'cta_banner':
      return <CTABannerBlock data={block.data} />;
    case 'hero_centered':
      return <HeroCenteredBlock data={block.data} />;
    case 'feature_grid':
      return <FeatureGridBlock data={block.data} />;
    case 'text_block':
      return <TextBlock data={block.data} />;
    default:
      console.warn(`Unknown block type: ${block.type}`);
      return null;
  }
}
