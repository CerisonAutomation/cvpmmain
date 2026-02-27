-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  destination TEXT NOT NULL,
  description TEXT,
  hero_image TEXT,
  gallery TEXT[],
  amenities TEXT[],
  max_guests INT NOT NULL DEFAULT 2,
  bedrooms INT DEFAULT 1,
  bathrooms INT DEFAULT 1,
  price_per_night DECIMAL(10,2) DEFAULT 100,
  rating DECIMAL(2,1),
  guesty_listing_id TEXT,
  guesty_property_id TEXT,
  check_in TIME DEFAULT '15:00',
  check_out TIME DEFAULT '11:00',
  cancellation_policy TEXT DEFAULT 'Flexible',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Units table
CREATE TABLE IF NOT EXISTS units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  max_guests INT NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  guesty_unit_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rate plans
CREATE TABLE IF NOT EXISTS rate_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  currency TEXT DEFAULT 'EUR',
  weekend_multiplier DECIMAL(4,2) DEFAULT 1.2,
  min_nights INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reservations
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id),
  guest_email TEXT NOT NULL,
  guest_first_name TEXT NOT NULL,
  guest_last_name TEXT NOT NULL,
  guest_phone TEXT,
  currency TEXT DEFAULT 'EUR',
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'confirmed',
  payment_status TEXT DEFAULT 'paid',
  stripe_payment_intent_id TEXT,
  guesty_reservation_id TEXT,
  check_in DATE,
  check_out DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reservation units (with overlap prevention)
CREATE TABLE IF NOT EXISTS reservation_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID REFERENCES reservations(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES units(id),
  stay TSTZRANGE NOT NULL,
  EXCLUDE USING gist (unit_id WITH =, stay WITH &&)
);

-- Pending reservations
CREATE TABLE IF NOT EXISTS pending_reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id),
  unit_id UUID REFERENCES units(id),
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  adults INT NOT NULL,
  children INT DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  total_amount DECIMAL(10,2),
  quote JSONB,
  guest_email TEXT,
  guest_first_name TEXT,
  guest_last_name TEXT,
  stripe_payment_intent_id TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Addons
CREATE TABLE IF NOT EXISTS addons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id),
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_properties_slug ON properties(slug);
CREATE INDEX IF NOT EXISTS idx_properties_destination ON properties(destination);
CREATE INDEX IF NOT EXISTS idx_units_property ON units(property_id);
CREATE INDEX IF NOT EXISTS idx_pending_status ON pending_reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_property ON reservations(property_id);

-- =============================================================================
-- SEED DATA - ALL 20 PROPERTIES (MALTA)
-- =============================================================================

-- Property 1: The Fives Apartments - St Julian's
INSERT INTO properties (name, slug, destination, description, hero_image, max_guests, bedrooms, bathrooms, price_per_night) VALUES 
('The Fives Apartments - St Julian''s', 'the-fives-apartments-st-julians', 'St Julians, Malta', 'Discover the perfect blend of comfort, style, and convenience in this spacious 3-bedroom, 3-bathroom apartment in the heart of St Julians.', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 6, 3, 3, 150);

-- Property 2: 123 St Ursula Street
INSERT INTO properties (name, slug, destination, description, hero_image, max_guests, bedrooms, bathrooms, price_per_night) VALUES 
('123 St Ursula Street', '123-st-ursula-street', 'Valletta, Malta', 'Tucked within Valletta''s enchanting, maze-like streets lies our heartwarming retreat. As you push open the traditional door...', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 4, 1, 2, 150);

-- Property 3: St. Julian's Penthouse
INSERT INTO properties (name, slug, destination, description, hero_image, max_guests, bedrooms, bathrooms, price_per_night) VALUES 
('St. Julian''s Penthouse: Terrace, Sea & Free WiFi', 'st-julians-penthouse-terrace-sea-wifi', 'St Julians, Malta', 'Discover your very own Duplex Penthouse suite in the heart of St Julians, just steps from the Mediterranean sea.', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', 4, 2, 2, 150);

-- Property 4: Escape in The Secret Villa
INSERT INTO properties (name, slug, destination, description, hero_image, max_guests, bedrooms, bathrooms, price_per_night) VALUES 
('Escape in The Secret Villa - Outdoor Event Space', 'escape-in-the-secret-villa-outdoor-event-space', 'Swieqi, Malta', '*OUTDOOR EVENT SPACE - FOR DAY USE ONLY* Venture beyond the ordinary looking black gate to find your private oasis.', 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800', 99, 1, 5, 150);

-- Property 5: Penthouse Private Pool & Sea Views
INSERT INTO properties (name, slug, destination, description, hero_image, max_guests, bedrooms, bathrooms, price_per_night) VALUES 
('Penthouse Private Pool & Sea Views', 'penthouse-private-pool-sea-views', 'Pembroke, Malta', 'Live the Malta dream from your private rooftop pool in this designer penthouse with sweeping sea views.', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', 4, 2, 2, 150);

-- Property 6: Luna Apartment 1
INSERT INTO properties (name, slug, destination, description, hero_image, max_guests, bedrooms, bathrooms, price_per_night) VALUES 
('Luna Apartment 1 - Designer Apt Maltese Balcony', 'luna-apartment-1-designer-apt-maltese-balcony', 'Gzira, Malta', 'Designer 2-bed 2-bath apartment with traditional Maltese balcony, just steps from Gzira''s palm-lined promenade.', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 4, 2, 2, 150);

-- Property 7: Palazzo Ducoss
INSERT INTO properties (name, slug, destination, description, hero_image, max_guests, bedrooms, bathrooms, price_per_night) VALUES 
('Palazzo Ducoss - Stay In The Heart Of Valletta', 'palazzo-ducoss-heart-of-valletta', 'Valletta, Malta', 'Discover tranquility in our charming Valletta apartment, free of Airbnb Service fees. This spacious, light-filled retreat.', 'https://images.unsplash.com/photo-1549638441-b787d2e11f14?w=800', 4, 2, 1, 150);

-- Property 8: Palazzo Ducoss Apt 5
INSERT INTO properties (name, slug, destination, description, hero_image, max_guests, bedrooms, bathrooms, price_per_night) VALUES 
('Palazzo Ducoss Apt 5 | 3 Bed Suite In Heart of Valletta', 'pal-apt-5azzo-ducoss-3-bed-suite-valletta', 'Valletta, Malta', 'Welcome to your unforgettable escape nestled in the heart of Valletta, where timeless elegance meets modern comfort.', 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800', 6, 3, 2, 150);

-- Property 9: Palazzo Ducoss Apt 7
INSERT INTO properties (name, slug, destination, description, hero_image, max_guests, bedrooms, bathrooms, price_per_night) VALUES 
('Palazzo Ducoss - Apt 7 - Two Bedroom One Bathroom', 'palazzo-ducoss-apt-7-two-bedroom-valletta', 'Valletta, Malta', 'Discover a slice of Valletta''s charm in this brand-new, fully air-conditioned apartment.', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', 4, 2, 1, 150);

-- Property 10: Luna Apartment 4
INSERT INTO properties (name, slug, destination, description, hero_image, max_guests, bedrooms, bathrooms, price_per_night) VALUES 
('Luna Apartment 4 - Discover Modern Luxury by the Sea', 'luna-apartment-4-modern-luxury-sea', 'Gzira, Malta', 'Step into a brand new, high-end apartment just steps from Gzira''s seafront. Located on the 4th floor with lift.', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', 4, 2, 2, 150);

-- Property 11: LIMONCELLO
INSERT INTO properties (name, slug, destination, description, hero_image, max_guests, bedrooms, bathrooms, price_per_night) VALUES 
('LIMONCELLO - A Unique 2Bed Apt. In Heart Of Valletta', 'limoncello-unique-2bed-apt-heart-valletta', 'Valletta, Malta', 'Immerse yourself in Malta''s capital at this unique 2 bedroom, 2 bathroom apartment that blends modern comfort with historic charm.', 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800', 6, 2, 2, 150);

-- Property 12: Designer Apt with Jacuzzi
INSERT INTO properties (name, slug, destination, description, hero_image, max_guests, bedrooms, bathrooms, price_per_night) VALUES 
('Designer Apt with Jacuzzi Terrace', 'designer-apt-jacuzzi-terrace', 'Naxxar, Malta', 'This stylish three-bedroom, two-bathroom apartment comfortably accommodates up to 6 guests. Unwind in your private jacuzzi.', 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800', 6, 3, 2, 150);

-- Property 13: Central Oasis
INSERT INTO properties (name, slug, destination, description, hero_image, max_guests, bedrooms, bathrooms, price_per_night) VALUES 
('Central Oasis: Near Beach, Private Yard, Free WiFi', 'central-oasis-near-beach-private-yard-wifi', 'St Julians, Malta', 'Discover the perfect blend of comfort and convenience in our bright, spacious apartment just 8 mins walk from the beach.', 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800', 2, 1, 1, 150);

-- Property 14: The Canary Loft
INSERT INTO properties (name, slug, destination, description, hero_image, max_guests, bedrooms, bathrooms, price_per_night) VALUES 
('The Canary Loft - Stay in Heart of St Julians', 'canary-loft-heart-of-st-julians', 'St Julians, Malta', 'Just a short stroll from sandy beaches and the buzzing nightlife of St Julian''s, The Canary Loft is a bright, charming retreat.', 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800', 3, 1, 1, 150);

-- Property 15: Palazzo San Pawl | Pinto Suite
INSERT INTO properties (name, slug, destination, description, hero_image, max_guests, bedrooms, bathrooms, price_per_night) VALUES 
('Palazzo San Pawl | Pinto Suite', 'palazzo-san-pawl-pinto-suite', 'Valletta, Malta', 'For the Comfort and Tranquility of All Guests: This Property is Exclusively for Adults. Welcome to the Pinto Suite.', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800', 4, 1, 1, 150);

-- Property 16: Palazzo San Pawl | Hompesh Suite
INSERT INTO properties (name, slug, destination, description, hero_image, max_guests, bedrooms, bathrooms, price_per_night) VALUES 
('Palazzo San Pawl | Hompesh Suite', 'palazzo-san-pawl-hompesh-suite', 'Valletta, Malta', 'For the Comfort and Tranquility of All Guests: This Property is Exclusively for Adults. Welcome to the Hompesh Suite.', 'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=800', 2, 1, 1, 150);

-- Property 17: Palazzo San Pawl - The Villhena Suite
INSERT INTO properties (name, slug, destination, description, hero_image, max_guests, bedrooms, bathrooms, price_per_night) VALUES 
('Palazzo San Pawl - The Villhena Suite', 'palazzo-san-pawl-villhena-suite', 'Valletta, Malta', 'Nestled in the historic heart of a 17th-century building originally constructed by the Knights of Malta.', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800', 2, 1, 1, 150);

-- Property 18: Modern Stylish Central Apt
INSERT INTO properties (name, slug, destination, description, hero_image, max_guests, bedrooms, bathrooms, price_per_night) VALUES 
('Modern Stylish Central Apt. St Julians', 'modern-stylish-central-apt-st-julians', 'St Julians, Malta', 'Escape to a chic, urban oasis in the heart of St. Julian''s, designed for those who seek comfort and convenience.', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800', 4, 2, 1, 150);

-- Property 19: Urban Suite with Terrace
INSERT INTO properties (name, slug, destination, description, hero_image, max_guests, bedrooms, bathrooms, price_per_night) VALUES 
('Urban Suite with Terrace In Heart of St Julian''s', 'urban-suite-terrace-heart-st-julians', 'St Julians, Malta', 'Discover the charm of St. Julians in our modern, centrally-located apartment that can comfortably accommodate you.', 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800', 4, 1, 1, 150);

-- Property 20: Stay Steps Away From Sea
INSERT INTO properties (name, slug, destination, description, hero_image, max_guests, bedrooms, bathrooms, price_per_night) VALUES 
('Stay Steps Away From Sea', 'stay-steps-away-from-sea', 'Gzira, Malta', 'Nestled in Malta''s vibrant Gzira, our modern apartment is steps from the sea. Enjoy a restful night in the oversized bed.', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800', 4, 2, 1, 150);

-- Property 21: Sea Breeze Studio
INSERT INTO properties (name, slug, destination, description, hero_image, max_guests, bedrooms, bathrooms, price_per_night) VALUES 
('Sea Breeze Studio', 'sea-breeze-studio', 'Sliema, Malta', 'Modern studio apartment with stunning sea views in the heart of Sliema. Walking distance to restaurants and beaches.', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', 2, 1, 1, 95);

-- Property 22: Garden View Apartment
INSERT INTO properties (name, slug, destination, description, hero_image, max_guests, bedrooms, bathrooms, price_per_night) VALUES 
('Garden View Apartment', 'garden-view-apartment', 'Bugibba, Malta', 'Peaceful apartment with private garden in a quiet residential area. Perfect for families seeking relaxation.', 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800', 4, 2, 1, 120);

-- Property 23: Marina Lux Suite
INSERT INTO properties (name, slug, destination, description, hero_image, max_guests, bedrooms, bathrooms, price_per_night) VALUES 
('Marina Lux Suite', 'marina-lux-suite', 'Qawra, Malta', 'Luxury suite overlooking the marina with modern amenities. Close to Malta''s top attractions and beaches.', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', 6, 3, 2, 180);

-- Property 24: Traditional Maltese House
INSERT INTO properties (name, slug, destination, description, hero_image, max_guests, bedrooms, bathrooms, price_per_night) VALUES 
('Traditional Maltese House', 'traditional-maltese-house', 'Mellieha, Malta', 'Authentic Maltese townhouse with original stone walls and modern comforts. Experience true Maltese charm.', 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800', 5, 3, 2, 165);

-- =============================================================================
-- CREATE UNITS FOR ALL PROPERTIES
-- =============================================================================
INSERT INTO units (property_id, name, max_guests, base_price)
SELECT id, name || ' Unit', max_guests, price_per_night
FROM properties;

-- Create default rate plan for each unit
INSERT INTO rate_plans (unit_id, title, currency, weekend_multiplier, min_nights)
SELECT id, 'Standard Rate', 'EUR', 1.2, 2
FROM units;

-- =============================================================================
-- RLS POLICIES
-- =============================================================================
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read properties" ON properties FOR SELECT TO anon USING (true);
CREATE POLICY "Public read units" ON units FOR SELECT TO anon USING (true);
CREATE POLICY "Public read rate_plans" ON rate_plans FOR SELECT TO anon USING (true);
CREATE POLICY "Public create pending" ON pending_reservations FOR INSERT TO anon WITH CHECK (true);
