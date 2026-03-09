import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import SectionHeading from './SectionHeading';
import type { PricingTableData } from '@/lib/cms/types';

interface Props {
  data: PricingTableData;
}

export default function PricingTableBlock({ data }: Props) {
  return (
    <section className="py-16 sm:py-20">
      <div className="section-container">
        <SectionHeading data={data.heading} className="mb-12" />

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {data.plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className={`satin-surface rounded-md p-6 relative ${
                plan.highlighted ? 'border-primary/40' : ''
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-6 micro-type px-3 py-1 bg-primary text-primary-foreground rounded-full text-[10px]">
                  Most Popular
                </span>
              )}
              <h3 className="font-serif text-xl font-semibold text-foreground mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold text-primary">{plan.price}</span>
                <span className="text-xs text-muted-foreground">{plan.subtitle}</span>
              </div>
              <p className="text-[13px] text-muted-foreground mb-5">{plan.description}</p>
              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px] text-foreground">
                    <Check size={14} className="text-primary flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href={plan.cta.href}
                className={`block w-full py-3 text-sm font-semibold rounded-md transition-colors text-center ${
                  plan.highlighted
                    ? 'bg-primary text-primary-foreground hover:opacity-90'
                    : 'border border-border text-foreground hover:border-primary hover:text-primary'
                }`}
              >
                {plan.cta.label}
              </a>
            </motion.div>
          ))}
        </div>

        {data.footnote && (
          <p className="text-center text-xs text-muted-foreground mt-6">{data.footnote}</p>
        )}
      </div>
    </section>
  );
}
