/**
 * guesty-webhook Edge Function
 *
 * Receives webhook events from Guesty and:
 *   - Invalidates in-memory caches (via stored keys) for affected listings
 *   - Updates listings_cache in Supabase if the listing data changes
 *   - Logs reservation status changes to booking_events
 *
 * Guesty sends X-Guesty-Signature-256 for verification.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-guesty-signature-256",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function verifyGuestySignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  // Guesty uses HMAC-SHA256 with hex encoding
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(body)
  );
  const expected =
    "sha256=" +
    Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

  return expected === signature;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const body = await req.text();
  const signature = req.headers.get("x-guesty-signature-256");
  const webhookSecret = Deno.env.get("GUESTY_WEBHOOK_SECRET");

  // Verify signature if secret is configured
  if (webhookSecret && signature) {
    const valid = await verifyGuestySignature(body, signature, webhookSecret);
    if (!valid) {
      console.error("Invalid Guesty signature");
      return new Response("Invalid signature", { status: 401 });
    }
  }

  let event: {
    eventName: string;
    payload?: Record<string, unknown>;
    listingId?: string;
    reservationId?: string;
  };

  try {
    event = JSON.parse(body);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const sb = createClient(supabaseUrl, supabaseKey);

  console.log(`Guesty webhook: ${event.eventName}`);

  try {
    switch (event.eventName) {
      // Listing updated — invalidate cache
      case "listing.updated":
      case "listing.published":
      case "listing.unpublished": {
        const listingId = event.listingId || (event.payload as any)?._id;
        if (listingId) {
          await sb
            .from("listings_cache")
            .update({ ttl_seconds: 0 }) // Force TTL expiry
            .eq("id", listingId);
          console.log(`Invalidated cache for listing: ${listingId}`);
        }
        break;
      }

      // Calendar / availability changed
      case "listing.calendar.updated":
      case "reservation.created":
      case "reservation.cancelled": {
        const listingId =
          event.listingId ||
          (event.payload as any)?.listingId ||
          (event.payload as any)?.listing_id;

        if (listingId) {
          await sb
            .from("listings_cache")
            .update({ ttl_seconds: 0 })
            .eq("id", listingId);
        }

        // Sync reservation status if we have a bookings record
        const guestyResId =
          event.reservationId ||
          (event.payload as any)?._id ||
          (event.payload as any)?.reservationId;

        if (guestyResId) {
          const guestyStatus = (event.payload as any)?.status;
          if (guestyStatus) {
            const { data: booking } = await sb
              .from("bookings")
              .select("id, status")
              .eq("guesty_reservation_id", guestyResId)
              .maybeSingle();

            if (booking) {
              // Map Guesty status to our status
              const statusMap: Record<string, string> = {
                confirmed: "confirmed",
                cancelled: "cancelled",
                inquiry: "inquiry_required",
                tentative: "needs_manual_review",
              };

              const newStatus = statusMap[guestyStatus];
              if (newStatus && newStatus !== booking.status) {
                await sb
                  .from("bookings")
                  .update({ status: newStatus })
                  .eq("id", booking.id);

                await sb.from("booking_events").insert({
                  booking_id: booking.id,
                  event_type: "guesty_status_sync",
                  from_status: booking.status,
                  to_status: newStatus,
                  actor: "guesty-webhook",
                  data: { guestyStatus, guestyResId },
                });
              }
            }
          }
        }
        break;
      }

      default:
        console.log(`Unhandled Guesty event: ${event.eventName}`);
    }
  } catch (err) {
    console.error("guesty-webhook processing error:", err);
    return new Response("Error", { status: 500 });
  }

  return new Response("OK", { status: 200 });
});
