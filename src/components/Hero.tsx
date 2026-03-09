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
    <section className="relative min-h-screen flex flex-col md:flex-row">
      {/* ── LEFT: Owner Services ── */}
      <div className="relative w-full md:w-1/2 flex flex-col justify-between bg-background overflow-hidden min-h-[50vh] md:min-h-screen">
        <div className="absolute inset-0">
          <img src={heroMalta} alt="" className="w-full h-full object-cover opacity-[0.05]" aria-hidden="true" />
        </div>

        <div className="relative z-10 flex flex-col justify-center flex-1 px-6 sm:px-10 lg:px-16 py-20 md:py-0">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            <div className="w-10 h-10 rounded-full border border-border/60 flex items-center justify-center mb-6">
              <FileText size={18} className="text-primary" />
            </div>

            <p className="micro-type text-primary mb-4">{left.tagline}</p>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground leading-[1.08] mb-2">
              {left.headline}
            </h1>
            <div className="h-[3px] w-48 sm:w-64 bg-primary/60 mb-6" />

            <p className="text-muted-foreground text-[15px] leading-relaxed max-w-md mb-10">
              {left.body}
            </p>

            <button
              onClick={onOpenWizard}
              className="group inline-flex items-center gap-3 micro-type text-primary hover:text-foreground transition-colors"
            >
              {left.cta.label}
              <span className="w-9 h-9 rounded-full border border-border/50 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                <ArrowRight size={14} className="group-hover:text-primary-foreground transition-colors" />
              </span>
            </button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="relative z-10 border-t border-border/20 px-6 sm:px-10 lg:px-16 py-3.5 text-[10px] text-muted-foreground uppercase tracking-[0.18em] font-display"
        >
          {left.proof}
        </motion.div>
      </div>

      {/* ── RIGHT: Guest Services ── */}
      <div className="relative w-full md:w-1/2 flex flex-col justify-between overflow-hidden min-h-[50vh] md:min-h-screen">
        <div className="absolute inset-0">
          <img
            src={heroResidential}
            alt="Luxury Mediterranean residence — Malta"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'var(--gradient-hero-overlay)' }} />
        </div>

        <div className="relative z-10 flex flex-col justify-center flex-1 px-6 sm:px-10 lg:px-16 py-20 md:py-0">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
          >
            <div className="w-10 h-10 rounded-full border border-foreground/20 flex items-center justify-center mb-6">
              <Key size={18} className="text-primary" />
            </div>

            <p className="micro-type text-primary mb-4">{right.tagline}</p>

            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-foreground leading-[1.08] mb-2">
              {right.headline}
            </h2>
            <div className="h-[3px] w-48 sm:w-64 bg-primary/60 mb-6" />

            <p className="text-foreground/75 text-[15px] leading-relaxed max-w-md mb-10">
              {right.body}
            </p>

            <Link
              to={right.cta.href || '/properties'}
              className="group inline-flex items-center gap-3 micro-type text-primary hover:text-foreground transition-colors"
            >
              {right.cta.label}
              <span className="w-9 h-9 rounded-full border border-foreground/20 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                <ArrowRight size={14} className="group-hover:text-primary-foreground transition-colors" />
              </span>
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="relative z-10 border-t border-foreground/8 px-6 sm:px-10 lg:px-16 py-3.5 text-[10px] text-foreground/40 uppercase tracking-[0.18em] font-display"
        >
          {right.proof}
        </motion.div>
      </div>
    </section>
  );
}
