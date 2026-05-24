import { BarChart3, LayoutGrid, BadgeEuro, HelpCircle } from "lucide-react";
import { ai } from "../helpers";

export const DATA_SCHEMAS = {
  stats: {
    type:"stats", label:"Stats Bar", category:"data", icon: BarChart3,
    description:"Statistics display with configurable items, style, and background",
    aiFields:["items"],
    ai: ai(["content generation"], ["claude-sonnet-4-5"], { generate:"Suggest 4 short impressive stats (value + label) for a luxury Malta PM business about: {{topic}}" }),
    fields: {
      items:{ type:"array", label:"Stats", itemFields:["value","label"] },
      style:{ type:"select", label:"Style", options:["bar","grid","centered","large"] },
      background:{ type:"select", label:"Background", options:["surface","dark","accent","transparent"] },
    },
    defaults: {
      style:"bar", background:"surface",
      items:[
        { value:"9+", label:"Years Superhost" },
        { value:"100%", label:"Response Rate" },
        { value:"4.9★", label:"Avg Rating" },
        { value:"40%", label:"Revenue Boost" },
      ],
    },
  },

  features: {
    type:"features", label:"Features Grid", category:"data", icon: LayoutGrid,
    description:"Grid of feature cards with icons, titles, and descriptions",
    aiFields:["title","items"],
    ai: ai(["content generation"], ["claude-sonnet-4-5"], { generate:"Write 6 short feature cards (icon name + title + 1-line body) for: {{topic}}" }),
    fields: {
      label:{ type:"text", label:"Section Label" },
      title:{ type:"text", label:"Title" },
      subtitle:{ type:"textarea", label:"Subtitle" },
      items:{ type:"array", label:"Features", itemFields:["icon","title","body"] },
      columns:{ type:"select", label:"Columns", options:["2","3","4"] },
      style:{ type:"select", label:"Card Style", options:["card","minimal","bordered","icon-top"] },
    },
    defaults: {
      label:"What We Do", title:"Full-service property care",
      columns:"3", style:"card",
      items:[
        { icon:"Sparkles", title:"Listing & Marketing", body:"Professional photography, multi-channel listings, and smart pricing optimisation." },
        { icon:"Calendar", title:"Booking Management", body:"24/7 guest communication, dynamic pricing, and seamless check-in coordination." },
        { icon:"Wrench", title:"Maintenance", body:"Vetted local contractors, cleaning coordination, and linen service after every stay." },
        { icon:"BarChart3", title:"Reporting", body:"Transparent monthly statements with occupancy, revenue, and guest review analysis." },
        { icon:"Shield", title:"Guest Screening", body:"Verified guest profiles, security deposits, and damage protection protocols." },
        { icon:"Clock", title:"24/7 Support", body:"Always available — real people, real solutions, any hour." },
      ],
    },
  },

  pricing: {
    type:"pricing", label:"Pricing Table", category:"data", icon: BadgeEuro,
    description:"Pricing plans comparison with tiers, features, and add-ons",
    aiFields:["title","plans"],
    ai: ai(["content generation"], ["claude-sonnet-4-5"], { generate:"Propose 2 pricing plans for short-let property management with 5-6 features each, EUR." }),
    fields: {
      label:{ type:"text", label:"Section Label" },
      title:{ type:"text", label:"Title" },
      note:{ type:"textarea", label:"Note / Disclaimer" },
      plans:{ type:"array", label:"Plans", itemFields:["tier","amount","unit","desc","popular","cta","features"] },
      showAddOns:{ type:"boolean", label:"Show Add-ons" },
      addOns:{ type:"array", label:"Add-ons", itemFields:["name","price"] },
    },
    defaults: {
      label:"Pricing", title:"Simple, transparent plans",
      note:"No setup fees. No hidden costs. You only pay when you earn.",
      showAddOns:true,
      plans:[
        { tier:"Essentials", amount:"15%", unit:"of revenue", desc:"Core operations. Your property listed, managed, and maintained.", popular:false, cta:"Get Started", features:["Professional photography","Multi-platform listing","Dynamic pricing","Guest communication","Monthly reporting","MTA licence guidance"] },
        { tier:"Complete", amount:"20%", unit:"of revenue", desc:"Full hands-off management. We handle everything.", popular:true, cta:"Get Started", features:["Everything in Essentials","Cleaning coordination","Maintenance at cost","Linen & amenities","Direct booking website","Owner dashboard","Priority 24hr support","Quarterly review"] },
      ],
      addOns:[
        { name:"Professional photoshoot", price:"On quotation" },
        { name:"Annual deep clean", price:"On quotation" },
        { name:"MTA licensing", price:"€150 one-time + fees" },
        { name:"Interior design consultation", price:"On quotation" },
      ],
    },
  },

  faq: {
    type:"faq", label:"FAQ Accordion", category:"data", icon: HelpCircle,
    description:"Expandable FAQ section with search and multiple display styles",
    aiFields:["title","items"],
    ai: ai(["content generation"], ["claude-sonnet-4-5"], { generate:"Write 6 FAQ Q&A pairs for a Malta short-let property owner audience about: {{topic}}" }),
    fields: {
      title:{ type:"text", label:"Section Title" },
      subtitle:{ type:"text", label:"Subtitle" },
      items:{ type:"array", label:"Questions", itemFields:["q","a"] },
      style:{ type:"select", label:"Style", options:["accordion","cards","two-col"] },
    },
    defaults: {
      title:"Common questions", style:"accordion",
      items:[
        { q:"Do I need an MTA licence to rent short-term in Malta?", a:"Yes. All short-let properties in Malta require a Malta Tourism Authority licence. We guide you through the entire application as part of our service." },
        { q:"What areas do you cover?", a:"We manage properties across all of Malta and Gozo, with particular expertise in Sliema, St Julian's, Valletta, Mdina, and Mellieħa." },
        { q:"How quickly can my property go live?", a:"Most properties are listed within 2–3 weeks of onboarding, including professional photography, listing creation, and pricing setup." },
        { q:"What commission do you charge?", a:"Essentials at 15% and Complete at 18% of Net Room Revenue. Both include 24/7 guest support with no hidden fees." },
        { q:"Can I block dates for personal use?", a:"Absolutely. You have full calendar control through our owner dashboard — block dates anytime with no penalties." },
        { q:"What happens with maintenance issues?", a:"We coordinate all maintenance through our trusted network. Costs are passed through at cost — no markups, ever." },
      ],
    },
  },

  animated_stats: {
    type:"animated_stats", label:"Animated Stats", category:"data", icon: BarChart3,
    description:"Animated counter stats with prefix/suffix, icons, and multiple visual styles",
    ai: ai(["content generation"], ["claude-sonnet-4-6"], { generate:"Suggest 4 animated counter stats (value, prefix/suffix, label, icon name) for a luxury Malta PM company." }),
    fields: {
      title:{ type:"text", label:"Title" },
      stats:{ type:"array", label:"Stats", itemFields:["value","label","icon","suffix","prefix"] },
      animationDuration:{ type:"number", label:"Animation Duration (ms)", min:500, max:5000 },
      style:{ type:"select", label:"Style", options:["minimal","card","gradient","bold"] },
      columns:{ type:"select", label:"Columns", options:["2","3","4","5"] },
    },
    defaults: {
      title:"Our Impact", animationDuration:2000, style:"card", columns:"4",
      stats:[
        { value:"2400000", prefix:"€", label:"Revenue Generated", icon:"TrendingUp" },
        { value:"45", suffix:"+", label:"Properties Managed", icon:"Home" },
        { value:"4.97", suffix:"★", label:"Average Rating", icon:"Star" },
        { value:"94", suffix:"%", label:"Occupancy Rate", icon:"Calendar" },
      ],
    },
  },
};
