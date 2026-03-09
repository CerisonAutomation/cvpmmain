import { motion } from 'framer-motion';
import type { SectionHeadingData } from '@/lib/cms/types';

interface Props {
  data: SectionHeadingData;
  className?: string;
}

export default function SectionHeading({ data, className = '' }: Props) {
  const { tagline, headline, highlightWord, body, alignment = 'center' } = data;
  const align = alignment === 'center' ? 'text-center' : 'text-left';

  // Replace highlight word with gold-text span
  const renderHeadline = () => {
    if (!highlightWord) return headline;
    const parts = headline.split(highlightWord);
    if (parts.length < 2) return headline;
    return (
      <>
        {parts[0]}<span className="gold-text">{highlightWord}</span>{parts[1]}
      </>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={`${align} ${className}`}
    >
      <p className="micro-type text-primary mb-3">{tagline}</p>
      <h2 className="section-heading">{renderHeadline()}</h2>
      {body && (
        <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto leading-relaxed">{body}</p>
      )}
    </motion.div>
  );
}
