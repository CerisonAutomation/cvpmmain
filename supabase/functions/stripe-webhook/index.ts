/**
 * stripe-webhook — Full Booking State Machine
 *
 * Handles Stripe payment events and drives the booking lifecycle:
 *
 *   payment_intent.succeeded      → paid → booking_submitting → confirmed (via Guesty instant booking)
 *   payment_intent.payment_failed → payment_failed
 *   charge.refunded                → payments.status = refunded
 *   charge.dispute.created         → needs_manual_review
 *
 * Idempotent via webhook_receipts table.
 * Uses HMAC-SHA256 signature verification.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Signature verification ────────────────────────────────────────────────────

async function verifyStripeSignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const parts = signature.split(",");
  const timestamp = parts.find((p) => p.startsWith("t="))?.slice(2);
  const v1 = parts.find((p) => p.startsWith("v1="))?.slice(3);

  if (!timestamp || !v1) return false;

  // Reject stale events (5 min window)
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (age > 300) return false;

  const payload = `${timestamp}.${body}`;
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
    new TextEncoder().encode(payload)
  );
  const expected = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return expected === v1;
}

// ── Guesty instant booking helper ─────────────────────────────────────────────

async function submitGuestyInstantBooking(
  supabaseUrl: string,
  supabaseKey: string,
  booking: {
    id: string;
    metadata: { quoteId?: string } | null;
    guest_first_name: string;
    guest_last_name: string;
    guest_email: string;
    guest_phone: string | null;
  }
): Promise<{ success: boolean; reservationId?: string; confirmationCode?: string; inquiry?: boolean }> {
  const quoteId = booking.metadata?.quoteId;
  if (!quoteId) {
    console.warn(`No quoteId in booking metadata for ${booking.id}`);
    return { success: false };
  }

  const res = await fetch(
    `${supabaseUrl}/functions/v1/guesty-proxy?action=instant-booking&quoteId=${quoteId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
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

  if (!res.ok) {
    const errText = await res.text();
    console.error(`Guesty instant booking failed (${res.status}): ${errText.slice(0, 300)}`);

    // Check if this is an inquiry-required error
    try {
      const errJson = JSON.parse(errText);
      if (
        errJson?.error_code === "LISTING_UNAVAILABLE" ||
        errJson?.error_code === "LISTING_CALENDAR_BLOCKED"
      ) {
        return { success: false, inquiry: true };
      }
    } catch { /* not JSON */ }

    return { success: false };
  }

  const reservation = await res.json();
  return {
    success: true,
    reservationId: reservation._id,
    confirmationCode: reservation.confirmationCode,
    inquiry: reservation.status === "inquiry",
  };
}

// ── Booking event logger helper ───────────────────────────────────────────────

async function logEvent(
  sb: ReturnType<typeof createClient>,
  bookingId: string,
  eventType: string,
  fromStatus: string | null,
  toStatus: string,
  data?: Record<string, unknown>
) {
  await sb.from("booking_events").insert({
    booking_id: bookingId,
    event_type: eventType,
    from_status: fromStatus,
    to_status: toStatus,
    actor: "stripe-webhook",
    data: data ?? null,
  });
}

// ── Main handler ──────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const signature = req.headers.get("stripe-signature");

  if (!signature || !webhookSecret) {
    console.error("Missing stripe-signature or STRIPE_WEBHOOK_SECRET");
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.text();
  const valid = await verifyStripeSignature(body, signature, webhookSecret);
  if (!valid) {
    console.error("Invalid Stripe signature");
    return new Response("Invalid signature", { status: 401 });
  }

  let event: { id: string; type: string; data: { object: Record<string, unknown> } };
  try {
    event = JSON.parse(body);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const sb = createClient(supabaseUrl, supabaseKey);

  // ── Idempotency check ────────────────────────────────────────────────────────
  const { data: receipt } = await sb
    .from("webhook_receipts")
    .select("id")
    .eq("provider", "stripe")
    .eq("event_id", event.id)
    .maybeSingle();

  if (receipt) {
    console.log(`Duplicate webhook skipped: ${event.id}`);
    return new Response("OK", { status: 200 });
  }

  // Record receipt first (prevent concurrent duplicates)
  await sb.from("webhook_receipts").insert({
    provider: "stripe",
    event_id: event.id,
    event_type: event.type,
    status: "processed",
  });

  try {
    switch (event.type) {
      // ── Payment succeeded ─────────────────────────────────────────────────
      case "payment_intent.succeeded": {
        const pi = event.data.object as {
          id: string;
          metadata: { bookingId?: string; quoteId?: string };
          amount: number;
          charges?: { data?: Array<{ id: string }> };
        };

        const bookingId = pi.metadata?.bookingId;
        if (!bookingId) {
          console.warn("payment_intent.succeeded: no bookingId in metadata");
          break;
        }

        const { data: booking, error: bErr } = await sb
          .from("bookings")
          .select("*")
          .eq("id", bookingId)
          .maybeSingle();

        if (bErr || !booking) {
          console.error(`Booking not found: ${bookingId}`);
          break;
        }

        // Idempotency: skip if already past paid
        if (["paid", "booking_submitting", "confirmed", "inquiry_required"].includes(booking.status)) {
          console.log(`Booking ${bookingId} already processed (status: ${booking.status})`);
          break;
        }

        // 1. Mark booking as paid
        await sb
          .from("bookings")
          .update({
            status: "paid",
            stripe_client_secret: null, // clear sensitive value
          })
          .eq("id", bookingId);

        await logEvent(sb, bookingId, "payment_captured", booking.status, "paid", {
          stripePaymentIntentId: pi.id,
          amount: pi.amount,
        });

        // 2. Update payment record
        const chargeId = pi.charges?.data?.[0]?.id;
        await sb
          .from("payments")
          .update({
            status: "succeeded",
            stripe_charge_id: chargeId ?? null,
          })
          .eq("stripe_payment_intent_id", pi.id);

        // 3. Mark as booking_submitting and submit to Guesty
        await sb
          .from("bookings")
          .update({ status: "booking_submitting" })
          .eq("id", bookingId);

        await logEvent(sb, bookingId, "guesty_submission_started", "paid", "booking_submitting");

        const result = await submitGuestyInstantBooking(
          supabaseUrl,
          supabaseKey,
          booking
        );

        if (result.success && !result.inquiry) {
          await sb
            .from("bookings")
            .update({
              status: "confirmed",
              guesty_reservation_id: result.reservationId ?? null,
              confirmation_code: result.confirmationCode ?? null,
            })
            .eq("id", bookingId);

          await logEvent(sb, bookingId, "booking_confirmed", "booking_submitting", "confirmed", {
            reservationId: result.reservationId,
            confirmationCode: result.confirmationCode,
          });

          console.log(`Booking confirmed: ${bookingId} (${result.confirmationCode})`);
        } else if (result.inquiry) {
          // Listing requires inquiry (not instant bookable)
          await sb
            .from("bookings")
            .update({ status: "inquiry_required" })
            .eq("id", bookingId);

          await logEvent(sb, bookingId, "inquiry_required", "booking_submitting", "inquiry_required");
          console.log(`Booking ${bookingId} requires inquiry`);
        } else {
          // Guesty submission failed — needs manual review
          await sb
            .from("bookings")
            .update({ status: "needs_manual_review" })
            .eq("id", bookingId);

          await logEvent(sb, bookingId, "guesty_submission_failed", "booking_submitting", "needs_manual_review");
          console.error(`Guesty submission failed for booking ${bookingId}`);
        }

        // 4. Mark quote as converted
        if (booking.quote_id) {
          await sb
            .from("quotes")
            .update({ status: "converted" })
            .eq("id", booking.quote_id);
        }

        break;
      }

      // ── Payment failed ────────────────────────────────────────────────────
      case "payment_intent.payment_failed": {
        const pi = event.data.object as {
          id: string;
          metadata: { bookingId?: string };
          last_payment_error?: { code?: string; message?: string };
        };

        const bookingId = pi.metadata?.bookingId;
        if (!bookingId) break;

        const failureCode = pi.last_payment_error?.code;
        const failureMessage = pi.last_payment_error?.message;

        await sb
          .from("bookings")
          .update({ status: "payment_failed" })
          .eq("id", bookingId);

        await sb
          .from("payments")
          .update({
            status: "failed",
            failure_code: failureCode ?? null,
            failure_message: failureMessage ?? null,
          })
          .eq("stripe_payment_intent_id", pi.id);

        await logEvent(sb, bookingId, "payment_failed", null, "payment_failed", {
          failureCode,
          failureMessage,
        });

        console.log(`Payment failed for booking ${bookingId}: ${failureCode}`);
        break;
      }

      // ── Charge refunded ───────────────────────────────────────────────────
      case "charge.refunded": {
        const charge = event.data.object as {
          id: string;
          payment_intent?: string;
          amount_refunded: number;
          refunded: boolean;
        };

        if (!charge.payment_intent) break;

        const newStatus = charge.refunded ? "refunded" : "partially_refunded";
        await sb
          .from("payments")
          .update({
            status: newStatus,
            refunded_amount: charge.amount_refunded / 100,
          })
          .eq("stripe_payment_intent_id", charge.payment_intent);

        // Look up booking to log event
        const { data: payment } = await sb
          .from("payments")
          .select("booking_id")
          .eq("stripe_payment_intent_id", charge.payment_intent)
          .maybeSingle();

        if (payment?.booking_id) {
          await logEvent(sb, payment.booking_id, "charge_refunded", null, newStatus, {
            refundedAmount: charge.amount_refunded / 100,
            full: charge.refunded,
          });
        }

        break;
      }

      // ── Dispute created ───────────────────────────────────────────────────
      case "charge.dispute.created": {
        const dispute = event.data.object as {
          payment_intent?: string;
          amount: number;
          reason?: string;
        };

        if (!dispute.payment_intent) break;

        const { data: payment } = await sb
          .from("payments")
          .select("booking_id")
          .eq("stripe_payment_intent_id", dispute.payment_intent)
          .maybeSingle();

        if (payment?.booking_id) {
          await sb
            .from("bookings")
            .update({ status: "needs_manual_review" })
            .eq("id", payment.booking_id);

          await logEvent(
            sb,
            payment.booking_id,
            "dispute_created",
            null,
            "needs_manual_review",
            { amount: dispute.amount / 100, reason: dispute.reason }
          );
        }

        break;
      }

      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }
  } catch (err) {
    console.error(`Error processing ${event.type}:`, err);

    // Update receipt with error
    await sb
      .from("webhook_receipts")
      .update({
        status: "failed",
        error_message: err instanceof Error ? err.message : String(err),
      })
      .eq("event_id", event.id)
      .eq("provider", "stripe");
  }

  return new Response("OK", { status: 200 });
});
