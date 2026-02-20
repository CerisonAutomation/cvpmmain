import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import maltaLoading from '@/assets/malta-loading.jpg';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 600);
    const t2 = setTimeout(() => setPhase('out'), 2200);
    const t3 = setTimeout(() => onComplete(), 2900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'out' ? (
        <motion.div
          key="loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[hsl(220,20%,4%)]"
        >
          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[hsl(42,76%,55%)] opacity-[0.04] rounded-full blur-[120px]" />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex flex-col items-center"
          >
            {/* Malta map image */}
            <div className="relative w-72 sm:w-96 mb-6">
              <img
                src={maltaLoading}
                alt="Malta — Christiano Vincenti Property Management"
                className="w-full object-contain drop-shadow-2xl"
                style={{ filter: 'drop-shadow(0 0 40px hsla(42,76%,55%,0.35))' }}
              />
            </div>

            {/* Subtle loading bar */}
            <motion.div
              className="w-24 h-px bg-[hsl(220,15%,20%)] relative overflow-hidden rounded-full mt-2"
            >
              <motion.div
                className="absolute inset-y-0 left-0 bg-[hsl(42,76%,55%)]"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, ease: 'easeInOut' }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
