import { motion } from 'framer-motion';
import { 
  Shield, Sparkles, Clock, Lightbulb, Star, BarChart3, TrendingUp, 
  Gift, MessageCircle, Camera, Bed, ShieldCheck, Wrench, FileText, 
  Calendar, Mail, Phone, MapPin, ClipboardCheck, Rocket, Key,
  Heart, CheckCircle, UserCheck, Banknote, Search, Scale,
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
  Calendar, Mail, Phone, MapPin, ClipboardCheck, Rocket, Key,
  Heart, CheckCircle, UserCheck, Banknote, Search, Scale, Home: Bed
};

function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] || Star;
}

export default function FeatureGridBlock({ data, className = '' }: Props) {
  const { heading, items, columns = 3 } = data;

  const gridCols = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return (
    <section className={`py-20 lg:py-32 ${className}`}>
      <div className="section-container">
        {heading && <SectionHeading data={heading} className="mb-16 lg:mb-24" />}
        
        <div className={`grid ${gridCols} gap-6 lg:gap-8`}>
          {items.map((item, i) => {
            const Icon = getIcon(item.icon || '');
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="group satin-surface rounded-sm p-8 hover:border-primary/40 transition-all duration-500"
              >
                <div className="w-12 h-12 rounded-sm bg-secondary flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors duration-500">
                  <Icon size={20} className="text-primary group-hover:scale-110 transition-transform duration-500" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-500">{item.title}</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed font-light">{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
