// supabase/functions/stripe-webhook/index.ts
// Handles Stripe webhook events to confirm reservations

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
    const signature = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!signature || !webhookSecret) {
      return new Response("Missing signature or secret", { status: 400 });
    }

    const body = await req.text();
    
    // Verify webhook signature (simplified - in production use stripe library)
    const timestamp = body.match(/timestamp=(\d+)/)?.[1];
    const eventType = req.headers.get("stripe-webhook-type") || "payment_intent.succeeded";

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Handle the event
    if (eventType === "payment_intent.succeeded") {
      // Extract quoteId from metadata
      const quoteIdMatch = body.match(/"quoteId"\s*:\s*"([^"]+)"/);
      const paymentIntentIdMatch = body.match(/"id"\s*:\s*"([^"]+)"/);
      
      if (!quoteIdMatch || !paymentIntentIdMatch) {
        return new Response("Missing metadata", { status: 400 });
      }

      const quoteId = quoteIdMatch[1];
      const paymentIntentId = paymentIntentIdMatch[1];

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
        return new Response("Pending reservation not found", { status: 404 });
      }

      // Create confirmed reservation
      const reservationId = crypto.randomUUID();
      const insertRes = await fetch(`${supabaseUrl}/rest/v1/reservations`, {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          id: reservationId,
          property_id: pending.property_id,
          guest_email: pending.guest_email,
          guest_first_name: pending.guest_first_name,
          guest_last_name: pending.guest_last_name,
          guest_phone: pending.guest_phone,
          total_amount: pending.total_amount,
          currency: pending.currency || "EUR",
          status: "confirmed",
          payment_status: "paid",
          stripe_payment_intent_id: paymentIntentId,
          check_in: pending.check_in,
          check_out: pending.check_out,
        }),
      });

      const reservation = await insertRes.json();

      if (!insertRes.ok) {
        console.error("Failed to create reservation:", reservation);
        return new Response("Failed to create reservation", { status: 500 });
      }

      // Create reservation unit (for overlap prevention)
      await fetch(`${supabaseUrl}/rest/v1/reservation_units`, {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reservation_id: reservation[0]?.id || reservationId,
          unit_id: pending.unit_id,
          stay: `[${pending.check_in}T15:00:00Z,${pending.check_out}T11:00:00Z)`,
        }),
      });

      // Mark pending as converted
      await fetch(`${supabaseUrl}/rest/v1/pending_reservations?id=eq.${quoteId}`, {
        method: "PATCH",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "converted",
        }),
      });

      console.log(`Reservation confirmed: ${reservationId} for quote: ${quoteId}`);
    }

    // Handle payment failure
    if (eventType === "payment_intent.payment_failed") {
      const quoteIdMatch = body.match(/"quoteId"\s*:\s*"([^"]+)"/);
      
      if (quoteIdMatch) {
        const quoteId = quoteIdMatch[1];
        
        await fetch(`${supabaseUrl}/rest/v1/pending_reservations?id=eq.${quoteId}`, {
          method: "PATCH",
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "failed",
          }),
        });
      }
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("Error", { status: 400 });
  }
});
