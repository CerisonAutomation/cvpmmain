import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { SEOHead } from '@/components/SEOHead';
import { useCmsPages, useCmsPageMutation } from '@/hooks/use-cms-admin';
import type { ContentBlock, PageDefinition } from '@/lib/cms/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BlockRenderer from '@/components/blocks/BlockRenderer';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';

const BLOCK_TYPES = [
  { type: 'hero_split', label: 'Hero Split' },
  { type: 'property_showcase', label: 'Property Showcase' },
  { type: 'proof_strip', label: 'Proof Strip' },
  { type: 'text_block', label: 'Text Block' },
  { type: 'booking_cta', label: 'Booking CTA' },
];

function BlockEditor({
  block,
  onChange,
  onRemove,
}: {
  block: ContentBlock;
  onChange: (b: ContentBlock) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border rounded-xl p-4 bg-card space-y-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-medium"
        >
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <span className="font-mono text-xs px-2 py-0.5 bg-muted rounded">{block.type}</span>
          <span className="text-muted-foreground truncate max-w-[140px]">{block.id}</span>
        </button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      {expanded && (
        <div className="space-y-2">
          <div className="grid grid-cols-[1.5fr,1fr] gap-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Block ID</p>
              <Input
                value={block.id}
                onChange={(e) => onChange({ ...block, id: e.target.value })}
                className="font-mono text-xs mt-1"
              />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Type</p>
              <select
                value={block.type}
                onChange={(e) => onChange({ ...block, type: e.target.value })}
                className="mt-1 w-full border border-input rounded-md bg-background text-xs py-1.5 px-2"
              >
                {BLOCK_TYPES.map((t) => (
                  <option key={t.type} value={t.type}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-xs font-medium text-muted-foreground">Data (JSON)</p>
          <textarea
            className="w-full min-h-[160px] p-3 border border-input rounded-lg bg-background font-mono text-xs resize-y focus:ring-1 focus:ring-primary/30 outline-none"
            value={JSON.stringify(block.data, null, 2)}
            onChange={(e) => {
              try {
                const data = JSON.parse(e.target.value);
                onChange({ ...block, data });
              } catch {
                // ignore temporary invalid JSON while typing
              }
            }}
          />

          <div className="pt-2 border-t border-border/40">
            <p className="text-[10px] text-muted-foreground mb-1">Preview</p>
            <BlockRenderer block={block} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  const { data: pages } = useCmsPages();
  const { upsert, remove } = useCmsPageMutation();

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [draft, setDraft] = useState<PageDefinition | null>(null);
  const [newSlug, setNewSlug] = useState('');
  const [creating, setCreating] = useState(false);

  const currentPage = pages?.find((p) => p.slug === selectedSlug) || null;

  useEffect(() => {
    if (currentPage && !draft) {
      setDraft(currentPage);
    }
  }, [currentPage, draft]);

  const updateDraft = (partial: Partial<PageDefinition>) => {
    setDraft((prev) =>
      prev
        ? { ...prev, ...partial }
        : currentPage
        ? { ...currentPage, ...partial }
        : ({
            slug: '',
            title: '',
            description: '',
            blocks: [],
            meta: {},
            tags: [],
          } as PageDefinition),
    );
  };

  const handleCreatePage = async () => {
    const raw = newSlug.trim().toLowerCase();
    if (!raw) return;
    const slug = raw
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
      setSelectedSlug(slug);
      setDraft(page);
      setNewSlug('');
    } finally {
      setCreating(false);
    }
  };

  const handleSave = () => {
    const toSave = draft ?? currentPage;
    if (!toSave) return;
    upsert.mutate(toSave);
  };

  const handleDelete = () => {
    if (!selectedSlug) return;
    remove.mutate(selectedSlug);
    setSelectedSlug(null);
    setDraft(null);
  };

  const basePage = draft ?? currentPage;

  const addBlock = () => {
    if (!basePage) return;
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type: 'text_block',
      data: { heading: 'New block', body: 'Content goes here.' },
    };
    updateDraft({ blocks: [...basePage.blocks, newBlock] });
  };

  return (
    <Layout>
      <SEOHead title="CMS Admin" description="Edit marketing pages and blocks." noIndex />
      <div className="max-w-7xl mx-auto px-4 py-8 grid gap-6 lg:grid-cols-[260px,1fr]">
        {/* Sidebar */}
        <aside>
          <h2 className="text-sm font-semibold mb-2">Pages</h2>
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="new-page-slug"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              className="h-8 text-xs"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleCreatePage}
              disabled={!newSlug.trim() || creating}
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
          <div className="space-y-1">
            {pages?.map((p) => (
              <button
                key={p.slug}
                type="button"
                onClick={() => {
                  setSelectedSlug(p.slug);
                  setDraft(p);
                }}
                className={`w-full text-left px-2 py-1.5 rounded text-xs ${
                  selectedSlug === p.slug
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'hover:bg-accent text-foreground'
                }`}
              >
                /{p.slug}
              </button>
            ))}
          </div>
        </aside>

        {/* Editor */}
        <section>
          {basePage ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 justify-between">
                <div className="space-y-1">
                  <p className="text-[11px] text-muted-foreground">Slug</p>
                  <p className="font-mono text-xs bg-muted px-2 py-1 rounded">/{basePage.slug}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleDelete} disabled={!selectedSlug}>
                    Delete
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={upsert.isPending}>
                    Save
                  </Button>
                </div>
              </div>

              <div className="grid gap-3">
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">Title</p>
                  <Input
                    value={basePage.title}
                    onChange={(e) => updateDraft({ title: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground mb-1">Description</p>
                  <Input
                    value={basePage.description}
                    onChange={(e) => updateDraft({ description: e.target.value })}
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 mb-2">
                <h3 className="text-sm font-semibold">Blocks</h3>
                <Button size="sm" variant="outline" onClick={addBlock}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add block
                </Button>
              </div>

              <div className="space-y-3">
                {basePage.blocks.map((block, idx) => (
                  <BlockEditor
                    key={block.id}
                    block={block}
                    onChange={(updated) => {
                      const next = [...basePage.blocks];
                      next[idx] = updated;
                      updateDraft({ blocks: next });
                    }}
                    onRemove={() => {
                      const next = basePage.blocks.filter((_, i) => i !== idx);
                      updateDraft({ blocks: next });
                    }}
                  />
                ))}
                {basePage.blocks.length === 0 && (
                  <p className="text-xs text-muted-foreground">No blocks yet. Add one to get started.</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Select a page from the left, or create a new one.
            </p>
          )}
        </section>
      </div>
    </Layout>
  );
}
