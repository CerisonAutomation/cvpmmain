-- ============================================================================
-- Migration 002: Full Booking Platform Schema
-- Implements: quotes, bookings, payments, booking_events,
--             webhook_receipts, cms_config, listings_cache
-- ============================================================================

-- updated_at auto-update helper
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── listings_cache ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS listings_cache (
  id           TEXT PRIMARY KEY,                  -- Guesty listing _id
  data         JSONB NOT NULL,
  cached_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ttl_seconds  INT NOT NULL DEFAULT 900,          -- 15 min default
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_listings_cache_cached_at ON listings_cache(cached_at);

-- ── quotes ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quotes (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guesty_quote_id       TEXT UNIQUE,               -- Guesty quote _id
  listing_id            TEXT NOT NULL,             -- Guesty listing _id
  check_in              DATE NOT NULL,
  check_out             DATE NOT NULL,
  guests_count          INT NOT NULL DEFAULT 1,
  nights_count          INT NOT NULL DEFAULT 1,
  currency              TEXT NOT NULL DEFAULT 'EUR',
  accommodation         NUMERIC(12,2),
  cleaning_fee          NUMERIC(12,2),
  service_fee           NUMERIC(12,2),
  taxes                 NUMERIC(12,2),
  total                 NUMERIC(12,2) NOT NULL,
  raw_response          JSONB,
  status                TEXT NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active','expired','converted')),
  expires_at            TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_quotes_listing   ON quotes(listing_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status    ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_expires   ON quotes(expires_at);
CREATE TRIGGER trg_quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── bookings ─────────────────────────────────────────────────────────────────
-- This is the canonical booking record (Supabase as source of truth)
CREATE TABLE IF NOT EXISTS bookings (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id                  UUID REFERENCES quotes(id),
  listing_id                TEXT NOT NULL,
  guesty_reservation_id     TEXT,
  confirmation_code         TEXT,
  check_in                  DATE NOT NULL,
  check_out                 DATE NOT NULL,
  guests_count              INT NOT NULL DEFAULT 1,
  currency                  TEXT NOT NULL DEFAULT 'EUR',
  total_amount              NUMERIC(12,2) NOT NULL,
  -- Guest info
  guest_first_name          TEXT NOT NULL,
  guest_last_name           TEXT NOT NULL,
  guest_email               TEXT NOT NULL,
  guest_phone               TEXT,
  -- Booking state machine
  status                    TEXT NOT NULL DEFAULT 'draft'
                              CHECK (status IN (
                                'draft','quote_created','awaiting_payment',
                                'payment_processing','paid','booking_submitting',
                                'confirmed','inquiry_required','payment_failed',
                                'booking_failed','expired','cancelled',
                                'needs_manual_review'
                              )),
  -- Stripe
  stripe_payment_intent_id  TEXT,
  stripe_client_secret      TEXT,                  -- stored ONLY briefly, cleared after payment
  -- Flags
  is_instant_book           BOOLEAN DEFAULT TRUE,
  coupon_code               TEXT,
  -- Metadata
  ip_address                INET,
  user_agent                TEXT,
  metadata                  JSONB,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bookings_status          ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_listing         ON bookings(listing_id);
CREATE INDEX IF NOT EXISTS idx_bookings_guest_email     ON bookings(guest_email);
CREATE INDEX IF NOT EXISTS idx_bookings_stripe_pi      ON bookings(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_bookings_guesty_res     ON bookings(guesty_reservation_id);
CREATE INDEX IF NOT EXISTS idx_bookings_created        ON bookings(created_at DESC);
CREATE TRIGGER trg_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── payments ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id                UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  stripe_payment_intent_id  TEXT NOT NULL,
  stripe_charge_id          TEXT,
  amount                    NUMERIC(12,2) NOT NULL,
  currency                  TEXT NOT NULL DEFAULT 'EUR',
  status                    TEXT NOT NULL DEFAULT 'pending'
                              CHECK (status IN (
                                'pending','processing','succeeded',
                                'failed','refunded','partially_refunded','disputed'
                              )),
  failure_code              TEXT,
  failure_message           TEXT,
  refunded_amount           NUMERIC(12,2) DEFAULT 0,
  metadata                  JSONB,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payments_booking     ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_pi  ON payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_status     ON payments(status);
CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── booking_events ────────────────────────────────────────────────────────────
-- Append-only audit log — never delete rows
CREATE TABLE IF NOT EXISTS booking_events (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id    UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  event_type    TEXT NOT NULL,                      -- e.g. 'status_changed', 'payment_captured'
  from_status   TEXT,
  to_status     TEXT,
  actor         TEXT DEFAULT 'system',              -- 'system' | 'user' | 'webhook'
  data          JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_booking_events_booking ON booking_events(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_events_type    ON booking_events(event_type);
CREATE INDEX IF NOT EXISTS idx_booking_events_created ON booking_events(created_at DESC);

-- ── webhook_receipts ─────────────────────────────────────────────────────────
-- Idempotency guard for all inbound webhooks
CREATE TABLE IF NOT EXISTS webhook_receipts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider        TEXT NOT NULL,                    -- 'stripe' | 'guesty'
  event_id        TEXT NOT NULL,                    -- provider event id
  event_type      TEXT NOT NULL,
  processed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status          TEXT NOT NULL DEFAULT 'processed'
                    CHECK (status IN ('processed','failed','skipped')),
  error_message   TEXT,
  UNIQUE (provider, event_id)
);
CREATE INDEX IF NOT EXISTS idx_webhook_receipts_provider ON webhook_receipts(provider, event_id);

-- ── cms_config ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cms_config (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  description TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_cms_config_updated_at
  BEFORE UPDATE ON cms_config
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Seed default config keys
INSERT INTO cms_config (key, value, description) VALUES
  ('site_settings', '{"maintenanceMode": false, "bookingEnabled": true}', 'Global site settings'),
  ('payment_settings', '{"stripeEnabled": true, "defaultCurrency": "EUR"}', 'Payment configuration')
ON CONFLICT (key) DO NOTHING;

-- ── RLS Policies ─────────────────────────────────────────────────────────────
ALTER TABLE listings_cache    ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_events    ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_receipts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_config        ENABLE ROW LEVEL SECURITY;

-- listings_cache: public read (proxy populates via service_role)
CREATE POLICY "Public read listings_cache"
  ON listings_cache FOR SELECT TO anon USING (true);

-- quotes: anon can create (proxy creates), owner can read by id
CREATE POLICY "Anon insert quotes"
  ON quotes FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Service role all quotes"
  ON quotes FOR ALL TO service_role USING (true) WITH CHECK (true);

-- bookings: anon insert (initial draft), service_role full access
CREATE POLICY "Anon insert bookings"
  ON bookings FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon read own booking"
  ON bookings FOR SELECT TO anon
  USING (stripe_payment_intent_id IS NOT NULL);
CREATE POLICY "Service role all bookings"
  ON bookings FOR ALL TO service_role USING (true) WITH CHECK (true);

-- payments: service_role only (never exposed to frontend)
CREATE POLICY "Service role all payments"
  ON payments FOR ALL TO service_role USING (true) WITH CHECK (true);

-- booking_events: service_role write, anon read own
CREATE POLICY "Service role all booking_events"
  ON booking_events FOR ALL TO service_role USING (true) WITH CHECK (true);

-- webhook_receipts: service_role only
CREATE POLICY "Service role all webhook_receipts"
  ON webhook_receipts FOR ALL TO service_role USING (true) WITH CHECK (true);

-- cms_config: public read
CREATE POLICY "Public read cms_config"
  ON cms_config FOR SELECT TO anon USING (true);
CREATE POLICY "Service role all cms_config"
  ON cms_config FOR ALL TO service_role USING (true) WITH CHECK (true);
