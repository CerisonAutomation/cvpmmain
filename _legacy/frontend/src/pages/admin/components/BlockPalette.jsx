import { useState } from "react";
import { registry, CATEGORIES, isRenderedBlockType } from "@/lib/registry";
import { X, Loader2, Sparkles, Layout } from "lucide-react";

export const BlockPalette = ({ onAddBlock, onSuggest, suggestions, suggesting }) => {
  const [blockSearch, setBlockSearch] = useState("");

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b border-[#1a1a1e] space-y-1.5">
        <div className="relative">
          <input
            type="text"
            value={blockSearch}
            onChange={e => setBlockSearch(e.target.value)}
            placeholder="Search blocks…"
            className="w-full h-7 bg-[#0e0e10] border border-[#1a1a1e] rounded text-[10px] text-[#f0ede8] placeholder-[#4a4a4e] px-2 pr-6 focus:outline-none focus:border-[#D4AF37]/40"
          />
          {blockSearch && <button onClick={() => setBlockSearch("")} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[#4a4a4e] hover:text-[#f0ede8]"><X className="w-3 h-3" /></button>}
        </div>
        <button
          onClick={onSuggest}
          disabled={suggesting}
          className="w-full h-7 text-[9px] font-medium flex items-center justify-center gap-1.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded hover:bg-[#D4AF37]/20 disabled:opacity-50"
        >
          {suggesting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          {suggesting ? "Analyzing page…" : "AI Suggest Blocks"}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2.5">
        {(() => {
          const allBlocks = Object.values(registry);
          const searchLower = blockSearch.toLowerCase();
          const cats = [...CATEGORIES, { id: "premium", name: "Premium" }];
          return cats.map(cat => {
            const items = allBlocks.filter((s) => {
              const id = s.type;
              if (id === "header" || id === "footer") return false;
              const catMatch = (s.category || "content") === cat.id;
              const searchMatch = !searchLower || s.label?.toLowerCase().includes(searchLower) || id.includes(searchLower);
              const renderedOnly = !searchLower && !isRenderedBlockType(id);
              if (renderedOnly) return false;
              return catMatch && searchMatch;
            }).map(s => [s.type, s]);
            if (!items.length) return null;
            return (
              <div key={cat.id} className="mb-4">
                <p className="text-[8px] uppercase tracking-wider text-[#4a4a4e] mb-2 font-semibold">{cat.name}</p>
                <div className="grid grid-cols-2 gap-1">
                  {items.map(([id, s]) => {
                    const suggestion = suggestions.find(sg => sg.type === id);
                    const Icon = s.icon;
                    return (
                      <button
                        key={id}
                        onClick={() => onAddBlock(id)}
                        title={suggestion?.reason || s.label}
                        className={`relative flex flex-col items-center gap-1 p-2 rounded border group transition-all ${suggestion ? "border-[#D4AF37]/60 bg-[#D4AF37]/8" : "bg-[#0e0e10] border-[#1a1a1e] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5"}`}
                      >
                        {suggestion && <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[7px] bg-[#D4AF37] text-[#0a0a0b] px-1 rounded-full font-bold">AI</span>}
                        {Icon && <Icon className={`w-4 h-4 ${suggestion ? "text-[#D4AF37]" : "text-[#5a5a5e] group-hover:text-[#D4AF37]"}`} />}
                        <span className={`text-[8px] font-medium truncate w-full text-center ${suggestion ? "text-[#D4AF37]" : "text-[#6a6a6e] group-hover:text-[#f0ede8]"}`}>{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
};
