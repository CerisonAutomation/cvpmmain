// supabase/functions/create-pending/index.ts
// Creates pending booking and returns Stripe PaymentIntent client secret

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
    const { quoteId, guest } = await req.json();

    if (!quoteId || !guest) {
      return Response.json(
        { error: "Missing required fields: quoteId, guest" },
        { status: 400, headers: corsHeaders }
      );
    }

    const { firstName, lastName, email, phone } = guest;

    if (!firstName || !lastName || !email) {
      return Response.json(
        { error: "Missing guest info: firstName, lastName, email required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")!;

    // Get pending reservation
    const pendingRes = await fetch(
      `${supabaseUrl}/rest/v1/pending_reservations?id=eq.${quoteId}&status=eq.pending`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    );
    const pendingData = await pendingRes.json();
    const pending = pendingData[0];

    if (!pending) {
      return Response.json(
        { error: "Quote not found or expired", code: "QUOTE_NOT_FOUND" },
        { status: 404, headers: corsHeaders }
      );
    }

    // Check if expired
    if (new Date(pending.expires_at) < new Date()) {
      return Response.json(
        { error: "Quote has expired", code: "QUOTE_EXPIRED" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Update pending with guest info
    const updateRes = await fetch(
      `${supabaseUrl}/rest/v1/pending_reservations?id=eq.${quoteId}`,
      {
        method: "PATCH",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guest_first_name: firstName,
          guest_last_name: lastName,
          guest_email: email,
          guest_phone: phone || null,
        }),
      }
    );

    if (!updateRes.ok) {
      return Response.json(
        { error: "Failed to update guest info" },
        { status: 500, headers: corsHeaders }
      );
    }

    // Create Stripe PaymentIntent
    const stripeRes = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        amount: String(Math.round(pending.total_amount * 100)), // Stripe uses cents
        currency: pending.currency || "eur",
        "metadata[quoteId]": quoteId,
        "metadata[propertyId]": pending.property_id,
        "metadata[unitId]": pending.unit_id,
        "metadata[checkIn]": pending.check_in,
        "metadata[checkOut]": pending.check_out,
      }).toString(),
    });

    const stripeData = await stripeRes.json();

    if (stripeData.error) {
      return Response.json(
        { error: stripeData.error.message },
        { status: 500, headers: corsHeaders }
      );
    }

    // Update pending with payment intent ID
    await fetch(`${supabaseUrl}/rest/v1/pending_reservations?id=eq.${quoteId}`, {
      method: "PATCH",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stripe_payment_intent_id: stripeData.id,
      }),
    });

    return Response.json(
      {
        clientSecret: stripeData.client_secret,
        paymentIntentId: stripeData.id,
        amount: pending.total_amount,
        currency: pending.currency || "EUR",
        expiresAt: pending.expires_at,
      },
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error("Create pending error:", err);
    return Response.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
});
