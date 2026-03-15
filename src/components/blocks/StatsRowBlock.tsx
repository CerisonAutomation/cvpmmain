import { motion } from 'framer-motion';
import type { StatsRowData } from '@/lib/cms/types';

interface Props {
  data: StatsRowData;
}

export default function StatsRowBlock({ data }: Props) {
  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      <div className="section-container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {data.stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-center relative group"
            >
              <div className="text-4xl lg:text-6xl font-serif font-bold text-foreground mb-4 tracking-tighter">
                <span className="gold-text">{stat.value}</span>
                {stat.suffix && <span className="text-2xl lg:text-3xl font-light text-muted-foreground ml-1">{stat.suffix}</span>}
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground/60 leading-relaxed max-w-[140px] mx-auto">
                {stat.label}
              </p>

              {/* Decorative accent */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-8 h-px bg-primary/20 group-hover:w-12 transition-all duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
