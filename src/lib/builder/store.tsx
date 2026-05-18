// Builder editor state — local React store with history (undo/redo).
import { createContext, useCallback, useContext, useMemo, useReducer, useState, type ReactNode } from "react";
import type { BlockType, BuilderBlock, BuilderPage, BuilderTheme, Device } from "./types";
import { BLOCK_DEFAULTS } from "./defaults";

type State = {
  page: BuilderPage | null;
  blocks: BuilderBlock[];
  selectedId: string | null;
  device: Device;
  dirty: boolean;
};
type History = { past: State[]; present: State; future: State[] };

type Action =
  | { type: "LOAD"; page: BuilderPage; blocks: BuilderBlock[] }
  | { type: "ADD"; blockType: BlockType }
  | { type: "REMOVE"; id: string }
  | { type: "MOVE"; id: string; dir: -1 | 1 }
  | { type: "DUPLICATE"; id: string }
  | { type: "PATCH"; id: string; data: Record<string, unknown> }
  | { type: "SELECT"; id: string | null }
  | { type: "DEVICE"; device: Device }
  | { type: "THEME"; theme: BuilderTheme }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "MARK_CLEAN" };

const uid = () => "b" + Math.random().toString(36).slice(2, 9);

const initial: History = {
  past: [],
  present: { page: null, blocks: [], selectedId: null, device: "desktop", dirty: false },
  future: [],
};

function applyMutating(s: State, a: Exclude<Action, { type: "UNDO" | "REDO" | "MARK_CLEAN" | "SELECT" | "DEVICE" | "LOAD" }>): State {
  const blocks = [...s.blocks];
  switch (a.type) {
    case "ADD": {
      const b: BuilderBlock = { id: uid(), type: a.blockType, data: { ...(BLOCK_DEFAULTS[a.blockType] ?? {}) }, position: blocks.length };
      return { ...s, blocks: [...blocks, b], selectedId: b.id, dirty: true };
    }
    case "REMOVE":
      return { ...s, blocks: blocks.filter((b) => b.id !== a.id), selectedId: s.selectedId === a.id ? null : s.selectedId, dirty: true };
    case "DUPLICATE": {
      const idx = blocks.findIndex((b) => b.id === a.id);
      if (idx < 0) return s;
      const src = blocks[idx]!;
      const copy: BuilderBlock = { ...src, id: uid(), data: { ...src.data } };
      blocks.splice(idx + 1, 0, copy);
      return { ...s, blocks, selectedId: copy.id, dirty: true };
    }
    case "MOVE": {
      const idx = blocks.findIndex((b) => b.id === a.id);
      const tgt = idx + a.dir;
      if (idx < 0 || tgt < 0 || tgt >= blocks.length) return s;
      [blocks[idx], blocks[tgt]] = [blocks[tgt]!, blocks[idx]!];
      return { ...s, blocks, dirty: true };
    }
    case "PATCH":
      return { ...s, blocks: blocks.map((b) => (b.id === a.id ? { ...b, data: { ...b.data, ...a.data } } : b)), dirty: true };
    case "THEME":
      return { ...s, page: s.page ? { ...s.page, theme: { ...s.page.theme, ...a.theme } } : null, dirty: true };
  }
}

function reducer(h: History, a: Action): History {
  switch (a.type) {
    case "LOAD":
      return { past: [], present: { page: a.page, blocks: a.blocks, selectedId: null, device: "desktop", dirty: false }, future: [] };
    case "SELECT":
      return { ...h, present: { ...h.present, selectedId: a.id } };
    case "DEVICE":
      return { ...h, present: { ...h.present, device: a.device } };
    case "MARK_CLEAN":
      return { ...h, present: { ...h.present, dirty: false } };
    case "UNDO": {
      if (!h.past.length) return h;
      const prev = h.past[h.past.length - 1]!;
      return { past: h.past.slice(0, -1), present: prev, future: [h.present, ...h.future] };
    }
    case "REDO": {
      if (!h.future.length) return h;
      const next = h.future[0]!;
      return { past: [...h.past, h.present], present: next, future: h.future.slice(1) };
    }
    default: {
      const next = applyMutating(h.present, a);
      return { past: [...h.past, h.present].slice(-50), present: next, future: [] };
    }
  }
}

type Ctx = {
  state: State;
  dispatch: React.Dispatch<Action>;
  canUndo: boolean;
  canRedo: boolean;
  selected: BuilderBlock | null;
  toast: { msg: string; kind: "ok" | "err" | "info" } | null;
  setToast: (t: Ctx["toast"]) => void;
};
const BuilderCtx = createContext<Ctx | null>(null);

export function BuilderProvider({ children }: { children: ReactNode }) {
  const [h, dispatch] = useReducer(reducer, initial);
  const [toast, setToast] = useState<Ctx["toast"]>(null);
  const selected = useMemo(() => h.present.blocks.find((b) => b.id === h.present.selectedId) ?? null, [h.present.blocks, h.present.selectedId]);
  const showToast = useCallback((t: Ctx["toast"]) => {
    setToast(t);
    if (t) setTimeout(() => setToast(null), 2400);
  }, []);
  const value: Ctx = { state: h.present, dispatch, canUndo: h.past.length > 0, canRedo: h.future.length > 0, selected, toast, setToast: showToast };
  return <BuilderCtx.Provider value={value}>{children}</BuilderCtx.Provider>;
}

export function useBuilder() {
  const c = useContext(BuilderCtx);
  if (!c) throw new Error("useBuilder must be used inside <BuilderProvider>");
  return c;
}
