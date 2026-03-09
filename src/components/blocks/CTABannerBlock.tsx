import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CTABannerData } from '@/lib/cms/types';

interface Props {
  data: CTABannerData;
}

export default function CTABannerBlock({ data }: Props) {
  return (
    <section className="py-16 sm:py-20">
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="satin-surface rounded-md p-10 sm:p-14 text-center max-w-3xl mx-auto"
        >
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground mb-3 leading-tight">
            {data.headline}
          </h2>
          {data.body && (
            <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">{data.body}</p>
          )}
          <Link
            to={data.cta.href}
            className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
          >
            {data.cta.label}
            <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
