/**
 * upsellIcons.tsx
 *
 * Maps Guesty upsell fee names to Lucide icons.
 * Matching is case-insensitive substring match against fee.name.
 *
 * Usage:
 *   import { getUpsellIcon } from '@/lib/guesty/upsellIcons';
 *   const Icon = getUpsellIcon(fee.name);
 *   <Icon size={14} className="text-primary" />
 */
import {
  Baby,
  Clock3,
  Clock,
  Car,
  Waves,
  Utensils,
  ShoppingBag,
  Luggage,
  Shirt,
  Wind,
  Flower2,
  Dog,
  Bike,
  Sailboat,
  Camera,
  Gift,
  UtensilsCrossed,
  Wifi,
  Tv2,
  BedDouble,
  Sparkles,
  Package,
  LucideProps,
} from 'lucide-react';
import type { FC } from 'react';

type LucideIcon = FC<LucideProps>;

interface UpsellIconRule {
  /** Lowercase substring(s) to match against fee.name.toLowerCase() */
  keywords: string[];
  icon: LucideIcon;
}

/**
 * Ordered rules — first match wins.
 * More specific rules go first.
 */
const UPSELL_ICON_RULES: UpsellIconRule[] = [
  // ── Baby / crib / child ─────────────────────────────────────────────────
  { keywords: ['crib', 'cot', 'baby', 'infant', 'toddler', 'child', 'kids bed'], icon: Baby },

  // ── Late checkout / early check-in ──────────────────────────────────────
  { keywords: ['late check', 'late-check', 'late out', 'checkout extension', 'extended checkout',
               'early check', 'early-check', 'early in', 'flexible check'], icon: Clock3 },

  // ── Parking ─────────────────────────────────────────────────────────────
  { keywords: ['parking', 'garage', 'car park', 'valet'], icon: Car },

  // ── Pool / hot tub / spa ─────────────────────────────────────────────────
  { keywords: ['pool', 'hot tub', 'jacuzzi', 'spa', 'sauna'], icon: Waves },

  // ── Breakfast / meals / catering ────────────────────────────────────────
  { keywords: ['breakfast', 'brunch', 'meal', 'catering', 'welcome food', 'dinner'], icon: Utensils },
  { keywords: ['grocery', 'shopping', 'groceries', 'food prep'], icon: ShoppingBag },

  // ── Airport transfer / shuttle ───────────────────────────────────────────
  { keywords: ['airport', 'transfer', 'shuttle', 'pickup', 'pick-up', 'taxi'], icon: Luggage },

  // ── Laundry / dry cleaning ──────────────────────────────────────────────
  { keywords: ['laundry', 'washing', 'dry clean', 'ironing'], icon: Shirt },

  // ── Heating / AC / climate ──────────────────────────────────────────────
  { keywords: ['heating', 'air con', 'ac ', 'climate', 'cooling'], icon: Wind },

  // ── Flowers / welcome hamper / decoration ───────────────────────────────
  { keywords: ['flower', 'bouquet', 'decoration', 'hamper', 'welcome pack', 'welcome basket'], icon: Flower2 },

  // ── Pet fee ─────────────────────────────────────────────────────────────
  { keywords: ['pet', 'dog', 'cat', 'animal'], icon: Dog },

  // ── Bike / scooter / rental ──────────────────────────────────────────────
  { keywords: ['bike', 'bicycle', 'scooter', 'cycling'], icon: Bike },

  // ── Boat / water activities ──────────────────────────────────────────────
  { keywords: ['boat', 'yacht', 'sailing', 'kayak', 'water sport'], icon: Sailboat },

  // ── Photography / video ─────────────────────────────────────────────────
  { keywords: ['photo', 'video', 'filming', 'photography'], icon: Camera },

  // ── Gift / special occasion ──────────────────────────────────────────────
  { keywords: ['gift', 'anniversary', 'birthday', 'celebration', 'honeymoon', 'romantic'], icon: Gift },

  // ── Cleaning / extra clean ───────────────────────────────────────────────
  { keywords: ['cleaning', 'clean', 'housekeeping', 'maid'], icon: Sparkles },

  // ── Extra bed / rollaway ─────────────────────────────────────────────────
  { keywords: ['extra bed', 'rollaway', 'sofa bed', 'additional bed'], icon: BedDouble },

  // ── WiFi / internet ──────────────────────────────────────────────────────
  { keywords: ['wifi', 'wi-fi', 'internet', 'broadband'], icon: Wifi },

  // ── TV / streaming ───────────────────────────────────────────────────────
  { keywords: ['tv ', 'television', 'streaming', 'netflix', 'satellite'], icon: Tv2 },

  // ── Restaurant / dining ──────────────────────────────────────────────────
  { keywords: ['restaurant', 'dining', 'table', 'cook'], icon: UtensilsCrossed },

  // ── Fallback — generic package icon ─────────────────────────────────────
];

/** Default icon when no keyword matches */
export const DEFAULT_UPSELL_ICON: LucideIcon = Package;

/**
 * Returns the best matching Lucide icon component for a given upsell fee name.
 * Falls back to Package if no match found.
 *
 * @param feeName - The fee.name string from Guesty (e.g. "Baby crib", "Late checkout")
 */
export function getUpsellIcon(feeName: string): LucideIcon {
  const lower = (feeName ?? '').toLowerCase();
  for (const rule of UPSELL_ICON_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return rule.icon;
    }
  }
  return DEFAULT_UPSELL_ICON;
}

/**
 * Convenience wrapper — renders the icon directly.
 * Usage: <UpsellIcon feeName={fee.name} size={14} className="text-primary" />
 */
export function UpsellIcon({
  feeName,
  ...props
}: { feeName: string } & LucideProps) {
  const Icon = getUpsellIcon(feeName);
  return <Icon {...props} />;
}
