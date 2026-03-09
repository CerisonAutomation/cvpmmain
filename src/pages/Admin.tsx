import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useCmsPages, useCmsPageMutation } from '@/hooks/use-cms-admin';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, LogOut, Save, Trash2, Plus, Eye, EyeOff, ChevronDown, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { PageDefinition, ContentBlock } from '@/lib/cms/types';

// ── Auth Gate ──
function LoginForm() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await signIn(email, password);
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 p-8 border border-border rounded-2xl bg-card">
          <h1 className="font-serif text-2xl font-bold text-center">Admin Login</h1>
          {error && <p className="text-sm text-destructive text-center">{error}</p>}
          <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Sign In
          </Button>
        </form>
      </div>
    </Layout>
  );
}

// ── Block Editor ──
function BlockEditor({ block, onChange, onRemove }: {
  block: ContentBlock;
  onChange: (b: ContentBlock) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border rounded-xl p-4 bg-card">
      <div className="flex items-center justify-between">
        <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 text-sm font-medium">
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <span className="font-mono text-xs px-2 py-0.5 bg-muted rounded">{block.type}</span>
          <span className="text-muted-foreground">{block.id}</span>
        </button>
        <Button variant="ghost" size="sm" onClick={onRemove} className="text-destructive hover:text-destructive">
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
      {expanded && (
        <div className="mt-3 space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Block ID</label>
          <Input value={block.id} onChange={e => onChange({ ...block, id: e.target.value })} className="font-mono text-xs" />
          <label className="text-xs font-medium text-muted-foreground">Block Data (JSON)</label>
          <textarea
            className="w-full min-h-[200px] p-3 border border-input rounded-lg bg-background font-mono text-xs resize-y focus:ring-1 focus:ring-primary/30 outline-none"
            value={JSON.stringify(block.data, null, 2)}
            onChange={e => {
              try {
                const data = JSON.parse(e.target.value);
                onChange({ ...block, data });
              } catch { /* allow mid-edit invalid json */ }
            }}
          />
        </div>
      )}
    </div>
  );
}

// ── Page Editor ──
function PageEditor({ page, onSave, onDelete }: {
  page: PageDefinition;
  onSave: (p: PageDefinition) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState<PageDefinition>(page);
  const [dirty, setDirty] = useState(false);

  const update = (partial: Partial<PageDefinition>) => {
    setDraft(d => ({ ...d, ...partial }));
    setDirty(true);
  };

  const updateBlock = (index: number, block: ContentBlock) => {
    const blocks = [...draft.blocks];
    blocks[index] = block;
    update({ blocks });
  };

  const removeBlock = (index: number) => {
    update({ blocks: draft.blocks.filter((_, i) => i !== index) });
  };

  const addBlock = () => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type: 'text_block',
      data: { heading: 'New Block', body: 'Content here', alignment: 'left' },
    };
    update({ blocks: [...draft.blocks, newBlock] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl font-bold">{draft.slug}</h2>
        <div className="flex gap-2">
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
          </Button>
          <Button size="sm" disabled={!dirty} onClick={() => { onSave(draft); setDirty(false); }}>
            <Save className="w-3.5 h-3.5 mr-1" /> Save
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">Title</label>
          <Input value={draft.title} onChange={e => update({ title: e.target.value })} />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">Description</label>
          <Input value={draft.description} onChange={e => update({ description: e.target.value })} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Blocks ({draft.blocks.length})</h3>
          <Button variant="outline" size="sm" onClick={addBlock}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Block
          </Button>
        </div>
        <div className="space-y-3">
          {draft.blocks.map((block, i) => (
            <BlockEditor
              key={`${block.id}-${i}`}
              block={block}
              onChange={b => updateBlock(i, b)}
              onRemove={() => removeBlock(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Admin Panel ──
export default function Admin() {
  const { user, isAdmin, isLoading: authLoading, signOut } = useAuth();
  const { data: pages, isLoading: pagesLoading } = useCmsPages();
  const { upsert, remove } = useCmsPageMutation();
  const { toast } = useToast();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  if (authLoading) {
    return <Layout><div className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div></Layout>;
  }

  if (!user) return <LoginForm />;

  if (!isAdmin) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">You don't have admin access.</p>
            <p className="text-xs text-muted-foreground">Signed in as {user.email}</p>
            <Button variant="outline" onClick={signOut}><LogOut className="w-4 h-4 mr-2" /> Sign Out</Button>
          </div>
        </div>
      </Layout>
    );
  }

  const selectedPage = pages?.find(p => p.slug === selectedSlug);

  const handleSave = async (page: PageDefinition) => {
    try {
      await upsert.mutateAsync(page);
      toast({ title: 'Saved', description: `${page.slug} updated and pushed to DB.` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (slug: string) => {
    try {
      await remove.mutateAsync(slug);
      setSelectedSlug(null);
      toast({ title: 'Deleted', description: `${slug} removed.` });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleNewPage = () => {
    const slug = prompt('Enter page slug (e.g. "new-page"):');
    if (!slug) return;
    const newPage: PageDefinition = {
      slug,
      title: slug.charAt(0).toUpperCase() + slug.slice(1),
      description: '',
      blocks: [],
      tags: [],
      meta: {},
    };
    upsert.mutateAsync(newPage).then(() => setSelectedSlug(slug));
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold">CMS Admin</h1>
            <p className="text-sm text-muted-foreground mt-1">Edit pages → push to database → live in real-time</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{user.email}</span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="w-3.5 h-3.5 mr-1" /> Sign Out
            </Button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Pages</h3>
              <Button variant="outline" size="sm" onClick={handleNewPage}>
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
            {pagesLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            ) : (
              <div className="space-y-1">
                {pages?.map(p => (
                  <button
                    key={p.slug}
                    onClick={() => setSelectedSlug(p.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedSlug === p.slug ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <span className="font-mono text-xs">/{p.slug}</span>
                    <p className="text-[11px] opacity-70 truncate">{p.title}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Editor */}
          <div className="flex-1 min-w-0">
            {selectedPage ? (
              <PageEditor
                key={selectedPage.slug}
                page={selectedPage}
                onSave={handleSave}
                onDelete={() => handleDelete(selectedPage.slug)}
              />
            ) : (
              <div className="py-20 text-center text-muted-foreground">
                Select a page from the sidebar to edit
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
