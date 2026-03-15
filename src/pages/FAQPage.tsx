import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEOHead } from '@/components/SEOHead';
import { SkipLink } from '@/components/ui/accessibility';
import { FadeInView } from '@/components/PageTransition';
import WizardModal from '@/components/WizardModal';
import { ChevronDown, MessageCircle } from 'lucide-react';

const categories = [
  {
    label: 'For Guests',
    faqs: [
      { q: 'How do I book a property?', a: 'You can book directly through our website. Select your dates, number of guests, and complete the checkout process. We accept all major cards and bank transfer.' },
      { q: 'What is included in the rental?', a: 'All properties include: Wi-Fi, linen and towels, fully equipped kitchen, toiletries starter pack, and a 24/7 support contact. Specific inclusions are listed on each property page.' },
      { q: 'What is the cancellation policy?', a: 'Our standard policy is free cancellation up to 14 days before check-in. Between 14 and 7 days, 50% of the total is retained. Within 7 days, the full amount is charged. Some properties have different policies — always check at booking.' },
      { q: 'Can I check in early or check out late?', a: 'We do our best to accommodate early arrivals and late departures based on availability. Contact us at least 48 hours in advance and we will confirm. An additional fee may apply.' },
      { q: 'Is there a security deposit?', a: 'Yes, a refundable security deposit of €200–€500 (depending on property) is authorised at check-in and released within 5 business days after departure, provided no damage is reported.' },
      { q: 'Do you allow pets?', a: 'A small selection of our properties are pet-friendly. Filter by the "Pets Allowed" amenity on the Properties page, or contact us and we will find the right fit.' },
    ],
  },
  {
    label: 'For Owners',
    faqs: [
      { q: 'What does your management fee cover?', a: 'Our management fee covers: guest communication, listing optimisation across all platforms, professional photography, cleaning coordination, maintenance management, monthly reporting, and 24/7 emergency response.' },
      { q: 'How much can I earn from my property?', a: 'Earnings depend on property size, location, and seasonality. Our properties in Valletta and Sliema typically achieve €25,000–€60,000+ annual revenue. Use our free estimate tool for a property-specific projection.' },
      { q: 'Do I need to do anything once I sign up?', a: 'Very little. After the initial onboarding (photography, listing setup, key exchange), you receive monthly statements and can access your owner dashboard at any time. We handle everything else.' },
      { q: 'How do I receive my payments?', a: 'Owner payouts are processed monthly, typically between the 5th and 10th of each month for the previous month\'s bookings. We transfer directly to your nominated bank account.' },
      { q: 'Can I still use my property personally?', a: 'Yes — owner blocks are fully supported. Simply mark dates as unavailable in your owner portal or notify us, and we will ensure no bookings are accepted during those periods.' },
      { q: 'What happens if a guest damages my property?', a: 'We photograph every property before and after each stay. Any damages are assessed against the security deposit. For larger claims, we handle the full dispute process and have insurance options available.' },
    ],
  },
  {
    label: 'Bookings & Payments',
    faqs: [
      { q: 'What payment methods do you accept?', a: 'We accept Visa, Mastercard, American Express, Apple Pay, Google Pay, and bank transfer for bookings over €2,000.' },
      { q: 'Is my payment secure?', a: 'All payments are processed through Stripe, which is PCI DSS Level 1 certified — the highest level of payment security available.' },
      { q: 'Do prices include all fees?', a: 'The price shown on the listing includes accommodation cost. Cleaning fees, city tax (€0.50/night in Malta), and any optional extras are shown transparently at checkout before you confirm.' },
      { q: 'Can I modify my booking?', a: 'Booking modifications are subject to availability and the date change policy. Contact us directly and we will do our best to accommodate changes at no extra charge.' },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/30">
      <button
        className="w-full flex items-center justify-between py-5 text-left gap-4 hover:text-primary transition-colors"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="font-medium text-[15px]">{q}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm text-muted-foreground leading-relaxed pr-8">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <SkipLink />
      <SEOHead
        title="Frequently Asked Questions — CVPM Malta"
        description="Answers to common questions about booking, payments, cancellations, and property management in Malta."
        keywords={['Malta property FAQ', 'holiday rental questions Malta', 'property management FAQ']}
      />
      <Navbar onOpenWizard={() => setWizardOpen(true)} />

      <main id="main-content">
        <section className="pt-28 pb-16 border-b border-border/20">
          <div className="section-container">
            <FadeInView>
              <p className="micro-type text-primary mb-4">Help Centre</p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight max-w-2xl leading-tight mb-4">
                Frequently Asked Questions
              </h1>
              <p className="text-muted-foreground max-w-xl">Everything you need to know, whether you\'re a guest looking to book or an owner exploring management.</p>
            </FadeInView>
          </div>
        </section>

        <section className="py-16">
          <div className="section-container">
            <div className="grid lg:grid-cols-[240px_1fr] gap-12">
              {/* Sidebar nav */}
              <aside className="hidden lg:block">
                <nav className="sticky top-28 space-y-1" aria-label="FAQ categories">
                  {categories.map((cat, i) => (
                    <button
                      key={cat.label}
                      onClick={() => setActiveCategory(i)}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        activeCategory === i ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                  <div className="pt-6">
                    <button
                      onClick={() => setWizardOpen(true)}
                      className="w-full flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Still have questions?
                    </button>
                  </div>
                </nav>
              </aside>

              {/* Mobile category tabs */}
              <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 mb-6">
                {categories.map((cat, i) => (
                  <button
                    key={cat.label}
                    onClick={() => setActiveCategory(i)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      activeCategory === i ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* FAQ list */}
              <div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCategory}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2 className="text-xl font-semibold mb-6">{categories[activeCategory].label}</h2>
                    {categories[activeCategory].faqs.map((faq) => (
                      <FAQItem key={faq.q} q={faq.q} a={faq.a} />
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 bg-muted/20 border-t border-border/20">
          <div className="section-container text-center">
            <FadeInView>
              <h2 className="text-2xl font-bold mb-3">Can&apos;t find your answer?</h2>
              <p className="text-muted-foreground mb-6">Our team is available 7 days a week. Drop us a message and we&apos;ll respond within 2 hours.</p>
              <a href="/contact" className="btn-primary">Contact Us</a>
            </FadeInView>
          </div>
        </section>
      </main>

      <Footer />
      <WizardModal open={wizardOpen} onClose={() => setWizardOpen(false)} />
    </div>
  );
}
