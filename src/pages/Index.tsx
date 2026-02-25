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
import { useListings, useReviews } from "@/lib/guesty";
import { getSiteConfig } from "@/lib/site-config";
import propertyFives from "@/assets/property-fives.jpg";
import propertyUrsula from "@/assets/property-ursula.jpg";
import propertyPenthouse from "@/assets/property-penthouse.jpg";

const config = getSiteConfig();
const STATIC_IMAGES = [propertyFives, propertyUrsula, propertyPenthouse];

const Index = () => {
  const [wizardOpen, setWizardOpen] = useState(false);
  const { data: listings } = useListings({ sort: 'rating' });
  const { data: reviews } = useReviews({ limit: 6 });

  // Build featured properties from Guesty or static
  const featured = listings && listings.length > 0
    ? listings.slice(0, 3).map(l => ({
        id: l._id,
        title: l.title,
        location: l.address?.city || l.address?.full || 'Malta',
        beds: l.bedrooms,
        baths: l.bathrooms,
        guests: l.accommodates,
        rating: l.rating || 4.97,
        price: l.prices?.basePrice || 0,
        image: l.featuredPicture?.large || l.pictures?.[0]?.large || propertyFives,
        type: l.propertyType,
      }))
    : config.properties.slice(0, 3).map((p, i) => ({
        id: p.id,
        title: p.title,
        location: p.location,
        beds: p.beds,
        baths: p.baths,
        guests: p.guests,
        rating: 4.97,
        price: parseInt(p.pricePerNight.replace(/[^0-9]/g, '')) || 0,
        image: STATIC_IMAGES[i % 3],
        type: p.type,
      }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar onOpenWizard={() => setWizardOpen(true)} />
      <main id="main">
        <Hero onOpenWizard={() => setWizardOpen(true)} />

        {/* Search bar section */}
        <section className="relative z-10 -mt-8 pb-12">
          <div className="section-container">
            <BookingSearchBar variant="hero" />
          </div>
        </section>

        {/* Proof strip */}
        <ProofStrip />

        {/* Featured properties */}
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

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((prop, i) => (
                <Link to={`/properties/${prop.id}`} key={prop.id}>
                  <motion.article
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="group rounded-2xl border border-border/50 overflow-hidden bg-card hover:border-primary/30 transition-colors"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img src={prop.image} alt={prop.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-2.5 py-1">
                        <Star size={12} className="text-primary fill-primary" />
                        <span className="text-xs font-semibold text-foreground">{prop.rating}</span>
                      </div>
                      <div className="absolute top-3 left-3 bg-background/70 backdrop-blur-sm rounded px-2 py-0.5 text-[10px] text-muted-foreground uppercase tracking-wider">
                        {prop.type}
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

        {/* Reviews */}
        {reviews && reviews.length > 0 && (
          <section className="py-20 border-t border-border/30">
            <div className="section-container">
              <p className="micro-type text-primary mb-3">Guest Reviews</p>
              <h2 className="font-serif text-3xl font-bold text-foreground mb-10">What Our Guests Say</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {reviews.slice(0, 6).map((review, i) => (
                  <motion.div
                    key={review._id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="satin-surface rounded-xl p-6"
                  >
                    <div className="flex items-center gap-1 mb-3">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} size={13} className={j < review.rating ? 'text-primary fill-primary' : 'text-muted-foreground/30'} />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-4">{review.publicReview}</p>
                    <p className="text-xs font-semibold text-foreground">{review.guestName}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        <FAQSection />
      </main>
      <Footer />
      <WizardModal open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </div>
  );
};

export default Index;
