/**
 * Quote Edge Function — Get pricing quote from Guesty Booking Engine
 * Proxies through guesty-proxy for consistent auth/caching
 */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return Response.json({ error: "POST required" }, { status: 405, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { listingId, checkIn, checkOut, guests } = body;

    if (!listingId || !checkIn || !checkOut) {
      return Response.json(
        { error: "Missing required fields: listingId, checkIn, checkOut" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Proxy to guesty-proxy for quote
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const proxyUrl = `${supabaseUrl}/functions/v1/guesty-proxy?action=quote`;
    const proxyRes = await fetch(proxyUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        listingId,
        checkIn,
        checkOut,
        guestsCount: guests || 1,
      }),
    });

    const data = await proxyRes.json();

    if (!proxyRes.ok) {
      return Response.json(
        { error: data.error || "Quote failed", details: data },
        { status: proxyRes.status, headers: corsHeaders }
      );
    }

    return Response.json(data, { headers: corsHeaders });
  } catch (err) {
    console.error("Quote error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
});
