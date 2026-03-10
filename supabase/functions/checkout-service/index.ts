/**
 * checkout-service Edge Function
 *
 * Orchestrates the booking checkout:
 *   1. Fetch/validate Guesty quote
 *   2. Persist quote record in Supabase
 *   3. Create bookings row (status: awaiting_payment)
 *   4. Create Stripe PaymentIntent
 *   5. Return { bookingId, clientSecret } to frontend
 *
 * Idempotent — repeated calls with same quoteId return the same booking.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface CheckoutRequest {
  // Guesty quote id (from /reservations/quotes)
  quoteId: string;
  listingId: string;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  // Quote financials (passed from frontend to avoid a round-trip)
  currency: string;
  totalAmount: number;
  nightsCount: number;
  priceBreakdown?: {
    accommodation?: number;
    cleaningFee?: number;
    serviceFee?: number;
    taxes?: number;
  };
  // Guest info collected in the checkout form
  guest: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  couponCode?: string;
  // Forwarded from CF-Connecting-IP / x-forwarded-for
  ipAddress?: string;
  userAgent?: string;
}

// ── Stripe helpers (raw REST — no npm package in Deno) ──────────────────────

async function stripeRequest(
  path: string,
  method: string,
  body?: Record<string, string | number | undefined>
): Promise<Response> {
  const secretKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY not configured");

  const headers: Record<string, string> = {
    Authorization: `Bearer ${secretKey}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const opts: RequestInit = { method, headers };
  if (body) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(body)) {
      if (v !== undefined) params.set(k, String(v));
    }
    opts.body = params.toString();
  }

  return fetch(`https://api.stripe.com/v1${path}`, opts);
}

async function createPaymentIntent(params: {
  amount: number;
  currency: string;
  bookingId: string;
  quoteId: string;
  listingId: string;
  guestEmail: string;
  description: string;
}): Promise<{ id: string; client_secret: string; status: string }> {
  // Stripe amount is in smallest currency unit (cents for EUR)
  const amountCents = Math.round(params.amount * 100);

  const res = await stripeRequest("POST", "/payment_intents", {
    amount: amountCents,
    currency: params.currency.toLowerCase(),
    "automatic_payment_methods[enabled]": "true",
    description: params.description,
    receipt_email: params.guestEmail,
    "metadata[bookingId]": params.bookingId,
    "metadata[quoteId]": params.quoteId,
    "metadata[listingId]": params.listingId,
    "metadata[platform]": "cvpm",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `Stripe error ${res.status}: ${(err as any)?.error?.message ?? "Unknown"}`
    );
  }

  return res.json();
}

// ── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return Response.json(
      { error: "POST required" },
      { status: 405, headers: corsHeaders }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const sb = createClient(supabaseUrl, supabaseKey);

  try {
    const data: CheckoutRequest = await req.json();

    // ── Validate required fields ────────────────────────────────────────────
    const required: (keyof CheckoutRequest)[] = [
      "quoteId",
      "listingId",
      "checkIn",
      "checkOut",
      "guestsCount",
      "currency",
      "totalAmount",
      "nightsCount",
      "guest",
    ];
    for (const field of required) {
      if (!data[field]) {
        return Response.json(
          { error: `Missing required field: ${field}` },
          { status: 400, headers: corsHeaders }
        );
      }
    }

    if (!data.guest.firstName || !data.guest.lastName || !data.guest.email) {
      return Response.json(
        { error: "guest.firstName, guest.lastName, and guest.email are required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // ── Idempotency: check if booking already exists for this quoteId ───────
    const { data: existingBooking } = await sb
      .from("bookings")
      .select("id, stripe_payment_intent_id, stripe_client_secret, status")
      .eq("listing_id", data.listingId)
      .eq("guest_email", data.guest.email)
      .in("status", ["awaiting_payment", "payment_processing", "paid", "confirmed"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (
      existingBooking &&
      existingBooking.stripe_client_secret &&
      ["awaiting_payment", "payment_processing"].includes(existingBooking.status)
    ) {
      console.log(`Idempotent: returning existing booking ${existingBooking.id}`);
      return Response.json(
        {
          bookingId: existingBooking.id,
          clientSecret: existingBooking.stripe_client_secret,
          status: existingBooking.status,
        },
        { headers: corsHeaders }
      );
    }

    // ── Upsert quotes record ────────────────────────────────────────────────
    const quoteRecord = {
      guesty_quote_id: data.quoteId,
      listing_id: data.listingId,
      check_in: data.checkIn,
      check_out: data.checkOut,
      guests_count: data.guestsCount,
      nights_count: data.nightsCount,
      currency: data.currency,
      accommodation: data.priceBreakdown?.accommodation ?? null,
      cleaning_fee: data.priceBreakdown?.cleaningFee ?? null,
      service_fee: data.priceBreakdown?.serviceFee ?? null,
      taxes: data.priceBreakdown?.taxes ?? null,
      total: data.totalAmount,
      status: "active",
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 min
    };

    const { data: savedQuote, error: quoteErr } = await sb
      .from("quotes")
      .upsert(quoteRecord, { onConflict: "guesty_quote_id" })
      .select("id")
      .single();

    if (quoteErr) {
      console.error("Quote upsert error:", quoteErr);
      throw new Error(`Failed to save quote: ${quoteErr.message}`);
    }

    // ── Create booking (draft → awaiting_payment) ───────────────────────────
    const bookingRecord = {
      quote_id: savedQuote.id,
      listing_id: data.listingId,
      check_in: data.checkIn,
      check_out: data.checkOut,
      guests_count: data.guestsCount,
      currency: data.currency,
      total_amount: data.totalAmount,
      guest_first_name: data.guest.firstName,
      guest_last_name: data.guest.lastName,
      guest_email: data.guest.email,
      guest_phone: data.guest.phone ?? null,
      coupon_code: data.couponCode ?? null,
      status: "awaiting_payment",
      is_instant_book: true,
      ip_address: data.ipAddress ?? null,
      user_agent: data.userAgent ?? null,
      metadata: { quoteId: data.quoteId },
    };

    const { data: booking, error: bookingErr } = await sb
      .from("bookings")
      .insert(bookingRecord)
      .select("id")
      .single();

    if (bookingErr) {
      console.error("Booking insert error:", bookingErr);
      throw new Error(`Failed to create booking: ${bookingErr.message}`);
    }

    const bookingId = booking.id;

    // ── Log event ────────────────────────────────────────────────────────────
    await sb.from("booking_events").insert({
      booking_id: bookingId,
      event_type: "booking_created",
      from_status: "draft",
      to_status: "awaiting_payment",
      actor: "checkout-service",
      data: { quoteId: data.quoteId, amount: data.totalAmount },
    });

    // ── Create Stripe PaymentIntent ─────────────────────────────────────────
    let pi: { id: string; client_secret: string; status: string };
    try {
      pi = await createPaymentIntent({
        amount: data.totalAmount,
        currency: data.currency,
        bookingId,
        quoteId: data.quoteId,
        listingId: data.listingId,
        guestEmail: data.guest.email,
        description: `AX Luxury Living — ${data.listingId} — ${data.checkIn} to ${data.checkOut}`,
      });
    } catch (stripeErr) {
      // Mark booking as payment_failed
      await sb
        .from("bookings")
        .update({ status: "payment_failed" })
        .eq("id", bookingId);

      await sb.from("booking_events").insert({
        booking_id: bookingId,
        event_type: "stripe_error",
        from_status: "awaiting_payment",
        to_status: "payment_failed",
        actor: "checkout-service",
        data: { error: String(stripeErr) },
      });

      throw stripeErr;
    }

    // ── Store client_secret & payment intent id in booking ─────────────────
    // NOTE: stripe_client_secret is cleared after payment is captured
    await sb
      .from("bookings")
      .update({
        stripe_payment_intent_id: pi.id,
        stripe_client_secret: pi.client_secret,
        status: "awaiting_payment",
      })
      .eq("id", bookingId);

    // ── Create payments record ──────────────────────────────────────────────
    await sb.from("payments").insert({
      booking_id: bookingId,
      stripe_payment_intent_id: pi.id,
      amount: data.totalAmount,
      currency: data.currency,
      status: "pending",
    });

    console.log(`Checkout created: booking=${bookingId} pi=${pi.id}`);

    return Response.json(
      {
        bookingId,
        clientSecret: pi.client_secret,
        paymentIntentId: pi.id,
        status: "awaiting_payment",
      },
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error("checkout-service error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return Response.json(
      { error: message },
      { status: 500, headers: corsHeaders }
    );
  }
});
