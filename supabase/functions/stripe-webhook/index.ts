/**
 * Stripe Webhook Handler — Processes payment events
 * CRITICAL: Uses proper Stripe signature verification
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function verifyStripeSignature(body: string, signature: string, secret: string): Promise<boolean> {
  // Extract timestamp and signatures
  const parts = signature.split(",");
  const timestamp = parts.find(p => p.startsWith("t="))?.slice(2);
  const v1 = parts.find(p => p.startsWith("v1="))?.slice(3);

  if (!timestamp || !v1) return false;

  // Check timestamp freshness (5 min tolerance)
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (age > 300) return false;

  // Compute expected signature
  const payload = `${timestamp}.${body}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const expected = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");

  return expected === v1;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const signature = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!signature || !webhookSecret) {
      console.error("Missing stripe-signature header or webhook secret");
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.text();

    // Verify signature
    const valid = await verifyStripeSignature(body, signature, webhookSecret);
    if (!valid) {
      console.error("Invalid Stripe webhook signature");
      return new Response("Invalid signature", { status: 401 });
    }

    const event = JSON.parse(body);
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object;
        const quoteId = pi.metadata?.quoteId;
        if (!quoteId) {
          console.warn("No quoteId in payment intent metadata");
          break;
        }

        // Get pending reservation
        const { data: pending } = await sb
          .from("pending_reservations")
          .select("*")
          .eq("id", quoteId)
          .eq("status", "pending")
          .maybeSingle();

        if (!pending) {
          console.warn(`Pending reservation not found: ${quoteId}`);
          break;
        }

        // Create confirmed reservation
        const reservationId = crypto.randomUUID();
        await sb.from("reservations").insert({
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
          stripe_payment_intent_id: pi.id,
          check_in: pending.check_in,
          check_out: pending.check_out,
        });

        // Create reservation unit
        if (pending.unit_id) {
          await sb.from("reservation_units").insert({
            reservation_id: reservationId,
            unit_id: pending.unit_id,
            stay: `[${pending.check_in}T15:00:00Z,${pending.check_out}T11:00:00Z)`,
          });
        }

        // Mark pending as converted
        await sb
          .from("pending_reservations")
          .update({ status: "converted" })
          .eq("id", quoteId);

        console.log(`✅ Reservation confirmed: ${reservationId}`);
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object;
        const quoteId = pi.metadata?.quoteId;
        if (quoteId) {
          await sb
            .from("pending_reservations")
            .update({ status: "failed" })
            .eq("id", quoteId);
          console.log(`❌ Payment failed for quote: ${quoteId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("Error", { status: 400 });
  }
});
