/**
 * process-booking-commands Edge Function
 *
 * Handles operator / admin commands on bookings:
 *
 *   POST /process-booking-commands
 *   { command: "cancel" | "refund" | "manual_confirm" | "retry_guesty", bookingId: string, reason?: string }
 *
 * Requires service_role or admin auth (Authorization: Bearer <service_role_key>)
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Command = "cancel" | "refund" | "manual_confirm" | "retry_guesty";

interface CommandRequest {
  command: Command;
  bookingId: string;
  reason?: string;
  // For manual_confirm: provide the guesty reservation id
  guestyReservationId?: string;
  confirmationCode?: string;
}

// ── Stripe refund helper ──────────────────────────────────────────────────────

async function createStripeRefund(paymentIntentId: string, reason?: string): Promise<boolean> {
  const secretKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY not configured");

  const params = new URLSearchParams({ payment_intent: paymentIntentId });
  if (reason) params.set("reason", "requested_by_customer");

  const res = await fetch("https://api.stripe.com/v1/refunds", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Stripe refund error: ${(err as any)?.error?.message ?? res.status}`);
  }
  return true;
}

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return Response.json({ error: "POST required" }, { status: 405, headers: corsHeaders });
  }

  // Auth — require service_role key
  const authHeader = req.headers.get("Authorization");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const expectedBearer = `Bearer ${serviceKey}`;

  if (!authHeader || authHeader !== expectedBearer) {
    return Response.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const sb = createClient(supabaseUrl, serviceKey);

  let body: CommandRequest;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400, headers: corsHeaders });
  }

  const { command, bookingId, reason, guestyReservationId, confirmationCode } = body;

  if (!command || !bookingId) {
    return Response.json(
      { error: "command and bookingId are required" },
      { status: 400, headers: corsHeaders }
    );
  }

  // Fetch booking
  const { data: booking, error: bErr } = await sb
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .maybeSingle();

  if (bErr || !booking) {
    return Response.json({ error: "Booking not found" }, { status: 404, headers: corsHeaders });
  }

  try {
    switch (command) {
      // ── Cancel booking ────────────────────────────────────────────────────
      case "cancel": {
        await sb
          .from("bookings")
          .update({ status: "cancelled" })
          .eq("id", bookingId);

        await sb.from("booking_events").insert({
          booking_id: bookingId,
          event_type: "booking_cancelled",
          from_status: booking.status,
          to_status: "cancelled",
          actor: "operator",
          data: { reason: reason ?? "Operator cancelled" },
        });

        return Response.json({ success: true, status: "cancelled" }, { headers: corsHeaders });
      }

      // ── Refund payment ────────────────────────────────────────────────────
      case "refund": {
        if (!booking.stripe_payment_intent_id) {
          return Response.json(
            { error: "No payment intent on this booking" },
            { status: 400, headers: corsHeaders }
          );
        }

        await createStripeRefund(booking.stripe_payment_intent_id, reason);

        await sb
          .from("bookings")
          .update({ status: "cancelled" })
          .eq("id", bookingId);

        await sb.from("booking_events").insert({
          booking_id: bookingId,
          event_type: "refund_issued",
          from_status: booking.status,
          to_status: "cancelled",
          actor: "operator",
          data: { reason: reason ?? "Operator refund" },
        });

        return Response.json({ success: true, status: "refunded" }, { headers: corsHeaders });
      }

      // ── Manual confirm (payment captured, Guesty confirmed out-of-band) ──
      case "manual_confirm": {
        await sb
          .from("bookings")
          .update({
            status: "confirmed",
            guesty_reservation_id: guestyReservationId ?? booking.guesty_reservation_id,
            confirmation_code: confirmationCode ?? booking.confirmation_code,
          })
          .eq("id", bookingId);

        await sb.from("booking_events").insert({
          booking_id: bookingId,
          event_type: "manual_confirmed",
          from_status: booking.status,
          to_status: "confirmed",
          actor: "operator",
          data: { guestyReservationId, confirmationCode, reason },
        });

        return Response.json({ success: true, status: "confirmed" }, { headers: corsHeaders });
      }

      // ── Retry Guesty instant booking ──────────────────────────────────────
      case "retry_guesty": {
        if (!["needs_manual_review", "booking_failed"].includes(booking.status)) {
          return Response.json(
            { error: `Cannot retry from status: ${booking.status}` },
            { status: 400, headers: corsHeaders }
          );
        }

        await sb
          .from("bookings")
          .update({ status: "booking_submitting" })
          .eq("id", bookingId);

        await sb.from("booking_events").insert({
          booking_id: bookingId,
          event_type: "retry_guesty_started",
          from_status: booking.status,
          to_status: "booking_submitting",
          actor: "operator",
          data: { reason },
        });

        const quoteId = booking.metadata?.quoteId;
        if (!quoteId) {
          return Response.json(
            { error: "No quoteId in booking metadata, cannot retry" },
            { status: 400, headers: corsHeaders }
          );
        }

        // Call guesty-proxy instant-booking
        const guestyRes = await fetch(
          `${supabaseUrl}/functions/v1/guesty-proxy?action=instant-booking&quoteId=${quoteId}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${serviceKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              guest: {
                firstName: booking.guest_first_name,
                lastName: booking.guest_last_name,
                email: booking.guest_email,
                phone: booking.guest_phone ?? "",
              },
            }),
          }
        );

        if (guestyRes.ok) {
          const reservation = await guestyRes.json();
          await sb
            .from("bookings")
            .update({
              status: "confirmed",
              guesty_reservation_id: reservation._id,
              confirmation_code: reservation.confirmationCode,
            })
            .eq("id", bookingId);

          await sb.from("booking_events").insert({
            booking_id: bookingId,
            event_type: "booking_confirmed",
            from_status: "booking_submitting",
            to_status: "confirmed",
            actor: "operator",
            data: {
              reservationId: reservation._id,
              confirmationCode: reservation.confirmationCode,
            },
          });

          return Response.json(
            { success: true, status: "confirmed", confirmationCode: reservation.confirmationCode },
            { headers: corsHeaders }
          );
        } else {
          const errText = await guestyRes.text();
          await sb
            .from("bookings")
            .update({ status: "needs_manual_review" })
            .eq("id", bookingId);

          await sb.from("booking_events").insert({
            booking_id: bookingId,
            event_type: "retry_guesty_failed",
            from_status: "booking_submitting",
            to_status: "needs_manual_review",
            actor: "operator",
            data: { error: errText.slice(0, 500) },
          });

          return Response.json(
            { success: false, error: "Guesty submission failed again" },
            { status: 502, headers: corsHeaders }
          );
        }
      }

      default:
        return Response.json(
          { error: `Unknown command: ${command}` },
          { status: 400, headers: corsHeaders }
        );
    }
  } catch (err) {
    console.error(`process-booking-commands error (${command}):`, err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500, headers: corsHeaders }
    );
  }
});
