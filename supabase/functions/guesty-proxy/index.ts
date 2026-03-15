/**
 * Guesty Booking Engine Proxy
 *
 * Security model:
 *   - Frontend NEVER calls Guesty directly — all traffic goes through this proxy
 *   - GUESTY_CLIENT_ID / GUESTY_CLIENT_SECRET live only in Supabase secrets
 *   - Access token is persisted in Redis and survives restarts
 *   - Token is NEVER force-regenerated via API — only renewed on natural expiry
 *   - Every incoming request is validated with Zod before touching Guesty
 */

import {
  ActionSchema,
  ListingsParamsSchema,
  ListingParamsSchema,
  CalendarParamsSchema,
  ReviewsParamsSchema,
  SingleIdParamsSchema,
  QuoteBodySchema,
  QuoteGetParamsSchema,
  InstantBookingSchema,
} from "./schemas.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const TTL: Record<string, number> = {
  listings:           20 * 60,
  listing:            15 * 60,
  calendar:            8 * 60,
  cities:         48 * 60 * 60,
  reviews:         2 * 60 * 60,
  "rate-plans":       45 * 60,
  "payment-provider":  2 * 60 * 60,
  "upsell-fees":      30 * 60,
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const jitter = (ms: number) => ms + Math.random() * Math.min(ms * 0.3, 2000);

function badRequest(details: unknown) {
  return Response.json(
    { error: "VALIDATION_ERROR", details },
    { status: 400, headers: corsHeaders }
  );
}

// ══════════════════════════════════════════════════════════
// TOKEN MANAGEMENT
// ══════════════════════════════════════════════════════════
let memToken: string | null = null;
let memExpiresAt = 0;

async function getAccessToken(): Promise<string> {
  const now = Date.now();
  const BUFFER = 120_000;

  if (memToken && now < memExpiresAt - BUFFER) return memToken;

  const redisUrl = Deno.env.get("REDIS_URL");
  if (redisUrl) {
    try {
      const result = await readTokenFromRedis(redisUrl);
      if (result) {
        memToken = result.token;
        memExpiresAt = result.expiresAt;
        if (now < result.expiresAt - BUFFER) return result.token;
      }
    } catch (err) {
      console.error("Redis token read failed:", err);
    }
  }

  if (memToken && now < memExpiresAt) {
    console.warn("Using near-expiry in-memory token");
    return memToken;
  }

  const newToken = await fetchTokenViaOAuth();

  if (redisUrl) {
    writeTokenToRedis(redisUrl, newToken, memExpiresAt).catch((err) =>
      console.error("Redis write-back failed:", err)
    );
  }

  return newToken;
}

async function redisCmd(redisUrl: string, ...args: string[]): Promise<string> {
  const url = new URL(redisUrl);
  const conn = await Deno.connect({ hostname: url.hostname, port: parseInt(url.port || "6379") });
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  try {
    async function send(cmd: string): Promise<string> {
      await conn.write(encoder.encode(cmd + "\r\n"));
      const buf = new Uint8Array(8192);
      const n = await conn.read(buf);
      return decoder.decode(buf.subarray(0, n || 0));
    }
    if (url.password) {
      const auth = await send(`AUTH ${url.password}`);
      if (!auth.startsWith("+OK")) throw new Error(`Redis AUTH failed: ${auth.trim()}`);
    }
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
  try {
    const resp1 = await redisCmd(redisUrl, "GET", "guesty:access_token");
    const raw = parseRedisString(resp1);
    if (raw) {
      const json = JSON.parse(raw);
      const token = json.accessToken || json.access_token;
      const exp = json.expiresAt || json.expires_at;
      if (token) {
        const expiresAt = typeof exp === "number" ? (exp > 1e12 ? exp : exp * 1000) : Date.now() + 3600_000;
        return { token, expiresAt };
      }
    }
  } catch { /* try next key */ }
  try {
    const resp2 = await redisCmd(redisUrl, "HGET", "guesty:beapi:token", "token");
    const token = parseRedisString(resp2);
    if (token) {
      const resp3 = await redisCmd(redisUrl, "HGET", "guesty:beapi:token", "expires_at");
      const expStr = parseRedisString(resp3);
      const expiresAt = expStr ? (Number(expStr) > 1e12 ? Number(expStr) : Number(expStr) * 1000) : Date.now() + 3600_000;
      return { token, expiresAt };
    }
  } catch { /* fall through */ }
  return null;
}

async function writeTokenToRedis(redisUrl: string, token: string, expiresAtMs: number): Promise<void> {
  const expiresAtSec = Math.floor(expiresAtMs / 1000);
  const ttlSec = Math.max(60, Math.floor((expiresAtMs - Date.now()) / 1000));
  await redisCmd(redisUrl, "HSET", "guesty:beapi:token", "token", token, "expires_at", String(expiresAtSec));
  await redisCmd(redisUrl, "EXPIRE", "guesty:beapi:token", String(ttlSec));
  console.log(`Token written to Redis (TTL: ${ttlSec}s)`);
}

async function fetchTokenViaOAuth(): Promise<string> {
  const now = Date.now();
  const clientId = Deno.env.get("GUESTY_CLIENT_ID");
  const clientSecret = Deno.env.get("GUESTY_CLIENT_SECRET");
  if (!clientId || !clientSecret) {
    if (memToken && now < memExpiresAt) return memToken;
    throw new Error("Guesty credentials not configured and no cached token");
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
      return d.access_token;
    }
    if (res.status === 429) {
      const w = parseInt(res.headers.get("Retry-After") || "0", 10);
      if (w > 0 && w < 180) await sleep(w * 1000);
      if (memToken && now < memExpiresAt) return memToken;
      continue;
    }
    if (res.status === 401 || res.status === 403) throw new Error(`Guesty OAuth invalid credentials (${res.status})`);
    console.error(`OAuth error ${res.status}:`, (await res.text()).slice(0, 200));
  }
  if (memToken && now < memExpiresAt) return memToken;
  throw new Error("Guesty API unavailable after 5 retries");
}

// ══════════════════════════════════════════════════════════
// RESPONSE CACHE
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

async function guestyFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();
  const base = "https://booking.guesty.com/api";
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json", ...(options.headers || {}) };
  const res = await fetch(`${base}${path}`, { ...options, headers });
  if (res.status === 429) {
    await res.text();
    const w = parseInt(res.headers.get("Retry-After") || "0", 10) * 1000 || 5000;
    await sleep(Math.min(w, 15000));
    const retryToken = await getAccessToken();
    return fetch(`${base}${path}`, { ...options, headers: { ...headers, Authorization: `Bearer ${retryToken}` } });
  }
  return res;
}

async function cachedFetch(cacheKey: string, path: string, ttl: number): Promise<unknown> {
  const cached = getCached(cacheKey, ttl);
  if (cached?.fresh) return cached.data;
  if (cached && !cached.fresh) {
    guestyFetch(path).then(async (res) => { if (res.ok) setCache(cacheKey, await res.json(), ttl); else await res.text(); }).catch(() => {});
    return cached.data;
  }
  const res = await guestyFetch(path);
  if (!res.ok) {
    const errText = await res.text();
    console.error(`API ${res.status} for ${cacheKey}: ${errText.slice(0, 200)}`);
    return { error: `API error ${res.status}`, results: [] };
  }
  const data = await res.json();
  setCache(cacheKey, data, ttl);
  return data;
}

// ══════════════════════════════════════════════════════════
// ROUTE HANDLER
// ══════════════════════════════════════════════════════════
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);

    // 1. Validate action first — allowlist enforcement
    const actionResult = ActionSchema.safeParse(url.searchParams.get("action"));
    if (!actionResult.success) return badRequest(actionResult.error.flatten());
    const action = actionResult.data;

    switch (action) {

      // ── listings ──────────────────────────────────────────────
      case "listings": {
        const rawParams = Object.fromEntries(
          new URLSearchParams(url.searchParams.get("params") || "")
        );
        const parsed = ListingsParamsSchema.safeParse(rawParams);
        if (!parsed.success) return badRequest(parsed.error.flatten());
        const safeParams = new URLSearchParams(
          Object.entries(parsed.data).flatMap(([k, v]) => v == null ? [] : [[k, String(v)]])
        ).toString();
        const data = await cachedFetch(`listings:${safeParams}`, `/listings?${safeParams}`, TTL.listings);
        return Response.json(data, { headers: corsHeaders });
      }

      // ── listing ───────────────────────────────────────────────
      case "listing": {
        const parsed = ListingParamsSchema.safeParse({ id: url.searchParams.get("id") });
        if (!parsed.success) return badRequest(parsed.error.flatten());
        const { id } = parsed.data;
        const data = await cachedFetch(`listing:${id}`, `/listings/${id}`, TTL.listing);
        return Response.json(data, { headers: corsHeaders });
      }

      // ── calendar ──────────────────────────────────────────────
      case "calendar": {
        const parsed = CalendarParamsSchema.safeParse({
          id:   url.searchParams.get("id"),
          from: url.searchParams.get("from"),
          to:   url.searchParams.get("to"),
        });
        if (!parsed.success) return badRequest(parsed.error.flatten());
        const { id, from, to } = parsed.data;
        const data = await cachedFetch(`cal:${id}:${from}:${to}`, `/listings/${id}/calendar?from=${from}&to=${to}`, TTL.calendar);
        return Response.json(data, { headers: corsHeaders });
      }

      // ── cities ────────────────────────────────────────────────
      case "cities": {
        const data = await cachedFetch("cities", "/cities", TTL.cities);
        return Response.json(data, { headers: corsHeaders });
      }

      // ── reviews ───────────────────────────────────────────────
      case "reviews": {
        const rawParams = Object.fromEntries(
          new URLSearchParams(url.searchParams.get("params") || "")
        );
        const parsed = ReviewsParamsSchema.safeParse(rawParams);
        if (!parsed.success) return badRequest(parsed.error.flatten());
        const safeParams = new URLSearchParams(
          Object.entries(parsed.data).flatMap(([k, v]) => v == null ? [] : [[k, String(v)]])
        ).toString();
        const data = await cachedFetch(`reviews:${safeParams}`, `/reviews?${safeParams}`, TTL.reviews);
        return Response.json(data, { headers: corsHeaders });
      }

      // ── rate-plans ────────────────────────────────────────────
      case "rate-plans": {
        const parsed = SingleIdParamsSchema.safeParse({ id: url.searchParams.get("id") });
        if (!parsed.success) return badRequest(parsed.error.flatten());
        const { id } = parsed.data;
        const data = await cachedFetch(`rp:${id}`, `/listings/${id}/rate-plans`, TTL["rate-plans"]);
        return Response.json(data, { headers: corsHeaders });
      }

      // ── payment-provider ──────────────────────────────────────
      case "payment-provider": {
        const parsed = SingleIdParamsSchema.safeParse({ id: url.searchParams.get("id") });
        if (!parsed.success) return badRequest(parsed.error.flatten());
        const { id } = parsed.data;
        const data = await cachedFetch(`pp:${id}`, `/payments/provider?listingId=${id}`, TTL["payment-provider"]);
        return Response.json(data, { headers: corsHeaders });
      }

      // ── upsell-fees ───────────────────────────────────────────
      case "upsell-fees": {
        const parsed = SingleIdParamsSchema.safeParse({ id: url.searchParams.get("id") });
        if (!parsed.success) return badRequest(parsed.error.flatten());
        const { id } = parsed.data;
        const data = await cachedFetch(`upsell:${id}`, `/listings/${id}/upsell-fees`, TTL["upsell-fees"]);
        return Response.json(data, { headers: corsHeaders });
      }

      // ── quote (mutation) ──────────────────────────────────────
      case "quote": {
        if (req.method !== "POST") return Response.json({ error: "POST required" }, { status: 405, headers: corsHeaders });
        const body = await req.json().catch(() => null);
        if (!body) return badRequest("Invalid JSON body");
        const parsed = QuoteBodySchema.safeParse(body);
        if (!parsed.success) return badRequest(parsed.error.flatten());
        const res = await guestyFetch("/reservations/quotes", { method: "POST", body: JSON.stringify(parsed.data) });
        return Response.json(await res.json(), { status: res.ok ? 200 : res.status, headers: corsHeaders });
      }

      // ── quote-get ─────────────────────────────────────────────
      case "quote-get": {
        const parsed = QuoteGetParamsSchema.safeParse({ quoteId: url.searchParams.get("quoteId") });
        if (!parsed.success) return badRequest(parsed.error.flatten());
        const res = await guestyFetch(`/reservations/quotes/${parsed.data.quoteId}`);
        return Response.json(await res.json(), { headers: corsHeaders });
      }

      // ── instant-booking (mutation) ────────────────────────────
      case "instant-booking": {
        if (req.method !== "POST") return Response.json({ error: "POST required" }, { status: 405, headers: corsHeaders });
        const body = await req.json().catch(() => null);
        if (!body) return badRequest("Invalid JSON body");
        const parsed = InstantBookingSchema.safeParse({
          quoteId: url.searchParams.get("quoteId"),
          ...body,
        });
        if (!parsed.success) return badRequest(parsed.error.flatten());
        const { quoteId, ...payload } = parsed.data;
        const res = await guestyFetch(`/reservations/quotes/${quoteId}/instant`, { method: "POST", body: JSON.stringify(payload) });
        return Response.json(await res.json(), { status: res.ok ? 200 : res.status, headers: corsHeaders });
      }
    }

    return Response.json({ error: "Unknown action" }, { status: 400, headers: corsHeaders });
  } catch (err) {
    console.error("Guesty proxy error:", err);
    const msg = err instanceof Error ? err.message : "Internal error";
    return Response.json(
      { error: msg, retryable: msg.includes("429") || msg.includes("rate limit"), results: [] },
      { status: 500, headers: corsHeaders }
    );
  }
});
