import { motion } from 'framer-motion';
import type { SectionHeadingData } from '@/lib/cms/types';

interface Props {
  data?: SectionHeadingData | string;
  className?: string;
}

export default function SectionHeading({ data, className = '' }: Props) {
  if (!data) return null;
  const normalized: SectionHeadingData =
    typeof data === 'string' ? { headline: data } : data;
  const { tagline, headline, highlightWord, alignment = 'center' } = normalized;
  if (!headline) return null;
  const align = alignment === 'center' ? 'text-center' : 'text-left';

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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8 }}
      className={`${align} ${className}`}
    >
      {tagline && (
        <p className="micro-type text-primary mb-4 tracking-[0.2em]">{tagline}</p>
      )}
      <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight tracking-tight">
        {renderHeadline()}
      </h2>
      <div className={`mt-6 h-px w-20 bg-primary/30 ${alignment === 'center' ? 'mx-auto' : ''}`} />
    </motion.div>
  );
}
