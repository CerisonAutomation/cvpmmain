import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Key } from 'lucide-react';
import heroMalta from '@/assets/hero-malta.jpg';
import heroResidential from '@/assets/hero-residential.jpg';
import { getPage, getBlockById } from '@/lib/cms';
import type { HeroSplitData } from '@/lib/cms/types';

interface HeroProps {
  onOpenWizard: () => void;
}

export default function Hero({ onOpenWizard }: HeroProps) {
  const page = getPage('home');
  const block = page ? getBlockById<HeroSplitData>(page, 'home-hero') : null;
  const d = block?.data;

  const left = d?.left ?? {
    tagline: 'Owner Services',
    headline: 'Institutional',
    body: '',
    cta: { label: 'Initialize Management', action: 'wizard' as const },
    proof: '',
  };
  const right = d?.right ?? {
    tagline: 'Guest Services',
    headline: 'Residential',
    body: '',
    cta: { label: 'Explore Collection', href: '/properties' },
    proof: '',
  };

  return (
    <section className="relative min-h-[90vh] flex flex-col md:flex-row">
      {/* ── LEFT: Owner Services ── */}
      <div className="relative w-full md:w-1/2 flex flex-col justify-between bg-background overflow-hidden min-h-[45vh] md:min-h-[90vh]">
        <div className="absolute inset-0">
          <img src={heroMalta} alt="" className="w-full h-full object-cover opacity-[0.04]" aria-hidden="true" />
        </div>

        <div className="relative z-10 flex flex-col justify-center flex-1 px-5 sm:px-8 lg:px-12 py-14 md:py-0">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="w-8 h-8 border border-border/50 flex items-center justify-center mb-4">
              <FileText size={14} className="text-primary" />
            </div>

            <p className="micro-type text-primary mb-3">{left.tagline}</p>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground leading-[1.1] mb-1.5">
              {left.headline}
            </h1>
            <div className="h-[2px] w-32 sm:w-48 bg-primary/50 mb-4" />

            <p className="text-muted-foreground text-[13px] leading-relaxed max-w-sm mb-8">
              {left.body}
            </p>

            <button
              onClick={onOpenWizard}
              className="group inline-flex items-center gap-2.5 micro-type text-primary hover:text-foreground transition-colors"
            >
              {left.cta.label}
              <span className="w-7 h-7 border border-border/40 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                <ArrowRight size={12} className="group-hover:text-primary-foreground transition-colors" />
              </span>
            </button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="relative z-10 border-t border-border/15 px-5 sm:px-8 lg:px-12 py-2.5 text-[9px] text-muted-foreground uppercase tracking-[0.16em] font-display"
        >
          {left.proof}
        </motion.div>
      </div>

      {/* ── RIGHT: Guest Services ── */}
      <div className="relative w-full md:w-1/2 flex flex-col justify-between overflow-hidden min-h-[45vh] md:min-h-[90vh]">
        <div className="absolute inset-0">
          <img
            src={heroResidential}
            alt="Luxury Mediterranean residence"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'var(--gradient-hero-overlay)' }} />
        </div>

        <div className="relative z-10 flex flex-col justify-center flex-1 px-5 sm:px-8 lg:px-12 py-14 md:py-0">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <div className="w-8 h-8 border border-foreground/15 flex items-center justify-center mb-4">
              <Key size={14} className="text-primary" />
            </div>

            <p className="micro-type text-primary mb-3">{right.tagline}</p>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground leading-[1.1] mb-1.5">
              {right.headline}
            </h2>
            <div className="h-[2px] w-32 sm:w-48 bg-primary/50 mb-4" />

            <p className="text-foreground/70 text-[13px] leading-relaxed max-w-sm mb-8">
              {right.body}
            </p>

            <Link
              to={right.cta.href || '/properties'}
              className="group inline-flex items-center gap-2.5 micro-type text-primary hover:text-foreground transition-colors"
            >
              {right.cta.label}
              <span className="w-7 h-7 border border-foreground/15 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                <ArrowRight size={12} className="group-hover:text-primary-foreground transition-colors" />
              </span>
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="relative z-10 border-t border-foreground/8 px-5 sm:px-8 lg:px-12 py-2.5 text-[9px] text-foreground/35 uppercase tracking-[0.16em] font-display"
        >
          {right.proof}
        </motion.div>
      </div>
    </section>
  );
}
