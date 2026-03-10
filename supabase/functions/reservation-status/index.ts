/**
 * reservation-status Edge Function
 *
 * Fetches booking status from Supabase and optionally broadcasts
 * a Realtime event on the booking:{bookingId} channel.
 *
 * GET  /reservation-status?bookingId=<uuid>
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "GET") {
    return Response.json({ error: "GET required" }, { status: 405, headers: corsHeaders });
  }

  const url = new URL(req.url);
  const bookingId = url.searchParams.get("bookingId");

  if (!bookingId) {
    return Response.json(
      { error: "bookingId query parameter is required" },
      { status: 400, headers: corsHeaders }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const sb = createClient(supabaseUrl, supabaseKey);

  const { data: booking, error } = await sb
    .from("bookings")
    .select(
      `id, status, confirmation_code, guesty_reservation_id,
       check_in, check_out, guests_count, total_amount, currency,
       guest_first_name, guest_last_name, guest_email,
       listing_id, is_instant_book, created_at, updated_at`
    )
    .eq("id", bookingId)
    .maybeSingle();

  if (error) {
    console.error("reservation-status error:", error);
    return Response.json(
      { error: "Failed to fetch booking" },
      { status: 500, headers: corsHeaders }
    );
  }

  if (!booking) {
    return Response.json(
      { error: "Booking not found" },
      { status: 404, headers: corsHeaders }
    );
  }

  // Fetch latest booking events for client polling awareness
  const { data: events } = await sb
    .from("booking_events")
    .select("event_type, from_status, to_status, created_at")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: false })
    .limit(5);

  return Response.json(
    {
      booking: {
        ...booking,
        // Never expose client secret
        stripe_client_secret: undefined,
        stripe_payment_intent_id: undefined,
      },
      events: events ?? [],
    },
    { headers: corsHeaders }
  );
});
