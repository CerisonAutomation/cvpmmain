/**
 * Guesty Booking Engine Proxy
 *
 * Guesty Booking Engine Proxy (Zenith Version)
 *
 * Security model:
 *   - Frontend NEVER calls Guesty directly — all traffic goes through this proxy
 *   - Access token is read ONLY from Redis (populated by external cron/service)
 *   - In-memory cache sits in front of Redis for zero-latency fast path
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
// TOKEN MANAGEMENT (Redis-Only)
// ══════════════════════════════════════════════════════════
let memToken: string | null = null;
let memExpiresAt = 0;

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  const BUFFER = 60_000; // 1 min safety buffer

  // 1. Memory Check
  if (memToken && now < memExpiresAt - BUFFER) return memToken;

  // 2. Redis Fetch
  const redisUrl = Deno.env.get("REDIS_URL");
  if (!redisUrl) throw new Error("REDIS_URL not configured");

  const result = await readTokenFromRedis(redisUrl);
  if (result && now < result.expiresAt - BUFFER) {
    memToken = result.token;
    memExpiresAt = result.expiresAt;
    return result.token;
  }

  // 3. Fallback to existing memory if no other choice
  if (memToken && now < memExpiresAt) return memToken;

  throw new Error("No valid Guesty token found in Redis or memory");
}

// ── Redis helpers ──────────────────────────────────────────

function buildResp(args: string[]): Uint8Array {
  const encoder = new TextEncoder();
  let cmd = `*${args.length}\r\n`;
  for (const arg of args) {
    cmd += `$${encoder.encode(arg).length}\r\n${arg}\r\n`;
  }
  return encoder.encode(cmd);
}

async function redisCmd(redisUrl: string, ...args: string[]): Promise<string> {
  const url = new URL(redisUrl);
  const conn = await Deno.connect({ hostname: url.hostname, port: parseInt(url.port || "6379") });
  const decoder = new TextDecoder();

  try {
    if (url.password) {
      await conn.write(buildResp(["AUTH", url.password]));
      const buf = new Uint8Array(1024);
      const n = await conn.read(buf);
      const res = decoder.decode(buf.subarray(0, n || 0));
      if (!res.startsWith("+OK")) throw new Error(`Redis AUTH failed: ${res.trim()}`);
    }

    await conn.write(buildResp(args));
    const buf = new Uint8Array(8192);
    const n = await conn.read(buf);
    return decoder.decode(buf.subarray(0, n || 0));
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
  try {
    const resp = await redisCmd(redisUrl, "HGETALL", "guesty:beapi:token");
    if (!resp || resp.startsWith("*-1") || resp.startsWith("*0")) return null;

    // Very simple RESP HGETALL parser (expects *4 \r\n $5 \r\n token \r\n $... \r\n value \r\n ...)
    const lines = resp.split("\r\n");
    let token = "";
    let exp = 0;

    for (let i = 1; i < lines.length; i += 2) {
      const key = lines[i + 1];
      const val = lines[i + 3];
      if (key === "token") token = val;
      if (key === "expires_at") exp = Number(val);
      i += 2;
    }

    if (token) {
      return { token, expiresAt: exp > 1e12 ? exp : exp * 1000 };
    }
  } catch (err) {
    console.error("Redis read failed:", err);
  }
  return null;
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

      case "payment-provider": {
        const id = url.searchParams.get("id");
        if (!id) return Response.json({ error: "Missing id" }, { status: 400, headers: corsHeaders });
        const { data } = await cachedGuestyFetch(`pp:${id}`, `/listings/${id}/payment-provider`, TTL["payment-provider"]);
        return Response.json(data, { headers: corsHeaders });
      }

      case "upsell-fees": {
        const listingId = url.searchParams.get("id");
        const inquiryId = url.searchParams.get("inquiryId");
        if (!listingId) return Response.json({ error: "Missing id" }, { status: 400, headers: corsHeaders });
        const path = inquiryId
          ? `/reservations/upsell/${inquiryId}/${listingId}/fee`
          : `/listings/${listingId}/upsell-fees`;
        const { data } = await cachedGuestyFetch(`upsell:${listingId}:${inquiryId}`, path, TTL["upsell-fees"]);
        return Response.json(data, { headers: corsHeaders });
      }

      // ── Zenith Mutations ──────────────────────────────────────────

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

      case "quote-coupons": {
        if (req.method !== "POST") return Response.json({ error: "POST required" }, { status: 405, headers: corsHeaders });
        const quoteId = url.searchParams.get("quoteId");
        const body = await req.json();
        const res = await guestyFetch(`/reservations/quotes/${quoteId}/coupons`, { method: "POST", body: JSON.stringify(body) });
        const data = await res.json();
        return Response.json(data, { status: res.ok ? 200 : res.status, headers: corsHeaders });
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

      case "inquiry-booking": {
        if (req.method !== "POST") return Response.json({ error: "POST required" }, { status: 405, headers: corsHeaders });
        const quoteId = url.searchParams.get("quoteId");
        const body = await req.json();
        const res = await guestyFetch(`/reservations/quotes/${quoteId}/inquiry`, { method: "POST", body: JSON.stringify(body) });
        const data = await res.json();
        return Response.json(data, { status: res.ok ? 200 : res.status, headers: corsHeaders });
      }

      case "instant-charge": {
        if (req.method !== "POST") return Response.json({ error: "POST required" }, { status: 405, headers: corsHeaders });
        const quoteId = url.searchParams.get("quoteId");
        const body = await req.json();
        const res = await guestyFetch(`/reservations/quotes/${quoteId}/instant-charge`, { method: "POST", body: JSON.stringify(body) });
        const data = await res.json();
        return Response.json(data, { status: res.ok ? 200 : res.status, headers: corsHeaders });
      }

      case "reservation-details": {
        const resId = url.searchParams.get("reservationId");
        const res = await guestyFetch(`/reservations/${resId}/details`);
        const data = await res.json();
        return Response.json(data, { headers: corsHeaders });
      }

      case "verify-payment": {
        if (req.method !== "POST") return Response.json({ error: "POST required" }, { status: 405, headers: corsHeaders });
        const resId = url.searchParams.get("reservationId");
        const body = await req.json();
        const res = await guestyFetch(`/reservations/${resId}/verify-payment`, { method: "POST", body: JSON.stringify(body) });
        const data = await res.json();
        return Response.json(data, { status: res.ok ? 200 : res.status, headers: corsHeaders });
      }

      case "payouts": {
        const params = url.searchParams.get("params") || "";
        const res = await guestyFetch(`/reservations/payouts/list?${params}`);
        const data = await res.json();
        return Response.json(data, { headers: corsHeaders });
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
