import { memo } from "react";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InlineText } from "./InlineText";

export const LiveProperties = memo(({ d, onEdit }) => (
  <section className="relative py-24 bg-[#0A0A0B] overflow-hidden">
    <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
        <div>
          <InlineText value={d.label} onChange={onEdit && (v => onEdit("label", v))} tag="span" className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-4 block font-medium" />
          <InlineText value={d.title} onChange={onEdit && (v => onEdit("title", v))} tag="h2" className="heading text-3xl md:text-4xl text-[#F5F5F0] leading-tight" />
        </div>
        <Button variant="outline" className="border-white/20 text-[#F5F5F0] hover:border-[#D4AF37] rounded-none uppercase text-sm tracking-widest px-6 py-4 w-fit">
          <InlineText value={d.ctaText} onChange={onEdit && (v => onEdit("ctaText", v))} /><ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(d.showCount || 6)].map((_, i) => (
          <div key={i} className="bg-[#161618]">
            <div className="aspect-[4/3] bg-[#27272A] flex items-center justify-center text-[#A1A1AA]">
              <MapPin className="w-8 h-8 opacity-30" />
            </div>
            <div className="p-6 space-y-2">
              <div className="h-5 bg-[#27272A] rounded w-3/4" />
              <div className="h-4 bg-[#27272A] rounded w-1/2" />
              <div className="h-4 bg-[#27272A] rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
      <p className="text-center text-[#A1A1AA] text-sm mt-8">Properties load dynamically from Guesty</p>
    </div>
  </section>
));
