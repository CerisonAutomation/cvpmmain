import { memo, useState, useEffect, useCallback } from "react";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { InlineText } from "./InlineText";

export const LiveTestimonials = memo(({ d, onEdit }) => {
  const items = d.items || [];
  const [activeIndex, setActiveIndex] = useState(0);

  const next = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (items.length < 2) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [items.length, next]);

  if (items.length === 0) return null;

  const item = items[activeIndex];

  return (
    <section className="relative py-24 bg-[#0F0F10] overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="text-center mb-16">
          <InlineText value={d.label} onChange={onEdit && (v => onEdit("label", v))} tag="span" className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-4 block font-medium" />
          <InlineText value={d.title} onChange={onEdit && (v => onEdit("title", v))} tag="h2" className="heading text-3xl md:text-4xl text-[#F5F5F0]" />
        </div>
        <div className="relative bg-[#161618] border border-white/5 p-8 md:p-12">
          <Quote className="absolute top-8 left-8 w-12 h-12 text-[#D4AF37]/20" />
          <div className="relative z-10">
            <div className="flex gap-1 mb-6 justify-center">
              {[...Array(5)].map((_, j) => (
                <Star key={j} className={`w-5 h-5 ${j < (item.rating || 5) ? "text-[#D4AF37] fill-[#D4AF37]" : "text-[#A1A1AA]"}`} />
              ))}
            </div>
            <InlineText value={item.text} onChange={onEdit && (v => { const items = [...(d.items || [])]; items[activeIndex] = { ...items[activeIndex], text: v }; onEdit("items", items); })} tag="blockquote" multiline className="text-lg md:text-xl text-[#F5F5F0] text-center mb-8 leading-relaxed max-w-3xl mx-auto" />
            <div className="text-center">
              <InlineText value={item.name} onChange={onEdit && (v => { const items = [...(d.items || [])]; items[activeIndex] = { ...items[activeIndex], name: v }; onEdit("items", items); })} tag="p" className="text-[#F5F5F0] font-semibold" />
              {item.date && <InlineText value={item.date} onChange={onEdit && (v => { const items = [...(d.items || [])]; items[activeIndex] = { ...items[activeIndex], date: v }; onEdit("items", items); })} tag="p" className="text-[#A1A1AA] text-sm" />}
            </div>
          </div>

          {items.length > 1 && (
            <>
              <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border border-white/10 hover:border-[#D4AF37]/50 text-[#A1A1AA] hover:text-[#D4AF37] transition-all">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border border-white/10 hover:border-[#D4AF37]/50 text-[#A1A1AA] hover:text-[#D4AF37] transition-all">
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {items.length > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === activeIndex ? "bg-[#D4AF37] w-6" : "bg-white/20 hover:bg-white/40"}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
});
