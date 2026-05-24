import { useState, useEffect } from "react";
import { API } from "@/lib/api";
import { History, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export function VersionsPanel({ token }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/cms/admin/versions`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setVersions(data.versions || (Array.isArray(data) ? data : [])))
      .catch(() => setVersions([]))
      .finally(() => setLoading(false));
  }, [token]);

  const rollback = async (version) => {
    try {
      const res = await fetch(`${API}/cms/admin/rollback/${version}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) toast.success(`Restored version ${version}`);
      else toast.error("Rollback failed");
    } catch {
      toast.error("Rollback failed");
    }
  };

  if (loading) return <p className="p-4 text-xs text-[#6a6a6e]">Loading versions…</p>;

  return (
    <div className="p-4 space-y-2">
      <p className="text-[9px] uppercase tracking-widest text-[#4a4a4e] font-semibold flex items-center gap-2">
        <History className="w-3 h-3" /> Version History
      </p>
      {versions.length === 0 ? (
        <p className="text-xs text-[#6a6a6e]">No versions yet. Publish to create history.</p>
      ) : (
        versions.slice(0, 20).map((v) => (
          <div key={v.version ?? v._meta?.version} className="flex items-center justify-between p-2 bg-[#0e0e10] border border-[#1a1a1e] rounded text-xs">
            <span className="text-[#A1A1AA]">v{v.version ?? v._meta?.version} — {v._meta?.last_updated || v.published_at || ""}</span>
            <button type="button" onClick={() => rollback(v.version ?? v._meta?.version)} className="text-[#D4AF37] hover:text-[#E5C158] flex items-center gap-1">
              <RotateCcw className="w-3 h-3" /> Restore
            </button>
          </div>
        ))
      )}
    </div>
  );
}
