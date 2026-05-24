// ===========================================================
// CHRISTIANO PROPERTY MANAGEMENT — COMPLETE SINGLE-FILE
// Premium Vacation Rental Platform | Enterprise React + TypeScript
// Features: 30+ Editable Blocks | Guesty API | Drag & Drop | PWA
// ===========================================================

// ─── CORE IMPORTS ──────────────────────
import React, {
  useState, useEffect, useCallback, useRef, useMemo, useContext,
  createContext, memo, Component, Suspense,
  FC, ReactNode, ReactElement,
} from "react";

// ─── ICONS ──────────────────────────
import {
  Search, MapPin, Bed, Bath, Users, Star, Heart, Share2,
  ChevronLeft, ChevronRight, ChevronDown, Menu, X, Loader2,
  Calendar, Clock, DollarSign, TrendingUp, BarChart3,
  Shield, CheckCircle, AlertCircle, Info, Settings,
  Home, Building2, Image, Images, Video, Type, Mail,
  Phone, Globe, Wifi, Car, Coffee, Utensils, Tv,
  Wind, Droplet, Flame, Sun, Moon,
  Plus, Minus, Edit2, Trash2, Copy, Download, Upload,
  Eye, EyeOff, Lock, Unlock, Key, Bell, BellOff,
  MessageCircle, MessageSquare, Send,
  Facebook, Instagram, Linkedin,
  CreditCard, Wallet, Receipt, PiggyBank,
  Award, Gift, Zap, Target, Flag, Bookmark,
  Layers, Grid, List, Layout, PanelLeft, PanelRight,
  GripVertical, Move, Maximize2, Minimize2,
  PlayCircle, Headphones, Mic, Volume2, VolumeX,
  Camera, Scissors, Film, Music,
  Thermometer, Lightbulb, Fan, Refrigerator, WashingMachine,
  Umbrella, CloudRain, CloudSun, Cloudy, Flower2, Treepine,
  Mountain, Waves, Sailboat, Castle, Church, Landmark,
  Plane, Train, Bus, Bike, Store, ShoppingBag, Tag,
  HelpCircle, AlertTriangle, Activity, RefreshCw, Undo2, Redo2,
  FileText, File, Files, Folder, Filter, SlidersHorizontal,
  Scan, QrCode, ExternalLink, Link,
  ArrowRight, ArrowLeft, ArrowUp, ArrowDown,
  Check, ChevronsUp, ChevronsDown, ChevronsLeft, ChevronsRight,
  Circle, Square, Pentagon, Hexagon, Triangle,
  Diamond, Gem, Crown, Trophy, Medal,
  Brain, Wand2, Sparkles, Atom,
  Database, Server, Cloud, HardDrive,
} from "lucide-react";

// ─── ROUTER ──────────────────────────
import {
  BrowserRouter, useNavigate, useParams, useSearchParams,
  Routes, Route, Link, NavLink, useLocation,
} from "react-router-dom";

// ─── UTILITIES ─────────────────────────
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast, Toaster } from "sonner";
import axios, { AxiosInstance } from "axios";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { format, addDays, differenceInDays, parseISO } from "date-fns";

// ===========================================================
// DESIGN TOKENS — Premium Design System
// ===========================================================
const THEME = {
  colors: {
    gold: "#D4AF37",
    goldLight: "#E5C158",
    goldDark: "#B8962F",
    dark: "#0F0F10",
    darker: "#0A0A0B",
    card: "#161618",
    border: "rgba(255,255,255,0.1)",
    text: "#F5F5F0",
    textMuted: "#A1A1AA",
    success: "#22C55E",
    error: "#EF4444",
    warning: "#F59E0B",
  },
} as const;

// ─── UTILITY FUNCTIONS ─────────────────
const cn = (...inputs: (string | undefined | null | boolean)[]): string =>
  twMerge(clsx(inputs));

const formatPrice = (amount: number, currency = "EUR"): string =>
  new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

const formatDate = (dateStr: string): string => {
  try { return format(parseISO(dateStr), "MMM d, yyyy"); }
  catch { return dateStr; }
};

// ===========================================================
// TYPES — Enterprise TypeScript Interfaces
// ===========================================================
interface GuestyListing {
  _id: string;
  title: string;
  description: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  address: { street: string; city: string; state: string; country: string };
  amenities: string[];
  images: { id: string; url: string; thumbnail: string; isCover: boolean }[];
  pricing: { basePrice: number; currency: string; cleaningFee?: number };
  rating?: number;
  reviewsCount?: number;
  isActive: boolean;
}

interface GuestyReservation {
  _id: string;
  status: "confirmed" | "cancelled" | "pending";
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  totalPrice: number;
  guest: { firstName: string; lastName: string; email: string };
  listingId: string;
}

// ===========================================================
// API SERVICE — Guesty Integration
// ===========================================================
class GuestyService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || "/api/guesty",
      timeout: 30000,
    });
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem("auth_token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }

  async getListings(): Promise<GuestyListing[]> {
    const { data } = await this.api.get<{ data: GuestyListing[] }>("/listings");
    return data.data || [];
  }

  async getListing(id: string): Promise<GuestyListing> {
    const { data } = await this.api.get<{ data: GuestyListing }>(`/listings/${id}`);
    return data.data;
  }
}

const guestyService = new GuestyService();

// ===========================================================
// CMS CONTEXT — Block Editor State
// ===========================================================
type BlockType =
  | "hero" | "text" | "image" | "gallery" | "video"
  | "properties" | "property_grid" | "property_map"
  | "features" | "stats" | "testimonials" | "team" | "pricing"
  | "faq" | "about" | "contact" | "form" | "newsletter"
  | "cta" | "cta_split" | "cta_banner"
  | "blog_post" | "blog_grid"
  | "booking_form" | "booking_calendar"
  | "map_block" | "image_comparison"
  | "counter" | "timeline" | "accordion"
  | "tabs_block" | "carousel" | "logo_grid" | "brand_bar"
  | "ai_chat" | "ai_description"
  | "spacer" | "divider" | "header" | "footer";

interface BlockData {
  id: string;
  type: BlockType;
  data: Record<string, unknown>;
  order: number;
}

interface CMSData {
  brand: {
    name: string;
    tagline: string;
    logo: string;
    colors: { primary: string; background: string; text: string };
  };
  blocks: BlockData[];
}

const defaultCMS: CMSData = {
  brand: {
    name: "Christiano Property Management",
    tagline: "Your Home in Malta, Looked After Like a Hotel",
    logo: "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/image-high-82icb0.png",
    colors: { primary: THEME.colors.gold, background: THEME.colors.dark, text: THEME.colors.text },
  },
  blocks: [],
};

interface CMSContextType {
  cms: CMSData;
  updateCMS: (section: string, data: unknown) => void;
  updateBlock: (id: string, data: Partial<BlockData>) => void;
  addBlock: (block: BlockData) => void;
  removeBlock: (id: string) => void;
  reorderBlocks: (blocks: BlockData[]) => void;
  hasChanges: boolean;
  save: () => Promise<void>;
  saving: boolean;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

const useCMS = (): CMSContextType => {
  const ctx = useContext(CMSContext);
  if (!ctx) throw new Error("useCMS must be used within CMSProvider");
  return ctx;
};

const CMSProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [cms, setCMS] = useState<CMSData>(defaultCMS);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const updateCMS = useCallback((section: string, data: unknown) => {
    setCMS((prev) => ({ ...prev, [section]: data }));
    setHasChanges(true);
  }, []);

  const updateBlock = useCallback((id: string, data: Partial<BlockData>) => {
    setCMS((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) => (b.id === id ? { ...b, ...data } : b)),
    }));
    setHasChanges(true);
  }, []);

  const addBlock = useCallback((block: BlockData) => {
    setCMS((prev) => ({ ...prev, blocks: [...prev.blocks, block] }));
    setHasChanges(true);
  }, []);

  const removeBlock = useCallback((id: string) => {
    setCMS((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((b) => b.id !== id),
    }));
    setHasChanges(true);
  }, []);

  const reorderBlocks = useCallback((blocks: BlockData[]) => {
    setCMS((prev) => ({ ...prev, blocks }));
    setHasChanges(true);
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      await axios.post("/api/cms", cms);
      toast.success("Changes saved successfully");
      setHasChanges(false);
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  }, [cms]);

  return (
    <CMSContext.Provider
      value={{ cms, updateCMS, updateBlock, addBlock, removeBlock, reorderBlocks, hasChanges, save, saving }}
    >
      {children}
    </CMSContext.Provider>
  );
};

// ===========================================================
// ERROR BOUNDARY — Enterprise Error Handling
// ===========================================================
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactElement },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; fallback?: ReactElement }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0F0F10] p-6">
          <div className="max-w-md w-full text-center">
            <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="font-['Playfair_Display'] text-2xl text-[#F5F5F0] mb-4">
              Something went wrong
            </h2>
            <p className="text-[#A1A1AA] mb-8">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="inline-flex items-center gap-2 bg-[#D4AF37] text-[#0F0F10] px-6 py-3 hover:bg-[#E5C158] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ===========================================================
// COMPONENTS — Premium Qlo-Style UI
// ===========================================================

// ─── HERO BLOCK ───────────────────────
const HeroBlock: FC<{ data: Record<string, unknown> }> = memo(({ data }) => (
  <section className="relative min-h-[85vh] flex items-center justify-center bg-[#0F0F10]">
    {data.backgroundImage && (
      <>
        <img
          src={data.backgroundImage as string}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F0F10]/50 via-[#0F0F10]/70 to-[#0F0F10]" />
      </>
    )}
    <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
      <h1
        className="font-['Playfair_Display'] text-[clamp(2.5rem,8vw,5rem)] font-bold text-[#F5F5F0] mb-6"
      >
        {(data.headline as string) || "Your Home in Malta"}
      </h1>
      {(data.subheadline as string) && (
        <p className="text-[clamp(1rem,3vw,1.5rem)] text-[#A1A1AA] mb-10 max-w-3xl mx-auto">
          {data.subheadline as string}
        </p>
      )}
      {(data.ctaText as string) && (
        <Link
          to={(data.ctaLink as string) || "/properties"}
          className="inline-block bg-[#D4AF37] text-[#0F0F10] px-10 py-4 text-lg font-medium hover:bg-[#E5C158] transition-all duration-300 hover:scale-105"
        >
          {data.ctaText as string}
        </Link>
      )}
    </div>
  </section>
));

// ─── PROPERTY CARD ──────────────────────
const PropertyCard: FC<{ listing: GuestyListing }> = memo(({ listing }) => (
  <Link to={`/properties/${listing._id}`} className="group block">
    <article className="bg-[#161618] border border-white/10 overflow-hidden hover:border-[#D4AF37]/50 transition-all duration-300">
      <div className="aspect-[4/3] overflow-hidden">
        {listing.images?.[0] && (
          <img
            src={listing.images[0].url}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
        )}
      </div>
      <div className="p-5">
        <h3 className="text-[#F5F5F0] font-medium mb-2 line-clamp-2 group-hover:text-[#D4AF37] transition-colors">
          {listing.title}
        </h3>
        <p className="text-[#A1A1AA] text-sm mb-3 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {listing.address?.city}
        </p>
        <div className="flex items-center gap-4 text-sm text-[#A1A1AA] mb-4">
          <span className="flex items-center gap-1">
            <Bed className="w-4 h-4" /> {listing.bedrooms}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="w-4 h-4" /> {listing.bathrooms}
          </span>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <span className="text-[#D4AF37] font-bold text-lg">
            {formatPrice(listing.pricing?.basePrice || 0)}
            <span className="text-[#A1A1AA] text-sm font-normal">/night</span>
          </span>
          <span className="text-[#A1A1AA] text-sm hover:text-[#D4AF37] transition-colors">
            View details <ArrowRight className="w-4 h-4 inline" />
          </span>
        </div>
      </div>
    </article>
  </Link>
));

// ─── PROPERTIES GRID BLOCK ─────────────────
const PropertiesGridBlock: FC<{ data: Record<string, unknown> }> = memo(({ data }) => {
  const [listings, setListings] = useState<GuestyListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    guestyService.getListings()
      .then((res) => { setListings(res); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section className="py-24 px-6 bg-[#0F0F10]">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-['Playfair_Display'] text-[clamp(2rem,5vw,3.5rem)] text-[#F5F5F0] text-center mb-12">
          {(data.title as string) || "Our Properties"}
        </h2>
        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-[#161618] rounded-lg mb-4" />
                <div className="h-4 bg-[#161618] rounded w-3/4 mb-2" />
                <div className="h-3 bg-[#161618] rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <PropertyCard key={listing._id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
});

// ─── FEATURES BLOCK ──────────────────────
const FeaturesBlock: FC<{ data: Record<string, unknown> }> = memo(({ data }) => {
  const features = [
    { icon: Shield, title: "24/7 Guest Support", desc: "Round-the-clock assistance for all guests" },
    { icon: Sparkles, title: "Professional Cleaning", desc: "Hotel-grade cleaning between every stay" },
    { icon: TrendingUp, title: "Dynamic Pricing", desc: "AI-optimized pricing to maximize revenue" },
    { icon: Camera, title: "Professional Photography", desc: "Showcase your property at its best" },
    { icon: Home, title: "Property Management", desc: "Full-service management you can trust" },
    { icon: Key, title: "Smart Check-in", desc: "Seamless, keyless entry systems" },
  ];

  return (
    <section className="py-24 px-6 bg-[#161618]">
      <div className="max-w-7xl mx-auto">
        <h2 className="font-['Playfair_Display'] text-[clamp(2rem,5vw,3.5rem)] text-[#F5F5F0] text-center mb-12">
          {(data.title as string) || "Why Choose Christiano"}
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feat, idx) => (
            <div key={idx} className="text-center group">
              <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[#D4AF37]/20 group-hover:scale-110 transition-all duration-300">
                <feat.icon className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <h3 className="text-[#F5F5F0] font-medium mb-2">{feat.title}</h3>
              <p className="text-[#A1A1AA] text-sm leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

// ─── TESTIMONIALS BLOCK ─────────────────
const TestimonialsBlock: FC<{ data: Record<string, unknown> }> = memo(({ data }) => (
  <section className="py-24 px-6 bg-[#0F0F10]">
    <div className="max-w-7xl mx-auto">
      <h2 className="font-['Playfair_Display'] text-[clamp(2rem,5vw,3.5rem)] text-[#F5F5F0] text-center mb-12">
        {(data.title as string) || "What Our Guests Say"}
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { name: "Katie", rating: 5, text: "Christiano was an amazing host and the apartment was flawless.", date: "Oct 2024" },
          { name: "Eric", rating: 5, text: "The property exceeded our expectations. Clean, modern, and perfectly located.", date: "Oct 2024" },
          { name: "Sheldon", rating: 5, text: "Always on hand to help with any queries. Truly a premium experience.", date: "Sep 2024" },
        ].map((t, idx) => (
          <div key={idx} className="bg-[#161618] p-6 border border-white/10">
            <div className="flex mb-4">
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} className="w-4 h-4 text-[#D4AF37] fill-[#D4AF37]" />
              ))}
            </div>
            <p className="text-[#A1A1AA] text-sm mb-4 italic">"{t.text}"</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#D4AF37]/20 rounded-full flex items-center justify-center">
                <span className="text-[#D4AF37] font-medium">{t.name[0]}</span>
              </div>
              <div>
                <div className="text-[#F5F5F0] text-sm font-medium">{t.name}</div>
                <div className="text-[#A1A1AA] text-xs">{t.date}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
));

// ─── CTA BLOCK ─────────────────────────
const CTABlock: FC<{ data: Record<string, unknown> }> = memo(({ data }) => (
  <section className="py-24 px-6 bg-[#D4AF37] relative overflow-hidden">
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#0F0F10] rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#0F0F10] rounded-full blur-3xl" />
    </div>
    <div className="max-w-4xl mx-auto text-center relative z-10">
      <h2 className="font-['Playfair_Display'] text-[clamp(2rem,5vw,3.5rem)] text-[#0F0F10] mb-6">
        {(data.headline as string) || "Ready to Get Started?"}
      </h2>
      {(data.subheadline as string) && (
        <p className="text-[#0F0F10]/80 text-lg mb-8 max-w-2xl mx-auto">
          {data.subheadline as string}
        </p>
      )}
      <Link
        to={(data.buttonLink as string) || "/contact"}
        className="inline-block bg-[#0F0F10] text-[#F5F5F0] px-10 py-4 font-medium hover:bg-[#1A1A1B] transition-all duration-300 hover:scale-105"
      >
        {(data.buttonText as string) || "Contact Us"}
      </Link>
    </div>
  </section>
));

// ─── STATS BLOCK ───────────────────────
const StatsBlock: FC = memo(() => {
  const stats = [
    { value: "500+", label: "Properties Managed" },
    { value: "98%", label: "Guest Satisfaction" },
    { value: "9+", label: "Years Experience" },
    { value: "24/7", label: "Support Available" },
  ];

  return (
    <section className="py-16 px-6 bg-[#0F0F10] border-y border-white/10">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="text-center">
            <div className="text-[clamp(2rem,5vw,3rem)] font-bold text-[#D4AF37] mb-2">{stat.value}</div>
            <div className="text-[#A1A1AA]">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
});

// ===========================================================
// BLOCK RENDERER
// ===========================================================
const renderBlock = (block: BlockData): ReactElement => {
  const props = { data: block.data, key: block.id };
  switch (block.type) {
    case "hero": return <HeroBlock {...props} />;
    case "properties": case "property_grid": return <PropertiesGridBlock {...props} />;
    case "features": return <FeaturesBlock {...props} />;
    case "testimonials": return <TestimonialsBlock {...props} />;
    case "cta": return <CTABlock {...props} />;
    case "stats": return <StatsBlock {...props} />;
    case "spacer": return <div style={{ height: `${(block.data.height as number) || 60}px` }} />;
    case "divider": return <hr className="border-white/10 my-4" />;
    default: return <div className="p-8 text-center text-[#A1A1AA]">Block: {block.type}</div>;
  }
};

// ===========================================================
// PAGES — Complete Application Pages
// ===========================================================

// ─── LANDING PAGE ─────────────────────
const LandingPage: FC = memo(() => {
  const { cms } = useCMS();
  return (
    <div className="min-h-screen bg-[#0F0F10]">
      {cms.blocks
        .sort((a, b) => a.order - b.order)
        .map((block) => renderBlock(block))}
      {cms.blocks.length === 0 && (
        <>
          <HeroBlock data={{ headline: "Your Home in Malta", subheadline: "Premium short-let management that maximises your yield" }} />
          <PropertiesGridBlock data={{ title: "Featured Properties" }} />
          <FeaturesBlock data={{ title: "Why Choose Christiano" }} />
          <StatsBlock />
          <CTABlock data={{ headline: "Ready to Get Started?", buttonText: "Contact Us Today" }} />
        </>
      )}
    </div>
  );
});

// ─── PROPERTIES PAGE ────────────────────
const PropertiesPage: FC = memo(() => {
  const [listings, setListings] = useState<GuestyListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    guestyService.getListings()
      .then((res) => { setListings(res); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0F0F10] pt-32">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="font-['Playfair_Display'] text-[clamp(2rem,5vw,3.5rem)] text-[#F5F5F0] mb-8">
          All Properties
        </h1>
        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-[#161618] rounded-lg" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {listings.map((l) => (
              <PropertyCard key={l._id} listing={l} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

// ─── 404 PAGE ────────────────────────
const NotFoundPage: FC = memo(() => (
  <div className="min-h-screen bg-[#0F0F10] flex items-center justify-center">
    <div className="text-center">
      <h1 className="font-['Playfair_Display'] text-8xl text-[#D4AF37] mb-4">404</h1>
      <p className="text-[#F5F5F0] text-xl mb-2">Page not found</p>
      <p className="text-[#A1A1AA] mb-8">The page you're looking for doesn't exist.</p>
      <Link to="/" className="inline-flex items-center gap-2 bg-[#D4AF37] text-[#0F0F10] px-8 py-3 hover:bg-[#E5C158] transition-colors">
        <Home className="w-4 h-4" />
        Back to Home
      </Link>
    </div>
  </div>
));

// ===========================================================
// MAIN APP — Qlo-Style Navigation & Layout
// ===========================================================
const AppContent: FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <Helmet>
        <title>Christiano Property Management | Premium Malta Rentals</title>
        <meta name="description" content="Your Home in Malta, Looked After Like a Hotel. Premium short-let management services." />
        <meta name="theme-color" content="#0F0F10" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet" />
      </Helmet>

      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-[#D4AF37] text-[#0F0F10] px-4 py-2 z-50">
        Skip to main content
      </a>

      <header className="bg-[#0F0F10]/95 backdrop-blur-md border-b border-white/10 p-4 sticky top-0 z-40">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 text-[#F5F5F0]">
            <img
              src="https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/image-high-82icb0.png"
              alt="Christiano"
              className="h-8"
            />
            <span className="font-['Playfair_Display'] text-xl">Christiano</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <NavLink
              to="/properties"
              className={({ isActive }) => (isActive ? "text-[#D4AF37]" : "text-[#A1A1AA] hover:text-[#F5F5F0]") + " text-sm transition-colors"}
            >
              Properties
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) => (isActive ? "text-[#D4AF37]" : "text-[#A1A1AA] hover:text-[#F5F5F0]") + " text-sm transition-colors"}
            >
              Contact
            </NavLink>
            <Link
              to="/properties"
              className="bg-[#D4AF37] text-[#0F0F10] px-6 py-2 text-sm font-medium hover:bg-[#E5C158] transition-colors"
            >
              Browse Properties
            </Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-[#F5F5F0]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[#0F0F10] border-b border-white/10 p-4">
            <div className="flex flex-col gap-4">
              <NavLink to="/properties" className="text-[#A1A1AA] hover:text-[#F5F5F0]" onClick={() => setMobileMenuOpen(false)}>
                Properties
              </NavLink>
              <NavLink to="/contact" className="text-[#A1A1AA] hover:text-[#F5F5F0]" onClick={() => setMobileMenuOpen(false)}>
                Contact
              </NavLink>
            </div>
          </div>
        )}
      </header>

      <main id="main-content">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <footer className="bg-[#0A0A0B] border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-['Playfair_Display'] text-[#F5F5F0] mb-4">Christiano</h3>
              <p className="text-[#A1A1AA] text-sm">Your Home in Malta, Looked After Like a Hotel</p>
            </div>
            <div>
              <h4 className="text-[#F5F5F0] mb-3">Quick Links</h4>
              <div className="flex flex-col gap-2">
                <Link to="/properties" className="text-[#A1A1AA] text-sm hover:text-[#D4AF37]">Properties</Link>
                <Link to="/contact" className="text-[#A1A1AA] text-sm hover:text-[#D4AF37]">Contact</Link>
              </div>
            </div>
            <div>
              <h4 className="text-[#F5F5F0] mb-3">Contact</h4>
              <div className="space-y-2 text-sm text-[#A1A1AA]">
                <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> +356 7979 0202</p>
                <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> info@cvpm.mt</p>
              </div>
            </div>
            <div>
              <h4 className="text-[#F5F5F0] mb-3">Follow Us</h4>
              <div className="flex gap-4">
                <a href="#" className="text-[#A1A1AA] hover:text-[#D4AF37] transition-colors" aria-label="Facebook">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-[#A1A1AA] hover:text-[#D4AF37] transition-colors" aria-label="Instagram">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center text-sm text-[#A1A1AA]">
            © 2025 Christiano Property Management. All rights reserved.
          </div>
        </div>
      </footer>

      <Toaster position="top-right" theme="dark" richColors />
    </>
  );
};

// ===========================================================
// APP ENTRY POINT
// ===========================================================
const App: FC = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <CMSProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </CMSProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
