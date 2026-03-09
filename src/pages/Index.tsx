import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import BookingSearchBar from '@/components/BookingSearchBar';
import Footer from '@/components/Footer';
import WizardModal from '@/components/WizardModal';
import PropertyCard from '@/components/PropertyCard';
import { useListings, normalizeListingSummary } from '@/lib/guesty/hooks';
import { getPage, getBlockByType } from '@/lib/cms';
import type {
  ProofStripData,
  StatsRowData,
  ProcessStepsData,
  PricingTableData,
  FAQAccordionData,
  CTABannerData,
} from '@/lib/cms/types';
import {
  ProofStripBlock,
  StatsRowBlock,
  ProcessStepsBlock,
  PricingTableBlock,
  FAQAccordionBlock,
  CTABannerBlock,
} from '@/components/blocks';

const Index = () => {
  const [wizardOpen, setWizardOpen] = useState(false);
  const page = getPage('home')!;

  const proofData = getBlockByType<ProofStripData>(page, 'proof_strip')?.data;
  const statsData = getBlockByType<StatsRowData>(page, 'stats_row')?.data;
  const processData = getBlockByType<ProcessStepsData>(page, 'process_steps')?.data;
  const pricingData = getBlockByType<PricingTableData>(page, 'pricing_table')?.data;
  const faqData = getBlockByType<FAQAccordionData>(page, 'faq_accordion')?.data;
  const ctaData = getBlockByType<CTABannerData>(page, 'cta_banner')?.data;

  const { data: rawListings, isLoading } = useListings();
  const listings = Array.isArray(rawListings) ? rawListings : (rawListings as any)?.results || (rawListings as any)?.listings || [];
  const featured = listings.slice(0, 3).map((l: any) => normalizeListingSummary(l));

  return (
    <div className="min-h-screen bg-background">
      <Navbar onOpenWizard={() => setWizardOpen(true)} />
      <main id="main">
        <Hero onOpenWizard={() => setWizardOpen(true)} />

        <section className="relative z-10 -mt-6 pb-8">
          <div className="section-container">
            <BookingSearchBar variant="hero" />
          </div>
        </section>

        {proofData && <ProofStripBlock data={proofData} />}

        {/* Featured properties — LIVE from Guesty */}
        <section className="py-16 sm:py-20 border-t border-border/20">
          <div className="section-container">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="micro-type text-primary mb-3">Featured Properties</p>
                <h2 className="section-heading">Our Collection</h2>
              </div>
              <Link to="/properties" className="hidden sm:flex items-center gap-2 text-sm text-primary hover:underline underline-offset-4">
                View all <ArrowRight size={14} />
              </Link>
            </div>

            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[0, 1, 2].map(i => (
                  <div key={i} className="rounded-md border border-border/30 overflow-hidden">
                    <div className="aspect-[4/3] bg-secondary animate-pulse" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 w-3/4 bg-secondary animate-pulse rounded" />
                      <div className="h-4 w-1/2 bg-secondary animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

            <div className="sm:hidden mt-6 text-center">
              <Link to="/properties" className="inline-flex items-center gap-2 text-sm text-primary hover:underline underline-offset-4">
                View all properties <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {statsData && <StatsRowBlock data={statsData} />}
        {processData && <ProcessStepsBlock data={processData} />}
        {pricingData && <PricingTableBlock data={pricingData} />}
        {faqData && <FAQAccordionBlock data={faqData} />}
        {ctaData && <CTABannerBlock data={ctaData} />}
      </main>
      <Footer />
      <WizardModal open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </div>
  );
};

export default Index;
