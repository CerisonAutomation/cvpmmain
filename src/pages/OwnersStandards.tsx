import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEOHead } from '@/components/SEOHead';
import { SkipLink } from '@/components/ui/accessibility';
import { FadeInView } from '@/components/PageTransition';
import WizardModal from '@/components/WizardModal';
import { CheckCircle, Star, Shield, Sparkles } from 'lucide-react';

const standards = [
  {
    category: 'Property Condition',
    icon: Shield,
    items: [
      'All appliances in full working order at all times',
      'No visible damp, mould, or structural defects',
      'Functioning hot water, heating/cooling, and Wi-Fi',
      'Safety equipment: smoke detectors, fire extinguisher, first aid kit',
      'Secure entry system with keyless check-in option',
    ],
  },
  {
    category: 'Guest Experience',
    icon: Star,
    items: [
      'Minimum 400-thread-count linen, freshly laundered each stay',
      'Toiletries starter pack: shampoo, conditioner, body wash, soap',
      'Well-stocked kitchen: coffee, tea, oil, salt & pepper',
      'Welcome guide with local recommendations',
      'Emergency contact number prominently displayed',
    ],
  },
  {
    category: 'Cleanliness',
    icon: Sparkles,
    items: [
      'Professional clean after every departure',
      'Deep clean every 90 days including upholstery and mattresses',
      'Window cleaning quarterly',
      'External areas (balcony, garden) maintained weekly',
      'Pest control annually or on request',
    ],
  },
  {
    category: 'Photography & Listing Quality',
    icon: CheckCircle,
    items: [
      'Professional HDR photography at onboarding and annually',
      'All images accurately represent current property condition',
      'Listing descriptions written by our copywriting team',
      'All amenities verified and listed accurately',
      'Minimum 20 listing photos per property',
    ],
  },
];

export default function OwnersStandards() {
  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <SkipLink />
      <SEOHead
        title="Property Standards — Christiano Vincenti Property Management"
        description="Every property in our portfolio must meet our rigorous standards. See what we require and why it matters for your income."
        keywords={['Malta property management standards', 'holiday rental quality Malta']}
      />
      <Navbar onOpenWizard={() => setWizardOpen(true)} />

      <main id="main-content">
        <section className="pt-28 pb-16 border-b border-border/20">
          <div className="section-container">
            <FadeInView>
              <p className="micro-type text-primary mb-4">Quality Standards</p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight max-w-2xl leading-tight mb-4">
                The Standard We Hold Every Property To
              </h1>
              <p className="text-muted-foreground max-w-xl leading-relaxed">
                Our 4.97-star average is not an accident. It is the result of enforcing consistent, non-negotiable standards across every property we manage.
              </p>
            </FadeInView>
          </div>
        </section>

        <section className="py-20">
          <div className="section-container">
            <div className="grid sm:grid-cols-2 gap-8">
              {standards.map((s, i) => (
                <FadeInView key={s.category} delay={i * 0.1}>
                  <div className="p-8 border border-border/30 rounded-2xl">
                    <s.icon className="w-8 h-8 text-primary mb-4" />
                    <h2 className="text-xl font-semibold mb-6">{s.category}</h2>
                    <ul className="space-y-3">
                      {s.items.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </FadeInView>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/20 border-t border-border/20">
          <div className="section-container text-center">
            <FadeInView>
              <h2 className="text-2xl font-bold mb-3">Does Your Property Meet Our Standards?</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">Most properties qualify. Get a free assessment and income estimate today.</p>
              <button onClick={() => setWizardOpen(true)} className="btn-primary">Get Free Estimate</button>
            </FadeInView>
          </div>
        </section>
      </main>

      <Footer />
      <WizardModal open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </div>
  );
}
