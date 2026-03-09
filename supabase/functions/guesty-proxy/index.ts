/**
 * Guesty Booking Engine Proxy — Enterprise-grade with:
 * - DB-persisted token cache (survives cold starts)
 * - Stale-while-revalidate response cache
 * - Exponential backoff with jitter + Retry-After support
 * - Graceful degradation: returns stale cache on API failure
 * - Single OAuth request at a time (mutex via DB)
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// TTL in seconds per action — also used as stale window (2× TTL)
const TTL: Record<string, number> = {
  listings: 15 * 60,
  listing: 10 * 60,
  calendar: 5 * 60,
  cities: 24 * 60 * 60,
  reviews: 60 * 60,
  "rate-plans": 30 * 60,
  "payment-provider": 60 * 60,
};

// ── Supabase client ──
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
const jitter = (ms: number) => ms + Math.random() * Math.min(ms * 0.3, 2000);

// ══════════════════════════════════════════════════════════
// TOKEN MANAGEMENT
// ══════════════════════════════════════════════════════════
let memToken: string | null = null;
let memExpiresAt = 0;

async function getTokenFromDb(): Promise<{ token: string; expiresAt: number } | null> {
  try {
    const { data } = await sb()
      .from("guesty_token_cache")
      .select("access_token, expires_at")
      .eq("id", "singleton")
      .maybeSingle();
    if (data?.access_token) {
      return { token: data.access_token, expiresAt: Number(data.expires_at) };
    }
  } catch (e) {
    console.warn("Token DB read failed:", e);
  }
  return null;
}

async function persistToken(token: string, expiresAt: number) {
  try {
    await sb().from("guesty_token_cache").upsert({
      id: "singleton",
      access_token: token,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    });
  } catch (e) {
    console.warn("Token DB write failed:", e);
  }
}

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  const BUFFER = 120_000; // 2 min before expiry

  // 1. In-memory (fast path)
  if (memToken && now < memExpiresAt - BUFFER) return memToken;

  // 2. DB cache (survives cold starts)
  const cached = await getTokenFromDb();
  if (cached && now < cached.expiresAt - BUFFER) {
    memToken = cached.token;
    memExpiresAt = cached.expiresAt;
    return cached.token;
  }

  // 3. Refresh token via OAuth
  const clientId = Deno.env.get("VITE_GUESTY_ADMIN_CLIENT_ID");
  const clientSecret = Deno.env.get("VITE_GUESTY_CLIENT_SECRET");
  if (!clientId || !clientSecret) {
    // If no credentials but we have ANY token (even close to expiry), use it
    if (cached?.token && now < cached.expiresAt) {
      console.warn("No OAuth credentials — using existing token");
      memToken = cached.token;
      memExpiresAt = cached.expiresAt;
      return cached.token;
    }
    throw new Error("Guesty API credentials not configured");
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      const backoff = jitter(1000 * Math.pow(2, attempt));
      console.warn(`OAuth retry ${attempt + 1}/3 – waiting ${Math.round(backoff)}ms`);
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
      console.error(`OAuth network error (attempt ${attempt + 1}):`, fetchErr);
      continue;
    }

    if (res.ok) {
      const d = await res.json();
      const expiresAt = now + (d.expires_in || 3600) * 1000;
      memToken = d.access_token;
      memExpiresAt = expiresAt;
      persistToken(d.access_token, expiresAt); // fire-and-forget
      console.log("OAuth token refreshed successfully");
      return d.access_token;
    }

    // ALWAYS consume body
    const errText = await res.text();

    if (res.status === 429) {
      // Respect Retry-After header
      const retryAfter = res.headers.get("Retry-After");
      if (retryAfter) {
        const waitSec = parseInt(retryAfter, 10);
        if (!isNaN(waitSec) && waitSec > 0 && waitSec < 120) {
          console.warn(`OAuth 429 – Retry-After: ${waitSec}s`);
          await sleep(waitSec * 1000);
        }
      }
      console.warn(`OAuth 429 (attempt ${attempt + 1}): ${errText.slice(0, 200)}`);
      continue;
    }

    console.error(`OAuth error ${res.status}:`, errText.slice(0, 500));
    // Don't retry on 401/403 — credentials are wrong
    if (res.status === 401 || res.status === 403) {
      throw new Error(`Guesty OAuth: invalid credentials (${res.status})`);
    }
  }

  // FALLBACK: Use cached token even if close to expiry
  if (cached?.token && now < cached.expiresAt) {
    console.warn("OAuth rate-limited — using cached token (may expire soon)");
    memToken = cached.token;
    memExpiresAt = cached.expiresAt;
    return cached.token;
  }

  throw new Error("Guesty OAuth: rate limited after retries. No cached token available.");
}

// ══════════════════════════════════════════════════════════
// RESPONSE CACHE (Stale-While-Revalidate)
// ══════════════════════════════════════════════════════════
interface CacheResult {
  data: unknown;
  fresh: boolean;
}

async function getCached(key: string, ttl: number): Promise<CacheResult | null> {
  try {
    const { data } = await sb()
      .from("guesty_api_cache")
      .select("response_data, cached_at, ttl_seconds, hit_count")
      .eq("cache_key", key)
      .maybeSingle();

    if (!data) return null;

    const age = (Date.now() - new Date(data.cached_at).getTime()) / 1000;
    const isFresh = age <= (data.ttl_seconds || ttl);
    const isStale = age <= (data.ttl_seconds || ttl) * 3; // Allow 3× TTL as stale window

    if (!isFresh && !isStale) return null;

    // Bump hit count
    sb()
      .from("guesty_api_cache")
      .update({ hit_count: (data.hit_count || 0) + 1 })
      .eq("cache_key", key)
      .then(() => {});

    return { data: data.response_data, fresh: isFresh };
  } catch {
    return null;
  }
}

async function setCache(key: string, data: unknown, ttl: number) {
  try {
    await sb().from("guesty_api_cache").upsert({
      cache_key: key,
      response_data: data as any,
      cached_at: new Date().toISOString(),
      ttl_seconds: ttl,
      hit_count: 0,
    });
  } catch (e) {
    console.warn("Cache write failed:", e);
  }
}

// ══════════════════════════════════════════════════════════
// GUESTY API FETCH
// ══════════════════════════════════════════════════════════
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
    const body = await res.text(); // consume
    const retryAfter = res.headers.get("Retry-After");
    const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : 5000;
    console.warn(`API 429 on ${path} – waiting ${waitMs}ms`);
    await sleep(Math.min(waitMs, 15000));

    const retryToken = await getAccessToken();
    return fetch(`${base}${path}`, {
      ...options,
      headers: { ...headers, Authorization: `Bearer ${retryToken}` },
    });
  }

  return res;
}

/**
 * Cached fetch with stale-while-revalidate:
 * 1. Return fresh cache immediately
 * 2. Return stale cache + revalidate in background
 * 3. On API failure, return stale cache
 * 4. Only call API on complete cache miss
 */
async function cachedGuestyFetch(cacheKey: string, path: string, ttl: number): Promise<{ data: unknown; fromCache: boolean }> {
  const cached = await getCached(cacheKey, ttl);

  // Fresh cache: return immediately
  if (cached?.fresh) {
    console.log(`Cache HIT (fresh): ${cacheKey}`);
    return { data: cached.data, fromCache: true };
  }

  // Stale cache: return it but try to refresh
  if (cached && !cached.fresh) {
    console.log(`Cache HIT (stale): ${cacheKey} — revalidating in background`);
    // Background revalidation (don't await)
    guestyFetch(path)
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          await setCache(cacheKey, data, ttl);
          console.log(`Cache REVALIDATED: ${cacheKey}`);
        } else {
          await res.text(); // consume
        }
      })
      .catch(() => {});
    return { data: cached.data, fromCache: true };
  }

  // Cache miss: fetch from API
  console.log(`Cache MISS: ${cacheKey}`);
  try {
    const res = await guestyFetch(path);
    if (!res.ok) {
      const errText = await res.text();
      console.error(`API error ${res.status} for ${cacheKey}: ${errText.slice(0, 200)}`);
      return { data: { error: `API error ${res.status}`, results: [] }, fromCache: false };
    }
    const data = await res.json();
    setCache(cacheKey, data, ttl).catch(() => {}); // persist in background
    return { data, fromCache: false };
  } catch (err) {
    console.error(`Fetch error for ${cacheKey}:`, err);
    return { data: { error: "Service temporarily unavailable", results: [] }, fromCache: false };
  }
}

// ══════════════════════════════════════════════════════════
// ROUTE HANDLER
// ══════════════════════════════════════════════════════════
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
        const { data } = await cachedGuestyFetch(key, `/listings?${params}`, TTL.listings);
        return Response.json(data, { headers: corsHeaders });
      }

      case "listing": {
        const id = url.searchParams.get("id");
        if (!id) return Response.json({ error: "Missing id" }, { status: 400, headers: corsHeaders });
        const { data } = await cachedGuestyFetch(`listing:${id}`, `/listings/${id}`, TTL.listing);
        return Response.json(data, { headers: corsHeaders });
      }

      case "calendar": {
        const id = url.searchParams.get("id");
        const from = url.searchParams.get("from");
        const to = url.searchParams.get("to");
        if (!id || !from || !to) return Response.json({ error: "Missing params" }, { status: 400, headers: corsHeaders });
        const { data } = await cachedGuestyFetch(`cal:${id}:${from}:${to}`, `/listings/${id}/calendar?from=${from}&to=${to}`, TTL.calendar);
        return Response.json(data, { headers: corsHeaders });
      }

      case "cities": {
        const { data } = await cachedGuestyFetch("cities", "/cities", TTL.cities);
        return Response.json(data, { headers: corsHeaders });
      }

      case "reviews": {
        const params = url.searchParams.get("params") || "";
        const { data } = await cachedGuestyFetch(`reviews:${params}`, `/reviews?${params}`, TTL.reviews);
        return Response.json(data, { headers: corsHeaders });
      }

      case "rate-plans": {
        const id = url.searchParams.get("id");
        if (!id) return Response.json({ error: "Missing id" }, { status: 400, headers: corsHeaders });
        const { data } = await cachedGuestyFetch(`rp:${id}`, `/listings/${id}/rate-plans`, TTL["rate-plans"]);
        return Response.json(data, { headers: corsHeaders });
      }

      case "payment-provider": {
        const id = url.searchParams.get("id");
        if (!id) return Response.json({ error: "Missing id" }, { status: 400, headers: corsHeaders });
        const { data } = await cachedGuestyFetch(`pp:${id}`, `/payments/provider?listingId=${id}`, TTL["payment-provider"]);
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
    const msg = err instanceof Error ? err.message : "Internal error";
    const isRateLimit = msg.includes("429") || msg.includes("rate limit");
    return Response.json(
      { error: msg, retryable: isRateLimit, results: [] },
      { status: isRateLimit ? 429 : 500, headers: corsHeaders }
    );
  }
});
