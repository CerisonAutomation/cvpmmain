/**
 * Create Pending Reservation + Stripe PaymentIntent
 * Fixed: proper Supabase SDK, validation, error handling
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

  if (req.method !== "POST") {
    return Response.json({ error: "POST required" }, { status: 405, headers: corsHeaders });
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
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const sb = createClient(supabaseUrl, supabaseKey);

    if (!stripeSecretKey) {
      return Response.json(
        { error: "Payment processing not configured" },
        { status: 503, headers: corsHeaders }
      );
    }

    // Get pending reservation
    const { data: pending, error: fetchErr } = await sb
      .from("pending_reservations")
      .select("*")
      .eq("id", quoteId)
      .eq("status", "pending")
      .maybeSingle();

    if (fetchErr || !pending) {
      return Response.json(
        { error: "Quote not found or expired", code: "QUOTE_NOT_FOUND" },
        { status: 404, headers: corsHeaders }
      );
    }

    // Check expiry
    if (new Date(pending.expires_at) < new Date()) {
      return Response.json(
        { error: "Quote has expired", code: "QUOTE_EXPIRED" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Update pending with guest info
    await sb.from("pending_reservations").update({
      guest_first_name: firstName,
      guest_last_name: lastName,
      guest_email: email,
      guest_phone: phone || null,
    }).eq("id", quoteId);

    // Create Stripe PaymentIntent
    const stripeRes = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        amount: String(Math.round(pending.total_amount * 100)),
        currency: pending.currency || "eur",
        "metadata[quoteId]": quoteId,
        "metadata[propertyId]": pending.property_id || "",
        "metadata[checkIn]": pending.check_in || "",
        "metadata[checkOut]": pending.check_out || "",
      }).toString(),
    });

    const stripeData = await stripeRes.json();

    if (stripeData.error) {
      console.error("Stripe error:", stripeData.error);
      return Response.json(
        { error: stripeData.error.message },
        { status: 500, headers: corsHeaders }
      );
    }

    // Update pending with payment intent ID
    await sb.from("pending_reservations").update({
      stripe_payment_intent_id: stripeData.id,
    }).eq("id", quoteId);

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
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
});
