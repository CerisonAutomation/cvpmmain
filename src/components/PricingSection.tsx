import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";

interface PricingSectionProps {
  onOpenWizard: () => void;
}

const PLANS = [
  {
    name: "Essentials", price: "15%", subtitle: "of booking revenue",
    desc: "Perfect for owners who want professional listing management with hands-on involvement.",
    features: ["Professional photography","Multi-platform listing","Dynamic pricing","Guest communication","Monthly reporting","MTA licence guidance"],
    highlighted: false,
  },
  {
    name: "Complete", price: "20%", subtitle: "of booking revenue",
    desc: "Full hands-off management. We handle everything so you don't have to lift a finger.",
    features: ["Everything in Essentials","Cleaning coordination","Maintenance at cost","Linen & amenities","Direct booking website","Owner dashboard access","Priority 24hr support","Quarterly strategy review"],
    highlighted: true,
  },
];

export default function PricingSection({ onOpenWizard }: PricingSectionProps) {
  return (
    <section id="pricing" className="py-16 sm:py-24 relative overflow-hidden">
      <div className="noise-overlay absolute inset-0 pointer-events-none" />
      <div className="section-container relative z-10">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          <p className="micro-type text-primary mb-4">Pricing</p>
          <h2 className="font-serif text-gold-gradient" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>Simple, Transparent</h2>
          <div className="mx-auto mt-4 mb-5 h-[1px]" style={{ width: 'clamp(4rem,10vw,8rem)', background: 'linear-gradient(90deg,transparent,var(--gold-shimmer-2),transparent)' }} />
          <p className="text-body text-muted-foreground max-w-md mx-auto">No setup fees. No hidden costs. You only pay when you earn.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className={`relative flex flex-col ${ plan.highlighted ? 'satin-surface card-gold-border' : 'glass-surface' }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3.5 left-6 px-3 py-1 micro-type bg-primary text-primary-foreground" style={{ fontSize: '0.6rem' }}>Most Popular</span>
              )}
              <div className="p-7 flex flex-col flex-1">
                <h3 className="font-serif text-xl font-semibold text-foreground mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="font-serif text-gold-gradient" style={{ fontSize: 'clamp(2rem,5vw,2.75rem)', lineHeight: 1 }}>{plan.price}</span>
                  <span className="text-small text-muted-foreground">{plan.subtitle}</span>
                </div>
                <div className="h-[1px] mb-4" style={{ width: '3rem', background: 'linear-gradient(90deg, var(--gold-shimmer-2), transparent)' }} />
                <p className="text-small text-muted-foreground mb-6">{plan.desc}</p>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-small text-foreground">
                      <Check size={13} className="text-primary flex-shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                {plan.highlighted
                  ? <button onClick={onOpenWizard} className="btn-gold btn-gold-glow w-full justify-center group">Get Started <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" /></button>
                  : <button onClick={onOpenWizard} className="btn-outline w-full justify-center group">Get Started <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" /></button>
                }
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
