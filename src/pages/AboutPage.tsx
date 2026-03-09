/**
 * About Page — CMS-Driven with Realtime DB Sync
 */

import Layout from '@/components/Layout';
import { useCmsPage } from '@/hooks/use-cms-page';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import type { ContentBlock } from '@/lib/cms/types';

export default function AboutPage() {
  const { page, isLoading } = useCmsPage('about');

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
