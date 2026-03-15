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
      className={`relative min-h-[70vh] flex items-center py-20 lg:py-28 overflow-hidden ${className}`}
      style={backgroundImage ? {
        backgroundImage: `linear-gradient(to bottom, hsl(var(--background) / 0.8), hsl(var(--background) / 0.95)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      } : undefined}
    >
      {/* Cinematic Grain Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: 1.2,
            ease: [0.22, 1, 0.36, 1], // Custom cinematic ease-out
          }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.p
            initial={{ opacity: 0, tracking: '0.2em' }}
            animate={{ opacity: 1, tracking: '0.18em' }}
            transition={{ duration: 1.5, delay: 0.2 }}
            className="micro-type text-primary mb-6"
          >
            {tagline}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="font-serif text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground leading-[1.05] mb-8 tracking-tight"
          >
            {headline}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.8 }}
            className="text-muted-foreground leading-relaxed text-lg sm:text-xl max-w-2xl mx-auto mb-12 font-light"
          >
            {body}
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to={cta.href}
              className="group inline-flex items-center justify-center gap-2 px-10 py-4 bg-primary text-primary-foreground rounded-sm font-semibold text-sm hover:opacity-90 transition-all duration-300 hover:shadow-[0_0_20px_rgba(184,146,87,0.3)]"
            >
              {cta.label} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            {secondaryCta && (
              <Link
                to={secondaryCta.href}
                className="inline-flex items-center justify-center gap-2 px-10 py-4 border border-border text-foreground rounded-sm font-semibold text-sm hover:bg-foreground/5 transition-all duration-300"
              >
                {secondaryCta.label}
              </Link>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Background Motion Decorative Elements */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.15, 0.1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"
      />
    </section>
  );
}
