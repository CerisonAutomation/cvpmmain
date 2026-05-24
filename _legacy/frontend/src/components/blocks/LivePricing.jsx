import { memo } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InlineText } from "./InlineText";

export const LivePricing = memo(({ d, onEdit, theme }) => {
  const accent = theme?.accent || "#D4AF37";
  const plans = d.plans || [];
  return (
    <section className="py-20 bg-[#0F0F10]" id="pricing">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-12">
          <InlineText value={d.label} onChange={onEdit && (v => onEdit("label", v))} className="text-xs uppercase tracking-[0.2em] text-[#A1A1AA] mb-3 block" />
          <InlineText value={d.title} onChange={onEdit && (v => onEdit("title", v))} tag="h2" className="heading text-3xl md:text-4xl text-[#F5F5F0]" />
          {d.note && <InlineText value={d.note} onChange={onEdit && (v => onEdit("note", v))} tag="p" multiline className="text-[#A1A1AA] mt-4 max-w-2xl mx-auto text-sm" />}
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <div key={i} className={`p-8 border ${plan.popular ? "border-[#D4AF37]/50 bg-[#161618]" : "border-white/10 bg-[#161618]/50"}`} style={plan.popular ? { borderColor: `${accent}80` } : {}}>
              {plan.popular && <span className="text-[10px] uppercase tracking-widest mb-4 block" style={{ color: accent }}>Most Popular</span>}
              <h3 className="heading text-2xl text-[#F5F5F0] mb-2">{plan.tier || plan.name}</h3>
              <p className="text-4xl font-semibold mb-1" style={{ color: accent }}>{plan.amount || plan.rate}</p>
              <p className="text-xs text-[#A1A1AA] mb-6">{plan.unit || plan.rateNote}</p>
              <p className="text-sm text-[#A1A1AA] mb-6">{plan.desc || plan.subtitle}</p>
              <ul className="space-y-2 mb-8">
                {(plan.features || []).map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-[#F5F5F0]">
                    <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: accent }} />
                    <span>{typeof f === "string" ? f : f.text || f}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full rounded-none uppercase text-xs tracking-widest" style={{ backgroundColor: accent, color: "#0F0F10" }}>
                {plan.cta || "Get Started"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});
