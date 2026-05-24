import { memo } from "react";
import { InlineText } from "./InlineText";

export const LiveStats = memo(({ d, onEdit }) => (
  <section className="py-8 bg-[#0F0F10] border-y border-white/5">
    <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
      <div className={`flex flex-wrap items-center justify-center gap-8 md:gap-16 ${d.style === "grid" ? "grid grid-cols-2 md:grid-cols-4" : ""}`}>
        {(d.items || []).map((s, i) => (
          <div key={i} className={`${d.style === "grid" ? "text-center" : "flex items-center gap-3"}`}>
            <InlineText value={s.value} onChange={onEdit && (v => { const items = [...(d.items || [])]; items[i] = { ...items[i], value: v }; onEdit("items", items); })} tag="span" className="heading text-3xl text-[#D4AF37]" />
            <InlineText value={s.label} onChange={onEdit && (v => { const items = [...(d.items || [])]; items[i] = { ...items[i], label: v }; onEdit("items", items); })} tag="span" className="text-sm text-[#A1A1AA]" />
          </div>
        ))}
      </div>
    </div>
  </section>
));
