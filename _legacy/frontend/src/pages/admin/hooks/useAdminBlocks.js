import { useState, useCallback, useRef, useEffect } from "react";
import { useCMS } from "@/context/CMSContext";
import { SCHEMAS, registry, PAGE_TEMPLATES, getSeoDefaults } from "@/lib/registry";
import { API } from "@/lib/api";

const HISTORY_CAP = 50;

export function useAdminBlocks(page, customPages, setCustomPages) {
  const { cms, getPage, savePageBlocks, token } = useCMS();
  const [blocks, setBlocks] = useState([]);
  const [undo, setUndo] = useState([]);
  const [redo, setRedo] = useState([]);
  const autoSaveRef = useRef(null);

  const builtInPages = ["home", "owners", "properties", "about", "contact"];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (builtInPages.includes(page)) {
        try {
          const headers = token ? { Authorization: `Bearer ${token}` } : {};
          const res = await fetch(`${API}/cms/pages/${page}`, { headers });
          if (res.ok) {
            const data = await res.json();
            if (!cancelled && Array.isArray(data.blocks) && data.blocks.length > 0) {
              setBlocks(data.blocks.filter(b => b.type !== "header" && b.type !== "footer"));
              return;
            }
          }
        } catch {
          /* fall through */
        }
        const saved = localStorage.getItem(`cvpm_page_blocks_${page}`);
        if (saved) {
          try {
            if (!cancelled) {
              setBlocks(JSON.parse(saved));
              return;
            }
          } catch {
            /* fall through */
          }
        }
        if (!cancelled) {
          const pageData = getPage(page);
          const merged = (pageData.blocks || []).map(block => {
            if (block.type === "hero" && cms.hero) {
              const heroData = { ...block.data };
              if (cms.hero.headline) heroData.headline = cms.hero.headline;
              if (cms.hero.headlineAccent) heroData.headlineAccent = cms.hero.headlineAccent;
              if (cms.hero.subheadline) heroData.subheadline = cms.hero.subheadline;
              if (cms.hero.backgroundImage) heroData.backgroundImage = cms.hero.backgroundImage;
              return { ...block, data: heroData };
            }
            if (block.type === "testimonials" && cms.testimonials?.length) {
              return { ...block, data: { ...block.data, items: cms.testimonials } };
            }
            return block;
          });
          setBlocks(merged);
        }
      } else {
        const cp = customPages.find(p => p.id === page);
        if (!cancelled) setBlocks(cp?.blocks || []);
      }
    })();
    return () => { cancelled = true; };
  }, [cms, page, customPages, getPage, token]);

  useEffect(() => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(async () => {
      if (builtInPages.includes(page)) {
        const seo = cms.pages?.[page]?.seo || getSeoDefaults(page);
        if (token) await savePageBlocks(page, blocks, seo);
        localStorage.setItem(`cvpm_page_blocks_${page}`, JSON.stringify(blocks));
      } else {
        const updated = customPages.map(p =>
          p.id === page ? { ...p, blocks } : p
        );
        setCustomPages(updated);
        localStorage.setItem("cvpm_custom_pages", JSON.stringify(updated));
      }
    }, 2000);
    return () => { if (autoSaveRef.current) clearTimeout(autoSaveRef.current); };
  }, [blocks, page, customPages, setCustomPages, savePageBlocks, token, cms.pages]);

  const snapshot = useCallback(() => {
    setUndo(u => [...u.slice(-(HISTORY_CAP - 1)), JSON.stringify(blocks)]);
    setRedo([]);
  }, [blocks]);

  const doUndo = useCallback(() => {
    if (!undo.length) return;
    setRedo(r => [...r, JSON.stringify(blocks)]);
    setBlocks(JSON.parse(undo.at(-1)));
    setUndo(u => u.slice(0, -1));
  }, [undo, blocks]);

  const doRedo = useCallback(() => {
    if (!redo.length) return;
    setUndo(u => [...u, JSON.stringify(blocks)]);
    setBlocks(JSON.parse(redo.at(-1)));
    setRedo(r => r.slice(0, -1));
  }, [redo, blocks]);

  const updateBlock = useCallback((id, field, value) => {
    snapshot();
    setBlocks(b => b.map(x => x.id === id ? { ...x, data: { ...x.data, [field]: value } } : x));
  }, [snapshot]);

  const addBlock = useCallback((type) => {
    snapshot();
    const schema = SCHEMAS[type] || registry[type];
    const defaults = schema?.defaults || {};
    const b = { id: `${type}_${Date.now()}`, type, data: { ...defaults }, visible: true };
    setBlocks(bs => [...bs, b]);
    return b.id;
  }, [snapshot]);

  const deleteBlock = useCallback((id) => {
    snapshot();
    setBlocks(b => b.filter(x => x.id !== id));
  }, [snapshot]);

  const duplicateBlock = useCallback((id) => {
    snapshot();
    const b = blocks.find(x => x.id === id);
    if (!b) return;
    const idx = blocks.findIndex(x => x.id === id);
    const n = { ...b, id: `${b.type}_${Date.now()}`, data: { ...b.data } };
    setBlocks(bs => [...bs.slice(0, idx + 1), n, ...bs.slice(idx + 1)]);
  }, [snapshot, blocks]);

  const moveBlock = useCallback((idx, dir) => {
    if ((dir === -1 && idx === 0) || (dir === 1 && idx === blocks.length - 1)) return;
    snapshot();
    const items = [...blocks];
    [items[idx], items[idx + dir]] = [items[idx + dir], items[idx]];
    setBlocks(items);
  }, [snapshot, blocks]);

  const onDragEnd = useCallback((result) => {
    if (!result.destination) return;
    snapshot();
    const items = [...blocks];
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setBlocks(items);
  }, [snapshot, blocks]);

  const toggleVisibility = useCallback((id) => {
    snapshot();
    setBlocks(b => b.map(x => x.id === id ? { ...x, visible: x.visible === false } : x));
  }, [snapshot]);

  // Reset: discard unsaved changes and reload from DB
  const resetBlocks = useCallback(async () => {
    if (builtInPages.includes(page)) {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${API}/cms/pages/${page}`, { headers });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.blocks) && data.blocks.length > 0) {
            setBlocks(data.blocks.filter(b => b.type !== "header" && b.type !== "footer"));
            setUndo([]);
            setRedo([]);
            return;
          }
        }
      } catch { /* fall through */ }
    }
    // For custom pages, reload from customPages state
    const cp = customPages.find(p => p.id === page);
    setBlocks(cp?.blocks || []);
    setUndo([]);
    setRedo([]);
  }, [page, token, builtInPages, customPages]);

  return {
    blocks, setBlocks, undo, redo,
    snapshot, doUndo, doRedo,
    updateBlock, addBlock, deleteBlock, duplicateBlock,
    moveBlock, onDragEnd, toggleVisibility, resetBlocks,
    builtInPages,
  };
}
