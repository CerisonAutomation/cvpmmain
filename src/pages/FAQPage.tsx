import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEOHead } from '@/components/SEOHead';
import { SkipLink } from '@/components/ui/accessibility';
import { FadeInView } from '@/components/PageTransition';
import LeadModal from '@/components/LeadModal';

const faqs = [
  {
    category: 'For Property Owners',
    items: [
      { q: 'How much can I earn from my Malta property?', a: 'Earnings depend on location, size, and condition. Our managed properties average 60–80% occupancy year-round, with top performers generating €25,000–€60,000+ annually. We\'ll give you a personalised estimate in 24 hours.' },
      { q: 'What does your management service include?', a: 'Everything: listing creation and optimisation across all OTAs, dynamic pricing, guest communication 24/7, professional cleaning and linen, maintenance coordination, monthly owner statements, and dedicated account management.' },
      { q: 'Do you handle all the booking platforms?', a: 'Yes. We manage your listing on Airbnb, Booking.com, Expedia, VRBO, and our own direct booking channel — all synced in real time via Guesty to prevent double-bookings.' },
      { q: 'What is your management fee?', a: 'Our fee structure is transparent and performance-based. See our Pricing page for full details. There are no hidden charges — your monthly statement shows every euro in and out.' },
      { q: 'Can I still use my property personally?', a: 'Absolutely. Simply block dates on your calendar through the owner portal. We recommend giving us at least 48 hours notice to adjust operations accordingly.' },
      { q: 'How do I receive my monthly payout?', a: 'Payouts are processed on the 10th of each month for the previous month\'s bookings, directly to your bank account. You also receive a full digital owner statement by email.' },
    ],
  },
  {
    category: 'For Guests',
    items: [
      { q: 'Are your properties as shown in the photos?', a: 'Every property is professionally photographed and regularly inspected. What you see is what you get — we have a zero-tolerance policy for misleading listings.' },
      { q: 'What is the check-in process?', a: 'We provide detailed arrival instructions 48 hours before check-in. Most properties use smart locks or key safes. A local contact is always available should you need assistance.' },
      { q: 'Is WiFi included?', a: 'Yes, all our properties include high-speed WiFi at no extra charge. Speed details are listed on each property page.' },
      { q: 'What if something goes wrong during my stay?', a: 'Our guest support line is available 24/7. For maintenance issues, we aim to resolve anything within 4 hours. In rare cases where a property becomes unavailable, we will rehouse you at no cost.' },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/30 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full text-left py-4 flex items-center justify-between gap-4 group"
        aria-expanded={open}
      >
        <span className="font-medium text-sm group-hover:text-primary transition-colors">{q}</span>
        <ChevronDown size={16} className={`flex-shrink-0 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <p className="pb-4 text-sm text-muted-foreground leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  const [leadOpen, setLeadOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <SkipLink />
      <SEOHead
        title="FAQ — Christiano Vincenti Property Management Malta"
        description="Answers to the most common questions from property owners and guests. Learn how our Malta property management service works."
        keywords={['Malta property management FAQ', 'Airbnb management Malta questions', 'short term rental Malta']}
      />
      <Navbar onOpenWizard={() => setLeadOpen(true)} />

      <main id="main-content">
        <section className="pt-28 pb-16 border-b border-border/20">
          <div className="section-container">
            <FadeInView>
              <p className="micro-type text-primary mb-4">FAQ</p>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight max-w-2xl leading-[1.1] mb-4">Frequently Asked Questions</h1>
              <p className="text-muted-foreground text-lg max-w-xl">Everything you need to know about managing or booking with us.</p>
            </FadeInView>
          </div>
        </section>

        <section className="py-16">
          <div className="section-container max-w-3xl">
            {faqs.map((cat, i) => (
              <FadeInView key={cat.category} delay={i * 0.1}>
                <div className="mb-12">
                  <h2 className="text-xl font-semibold mb-6 text-primary">{cat.category}</h2>
                  <div className="bg-card border border-border/30 rounded-2xl px-6">
                    {cat.items.map(item => <FAQItem key={item.q} q={item.q} a={item.a} />)}
                  </div>
                </div>
              </FadeInView>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-primary/5 border-t border-border/20">
          <div className="section-container text-center">
            <FadeInView>
              <MessageCircle className="w-10 h-10 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-3">Still have questions?</h2>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto">Our team is available 7 days a week. We&apos;ll reply within 2 hours.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button onClick={() => setLeadOpen(true)} className="btn-primary">Send an Enquiry</button>
                <a href="tel:+35679790202" className="btn-secondary">Call +356 7979 0202</a>
              </div>
            </FadeInView>
          </div>
        </section>
      </main>

      <Footer />
      <LeadModal open={leadOpen} onClose={() => setLeadOpen(false)} context="general" />
    </div>
  );
}
