import { motion } from "framer-motion";
import { Shield, BarChart3, Clock, Star } from "lucide-react";

const PROOFS = [
  { icon: Shield,    label: "No Hidden Markups", desc: "Maintenance at cost" },
  { icon: BarChart3, label: "Owner Dashboard",   desc: "Monthly statements" },
  { icon: Clock,     label: "24hr Response",      desc: "Guaranteed reply" },
  { icon: Star,      label: "5-Star Reviews",     desc: "Guest satisfaction" },
];

export default function ProofStrip() {
  return (
    <section className="py-0 border-y border-border/20 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: 'linear-gradient(90deg,transparent,var(--gold-shimmer-2) 40%,var(--gold-shimmer-2) 60%,transparent)' }} />
      <div className="glass-strong w-full">
        <div className="section-container py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8">
            {PROOFS.map((p, i) => (
              <motion.div
                key={p.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-3.5"
              >
                <div className="satin-surface flex-shrink-0 w-9 h-9 flex items-center justify-center">
                  <p.icon size={14} className="text-primary" />
                </div>
                <div>
                  <p className="text-small font-semibold text-foreground">{p.label}</p>
                  <p className="text-caption" style={{ color: 'var(--gold-shimmer-2)' }}>{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{ background: 'linear-gradient(90deg,transparent,var(--gold-shimmer-2) 40%,var(--gold-shimmer-2) 60%,transparent)', opacity: 0.3 }} />
    </section>
  );
}
