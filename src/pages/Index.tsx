import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, MapPin, BedDouble, Bath, Users, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProcessSection from "@/components/ProcessSection";
import PortfolioSection from "@/components/PortfolioSection";
import PricingSection from "@/components/PricingSection";
import FAQSection from "@/components/FAQSection";
import ProofStrip from "@/components/ProofStrip";
import BookingSearchBar from "@/components/BookingSearchBar";
import Footer from "@/components/Footer";
import WizardModal from "@/components/WizardModal";
import { useListings, normalizeListingSummary } from "@/lib/guesty/hooks";

const Index = () => {
  const [wizardOpen, setWizardOpen] = useState(false);

  // Live data from Guesty via edge function proxy
  const { data: rawListings, isLoading } = useListings();

  // Normalize listings for display
  const listings = Array.isArray(rawListings) ? rawListings : (rawListings as any)?.results || (rawListings as any)?.listings || [];
  const featured = listings.slice(0, 3).map((l: any) => {
    const n = normalizeListingSummary(l);
    return {
      id: n.id,
      title: n.title,
      location: n.city,
      beds: n.bedrooms,
      baths: n.bathrooms,
      guests: n.accommodates,
      rating: n.rating || 4.97,
      price: n.basePrice,
      image: n.heroImage,
      propertyType: n.propertyType,
    };
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar onOpenWizard={() => setWizardOpen(true)} />
      <main id="main">
        <Hero onOpenWizard={() => setWizardOpen(true)} />

        <section className="relative z-10 -mt-8 pb-12">
          <div className="section-container">
            <BookingSearchBar variant="hero" />
          </div>
        </section>

        <ProofStrip />

        {/* Featured properties - LIVE from Guesty */}
        <section className="py-20 border-t border-border/30">
          <div className="section-container">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="micro-type text-primary mb-3">Featured Properties</p>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">Our Collection</h2>
              </div>
              <Link to="/properties" className="hidden sm:flex items-center gap-2 text-sm text-primary hover:underline">
                View all <ArrowRight size={14} />
              </Link>
            </div>

            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[0, 1, 2].map(i => (
                  <div key={i} className="rounded-2xl border border-border/50 overflow-hidden">
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
                {featured.map((prop: any, i: number) => (
                  <Link to={`/properties/${prop.id}`} key={prop.id || i}>
                    <motion.article
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="group rounded-2xl border border-border/50 overflow-hidden bg-card hover:border-primary/30 transition-colors"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                        {prop.image ? (
                          <img src={prop.image} alt={prop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                            <MapPin size={40} />
                          </div>
                        )}
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-2.5 py-1">
                          <Star size={12} className="text-primary fill-primary" />
                          <span className="text-xs font-semibold text-foreground">{prop.rating}</span>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                          <MapPin size={12} className="text-primary" /> {prop.location}
                        </div>
                        <h3 className="font-serif text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">{prop.title}</h3>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                          <span className="flex items-center gap-1"><BedDouble size={13} /> {prop.beds}</span>
                          <span className="flex items-center gap-1"><Bath size={13} /> {prop.baths}</span>
                          <span className="flex items-center gap-1"><Users size={13} /> {prop.guests}</span>
                        </div>
                        <div className="pt-3 border-t border-border/30">
                          <p className="text-foreground font-semibold">€{prop.price}<span className="text-xs font-normal text-muted-foreground"> / night</span></p>
                        </div>
                      </div>
                    </motion.article>
                  </Link>
                ))}
              </div>
            )}

            <div className="sm:hidden mt-6 text-center">
              <Link to="/properties" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                View all properties <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        <ProcessSection />
        <PortfolioSection />
        <PricingSection onOpenWizard={() => setWizardOpen(true)} />
        <FAQSection />
      </main>
      <Footer />
      <WizardModal open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </div>
  );
};

export default Index;
