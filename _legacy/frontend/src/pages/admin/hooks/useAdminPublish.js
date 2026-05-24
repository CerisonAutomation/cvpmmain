import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useCMS } from "@/context/CMSContext";
import { getSeoDefaults } from "@/lib/registry";
import { API } from "@/lib/api";

export function useAdminPublish({ page, blocks, pageSeoLocal, token }) {
  const { updateSection, savePageBlocks, publishPage } = useCMS();
  const [saving, setSaving] = useState(false);

  const authHeaders = useCallback(() => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }), [token]);

  const saveSeo = useCallback(async () => {
    const pages = await savePageBlocks(page, blocks, pageSeoLocal);
    if (pages) toast.success("SEO saved");
    else toast.error("SEO save failed");
  }, [page, blocks, pageSeoLocal, savePageBlocks]);

  const saveAll = useCallback(async () => {
    setSaving(true);
    try {
      const seo = pageSeoLocal || getSeoDefaults(page);
      await savePageBlocks(page, blocks, seo);

      const hero = blocks.find(b => b.type === "hero");
      const testimonials = blocks.find(b => b.type === "testimonials");
      if (hero) await updateSection("hero", hero.data);
      if (testimonials?.data?.items) await updateSection("testimonials", testimonials.data.items);

      const published = await publishPage(page);
      if (published) {
        toast.success("Published!");
      } else {
        const publishRes = await fetch(`${API}/cms/admin/publish`, {
          method: "POST",
          headers: authHeaders(),
        });
        const publishData = await publishRes.json();
        if (publishRes.ok) {
          toast.success(
            <div>
              <p className="font-semibold">Published!</p>
              <p className="text-xs opacity-80 mt-1">Version {publishData.version} saved.</p>
            </div>
          );
        } else {
          toast.error(publishData.detail || "Publish failed");
        }
      }
    } catch {
      toast.error("Save failed");
    }
    setSaving(false);
  }, [page, blocks, pageSeoLocal, savePageBlocks, publishPage, updateSection, authHeaders]);

  return { saving, saveAll, saveSeo };
}
