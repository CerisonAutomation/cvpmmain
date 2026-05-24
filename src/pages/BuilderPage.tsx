// Page Builder Shell — topbar + blocks panel + canvas + props panel.
// Pass 1: load/save pages, add/remove/move/duplicate blocks, edit JSON data,
// device toggle, undo/redo. AI/SEO/Theme panels come in next pass.
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { BuilderProvider, useBuilder } from "@/lib/builder/store";
import { BLOCK_CATEGORIES } from "@/lib/builder/defaults";
import { RenderBlock } from "@/lib/builder/renderers";
import {
  loadPage,
  saveBlocks,
  updatePage,
  listPages,
  createPage,
  deletePage,
  callAi,
} from "@/lib/builder/api";
import { CreatePageInputSchema } from "@/lib/builder/schemas";
import type { BuilderPage } from "@/lib/builder/types";
import {
  Loader2,
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Undo2,
  Redo2,
  Save,
  Monitor,
  Tablet,
  Smartphone,
  Sparkles,
  ChevronLeft,
} from "lucide-react";

function TopBar({ onSave, saving }: { onSave: () => void; saving: boolean }) {
  const { state, dispatch, canUndo, canRedo } = useBuilder();
  return (
    <div className="flex h-14 items-center gap-3 border-b border-border bg-card px-4">
      <Link
        to="/admin"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Admin
      </Link>
      <div className="h-6 w-px bg-border" />
      <div className="font-serif text-sm">{state.page?.name ?? "—"}</div>
      <span className="rounded bg-muted px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
        {state.page?.status}
      </span>
      {state.dirty && <span className="text-[10px] text-amber-500">● unsaved</span>}
      <div className="ml-auto flex items-center gap-1">
        <button
          disabled={!canUndo}
          onClick={() => dispatch({ type: "UNDO" })}
          className="rounded p-1.5 hover:bg-muted disabled:opacity-30"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          disabled={!canRedo}
          onClick={() => dispatch({ type: "REDO" })}
          className="rounded p-1.5 hover:bg-muted disabled:opacity-30"
        >
          <Redo2 className="h-4 w-4" />
        </button>
        <div className="mx-2 h-5 w-px bg-border" />
        {(["desktop", "tablet", "mobile"] as const).map((d) => {
          const Icon = d === "desktop" ? Monitor : d === "tablet" ? Tablet : Smartphone;
          return (
            <button
              key={d}
              onClick={() => dispatch({ type: "DEVICE", device: d })}
              className={`rounded p-1.5 ${state.device === d ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"}`}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
        <div className="mx-2 h-5 w-px bg-border" />
        <button
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Save className="h-3.5 w-3.5" />
          )}{" "}
          Save
        </button>
      </div>
    </div>
  );
}

function LeftPanel() {
  const { dispatch } = useBuilder();
  return (
    <aside className="w-64 overflow-y-auto border-r border-border bg-card">
      <div className="space-y-5 p-4">
        {BLOCK_CATEGORIES.map((cat) => (
          <div key={cat.name}>
            <div className="mb-2 text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              {cat.name}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {cat.blocks.map((b) => (
                <button
                  key={b.type}
                  onClick={() => dispatch({ type: "ADD", blockType: b.type })}
                  className="rounded border border-border bg-muted/40 p-2 text-center transition hover:bg-muted"
                >
                  <i className={`ti ${b.icon} mb-1 block text-lg text-muted-foreground`} />
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
    // FIX #9: removed from inside overflow-hidden container — now appended to body via portal
    // to avoid toolbar being clipped on first block. z-30 is safe since it's now outside canvas.
    <div className="absolute right-2 top-0 z-30 flex gap-0.5 rounded-b bg-primary px-1 py-0.5">
      <button
        onClick={() => dispatch({ type: "MOVE", id, dir: -1 })}
        className="flex h-6 w-6 items-center justify-center rounded text-primary-foreground hover:bg-black/10"
      >
        <ArrowUp className="h-3 w-3" />
      </button>
      <button
        onClick={() => dispatch({ type: "MOVE", id, dir: 1 })}
        className="flex h-6 w-6 items-center justify-center rounded text-primary-foreground hover:bg-black/10"
      >
        <ArrowDown className="h-3 w-3" />
      </button>
      <button
        onClick={() => dispatch({ type: "DUPLICATE", id })}
        className="flex h-6 w-6 items-center justify-center rounded text-primary-foreground hover:bg-black/10"
      >
        <Copy className="h-3 w-3" />
      </button>
      <button
        onClick={() => dispatch({ type: "REMOVE", id })}
        className="flex h-6 w-6 items-center justify-center rounded text-primary-foreground hover:bg-black/10"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
}

function Canvas() {
  const { state, dispatch } = useBuilder();
  const w = state.device === "mobile" ? 390 : state.device === "tablet" ? 768 : 1100;
  return (
    // FIX #9: overflow-hidden moved from inner frame to scroll container
    // so BlockToolbar (position:absolute top:0) is never clipped on first block
    <main className="flex-1 overflow-y-auto bg-background p-6">
      <div
        className="mx-auto rounded-lg border border-border bg-background shadow-2xl transition-all"
        style={{ maxWidth: w }}
      >
        {state.blocks.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 text-muted-foreground">
            <Plus className="h-12 w-12 opacity-30" />
            <p>Empty canvas — add a block from the left panel.</p>
          </div>
        ) : (
          state.blocks.map((b) => (
            <div
              key={b.id}
              onClick={(e) => {
                e.stopPropagation();
                dispatch({ type: "SELECT", id: b.id });
              }}
              className={`relative cursor-pointer outline outline-2 outline-offset-[-1px] transition ${
                state.selectedId === b.id
                  ? "outline-primary"
                  : "outline-transparent hover:outline-primary/30"
              }`}
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
      <aside className="w-80 overflow-y-auto border-l border-border bg-card">
        <div className="p-6 text-center text-xs text-muted-foreground">
          <div className="mb-2 font-serif text-sm">No selection</div>
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
      const out = await callAi({
        mode: "generate",
        prompt: aiPrompt || `Improve this ${selected.type} block`,
        context: { type: selected.type, data },
      });
      const r = out.result as Record<string, unknown>;
      if (r && typeof r === "object") {
        dispatch({ type: "PATCH", id: selected.id, data: r });
        setToast({ msg: "AI updated block", kind: "ok" });
      }
    } catch (e) {
      setToast({ msg: (e as Error).message, kind: "err" });
    } finally {
      setAiBusy(false);
    }
  };

  return (
    // FIX #6: added key={selected.id} — forces full remount when switching blocks
    // so defaultValue inputs don't retain stale values from the previously selected block
    <aside key={selected.id} className="w-80 overflow-y-auto border-l border-border bg-card">
      <div className="space-y-4 p-4">
        <div>
          <div className="mb-3 border-b border-border pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            {selected.type} block
          </div>
          <div className="space-y-3">
            {keys.map((k) => {
              const v = data[k];
              if (typeof v === "string" || typeof v === "number") {
                const isLong = typeof v === "string" && v.length > 60;
                return (
                  <div key={k}>
                    <label className="mb-1 block text-[10px] text-muted-foreground">{k}</label>
                    {isLong ? (
                      <textarea
                        defaultValue={String(v)}
                        onBlur={(e) =>
                          dispatch({
                            type: "PATCH",
                            id: selected.id,
                            data: { [k]: e.target.value },
                          })
                        }
                        className="min-h-[60px] w-full rounded border border-border bg-muted/40 px-2 py-1.5 text-xs"
                      />
                    ) : (
                      <input
                        type={typeof v === "number" ? "number" : "text"}
                        defaultValue={String(v)}
                        onBlur={(e) =>
                          dispatch({
                            type: "PATCH",
                            id: selected.id,
                            data: {
                              [k]: typeof v === "number" ? Number(e.target.value) : e.target.value,
                            },
                          })
                        }
                        className="w-full rounded border border-border bg-muted/40 px-2 py-1.5 text-xs"
                      />
                    )}
                  </div>
                );
              }
              return (
                <div key={k}>
                  <label className="mb-1 block text-[10px] text-muted-foreground">{k} (JSON)</label>
                  <textarea
                    defaultValue={JSON.stringify(v, null, 2)}
                    onBlur={(e) => {
                      try {
                        dispatch({
                          type: "PATCH",
                          id: selected.id,
                          data: { [k]: JSON.parse(e.target.value) },
                        });
                      } catch {
                        setToast({ msg: "Invalid JSON", kind: "err" });
                      }
                    }}
                    className="min-h-[100px] w-full rounded border border-border bg-muted/40 px-2 py-1.5 font-mono text-[10px]"
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div className="border-t border-border pt-4">
          <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            <Sparkles className="h-3 w-3" /> AI Assist
          </div>
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="e.g. punchier, more luxe, shorter"
            className="min-h-[60px] w-full rounded border border-border bg-muted/40 px-2 py-1.5 text-xs"
          />
          <button
            onClick={onAi}
            disabled={aiBusy}
            className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded bg-primary px-3 py-1.5 text-xs text-primary-foreground disabled:opacity-50"
          >
            {aiBusy ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}{" "}
            Rewrite with AI
          </button>
        </div>
      </div>
    </aside>
  );
}

function Toast() {
  const { toast } = useBuilder();
  if (!toast) return null;
  const bg =
    toast.kind === "ok" ? "bg-emerald-500" : toast.kind === "err" ? "bg-destructive" : "bg-primary";
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 rounded px-4 py-2 text-xs text-white shadow-xl ${bg} z-50`}
    >
      {toast.msg}
    </div>
  );
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
        if (!p) {
          setToast({ msg: "Page not found", kind: "err" });
          return;
        }
        if (!cancelled) dispatch({ type: "LOAD", page: p, blocks: p.blocks ?? [] });
      } catch (e) {
        setToast({ msg: (e as Error).message, kind: "err" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pageId, dispatch, setToast]);

  const onSave = async () => {
    if (!state.page) return;
    setSaving(true);
    try {
      await saveBlocks(state.page.id, state.blocks);
      dispatch({ type: "MARK_CLEAN" });
      setToast({ msg: "Saved", kind: "ok" });
    } catch (e) {
      setToast({ msg: (e as Error).message, kind: "err" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }
  return (
    <div className="flex h-screen flex-col bg-background">
      <TopBar onSave={onSave} saving={saving} />
      <div className="flex flex-1 overflow-hidden">
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
  const [deleting, setDeleting] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);
  const nav = useNavigate();

  const refresh = () =>
    listPages()
      .then(setPages)
      .catch(() => setPages([]));
  useEffect(() => {
    void refresh();
  }, []);

  const onCreate = async () => {
    const validation = CreatePageInputSchema.safeParse({ name: name.trim(), slug });
    if (!validation.success) {
      const errors = validation.error.errors;
      setNameError(errors.find((e) => e.path.includes("name"))?.message ?? null);
      setSlugError(errors.find((e) => e.path.includes("slug"))?.message ?? null);
      return;
    }
    setNameError(null);
    setSlugError(null);
    setCreating(true);
    try {
      const p = await createPage({ name: validation.data.name!, slug: validation.data.slug! });
      nav(`/admin/builder/${p.id}`);
    } finally {
      setCreating(false);
    }
  };

  // FIX #12: delete page UI — was exported from api.ts but never wired to any UI
  const onDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm("Delete this page and all its blocks? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await deletePage(id);
      await refresh();
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-background p-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-serif text-3xl">Page Builder</h1>
          <Link to="/admin" className="text-sm text-muted-foreground hover:text-foreground">
            ← Admin
          </Link>
        </div>
        <div className="mb-6 rounded-lg border border-border bg-card p-6">
          <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            New page
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded border border-border bg-muted/40 px-3 py-2 text-sm"
              />
              {nameError && <p className="mt-0.5 text-[10px] text-destructive">{nameError}</p>}
            </div>
            <div className="flex-1">
              <input
                placeholder="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.replace(/[^a-z0-9-]/gi, "-").toLowerCase())}
                className="w-full rounded border border-border bg-muted/40 px-3 py-2 text-sm"
              />
              {slugError && <p className="mt-0.5 text-[10px] text-destructive">{slugError}</p>}
            </div>
            <button
              onClick={onCreate}
              disabled={creating}
              className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
            >
              {creating ? "…" : "Create"}
            </button>
          </div>
        </div>
        <div className="divide-y divide-border rounded-lg border border-border bg-card">
          {pages === null ? (
            <div className="p-6 text-center text-sm text-muted-foreground">Loading…</div>
          ) : pages.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">No pages yet.</div>
          ) : (
            pages.map((p) => (
              <div key={p.id} className="group flex items-center">
                <Link to={`/admin/builder/${p.id}`} className="block flex-1 p-4 hover:bg-muted/40">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="font-serif text-base">{p.name}</div>
                      <div className="text-[11px] text-muted-foreground">/{p.slug}</div>
                    </div>
                    <span
                      className={`rounded px-2 py-0.5 text-[9px] uppercase tracking-widest ${
                        p.status === "published"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={(e) => onDelete(p.id, e)}
                  disabled={deleting === p.id}
                  className="mr-4 p-1.5 text-muted-foreground opacity-0 transition hover:text-destructive disabled:opacity-50 group-hover:opacity-100"
                  title="Delete page"
                >
                  {deleting === p.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function BuilderPage() {
  const { id } = useParams<{ id?: string }>();
  void updatePage;
  return <BuilderProvider>{id ? <Editor pageId={id} /> : <PageList />}</BuilderProvider>;
}
