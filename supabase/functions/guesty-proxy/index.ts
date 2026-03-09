import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// In-memory fallback (works within same instance)
let memToken: string | null = null;
let memExpiresAt = 0;

function getServiceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getCachedToken(): Promise<{ token: string; expiresAt: number } | null> {
  // Check in-memory first
  if (memToken && Date.now() < memExpiresAt - 120_000) {
    return { token: memToken, expiresAt: memExpiresAt };
  }

  // Check database
  try {
    const sb = getServiceClient();
    const { data } = await sb
      .from("guesty_token_cache")
      .select("access_token, expires_at")
      .eq("id", "singleton")
      .maybeSingle();

    if (data && Date.now() < Number(data.expires_at) - 120_000) {
      memToken = data.access_token;
      memExpiresAt = Number(data.expires_at);
      return { token: data.access_token, expiresAt: Number(data.expires_at) };
    }
  } catch (e) {
    console.warn("Token cache read failed:", e);
  }

  return null;
}

async function saveToken(token: string, expiresAt: number) {
  memToken = token;
  memExpiresAt = expiresAt;

  try {
    const sb = getServiceClient();
    await sb.from("guesty_token_cache").upsert({
      id: "singleton",
      access_token: token,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    });
  } catch (e) {
    console.warn("Token cache write failed:", e);
  }
}

async function getAccessToken(): Promise<string> {
  const cached = await getCachedToken();
  if (cached) return cached.token;

  const clientId = Deno.env.get("VITE_GUESTY_ADMIN_CLIENT_ID");
  const clientSecret = Deno.env.get("VITE_GUESTY_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error("Guesty API credentials not configured");
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch("https://booking.guesty.com/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        scope: "booking_engine:api",
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const expiresAt = Date.now() + (data.expires_in || 3600) * 1000;
      await saveToken(data.access_token, expiresAt);
      return data.access_token;
    }

    const errText = await res.text();

    if (res.status === 429) {
      const backoff = Math.min(3000 * Math.pow(2, attempt), 20000);
      console.warn(`OAuth 429 - retry in ${backoff}ms (attempt ${attempt + 1}/3)`);
      await sleep(backoff);
      continue;
    }

    console.error("Guesty OAuth error:", errText);
    throw new Error(`Guesty OAuth failed: ${res.status}`);
  }

  throw new Error("Guesty OAuth: rate limited after 3 retries");
}

async function guestyFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();
  const baseUrl = "https://booking.guesty.com/api";

  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers || {}),
    },
  });

  if (res.status === 429) {
    await res.text();
    console.warn("Guesty API 429 - backing off 5s");
    await sleep(5000);
    const retryToken = await getAccessToken();
    return fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${retryToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(options.headers || {}),
      },
    });
  }

  return res;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    switch (action) {
      case "listings": {
        const params = url.searchParams.get("params") || "";
        const res = await guestyFetch(`/listings?${params}`);
        const data = await res.json();
        return Response.json(data, { headers: corsHeaders });
      }

      case "listing": {
        const id = url.searchParams.get("id");
        if (!id) return Response.json({ error: "Missing listing id" }, { status: 400, headers: corsHeaders });
        const res = await guestyFetch(`/listings/${id}`);
        const data = await res.json();
        return Response.json(data, { headers: corsHeaders });
      }

      case "calendar": {
        const id = url.searchParams.get("id");
        const from = url.searchParams.get("from");
        const to = url.searchParams.get("to");
        if (!id || !from || !to) return Response.json({ error: "Missing id, from, to" }, { status: 400, headers: corsHeaders });
        const res = await guestyFetch(`/listings/${id}/calendar?from=${from}&to=${to}`);
        const data = await res.json();
        return Response.json(data, { headers: corsHeaders });
      }

      case "cities": {
        const res = await guestyFetch("/cities");
        const data = await res.json();
        return Response.json(data, { headers: corsHeaders });
      }

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

      case "reviews": {
        const params = url.searchParams.get("params") || "";
        const res = await guestyFetch(`/reviews?${params}`);
        const data = await res.json();
        return Response.json(data, { headers: corsHeaders });
      }

      case "rate-plans": {
        const id = url.searchParams.get("id");
        if (!id) return Response.json({ error: "Missing listing id" }, { status: 400, headers: corsHeaders });
        const res = await guestyFetch(`/listings/${id}/rate-plans`);
        const data = await res.json();
        return Response.json(data, { headers: corsHeaders });
      }

      case "payment-provider": {
        const id = url.searchParams.get("id");
        if (!id) return Response.json({ error: "Missing listing id" }, { status: 400, headers: corsHeaders });
        const res = await guestyFetch(`/payments/provider?listingId=${id}`);
        const data = await res.json();
        return Response.json(data, { headers: corsHeaders });
      }

      default:
        return Response.json(
          { error: `Unknown action: ${action}` },
          { status: 400, headers: corsHeaders }
        );
    }
  } catch (err) {
    console.error("Guesty proxy error:", err);
    const isRateLimit = err instanceof Error && err.message.includes('429');
    return Response.json(
      {
        error: err instanceof Error ? err.message : "Internal server error",
        retryable: isRateLimit,
      },
      { status: isRateLimit ? 429 : 500, headers: corsHeaders }
    );
  }
});
