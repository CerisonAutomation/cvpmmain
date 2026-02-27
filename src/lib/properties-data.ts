/**
 * All 20 real properties from ULTIMATE_COMPLETE_GUIDE.md
 * This is the SINGLE SOURCE OF TRUTH for property data.
 * Zero hardcoded/mock data — all IDs are real Guesty listing IDs.
 */

export interface StaticProperty {
  id: string;
  title: string;
  location: string;
  guests: number;
  bedrooms: number;
  bathrooms: number;
  pricePerNight: number;
  summary: string;
  bookingUrl: string;
}

export const ALL_PROPERTIES: StaticProperty[] = [
  {
    id: '6878a53283f1c400114b71e8',
    title: 'The Fives Apartments - St Julian\'s',
    location: 'St Julians, Malta',
    guests: 6, bedrooms: 3, bathrooms: 3,
    pricePerNight: 200,
    summary: 'Discover the perfect blend of comfort, style, and convenience in this spacious 3-bedroom, 3-bathroom apartment in St Julian\'s.',
    bookingUrl: 'https://malta.guestybookings.com/en/properties/6878a53283f1c400114b71e8',
  },
  {
    id: '6878a5365a563c0013969391',
    title: '123 St Ursula Street',
    location: 'Il-Belt Valletta, Malta',
    guests: 4, bedrooms: 1, bathrooms: 2,
    pricePerNight: 150,
    summary: 'Tucked within Valletta\'s enchanting, maze-like streets lies our heartwarming retreat.',
    bookingUrl: 'https://malta.guestybookings.com/en/properties/6878a5365a563c0013969391',
  },
  {
    id: '6878a53de8249000105817f8',
    title: 'St. Julian\'s Penthouse: Terrace, Sea, & Free WiFi',
    location: 'San Ġiljan, Malta',
    guests: 4, bedrooms: 2, bathrooms: 2,
    pricePerNight: 155,
    summary: 'Discover your very own Duplex Penthouse suite in the heart of St Julians, just steps from the Mediterranean sea.',
    bookingUrl: 'https://malta.guestybookings.com/en/properties/6878a53de8249000105817f8',
  },
  {
    id: '6878a53f1ba8fd0013579afc',
    title: 'Escape in The Secret Villa - Outdoor Event Space',
    location: 'Is-Swieqi, Malta',
    guests: 99, bedrooms: 1, bathrooms: 5,
    pricePerNight: 1200,
    summary: 'OUTDOOR EVENT SPACE - FOR DAY USE ONLY. Venture beyond the ordinary looking black gate to find an extraordinary secret villa.',
    bookingUrl: 'https://malta.guestybookings.com/en/properties/6878a53f1ba8fd0013579afc',
  },
  {
    id: '6878a8fe83f1c400114b8729',
    title: 'Penthouse Private Pool & Sea Views',
    location: 'Pembroke, Malta',
    guests: 4, bedrooms: 2, bathrooms: 2,
    pricePerNight: 220,
    summary: 'Live the Malta dream from your private rooftop pool in this designer penthouse with sweeping sea views.',
    bookingUrl: 'https://malta.guestybookings.com/en/properties/6878a8fe83f1c400114b8729',
  },
  {
    id: '6878b38eff3fc3001270e226',
    title: 'Luna Apartment 1 - Designer Apt Maltese Balcony Steps Away From Sea',
    location: 'Il-Gżira, Malta',
    guests: 4, bedrooms: 2, bathrooms: 2,
    pricePerNight: 135,
    summary: 'Designer 2-bed 2-bath apartment with traditional Maltese balcony, just steps from Gżira\'s palm-lined promenade.',
    bookingUrl: 'https://malta.guestybookings.com/en/properties/6878b38eff3fc3001270e226',
  },
  {
    id: '6878b49ade36ed001380e087',
    title: 'Palazzo Ducoss - Stay In The Heart Of Valletta',
    location: 'Valletta, Malta',
    guests: 4, bedrooms: 2, bathrooms: 1,
    pricePerNight: 135,
    summary: 'Discover tranquility in our charming Valletta apartment, free of Airbnb Service fees.',
    bookingUrl: 'https://malta.guestybookings.com/en/properties/6878b49ade36ed001380e087',
  },
  {
    id: '6878b49e4b18f20010c10424',
    title: 'Palazzo Ducoss Apt 5 | 3 Bed Suite In Heart of Valletta',
    location: 'Valletta, Malta',
    guests: 6, bedrooms: 3, bathrooms: 2,
    pricePerNight: 235,
    summary: 'Welcome to your unforgettable escape nestled in the heart of Valletta, where timeless elegance meets modern comfort.',
    bookingUrl: 'https://malta.guestybookings.com/en/properties/6878b49e4b18f20010c10424',
  },
  {
    id: '6878b4a2de36ed001380e217',
    title: 'Palazzo Ducoss - Apt 7 - Two Bedroom One Bathroom',
    location: 'Valletta, Malta',
    guests: 4, bedrooms: 2, bathrooms: 1,
    pricePerNight: 185,
    summary: 'Discover a slice of Valletta\'s charm in this brand-new, fully air-conditioned apartment.',
    bookingUrl: 'https://malta.guestybookings.com/en/properties/6878b4a2de36ed001380e217',
  },
  {
    id: '6878b4a5b2d78d0013f6d64a',
    title: 'Luna Apartment 4 - Discover Modern Luxury by the Sea',
    location: 'Gżira, Malta',
    guests: 4, bedrooms: 2, bathrooms: 2,
    pricePerNight: 170,
    summary: 'Step into a brand new, high-end apartment just steps from Gzira\'s seafront.',
    bookingUrl: 'https://malta.guestybookings.com/en/properties/6878b4a5b2d78d0013f6d64a',
  },
  {
    id: '6878b6bed7bd04001382ce19',
    title: 'LIMONCELLO - A Unique 2Bed Apt. In Heart Of Valletta',
    location: 'Valletta, Malta',
    guests: 6, bedrooms: 2, bathrooms: 2,
    pricePerNight: 200,
    summary: 'Immerse yourself in Malta\'s capital at this unique 2 bedroom, 2 bathroom apartment that blends modern comfort with character.',
    bookingUrl: 'https://malta.guestybookings.com/en/properties/6878b6bed7bd04001382ce19',
  },
  {
    id: '6878b7de31951400107a1c62',
    title: 'Designer Apt with Jacuzzi Terrace',
    location: 'In-Naxxar, Malta',
    guests: 6, bedrooms: 3, bathrooms: 2,
    pricePerNight: 190,
    summary: 'This stylish three-bedroom, two-bathroom apartment comfortably accommodates up to 6 guests. Unwind in the Jacuzzi terrace.',
    bookingUrl: 'https://malta.guestybookings.com/en/properties/6878b7de31951400107a1c62',
  },
  {
    id: '6878ba808498e400306254d0',
    title: 'Central Oasis: Near Beach, Private Yard, Free WiFi',
    location: 'San Ġiljan, Malta',
    guests: 2, bedrooms: 1, bathrooms: 1,
    pricePerNight: 100,
    summary: 'Discover the perfect blend of comfort and convenience in our bright, spacious apartment just 8 mins walk from the beach.',
    bookingUrl: 'https://malta.guestybookings.com/en/properties/6878ba808498e400306254d0',
  },
  {
    id: '6878bb63fadd6c001274c7f6',
    title: 'The Canary Loft - Stay in Heart of St Julians',
    location: 'St. Julian\'s, Malta',
    guests: 3, bedrooms: 1, bathrooms: 5,
    pricePerNight: 145,
    summary: 'Just a short stroll from sandy beaches and the buzzing nightlife of St Julian\'s, The Canary Loft is a bright, charming space.',
    bookingUrl: 'https://malta.guestybookings.com/en/properties/6878bb63fadd6c001274c7f6',
  },
  {
    id: '6878d07f31951400107a9b1e',
    title: 'Palazzo San Pawl | Pinto Suite',
    location: 'Valletta, Malta',
    guests: 4, bedrooms: 1, bathrooms: 1,
    pricePerNight: 175,
    summary: 'For the Comfort and Tranquility of All Guests: This Property is Exclusively for Adults. Welcome to the Pinto Suite.',
    bookingUrl: 'https://malta.guestybookings.com/en/properties/6878d07f31951400107a9b1e',
  },
  {
    id: '6878d08b4b18f20010c18776',
    title: 'Palazzo San Pawl | Hompesh Suite',
    location: 'Valletta, Malta',
    guests: 2, bedrooms: 1, bathrooms: 1,
    pricePerNight: 185,
    summary: 'For the Comfort and Tranquility of All Guests: This Property is Exclusively for Adults. Welcome to the Hompesh Suite.',
    bookingUrl: 'https://malta.guestybookings.com/en/properties/6878d08b4b18f20010c18776',
  },
  {
    id: '6878d08ed7bd04001383647e',
    title: 'Palazzo San Pawl - The Villhena Suite',
    location: 'Valletta, Malta',
    guests: 2, bedrooms: 1, bathrooms: 1,
    pricePerNight: 135,
    summary: 'Nestled in the historic heart of a 17th-century building originally constructed by the Knights of Malta.',
    bookingUrl: 'https://malta.guestybookings.com/en/properties/6878d08ed7bd04001383647e',
  },
  {
    id: '688129e5bc213c00137e9ed8',
    title: 'Modern Stylish Central Apt. St Julians',
    location: 'San Ġiljan, Malta',
    guests: 4, bedrooms: 2, bathrooms: 1,
    pricePerNight: 130,
    summary: 'Escape to a chic, urban oasis in the heart of St. Julian\'s, designed for those who seek comfort and convenience.',
    bookingUrl: 'https://malta.guestybookings.com/en/properties/688129e5bc213c00137e9ed8',
  },
  {
    id: '688129ea869c1e0010d312f5',
    title: 'Urban Suite with Terrace In Heart of St Julian\'s',
    location: 'San Ġiljan, Malta',
    guests: 4, bedrooms: 1, bathrooms: 1,
    pricePerNight: 130,
    summary: 'Discover the charm of St. Julians in our modern, centrally-located apartment.',
    bookingUrl: 'https://malta.guestybookings.com/en/properties/688129ea869c1e0010d312f5',
  },
  {
    id: '6887543b414546001386d259',
    title: 'Stay Steps Away From Sea',
    location: 'Gzira, Malta',
    guests: 4, bedrooms: 2, bathrooms: 1,
    pricePerNight: 145,
    summary: 'Nestled in Malta\'s vibrant Gzira, our modern apartment is steps from the sea.',
    bookingUrl: 'https://malta.guestybookings.com/en/properties/6887543b414546001386d259',
  },
];

/** Get all unique locations from properties */
export const PROPERTY_LOCATIONS = [...new Set(ALL_PROPERTIES.map(p => {
  // Normalize to city name
  const city = p.location.split(',')[0].trim();
  return city;
}))];

/** Get featured properties (first 3) */
export const FEATURED_PROPERTIES = ALL_PROPERTIES.slice(0, 3);

/** Company contact info from the guide */
export const COMPANY_INFO = {
  email: 'info@christianopropertymanagement.com',
  phone: '+35679790202',
  bookingUrl: 'https://malta.guestybookings.com/',
} as const;
