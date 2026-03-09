CREATE TABLE IF NOT EXISTS public.guesty_token_cache (
  id TEXT PRIMARY KEY DEFAULT 'singleton',
  access_token TEXT NOT NULL,
  expires_at BIGINT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.guesty_token_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role only" ON public.guesty_token_cache
  FOR ALL USING (false);