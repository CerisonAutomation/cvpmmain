// supabase/functions/properties/index.ts
// API for fetching properties - frontend calls this, not Supabase directly

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Get query params
    const url = new URL(req.url);
    const destination = url.searchParams.get("destination");
    const minPrice = url.searchParams.get("minPrice");
    const maxPrice = url.searchParams.get("maxPrice");
    const guests = url.searchParams.get("guests");
    const slug = url.searchParams.get("slug");

    // Build query
    let queryParams = new URLSearchParams();
    queryParams.append("select", "*");
    
    if (slug) {
      // Fetch single property by slug
      queryParams.append("slug", `eq.${slug}`);
    } else {
      queryParams.append("order", "created_at.desc");
      
      if (destination) {
        queryParams.append("destination", `ilike.*${encodeURIComponent(destination)}*`);
      }
      if (minPrice) {
        queryParams.append("price_per_night", `gte.${minPrice}`);
      }
      if (maxPrice) {
        queryParams.append("price_per_night", `lte.${maxPrice}`);
      }
      if (guests) {
        queryParams.append("max_guests", `gte.${guests}`);
      }
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/properties?${queryParams.toString()}`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return Response.json(
        { error: "Failed to fetch properties", details: error },
        { status: 500, headers: corsHeaders }
      );
    }

    let properties = await response.json();

    // If fetching single property by slug, also get units and rate plans
    if (slug && properties.length > 0) {
      const property = properties[0];
      
      // Get units
      const unitsRes = await fetch(
        `${supabaseUrl}/rest/v1/units?property_id=eq.${property.id}`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      );
      const units = unitsRes.ok ? await unitsRes.json() : [];

      // Get rate plans
      const unitIds = units.map((u: any) => u.id);
      let ratePlans: any[] = [];
      if (unitIds.length > 0) {
        const ratePlansRes = await fetch(
          `${supabaseUrl}/rest/v1/rate_plans?unit_id=in.(${unitIds.join(",")})`,
          {
            headers: {
              apabaseKey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
            },
          }
        );
        ratePlans = ratePlansRes.ok ? await ratePlansRes.json() : [];
      }

      properties = [{ ...property, units, rate_plans: ratePlans }];
    }

    // Transform for frontend
    const transformed = properties.map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      destination: p.destination,
      description: p.description,
      hero_image: p.hero_image,
      gallery: p.gallery,
      amenities: p.amenities,
      max_guests: p.max_guests,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      price_per_night: Number(p.price_per_night),
      rating: p.rating ? Number(p.rating) : null,
      check_in: p.check_in,
      check_out: p.check_out,
      cancellation_policy: p.cancellation_policy,
      units: p.units || [],
      rate_plans: p.rate_plans || [],
      created_at: p.created_at,
    }));

    return Response.json(
      { 
        data: transformed,
        count: transformed.length,
      },
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error("Properties API error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
});
