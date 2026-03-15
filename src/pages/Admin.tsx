import { useCallback, useState } from 'react';
import Layout from '@/components/Layout';
import { SEOHead } from '@/components/SEOHead';
import { useCmsPages, useCmsPageMutation } from '@/hooks/use-cms-admin';
import type { ContentBlock, PageDefinition } from '@/lib/cms/types';
import { BLOCK_TYPES } from '@/lib/cms/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import { ChevronDown, ChevronRight, Plus, Trash2, GripVertical, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// ── JSON editor sub-component ──
function JsonEditor({
  value,
  onChange,
}: {
  value: Record<string, unknown>;
  onChange: (v: Record<string, unknown>) => void;
}) {
  const [raw, setRaw] = useState(() => JSON.stringify(value, null, 2));
  const [err, setErr] = useState<string | null>(null);

  const handleChange = (text: string) => {
    setRaw(text);
    try {
      const parsed = JSON.parse(text);
      setErr(null);
      onChange(parsed);
    } catch (e) {
      setErr((e as SyntaxError).message);
    }
  };

  return (
    <div className="space-y-1">
      <textarea
        aria-label="Block data JSON"
        className={`w-full min-h-[160px] p-3 border rounded-lg bg-background font-mono text-xs resize-y focus:ring-1 outline-none ${
          err ? 'border-destructive focus:ring-destructive/30' : 'border-input focus:ring-primary/30'
        }`}
        value={raw}
        onChange={(e) => handleChange(e.target.value)}
        spellCheck={false}
      />
      {err && (
        <p className="flex items-center gap-1 text-[10px] text-destructive">
          <AlertCircle className="w-3 h-3" />
          {err}
        </p>
      )}
    </div>
  );
}

// ── Single block editor row ──
function BlockEditor({
  block,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  block: ContentBlock;
  onChange: (b: ContentBlock) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border rounded-xl p-4 bg-card space-y-3">
      <div className="flex items-center justify-between gap-2">
        {/* drag handle (visual) + move buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <GripVertical className="w-4 h-4 text-muted-foreground/50" aria-hidden />
          <button
            type="button"
            aria-label="Move block up"
            disabled={isFirst}
            onClick={onMoveUp}
            className="p-0.5 rounded hover:bg-accent disabled:opacity-30"
          >
            <ChevronDown className="w-3.5 h-3.5 rotate-180" />
          </button>
          <button
            type="button"
            aria-label="Move block down"
            disabled={isLast}
            onClick={onMoveDown}
            className="p-0.5 rounded hover:bg-accent disabled:opacity-30"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* expand toggle */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-medium flex-1 min-w-0"
          aria-expanded={expanded}
          aria-label={`${expanded ? 'Collapse' : 'Expand'} block ${block.id}`}
        >
          {expanded ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}
          <span className="font-mono text-xs px-2 py-0.5 bg-muted rounded shrink-0">{block.type}</span>
          <span className="text-muted-foreground truncate text-xs">{block.id}</span>
        </button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          aria-label={`Delete block ${block.id}`}
          className="text-destructive hover:text-destructive shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      {expanded && (
        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-[1.5fr,1fr] gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground" htmlFor={`bid-${block.id}`}>Block ID</label>
              <Input
                id={`bid-${block.id}`}
                value={block.id}
                onChange={(e) => onChange({ ...block, id: e.target.value })}
                className="font-mono text-xs mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground" htmlFor={`btype-${block.id}`}>Type</label>
              <select
                id={`btype-${block.id}`}
                value={block.type}
                onChange={(e) => onChange({ ...block, type: e.target.value })}
                className="mt-1 w-full border border-input rounded-md bg-background text-xs py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-primary/30"
              >
                {BLOCK_TYPES.map((t) => (
                  <option key={t.type} value={t.type}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Data (JSON)</p>
            <JsonEditor
              value={block.data}
              onChange={(data) => onChange({ ...block, data })}
            />
          </div>

          <div className="pt-2 border-t border-border/40">
            <p className="text-[10px] text-muted-foreground mb-2">Live Preview</p>
            <div className="pointer-events-none opacity-90 rounded overflow-hidden">
              <BlockRenderer block={block} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Admin page ──
export default function Admin() {
  const { data: pages, isLoading: pagesLoading } = useCmsPages();
  const { upsert, remove } = useCmsPageMutation();
  const { toast } = useToast();

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [draft, setDraft] = useState<PageDefinition | null>(null);
  const [newSlug, setNewSlug] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const selectPage = useCallback((p: PageDefinition) => {
    setSelectedSlug(p.slug);
    setDraft(p);
    setDeleteConfirm(false);
  }, []);

  const updateDraft = useCallback((partial: Partial<PageDefinition>) => {
    setDraft((prev) => (prev ? { ...prev, ...partial } : prev));
  }, []);

  const handleCreatePage = async () => {
    const slug = newSlug.trim().toLowerCase()
      .replace(/[^a-z0-9-/]+/g, '-')
      .replace(/-{2,}/g, '-')
      .replace(/^-+|-+$/g, '');
    if (!slug) return;

    const page: PageDefinition = {
      slug,
      title: slug.charAt(0).toUpperCase() + slug.slice(1),
      description: '',
      blocks: [],
      meta: {},
      tags: [],
    };

    setCreating(true);
    try {
      await upsert.mutateAsync(page);
      selectPage(page);
      setNewSlug('');
      toast({ title: 'Page created', description: `/${slug}` });
    } catch (e) {
      toast({ title: 'Failed to create page', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const handleSave = async () => {
    if (!draft) return;
    try {
      await upsert.mutateAsync(draft);
      toast({ title: 'Saved', description: `/${draft.slug}`, action: <CheckCircle2 className="w-4 h-4 text-green-500" /> } as any);
    } catch (e) {
      toast({ title: 'Save failed', description: (e as Error).message, variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!selectedSlug) return;
    if (!deleteConfirm) { setDeleteConfirm(true); return; }
    try {
      await remove.mutateAsync(selectedSlug);
      setSelectedSlug(null);
      setDraft(null);
      setDeleteConfirm(false);
      toast({ title: 'Page deleted' });
    } catch (e) {
      toast({ title: 'Delete failed', description: (e as Error).message, variant: 'destructive' });
    }
  };

  const addBlock = useCallback(() => {
    setDraft((prev) => {
      if (!prev) return prev;
      const newBlock: ContentBlock = {
        id: `block-${Date.now()}`,
        type: 'text_block',
        data: { heading: 'New block', body: 'Content goes here.' },
      };
      return { ...prev, blocks: [...prev.blocks, newBlock] };
    });
  }, []);

  const updateBlock = useCallback((idx: number, updated: ContentBlock) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const next = [...prev.blocks];
      next[idx] = updated;
      return { ...prev, blocks: next };
    });
  }, []);

  const removeBlock = useCallback((idx: number) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return { ...prev, blocks: prev.blocks.filter((_, i) => i !== idx) };
    });
  }, []);

  const moveBlock = useCallback((idx: number, dir: 1 | -1) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const next = [...prev.blocks];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return { ...prev, blocks: next };
    });
  }, []);

  const isDirty = draft !== null && draft !== pages?.find((p) => p.slug === selectedSlug);

  return (
    <Layout>
      <SEOHead title="CMS Admin" description="" noIndex />
      <div className="max-w-7xl mx-auto px-4 py-8 grid gap-6 lg:grid-cols-[260px,1fr]">

        {/* ── Sidebar ── */}
        <aside aria-label="Pages list">
          <h2 className="text-sm font-semibold mb-3">Pages</h2>

          {/* Create new */}
          <div className="flex gap-2 mb-4">
            <Input
              aria-label="New page slug"
              placeholder="new-page-slug"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreatePage()}
              className="h-8 text-xs"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleCreatePage}
              disabled={!newSlug.trim() || creating}
              aria-label="Create page"
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Page list */}
          {pagesLoading ? (
            <div className="space-y-1">
              {[1,2,3].map((i) => <div key={i} className="h-7 bg-muted rounded animate-pulse" />)}
            </div>
          ) : (
            <nav aria-label="CMS pages">
              {pages?.map((p) => (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => selectPage(p)}
                  className={`w-full text-left px-2 py-1.5 rounded text-xs mb-0.5 transition-colors ${
                    selectedSlug === p.slug
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'hover:bg-accent text-foreground'
                  }`}
                >
                  /{p.slug}
                </button>
              ))}
              {!pages?.length && (
                <p className="text-xs text-muted-foreground">No pages yet.</p>
              )}
            </nav>
          )}
        </aside>

        {/* ── Editor ── */}
        <main aria-label="Page editor">
          {draft ? (
            <div className="space-y-5">

              {/* Header bar */}
              <div className="flex flex-wrap items-center gap-3 justify-between">
                <div>
                  <p className="text-[11px] text-muted-foreground">Slug</p>
                  <code className="font-mono text-xs bg-muted px-2 py-1 rounded">/{draft.slug}</code>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={deleteConfirm ? 'destructive' : 'outline'}
                    size="sm"
                    onClick={handleDelete}
                    disabled={!selectedSlug || remove.isPending}
                    aria-label={deleteConfirm ? 'Confirm delete' : 'Delete page'}
                  >
                    {deleteConfirm ? 'Confirm delete?' : 'Delete'}
                  </Button>
                  {deleteConfirm && (
                    <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(false)}>Cancel</Button>
                  )}
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={upsert.isPending}
                    className="gap-1"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {upsert.isPending ? 'Saving…' : isDirty ? 'Save*' : 'Save'}
                  </Button>
                </div>
              </div>

              {/* Meta fields */}
              <div className="grid gap-3">
                <div>
                  <label className="text-[11px] text-muted-foreground" htmlFor="page-title">Title</label>
                  <Input
                    id="page-title"
                    value={draft.title}
                    onChange={(e) => updateDraft({ title: e.target.value })}
                    className="text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground" htmlFor="page-desc">Description</label>
                  <Input
                    id="page-desc"
                    value={draft.description}
                    onChange={(e) => updateDraft({ description: e.target.value })}
                    className="text-sm mt-1"
                  />
                </div>
              </div>

              {/* Block list */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Blocks <span className="text-muted-foreground font-normal">({draft.blocks.length})</span></h3>
                <Button size="sm" variant="outline" onClick={addBlock}>
                  <Plus className="w-3.5 h-3.5 mr-1" />Add block
                </Button>
              </div>

              <div className="space-y-3">
                {draft.blocks.map((block, idx) => (
                  <BlockEditor
                    key={block.id}
                    block={block}
                    onChange={(updated) => updateBlock(idx, updated)}
                    onRemove={() => removeBlock(idx)}
                    onMoveUp={() => moveBlock(idx, -1)}
                    onMoveDown={() => moveBlock(idx, 1)}
                    isFirst={idx === 0}
                    isLast={idx === draft.blocks.length - 1}
                  />
                ))}
                {draft.blocks.length === 0 && (
                  <div className="border border-dashed border-border rounded-xl p-8 text-center">
                    <p className="text-xs text-muted-foreground">No blocks yet.</p>
                    <Button size="sm" variant="outline" className="mt-3" onClick={addBlock}>
                      <Plus className="w-3.5 h-3.5 mr-1" />Add first block
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-sm text-muted-foreground">Select a page from the left, or create a new one.</p>
            </div>
          )}
        </main>
      </div>
    </Layout>
  );
}
