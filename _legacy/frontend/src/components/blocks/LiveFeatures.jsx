import { memo } from "react";
import { Star, TrendingUp, Users, Sparkles, ClipboardList, Shield, Clock, Wrench, BarChart3, Calendar, Camera, Award } from "lucide-react";
import { InlineText } from "./InlineText";

const ICONS = { TrendingUp: "TrendingUp", Users: "Users", Sparkles: "Sparkles", ClipboardList: "ClipboardList", Shield: "Shield" };

const DynamicIcon = ({ name, className }) => {
  const icons = { TrendingUp, Users, Sparkles, ClipboardList, Shield, Star, Clock, Wrench, BarChart3, Calendar, Camera, Award };
  const Icon = icons[name] || Star;
  return <Icon className={className} />;
};

export const LiveFeatures = memo(({ d, onEdit }) => (
  <section className="py-24 bg-[#0F0F10]">
    <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
      <div className="text-center mb-12">
        <InlineText value={d.label} onChange={onEdit && (v => onEdit("label", v))} tag="span" className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] mb-4 block font-medium" />
        <InlineText value={d.title} onChange={onEdit && (v => onEdit("title", v))} tag="h2" className="heading text-3xl md:text-4xl text-[#F5F5F0]" />
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(d.items || []).map((f, i) => (
          <div key={i} className="bg-[#161618] p-6 border border-white/5 hover:border-[#D4AF37]/20 transition-all">
            <DynamicIcon name={f.icon} className="w-10 h-10 text-[#D4AF37] mb-4" />
            <InlineText value={f.title} onChange={onEdit && (v => { const items = [...(d.items || [])]; items[i] = { ...items[i], title: v }; onEdit("items", items); })} tag="h3" className="text-[#F5F5F0] font-semibold mb-2" />
            <InlineText value={f.desc} onChange={onEdit && (v => { const items = [...(d.items || [])]; items[i] = { ...items[i], desc: v }; onEdit("items", items); })} tag="p" multiline className="text-[#A1A1AA] text-sm leading-relaxed" />
          </div>
        ))}
      </div>
    </div>
  </section>
));
