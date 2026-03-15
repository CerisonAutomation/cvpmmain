import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import SectionHeading from './SectionHeading';
import type { TestimonialCarouselData } from '@/lib/cms/types';

interface Props {
  data: TestimonialCarouselData;
  className?: string;
}

export default function TestimonialCarouselBlock({ data, className = '' }: Props) {
  // Field is `testimonials` in TestimonialCarouselData — not `items`
  const { testimonials = [] } = data;
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  const stopAutoplay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const startAutoplay = useCallback(() => {
    if (!emblaApi) return;
    stopAutoplay();
    timerRef.current = setInterval(() => emblaApi.scrollNext(), 5000);
  }, [emblaApi, stopAutoplay]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, [startAutoplay, stopAutoplay]);

  if (!testimonials.length) return null;

  return (
    <section
      className={`py-16 border-t border-border/30 ${className}`}
      onMouseEnter={stopAutoplay}
      onMouseLeave={startAutoplay}
      onFocus={stopAutoplay}
      onBlur={startAutoplay}
    >
      <div className="section-container">
        <SectionHeading data={{ ...data, heading: data.heading || '' }} className="mb-12" />

        <div ref={emblaRef} className="overflow-hidden" aria-roledescription="carousel">
          <div className="flex gap-6">
            {testimonials.map((item, i) => (
              <div
                key={i}
                role="group"
                aria-roledescription="slide"
                aria-label={`Testimonial ${i + 1} of ${testimonials.length}`}
                className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 px-1"
              >
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="satin-surface rounded-xl p-6 h-full flex flex-col"
                >
                  <Quote size={20} className="text-primary/40 mb-3" aria-hidden />
                  <p className="text-sm text-foreground leading-relaxed flex-1 italic">
                    &ldquo;{item.text}&rdquo;
                  </p>
                  <div className="mt-4 pt-4 border-t border-border/30">
                    {item.rating && (
                      <div className="flex gap-0.5 mb-2" aria-label={`${item.rating} stars`}>
                        {Array.from({ length: item.rating }).map((_, s) => (
                          <Star key={s} size={12} className="text-primary fill-primary" aria-hidden />
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

        {/* Dots — show only when more slides than visible */}
        {testimonials.length > 1 && (
          <div className="flex justify-center gap-2 mt-6" role="tablist" aria-label="Carousel navigation">
            {testimonials.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === selectedIndex}
                aria-label={`Go to slide ${i + 1}`}
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
