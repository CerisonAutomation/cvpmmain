import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Save, Sparkles } from "lucide-react";
import { API } from "@/lib/api";
import { useCMS } from "@/context/CMSContext";
import { toast } from "sonner";

export const SEOPanel = ({ page, seo, onSeoChange, onSave }) => {
  const { token } = useCMS();

  const generateSeo = async (field) => {
    try {
      const res = await fetch(`${API}/ai/generate-seo?page=${page}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (field === "title" && data.title) onSeoChange({ ...seo, title: data.title });
      else if (field === "description" && data.description) onSeoChange({ ...seo, description: data.description });
      else if (data.title || data.description) {
        onSeoChange({ ...seo, title: data.title || seo.title, description: data.description || seo.description });
      }
      toast.success("SEO generated");
    } catch {
      toast.error("SEO generation failed");
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <p className="text-[9px] uppercase tracking-widest text-[#4a4a4e] font-semibold mb-1">Per-Page SEO — <span className="text-[#D4AF37]">{page}</span></p>
        <p className="text-[8px] text-[#5a5a5e]">Overrides global SEO defaults for this page only.</p>
      </div>
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-[10px] text-[#5a5a5e] uppercase tracking-wide font-medium">Page Title</span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => generateSeo("title")} className="text-[#D4AF37]/70 hover:text-[#D4AF37]" aria-label="AI generate title"><Sparkles className="w-3 h-3" /></button>
            <span className={`text-[8px] ${(seo.title?.length || 0) > 60 ? "text-red-400" : "text-[#4a4a4e]"}`}>{seo.title?.length || 0}/60</span>
          </div>
        </div>
        <Input
          value={seo.title || ""}
          onChange={e => onSeoChange({ ...seo, title: e.target.value })}
          placeholder="Custom page title…"
          className="bg-[#0e0e10] border-[#1a1a1e] text-[#f0ede8] h-8 text-[11px] focus:border-[#D4AF37]/40"
        />
      </div>
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-[10px] text-[#5a5a5e] uppercase tracking-wide font-medium">Meta Description</span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => generateSeo("description")} className="text-[#D4AF37]/70 hover:text-[#D4AF37]" aria-label="AI generate description"><Sparkles className="w-3 h-3" /></button>
            <span className={`text-[8px] ${(seo.description?.length || 0) > 160 ? "text-red-400" : "text-[#4a4a4e]"}`}>{seo.description?.length || 0}/160</span>
          </div>
        </div>
        <Textarea
          value={seo.description || ""}
          onChange={e => onSeoChange({ ...seo, description: e.target.value })}
          placeholder="Custom meta description…"
          className="bg-[#0e0e10] border-[#1a1a1e] text-[#f0ede8] text-[11px] min-h-[70px] resize-none focus:border-[#D4AF37]/40"
        />
      </div>
      <div>
        <span className="text-[10px] text-[#5a5a5e] uppercase tracking-wide font-medium block mb-1">Canonical URL</span>
        <Input
          value={seo.canonical || ""}
          onChange={e => onSeoChange({ ...seo, canonical: e.target.value })}
          placeholder="https://example.com/page"
          className="bg-[#0e0e10] border-[#1a1a1e] text-[#f0ede8] h-8 text-[11px] focus:border-[#D4AF37]/40"
        />
      </div>
      <div>
        <span className="text-[10px] text-[#5a5a5e] uppercase tracking-wide font-medium block mb-1">OG Image URL</span>
        <Input
          value={seo.ogImage || ""}
          onChange={e => onSeoChange({ ...seo, ogImage: e.target.value })}
          placeholder="https://…"
          className="bg-[#0e0e10] border-[#1a1a1e] text-[#f0ede8] h-8 text-[11px] focus:border-[#D4AF37]/40"
        />
      </div>
      <div className="flex items-center justify-between">
        <label htmlFor="seo-noindex" className="text-[10px] text-[#5a5a5e] uppercase tracking-wide font-medium">noindex</label>
        <Switch
          id="seo-noindex"
          checked={!!seo.noindex}
          onCheckedChange={v => onSeoChange({ ...seo, noindex: v })}
        />
      </div>
      <button
        type="button"
        onClick={onSave}
        className="w-full h-9 text-[9px] font-semibold flex items-center justify-center gap-1.5 bg-[#D4AF37] text-[#0a0a0b] rounded hover:bg-[#E5C158]"
      >
        <Save className="w-3.5 h-3.5" />
        Save SEO for {page}
      </button>
      <p className="text-[8px] text-[#3a3a3e]">Leave blank to use global SEO defaults.</p>
    </div>
  );
};
