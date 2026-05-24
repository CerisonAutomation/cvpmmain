import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useCMS } from "@/context/CMSContext";

const EditModeContext = createContext(null);

const MODES = ["live", "pause", "edit"];

export function EditModeProvider({ children }) {
  const [searchParams] = useSearchParams();
  const { isAdmin, token } = useCMS();
  const [mode, setModeState] = useState("live");
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [frozenBlocks, setFrozenBlocks] = useState(null);

  // Always start in live mode on public pages — never restore edit from session
  useEffect(() => {
    if (!isAdmin) return; // only admin can ever be in edit mode
    const stored = sessionStorage.getItem("cvpm_edit_mode");
    if (stored && MODES.includes(stored)) setModeState(stored);
  }, [isAdmin]);

  // Clear edit mode immediately if admin status is lost or unverified
  useEffect(() => {
    if (!isAdmin) {
      sessionStorage.removeItem("cvpm_edit_mode");
      setModeState("live");
    }
  }, [isAdmin]);

  // ?edit=1 only works on /admin after server-verified admin
  useEffect(() => {
    const isAdminRoute = window.location.pathname.startsWith("/admin");
    if (searchParams.get("edit") === "1" && isAdmin && isAdminRoute) setModeState("edit");
  }, [searchParams, isAdmin]);

  const setMode = useCallback((next) => {
    if (!MODES.includes(next)) return;
    setModeState(next);
    sessionStorage.setItem("cvpm_edit_mode", next);
    if (next === "pause" && frozenBlocks === null) {
      setFrozenBlocks(null);
    }
  }, [frozenBlocks]);

  const selectBlock = useCallback((id) => {
    setSelectedBlockId(id);
  }, []);

  // isEditable requires: server-verified admin + valid token + edit mode + /admin route
  const isAdminRoute = window.location.pathname.startsWith("/admin");
  const isEditable = mode === "edit" && isAdmin && !!token && isAdminRoute;

  return (
    <EditModeContext.Provider
      value={{
        mode,
        setMode,
        isEditable,
        selectedBlockId,
        selectBlock,
        freezeSnapshot: (blocks) => setFrozenBlocks(blocks),
        frozenBlocks,
      }}
    >
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  const ctx = useContext(EditModeContext);
  if (!ctx) {
    return {
      mode: "live",
      setMode: () => {},
      isEditable: false,
      selectedBlockId: null,
      selectBlock: () => {},
      frozenBlocks: null,
      freezeSnapshot: () => {},
    };
  }
  return ctx;
}
