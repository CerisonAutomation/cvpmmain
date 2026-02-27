// supabase/functions/quote/index.ts
// Dynamic pricing calculation based on database rates

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const { propertyId, unitId, checkIn, checkOut, adults, children = 0 } = await req.json();

    // Validate required fields
    if (!propertyId || !unitId || !checkIn || !checkOut) {
      return Response.json(
        { error: "Missing required fields: propertyId, unitId, checkIn, checkOut" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check availability (prevent double booking)
    const stayRange = `[${checkIn}T15:00:00Z,${checkOut}T11:00:00Z)`;
    
    const { data: conflicts } = await supabase
      .from("reservation_units")
      .select("id")
      .eq("unit_id", unitId)
      .overlaps("stay", stayRange);

    if (conflicts && conflicts.length > 0) {
      return Response.json(
        { error: "Not available for selected dates", code: "DATES_UNAVAILABLE" },
        { status: 409, headers: corsHeaders }
      );
    }

    // Get property & unit pricing from DATABASE
    const { data: unit, error: unitError } = await supabase
      .from("units")
      .select("*, property:properties(name, price_per_night)")
      .eq("id", unitId)
      .single();

    if (unitError || !unit) {
      return Response.json(
        { error: "Unit not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    // Calculate dynamic pricing
    const nights = Math.ceil(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (nights < 1) {
      return Response.json(
        { error: "Invalid date range" },
        { status: 400, headers: corsHeaders }
      );
    }

    const basePrice = Number(unit.base_price);

    // Weekend calculation (Fri & Sat = weekend)
    let weekendNights = 0;
    const start = new Date(checkIn);
    for (let i = 0; i < nights; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      const dayOfWeek = day.getDay();
      if (dayOfWeek === 5 || dayOfWeek === 6) {
        weekendNights++;
      }
    }

    // Get rate plan
    const { data: ratePlan } = await supabase
      .from("rate_plans")
      .select("weekend_multiplier, min_nights")
      .eq("unit_id", unitId)
      .single();

    // Check minimum nights
    if (ratePlan?.min_nights && nights < ratePlan.min_nights) {
      return Response.json(
        { error: `Minimum stay is ${ratePlan.min_nights} nights`, code: "MIN_NIGHT_MISMATCH" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Calculate subtotal with weekend pricing
    let subtotal = basePrice * nights;
    if (ratePlan?.weekend_multiplier) {
      const weekdayNights = nights - weekendNights;
      subtotal =
        weekdayNights * basePrice +
        weekendNights * basePrice * Number(ratePlan.weekend_multiplier);
    }

    // Calculate fees
    const cleaningFee = Math.round(subtotal * 0.12);
    const serviceFee = Math.round(subtotal * 0.08);
    const tax = Math.round((subtotal + cleaningFee + serviceFee) * 0.1);
    const total = subtotal + cleaningFee + serviceFee + tax;

    // Create pending reservation (quote)
    const quoteId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 min expiry

    await supabase.from("pending_reservations").insert({
      id: quoteId,
      property_id: unit.property_id,
      unit_id: unitId,
      check_in: checkIn,
      check_out: checkOut,
      adults,
      children,
      total_amount: total,
      expires_at: expiresAt,
      status: "pending",
    });

    return Response.json(
      {
        id: quoteId,
        propertyName: unit.property?.name,
        currency: "EUR",
        lineItems: [
          { label: `${nights} nights`, amount: subtotal },
          { label: "Cleaning fee", amount: cleaningFee },
          { label: "Service fee", amount: serviceFee },
          { label: "Tax (10%)", amount: tax },
        ],
        total,
        nights,
        checkIn,
        checkOut,
        expiresAt,
      },
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error("Quote error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
});

// Helper function to create Supabase client
function createClient(supabaseUrl: string, supabaseKey: string) {
  return {
    from: (table: string) => ({
      select: (columns: string) => ({
        eq: (column: string, value: any) => ({
          single: async () => {
            const res = await fetch(`${supabaseUrl}/rest/v1/${table}?${column}=eq.${value}&select=${columns}`, {
              headers: {
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
              },
            });
            const data = await res.json();
            return { data: data[0] || null, error: res.ok ? null : data };
          },
          overlaps: async (column: string, value: string) => {
            const res = await fetch(`${supabaseUrl}/rest/v1/${table}?${column}=ov.{${value}}&select=${columns}`, {
              headers: {
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`,
              },
            });
            const data = await res.json();
            return { data, error: res.ok ? null : data };
          },
        }),
      }),
      insert: async (data: any) => {
        const res = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
          method: "POST",
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify(data),
        });
        return { error: res.ok ? null : await res.json() };
      },
    }),
  };
}
