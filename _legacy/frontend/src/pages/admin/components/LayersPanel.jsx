import { SCHEMAS } from "@/lib/registry";
import { GripVertical, Eye, EyeOff, ArrowUp, Trash2, Layout } from "lucide-react";

export const LayersPanel = ({ blocks, selected, onSelect, onToggleVisibility, onMove, onDelete }) => {
  return (
    <div className="space-y-0.5 p-2">
      <p className="text-[8px] uppercase tracking-wider text-[#4a4a4e] mb-2 font-semibold px-1">Blocks</p>
      {blocks.map((block, idx) => {
        const schema = SCHEMAS[block.type];
        const Icon = schema?.icon || Layout;
        const isVisible = block.visible !== false;
        return (
          <div key={block.id}
            onClick={() => onSelect(block.id)}
            className={`flex items-center gap-2 p-2 rounded cursor-pointer group transition-all ${selected === block.id ? "bg-[#D4AF37]/15 text-[#D4AF37]" : "hover:bg-[#1a1a1e] text-[#6a6a6e]"}`}>
            <GripVertical className="w-3 h-3 opacity-40 cursor-grab" />
            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isVisible ? "bg-green-500" : "bg-[#3a3a3e]"}`} />
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span className="flex-1 text-[10px] font-medium truncate">{schema?.label}</span>
            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={e => { e.stopPropagation(); onToggleVisibility(block.id); }} className="p-0.5 hover:text-[#f0ede8]">{isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}</button>
              <button onClick={e => { e.stopPropagation(); onMove(idx, -1); }} disabled={idx === 0} className="p-0.5 hover:text-[#f0ede8] disabled:opacity-30"><ArrowUp className="w-3 h-3" /></button>
              <button onClick={e => { e.stopPropagation(); onDelete(block.id); }} className="p-0.5 hover:text-red-400"><Trash2 className="w-3 h-3" /></button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
