import { ErrorBoundary } from 'react-error-boundary';
import Layout from '@/components/Layout';
import { SEOHead } from '@/components/SEOHead';
import { useCmsPage } from '@/hooks/use-cms-page';
import { For } from 'million/react';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import { PropertyCardSkeleton } from '@/components/ui/skeleton-variants';
import { AlertTriangle, RefreshCw } from 'lucide-react';

function BlockErrorFallback({ resetErrorBoundary }: { resetErrorBoundary: () => void }) {
  return (
    <div className="py-8 text-center">
      <AlertTriangle className="w-6 h-6 text-destructive mx-auto mb-2" />
      <p className="text-sm text-muted-foreground mb-3">This block failed to render.</p>
      <button
        onClick={resetErrorBoundary}
        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
      >
        <RefreshCw className="w-3 h-3" /> Retry
      </button>
    </div>
  );
}

export function CmsPage({ slug }: { slug: string }) {
  const { page, isLoading, isError } = useCmsPage(slug);

  if (isLoading) {
    return (
      <Layout>
        <SEOHead title="Loading…" description="" />
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

  if (isError || !page) {
    return (
      <Layout>
        <SEOHead title="Page not found" description="" noIndex />
        <section className="py-16">
          <div className="section-container max-w-lg text-center">
            <h1 className="font-serif text-2xl font-semibold mb-3">
              {isError ? 'Something went wrong' : 'Page not configured'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isError
                ? 'We had trouble loading this page. Please try again later.'
                : 'This page has not been set up in the CMS yet. Please contact the site administrator.'}
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
        <For each={page.blocks}>{(block) => (
          <ErrorBoundary key={block.id} FallbackComponent={BlockErrorFallback}>
            <BlockRenderer block={block} />
          </ErrorBoundary>
        )}</For>
      </main>
    </Layout>
  );
}
