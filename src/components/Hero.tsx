import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Key, ChevronDown } from 'lucide-react';
import heroMalta from '@/assets/hero-malta.jpg';
import heroResidential from '@/assets/hero-residential.jpg';
import { getPage, getBlockById } from '@/lib/cms';
import type { HeroSplitData } from '@/lib/cms/types';

interface HeroProps {
  onOpenWizard: () => void;
}

export default function Hero({ onOpenWizard }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });

  // Parallax transforms
  const leftImgY    = useTransform(scrollYProgress, [0, 1], ['0%', '18%']);
  const rightImgY   = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);
  const scrollOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  const page  = getPage('home');
  const block = page ? getBlockById<HeroSplitData>(page, 'home-hero') : null;
  const d     = block?.data;

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
    <section
      ref={sectionRef}
      className="relative min-h-[100dvh] flex flex-col md:flex-row noise-overlay overflow-hidden"
    >
      {/* ─── Centre gold divider (desktop only) ─── */}
      <div
        className="hidden md:block absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] z-20 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, var(--gold-shimmer-2) 30%, var(--gold-shimmer-2) 70%, transparent 100%)',
          opacity: 0.25,
        }}
      />

      {/* ══════════════════════════════════════════
          LEFT — Owner Services
      ══════════════════════════════════════════ */}
      <div className="relative w-full md:w-1/2 flex flex-col justify-between bg-background overflow-hidden min-h-[50vh] md:min-h-[100dvh]">
        {/* Parallax ghost bg */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.img
            src={heroMalta}
            alt=""
            aria-hidden="true"
            style={{ y: leftImgY }}
            className="w-full h-[115%] object-cover opacity-[0.05]"
          />
        </div>

        {/* Left edge gold accent */}
        <div
          className="absolute left-0 top-[10%] bottom-[10%] w-[1px] pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, transparent, var(--gold-shimmer-2) 40%, var(--gold-shimmer-2) 60%, transparent)',
            opacity: 0.3,
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center flex-1 px-5 sm:px-8 lg:px-14 py-16 md:py-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            {/* Icon badge */}
            <div className="satin-surface w-10 h-10 flex items-center justify-center mb-6">
              <FileText size={15} className="text-primary" />
            </div>

            <p className="micro-type text-primary mb-4">{left.tagline}</p>

            <h1
              className="font-serif text-gold-gradient leading-[1.05] mb-3"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}
            >
              {left.headline}
            </h1>

            {/* Gold rule */}
            <div
              className="mb-6"
              style={{
                height: '1px',
                width: 'clamp(3rem, 8vw, 6rem)',
                background: 'linear-gradient(90deg, var(--gold-shimmer-2), transparent)',
              }}
            />

            <p className="text-body text-muted-foreground max-w-sm mb-10">
              {left.body}
            </p>

            <button onClick={onOpenWizard} className="btn-gold btn-gold-glow group inline-flex items-center gap-3">
              {left.cta.label}
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>
        </div>

        {/* Proof strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="relative z-10 glass-strong border-t border-primary/10 px-5 sm:px-8 lg:px-14 py-3"
        >
          <div
            className="absolute top-0 left-0 right-0 h-[1px]"
            style={{ background: 'linear-gradient(90deg, transparent, var(--gold-shimmer-2), transparent)', opacity: 0.4 }}
          />
          <p className="micro-type text-muted-foreground" style={{ letterSpacing: '0.2em' }}>{left.proof}</p>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════
          RIGHT — Guest Services
      ══════════════════════════════════════════ */}
      <div className="relative w-full md:w-1/2 flex flex-col justify-between overflow-hidden min-h-[50vh] md:min-h-[100dvh]">
        {/* Parallax cinematic image */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.img
            src={heroResidential}
            alt="Luxury Mediterranean residence"
            fetchPriority="high"
            loading="eager"
            style={{ y: rightImgY }}
            className="w-full h-[115%] object-cover"
          />
          <div
            className="absolute inset-0"
            style={{ background: 'var(--gradient-hero-overlay)' }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center flex-1 px-5 sm:px-8 lg:px-14 py-16 md:py-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            {/* Icon badge */}
            <div className="glass w-10 h-10 flex items-center justify-center mb-6">
              <Key size={15} className="text-primary" />
            </div>

            <p className="micro-type text-primary mb-4">{right.tagline}</p>

            <h2
              className="font-serif text-gold-gradient leading-[1.05] mb-3"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}
            >
              {right.headline}
            </h2>

            {/* Gold rule */}
            <div
              className="mb-6"
              style={{
                height: '1px',
                width: 'clamp(3rem, 8vw, 6rem)',
                background: 'linear-gradient(90deg, var(--gold-shimmer-2), transparent)',
              }}
            />

            <p className="text-body text-foreground/70 max-w-sm mb-10">
              {right.body}
            </p>

            <Link
              to={right.cta.href || '/properties'}
              className="btn-outline group inline-flex items-center gap-3"
            >
              {right.cta.label}
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {/* Proof strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65, duration: 0.5 }}
          className="relative z-10 glass-strong border-t border-foreground/8 px-5 sm:px-8 lg:px-14 py-3"
        >
          <div
            className="absolute top-0 left-0 right-0 h-[1px]"
            style={{ background: 'linear-gradient(90deg, transparent, var(--gold-shimmer-2), transparent)', opacity: 0.3 }}
          />
          <p className="micro-type text-foreground/35" style={{ letterSpacing: '0.2em' }}>{right.proof}</p>
        </motion.div>
      </div>

      {/* ─── Scroll indicator ─── */}
      <motion.div
        style={{ opacity: scrollOpacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 pointer-events-none"
      >
        <p className="micro-type text-muted-foreground/50" style={{ fontSize: '0.55rem' }}>Scroll</p>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown size={14} className="text-primary/50" />
        </motion.div>
      </motion.div>
    </section>
  );
}
