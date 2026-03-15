import { motion } from 'framer-motion';
import type { ProofStripData } from '@/lib/cms/types';

interface Props {
  data: ProofStripData;
}

export default function ProofStripBlock({ data }: Props) {
  return (
    <section className="py-12 border-y border-border/15 bg-secondary/30 relative overflow-hidden">
      {/* Cinematic noise/grain */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <div className="section-container relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {data.items.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-2xl font-serif font-bold text-foreground mb-1 tracking-tight">
                {item.value}
              </p>
              <p className="micro-type text-muted-foreground/60 text-[9px] tracking-[0.2em]">
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
