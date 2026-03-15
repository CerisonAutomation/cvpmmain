import { useState } from 'react';
import { Check, Star, Zap, Shield } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEOHead } from '@/components/SEOHead';
import { SkipLink } from '@/components/ui/accessibility';
import { FadeInView } from '@/components/PageTransition';
import LeadModal from '@/components/LeadModal';

const tiers = [
  {
    name: 'Essential',
    icon: Star,
    description: 'Perfect for owners who want reliable management and strong results with a simple, proven approach.',
    fee: '15%',
    feeSub: 'of gross revenue',
    cta: 'Get Started',
    features: [
      'Full listing setup on all major OTAs',
      'Dynamic pricing management',
      '24/7 guest communication',
      'Professional cleaning coordination',
      'Monthly owner statement',
      'Maintenance coordination',
      'Dedicated account manager',
    ],
    highlight: false,
  },
  {
    name: 'Premium',
    icon: Zap,
    description: 'Our most popular plan — everything in Essential plus active revenue optimisation and a direct booking strategy.',
    fee: '18%',
    feeSub: 'of gross revenue',
    cta: 'Get Premium',
    features: [
      'Everything in Essential',
      'Direct booking website presence',
      'Revenue benchmarking & optimisation',
      'Professional photography (new listings)',
      'Priority maintenance response',
      'Quarterly performance review',
      'Owner portal dashboard access',
    ],
    highlight: true,
  },
  {
    name: 'Elite',
    icon: Shield,
    description: 'Full-service white-glove management for portfolio owners and premium properties where only the best will do.',
    fee: 'Custom',
    feeSub: 'portfolio pricing',
    cta: 'Contact Us',
    features: [
      'Everything in Premium',
      'Dedicated portfolio manager',
      'Professional interior styling consult',
      'Owner income report with AI narrative',
      'Multi-property dashboard',
      'Annual market benchmarking report',
      'Priority access to new investment listings',
    ],
    highlight: false,
  },
];

export default function PricingPage() {
  const [leadOpen, setLeadOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <SkipLink />
      <SEOHead
        title="Pricing — Christiano Vincenti Property Management Malta"
        description="Transparent, performance-based property management fees. No hidden charges. See our Essential, Premium, and Elite plans."
        keywords={['Malta property management pricing', 'Airbnb management fee Malta', 'short-stay management cost Malta']}
      />
      <Navbar onOpenWizard={() => setLeadOpen(true)} />

      <main id="main-content">
        <section className="pt-28 pb-16 border-b border-border/20">
          <div className="section-container text-center">
            <FadeInView>
              <p className="micro-type text-primary mb-4">Pricing</p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight max-w-2xl mx-auto leading-[1.1] mb-4">Transparent, Performance-Based Fees</h1>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">We only earn when you earn. No setup fees, no hidden charges, no surprises.</p>
            </FadeInView>
          </div>
        </section>

        <section className="py-16">
          <div className="section-container">
            <div className="grid lg:grid-cols-3 gap-8">
              {tiers.map((tier, i) => (
                <FadeInView key={tier.name} delay={i * 0.1}>
                  <div className={`relative flex flex-col h-full rounded-2xl border p-8 ${
                    tier.highlight ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-border/30 bg-card'
                  }`}>
                    {tier.highlight && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">Most Popular</span>
                      </div>
                    )}
                    <tier.icon className={`w-8 h-8 mb-4 ${tier.highlight ? 'text-primary' : 'text-muted-foreground'}`} />
                    <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{tier.description}</p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold">{tier.fee}</span>
                      <span className="text-sm text-muted-foreground ml-2">{tier.feeSub}</span>
                    </div>
                    <button onClick={() => setLeadOpen(true)} className={`w-full py-3 rounded-xl text-sm font-semibold transition-all mb-8 ${
                      tier.highlight ? 'bg-primary text-primary-foreground hover:opacity-90' : 'border border-border hover:border-primary/40 hover:text-primary'
                    }`}>
                      {tier.cta}
                    </button>
                    <ul className="space-y-3 mt-auto">
                      {tier.features.map(f => (
                        <li key={f} className="flex items-start gap-3 text-sm">
                          <Check size={14} className="text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </FadeInView>
              ))}
            </div>

            <FadeInView delay={0.3}>
              <div className="mt-16 p-8 bg-muted/30 border border-border/30 rounded-2xl text-center">
                <h3 className="font-semibold text-lg mb-2">Not sure which plan is right?</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">We\'ll recommend the right plan after a free 15-minute call about your property.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button onClick={() => setLeadOpen(true)} className="btn-primary">Get a Free Recommendation</button>
                  <a href="tel:+35679790202" className="btn-secondary">Call +356 7979 0202</a>
                </div>
              </div>
            </FadeInView>
          </div>
        </section>
      </main>

      <Footer />
      <LeadModal open={leadOpen} onClose={() => setLeadOpen(false)} context="owner" />
    </div>
  );
}
