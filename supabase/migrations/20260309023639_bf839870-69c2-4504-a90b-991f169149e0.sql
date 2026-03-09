
CREATE TABLE IF NOT EXISTS public.guesty_api_cache (
  cache_key TEXT PRIMARY KEY,
  response_data JSONB NOT NULL,
  cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ttl_seconds INTEGER NOT NULL DEFAULT 900,
  hit_count INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.guesty_api_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only" ON public.guesty_api_cache
  FOR ALL USING (false);

CREATE INDEX idx_guesty_api_cache_expiry ON public.guesty_api_cache (cached_at);
