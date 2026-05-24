import { memo } from "react";
import { HeartHandshake, Building, Home, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InlineText } from "./InlineText";

export const LiveCTA = memo(({ d, onEdit }) => (
  <section className="relative py-24 bg-[#0A0A0B] overflow-hidden">
    <div className="absolute inset-0 opacity-5">
      <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, #D4AF37 1px, transparent 0)`, backgroundSize: '40px 40px' }} />
    </div>
    <div className="relative max-w-4xl mx-auto px-6 md:px-12 lg:px-20 text-center">
      <HeartHandshake className="w-16 h-16 text-[#D4AF37] mx-auto mb-8" />
      <InlineText value={d.title} onChange={onEdit && (v => onEdit("title", v))} tag="h2" className="heading text-3xl md:text-4xl text-[#F5F5F0] mb-6 leading-tight" />
      <InlineText value={d.subtitle} onChange={onEdit && (v => onEdit("subtitle", v))} tag="p" multiline className="text-[#A1A1AA] text-lg mb-10 max-w-2xl mx-auto leading-relaxed" />
      <div className="flex flex-wrap gap-4 justify-center">
        <Button className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] rounded-none uppercase text-sm tracking-widest px-8 py-6 font-semibold">
          <Building className="w-4 h-4 mr-2" /><InlineText value={d.cta1Text} onChange={onEdit && (v => onEdit("cta1Text", v))} />
        </Button>
        <Button variant="outline" className="border-white/30 text-[#F5F5F0] hover:border-[#D4AF37] rounded-none uppercase text-sm tracking-widest px-8 py-6">
          <Home className="w-4 h-4 mr-2" /><InlineText value={d.cta2Text} onChange={onEdit && (v => onEdit("cta2Text", v))} />
        </Button>
      </div>
      {d.showContact && (
        <div className="mt-16 pt-8 border-t border-white/5">
          <p className="text-[#A1A1AA] mb-4">Or reach us directly</p>
          <div className="flex flex-wrap justify-center gap-6">
            <span className="flex items-center gap-2 text-[#F5F5F0]"><Phone className="w-4 h-4" />+356 7979 0202</span>
            <span className="flex items-center gap-2 text-[#F5F5F0]"><Mail className="w-4 h-4" />info@christianopropertymanagement.com</span>
          </div>
        </div>
      )}
    </div>
  </section>
));
