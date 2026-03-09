import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── CORS ──
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

// ── TTL config (seconds) per action ──
const TTL: Record<string, number> = {
  listings: 15 * 60,   // 15 min – listings rarely change
  listing: 10 * 60,    // 10 min
  calendar: 5 * 60,    // 5 min – availability changes more
  cities: 24 * 60 * 60, // 24 hr
  reviews: 60 * 60,    // 1 hr
  "rate-plans": 30 * 60,
  "payment-provider": 60 * 60,
};

// Actions that are never cached (mutations)
const UNCACHEABLE = new Set(["quote", "instant-booking"]);

// ── Helpers ──
let _sb: ReturnType<typeof createClient> | null = null;
function sb() {
  if (!_sb)
    _sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
  return _sb;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── Token management (in-memory + DB) ──
let memToken: string | null = null;
let memExpiresAt = 0;

async function getTokenFromDb(): Promise<{ token: string; expiresAt: number } | null> {
  try {
    const { data } = await sb()
      .from("guesty_token_cache")
      .select("access_token, expires_at")
      .eq("id", "singleton")
      .maybeSingle();
    if (data) {
      return { token: data.access_token, expiresAt: Number(data.expires_at) };
    }
  } catch (e) {
    console.warn("Token cache read failed:", e);
  }
  return null;
}

async function getAccessToken(): Promise<string> {
  // 1. In-memory (with 2-min buffer before expiry)
  if (memToken && Date.now() < memExpiresAt - 120_000) return memToken;

  // 2. DB cache
  const cached = await getTokenFromDb();
  if (cached && Date.now() < cached.expiresAt - 120_000) {
    memToken = cached.token;
    memExpiresAt = cached.expiresAt;
    return cached.token;
  }

  // 3. Fetch new token with retry
  const clientId = Deno.env.get("VITE_GUESTY_ADMIN_CLIENT_ID");
  const clientSecret = Deno.env.get("VITE_GUESTY_CLIENT_SECRET");
  if (!clientId || !clientSecret) throw new Error("Guesty API credentials not configured");

  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      // Shorter initial backoff: 2s, 4s, 8s
      const backoff = Math.min(2000 * 2 ** attempt, 8000);
      console.warn(`OAuth retry ${attempt + 1}/3 – waiting ${backoff}ms`);
      await sleep(backoff);
    }

    let res: Response;
    try {
      res = await fetch("https://booking.guesty.com/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          scope: "booking_engine:api",
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });
    } catch (fetchErr) {
      console.error("OAuth fetch network error:", fetchErr);
      continue;
    }

    if (res.ok) {
      const d = await res.json();
      const expiresAt = Date.now() + (d.expires_in || 3600) * 1000;
      memToken = d.access_token;
      memExpiresAt = expiresAt;
      // Persist to DB (fire-and-forget)
      sb()
        .from("guesty_token_cache")
        .upsert({ id: "singleton", access_token: d.access_token, expires_at: expiresAt, updated_at: new Date().toISOString() })
        .then(() => {});
      return d.access_token;
    }

    // CRITICAL: Always consume response body to prevent resource leaks
    const errText = await res.text();

    if (res.status === 429) {
      console.warn(`OAuth 429 on attempt ${attempt + 1}: ${errText}`);
      continue;
    }

    console.error("OAuth error:", res.status, errText);
    throw new Error(`Guesty OAuth failed: ${res.status}`);
  }

  // FALLBACK: If rate-limited but we have a cached token (even if close to expiry), use it
  if (cached && cached.token && Date.now() < cached.expiresAt) {
    console.warn("OAuth rate-limited — using cached token as fallback (may be close to expiry)");
    memToken = cached.token;
    memExpiresAt = cached.expiresAt;
    return cached.token;
  }

  throw new Error("Guesty OAuth: rate limited after 3 retries");
}

// ── Response cache layer ──
async function getCached(key: string): Promise<unknown | null> {
  try {
    const { data } = await sb()
      .from("guesty_api_cache")
      .select("response_data, cached_at, ttl_seconds")
      .eq("cache_key", key)
      .maybeSingle();

    if (!data) return null;

    const age = (Date.now() - new Date(data.cached_at).getTime()) / 1000;
    if (age > data.ttl_seconds) return null;

    // Bump hit count (fire-and-forget)
    sb()
      .from("guesty_api_cache")
      .update({ hit_count: ((data as any).hit_count || 0) + 1 })
      .eq("cache_key", key)
      .then(() => {});

    return data.response_data;
  } catch {
    return null;
  }
}

async function setCache(key: string, data: unknown, ttl: number) {
  try {
    await sb().from("guesty_api_cache").upsert({
      cache_key: key,
      response_data: data,
      cached_at: new Date().toISOString(),
      ttl_seconds: ttl,
      hit_count: 0,
    });
  } catch (e) {
    console.warn("Cache write failed:", e);
  }
}

// ── Guesty API fetch with single retry on 429 ──
async function guestyFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();
  const base = "https://booking.guesty.com/api";
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers || {}),
  };

  const res = await fetch(`${base}${path}`, { ...options, headers });

  if (res.status === 429) {
    await res.text();
    console.warn("Guesty API 429 – backing off 5s");
    await sleep(5000);
    const retryToken = await getAccessToken();
    return fetch(`${base}${path}`, {
      ...options,
      headers: { ...headers, Authorization: `Bearer ${retryToken}` },
    });
  }

  return res;
}

// ── Cached fetch: DB-first, then API, then cache result ──
async function cachedGuestyFetch(cacheKey: string, path: string, ttl: number): Promise<unknown> {
  const cached = await getCached(cacheKey);
  if (cached) {
    console.log(`Cache HIT: ${cacheKey}`);
    return cached;
  }

  console.log(`Cache MISS: ${cacheKey} – calling Guesty API`);
  const res = await guestyFetch(path);
  const data = await res.json();

  if (res.ok) {
    // Cache in background
    setCache(cacheKey, data, ttl).catch(() => {});
  }

  return data;
}

// ── Route handler ──
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    switch (action) {
      // ── Cacheable GETs ──
      case "listings": {
        const params = url.searchParams.get("params") || "";
        const key = `listings:${params}`;
        const data = await cachedGuestyFetch(key, `/listings?${params}`, TTL.listings);
        return Response.json(data, { headers: corsHeaders });
      }

      case "listing": {
        const id = url.searchParams.get("id");
        if (!id) return Response.json({ error: "Missing id" }, { status: 400, headers: corsHeaders });
        const data = await cachedGuestyFetch(`listing:${id}`, `/listings/${id}`, TTL.listing);
        return Response.json(data, { headers: corsHeaders });
      }

      case "calendar": {
        const id = url.searchParams.get("id");
        const from = url.searchParams.get("from");
        const to = url.searchParams.get("to");
        if (!id || !from || !to) return Response.json({ error: "Missing params" }, { status: 400, headers: corsHeaders });
        const data = await cachedGuestyFetch(`cal:${id}:${from}:${to}`, `/listings/${id}/calendar?from=${from}&to=${to}`, TTL.calendar);
        return Response.json(data, { headers: corsHeaders });
      }

      case "cities": {
        const data = await cachedGuestyFetch("cities", "/cities", TTL.cities);
        return Response.json(data, { headers: corsHeaders });
      }

      case "reviews": {
        const params = url.searchParams.get("params") || "";
        const data = await cachedGuestyFetch(`reviews:${params}`, `/reviews?${params}`, TTL.reviews);
        return Response.json(data, { headers: corsHeaders });
      }

      case "rate-plans": {
        const id = url.searchParams.get("id");
        if (!id) return Response.json({ error: "Missing id" }, { status: 400, headers: corsHeaders });
        const data = await cachedGuestyFetch(`rp:${id}`, `/listings/${id}/rate-plans`, TTL["rate-plans"]);
        return Response.json(data, { headers: corsHeaders });
      }

      case "payment-provider": {
        const id = url.searchParams.get("id");
        if (!id) return Response.json({ error: "Missing id" }, { status: 400, headers: corsHeaders });
        const data = await cachedGuestyFetch(`pp:${id}`, `/payments/provider?listingId=${id}`, TTL["payment-provider"]);
        return Response.json(data, { headers: corsHeaders });
      }

      // ── Uncacheable mutations ──
      case "quote": {
        if (req.method !== "POST") return Response.json({ error: "POST required" }, { status: 405, headers: corsHeaders });
        const body = await req.json();
        const res = await guestyFetch("/reservations/quotes", { method: "POST", body: JSON.stringify(body) });
        const data = await res.json();
        return Response.json(data, { status: res.ok ? 200 : res.status, headers: corsHeaders });
      }

      case "quote-get": {
        const quoteId = url.searchParams.get("quoteId");
        if (!quoteId) return Response.json({ error: "Missing quoteId" }, { status: 400, headers: corsHeaders });
        const res = await guestyFetch(`/reservations/quotes/${quoteId}`);
        const data = await res.json();
        return Response.json(data, { headers: corsHeaders });
      }

      case "instant-booking": {
        if (req.method !== "POST") return Response.json({ error: "POST required" }, { status: 405, headers: corsHeaders });
        const quoteId = url.searchParams.get("quoteId");
        if (!quoteId) return Response.json({ error: "Missing quoteId" }, { status: 400, headers: corsHeaders });
        const body = await req.json();
        const res = await guestyFetch(`/reservations/quotes/${quoteId}/instant`, { method: "POST", body: JSON.stringify(body) });
        const data = await res.json();
        return Response.json(data, { status: res.ok ? 200 : res.status, headers: corsHeaders });
      }

      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400, headers: corsHeaders });
    }
  } catch (err) {
    console.error("Guesty proxy error:", err);
    const isRateLimit = err instanceof Error && err.message.includes("429");
    return Response.json(
      { error: err instanceof Error ? err.message : "Internal error", retryable: isRateLimit },
      { status: isRateLimit ? 429 : 500, headers: corsHeaders }
    );
  }
});
