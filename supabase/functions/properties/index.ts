/**
 * Properties Edge Function — Thin wrapper around guesty-proxy
 * Returns normalized property data for the frontend
 */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    // Route: single listing by ID
    if (id) {
      const proxyRes = await fetch(
        `${supabaseUrl}/functions/v1/guesty-proxy?action=listing&id=${encodeURIComponent(id)}`,
        { headers: { Authorization: `Bearer ${supabaseKey}` } }
      );
      const body = await proxyRes.text();
      return new Response(body, {
        status: proxyRes.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Route: all listings
    const params = url.searchParams.get("params") || "";
    const proxyRes = await fetch(
      `${supabaseUrl}/functions/v1/guesty-proxy?action=listings&params=${encodeURIComponent(params)}`,
      { headers: { Authorization: `Bearer ${supabaseKey}` } }
    );

    const body = await proxyRes.text();
    return new Response(body, {
      status: proxyRes.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Properties API error:", err);
    return Response.json(
      { error: "Internal server error", results: [] },
      { status: 500, headers: corsHeaders }
    );
  }
});
