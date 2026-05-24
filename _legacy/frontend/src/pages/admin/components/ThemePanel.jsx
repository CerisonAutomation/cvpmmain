import { useState } from "react";
import { COLOR_PRESETS, FONT_PAIRS } from "@/lib/registry";
import { Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { API } from "@/lib/api";
import { useCMS } from "@/context/CMSContext";

export const ThemePanel = ({ pageSlug = "home" }) => {
  const { token } = useCMS();
  const [activeColorPreset, setActiveColorPreset] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("cvpm_dark_mode") === "1");

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("cvpm_dark_mode", next ? "1" : "0");
    document.documentElement.classList.toggle("dark", next);
  };

  const generateTheme = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`${API}/ai/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          prompt: `Suggest a luxury property management color palette and font pairing for page "${pageSlug}". Reply as JSON: {"name":"...","colorPreset":"gold-noir","fontPair":"playfair-manrope","primary":"#hex","accent":"#hex","reasoning":"short reason"}`,
          section: "theme"
        })
      });
      const data = await res.json();
      const raw = typeof data.content === "string" ? data.content : JSON.stringify(data.content);
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) { const theme = JSON.parse(match[0]); toast.success(`AI Theme: ${theme.name || "Generated"} — ${theme.reasoning || ""}`); }
    } catch { toast.error("Theme generation failed"); }
    setGenerating(false);
  };

  return (
    <div className="p-4 space-y-5">
      <button type="button" onClick={toggleDark} className="w-full py-2 text-xs border border-[#1a1a1e] rounded text-[#A1A1AA] hover:border-[#D4AF37]/40">
        {darkMode ? "Light mode preview" : "Dark mode preview"}
      </button>
      <div>
        <p className="text-[9px] uppercase tracking-widest text-[#4a4a4e] font-semibold mb-3">Color Presets</p>
        <div className="grid grid-cols-4 gap-2">
          {(COLOR_PRESETS || []).map((preset, i) => (
            <button
              key={i}
              onClick={() => setActiveColorPreset(preset)}
              title={preset.name || `Preset ${i + 1}`}
              className={`aspect-square rounded overflow-hidden border-2 transition-all ${activeColorPreset === preset ? "border-[#D4AF37]" : "border-transparent hover:border-[#D4AF37]/40"}`}
              style={{ background: `linear-gradient(135deg, ${preset.primary || preset.accent || "#D4AF37"}, ${preset.secondary || preset.bg || "#0F0F10"})` }}
            >
              <span className="sr-only">{preset.name}</span>
            </button>
          ))}
        </div>
        {activeColorPreset && (
          <div className="mt-3 p-2.5 bg-[#0e0e10] border border-[#1a1a1e] rounded">
            <p className="text-[9px] text-[#D4AF37] font-semibold mb-1">{activeColorPreset.name}</p>
            <div className="flex gap-1.5 flex-wrap">
              {Object.entries(activeColorPreset).filter(([k]) => k !== "name").map(([k, v]) => (
                <span key={k} className="text-[8px] text-[#5a5a5e]">{k}: <span className="text-[#f0ede8]">{v}</span></span>
              ))}
            </div>
          </div>
        )}
      </div>
      <div>
        <p className="text-[9px] uppercase tracking-widest text-[#4a4a4e] font-semibold mb-3">Font Pairs</p>
        <div className="space-y-2">
          {(FONT_PAIRS || []).map((pair, i) => (
            <button key={i} className="w-full text-left p-2.5 bg-[#0e0e10] border border-[#1a1a1e] rounded hover:border-[#D4AF37]/40 transition-all group">
              <p className="text-[10px] text-[#f0ede8] font-medium group-hover:text-[#D4AF37]" style={{ fontFamily: pair.heading }}>{pair.name || `Pair ${i + 1}`}</p>
              <p className="text-[8px] text-[#5a5a5e] mt-0.5" style={{ fontFamily: pair.body }}>{pair.heading} + {pair.body}</p>
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={generateTheme}
        disabled={generating}
        className="w-full h-9 text-[9px] font-medium flex items-center justify-center gap-1.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded hover:bg-[#D4AF37]/20 disabled:opacity-50"
      >
        {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
        Generate AI Theme
      </button>
    </div>
  );
};
