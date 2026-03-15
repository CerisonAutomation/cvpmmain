import Layout from '@/components/Layout';
import { SEOHead } from '@/components/SEOHead';
import { useCmsPage } from '@/hooks/use-cms-page';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import { PropertyCardSkeleton } from '@/components/ui/skeleton-variants';

export function CmsPage({ slug }: { slug: string }) {
  const { page, isLoading } = useCmsPage(slug);

  if (isLoading) {
    return (
      <Layout>
        <section className="py-16">
          <div className="section-container">
            <div className="grid gap-4">
              {[0, 1, 2].map((i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (!page) {
    return (
      <Layout>
        <section className="py-16">
          <div className="section-container max-w-lg text-center">
            <h1 className="font-serif text-2xl font-semibold mb-3">Page not configured</h1>
            <p className="text-sm text-muted-foreground">
              This page has not been set up in the CMS yet. Please contact the site administrator.
            </p>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead title={page.title} description={page.description} />
      <main>
        {page.blocks.map((block) => (
          <BlockRenderer key={block.id} block={block} />
        ))}
      </main>
    </Layout>
  );
}
