import { useEditMode } from "@/context/EditModeContext";
import { useCMS } from "@/context/CMSContext";

export function EditModeToolbar() {
  const { mode, setMode, isEditable } = useEditMode();
  const { isAdmin } = useCMS();

  if (!isAdmin) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex gap-2 bg-[#18181B] border border-[#27272A] rounded-lg p-1 shadow-xl">
      {["live", "pause", "edit"].map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => setMode(m)}
          className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
            mode === m ? "bg-[#D4AF37] text-[#0F0F10]" : "text-[#A1A1AA] hover:text-white"
          }`}
        >
          {m}
        </button>
      ))}
      {isEditable && <span className="px-3 py-2 text-xs text-[#D4AF37] self-center">Editing</span>}
    </div>
  );
}
