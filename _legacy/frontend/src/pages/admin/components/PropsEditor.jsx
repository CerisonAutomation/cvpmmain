import { memo } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getBlock } from "@/lib/registry";
import { Plus, Trash2, MousePointer, Sparkles, Wand2 } from "lucide-react";

export const BlockInspector = memo(({ block, onUpdate, onAI, isGenerating }) => {
  const def = getBlock(block?.type);
  const schema = def ? { label: def.label, icon: def.icon, fields: def.schema } : null;
  if (!block || !schema) return (
    <div className="flex flex-col items-center justify-center h-full text-[#5a5a5e] text-xs p-6">
      <MousePointer className="w-10 h-10 mb-4 opacity-30" />
      <p className="text-center">Select a block on the canvas to edit</p>
    </div>
  );

  const renderField = (key, f, val) => {
    const common = "h-9 text-xs bg-[#0a0a0b] border-[#1e1e22] text-[#f0ede8] focus:border-[#D4AF37]/50";
    if (f.type === "array") {
      const items = val || [];
      return (
        <div key={key} className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-[#5a5a5e] font-medium">{f.label}</span>
            <button onClick={() => onUpdate(key, [...items, {}])} className="p-1 text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded"><Plus className="w-3.5 h-3.5" /></button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {items.map((item, i) => (
              <div key={i} className="p-2.5 bg-[#08080a] border border-[#1e1e22] rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] text-[#4a4a4e]">#{i + 1}</span>
                  <button onClick={() => onUpdate(key, items.filter((_, idx) => idx !== i))} className="p-0.5 text-red-400/60 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
                </div>
                {(f.itemFields || []).map(sf => (
                  <Input key={sf} value={item[sf] || ""} onChange={e => { const n = [...items]; n[i] = { ...n[i], [sf]: e.target.value }; onUpdate(key, n); }} placeholder={sf} className={`${common} h-7 text-[10px] mb-1`} />
                ))}
              </div>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div key={key} className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase tracking-wider text-[#5a5a5e] font-medium">{f.label}</span>
          {(f.ai || def?.aiFields?.includes(key)) && <button type="button" onClick={() => onAI(key, f.label)} disabled={isGenerating} className="p-1 text-[#D4AF37]/60 hover:text-[#D4AF37] transition-colors" aria-label={`AI generate ${f.label}`}><Sparkles className="w-3 h-3" /></button>}
        </div>
        {f.type === "textarea" ? <Textarea value={val || ""} onChange={e => onUpdate(key, e.target.value)} className={`${common} min-h-[70px] resize-none`} />
        : f.type === "select" ? <select value={val || f.options?.[0]} onChange={e => onUpdate(key, e.target.value)} className={`${common} w-full rounded-md px-3`}>{(f.options || []).map(o => <option key={o} value={o}>{o}</option>)}</select>
        : f.type === "number" ? <Input type="number" value={val || 0} onChange={e => onUpdate(key, parseInt(e.target.value) || 0)} className={common} />
        : f.type === "boolean" ? <input type="checkbox" checked={!!val} onChange={e => onUpdate(key, e.target.checked)} className="w-5 h-5 accent-[#D4AF37]" />
        : <Input value={val || ""} onChange={e => onUpdate(key, e.target.value)} className={common} />}
      </div>
    );
  };

  const Icon = schema.icon;
  return (
    <div>
      <div className="flex items-center gap-3 p-4 border-b border-[#1e1e22]">
        <div className="w-9 h-9 rounded bg-[#D4AF37]/15 flex items-center justify-center"><Icon className="w-5 h-5 text-[#D4AF37]" /></div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-[#f0ede8] block truncate">{schema.label}</span>
          <span className="text-[9px] text-[#4a4a4e]">key: {block.type}</span>
        </div>
        <button onClick={() => onAI("_all", "all")} disabled={isGenerating} className="px-2.5 py-1.5 text-[9px] bg-[#D4AF37]/10 text-[#D4AF37] rounded hover:bg-[#D4AF37]/20 font-medium flex items-center gap-1">
          <Wand2 className="w-3 h-3" />{isGenerating ? "..." : "AI All"}
        </button>
      </div>
      <div className="p-4">{Object.entries(schema.fields).map(([k, f]) => renderField(k, f, block.data[k]))}</div>
    </div>
  );
});

export const PropsEditor = BlockInspector;
