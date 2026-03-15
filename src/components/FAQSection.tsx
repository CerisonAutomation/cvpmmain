import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  { q: "Do I need an MTA licence to rent short-term in Malta?",   a: "Yes. All short-let properties in Malta require a Malta Tourism Authority (MTA) licence. We guide you through the entire application process as part of our service." },
  { q: "What areas do you cover?",                                 a: "We manage properties across all of Malta and Gozo, with particular expertise in Sliema, St Julian's, Valletta, Mdina, and Mellieħa." },
  { q: "How quickly can my property go live?",                     a: "Most properties are listed within 2–3 weeks of onboarding. This includes professional photography, listing creation, and pricing setup." },
  { q: "What happens with maintenance issues?",                    a: "We coordinate all maintenance through our trusted network. Costs are passed through at cost — no markups, ever. You approve anything above a pre-agreed threshold." },
  { q: "Can I block dates for personal use?",                      a: "Absolutely. You have full control over your calendar through our owner dashboard. Block dates anytime with no penalties." },
  { q: "What's included in the monthly reporting?",                a: "You receive a detailed monthly statement covering revenue, occupancy, guest reviews, expenses, and a performance summary compared to market benchmarks." },
];

export default function FAQSection() {
  return (
    <section id="faq" className="py-16 sm:py-24 bg-card/30 relative overflow-hidden">
      <div className="noise-overlay absolute inset-0 pointer-events-none" />
      <div className="section-container max-w-3xl relative z-10">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12"
        >
          <p className="micro-type text-primary mb-4">FAQ</p>
          <h2 className="font-serif text-gold-gradient" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>Common Questions</h2>
          <div className="mx-auto mt-4 h-[1px]" style={{ width: 'clamp(4rem,10vw,8rem)', background: 'linear-gradient(90deg,transparent,var(--gold-shimmer-2),transparent)' }} />
        </motion.div>

        <Accordion type="single" collapsible className="space-y-2.5">
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <AccordionItem
                value={`faq-${i}`}
                className="glass-strong border border-border/30 data-[state=open]:border-primary/30 transition-colors"
              >
                <AccordionTrigger className="text-left font-serif text-sm font-medium text-foreground hover:text-primary px-5 py-4 hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-small text-muted-foreground leading-relaxed px-5 pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-small text-muted-foreground mb-5">Still have questions?</p>
          <a href="/contact" className="btn-gold btn-gold-glow inline-flex items-center gap-2.5 group">
            Talk to the Team
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
