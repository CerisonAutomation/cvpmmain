import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEOHead } from '@/components/SEOHead';
import { SkipLink } from '@/components/ui/accessibility';
import { FadeInView } from '@/components/PageTransition';
import WizardModal from '@/components/WizardModal';
import { FileText, Download, CheckCircle, Lock } from 'lucide-react';

const packContents = [
  'Sample Management Agreement (PDF)',
  'Malta Short-Stay Licensing Checklist',
  'Property Preparation Guide',
  'Income Projection Worksheet',
  'Guest Welcome Pack Template',
  'Platform Fee Comparison (Airbnb vs Booking.com vs Direct)',
  'Malta Tax Guide for Short-Stay Owners',
  'Onboarding Timeline & What to Expect',
];

export default function OwnersPack() {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <SkipLink />
      <SEOHead
        title="Free Owner Pack — Malta Property Management Guide"
        description="Download our free owner information pack: management agreement, licensing checklist, income worksheet, and more."
        keywords={['Malta property owner guide', 'property management pack Malta', 'short stay owner resources Malta']}
      />
      <Navbar onOpenWizard={() => setWizardOpen(true)} />

      <main id="main-content">
        <section className="pt-28 pb-20">
          <div className="section-container">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <FadeInView>
                <p className="micro-type text-primary mb-4">Free Resource</p>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6">
                  The Malta Property Owner&apos;s Pack
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                  Everything you need to understand short-stay property management in Malta — from licensing to income projections. Completely free.
                </p>
                <div className="space-y-3 mb-8">
                  {packContents.map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </FadeInView>

              <FadeInView delay={0.2}>
                <div className="p-8 border border-border/30 rounded-2xl bg-card/50">
                  {!submitted ? (
                    <>
                      <FileText className="w-10 h-10 text-primary mb-4" />
                      <h2 className="text-xl font-semibold mb-2">Get Your Free Pack</h2>
                      <p className="text-sm text-muted-foreground mb-6">Enter your email and we&apos;ll send it instantly. No spam, ever.</p>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Your email address"
                          className="w-full px-4 py-3 border border-border rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                          aria-label="Email address"
                        />
                        <button type="submit" className="w-full btn-primary flex items-center justify-center gap-2">
                          <Download className="w-4 h-4" />
                          Send Me the Pack
                        </button>
                      </form>
                      <div className="flex items-center gap-2 mt-4">
                        <Lock className="w-3 h-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Your details are never shared or sold.</p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Pack Sent!</h3>
                      <p className="text-sm text-muted-foreground">Check your inbox. It should arrive within the next 2 minutes.</p>
                    </div>
                  )}
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
