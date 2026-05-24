const stripHtml = (s) => (s || "").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ");

export function normalizeBlockData(type, data = {}) {
  if (type === "hero") {
    const title = data.title || data.headline || "";
    const emMatch = typeof title === "string" && title.match(/<em>(.*?)<\/em>/i);
    return {
      ...data,
      badge: data.badge || data.eyebrow,
      headline: data.headline || stripHtml(title),
      headlineAccent: data.headlineAccent || (emMatch ? emMatch[1] : data.headlineSub),
      subheadline: data.subheadline || data.subtitle,
      cta1Text: data.cta1Text || data.cta1,
      cta2Text: data.cta2Text || data.cta2,
      backgroundImage: data.backgroundImage,
    };
  }
  if (type === "owners" || type === "owners_hero") {
    return {
      ...data,
      badge: data.badge || data.subtitle,
      headline: data.headline || data.title,
      subheadline: data.subheadline || data.description,
      cta1Text: data.cta1Text || data.cta1,
      cta2Text: data.cta2Text || data.cta2,
    };
  }
  if (type === "about") {
    return {
      ...data,
      subtitle: data.subtitle || data.label,
      paragraphs: data.paragraphs || (data.body ? [data.body] : []),
    };
  }
  if (type === "testimonials") {
    return {
      ...data,
      items: data.items || data.testimonials || [],
    };
  }
  return data;
}
