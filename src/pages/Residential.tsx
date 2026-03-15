import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEOHead } from '@/components/SEOHead';
import { SkipLink } from '@/components/ui/accessibility';
import { FadeInView } from '@/components/PageTransition';
import WizardModal from '@/components/WizardModal';
import { Home, Key, FileCheck, Handshake, ArrowRight } from 'lucide-react';

const services = [
  { icon: Home, title: 'Tenant Sourcing', desc: 'We find, vet, and place quality long-term tenants for your Malta residential property.' },
  { icon: FileCheck, title: 'Lease Management', desc: 'Fully compliant Maltese residential lease agreements drafted and administered on your behalf.' },
  { icon: Key, title: 'Property Maintenance', desc: 'Ongoing property upkeep, inspections, and emergency response throughout the tenancy.' },
  { icon: Handshake, title: 'Tenant Relations', desc: 'We handle all tenant communication, renewals, and end-of-tenancy processes.' },
];

export default function Residential() {
  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <SkipLink />
      <SEOHead
        title="Residential Property Management Malta — Long-Let Services"
        description="Professional residential property management in Malta. Tenant sourcing, lease management, maintenance, and more."
        keywords={['Malta residential property management', 'long let management Malta', 'Malta landlord services']}
      />
      <Navbar onOpenWizard={() => setWizardOpen(true)} />

      <main id="main-content">
        <section className="pt-28 pb-20 border-b border-border/20">
          <div className="section-container">
            <FadeInView>
              <p className="micro-type text-primary mb-4">Residential Services</p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight max-w-2xl leading-tight mb-6">
                Long-Let Property Management in Malta
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl leading-relaxed mb-8">
                For owners who prefer stable, long-term rental income — we handle every aspect of your residential tenancy.
              </p>
              <button onClick={() => setWizardOpen(true)} className="btn-primary">Get a Free Consultation</button>
            </FadeInView>
          </div>
        </section>

        <section className="py-20">
          <div className="section-container">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {services.map((s, i) => (
                <FadeInView key={s.title} delay={i * 0.1}>
                  <div className="p-6 border border-border/20 rounded-xl">
                    <s.icon className="w-8 h-8 text-primary mb-4" />
                    <h3 className="font-semibold mb-2">{s.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                </FadeInView>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/10 border-t border-border/20">
          <div className="section-container">
            <div className="grid sm:grid-cols-2 gap-6">
              <FadeInView>
                <div className="p-8 border border-primary/20 rounded-2xl bg-primary/5">
                  <h2 className="text-xl font-semibold mb-3">Compare: Residential vs Short-Stay</h2>
                  <p className="text-sm text-muted-foreground mb-4">Not sure which suits you? Our team will help you model both options for your specific property.</p>
                  <button onClick={() => setWizardOpen(true)} className="btn-primary text-sm">Free Income Comparison</button>
                </div>
              </FadeInView>
              <FadeInView delay={0.1}>
                <div className="p-8 border border-border/30 rounded-2xl">
                  <h2 className="text-xl font-semibold mb-3">Prefer Short-Stay Management?</h2>
                  <p className="text-sm text-muted-foreground mb-4">Most Malta properties earn 2–3x more on short-stay. See the results from our portfolio.</p>
                  <Link to="/owners/results" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                    View Results <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </FadeInView>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WizardModal open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </div>
  );
}
