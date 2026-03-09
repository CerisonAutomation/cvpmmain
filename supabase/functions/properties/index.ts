/**
 * Properties Edge Function — Proxy to Guesty listings via guesty-proxy
 * Fixed: proper CORS headers, proper Supabase SDK import, typo fix
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");

    // Call guesty-proxy edge function for listings
    const guestyProxyUrl = `${supabaseUrl}/functions/v1/guesty-proxy?action=listings`;
    const proxyRes = await fetch(guestyProxyUrl, {
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!proxyRes.ok) {
      const err = await proxyRes.text();
      console.error("Guesty proxy error:", err);
      return Response.json(
        { error: "Failed to fetch properties", data: [], count: 0 },
        { status: 200, headers: corsHeaders }
      );
    }

    const listings = await proxyRes.json();
    const results = listings?.results || listings?.data || (Array.isArray(listings) ? listings : []);

    // Transform for frontend
    const transformed = results.map((p: any) => ({
      id: p._id || p.id,
      name: p.title || p.name || "Untitled",
      slug: (p.title || p.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      destination: p.address?.city || p.city || "Malta",
      description: p.publicDescription?.summary || p.description || "",
      hero_image: p.picture?.thumbnail || p.pictures?.[0]?.thumbnail || "",
      gallery: (p.pictures || []).map((pic: any) => pic.original || pic.thumbnail || ""),
      amenities: p.amenities || [],
      max_guests: p.accommodates || 4,
      bedrooms: p.bedrooms || 1,
      bathrooms: p.bathrooms || 1,
      price_per_night: p.prices?.basePrice || 0,
      rating: p.reviewsCount > 0 ? (p.reviews?.avg || null) : null,
      check_in: p.defaultCheckInTime || "15:00",
      check_out: p.defaultCheckOutTime || "11:00",
    }));

    // Filter by slug if requested
    const filtered = slug
      ? transformed.filter((p: any) => p.slug === slug)
      : transformed;

    return Response.json(
      { data: filtered, count: filtered.length },
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error("Properties API error:", err);
    return Response.json(
      { error: "Internal server error", data: [], count: 0 },
      { status: 500, headers: corsHeaders }
    );
  }
});
