import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCMS } from "@/context/CMSContext";
import { SCHEMAS, registry, PAGE_CONFIGS } from "@/lib/registry";
import { toast } from "sonner";
import { Plus, Layers, Command, X, Check } from "lucide-react";

import { useAdminBlocks, useAdminAuth, useAdminPublish } from "@/pages/admin/hooks";
import {
  AdminHeader, AIAssistant, JSONEditor, PropsEditor, BlockPalette,
  LayersPanel, Canvas, ThemePanel, SEOPanel, LoginScreen, PageManagerModal, VersionsPanel,
  GlobalSettingsPanel,
} from "@/pages/admin/components";

import { API } from "@/lib/api";
import { wsManager } from "@/lib/websocket";
import axios from "axios";
const BUILT_IN_PAGES = ["home", "owners", "properties", "about", "contact"];
const TAB_ICONS = { blocks: Plus, layers: Layers };

const ServiceStatus = ({ label, status }) => {
  const color = status === "connected" || status === "configured" ? "text-green-500" : "text-red-500";
  const icon = status === "connected" || status === "configured" ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />;
  return (
    <div>
      <p className="text-[11px] text-[#5a5a5e] mb-1">{label}</p>
      <span className={`text-[10px] ${color} flex items-center gap-1`}>{icon}{status || "unknown"}</span>
    </div>
  );
};

export default function AdminPage() {
  const navigate = useNavigate();
  const { cms } = useCMS();
  const { isAdmin, isLoading, token, handleLogin, handleLogout } = useAdminAuth();

  const [page, setPage] = useState("home");
  const [leftTab, setLeftTab] = useState("blocks");
  const [rightTab, setRightTab] = useState("props");
  const [view, setView] = useState("desktop");
  const [zoom, setZoom] = useState(75);
  const [selected, setSelected] = useState(null);
  const [customPages, setCustomPages] = useState(
    JSON.parse(localStorage.getItem("cvpm_custom_pages") || "[]")
  );
  const [pageSeoLocal, setPageSeoLocal] = useState({ title: "", description: "", canonical: "", ogImage: "", noindex: false });
  const [generating, setGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggesting, setSuggesting] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
  const [showPageManager, setShowPageManager] = useState(false);
  const [health, setHealth] = useState(null);
  const [loginPassword, setLoginPassword] = useState("");

  useEffect(() => {
    if (isAdmin) {
      const hdrs = { headers: { Authorization: `Bearer ${token}` } };
      fetch(`${API}/admin/health`, hdrs)
        .then(r => r.json())
        .then(setHealth)
        .catch(() => setHealth(null));
      const interval = setInterval(() => {
        fetch(`${API}/admin/health`, hdrs)
          .then(r => r.json())
          .then(setHealth)
          .catch(() => {});
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isAdmin, token]);

  useEffect(() => {
    if (!isAdmin || !token) return;
    wsManager.connect("Admin");
    wsManager.startPolling(async () => {
      const res = await axios.get(`${API}/cms/pages/${page}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    });
    const unsub = wsManager.on("draft_sync", () => {});
    const unsubPoll = wsManager.on("fallback_polling", () => {
      toast.info("Using draft polling (WebSocket unavailable on serverless)");
    });
    return () => {
      unsub?.();
      unsubPoll?.();
      wsManager.stopPolling();
    };
  }, [isAdmin, token, page]);

  const [resetting, setResetting] = useState(false);

  const {
    blocks, undo, redo,
    doUndo, doRedo,
    updateBlock, addBlock, deleteBlock, duplicateBlock,
    moveBlock, onDragEnd, toggleVisibility, resetBlocks,
  } = useAdminBlocks(page, customPages, setCustomPages);

  const handleReset = useCallback(async () => {
    if (!window.confirm("Discard unsaved changes and reload from published version?")) return;
    setResetting(true);
    await resetBlocks();
    setResetting(false);
    toast.success("Reset to published version");
  }, [resetBlocks]);

  const { saving, saveAll, saveSeo } = useAdminPublish({ page, blocks, pageSeoLocal, token });

  useEffect(() => {
    setPageSeoLocal(cms.pages?.[page]?.seo || { title: "", description: "", canonical: "", ogImage: "", noindex: false });
  }, [cms, page]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) { e.preventDefault(); doUndo(); }
      if ((e.metaKey || e.ctrlKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); doRedo(); }
      if ((e.metaKey || e.ctrlKey) && e.key === "s") { e.preventDefault(); saveAll(); }
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [blocks, undo, redo, saveAll]);

  const selectedBlock = blocks.find(b => b.id === selected);
  const authHeaders = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const streamAI = async (body, onChunk) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const res = await fetch(`${API}/ai/generate-stream`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Stream failed");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.chunk) onChunk(parsed.chunk);
          } catch {}
        }
      }
    } finally {
      clearTimeout(timeout);
    }
  };

  const suggestBlocks = async () => {
    setSuggesting(true);
    setSuggestions([]);
    try {
      const currentTypes = blocks.map(b => b.type).join(", ");
      const validTypes = Object.keys({ ...SCHEMAS, ...registry }).join(", ");
      const res = await fetch(`${API}/ai/generate`, {
        method: "POST", headers: authHeaders,
        body: JSON.stringify({
          prompt: `Current page "${page}" has these blocks: ${currentTypes}. Suggest 3 additional block types to improve this page. Valid block types: ${validTypes}. Reply as JSON array only with no extra text: [{"type":"blockType","reason":"one sentence why"}]`,
          section: "block_suggestion"
        })
      });
      const data = await res.json();
      const raw = typeof data.content === "string" ? data.content : JSON.stringify(data.content);
      const match = raw.match(/\[[\s\S]*\]/);
      if (match) setSuggestions(JSON.parse(match[0]));
    } catch (e) { toast.error("Suggestion failed"); }
    setSuggesting(false);
  };

  const generateAI = async (field, label) => {
    if (!selected) return;
    setGenerating(true);
    try {
      const block = blocks.find(b => b.id === selected);
      const def = registry[block.type] || SCHEMAS[block.type];
      const promptTpl = def?.ai?.prompts?.generate || `Generate ${label} for ${def?.label || block.type}. Luxury Malta property style.`;
      if (field === "_all") {
        const aiFields = def?.aiFields || [];
        for (const k of aiFields) {
          const f = def?.schema?.[k] || def?.fields?.[k];
          const res = await fetch(`${API}/ai/generate`, {
            method: "POST", headers: authHeaders,
            body: JSON.stringify({ prompt: promptTpl.replace("{{topic}}", label || k), section: block.type, field: k })
          });
          const data = await res.json();
          if (data.content) updateBlock(selected, k, data.content.replace(/^["']|["']$/g, ""));
        }
        toast.success("AI generated all fields!");
      } else {
        const res = await fetch(`${API}/ai/generate`, {
          method: "POST", headers: authHeaders,
          body: JSON.stringify({ prompt: promptTpl.replace("{{topic}}", label || field), section: block.type, field })
        });
        const data = await res.json();
        if (data.content) { updateBlock(selected, field, data.content.replace(/^["']|["']$/g, "")); toast.success(`Generated ${label}`); }
      }
    } catch { toast.error("AI generation failed"); }
    setGenerating(false);
  };

  const generateFromPrompt = useCallback(async (prompt) => {
    if (!selected) return;
    setGenerating(true);
    try {
      const block = blocks.find(b => b.id === selected);
      let accumulated = "";
      await streamAI({
        prompt: `Refine the content for a ${SCHEMAS[block.type].label} block. Instructions: ${prompt}. Current content: ${JSON.stringify(block.data)}. Return improved content maintaining the same structure.`,
        section: block.type,
        field: "content",
      }, (chunk) => { accumulated += chunk; });
      const data = { content: accumulated };
      if (data.content) {
        try {
          const parsed = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
          Object.keys(parsed).forEach(k => updateBlock(selected, k, parsed[k]));
          toast.success("AI draft applied! Review and publish.");
        } catch { toast.error("Could not parse AI response"); }
      }
    } catch (e) { toast.error("AI generation failed"); }
    setGenerating(false);
  }, [selected, blocks, updateBlock]);

  const createPage = () => {
    const name = prompt("Page name:");
    if (!name) return;
    const slug = prompt("URL slug (e.g. /new-page):", "/" + name.toLowerCase().replace(/\s+/g, "-"));
    if (!slug) return;
    const id = "p_" + Date.now();
    const updated = [...customPages, {
      id, name, slug, published: true,
      blocks: [
        { id: "b_header_" + id, type: "header", data: {} },
        { id: "b_hero_" + id, type: "hero", data: {} },
        { id: "b_cta_" + id, type: "cta", data: {} },
        { id: "b_footer_" + id, type: "footer", data: {} },
      ]
    }];
    setCustomPages(updated);
    localStorage.setItem("cvpm_custom_pages", JSON.stringify(updated));
    toast.success(`Page "${name}" created`);
  };

  const deletePage = (pageId) => {
    if (!confirm("Delete this page?")) return;
    const updated = customPages.filter(p => p.id !== pageId);
    setCustomPages(updated);
    localStorage.setItem("cvpm_custom_pages", JSON.stringify(updated));
    if (page === pageId) setPage("home");
    toast.success("Page deleted");
  };

  const renamePage = (pageId, name, slug) => {
    const updated = customPages.map(p => p.id === pageId ? { ...p, name, slug } : p);
    setCustomPages(updated);
    localStorage.setItem("cvpm_custom_pages", JSON.stringify(updated));
    toast.success("Page updated");
  };

  if (isLoading) return <div className="fixed inset-0 bg-[#0a0a0b] flex items-center justify-center z-[9999]"><div className="animate-spin w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full" /></div>;
  if (!isAdmin) return <LoginScreen password={loginPassword} onPasswordChange={setLoginPassword} onLogin={handleLogin} />;

  return (
    <div className="fixed inset-0 bg-[#0a0a0b] flex flex-col z-[9999] overflow-hidden">
      <AdminHeader
        page={page} pages={BUILT_IN_PAGES} customPages={customPages}
        view={view} undo={undo} redo={redo} saving={saving} resetting={resetting}
        onPageChange={(p) => { setPage(p); setSelected(null); setSuggestions([]); }}
        onViewChange={setView} onUndo={doUndo} onRedo={doRedo}
        onSave={saveAll} onReset={handleReset} onPreview={() => window.open(`/${page === "home" ? "" : page}`, "_blank")}
        onShowKeys={() => setShowKeys(true)} onLogout={() => { handleLogout(); navigate("/"); }}
        onShowPageManager={() => setShowPageManager(true)}
        showGlobal onGlobal={() => { setPage("global"); setSelected(null); setSuggestions([]); }}
      />

      <div className="flex flex-1 overflow-hidden">
        {page === "global" && <GlobalSettingsPanel />}
        {page !== "global" && <>
          <aside className="w-60 bg-[#0a0a0b] border-r border-[#1a1a1e] flex flex-col shrink-0">
            <div className="flex border-b border-[#1a1a1e]">
              {[{ id: "blocks", label: "Add" }, { id: "layers", label: "Layers" }].map(t => {
                const Icon = TAB_ICONS[t.id];
                return (
                  <button key={t.id} onClick={() => setLeftTab(t.id)}
                    className={`flex-1 py-2.5 text-[9px] font-medium flex flex-col items-center gap-1 ${leftTab === t.id ? "text-[#D4AF37] bg-[#D4AF37]/5" : "text-[#5a5a5e] hover:text-[#f0ede8]"}`}>
                    <Icon className="w-4 h-4" />{t.label}
                  </button>
                );
              })}
            </div>
            <div className="flex-1 overflow-y-auto">
              {leftTab === "blocks" && (
                <BlockPalette
                  onAddBlock={(type) => { const id = addBlock(type); setSelected(id); setSuggestions([]); }}
                  onSuggest={suggestBlocks} suggestions={suggestions} suggesting={suggesting}
                />
              )}
              {leftTab === "layers" && (
                <LayersPanel
                  blocks={blocks} selected={selected}
                  onSelect={(id) => { setSelected(id); setRightTab("props"); }}
                  onToggleVisibility={toggleVisibility} onMove={moveBlock} onDelete={deleteBlock}
                />
              )}
            </div>
          </aside>

          <Canvas
            blocks={blocks} view={view} zoom={zoom}
            selected={selected}
            onZoomChange={setZoom}
            onSelect={(id) => { setSelected(id); setRightTab("props"); }}
            onDragEnd={onDragEnd}
            onUpdate={updateBlock}
            onDuplicate={duplicateBlock}
            onDelete={deleteBlock}
            onMoveBlock={moveBlock}
          />

          <aside className="w-80 bg-[#0a0a0b] border-l border-[#1a1a1e] flex flex-col shrink-0">
            <div className="flex border-b border-[#1a1a1e]">
              {[{ id: "props", label: "Props" }, { id: "theme", label: "Theme" },
                { id: "seo", label: "SEO" }, { id: "versions", label: "History" }, { id: "json", label: "JSON" }].map(t => (
                <button key={t.id} onClick={() => setRightTab(t.id)}
                  className={`flex-1 py-2.5 text-[9px] font-medium uppercase tracking-wide ${rightTab === t.id ? "text-[#D4AF37] bg-[#D4AF37]/5 border-b-2 border-[#D4AF37]" : "text-[#5a5a5e] hover:text-[#f0ede8]"}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {rightTab === "props" && selectedBlock &&
              <AIAssistant block={selectedBlock} onApply={generateFromPrompt} isGenerating={generating} />}

            <div className="flex-1 overflow-y-auto">
              {rightTab === "props" && (
                <PropsEditor block={selectedBlock} onUpdate={(f, v) => updateBlock(selected, f, v)}
                  onAI={generateAI} isGenerating={generating} />
              )}
              {rightTab === "json" && (
                <JSONEditor block={selectedBlock} onUpdate={(f, v) => updateBlock(selected, f, v)} />
              )}
              {rightTab === "theme" && <ThemePanel pageSlug={page} />}
              {rightTab === "seo" && (
                <SEOPanel page={page} seo={pageSeoLocal}
                  onSeoChange={setPageSeoLocal} onSave={saveSeo} />
              )}
              {rightTab === "versions" && <VersionsPanel token={token} />}
            </div>
          </aside>
        </>}
      </div>

      <div className="absolute bottom-3 left-3 text-[8px] text-[#3a3a3e] flex items-center gap-3">
        <span><Command className="w-3 h-3 inline" />Z Undo</span>
        <span><Command className="w-3 h-3 inline" />⇧Z Redo</span>
        <span><Command className="w-3 h-3 inline" />S Save</span>
      </div>

      {showKeys && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[99999]" onClick={() => setShowKeys(false)}>
          <div className="bg-[#0a0a0b] border border-[#1a1a1e] p-6 w-full max-w-md rounded-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#f0ede8]">API Configuration</h3>
              <button onClick={() => setShowKeys(false)} className="p-1.5 text-[#5a5a5e] hover:text-[#f0ede8]"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <ServiceStatus label="MongoDB" status={health?.mongodb} />
              <ServiceStatus label="Guesty API" status={health?.guesty} />
              <ServiceStatus label="AI Service" status={health?.ai} />
              <ServiceStatus label="Stripe" status={health?.stripe} />
            </div>
          </div>
        </div>
      )}

      {showPageManager && (
        <PageManagerModal
          customPages={customPages}
          onClose={() => setShowPageManager(false)}
          onCreatePage={createPage}
          onDeletePage={deletePage}
          onRenamePage={renamePage}
        />
      )}
    </div>
  );
}
