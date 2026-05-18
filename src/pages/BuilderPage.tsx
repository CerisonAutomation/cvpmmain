// Page Builder Shell — topbar + blocks panel + canvas + props panel.
// Pass 1: load/save pages, add/remove/move/duplicate blocks, edit JSON data,
// device toggle, undo/redo. AI/SEO/Theme panels come in next pass.
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { BuilderProvider, useBuilder } from "@/lib/builder/store";
import { BLOCK_CATEGORIES } from "@/lib/builder/defaults";
import { RenderBlock } from "@/lib/builder/renderers";
import { loadPage, saveBlocks, updatePage, listPages, createPage, callAi } from "@/lib/builder/api";
import type { BuilderPage } from "@/lib/builder/types";
import { Loader2, Plus, Trash2, Copy, ArrowUp, ArrowDown, Undo2, Redo2, Save, Monitor, Tablet, Smartphone, Sparkles, ChevronLeft } from "lucide-react";

function TopBar({ onSave, saving }: { onSave: () => void; saving: boolean }) {
  const { state, dispatch, canUndo, canRedo } = useBuilder();
  return (
    <div className="h-14 flex items-center gap-3 px-4 bg-card border-b border-border">
      <Link to="/admin" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="w-4 h-4" /> Admin
      </Link>
      <div className="w-px h-6 bg-border" />
      <div className="font-serif text-sm">{state.page?.name ?? "—"}</div>
      <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-muted text-muted-foreground">{state.page?.status}</span>
      {state.dirty && <span className="text-[10px] text-amber-500">● unsaved</span>}
      <div className="ml-auto flex items-center gap-1">
        <button disabled={!canUndo} onClick={() => dispatch({ type: "UNDO" })} className="p-1.5 rounded hover:bg-muted disabled:opacity-30"><Undo2 className="w-4 h-4" /></button>
        <button disabled={!canRedo} onClick={() => dispatch({ type: "REDO" })} className="p-1.5 rounded hover:bg-muted disabled:opacity-30"><Redo2 className="w-4 h-4" /></button>
        <div className="w-px h-5 bg-border mx-2" />
        {(["desktop", "tablet", "mobile"] as const).map((d) => {
          const Icon = d === "desktop" ? Monitor : d === "tablet" ? Tablet : Smartphone;
          return (
            <button key={d} onClick={() => dispatch({ type: "DEVICE", device: d })} className={`p-1.5 rounded ${state.device === d ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"}`}>
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
        <div className="w-px h-5 bg-border mx-2" />
        <button onClick={onSave} disabled={saving} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary text-primary-foreground text-xs font-medium disabled:opacity-50">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
        </button>
      </div>
    </div>
  );
}

function LeftPanel() {
  const { dispatch } = useBuilder();
  return (
    <aside className="w-64 bg-card border-r border-border overflow-y-auto">
      <div className="p-4 space-y-5">
        {BLOCK_CATEGORIES.map((cat) => (
          <div key={cat.name}>
            <div className="text-[9px] font-bold tracking-[0.18em] uppercase text-muted-foreground mb-2">{cat.name}</div>
            <div className="grid grid-cols-2 gap-1.5">
              {cat.blocks.map((b) => (
                <button key={b.type} onClick={() => dispatch({ type: "ADD", blockType: b.type })} className="p-2 bg-muted/40 hover:bg-muted border border-border rounded text-center transition">
                  <i className={`ti ${b.icon} text-lg block mb-1 text-muted-foreground`} />
                  <span className="text-[10px] text-muted-foreground">{b.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function BlockToolbar({ id }: { id: string }) {
  const { dispatch } = useBuilder();
  return (
    <div className="absolute top-0 right-2 flex gap-0.5 bg-primary px-1 py-0.5 rounded-b z-30">
      <button onClick={() => dispatch({ type: "MOVE", id, dir: -1 })} className="w-6 h-6 flex items-center justify-center text-primary-foreground hover:bg-black/10 rounded"><ArrowUp className="w-3 h-3" /></button>
      <button onClick={() => dispatch({ type: "MOVE", id, dir: 1 })} className="w-6 h-6 flex items-center justify-center text-primary-foreground hover:bg-black/10 rounded"><ArrowDown className="w-3 h-3" /></button>
      <button onClick={() => dispatch({ type: "DUPLICATE", id })} className="w-6 h-6 flex items-center justify-center text-primary-foreground hover:bg-black/10 rounded"><Copy className="w-3 h-3" /></button>
      <button onClick={() => dispatch({ type: "REMOVE", id })} className="w-6 h-6 flex items-center justify-center text-primary-foreground hover:bg-black/10 rounded"><Trash2 className="w-3 h-3" /></button>
    </div>
  );
}

function Canvas() {
  const { state, dispatch } = useBuilder();
  const w = state.device === "mobile" ? 390 : state.device === "tablet" ? 768 : 1100;
  return (
    <main className="flex-1 overflow-y-auto bg-background p-6">
      <div className="mx-auto bg-background border border-border rounded-lg shadow-2xl overflow-hidden transition-all" style={{ maxWidth: w }}>
        {state.blocks.length === 0 ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center text-muted-foreground gap-3">
            <Plus className="w-12 h-12 opacity-30" />
            <p>Empty canvas — add a block from the left panel.</p>
          </div>
        ) : (
          state.blocks.map((b) => (
            <div
              key={b.id}
              onClick={(e) => { e.stopPropagation(); dispatch({ type: "SELECT", id: b.id }); }}
              className={`relative cursor-pointer outline outline-2 outline-offset-[-1px] transition ${state.selectedId === b.id ? "outline-primary" : "outline-transparent hover:outline-primary/30"}`}
            >
              {state.selectedId === b.id && <BlockToolbar id={b.id} />}
              <RenderBlock block={b} />
            </div>
          ))
        )}
      </div>
    </main>
  );
}

function PropsPanel() {
  const { selected, dispatch, setToast } = useBuilder();
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiBusy, setAiBusy] = useState(false);

  if (!selected) {
    return (
      <aside className="w-80 bg-card border-l border-border overflow-y-auto">
        <div className="p-6 text-center text-muted-foreground text-xs">
          <div className="font-serif text-sm mb-2">No selection</div>
          Click a block on the canvas to edit its data.
        </div>
      </aside>
    );
  }

  const data = selected.data;
  const keys = Object.keys(data);

  const onAi = async () => {
    setAiBusy(true);
    try {
      const out = await callAi({ mode: "generate", prompt: aiPrompt || `Improve this ${selected.type} block`, context: { type: selected.type, data } });
      const r = out.result as Record<string, unknown>;
      if (r && typeof r === "object") {
        dispatch({ type: "PATCH", id: selected.id, data: r });
        setToast({ msg: "AI updated block", kind: "ok" });
      }
    } catch (e) {
      setToast({ msg: (e as Error).message, kind: "err" });
    } finally { setAiBusy(false); }
  };

  return (
    <aside className="w-80 bg-card border-l border-border overflow-y-auto">
      <div className="p-4 space-y-4">
        <div>
          <div className="text-[10px] font-bold tracking-[0.16em] uppercase text-muted-foreground border-b border-border pb-2 mb-3">{selected.type} block</div>
          <div className="space-y-3">
            {keys.map((k) => {
              const v = data[k];
              if (typeof v === "string" || typeof v === "number") {
                const isLong = typeof v === "string" && v.length > 60;
                return (
                  <div key={k}>
                    <label className="text-[10px] text-muted-foreground block mb-1">{k}</label>
                    {isLong ? (
                      <textarea defaultValue={String(v)} onBlur={(e) => dispatch({ type: "PATCH", id: selected.id, data: { [k]: e.target.value } })} className="w-full px-2 py-1.5 bg-muted/40 border border-border rounded text-xs min-h-[60px]" />
                    ) : (
                      <input type={typeof v === "number" ? "number" : "text"} defaultValue={String(v)} onBlur={(e) => dispatch({ type: "PATCH", id: selected.id, data: { [k]: typeof v === "number" ? Number(e.target.value) : e.target.value } })} className="w-full px-2 py-1.5 bg-muted/40 border border-border rounded text-xs" />
                    )}
                  </div>
                );
              }
              return (
                <div key={k}>
                  <label className="text-[10px] text-muted-foreground block mb-1">{k} (JSON)</label>
                  <textarea defaultValue={JSON.stringify(v, null, 2)} onBlur={(e) => { try { dispatch({ type: "PATCH", id: selected.id, data: { [k]: JSON.parse(e.target.value) } }); } catch { setToast({ msg: "Invalid JSON", kind: "err" }); } }} className="w-full px-2 py-1.5 bg-muted/40 border border-border rounded font-mono text-[10px] min-h-[100px]" />
                </div>
              );
            })}
          </div>
        </div>
        <div className="border-t border-border pt-4">
          <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.16em] uppercase text-muted-foreground mb-2"><Sparkles className="w-3 h-3" /> AI Assist</div>
          <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="e.g. punchier, more luxe, shorter" className="w-full px-2 py-1.5 bg-muted/40 border border-border rounded text-xs min-h-[60px]" />
          <button onClick={onAi} disabled={aiBusy} className="mt-2 w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-primary text-primary-foreground text-xs disabled:opacity-50">
            {aiBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Rewrite with AI
          </button>
        </div>
      </div>
    </aside>
  );
}

function Toast() {
  const { toast } = useBuilder();
  if (!toast) return null;
  const bg = toast.kind === "ok" ? "bg-emerald-500" : toast.kind === "err" ? "bg-destructive" : "bg-primary";
  return <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded shadow-xl text-white text-xs ${bg} z-50`}>{toast.msg}</div>;
}

function Editor({ pageId }: { pageId: string }) {
  const { state, dispatch, setToast } = useBuilder();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p = await loadPage(pageId);
        if (!p) { setToast({ msg: "Page not found", kind: "err" }); return; }
        if (!cancelled) dispatch({ type: "LOAD", page: p, blocks: p.blocks ?? [] });
      } catch (e) {
        setToast({ msg: (e as Error).message, kind: "err" });
      } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [pageId, dispatch, setToast]);

  const onSave = async () => {
    if (!state.page) return;
    setSaving(true);
    try {
      await saveBlocks(state.page.id, state.blocks);
      dispatch({ type: "MARK_CLEAN" });
      setToast({ msg: "Saved", kind: "ok" });
    } catch (e) { setToast({ msg: (e as Error).message, kind: "err" }); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  return (
    <div className="h-screen flex flex-col bg-background">
      <TopBar onSave={onSave} saving={saving} />
      <div className="flex-1 flex overflow-hidden">
        <LeftPanel />
        <Canvas />
        <PropsPanel />
      </div>
      <Toast />
    </div>
  );
}

function PageList() {
  const [pages, setPages] = useState<BuilderPage[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const nav = useNavigate();

  useEffect(() => { listPages().then(setPages).catch(() => setPages([])); }, []);

  const onCreate = async () => {
    if (!name || !slug) return;
    setCreating(true);
    try {
      const p = await createPage({ name, slug });
      nav(`/admin/builder/${p.id}`);
    } finally { setCreating(false); }
  };

  return (
    <div className="min-h-screen bg-background p-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-3xl">Page Builder</h1>
          <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground">← Admin</Link>
        </div>
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <div className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mb-3">New page</div>
          <div className="flex gap-2">
            <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="flex-1 px-3 py-2 bg-muted/40 border border-border rounded text-sm" />
            <input placeholder="slug" value={slug} onChange={(e) => setSlug(e.target.value.replace(/[^a-z0-9-]/gi, "-").toLowerCase())} className="flex-1 px-3 py-2 bg-muted/40 border border-border rounded text-sm" />
            <button onClick={onCreate} disabled={creating || !name || !slug} className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm disabled:opacity-50">{creating ? "…" : "Create"}</button>
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg divide-y divide-border">
          {pages === null ? <div className="p-6 text-center text-sm text-muted-foreground">Loading…</div>
            : pages.length === 0 ? <div className="p-6 text-center text-sm text-muted-foreground">No pages yet.</div>
            : pages.map((p) => (
              <Link key={p.id} to={`/admin/builder/${p.id}`} className="block p-4 hover:bg-muted/40">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="font-serif text-base">{p.name}</div>
                    <div className="text-[11px] text-muted-foreground">/{p.slug}</div>
                  </div>
                  <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 rounded ${p.status === "published" ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"}`}>{p.status}</span>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}

export default function BuilderPage() {
  const { id } = useParams<{ id?: string }>();
  // Ensure page status can be toggled via simple call when needed in next pass.
  void updatePage;
  return (
    <BuilderProvider>
      {id ? <Editor pageId={id} /> : <PageList />}
    </BuilderProvider>
  );
}
