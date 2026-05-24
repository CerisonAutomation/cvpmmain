import { LayoutTemplate, PanelBottom, Search } from "lucide-react";
import { ai } from "../helpers";

export const GLOBAL_SCHEMAS = {
  header: {
    type:"header", label:"Header & Nav", category:"global", icon: LayoutTemplate,
    description:"Site header with logo, navigation, phone, and CTA button",
    ai: ai(["content generation"], ["claude-sonnet-4-5"], { generate:"Suggest a luxury header nav structure with brand name, nav links, phone, and CTA for: {{topic}}" }),
    fields: {
      logoUrl:{ type:"image", label:"Logo URL" },
      brandName:{ type:"text", label:"Brand Name" },
      phone:{ type:"text", label:"Phone" },
      ctaText:{ type:"text", label:"CTA Text" },
      ctaHref:{ type:"text", label:"CTA Link" },
      navItems:{ type:"array", label:"Nav Links", itemFields:["label","href"] },
      sticky:{ type:"boolean", label:"Sticky Header" },
    },
    defaults: {
      logoUrl:"https://customer-assets.emergentagent.com/job_malta-stays-direct/artifacts/ta7za4jp_cv_logo_no_bg_gold.png",
      brandName:"Christiano Vincenti PM",
      phone:"+356 7979 0202",
      ctaText:"Book Now", ctaHref:"/book",
      sticky: true,
      navItems:[
        { label:"For Owners", href:"/property-owners" },
        { label:"Properties", href:"/properties" },
        { label:"Pricing", href:"/property-owners#pricing" },
        { label:"Contact", href:"#contact" },
      ],
    },
  },

  footer: {
    type:"footer", label:"Footer", category:"global", icon: PanelBottom,
    description:"Site footer with company info, links, social, and copyright",
    ai: ai([], [], {}),
    fields: {
      companyName:{ type:"text", label:"Company Name" },
      tagline:{ type:"text", label:"Tagline" },
      address:{ type:"textarea", label:"Address" },
      phone:{ type:"text", label:"Phone" },
      email:{ type:"text", label:"Email" },
      copyright:{ type:"text", label:"Copyright" },
      social:{ type:"array", label:"Social Links", itemFields:["platform","url"] },
      columns:{ type:"array", label:"Link Columns", itemFields:["title","links"] },
    },
    defaults: {
      companyName:"Christiano Vincenti Property Management",
      tagline:"Malta's Premier Property Management",
      address:"The Fives A7, Triq Charles Sciberras, St Julian's, Malta",
      phone:"+356 7979 0202", email:"info@cvpm.mt",
      copyright:"© 2025 Christiano Vincenti PM. All rights reserved.",
      social:[
        { platform:"instagram", url:"https://instagram.com/christianopropertymanagement" },
        { platform:"facebook", url:"https://facebook.com/christianopropertymanagement" },
      ],
      columns:[
        { title:"For Guests", links:[{ label:"Browse Properties", href:"/properties" },{ label:"Book a Stay", href:"/properties" },{ label:"How It Works", href:"/#how-it-works" }]},
        { title:"For Owners", links:[{ label:"List Your Property", href:"/property-owners" },{ label:"Pricing Plans", href:"/property-owners#pricing" },{ label:"Owner Portal", href:"/property-owners" }]},
        { title:"Company", links:[{ label:"About Us", href:"/property-owners#why-us" },{ label:"Contact", href:"#contact" },{ label:"Privacy Policy", href:"/privacy" },{ label:"Terms", href:"/terms" }]},
      ],
    },
  },

  seo: {
    type:"seo", label:"SEO Meta", category:"global", icon: Search,
    description:"Global SEO settings — title, description, keywords, OG image, canonical URL",
    ai: ai(["seo optimization","content generation"], ["claude-sonnet-4-5"], { generate:"Write an SEO meta title (≤60 chars) and description (≤160 chars) for a luxury Malta property management page about: {{topic}}" }),
    fields: {
      title:{ type:"text", label:"Page Title (60 chars)" },
      description:{ type:"textarea", label:"Meta Description (160 chars)" },
      keywords:{ type:"text", label:"Keywords" },
      ogImage:{ type:"image", label:"OG Image URL" },
      canonical:{ type:"text", label:"Canonical URL" },
    },
    defaults: {
      title:"Christiano Vincenti PM | Luxury Property Management Malta",
      description:"Luxury short-term rental and property management across Malta. Transparent fees, full-service operations, Superhost status from day one.",
      keywords:"Malta property management, Airbnb Malta, short-term rental Malta, vacation rental Malta",
      ogImage:"", canonical:"",
    },
  },
};
