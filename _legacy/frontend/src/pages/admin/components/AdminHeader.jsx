import { Undo2, Redo2, ExternalLink, Key, Save, LogOut, Monitor, Tablet, Smartphone, Settings, Loader2, RotateCcw } from "lucide-react";

const VIEW_ICONS = { desktop: Monitor, tablet: Tablet, mobile: Smartphone };

export const AdminHeader = ({
  page, pages, customPages, view, undo, redo, saving, resetting,
  onPageChange, onViewChange, onUndo, onRedo, onSave, onReset, onPreview, onShowKeys, onLogout, onShowPageManager,
  showGlobal, onGlobal,
}) => {
  return (
    <header className="h-12 bg-[#0a0a0b] border-b border-[#1a1a1e] flex items-center px-4 gap-2 shrink-0">
      <div className="flex items-center gap-2 pr-3 border-r border-[#1a1a1e]">
        <div className="w-7 h-7 bg-gradient-to-br from-[#D4AF37] to-[#a08550] flex items-center justify-center font-bold text-sm rounded text-[#0a0a0b]">C</div>
        <span className="text-[#f0ede8] text-sm font-semibold hidden sm:block">Studio <em className="text-[#D4AF37] not-italic font-normal">Pro</em></span>
      </div>

      {pages.map(p => (
        <button key={p} onClick={() => onPageChange(p)}
          className={`px-2.5 py-1.5 text-[10px] font-medium rounded transition-all ${page === p ? "bg-[#D4AF37]/15 text-[#D4AF37]" : "text-[#6a6a6e] hover:text-[#f0ede8]"}`}>
          {p.charAt(0).toUpperCase() + p.slice(1)}
        </button>
      ))}
      {customPages.map(p => (
        <button key={p.id} onClick={() => onPageChange(p.id)}
          className={`px-2.5 py-1.5 text-[10px] font-medium rounded transition-all ${page === p.id ? "bg-[#D4AF37]/15 text-[#D4AF37]" : "text-[#6a6a6e] hover:text-[#f0ede8]"}`}>
          {p.name}
        </button>
      ))}
      <button onClick={onShowPageManager}
        className="px-2 py-1.5 text-[9px] text-[#5a5a5e] hover:text-[#D4AF37] border border-dashed border-[#2a2a2e] rounded" title="Manage Pages">
        <Settings className="w-3 h-3 inline mr-1" />Pages
      </button>
      {showGlobal && (
        <button onClick={onGlobal}
          className={`px-2.5 py-1.5 text-[10px] font-medium rounded transition-all border ${page === "global" ? "bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/30" : "text-[#6a6a6e] hover:text-[#D4AF37] border-[#2a2a2e]"}`}
          title="Edit global site settings (header, footer, modals)">
          ⚙ Global
        </button>
      )}

      <div className="flex-1" />

      <div className="flex items-center gap-1 border-r border-[#1a1a1e] pr-2 mr-2">
        {Object.entries(VIEW_ICONS).map(([key, Icon]) => (
          <button key={key} onClick={() => onViewChange(key)}
            className={`p-1.5 rounded ${view === key ? "bg-[#D4AF37]/15 text-[#D4AF37]" : "text-[#5a5a5e] hover:text-[#f0ede8]"}`}>
            <Icon className="w-3.5 h-3.5" />
          </button>
        ))}
      </div>

      <button onClick={onUndo} disabled={!undo.length}
        className="p-1.5 text-[#6a6a6e] hover:text-[#f0ede8] disabled:opacity-30 rounded hover:bg-[#1a1a1e]" title="Undo">
        <Undo2 className="w-3.5 h-3.5" />
      </button>
      <button onClick={onRedo} disabled={!redo.length}
        className="p-1.5 text-[#6a6a6e] hover:text-[#f0ede8] disabled:opacity-30 rounded hover:bg-[#1a1a1e]" title="Redo">
        <Redo2 className="w-3.5 h-3.5" />
      </button>
      <button onClick={onReset} disabled={resetting}
        className="p-1.5 text-[#6a6a6e] hover:text-amber-400 disabled:opacity-30 rounded hover:bg-amber-400/10" title="Reset to published version">
        {resetting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
      </button>

      <div className="w-px h-5 bg-[#1a1a1e] mx-1" />

      <button onClick={onPreview} className="p-1.5 text-[#6a6a6e] hover:text-[#f0ede8] rounded hover:bg-[#1a1a1e]" title="Preview">
        <ExternalLink className="w-3.5 h-3.5" />
      </button>
      <button onClick={onShowKeys} className="p-1.5 text-[#6a6a6e] hover:text-[#f0ede8] rounded hover:bg-[#1a1a1e]" title="API Keys">
        <Key className="w-3.5 h-3.5" />
      </button>

      <button onClick={onSave} disabled={saving}
        className="ml-2 px-3 py-1.5 text-[10px] bg-[#D4AF37] text-[#0a0a0b] font-semibold rounded hover:bg-[#E5C158] flex items-center gap-1.5">
        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
        Publish
      </button>

      <button onClick={onLogout} className="p-1.5 text-[#6a6a6e] hover:text-red-400 rounded hover:bg-red-400/10 ml-1" title="Logout">
        <LogOut className="w-3.5 h-3.5" />
      </button>
    </header>
  );
};
