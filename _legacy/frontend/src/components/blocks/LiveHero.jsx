import { memo } from "react";
import { ChevronRight, Building, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InlineText } from "./InlineText";

export const LiveHero = memo(({ d, onEdit }) => (
  <section className="relative min-h-[500px] flex items-center overflow-hidden bg-[#0F0F10]">
    <div className="absolute inset-0">
      <img src={d.backgroundImage || "https://images.unsplash.com/photo-1771218830084-fdd272e149a1?w=1920&q=80"} alt="" className="w-full h-full object-cover" />
    </div>
    <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F10] via-[#0F0F10]/50 to-transparent" />
    <div className="absolute inset-0 bg-gradient-to-r from-[#0F0F10]/60 to-transparent" />
    <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16">
      <div className="max-w-3xl">
        <div className="inline-block px-4 py-2 border border-[#D4AF37]/30 bg-[#D4AF37]/5 mb-6">
          <InlineText value={d.badge} onChange={onEdit && (v => onEdit("badge", v))} className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-medium" />
        </div>
        <h1 className="heading text-4xl md:text-5xl text-[#F5F5F0] mb-6 leading-[1.05]">
          <InlineText value={d.headline} onChange={onEdit && (v => onEdit("headline", v))} tag="span" />
          <br />
          <InlineText value={d.headlineAccent || d.headlineSub} onChange={onEdit && (v => onEdit("headlineAccent", v))} tag="span" className="italic" style={{ background: "linear-gradient(135deg, #D4AF37, #E5C158)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }} />
        </h1>
        <InlineText value={d.subheadline} onChange={onEdit && (v => onEdit("subheadline", v))} tag="p" multiline className="text-lg text-[#A1A1AA] mb-10 max-w-2xl leading-relaxed" />
        <div className="flex flex-wrap gap-4 mb-12">
          <Button className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] rounded-none uppercase text-sm tracking-[0.15em] px-8 py-6 font-semibold">
            <Building className="w-4 h-4 mr-2" />
            <InlineText value={d.cta1Text || d.cta1} onChange={onEdit && (v => onEdit("cta1Text", v))} />
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
          <Button variant="outline" className="border-white/30 text-[#F5F5F0] hover:border-[#D4AF37] rounded-none uppercase text-sm tracking-[0.15em] px-8 py-6">
            <Home className="w-4 h-4 mr-2" />
            <InlineText value={d.cta2Text || d.cta2} onChange={onEdit && (v => onEdit("cta2Text", v))} />
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-8 md:gap-12">
          {(d.stats || []).map((stat, i) => (
            <div key={i} className="flex items-center gap-3">
              <InlineText value={stat.value} onChange={onEdit && (v => { const stats = [...(d.stats || [])]; stats[i] = { ...stats[i], value: v }; onEdit("stats", stats); })} tag="span" className="heading text-3xl text-[#D4AF37]" />
              <InlineText value={stat.label} onChange={onEdit && (v => { const stats = [...(d.stats || [])]; stats[i] = { ...stats[i], label: v }; onEdit("stats", stats); })} tag="span" className="text-sm text-[#A1A1AA] leading-tight" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
));
