import { Type, TextCursorInput, Info, Quote, Columns3 } from "lucide-react";
import { ai } from "../helpers";

export const CONTENT_SCHEMAS = {
  text: {
    type:"text", label:"Text Block", category:"content", icon: Type,
    description:"Simple text block with heading, body, alignment, and sizing options",
    aiFields:["title","body"],
    ai: ai(["content generation","summarization"], ["claude-sonnet-4-5"], { generate:"Write a short editorial body paragraph for: {{topic}}", summarize:"Summarise this into 2 sentences: {{body}}" }),
    fields: {
      label:{ type:"text", label:"Section Label" },
      title:{ type:"text", label:"Heading" },
      body:{ type:"textarea", label:"Body Text" },
      align:{ type:"select", label:"Alignment", options:["left","center","right"] },
      size:{ type:"select", label:"Size", options:["sm","base","lg","xl"] },
      maxWidth:{ type:"select", label:"Max Width", options:["sm","md","lg","xl","full"] },
    },
    defaults: { label:"", title:"Our Approach to Property Management", body:"We combine deep local knowledge with global hospitality standards to deliver outcomes that consistently exceed expectations.", align:"left", size:"base", maxWidth:"lg" },
  },

  richtext: {
    type:"richtext", label:"Rich Text", category:"content", icon: TextCursorInput,
    description:"Full HTML rich text block with complete formatting control",
    aiFields:["html"],
    ai: ai(["content generation"], ["claude-sonnet-4-5"], { generate:"Write rich HTML (h2 + 2 p) on: {{topic}}" }),
    fields: { html:{ type:"code", label:"HTML Content" } },
    defaults: { html:"<h2>Section Heading</h2><p>Rich text with full HTML support.</p>" },
  },

  about: {
    type:"about", label:"About / Split Section", category:"content", icon: Info,
    description:"About section with title, accent word, paragraphs, image, and CTA",
    aiFields:["title","titleAccent","paragraphs"],
    ai: ai(["content generation"], ["claude-sonnet-4-5"], { generate:"Write an About section with 3 short paragraphs and a 'titleAccent' italic word for: {{topic}}" }),
    fields: {
      label:{ type:"text", label:"Section Label" },
      title:{ type:"text", label:"Title" },
      titleAccent:{ type:"text", label:"Title Accent (italic)" },
      paragraphs:{ type:"array", label:"Paragraphs", itemFields:["text"] },
      image:{ type:"image", label:"Image" },
      imagePosition:{ type:"select", label:"Image Position", options:["left","right"] },
      ctaText:{ type:"text", label:"CTA Text" },
      ctaHref:{ type:"text", label:"CTA Link" },
    },
    defaults: {
      label:"About Us", title:"We Know What a Good", titleAccent:"Stay Feels Like",
      imagePosition:"right",
      paragraphs:[
        { text:"At Christiano Property Management, we specialize in managing properties across Malta, one of the Mediterranean's most sought-after destinations." },
        { text:"With over 9 years of Superhost experience, we understand the unique appeal of the island and how to make your property stand out." },
        { text:"We believe in transparency and provide detailed monthly reports so property owners are always in the loop." },
      ],
      image:"https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/img_7990-standard.jpg",
      ctaText:"Get in Touch", ctaHref:"#contact",
    },
  },

  quote: {
    type:"quote", label:"Pull Quote", category:"content", icon: Quote,
    description:"Featured customer or brand quote with citation and style options",
    aiFields:["quote"],
    ai: ai(["content generation"], ["claude-sonnet-4-5"], { generate:"Write a realistic guest testimonial quote (max 2 lines) about a Malta stay run by Christiano Vincenti PM." }),
    fields: {
      quote:{ type:"textarea", label:"Quote Text" },
      cite:{ type:"text", label:"Citation" },
      style:{ type:"select", label:"Style", options:["centered","left","card"] },
    },
    defaults: { quote:"The most professional property management team we have ever worked with. Revenue up 40% in year one.", cite:"— Maria C., Property Owner, Sliema", style:"centered" },
  },

  columns: {
    type:"columns", label:"Multi-Column Layout", category:"layout", icon: Columns3,
    description:"Flexible multi-column content layout with configurable column count and widths",
    ai: ai(["content generation"], ["claude-sonnet-4-5"], { generate:"Suggest 3 columns of content (title, body) for: {{topic}}" }),
    fields: {
      columns:{ type:"number", label:"Number of Columns", min:2, max:4 },
      gap:{ type:"select", label:"Gap Size", options:["sm","md","lg","xl"] },
      items:{ type:"array", label:"Column Content", itemFields:["title","body","icon"] },
    },
    defaults: {
      columns:3, gap:"lg",
      items:[
        { title:"Column One", body:"Content for the first column goes here.", icon:"" },
        { title:"Column Two", body:"Content for the second column goes here.", icon:"" },
        { title:"Column Three", body:"Content for the third column goes here.", icon:"" },
      ],
    },
  },
};
