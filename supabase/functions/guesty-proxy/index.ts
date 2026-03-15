/**
 * Guesty Booking Engine Proxy — Production Zenith
 *
 * Security model:
 *   - Frontend NEVER calls Guesty directly — all traffic through this proxy
 *   - Access token is read from Redis; in-memory hot cache sits in front
 *   - GUESTY_CLIENT_ID / GUESTY_CLIENT_SECRET live ONLY in Supabase secrets
 *   - Every incoming request is validated with Zod before touching Guesty
 *   - Token is never returned to the client
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
  listings:            20 * 60,
  listing:             15 * 60,
  calendar:             8 * 60,
  cities:          48 * 60 * 60,
  reviews:          2 * 60 * 60,
  "rate-plans":        45 * 60,
  "payment-provider":   2 * 60 * 60,
  "upsell-fees":       30 * 60,
};

const sleep  = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const jitter = (ms: number) => ms + Math.random() * Math.min(ms * 0.3, 2000);

function badRequest(details: unknown) {
  return Response.json(
    { error: "VALIDATION_ERROR", details },
    { status: 400, headers: corsHeaders }
  );
}

// ══════════════════════════════════════════════════════════
// REDIS HELPERS
// ══════════════════════════════════════════════════════════

function buildResp(args: string[]): Uint8Array {
  const encoder = new TextEncoder();
  let cmd = `*${args.length}\r\n`;
  for (const arg of args) {
    const bytes = encoder.encode(arg);
    cmd += `$${bytes.length}\r\n${arg}\r\n`;
  }
  return encoder.encode(cmd);
}

async function redisCmd(redisUrl: string, ...args: string[]): Promise<string> {
  const url      = new URL(redisUrl);
  const conn     = await Deno.connect({ hostname: url.hostname, port: parseInt(url.port || "6379") });
  const encoder  = new TextEncoder();
  const decoder  = new TextDecoder();

  try {
    if (url.password) {
      await conn.write(buildResp(["AUTH", decodeURIComponent(url.password)]));
      const authBuf = new Uint8Array(256);
      const authN   = await conn.read(authBuf);
      const authRes = decoder.decode(authBuf.subarray(0, authN ?? 0));
      if (!authRes.startsWith("+OK") && !authRes.includes("OK")) {
        throw new Error(`Redis AUTH failed: ${authRes.trim()}`);
      }
    }

    await conn.write(buildResp(args));
    const buf = new Uint8Array(16384);
    const n   = await conn.read(buf);
    return decoder.decode(buf.subarray(0, n ?? 0));
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

/**
 * Read token from Redis.
 * Priority:
 *   1. guesty:access_token (GET — stores JSON with accessToken + expiresAt)
 *   2. guesty:beapi:token  (HGET — stores hash with token + expires_at fields)
 */
async function readTokenFromRedis(
  redisUrl: string
): Promise<{ token: string; expiresAt: number } | null> {
  // Strategy 1: GET guesty:access_token
  try {
    const resp = await redisCmd(redisUrl, "GET", "guesty:access_token");
    const raw  = parseRedisString(resp);
    if (raw) {
      const json     = JSON.parse(raw);
      const token    = json.accessToken || json.access_token;
      const expRaw   = json.expiresAt   || json.expires_at;
      if (token) {
        const expiresAt =
          typeof expRaw === "number"
            ? expRaw > 1e12 ? expRaw : expRaw * 1000
            : Date.now() + 3_600_000;
        return { token, expiresAt };
      }
    }
  } catch { /* fall through to strategy 2 */ }

  // Strategy 2: HGET guesty:beapi:token
  try {
    const tokenResp = await redisCmd(redisUrl, "HGET", "guesty:beapi:token", "token");
    const token     = parseRedisString(tokenResp);
    if (token) {
      const expResp  = await redisCmd(redisUrl, "HGET", "guesty:beapi:token", "expires_at");
      const expStr   = parseRedisString(expResp);
      const expiresAt = expStr
        ? Number(expStr) > 1e12 ? Number(expStr) : Number(expStr) * 1000
        : Date.now() + 3_600_000;
      return { token, expiresAt };
    }
  } catch { /* fall through */ }

  return null;
}

async function writeTokenToRedis(
  redisUrl: string,
  token: string,
  expiresAtMs: number
): Promise<void> {
  const expiresAtSec = Math.floor(expiresAtMs / 1000);
  const ttlSec       = Math.max(60, Math.floor((expiresAtMs - Date.now()) / 1000));
  await redisCmd(
    redisUrl,
    "HSET",
    "guesty:beapi:token",
    "token",
    token,
    "expires_at",
    String(expiresAtSec)
  );
  await redisCmd(redisUrl, "EXPIRE", "guesty:beapi:token", String(ttlSec));
  console.log(`[guesty-proxy] Token written to Redis (TTL: ${ttlSec}s)`);
}

// ══════════════════════════════════════════════════════════
// TOKEN MANAGEMENT
// ══════════════════════════════════════════════════════════

let memToken: string | null    = null;
let memExpiresAt               = 0;
const TOKEN_BUFFER_MS          = 120_000; // 2 min safety window

async function fetchTokenViaOAuth(): Promise<string> {
  const now          = Date.now();
  const clientId     = Deno.env.get("GUESTY_CLIENT_ID");
  const clientSecret = Deno.env.get("GUESTY_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    if (memToken && now < memExpiresAt) return memToken;
    throw new Error("Guesty credentials not configured and no cached token available");
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    if (attempt > 0) await sleep(jitter(2000 * 2 ** attempt));
    let res: Response;
    try {
      res = await fetch("https://booking.guesty.com/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type:    "client_credentials",
          scope:         "booking_engine:api",
          client_id:     clientId,
          client_secret: clientSecret,
        }),
      });
    } catch (fetchErr) {
      console.error(`[guesty-proxy] OAuth network error (attempt ${attempt + 1}):`, fetchErr);
      continue;
    }

    if (res.ok) {
      const d       = await res.json();
      memToken      = d.access_token;
      memExpiresAt  = now + (d.expires_in || 3600) * 1000;
      return d.access_token as string;
    }
    if (res.status === 429) {
      const wait = parseInt(res.headers.get("Retry-After") || "0", 10);
      if (wait > 0 && wait < 180) await sleep(wait * 1000);
      if (memToken && now < memExpiresAt) return memToken;
      continue;
    }
    if (res.status === 401 || res.status === 403) {
      throw new Error(`Guesty OAuth invalid credentials (${res.status})`);
    }
    console.error(`[guesty-proxy] OAuth error ${res.status}:`, (await res.text()).slice(0, 200));
  }

  if (memToken && now < memExpiresAt) return memToken;
  throw new Error("Guesty API unavailable after 5 retries");
}

async function getAccessToken(): Promise<string> {
  const now      = Date.now();
  const redisUrl = Deno.env.get("REDIS_URL");

  // 1. Hot in-memory cache
  if (memToken && now < memExpiresAt - TOKEN_BUFFER_MS) return memToken;

  // 2. Redis (two key strategies, handled inside readTokenFromRedis)
  if (redisUrl) {
    try {
      const result = await readTokenFromRedis(redisUrl);
      if (result && now < result.expiresAt - TOKEN_BUFFER_MS) {
        memToken     = result.token;
        memExpiresAt = result.expiresAt;
        return result.token;
      }
      // Near-expiry: use it but trigger background refresh
      if (result && now < result.expiresAt) {
        // Background refresh — don't await
        fetchTokenViaOAuth().then((t) => {
          writeTokenToRedis(redisUrl, t, memExpiresAt).catch(console.error);
        }).catch(console.error);
        return result.token;
      }
    } catch (err) {
      console.error("[guesty-proxy] Redis token read failed:", err);
    }
  }

  // 3. Use stale memory token as last resort before OAuth
  if (memToken && now < memExpiresAt) {
    console.warn("[guesty-proxy] Using near-expiry in-memory token");
    return memToken;
  }

  // 4. OAuth fallback (writes result back to Redis)
  const newToken = await fetchTokenViaOAuth();
  if (redisUrl) {
    writeTokenToRedis(redisUrl, newToken, memExpiresAt).catch((err) =>
      console.error("[guesty-proxy] Redis write-back failed:", err)
    );
  }
  return newToken;
}

// ══════════════════════════════════════════════════════════
// RESPONSE CACHE (in-isolate LRU)
// ══════════════════════════════════════════════════════════

interface CacheEntry { data: unknown; cachedAt: number; ttl: number; }
const responseCache = new Map<string, CacheEntry>();

function getCached(key: string, ttl: number): { data: unknown; fresh: boolean } | null {
  const entry = responseCache.get(key);
  if (!entry) return null;
  const ageSec = (Date.now() - entry.cachedAt) / 1000;
  if (ageSec > ttl * 3) { responseCache.delete(key); return null; }
  return { data: entry.data, fresh: ageSec <= ttl };
}

function setCache(key: string, data: unknown, ttl: number) {
  if (responseCache.size > 200) {
    const oldest = responseCache.keys().next().value;
    if (oldest) responseCache.delete(oldest);
  }
  responseCache.set(key, { data, cachedAt: Date.now(), ttl });
}

// ══════════════════════════════════════════════════════════
// GUESTY FETCH
// ══════════════════════════════════════════════════════════

async function guestyFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token  = await getAccessToken();
  const base   = "https://booking.guesty.com/api";
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers ?? {}),
  };

  const res = await fetch(`${base}${path}`, { ...options, headers });

  if (res.status === 429) {
    await res.text(); // drain
    const wait = parseInt(res.headers.get("Retry-After") || "0", 10) * 1000 || 5000;
    await sleep(Math.min(wait, 15_000));
    const retryToken = await getAccessToken();
    return fetch(`${base}${path}`, {
      ...options,
      headers: { ...headers, Authorization: `Bearer ${retryToken}` },
    });
  }
  return res;
}

async function cachedFetch(cacheKey: string, path: string, ttl: number): Promise<unknown> {
  const cached = getCached(cacheKey, ttl);
  if (cached?.fresh) return cached.data;

  if (cached && !cached.fresh) {
    // Stale-while-revalidate
    guestyFetch(path)
      .then(async (r) => { if (r.ok) setCache(cacheKey, await r.json(), ttl); else await r.text(); })
      .catch(() => {});
    return cached.data;
  }

  const res = await guestyFetch(path);
  if (!res.ok) {
    const txt = await res.text();
    console.error(`[guesty-proxy] API ${res.status} for ${cacheKey}: ${txt.slice(0, 200)}`);
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
    const url    = new URL(req.url);
    const action = url.searchParams.get("action");

    // Allowlist enforcement
    const actionResult = ActionSchema.safeParse(action);
    if (!actionResult.success) return badRequest(actionResult.error.flatten());
    const safeAction = actionResult.data;

    switch (safeAction) {

      // ── listings ──────────────────────────────────────────────
      case "listings": {
        const rawParams = Object.fromEntries(
          new URLSearchParams(url.searchParams.get("params") || "")
        );
        const parsed = ListingsParamsSchema.safeParse(rawParams);
        if (!parsed.success) return badRequest(parsed.error.flatten());
        const safeQS = new URLSearchParams(
          Object.entries(parsed.data).flatMap(([k, v]) => v == null ? [] : [[k, String(v)]])
        ).toString();
        const data = await cachedFetch(`listings:${safeQS}`, `/listings?${safeQS}`, TTL.listings);
        return Response.json(data, { headers: corsHeaders });
      }

      // ── listing ───────────────────────────────────────────────
      case "listing": {
        const parsed = ListingParamsSchema.safeParse({ id: url.searchParams.get("id") });
        if (!parsed.success) return badRequest(parsed.error.flatten());
        const data = await cachedFetch(`listing:${parsed.data.id}`, `/listings/${parsed.data.id}`, TTL.listing);
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
        const safeQS = new URLSearchParams(
          Object.entries(parsed.data).flatMap(([k, v]) => v == null ? [] : [[k, String(v)]])
        ).toString();
        const data = await cachedFetch(`reviews:${safeQS}`, `/reviews?${safeQS}`, TTL.reviews);
        return Response.json(data, { headers: corsHeaders });
      }

      // ── rate-plans ────────────────────────────────────────────
      case "rate-plans": {
        const parsed = SingleIdParamsSchema.safeParse({ id: url.searchParams.get("id") });
        if (!parsed.success) return badRequest(parsed.error.flatten());
        const data = await cachedFetch(`rp:${parsed.data.id}`, `/listings/${parsed.data.id}/rate-plans`, TTL["rate-plans"]);
        return Response.json(data, { headers: corsHeaders });
      }

      // ── payment-provider ──────────────────────────────────────
      case "payment-provider": {
        const parsed = SingleIdParamsSchema.safeParse({ id: url.searchParams.get("id") });
        if (!parsed.success) return badRequest(parsed.error.flatten());
        const data = await cachedFetch(`pp:${parsed.data.id}`, `/payments/provider?listingId=${parsed.data.id}`, TTL["payment-provider"]);
        return Response.json(data, { headers: corsHeaders });
      }

      // ── upsell-fees ───────────────────────────────────────────
      case "upsell-fees": {
        const parsed = SingleIdParamsSchema.safeParse({ id: url.searchParams.get("id") });
        if (!parsed.success) return badRequest(parsed.error.flatten());
        const data = await cachedFetch(`upsell:${parsed.data.id}`, `/listings/${parsed.data.id}/upsell-fees`, TTL["upsell-fees"]);
        return Response.json(data, { headers: corsHeaders });
      }

      // ── quote (POST) ──────────────────────────────────────────
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

      // ── quote-coupons ─────────────────────────────────────────
      case "quote-coupons": {
        if (req.method !== "POST") return Response.json({ error: "POST required" }, { status: 405, headers: corsHeaders });
        const quoteId = url.searchParams.get("quoteId");
        if (!quoteId) return badRequest("quoteId required");
        const body = await req.json().catch(() => null);
        if (!body) return badRequest("Invalid JSON body");
        const res = await guestyFetch(`/reservations/quotes/${quoteId}/coupons`, { method: "POST", body: JSON.stringify(body) });
        return Response.json(await res.json(), { status: res.ok ? 200 : res.status, headers: corsHeaders });
      }

      // ── instant-booking (POST) ────────────────────────────────
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

      // ── inquiry-booking ───────────────────────────────────────
      case "inquiry-booking": {
        if (req.method !== "POST") return Response.json({ error: "POST required" }, { status: 405, headers: corsHeaders });
        const quoteId = url.searchParams.get("quoteId");
        if (!quoteId) return badRequest("quoteId required");
        const body = await req.json().catch(() => null);
        if (!body) return badRequest("Invalid JSON body");
        const res = await guestyFetch(`/reservations/quotes/${quoteId}/inquiry`, { method: "POST", body: JSON.stringify(body) });
        return Response.json(await res.json(), { status: res.ok ? 200 : res.status, headers: corsHeaders });
      }

      // ── instant-charge ────────────────────────────────────────
      case "instant-charge": {
        if (req.method !== "POST") return Response.json({ error: "POST required" }, { status: 405, headers: corsHeaders });
        const quoteId = url.searchParams.get("quoteId");
        if (!quoteId) return badRequest("quoteId required");
        const body = await req.json().catch(() => null);
        if (!body) return badRequest("Invalid JSON body");
        const res = await guestyFetch(`/reservations/quotes/${quoteId}/instant-charge`, { method: "POST", body: JSON.stringify(body) });
        return Response.json(await res.json(), { status: res.ok ? 200 : res.status, headers: corsHeaders });
      }

      // ── reservation-details ───────────────────────────────────
      case "reservation-details": {
        const resId = url.searchParams.get("reservationId");
        if (!resId) return badRequest("reservationId required");
        const res = await guestyFetch(`/reservations/${resId}/details`);
        return Response.json(await res.json(), { headers: corsHeaders });
      }

      // ── verify-payment ────────────────────────────────────────
      case "verify-payment": {
        if (req.method !== "POST") return Response.json({ error: "POST required" }, { status: 405, headers: corsHeaders });
        const resId = url.searchParams.get("reservationId");
        if (!resId) return badRequest("reservationId required");
        const body = await req.json().catch(() => null);
        if (!body) return badRequest("Invalid JSON body");
        const res = await guestyFetch(`/reservations/${resId}/verify-payment`, { method: "POST", body: JSON.stringify(body) });
        return Response.json(await res.json(), { status: res.ok ? 200 : res.status, headers: corsHeaders });
      }

      // ── payouts ───────────────────────────────────────────────
      case "payouts": {
        const params = url.searchParams.get("params") || "";
        const res    = await guestyFetch(`/reservations/payouts/list?${params}`);
        const data   = await res.json();
        return Response.json(data, { headers: corsHeaders });
      }

      default:
        return Response.json({ error: `Unknown action` }, { status: 400, headers: corsHeaders });
    }
  } catch (err) {
    console.error("[guesty-proxy] Unhandled error:", err);
    const msg = err instanceof Error ? err.message : "Internal error";
    return Response.json(
      { error: msg, retryable: msg.includes("429") || msg.includes("rate limit"), results: [] },
      { status: 500, headers: corsHeaders }
    );
  }
});
