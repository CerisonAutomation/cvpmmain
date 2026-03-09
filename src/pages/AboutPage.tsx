/**
 * About Page — Fully CMS-Driven
 * All content loaded from centralized CMS blocks.
 */

import Layout from '@/components/Layout';
import { getPage } from '@/lib/cms/content';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import type { ContentBlock } from '@/lib/cms/types';

export default function AboutPage() {
  const page = getPage('about');
  
  if (!page) {
    return (
      <Layout>
        <div className="py-20 text-center">
          <p className="text-muted-foreground">Page content not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {page.blocks.map((block: ContentBlock) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </Layout>
  );
}
