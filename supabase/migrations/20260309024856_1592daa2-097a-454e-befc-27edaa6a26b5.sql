
CREATE TABLE IF NOT EXISTS public.cms_pages (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  meta JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT '{}',
  published BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;

-- Public read for published pages
CREATE POLICY "Public can read published pages" ON public.cms_pages
  FOR SELECT USING (published = true);

-- Service role handles writes (via edge functions)
CREATE POLICY "Service role writes" ON public.cms_pages
  FOR ALL USING (false);

CREATE INDEX idx_cms_pages_published ON public.cms_pages (published);
CREATE INDEX idx_cms_pages_tags ON public.cms_pages USING GIN (tags);

-- Site config singleton
CREATE TABLE IF NOT EXISTS public.cms_site_config (
  id TEXT PRIMARY KEY DEFAULT 'singleton',
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.cms_site_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read config" ON public.cms_site_config
  FOR SELECT USING (true);

CREATE POLICY "Service role writes config" ON public.cms_site_config
  FOR ALL USING (false);
