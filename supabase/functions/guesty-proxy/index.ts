/**
 * Guesty Booking Engine Proxy
 *
 * Security model:
 *   - Frontend NEVER calls Guesty directly — all traffic goes through this proxy
 *   - VITE_GUESTY_ADMIN_CLIENT_ID / VITE_GUESTY_CLIENT_SECRET live only in Supabase secrets
 *   - Access token is persisted in Redis (guesty:beapi:token hash) and survives restarts
 *   - Token is NEVER regenerated via API — only renewed on natural expiry (TTL set by Guesty)
 *   - In-memory cache sits in front of Redis for zero-latency fast path within the same isolate
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const TTL: Record<string, number> = {
  listings:          20 * 60,
  listing:           15 * 60,
  calendar:           8 * 60,
  cities:        48 * 60 * 60,
  reviews:        2 * 60 * 60,
  "rate-plans":      45 * 60,
  "payment-provider": 2 * 60 * 60,
  "upsell-fees":     30 * 60,
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const jitter = (ms: number) => ms + Math.random() * Math.min(ms * 0.3, 2000);

// ══════════════════════════════════════════════════════════
// TOKEN MANAGEMENT
// Token lifecycle:
//   1. Cold start / isolate spin-up → read from Redis
//   2. Redis hit → populate in-memory, return immediately
//   3. Redis miss + token expired → fetch via OAuth → write back to Redis with TTL
//   4. Token is NEVER force-regenerated; only replaced when Guesty expires it
// ══════════════════════════════════════════════════════════
let memToken: string | null = null;
let memExpiresAt = 0;

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  const BUFFER = 120_000; // 2 min safety buffer

  // 1. Fast path: valid in-memory token
  if (memToken && now < memExpiresAt - BUFFER) return memToken;

  // 2. Try Redis
  const redisUrl = Deno.env.get("REDIS_URL");
  if (redisUrl) {
    try {
      const result = await readTokenFromRedis(redisUrl);
      if (result) {
        memToken = result.token;
        memExpiresAt = result.expiresAt;
        if (now < result.expiresAt - BUFFER) {
          return result.token;
        }
        // Redis token exists but is about to expire — fall through to refresh
      }
    } catch (err) {
      console.error("Redis token read failed:", err);
    }
  }

  // 3. Use in-memory token as fallback if still technically valid
  if (memToken && now < memExpiresAt) {
    console.warn("Using near-expiry in-memory token as fallback");
    return memToken;
  }

  // 4. OAuth refresh — only happens when token is truly expired
  const newToken = await fetchTokenViaOAuth();

  // 5. Write back to Redis immediately so next cold start skips OAuth
  if (redisUrl) {
    writeTokenToRedis(redisUrl, newToken, memExpiresAt).catch((err) =>
      console.error("Redis token write-back failed:", err)
    );
  }

  return newToken;
}

// ── Redis helpers ──────────────────────────────────────────

async function redisCmd(redisUrl: string, ...args: string[]): Promise<string> {
  const url = new URL(redisUrl);
  const hostname = url.hostname;
  const port = parseInt(url.port || "6379");
  const password = url.password || undefined;

  const conn = await Deno.connect({ hostname, port });
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  try {
    async function send(cmd: string): Promise<string> {
      await conn.write(encoder.encode(cmd + "\r\n"));
      const buf = new Uint8Array(8192);
      const n = await conn.read(buf);
      return decoder.decode(buf.subarray(0, n || 0));
    }

    if (password) {
      const auth = await send(`AUTH ${password}`);
      if (!auth.startsWith("+OK")) throw new Error(`Redis AUTH failed: ${auth.trim()}`);
    }

    // Build RESP array command
    const parts = ["*" + args.length];
    for (const a of args) parts.push(`$${a.length}`, a);
    return await send(parts.join("\r\n"));
  } finally {
    try { conn.close(); } catch { /* ignore */ }
  }
}

function parseRedisString(resp: string): string | null {
  if (!resp || resp.startsWith("-") || resp.startsWith("$-1")) return null;
  const match = resp.match(/^\$(\d+)\r\n([\s\S]*)/);
  if (match) return match[2].substring(0, parseInt(match[1]));
  if (resp.startsWith("+")) return resp.slice(1).trim();
  return null;
}

async function readTokenFromRedis(redisUrl: string): Promise<{ token: string; expiresAt: number } | null> {
  // Try guesty:access_token (JSON string)
  try {
    const resp1 = await redisCmd(redisUrl, "GET", "guesty:access_token");
    const raw = parseRedisString(resp1);
    if (raw) {
      const json = JSON.parse(raw);
      const token = json.accessToken || json.access_token;
      const exp = json.expiresAt || json.expires_at;
      if (token) {
        const expiresAt = typeof exp === "number"
          ? (exp > 1e12 ? exp : exp * 1000)
          : Date.now() + 3600_000;
        return { token, expiresAt };
      }
    }
  } catch { /* try next key */ }

  // Try guesty:beapi:token (hash)
  try {
    const resp2 = await redisCmd(redisUrl, "HGET", "guesty:beapi:token", "token");
    const token = parseRedisString(resp2);
    if (token) {
      const resp3 = await redisCmd(redisUrl, "HGET", "guesty:beapi:token", "expires_at");
      const expStr = parseRedisString(resp3);
      const expiresAt = expStr
        ? (Number(expStr) > 1e12 ? Number(expStr) : Number(expStr) * 1000)
        : Date.now() + 3600_000;
      return { token, expiresAt };
    }
  } catch { /* fall through */ }

  return null;
}

async function writeTokenToRedis(redisUrl: string, token: string, expiresAtMs: number): Promise<void> {
  // Write to guesty:beapi:token hash
  // Also set Redis TTL = remaining seconds until Guesty token expires, so Redis auto-expires it
  const expiresAtSec = Math.floor(expiresAtMs / 1000);
  const ttlSec = Math.max(60, Math.floor((expiresAtMs - Date.now()) / 1000));

  await redisCmd(redisUrl, "HSET", "guesty:beapi:token", "token", token, "expires_at", String(expiresAtSec));
  // Set key TTL so Redis auto-deletes when token expires — never manually deleted
  await redisCmd(redisUrl, "EXPIRE", "guesty:beapi:token", String(ttlSec));
  console.log(`Token written to Redis (TTL: ${ttlSec}s)`);
}

// ── OAuth fetch (only when Redis has no valid token) ───────

async function fetchTokenViaOAuth(): Promise<string> {
  const now = Date.now();
  const clientId = Deno.env.get("GUESTY_CLIENT_ID");
  const clientSecret = Deno.env.get("GUESTY_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    if (memToken && now < memExpiresAt) {
      console.warn("No OAuth credentials — using existing in-memory token");
      return memToken;
    }
    throw new Error("Guesty credentials not configured and no valid cached token");
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    if (attempt > 0) await sleep(jitter(2000 * 2 ** attempt));

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
      console.log(`New Guesty token fetched via OAuth (expires_in: ${d.expires_in}s)`);
      return d.access_token;
    }

    if (res.status === 429) {
      const retryAfter = res.headers.get("Retry-After");
      if (retryAfter) {
        const w = parseInt(retryAfter, 10);
        if (!isNaN(w) && w > 0 && w < 180) await sleep(w * 1000);
      }
      if (memToken && now < memExpiresAt) return memToken;
      continue;
    }
    if (res.status === 401 || res.status === 403) {
      throw new Error(`Guesty OAuth: invalid credentials (${res.status})`);
    }
    console.error(`OAuth error ${res.status}:`, (await res.text()).slice(0, 200));
  }

  if (memToken && now < memExpiresAt) return memToken;
  throw new Error("Guesty API temporarily unavailable after 5 retries");
}

// ══════════════════════════════════════════════════════════
// RESPONSE CACHE (in-memory, stale-while-revalidate)
// ══════════════════════════════════════════════════════════
interface CacheEntry { data: unknown; cachedAt: number; ttl: number; }
const responseCache = new Map<string, CacheEntry>();

function getCached(key: string, ttl: number): { data: unknown; fresh: boolean } | null {
  const entry = responseCache.get(key);
  if (!entry) return null;
  const age = (Date.now() - entry.cachedAt) / 1000;
  if (age > ttl * 3) { responseCache.delete(key); return null; }
  return { data: entry.data, fresh: age <= ttl };
}

function setCache(key: string, data: unknown, ttl: number) {
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
    await res.text();
    const retryAfter = res.headers.get("Retry-After");
    const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : 5000;
    await sleep(Math.min(waitMs, 15000));
    const retryToken = await getAccessToken();
    return fetch(`${base}${path}`, {
      ...options,
      headers: { ...headers, Authorization: `Bearer ${retryToken}` },
    });
  }

  return res;
}

async function cachedGuestyFetch(
  cacheKey: string,
  path: string,
  ttl: number
): Promise<{ data: unknown; fromCache: boolean }> {
  const cached = getCached(cacheKey, ttl);

  if (cached?.fresh) return { data: cached.data, fromCache: true };

  if (cached && !cached.fresh) {
    // Stale — return immediately, revalidate in background
    guestyFetch(path).then(async (res) => {
      if (res.ok) setCache(cacheKey, await res.json(), ttl);
      else await res.text();
    }).catch(() => {});
    return { data: cached.data, fromCache: true };
  }

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

      // ── NEW: upsell fees — shown in Book.tsx before Stripe payment ──
      case "upsell-fees": {
        const id = url.searchParams.get("id");
        if (!id) return Response.json({ error: "Missing id" }, { status: 400, headers: corsHeaders });
        const { data } = await cachedGuestyFetch(`upsell:${id}`, `/listings/${id}/upsell-fees`, TTL["upsell-fees"]);
        return Response.json(data, { headers: corsHeaders });
      }

      // ── Mutations (uncacheable) ──────────────────────────────────────

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
