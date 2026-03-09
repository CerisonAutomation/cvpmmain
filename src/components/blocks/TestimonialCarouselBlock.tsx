import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';
import SectionHeading from './SectionHeading';
import type { TestimonialCarouselData } from '@/lib/cms/types';

interface Props {
  data: TestimonialCarouselData;
  className?: string;
}

export default function TestimonialCarouselBlock({ data, className = '' }: Props) {
  const { heading, items } = data;
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);

  // Auto-play
  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => emblaApi.scrollNext(), 5000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  return (
    <section className={`py-16 border-t border-border/30 ${className}`}>
      <div className="section-container">
        <SectionHeading data={heading} className="mb-12" />

        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex gap-6">
            {items.map((item, i) => (
              <div key={i} className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 px-1">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="satin-surface rounded-xl p-6 h-full flex flex-col"
                >
                  <Quote size={20} className="text-primary/40 mb-3" />
                  <p className="text-sm text-foreground leading-relaxed flex-1 italic">
                    "{item.quote}"
                  </p>
                  <div className="mt-4 pt-4 border-t border-border/30">
                    {item.rating && (
                      <div className="flex gap-0.5 mb-2">
                        {Array.from({ length: item.rating }).map((_, s) => (
                          <Star key={s} size={12} className="text-primary fill-primary" />
                        ))}
                      </div>
                    )}
                    <p className="text-sm font-semibold text-foreground">{item.author}</p>
                    {item.role && <p className="text-xs text-muted-foreground">{item.role}</p>}
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        {items.length > 3 && (
          <div className="flex justify-center gap-2 mt-6">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === selectedIndex ? 'bg-primary' : 'bg-border'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
