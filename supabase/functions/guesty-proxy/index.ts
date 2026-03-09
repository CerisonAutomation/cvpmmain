/**
 * Guesty Booking Engine Proxy — In-Memory Only
 * 
 * - Pure in-memory token + response cache (no DB tables needed)
 * - Stale-while-revalidate response strategy
 * - Exponential backoff with jitter + Retry-After
 * - Graceful degradation: stale cache on API failure
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// Increased TTL to reduce API pressure during rate limits
const TTL: Record<string, number> = {
  listings: 20 * 60,      // 20 min (was 15)
  listing: 15 * 60,       // 15 min (was 10)
  calendar: 8 * 60,       // 8 min (was 5)
  cities: 48 * 60 * 60,   // 48h (was 24h)
  reviews: 2 * 60 * 60,   // 2h (was 1h)
  "rate-plans": 45 * 60,  // 45 min (was 30)
  "payment-provider": 2 * 60 * 60, // 2h (was 1h)
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const jitter = (ms: number) => ms + Math.random() * Math.min(ms * 0.3, 2000);

// ══════════════════════════════════════════════════════════
// IN-MEMORY TOKEN CACHE
// ══════════════════════════════════════════════════════════
let memToken: string | null = null;
let memExpiresAt = 0;

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  const BUFFER = 120_000; // 2 min before expiry

  // Fast path: valid in-memory token
  if (memToken && now < memExpiresAt - BUFFER) return memToken;

  const clientId = Deno.env.get("VITE_GUESTY_ADMIN_CLIENT_ID");
  const clientSecret = Deno.env.get("VITE_GUESTY_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    // Use existing token even if close to expiry
    if (memToken && now < memExpiresAt) {
      console.warn("No OAuth credentials — using existing in-memory token");
      return memToken;
    }
    throw new Error("Guesty API credentials not configured");
  }

  // Increased retry attempts for better rate limit resilience
  for (let attempt = 0; attempt < 5; attempt++) {
    if (attempt > 0) {
      // More generous backoff: 2s, 5s, 10s, 20s
      await sleep(jitter(2000 * Math.pow(2, attempt)));
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
      memToken = d.access_token;
      memExpiresAt = now + (d.expires_in || 3600) * 1000;
      console.log("OAuth token refreshed");
      return d.access_token;
    }

    const errText = await res.text(); // always consume body

    if (res.status === 429) {
      const retryAfter = res.headers.get("Retry-After");
      if (retryAfter) {
        const waitSec = parseInt(retryAfter, 10);
        if (!isNaN(waitSec) && waitSec > 0 && waitSec < 180) {
          console.warn(`OAuth 429 — respecting Retry-After: ${waitSec}s`);
          await sleep(waitSec * 1000);
        }
      }
      console.warn(`OAuth 429 (attempt ${attempt + 1}/5)`);
      // If we have a token that's still valid, use it immediately
      if (memToken && now < memExpiresAt) {
        console.warn("Using cached token due to rate limit");
        return memToken;
      }
      continue;
    }

    // Fail fast on auth errors
    if (res.status === 401 || res.status === 403) {
      throw new Error(`Guesty OAuth: invalid credentials (${res.status})`);
    }

    console.error(`OAuth error ${res.status}:`, errText.slice(0, 200));
  }

  // Final fallback: use existing token even if near expiry
  if (memToken && now < memExpiresAt) {
    console.warn("OAuth exhausted retries — using cached token");
    return memToken;
  }

  throw new Error("Guesty API temporarily unavailable (rate limited)");
}

// ══════════════════════════════════════════════════════════
// IN-MEMORY RESPONSE CACHE
// ══════════════════════════════════════════════════════════
interface CacheEntry {
  data: unknown;
  cachedAt: number;
  ttl: number;
}

const responseCache = new Map<string, CacheEntry>();

function getCached(key: string, ttl: number): { data: unknown; fresh: boolean } | null {
  const entry = responseCache.get(key);
  if (!entry) return null;

  const age = (Date.now() - entry.cachedAt) / 1000;
  const isFresh = age <= ttl;
  const isStale = age <= ttl * 3;

  if (!isFresh && !isStale) {
    responseCache.delete(key);
    return null;
  }

  return { data: entry.data, fresh: isFresh };
}

function setCache(key: string, data: unknown, ttl: number) {
  // Cap cache at 200 entries to prevent memory bloat
  if (responseCache.size > 200) {
    const oldest = responseCache.keys().next().value;
    if (oldest) responseCache.delete(oldest);
  }
  responseCache.set(key, { data, cachedAt: Date.now(), ttl });
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
    const _body = await res.text();
    const retryAfter = res.headers.get("Retry-After");
    const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : 5000;
    console.warn(`API 429 on ${path} — waiting ${Math.min(waitMs, 15000)}ms`);
    await sleep(Math.min(waitMs, 15000));

    const retryToken = await getAccessToken();
    return fetch(`${base}${path}`, {
      ...options,
      headers: { ...headers, Authorization: `Bearer ${retryToken}` },
    });
  }

  return res;
}

/** SWR fetch: fresh cache → instant, stale → return + revalidate bg, miss → fetch */
async function cachedGuestyFetch(
  cacheKey: string,
  path: string,
  ttl: number
): Promise<{ data: unknown; fromCache: boolean }> {
  const cached = getCached(cacheKey, ttl);

  if (cached?.fresh) {
    return { data: cached.data, fromCache: true };
  }

  if (cached && !cached.fresh) {
    // Background revalidation
    guestyFetch(path)
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setCache(cacheKey, data, ttl);
        } else {
          await res.text();
        }
      })
      .catch(() => {});
    return { data: cached.data, fromCache: true };
  }

  // Cache miss
  try {
    const res = await guestyFetch(path);
    if (!res.ok) {
      const errText = await res.text();
      console.error(`API ${res.status} for ${cacheKey}: ${errText.slice(0, 200)}`);
      return { data: { error: `API error ${res.status}`, results: [] }, fromCache: false };
    }
    const data = await res.json();
    setCache(cacheKey, data, ttl);
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
      case "listings": {
        const params = url.searchParams.get("params") || "";
        const { data } = await cachedGuestyFetch(`listings:${params}`, `/listings?${params}`, TTL.listings);
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

      // Mutations (uncacheable)
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
