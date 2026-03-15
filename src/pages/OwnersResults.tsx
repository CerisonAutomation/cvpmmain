import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEOHead } from '@/components/SEOHead';
import { SkipLink } from '@/components/ui/accessibility';
import { FadeInView } from '@/components/PageTransition';
import WizardModal from '@/components/WizardModal';
import { TrendingUp, Star, Calendar, ArrowRight } from 'lucide-react';

const caseStudies = [
  {
    location: 'Valletta — 2 bed apartment',
    before: '€14,400/yr (long-let)',
    after: '€44,200/yr (short-stay)',
    uplift: '+207%',
    occupancy: '91%',
    rating: '4.98',
    notes: 'Listed on 4 platforms, dynamic pricing, weekly deep cleans. Owner now earns more than double with zero management effort.',
  },
  {
    location: "St Julian's — 1 bed studio",
    before: '€9,600/yr (long-let)',
    after: '€28,500/yr (short-stay)',
    uplift: '+197%',
    occupancy: '94%',
    rating: '5.0',
    notes: 'Prime nightlife district. Peak season rates optimised. Consistently 5-star rated. One of our top performers per m².',
  },
  {
    location: 'Sliema — 3 bed penthouse',
    before: 'Vacant (renovation)',
    after: '€67,800/yr (short-stay)',
    uplift: 'New Revenue',
    occupancy: '88%',
    rating: '4.97',
    notes: 'Post-renovation onboarding handled entirely by our team. Full photography, staging, and listing live in 6 days.',
  },
];

export default function OwnersResults() {
  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <SkipLink />
      <SEOHead
        title="Real Results — Property Income in Malta"
        description="See real income results from properties we manage in Valletta, St Julian's, and Sliema. Transparent case studies."
        keywords={['Malta property income results', 'Airbnb income Malta', 'property management results Malta']}
      />
      <Navbar onOpenWizard={() => setWizardOpen(true)} />

      <main id="main-content">
        <section className="pt-28 pb-16 border-b border-border/20">
          <div className="section-container">
            <FadeInView>
              <p className="micro-type text-primary mb-4">Real Results</p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight max-w-2xl leading-tight mb-4">
                The Numbers Don&apos;t Lie
              </h1>
              <p className="text-muted-foreground max-w-xl leading-relaxed">
                These are real properties, real revenue figures, real transformations. No projections — only verified results from our managed portfolio.
              </p>
            </FadeInView>
          </div>
        </section>

        <section className="py-20">
          <div className="section-container">
            <div className="space-y-8">
              {caseStudies.map((cs, i) => (
                <FadeInView key={cs.location} delay={i * 0.1}>
                  <div className="grid lg:grid-cols-[1fr_auto] gap-8 p-8 border border-border/30 rounded-2xl">
                    <div>
                      <h2 className="text-xl font-semibold mb-4">{cs.location}</h2>
                      <div className="grid sm:grid-cols-3 gap-4 mb-6">
                        <div className="p-4 bg-muted/30 rounded-xl">
                          <p className="text-xs text-muted-foreground mb-1">Before</p>
                          <p className="font-semibold">{cs.before}</p>
                        </div>
                        <div className="p-4 bg-primary/10 rounded-xl">
                          <p className="text-xs text-primary mb-1">After CVPM</p>
                          <p className="font-semibold text-primary">{cs.after}</p>
                        </div>
                        <div className="p-4 bg-green-500/10 rounded-xl">
                          <p className="text-xs text-green-600 mb-1">Uplift</p>
                          <p className="font-bold text-green-600">{cs.uplift}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{cs.notes}</p>
                    </div>
                    <div className="flex lg:flex-col gap-4 lg:gap-2 items-center lg:items-end justify-center">
                      <div className="text-center">
                        <div className="flex items-center gap-1 justify-center">
                          <Star className="w-4 h-4 fill-primary text-primary" />
                          <span className="font-bold">{cs.rating}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Rating</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 justify-center">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span className="font-bold">{cs.occupancy}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Occupancy</p>
                      </div>
                    </div>
                  </div>
                </FadeInView>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/10 border-t border-border/20">
          <div className="section-container text-center">
            <FadeInView>
              <h2 className="text-2xl font-bold mb-3">What Could Your Property Earn?</h2>
              <p className="text-muted-foreground mb-8">Get a personalised income projection in under 2 minutes.</p>
              <button onClick={() => setWizardOpen(true)} className="btn-primary">
                Get Free Estimate <ArrowRight className="inline w-4 h-4 ml-1" />
              </button>
            </FadeInView>
          </div>
        </section>
      </main>

      <Footer />
      <WizardModal open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </div>
  );
}
