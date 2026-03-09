import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Home, Key } from 'lucide-react';
import type { HeroSplitData } from '@/lib/cms/types';

const ICON_MAP: Record<string, any> = { Home, Key, ArrowRight };

interface Props {
  data: HeroSplitData;
  className?: string;
}

export default function HeroSplitBlock({ data, className = '' }: Props) {
  const { left, right } = data;

  return (
    <section className={`relative min-h-[70vh] ${className}`}>
      <div className="grid lg:grid-cols-2 min-h-[70vh]">
        {/* Left panel */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-16 bg-background"
        >
          <p className="micro-type text-primary mb-4">{left.tagline}</p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-[1.1] mb-4">
            {left.headline}
          </h1>
          <p className="text-muted-foreground leading-relaxed mb-8 max-w-md">{left.body}</p>
          {left.proof && (
            <p className="text-xs text-muted-foreground mb-6">{left.proof}</p>
          )}
          {left.cta.action === 'link' && left.cta.href ? (
            <Link
              to={left.cta.href}
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded font-semibold text-sm hover:opacity-90 transition-opacity w-fit"
            >
              {left.cta.label} <ArrowRight size={14} />
            </Link>
          ) : (
            <button className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded font-semibold text-sm hover:opacity-90 transition-opacity w-fit">
              {left.cta.label} <ArrowRight size={14} />
            </button>
          )}
        </motion.div>

        {/* Right panel */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative flex flex-col justify-center px-8 sm:px-12 lg:px-16 py-16"
          style={right.backgroundImage ? {
            backgroundImage: `linear-gradient(to right, hsl(var(--background)), hsl(var(--background) / 0.85)), url(${right.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          } : { background: `hsl(var(--card))` }}
        >
          <p className="micro-type text-primary mb-4">{right.tagline}</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground leading-[1.1] mb-4">
            {right.headline}
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8 max-w-md">{right.body}</p>
          {right.proof && (
            <p className="text-xs text-muted-foreground mb-6">{right.proof}</p>
          )}
          <Link
            to={right.cta.href}
            className="inline-flex items-center gap-2 px-8 py-4 border border-border text-foreground rounded font-semibold text-sm hover:border-primary hover:text-primary transition-colors w-fit"
          >
            {right.cta.label} <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
