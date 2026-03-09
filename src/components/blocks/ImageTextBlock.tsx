import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { ImageTextData } from '@/lib/cms/types';
import SectionHeading from './SectionHeading';

interface Props {
  data: ImageTextData;
  className?: string;
}

export default function ImageTextBlock({ data, className = '' }: Props) {
  const { heading, body, image, imagePosition = 'right', cta } = data;
  const isLeft = imagePosition === 'left';

  return (
    <section className={`py-16 border-t border-border/30 ${className}`}>
      <div className="section-container">
        <div className={`grid lg:grid-cols-2 gap-12 items-center ${isLeft ? '' : ''}`}>
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: isLeft ? -24 : 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={`${isLeft ? 'lg:order-1' : 'lg:order-2'}`}
          >
            <div className="rounded-2xl overflow-hidden satin-surface">
              <img
                src={image}
                alt={heading.headline}
                className="w-full aspect-[4/3] object-cover"
                loading="lazy"
              />
            </div>
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`${isLeft ? 'lg:order-2' : 'lg:order-1'}`}
          >
            <SectionHeading data={{ ...heading, alignment: 'left' }} className="mb-6" />
            <p className="text-muted-foreground leading-relaxed mb-8">{body}</p>
            {cta && (
              <Link
                to={cta.href}
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                {cta.label} <ArrowRight size={14} />
              </Link>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
