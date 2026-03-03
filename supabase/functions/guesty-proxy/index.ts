const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedToken;
  }

  const clientId = Deno.env.get("VITE_GUESTY_ADMIN_CLIENT_ID");
  const clientSecret = Deno.env.get("VITE_GUESTY_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error("Guesty API credentials not configured");
  }

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

  if (!res.ok) {
    const err = await res.text();
    console.error("Guesty OAuth error:", err);
    throw new Error(`Guesty OAuth failed: ${res.status}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;
  return cachedToken!;
}

async function guestyFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();
  const baseUrl = "https://booking.guesty.com/api";

  return fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers || {}),
    },
  });
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
    return Response.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
});
