import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import BookingSearchBar from '@/components/BookingSearchBar';
import Footer from '@/components/Footer';
import WizardModal from '@/components/WizardModal';
import PropertyCard from '@/components/PropertyCard';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import { useListings, normalizeListingSummary } from '@/lib/guesty/hooks';
import { useCmsPage, getBlockByType } from '@/hooks/use-cms-page';
import type { ContentBlock } from '@/lib/cms/types';

const Index = () => {
  const [wizardOpen, setWizardOpen] = useState(false);
  
  // Use CMS page from database with realtime sync
  const { page, isLoading: pageLoading } = useCmsPage('home');

  // Live data from Guesty BE API
  const { data: rawListings, isLoading: listingsLoading } = useListings();

  // Normalize listings
  const featured = useMemo(() => {
    const list = Array.isArray(rawListings) ? rawListings : [];
    return list.slice(0, 3).map((l: any) => normalizeListingSummary(l));
  }, [rawListings]);

  // Filter blocks by type for custom rendering
  const renderableBlocks = page?.blocks.filter(
    (b: ContentBlock) => !['hero_split', 'property_showcase'].includes(b.type)
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar onOpenWizard={() => setWizardOpen(true)} />
      <main id="main">
        <Hero onOpenWizard={() => setWizardOpen(true)} />

        <section className="relative z-10 -mt-4 pb-6">
          <div className="section-container">
            <BookingSearchBar variant="hero" />
          </div>
        </section>

        {/* CMS blocks: proof strip */}
        {page?.blocks
          .filter((b: ContentBlock) => b.type === 'proof_strip')
          .map((block: ContentBlock) => (
            <BlockRenderer key={block.id} block={block} />
          ))}

        {/* Featured properties — LIVE from Guesty */}
        <section className="py-10 sm:py-12 border-t border-border/15">
          <div className="section-container">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="micro-type text-primary mb-2">Featured Properties</p>
                <h2 className="section-heading">Our Collection</h2>
              </div>
              <Link to="/properties" className="hidden sm:flex items-center gap-1.5 text-[12px] text-primary hover:underline underline-offset-4">
                View all <ArrowRight size={12} />
              </Link>
            </div>

            {listingsLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[0, 1, 2].map(i => (
                  <div key={i} className="border border-border/30 overflow-hidden">
                    <div className="aspect-[4/3] bg-secondary animate-pulse" />
                    <div className="p-3.5 space-y-2">
                      <div className="h-3 w-3/4 bg-secondary animate-pulse" />
                      <div className="h-3 w-1/2 bg-secondary animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featured.map((p, i) => (
                  <PropertyCard
                    key={p.id || i}
                    id={p.id}
                    title={p.title}
                    city={p.city}
                    bedrooms={p.bedrooms}
                    bathrooms={p.bathrooms}
                    accommodates={p.accommodates}
                    rating={p.rating || 4.97}
                    basePrice={p.basePrice}
                    heroImage={p.heroImage}
                    index={i}
                  />
                ))}
              </div>
            )}

            <div className="sm:hidden mt-4 text-center">
              <Link to="/properties" className="inline-flex items-center gap-1.5 text-[12px] text-primary hover:underline underline-offset-4">
                View all properties <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </section>

        {/* Render remaining CMS blocks */}
        {page?.blocks
          .filter((b: ContentBlock) => !['hero_split', 'property_showcase', 'proof_strip'].includes(b.type))
          .map((block: ContentBlock) => (
            <BlockRenderer key={block.id} block={block} />
          ))}
      </main>
      <Footer />
      <WizardModal open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </div>
  );
};

export default Index;
