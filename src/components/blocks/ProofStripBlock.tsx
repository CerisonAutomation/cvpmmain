import { motion } from 'framer-motion';
import { Shield, BarChart3, Clock, Star } from 'lucide-react';
import type { ProofStripData } from '@/lib/cms/types';

const ICON_MAP: Record<string, React.FC<{ size?: number; className?: string }>> = {
  Shield, BarChart3, Clock, Star,
};

interface Props {
  data: ProofStripData;
}

export default function ProofStripBlock({ data }: Props) {
  return (
    <section className="py-6 border-y border-border/30">
      <div className="section-container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {data.items.map((item, i) => {
            const Icon = ICON_MAP[item.icon] || Shield;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.35 }}
                className="flex items-center gap-3"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <Icon size={14} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground leading-tight">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
