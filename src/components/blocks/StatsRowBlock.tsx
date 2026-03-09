import { motion } from 'framer-motion';
import type { StatsRowData } from '@/lib/cms/types';

interface Props {
  data: StatsRowData;
}

export default function StatsRowBlock({ data }: Props) {
  return (
    <section className="py-12 border-b border-border/20">
      <div className="section-container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {data.items.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.35 }}
              className="text-center"
            >
              <p className="font-serif text-3xl sm:text-4xl font-semibold text-primary leading-none mb-1">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-display">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
