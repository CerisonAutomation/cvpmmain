import { memo } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InlineText } from "./InlineText";

export const LiveAbout = memo(({ d, onEdit }) => (
  <section className="relative py-24 bg-[#0F0F10] overflow-hidden">
    <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="order-2 lg:order-1">
          <InlineText value={d.label} onChange={onEdit && (v => onEdit("label", v))} tag="span" className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-4 block font-medium" />
          <h2 className="heading text-3xl md:text-4xl text-[#F5F5F0] mb-8 leading-tight">
            <InlineText value={d.title} onChange={onEdit && (v => onEdit("title", v))} tag="span" />{" "}
            <InlineText value={d.titleAccent} onChange={onEdit && (v => onEdit("titleAccent", v))} tag="span" className="italic" />
          </h2>
          <div className="space-y-6 text-[#A1A1AA] leading-relaxed">
            {(d.paragraphs || []).map((p, i) => (
              <InlineText key={i} value={p.text} onChange={onEdit && (v => { const paragraphs = [...(d.paragraphs || [])]; paragraphs[i] = { ...paragraphs[i], text: v }; onEdit("paragraphs", paragraphs); })} tag="p" multiline />
            ))}
          </div>
          <div className="flex gap-4 mt-8">
            <Button variant="outline" className="border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0F0F10] rounded-none uppercase text-sm tracking-widest px-6 py-4">
              <MessageCircle className="w-4 h-4 mr-2" /><InlineText value={d.ctaText} onChange={onEdit && (v => onEdit("ctaText", v))} />
            </Button>
          </div>
        </div>
        <div className="order-1 lg:order-2 relative">
          <div className="aspect-[4/3] overflow-hidden bg-[#161618]">
            <img src={d.image || "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/img_7990-standard.jpg"} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-4 -left-4 w-24 h-24 border-2 border-[#D4AF37]/30 hidden lg:block" />
        </div>
      </div>
    </div>
  </section>
));
