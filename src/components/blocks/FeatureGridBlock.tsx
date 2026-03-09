import { motion } from 'framer-motion';
import { 
  Shield, Sparkles, Clock, Lightbulb, Star, BarChart3, TrendingUp, 
  Gift, MessageCircle, Camera, Bed, ShieldCheck, Wrench, FileText, 
  Calendar, Mail, Phone, MapPin, ClipboardCheck, Rocket, Key,
  type LucideIcon
} from 'lucide-react';
import type { FeatureGridData } from '@/lib/cms/types';
import SectionHeading from './SectionHeading';

interface Props {
  data: FeatureGridData;
  className?: string;
}

const ICON_MAP: Record<string, LucideIcon> = {
  Shield, Sparkles, Clock, Lightbulb, Star, BarChart3, TrendingUp,
  Gift, MessageCircle, Camera, Bed, ShieldCheck, Wrench, FileText,
  Calendar, Mail, Phone, MapPin, ClipboardCheck, Rocket, Key
};

function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] || Star;
}

export default function FeatureGridBlock({ data, className = '' }: Props) {
  const { heading, items, columns = 4 } = data;

  const gridCols = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return (
    <section className={`py-16 border-t border-border/30 ${className}`}>
      <div className="section-container">
        <SectionHeading data={heading} className="mb-12" />
        
        <div className={`grid ${gridCols} gap-5`}>
          {items.map((item, i) => {
            const Icon = getIcon(item.icon);
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="satin-surface rounded-xl p-6"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon size={18} className="text-primary" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
