import { motion } from 'framer-motion';
import { ClipboardCheck, Camera, Rocket } from 'lucide-react';
import SectionHeading from './SectionHeading';
import type { ProcessStepsData } from '@/lib/cms/types';

const ICON_MAP: Record<string, any> = {
  ClipboardCheck, Camera, Rocket,
};

interface Props {
  data: ProcessStepsData;
}

export default function ProcessStepsBlock({ data }: Props) {
  return (
    <section className="py-16 sm:py-20">
      <div className="section-container">
        <SectionHeading data={data.heading} className="mb-12" />

        <div className="grid md:grid-cols-3 gap-5">
          {data.steps.map((step, i) => {
            const Icon = ICON_MAP[step.icon] || ClipboardCheck;
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.4 }}
                className="satin-surface rounded-md p-6 relative group"
              >
                <span className="absolute top-5 right-5 font-serif text-4xl font-bold text-border/40 select-none">
                  {step.step}
                </span>
                <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center mb-4">
                  <Icon size={18} className="text-primary" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{step.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
