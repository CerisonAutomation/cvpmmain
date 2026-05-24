import { useState, useEffect } from "react";
import { useCMS } from "@/context/CMSContext";
import { getSeoDefaults } from "@/lib/registry";
import { API } from "@/lib/api";

export function useCmsPage(slug = "home") {
  const { getPage, isLoading: cmsLoading } = useCMS();
  const [blocks, setBlocks] = useState([]);
  const [seo, setSeo] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/cms/pages/${slug}`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && Array.isArray(data.blocks) && data.blocks.length > 0) {
            setBlocks(data.blocks.filter(b => b.type !== "header" && b.type !== "footer"));
            setSeo(data.seo || getSeoDefaults(slug));
            setLoading(false);
            return;
          }
        }
      } catch {
        /* API unavailable — use CMS context / templates */
      }
      if (!cancelled) {
        const page = getPage(slug);
        setBlocks((page.blocks || []).filter(b => b.type !== "header" && b.type !== "footer"));
        setSeo(page.seo || getSeoDefaults(slug));
      }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [slug, getPage]);

  return { blocks, seo, loading: loading || cmsLoading };
}
