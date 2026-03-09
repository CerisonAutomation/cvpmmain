/**
 * CmsPage — Reusable template for any CMS-driven page.
 * Pass a slug, get a fully rendered page with realtime DB sync.
 * Zero boilerplate. Data-driven. Enterprise-grade.
 */

import Layout from '@/components/Layout';
import { useCmsPage } from '@/hooks/use-cms-page';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import type { ContentBlock } from '@/lib/cms/types';

interface CmsPageProps {
  slug: string;
  /** Optional children rendered after all CMS blocks */
  children?: React.ReactNode;
  /** Optional loading skeleton override */
  loadingFallback?: React.ReactNode;
  /** Optional not-found override */
  notFoundFallback?: React.ReactNode;
}

export default function CmsPage({ slug, children, loadingFallback, notFoundFallback }: CmsPageProps) {
  const { page, isLoading, source } = useCmsPage(slug);

  if (!page && isLoading) {
    return (
      <Layout>
        {loadingFallback || (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          </div>
        )}
      </Layout>
    );
  }

  if (!page) {
    return (
      <Layout>
        {notFoundFallback || (
          <div className="py-20 text-center">
            <p className="text-muted-foreground">Page content not found</p>
          </div>
        )}
      </Layout>
    );
  }

  return (
    <Layout>
      {page.blocks.map((block: ContentBlock) => (
        <BlockRenderer key={block.id} block={block} />
      ))}
      {children}
    </Layout>
  );
}
