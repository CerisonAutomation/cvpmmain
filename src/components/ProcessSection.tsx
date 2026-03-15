import { motion } from "framer-motion";
import { ClipboardCheck, Camera, Rocket } from "lucide-react";

const STEPS = [
  { icon: ClipboardCheck, step: "01", title: "Free Assessment",  desc: "Tell us about your property and goals. We'll analyse your potential income and recommend the right plan." },
  { icon: Camera,         step: "02", title: "We Set You Up",    desc: "Professional photography, listing optimisation, pricing strategy, and MTA licensing support — all handled." },
  { icon: Rocket,         step: "03", title: "You Earn More",    desc: "We manage bookings, guests, cleaning, and maintenance. You receive monthly payouts and transparent reports." },
];

export default function ProcessSection() {
  return (
    <section id="process" className="py-16 sm:py-24 relative overflow-hidden">
      <div className="noise-overlay absolute inset-0 pointer-events-none" />
      <div className="section-container relative z-10">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          <p className="micro-type text-primary mb-4">How It Works</p>
          <h2 className="font-serif text-gold-gradient" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>Three Steps to Stress-Free Income</h2>
          <div className="mx-auto mt-4 h-[1px]" style={{ width: 'clamp(4rem,10vw,8rem)', background: 'linear-gradient(90deg,transparent,var(--gold-shimmer-2),transparent)' }} />
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="glass-strong card-gold-border relative group p-7"
            >
              <span
                className="absolute top-5 right-5 font-serif font-bold text-border/30 group-hover:text-primary/15 transition-colors select-none"
                style={{ fontSize: 'clamp(2.5rem,4vw,4rem)', lineHeight: 1 }}
              >
                {s.step}
              </span>
              <div className="satin-surface w-11 h-11 flex items-center justify-center mb-6">
                <s.icon size={18} className="text-primary" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">{s.title}</h3>
              <p className="text-small text-muted-foreground leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
