import { memo } from "react";
import { InlineText } from "./InlineText";

export const LiveText = memo(({ d, onEdit }) => (
  <div className="py-8 bg-[#0F0F10]">
    <div className="max-w-4xl mx-auto px-6 md:px-12 lg:px-20" style={{ textAlign: d.align || "left" }}>
      <InlineText value={d.content} onChange={onEdit && (v => onEdit("content", v))} tag="p" multiline className={`text-[#A1A1AA] leading-relaxed ${d.size === "sm" ? "text-sm" : d.size === "lg" ? "text-lg" : d.size === "xl" ? "text-xl" : "text-base"}`} />
    </div>
  </div>
));
