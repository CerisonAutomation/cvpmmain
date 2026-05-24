import { memo } from "react";

export const LiveDivider = memo(({ d }) => (
  <div className="py-4 bg-[#0F0F10]">
    <div className="max-w-4xl mx-auto" style={d.style === "gradient" ? { background: `linear-gradient(to right, transparent, #D4AF37, transparent)`, height: 1 } : d.style === "dots" ? { backgroundImage: `radial-gradient(circle, #D4AF37 1px, transparent 1px)`, backgroundSize: "8px 8px", height: 4 } : { borderTop: `1px ${d.style || "solid"} rgba(255,255,255,0.1)` }} />
  </div>
));
