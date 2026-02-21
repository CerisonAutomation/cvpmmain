import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
}

// Malta & Gozo SVG paths (simplified outlines)
const MALTA_PATH = "M 245 58 C 252 55 262 52 270 50 C 282 47 295 44 308 46 C 320 48 330 55 340 62 C 348 68 355 76 360 85 C 364 93 366 102 370 110 C 375 120 382 128 386 138 C 389 146 390 155 388 164 C 386 173 380 180 375 188 C 370 195 364 202 356 207 C 348 212 338 215 328 218 C 318 221 308 222 298 226 C 288 230 278 236 268 240 C 258 244 248 247 237 248 C 226 249 215 248 205 244 C 195 240 186 233 178 226 C 170 219 163 210 158 200 C 153 190 150 179 148 168 C 146 157 146 146 148 135 C 150 124 154 114 160 105 C 166 96 174 88 183 82 C 192 76 202 72 212 68 C 222 64 233 61 245 58 Z";

const GOZO_PATH = "M 120 42 C 128 38 138 36 148 35 C 158 34 168 35 177 38 C 185 41 192 46 196 53 C 200 60 201 68 198 76 C 195 84 188 90 180 94 C 172 98 163 100 154 100 C 145 100 136 98 128 94 C 120 90 114 84 110 76 C 106 68 106 58 110 50 C 114 46 117 44 120 42 Z";

const NAME_CHARS = 'Christiano Vincenti'.split('');

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [phase, setPhase] = useState(0); // 0=init, 1=map, 2=name, 3=hold, 4=exit
  const maltaRef = useRef<SVGPathElement>(null);
  const gozoRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    // Phase timeline
    const timers = [
      setTimeout(() => setPhase(1), 200),   // Start map draw
      setTimeout(() => setPhase(2), 2000),   // Start name reveal
      setTimeout(() => setPhase(3), 3200),   // Hold
      setTimeout(() => setPhase(4), 4400),   // Exit veil
      setTimeout(() => onComplete(), 5200),  // Done
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  // Measure & set stroke dash for draw animation
  useEffect(() => {
    if (maltaRef.current) {
      const len = maltaRef.current.getTotalLength();
      maltaRef.current.style.setProperty('--len', `${len}`);
    }
    if (gozoRef.current) {
      const len = gozoRef.current.getTotalLength();
      gozoRef.current.style.setProperty('--len', `${len}`);
    }
  }, []);

  return (
    <AnimatePresence>
      {phase < 4 ? (
        <motion.div
          key="cinematic-loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-[9999] overflow-hidden"
          style={{ background: 'hsl(240, 14%, 3%)' }}
        >
          {/* Warm ambient radial */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse 60% 55% at 50% 52%, hsla(20, 80%, 12%, 0.20) 0%, hsla(20, 60%, 5%, 0.10) 50%, transparent 100%)'
          }} />

          {/* Film grain */}
          <div className="absolute pointer-events-none" style={{
            inset: '-200px',
            width: 'calc(100% + 400px)',
            height: 'calc(100% + 400px)',
            zIndex: 1,
            opacity: 0.055,
            animation: 'grain 0.09s steps(1) infinite',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='512' height='512'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='512' height='512' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '180px 180px',
          }} />

          {/* Deep vignette */}
          <div className="absolute inset-0 pointer-events-none" style={{
            zIndex: 2,
            background: 'radial-gradient(ellipse 75% 72% at 50% 50%, transparent 0%, hsla(260, 30%, 2%, 0.52) 58%, hsla(260, 50%, 1%, 0.98) 100%)'
          }} />

          {/* Corner marks */}
          {['tl', 'tr', 'bl', 'br'].map((pos) => (
            <motion.svg
              key={pos}
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 1 ? 0.2 : 0 }}
              transition={{ duration: 2.5 }}
              className="fixed z-20"
              style={{
                width: 'clamp(22px, 2.6vw, 36px)',
                height: 'clamp(22px, 2.6vw, 36px)',
                ...(pos === 'tl' ? { top: 'clamp(18px, 2.4vw, 30px)', left: 'clamp(18px, 2.4vw, 30px)' } :
                  pos === 'tr' ? { top: 'clamp(18px, 2.4vw, 30px)', right: 'clamp(18px, 2.4vw, 30px)', transform: 'scaleX(-1)' } :
                  pos === 'bl' ? { bottom: 'clamp(18px, 2.4vw, 30px)', left: 'clamp(18px, 2.4vw, 30px)', transform: 'scaleY(-1)' } :
                  { bottom: 'clamp(18px, 2.4vw, 30px)', right: 'clamp(18px, 2.4vw, 30px)', transform: 'scale(-1,-1)' })
              }}
              viewBox="0 0 36 36"
              fill="none"
              stroke="hsla(42, 76%, 55%, 0.4)"
              strokeWidth="1"
            >
              <path d="M 0 12 L 0 0 L 12 0" />
            </motion.svg>
          ))}

          {/* Main stage */}
          <div className="fixed inset-0 z-10 flex flex-col items-center justify-center">
            {/* MALTA text above map */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : -10 }}
              transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
              className="font-display"
              style={{
                fontFamily: "'Raleway', sans-serif",
                fontWeight: 100,
                fontSize: 'clamp(10px, 1.1vw, 14px)',
                letterSpacing: '0.75em',
                textIndent: '0.75em',
                color: 'hsla(42, 40%, 60%, 0.5)',
                marginBottom: 'clamp(22px, 3.5vh, 44px)',
              }}
            >
              M &nbsp;&nbsp; A &nbsp;&nbsp; L &nbsp;&nbsp; T &nbsp;&nbsp; A
            </motion.div>

            {/* SVG Map */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{
                opacity: phase >= 1 ? 1 : 0,
                y: phase >= 1 ? 0 : 10,
                scale: phase >= 1 ? 1 : 0.97,
              }}
              transition={{ duration: 1 }}
              className="relative"
              style={{ width: 'min(520px, 58vw, 52vh)' }}
            >
              {/* Warm glow under map */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: phase >= 1 ? 1 : 0 }}
                transition={{ duration: 3.5, delay: 1 }}
                className="absolute pointer-events-none"
                style={{
                  bottom: '-18%', left: '8%', right: '8%', height: '42%',
                  background: 'radial-gradient(ellipse at 50% 0%, hsla(25, 80%, 30%, 0.16) 0%, hsla(25, 80%, 18%, 0.06) 55%, transparent 100%)',
                  filter: 'blur(32px)',
                }}
              />

              <svg
                viewBox="60 20 380 260"
                className="w-full h-auto block overflow-visible"
                style={{
                  filter: 'drop-shadow(0 28px 70px rgba(0,0,0,0.99)) drop-shadow(0 6px 18px rgba(0,0,0,0.9))',
                  animation: phase >= 2 ? 'floatMap 8s ease-in-out infinite' : 'none',
                }}
              >
                <defs>
                  <linearGradient id="luxGold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsla(42, 70%, 42%, 0.25)" />
                    <stop offset="40%" stopColor="hsla(38, 65%, 35%, 0.18)" />
                    <stop offset="100%" stopColor="hsla(30, 50%, 25%, 0.12)" />
                  </linearGradient>
                  <radialGradient id="innerGlow" cx="50%" cy="45%">
                    <stop offset="0%" stopColor="hsla(42, 76%, 55%, 0.08)" />
                    <stop offset="100%" stopColor="transparent" />
                  </radialGradient>
                </defs>

                {/* Gozo */}
                <path
                  ref={gozoRef}
                  d={GOZO_PATH}
                  className="loading-island"
                  style={{
                    fill: phase >= 2 ? 'url(#luxGold)' : 'transparent',
                    stroke: 'hsla(42, 60%, 50%, 0.55)',
                    strokeWidth: 3,
                    strokeLinejoin: 'round',
                    strokeDasharray: 'var(--len, 600)',
                    strokeDashoffset: phase >= 1 ? '0' : 'var(--len, 600)',
                    transition: 'stroke-dashoffset 2.8s cubic-bezier(0.4,0,0.2,1), fill 2.5s ease',
                  }}
                />

                {/* Malta */}
                <path
                  ref={maltaRef}
                  d={MALTA_PATH}
                  className="loading-island"
                  style={{
                    fill: phase >= 2 ? 'url(#luxGold)' : 'transparent',
                    stroke: 'hsla(42, 60%, 50%, 0.55)',
                    strokeWidth: 3,
                    strokeLinejoin: 'round',
                    strokeDasharray: 'var(--len, 1200)',
                    strokeDashoffset: phase >= 1 ? '0' : 'var(--len, 1200)',
                    transition: 'stroke-dashoffset 2.8s cubic-bezier(0.4,0,0.2,1), fill 2.5s ease',
                  }}
                />

                {/* Inner glow overlay */}
                <path d={MALTA_PATH} fill="url(#innerGlow)" style={{ opacity: phase >= 2 ? 1 : 0, transition: 'opacity 2s ease' }} />
              </svg>
            </motion.div>

            {/* Name block */}
            <div className="flex flex-col items-center" style={{ marginTop: 'clamp(28px, 4.2vh, 50px)' }}>
              {/* Top decorative rule */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: phase >= 2 ? 'min(360px, 48vw)' : 0 }}
                transition={{ duration: 2.4, ease: [0.4, 0, 0.2, 1] }}
                className="flex items-center overflow-hidden"
                style={{ gap: 'clamp(10px, 1.4vw, 18px)', marginBottom: 'clamp(14px, 2vh, 24px)' }}
              >
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, hsla(42, 55%, 45%, 0.55))' }} />
                <div className="w-1 h-1 rounded-full" style={{ background: 'hsla(42, 55%, 45%, 0.5)' }} />
                <div className="w-[5px] h-[5px] flex-shrink-0" style={{
                  background: 'hsl(42, 50%, 55%)',
                  transform: 'rotate(45deg)',
                  boxShadow: '0 0 8px hsla(42, 76%, 55%, 0.5)',
                }} />
                <div className="w-1 h-1 rounded-full" style={{ background: 'hsla(42, 55%, 45%, 0.5)' }} />
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, hsla(42, 55%, 45%, 0.55), transparent)' }} />
              </motion.div>

              {/* The name — letter by letter */}
              <div
                className="flex overflow-hidden select-none"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: 'italic',
                  fontWeight: 300,
                  fontSize: 'clamp(36px, 6.2vw, 80px)',
                  letterSpacing: '0.025em',
                  lineHeight: 1,
                  color: 'hsl(40, 25%, 90%)',
                  textShadow: '0 2px 50px rgba(0,0,0,0.9), 0 0 80px hsla(42, 76%, 55%, 0.08)',
                }}
              >
                {NAME_CHARS.map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: '100%' }}
                    animate={{
                      opacity: phase >= 2 ? 1 : 0,
                      y: phase >= 2 ? 0 : '100%',
                    }}
                    transition={{
                      duration: 0.5,
                      delay: i * 0.04,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="inline-block"
                    style={{ width: char === ' ' ? '0.22em' : undefined }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </motion.span>
                ))}
              </div>

              {/* Subtitle */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: phase >= 3 ? 1 : 0 }}
                transition={{ duration: 2.5 }}
                style={{
                  fontFamily: "'Raleway', sans-serif",
                  fontWeight: 200,
                  fontSize: 'clamp(7px, 0.76vw, 9.5px)',
                  letterSpacing: '0.52em',
                  textIndent: '0.52em',
                  color: 'hsla(42, 30%, 55%, 0.42)',
                  marginTop: 'clamp(10px, 1.5vh, 16px)',
                }}
              >
                PROPERTY MANAGEMENT · MALTA · GOZO
              </motion.div>

              {/* Bottom rule */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: phase >= 2 ? 'min(110px, 15vw)' : 0 }}
                transition={{ duration: 2, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className="h-px"
                style={{
                  background: 'linear-gradient(90deg, transparent, hsla(42, 50%, 40%, 0.32) 35%, hsla(42, 55%, 45%, 0.4) 50%, hsla(42, 50%, 40%, 0.32) 65%, transparent)',
                  marginTop: 'clamp(12px, 1.8vh, 20px)',
                }}
              />
            </div>
          </div>

          {/* Exit veil */}
          {phase >= 4 && (
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 1.5, ease: [0.76, 0, 0.24, 1] }}
              className="fixed inset-0 z-50 pointer-events-none"
              style={{ background: 'hsl(240, 14%, 3%)', transformOrigin: 'top' }}
            />
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
