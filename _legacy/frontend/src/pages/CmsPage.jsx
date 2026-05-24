import { useParams } from "react-router-dom";
import { BlockRenderer } from "@/components/BlockRenderer";
import { SEO } from "@/components/SEO";
import { useCmsPage } from "@/hooks/useCmsPage";
import { useCMS } from "@/context/CMSContext";
import { getSeoDefaults } from "@/lib/registry";

export const CmsPage = ({ slug: slugProp }) => {
  const { slug: slugParam } = useParams();
  const slug = slugProp || slugParam || "home";
  const { blocks, seo, loading } = useCmsPage(slug);
  const { globalSeo, cms } = useCMS();

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center bg-[#0F0F10]">
        <div className="animate-spin w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full" />
      </div>
    );
  }

  const pageSeo = {
    ...getSeoDefaults(slug),
    title: seo.title || cms.pages?.[slug]?.seo?.title,
    description: seo.description || cms.pages?.[slug]?.seo?.description,
    canonical: seo.canonical || cms.pages?.[slug]?.seo?.canonical,
    ogImage: seo.ogImage || cms.pages?.[slug]?.seo?.ogImage || globalSeo?.ogImage,
    noindex: seo.noindex ?? cms.pages?.[slug]?.seo?.noindex,
  };

  return (
    <>
      <SEO
        title={pageSeo.title || globalSeo?.title || cms.seo?.title}
        description={pageSeo.description || globalSeo?.description || cms.seo?.description}
        image={pageSeo.ogImage}
        pageSeo={pageSeo}
      />
      {blocks.filter(b => b.visible !== false).map(block => (
        <BlockRenderer key={block.id} block={block} isEditing={false} />
      ))}
    </>
  );
};

export default CmsPage;
