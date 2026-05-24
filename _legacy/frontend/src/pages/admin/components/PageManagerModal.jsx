import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Check, Edit3, Trash2, Plus } from "lucide-react";

export const PageManagerModal = ({ customPages, onClose, onCreatePage, onDeletePage, onRenamePage }) => {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[99999]" onClick={onClose}>
      <div className="bg-[#0a0a0b] border border-[#1a1a1e] p-6 w-full max-w-lg rounded-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#f0ede8]">Manage Pages</h3>
          <button onClick={onClose} className="p-1.5 text-[#5a5a5e] hover:text-[#f0ede8]"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-2 mb-4">
          {customPages.length === 0 && (
            <p className="text-[11px] text-[#5a5a5e] text-center py-8">No custom pages yet. Create one below.</p>
          )}
          {customPages.map(p => (
            <div key={p.id} className="bg-[#0e0e10] border border-[#1a1a1e] rounded p-3 flex items-center gap-3">
              {editingId === p.id ? (
                <div className="flex-1 flex gap-2">
                  <Input value={editName} onChange={e => setEditName(e.target.value)}
                    placeholder="Page name" className="bg-[#0a0a0b] border-[#1e1e22] text-[#f0ede8] h-7 text-[11px] flex-1" autoFocus />
                  <Input value={editSlug} onChange={e => setEditSlug(e.target.value)}
                    placeholder="/slug" className="bg-[#0a0a0b] border-[#1e1e22] text-[#f0ede8] h-7 text-[11px] flex-1" />
                  <button onClick={() => { onRenamePage(p.id, editName, editSlug); setEditingId(null); }}
                    className="px-2 py-1 text-[9px] bg-[#D4AF37] text-[#0a0a0b] rounded font-medium"><Check className="w-3 h-3" /></button>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-[#f0ede8] font-medium truncate">{p.name}</p>
                    <p className="text-[9px] text-[#5a5a5e] truncate">{p.slug}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingId(p.id); setEditName(p.name); setEditSlug(p.slug); }}
                      className="p-1.5 text-[#5a5a5e] hover:text-[#D4AF37] rounded hover:bg-[#D4AF37]/10"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => onDeletePage(p.id)}
                      className="p-1.5 text-[#5a5a5e] hover:text-red-400 rounded hover:bg-red-400/10"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        <Button onClick={() => { onCreatePage(); setEditingId(null); }}
          className="w-full bg-[#D4AF37] hover:bg-[#E5C158] text-[#0a0a0b] h-9 text-xs font-semibold">
          <Plus className="w-3.5 h-3.5 mr-1" />Create Page
        </Button>
      </div>
    </div>
  );
};
