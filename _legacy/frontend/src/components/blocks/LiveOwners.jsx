import { memo } from "react";
import { Check, ArrowRight, Star, TrendingUp, Users, Sparkles, ClipboardList, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InlineText } from "./InlineText";

const ICONS_MAP = { TrendingUp: "TrendingUp", Users: "Users", Sparkles: "Sparkles", ClipboardList: "ClipboardList", Shield: "Shield" };

const DynamicIcon = ({ name, className }) => {
  const icons = { TrendingUp, Users, Sparkles, ClipboardList, Shield, Star };
  const Icon = icons[name] || Star;
  return <Icon className={className} />;
};

export const LiveOwners = memo(({ d, onEdit }) => (
  <section className="relative py-24 bg-[#0A0A0B] overflow-hidden">
    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#D4AF37]/5 to-transparent pointer-events-none" />
    <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div>
          <InlineText value={d.label} onChange={onEdit && (v => onEdit("label", v))} tag="span" className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-4 block font-medium" />
          <h2 className="heading text-3xl md:text-4xl text-[#F5F5F0] mb-6 leading-tight">
            <InlineText value={d.title} onChange={onEdit && (v => onEdit("title", v))} tag="span" />{" "}
            <InlineText value={d.titleAccent} onChange={onEdit && (v => onEdit("titleAccent", v))} tag="span" style={{ background: "linear-gradient(135deg, #D4AF37, #E5C158)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }} />
          </h2>
          <InlineText value={d.description} onChange={onEdit && (v => onEdit("description", v))} tag="p" multiline className="text-[#A1A1AA] text-lg mb-8 leading-relaxed" />
          <ul className="space-y-4 mb-8">
            {(d.benefits || []).map((item, i) => (
              <li key={i} className="flex items-center gap-3 group">
                <div className="w-6 h-6 bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0"><Check className="w-4 h-4 text-[#D4AF37]" /></div>
                <InlineText value={item.text} onChange={onEdit && (v => { const benefits = [...(d.benefits || [])]; benefits[i] = { ...benefits[i], text: v }; onEdit("benefits", benefits); })} tag="span" className="text-[#F5F5F0]" />
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-4">
            <Button className="bg-[#D4AF37] text-[#0F0F10] hover:bg-[#E5C158] rounded-none uppercase text-sm tracking-widest px-8 py-4 font-semibold">
              <InlineText value={d.cta1Text} onChange={onEdit && (v => onEdit("cta1Text", v))} /><ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" className="border-white/20 text-[#F5F5F0] hover:border-[#D4AF37] rounded-none uppercase text-sm tracking-widest px-8 py-4">
              <InlineText value={d.cta2Text} onChange={onEdit && (v => onEdit("cta2Text", v))} />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {(d.services || []).map((item, i) => (
            <div key={i} className="bg-[#161618] p-6 border border-white/5 hover:border-[#D4AF37]/20 transition-all">
              <DynamicIcon name={item.icon} className="w-8 h-8 text-[#D4AF37] mb-4" />
              <InlineText value={item.label} onChange={onEdit && (v => { const services = [...(d.services || [])]; services[i] = { ...services[i], label: v }; onEdit("services", services); })} tag="p" className="text-[#F5F5F0] font-semibold mb-1" />
              <InlineText value={item.desc} onChange={onEdit && (v => { const services = [...(d.services || [])]; services[i] = { ...services[i], desc: v }; onEdit("services", services); })} tag="p" className="text-[#A1A1AA] text-sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
));
