import { MessageSquareQuote, Users, Store, Instagram } from "lucide-react";
import { ai } from "../helpers";

export const SOCIAL_SCHEMAS = {
  testimonials: {
    type:"testimonials", label:"Testimonials", category:"social", icon: MessageSquareQuote,
    description:"Customer reviews and testimonials in grid, carousel, masonry, or single layout",
    aiFields:["title","items"],
    ai: ai(["content generation"], ["claude-sonnet-4-5"], { generate:"Write 6 realistic 5-star guest testimonials (name, date, rating, text) for: {{topic}}" }),
    fields: {
      label:{ type:"text", label:"Section Label" },
      title:{ type:"text", label:"Title" },
      items:{ type:"array", label:"Testimonials", itemFields:["name","date","rating","text"] },
      style:{ type:"select", label:"Style", options:["grid","carousel","masonry","single"] },
      columns:{ type:"select", label:"Columns", options:["2","3","4"] },
    },
    defaults: {
      label:"Guest Reviews", title:"What our guests say",
      style:"grid", columns:"3",
      items:[
        { name:"Katie", date:"October 2024", rating:5, text:"Christiano was an amazing host and the apartment was flawless. From the slippers to the birthday wine, everything was spot on." },
        { name:"Eric", date:"October 2024", rating:5, text:"Christiano is a gracious, proactive host who made sure I had all the information I needed. Communication was excellent." },
        { name:"Sheldon", date:"September 2024", rating:5, text:"Always on hand to help with any queries and extremely responsive. I'd definitely recommend to anyone." },
        { name:"Anna", date:"September 2024", rating:5, text:"The host is nice and helpful! The apartment is modern, clean, cozy, and fully equipped. Perfect location." },
        { name:"Miranda", date:"August 2024", rating:5, text:"We loved the apartment—spacious, clean, and felt like home. Perfect size for our family of four." },
        { name:"Kate", date:"April 2024", rating:5, text:"Christiano is extremely personable and supremely helpful. We'll be back. Full of thoughtful touches." },
      ],
    },
  },

  testimonial_carousel: {
    type:"testimonial_carousel", label:"Testimonial Carousel", category:"social", icon: MessageSquareQuote,
    description:"Auto-rotating testimonial carousel with ratings and multiple styles",
    ai: ai(["content generation"], ["claude-sonnet-4-6"], { generate:"Write 5 realistic guest testimonials (name, rating, text, stay type) for a luxury Malta short-let property." }),
    fields: {
      title:{ type:"text", label:"Title" },
      items:{ type:"array", label:"Testimonials", itemFields:["name","role","avatar","rating","text","date"] },
      autoplay:{ type:"boolean", label:"Autoplay" },
      interval:{ type:"number", label:"Interval (ms)", min:2000, max:15000 },
      showRating:{ type:"boolean", label:"Show Rating Stars" },
      style:{ type:"select", label:"Style", options:["card","quote","minimal"] },
    },
    defaults: {
      title:"What Our Clients Say", autoplay:true, interval:6000, showRating:true, style:"card",
      items:[
        { name:"Katie", role:"Property Owner", rating:5, text:"Christiano was an amazing host and the apartment was flawless. From the slippers to the birthday wine, everything was spot on.", date:"October 2024" },
        { name:"Eric", role:"Guest", rating:5, text:"Christiano is a gracious, proactive host who made sure I had all the information I needed. Communication was excellent.", date:"October 2024" },
      ],
    },
  },

  team: {
    type:"team", label:"Team", category:"social", icon: Users,
    description:"Team member cards with initials, name, role, bio, and optional image",
    aiFields:["items"],
    ai: ai(["content generation"], ["claude-sonnet-4-5"], { generate:"Suggest team bios (initials, name, role, 1-line bio) for: {{topic}}" }),
    fields: {
      title:{ type:"text", label:"Section Title" },
      items:{ type:"array", label:"Team Members", itemFields:["initials","name","role","bio","image"] },
      style:{ type:"select", label:"Style", options:["cards","list","centered"] },
    },
    defaults: {
      title:"The team", style:"cards",
      items:[
        { initials:"CV", name:"Christiano Vincenti", role:"Founder & Director", bio:"Twenty years in Maltese hospitality. Superhost since 2015.", image:"" },
        { initials:"AM", name:"Anna Mizzi", role:"Operations Manager", bio:"Ensures every guest stay is flawless — always.", image:"" },
      ],
    },
  },

  logos: {
    type:"logos", label:"Logo / Trust Bar", category:"social", icon: Store,
    description:"Trust bar showing partner logos in strip, grid, or justified layout",
    ai: ai([], [], {}),
    fields: {
      label:{ type:"text", label:"Label Text" },
      items:{ type:"array", label:"Logos / Platforms", itemFields:["name","logo"] },
      style:{ type:"select", label:"Style", options:["strip","grid","justified"] },
    },
    defaults: {
      label:"Trusted by leading platforms", style:"strip",
      items:[
        { name:"Airbnb", logo:"" },{ name:"Booking.com", logo:"" },
        { name:"Vrbo", logo:"" },{ name:"Expedia", logo:"" },
        { name:"Malta Tourism Authority", logo:"" },
      ],
    },
  },

  social_feed: {
    type:"social_feed", label:"Social Feed", category:"social", icon: Instagram,
    description:"Embedded social media feed from Instagram, Twitter, or Facebook",
    ai: ai([], [], {}),
    fields: {
      title:{ type:"text", label:"Title" },
      platform:{ type:"select", label:"Platform", options:["instagram","twitter","facebook"] },
      username:{ type:"text", label:"Username" },
      limit:{ type:"number", label:"Max Posts", min:1, max:20 },
      layout:{ type:"select", label:"Layout", options:["grid","masonry","carousel"] },
      showCaptions:{ type:"boolean", label:"Show Captions" },
    },
    defaults: {
      title:"Follow Us", platform:"instagram", username:"christianopropertymanagement",
      limit:6, layout:"grid", showCaptions:true,
    },
  },
};
