import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { HeroCenteredData } from '@/lib/cms/types';

interface Props {
  data: HeroCenteredData;
  className?: string;
}

export default function HeroCenteredBlock({ data, className = '' }: Props) {
  const { tagline, headline, body, cta, secondaryCta, backgroundImage } = data;

  return (
    <section 
      className={`relative py-20 lg:py-28 satin-glow ${className}`}
      style={backgroundImage ? {
        backgroundImage: `linear-gradient(to bottom, hsl(var(--background) / 0.9), hsl(var(--background) / 0.95)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      } : undefined}
    >
      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center"
        >
          <p className="micro-type text-primary mb-4">{tagline}</p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] mb-6">
            {headline}
          </h1>
          <p className="text-muted-foreground leading-relaxed text-lg max-w-2xl mx-auto mb-10">
            {body}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={cta.href}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              {cta.label} <ArrowRight size={14} />
            </Link>
            {secondaryCta && (
              <Link
                to={secondaryCta.href}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-border text-foreground rounded font-semibold text-sm hover:border-primary hover:text-primary transition-colors"
              >
                {secondaryCta.label}
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
