import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEOHead } from '@/components/SEOHead';
import { SkipLink } from '@/components/ui/accessibility';
import { FadeInView } from '@/components/PageTransition';
import WizardModal from '@/components/WizardModal';
import { Check, X, Zap, Crown, Building2 } from 'lucide-react';

const plans = [
  {
    id: 'essential',
    icon: Zap,
    name: 'Essential',
    commission: '15%',
    subtitle: 'Perfect for single-property owners',
    description: 'Everything you need to get started with managed short-stay in Malta.',
    features: [
      { label: 'Full listing management (Airbnb, Booking.com, VRBO)', included: true },
      { label: 'Professional photography session', included: true },
      { label: 'Guest communication & check-in coordination', included: true },
      { label: 'Cleaning & linen service coordination', included: true },
      { label: 'Monthly owner statements', included: true },
      { label: 'Dynamic pricing optimisation', included: true },
      { label: 'Dedicated account manager', included: false },
      { label: 'Owner portal with live dashboard', included: false },
      { label: 'Maintenance concierge service', included: false },
      { label: 'Annual property review & strategy', included: false },
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    id: 'premium',
    icon: Crown,
    name: 'Premium',
    commission: '18%',
    subtitle: 'Our most popular plan',
    description: 'The complete management package for owners who want the best results with zero involvement.',
    features: [
      { label: 'Full listing management (Airbnb, Booking.com, VRBO)', included: true },
      { label: 'Professional photography session', included: true },
      { label: 'Guest communication & check-in coordination', included: true },
      { label: 'Cleaning & linen service coordination', included: true },
      { label: 'Monthly owner statements', included: true },
      { label: 'Dynamic pricing optimisation', included: true },
      { label: 'Dedicated account manager', included: true },
      { label: 'Owner portal with live dashboard', included: true },
      { label: 'Maintenance concierge service', included: true },
      { label: 'Annual property review & strategy', included: false },
    ],
    cta: 'Get Started',
    highlighted: true,
  },
  {
    id: 'portfolio',
    icon: Building2,
    name: 'Portfolio',
    commission: 'Custom',
    subtitle: 'For 3+ properties',
    description: 'Tailored management for owners with multiple properties. Volume discounts and dedicated team.',
    features: [
      { label: 'Full listing management (Airbnb, Booking.com, VRBO)', included: true },
      { label: 'Professional photography session', included: true },
      { label: 'Guest communication & check-in coordination', included: true },
      { label: 'Cleaning & linen service coordination', included: true },
      { label: 'Monthly owner statements', included: true },
      { label: 'Dynamic pricing optimisation', included: true },
      { label: 'Dedicated account manager', included: true },
      { label: 'Owner portal with live dashboard', included: true },
      { label: 'Maintenance concierge service', included: true },
      { label: 'Annual property review & strategy', included: true },
    ],
    cta: 'Talk to Us',
    highlighted: false,
  },
];

const faqs = [
  { q: 'Are there any setup fees?', a: 'No setup fees. The commission is calculated only on completed, paid bookings. If there are no bookings, there are no fees.' },
  { q: 'What does the commission cover?', a: 'The commission covers full management including listing, photography, guest communication, cleaning coordination, maintenance oversight, and monthly reporting.' },
  { q: 'Is there a minimum contract period?', a: 'We offer a 3-month trial period. After that, contracts run month-to-month with 30 days\' notice required to terminate.' },
  { q: 'Do I keep control of my property?', a: 'Absolutely. You can block dates for personal use at any time via the owner portal. You remain the owner and can exit the management agreement with notice.' },
];

export default function PricingPage() {
  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <SkipLink />
      <SEOHead
        title="Management Pricing — Christiano Vincenti Property Management Malta"
        description="Transparent, commission-only pricing for Malta property management. No setup fees. No hidden costs. Choose the plan that fits your property."
        keywords={['Malta property management fees', 'property management commission Malta', 'holiday rental management cost']}
      />
      <Navbar onOpenWizard={() => setWizardOpen(true)} />

      <main id="main-content">
        {/* Header */}
        <section className="pt-28 pb-16 border-b border-border/20">
          <div className="section-container text-center">
            <FadeInView>
              <p className="micro-type text-primary mb-4">Pricing</p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight max-w-2xl mx-auto leading-tight mb-4">
                Transparent, Performance-Based Pricing
              </h1>
              <p className="text-muted-foreground max-w-xl mx-auto text-lg">
                We earn when you earn. Commission-only, no setup fees, no surprises.
              </p>
            </FadeInView>
          </div>
        </section>

        {/* Plans */}
        <section className="py-20">
          <div className="section-container">
            <div className="grid lg:grid-cols-3 gap-6 items-start">
              {plans.map((plan, i) => (
                <FadeInView key={plan.id} delay={i * 0.1}>
                  <div className={`relative rounded-2xl border p-8 transition-all ${
                    plan.highlighted
                      ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                      : 'border-border/40 bg-card hover:border-border'
                  }`}>
                    {plan.highlighted && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">Most Popular</span>
                      </div>
                    )}
                    <plan.icon className={`w-8 h-8 mb-4 ${plan.highlighted ? 'text-primary' : 'text-muted-foreground'}`} />
                    <h2 className="text-xl font-bold">{plan.name}</h2>
                    <div className="mt-2 mb-1">
                      <span className="text-4xl font-bold">{plan.commission}</span>
                      {plan.commission !== 'Custom' && <span className="text-muted-foreground text-sm ml-1">commission</span>}
                    </div>
                    <p className="text-sm text-primary font-medium mb-2">{plan.subtitle}</p>
                    <p className="text-sm text-muted-foreground mb-8 leading-relaxed">{plan.description}</p>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((f) => (
                        <li key={f.label} className="flex items-start gap-3">
                          {f.included
                            ? <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            : <X className="w-4 h-4 text-muted-foreground/40 flex-shrink-0 mt-0.5" />}
                          <span className={`text-sm ${f.included ? 'text-foreground' : 'text-muted-foreground/50'}`}>{f.label}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => setWizardOpen(true)}
                      className={`w-full py-3 rounded-xl text-sm font-semibold transition-all ${
                        plan.highlighted
                          ? 'bg-primary text-primary-foreground hover:opacity-90'
                          : 'border border-border hover:bg-muted/50'
                      }`}
                      aria-label={`${plan.cta} with ${plan.name} plan`}
                    >
                      {plan.cta}
                    </button>
                  </div>
                </FadeInView>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 border-t border-border/20">
          <div className="section-container">
            <FadeInView>
              <h2 className="section-heading mb-10 text-center">Common Questions</h2>
            </FadeInView>
            <div className="max-w-2xl mx-auto space-y-6">
              {faqs.map((faq, i) => (
                <FadeInView key={faq.q} delay={i * 0.08}>
                  <div className="border-b border-border/30 pb-6">
                    <h3 className="font-medium mb-2">{faq.q}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </div>
                </FadeInView>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 bg-primary/5 border-t border-primary/10">
          <div className="section-container text-center">
            <FadeInView>
              <h2 className="text-2xl font-bold mb-3">Not sure which plan is right for you?</h2>
              <p className="text-muted-foreground mb-8">Get a free income estimate and we&apos;ll recommend the best fit for your property.</p>
              <button onClick={() => setWizardOpen(true)} className="btn-primary">
                Get Free Estimate
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
