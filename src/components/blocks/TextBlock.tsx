import { motion } from 'framer-motion';
import type { TextBlockData } from '@/lib/cms/types';

interface Props {
  data: TextBlockData;
  className?: string;
}

export default function TextBlock({ data, className = '' }: Props) {
  const { heading, body, alignment = 'left' } = data;
  const align = alignment === 'center' ? 'text-center mx-auto' : '';

  return (
    <section className={`py-16 border-t border-border/30 ${className}`}>
      <div className="section-container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={align}
        >
          {heading && (
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground mb-4">
              {heading}
            </h2>
          )}
          <p className="text-muted-foreground leading-relaxed">{body}</p>
        </motion.div>
      </div>
    </section>
  );
}
