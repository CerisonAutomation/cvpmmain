import type { BlockType } from "./types";

export const BLOCK_CATEGORIES: { name: string; blocks: { type: BlockType; label: string; icon: string }[] }[] = [
  {
    name: "Structure",
    blocks: [
      { type: "header", label: "Header", icon: "ti-layout-navbar" },
      { type: "footer", label: "Footer", icon: "ti-layout-footer" },
      { type: "hero", label: "Hero", icon: "ti-home" },
      { type: "text", label: "Text", icon: "ti-align-left" },
      { type: "about", label: "About", icon: "ti-layout-sidebar" },
      { type: "quote", label: "Quote", icon: "ti-quote" },
    ],
  },
  {
    name: "Marketing",
    blocks: [
      { type: "services", label: "Services", icon: "ti-list-check" },
      { type: "process", label: "Process", icon: "ti-timeline" },
      { type: "properties", label: "Properties", icon: "ti-building" },
      { type: "awards", label: "Awards", icon: "ti-trophy" },
    ],
  },
  {
    name: "Conversion",
    blocks: [
      { type: "stats", label: "Stats", icon: "ti-chart-bar" },
      { type: "features", label: "Features", icon: "ti-layout-grid" },
      { type: "pricing", label: "Pricing", icon: "ti-tag" },
      { type: "faq", label: "FAQ", icon: "ti-help-circle" },
      { type: "team", label: "Team", icon: "ti-users" },
      { type: "logos", label: "Logos", icon: "ti-affiliate" },
    ],
  },
  {
    name: "Social",
    blocks: [{ type: "testimonials", label: "Reviews", icon: "ti-star" }],
  },
  {
    name: "Media",
    blocks: [
      { type: "image", label: "Image", icon: "ti-photo" },
      { type: "gallery", label: "Gallery", icon: "ti-layout-grid-add" },
      { type: "video", label: "Video", icon: "ti-player-play" },
    ],
  },
  {
    name: "CTA & Forms",
    blocks: [
      { type: "cta", label: "CTA", icon: "ti-speakerphone" },
      { type: "contact", label: "Contact", icon: "ti-mail" },
      { type: "newsletter", label: "Newsletter", icon: "ti-send" },
      { type: "form", label: "Form", icon: "ti-forms" },
    ],
  },
  {
    name: "Layout",
    blocks: [
      { type: "divider", label: "Divider", icon: "ti-minus" },
      { type: "spacer", label: "Spacer", icon: "ti-arrows-vertical" },
    ],
  },
];

export const BLOCK_DEFAULTS: Record<BlockType, Record<string, unknown>> = {
  header: { logo: "Christiano", nav: ["Properties", "About", "Contact"], cta: "Book a Stay" },
  footer: { tagline: "Luxury property management in Malta & Gozo.", year: new Date().getFullYear() },
  hero: {
    eyebrow: "Christiano Vincenti — Malta",
    heading: "Refined stays, <em>effortlessly managed</em>",
    sub: "Hand-picked residences across Malta and Gozo, cared for by a team that treats every home like our own.",
    btn1: "Explore Properties",
    btn2: "Owner Enquiry",
  },
  text: { label: "Introduction", heading: "An estate of quiet excellence", body: "Tap to edit this body copy.", align: "left" },
  about: { label: "About", heading: "Twenty years\non the islands", body1: "Edit this paragraph.", body2: "", imgUrl: "", imgLeft: true },
  quote: { text: "The standard of care was extraordinary.", attr: "Guest, Sliema 2025" },
  services: { heading: "Our Services", items: [{ title: "Full Management", body: "End-to-end care for your home." }] },
  process: { heading: "How it works", items: [{ step: "01", title: "Discovery", body: "We assess fit." }] },
  properties: { heading: "Featured Residences", items: [] },
  awards: { heading: "Recognition", items: [{ title: "MTA Licence", body: "Licensed operator." }] },
  stats: { items: [{ v: "120+", l: "Properties" }, { v: "20yr", l: "Experience" }, { v: "4.9", l: "Guest Rating" }, { v: "98%", l: "Renewal" }], cols: 4 },
  features: { label: "Why us", heading: "Crafted for owners", cols: 2, items: [{ icon: "ti-shield-check", title: "Trust", body: "Licensed, insured, transparent." }, { icon: "ti-sparkles", title: "Standards", body: "Hotel-grade housekeeping." }] },
  pricing: { heading: "Simple, transparent pricing", note: "No setup fees.", cols: 2, plans: [{ name: "Essential", pct: "15", desc: "Hosting only.", feats: ["Listing setup", "Guest comms"], pop: false }, { name: "Full Care", pct: "22", desc: "Full management.", feats: ["All Essential", "Housekeeping", "Maintenance"], pop: true }] },
  faq: { heading: "Questions", items: [{ q: "Is there a setup fee?", a: "No setup fees, ever." }] },
  team: { heading: "Our team", items: [{ name: "Christiano Vincenti", role: "Founder", bio: "Maltese hospitality veteran." }] },
  logos: { label: "Featured in", items: [{ name: "Times of Malta" }, { name: "MTA" }] },
  testimonials: { heading: "What guests say", cols: 2, items: [{ quote: "Faultless.", name: "A. Borg", loc: "Valletta", rating: 5 }] },
  image: { url: "https://images.unsplash.com/photo-1499678329028-101435549a4e?w=1600", alt: "", height: 360, caption: "" },
  gallery: { heading: "Gallery", cols: 3, images: [{ url: "https://images.unsplash.com/photo-1499678329028-101435549a4e?w=800" }] },
  video: { url: "", heading: "Watch" },
  cta: { heading: "Begin your stay", body: "Speak with our concierge today.", btn: "Get in touch" },
  contact: { heading: "Contact", email: "hello@christianovincenti.com", phone: "+356 0000 0000", address: "Valletta, Malta" },
  newsletter: { heading: "Stay in touch", body: "Quarterly notes from the islands." },
  form: { heading: "Enquire", fsub: "We reply within 24h." },
  divider: {},
  spacer: { height: 48 },
};

export const THEME_PRESETS: { id: string; name: string; theme: Record<string, string> }[] = [
  { id: "noir-gold", name: "Noir & Gold", theme: { bg: "#0b0c0e", surface: "#111318", accent: "#c8a96a", text: "#f0ede8" } },
  { id: "paper-ink", name: "Paper & Ink", theme: { bg: "#f5f3ee", surface: "#ffffff", accent: "#0d0d0d", text: "#1a1a1a" } },
  { id: "ocean", name: "Ocean Deep", theme: { bg: "#0c2340", surface: "#1a4a6e", accent: "#5cbdb9", text: "#e8f0f8" } },
  { id: "sand", name: "Warm Sand", theme: { bg: "#faf8f5", surface: "#f0ebe3", accent: "#8b7355", text: "#2d2d2d" } },
];
