import { ArrowRight, Mail, ClipboardList, AtSign, Timer } from "lucide-react";
import { ai } from "../helpers";

export const CONVERSION_SCHEMAS = {
  cta: {
    type:"cta", label:"Call to Action", category:"conversion", icon: ArrowRight,
    description:"High-conversion CTA section with headline, body, buttons, and contact info",
    aiFields:["title","body"],
    ai: ai(["content generation"], ["claude-sonnet-4-5"], { generate:"Write a high-conversion CTA headline (≤8 words) + 1-line subheadline for: {{topic}}" }),
    fields: {
      title:{ type:"text", label:"Headline" },
      body:{ type:"textarea", label:"Body Text" },
      cta1:{ type:"text", label:"Primary CTA" }, cta1Href:{ type:"text", label:"Primary CTA Link" },
      cta2:{ type:"text", label:"Secondary CTA" }, cta2Href:{ type:"text", label:"Secondary CTA Link" },
      showContact:{ type:"boolean", label:"Show Contact Info" },
      style:{ type:"select", label:"Style", options:["centered","banner","split","minimal"] },
      background:{ type:"select", label:"Background", options:["dark","surface","accent","gradient","image"] },
      bgImage:{ type:"image", label:"BG Image (if image)" },
    },
    defaults: {
      title:"Ready to maximise your property?", body:"A short call is all it takes. No commitment, just clarity.",
      cta1:"Book a Discovery Call", cta1Href:"/property-owners",
      cta2:"Browse Properties", cta2Href:"/properties",
      showContact:true, style:"centered", background:"surface",
    },
  },

  contact: {
    type:"contact", label:"Contact Section", category:"conversion", icon: Mail,
    description:"Contact information section with methods, map, and inline form",
    aiFields:["title","subtitle"],
    ai: ai(["content generation"], ["claude-sonnet-4-5"], { generate:"Suggest a contact section title + subtitle + 3 contact methods for: {{topic}}" }),
    fields: {
      title:{ type:"text", label:"Title" },
      subtitle:{ type:"textarea", label:"Subtitle" },
      items:{ type:"array", label:"Contact Methods", itemFields:["icon","label","value","href"] },
      showMap:{ type:"boolean", label:"Show Map" },
      mapLat:{ type:"number", label:"Map Latitude" },
      mapLng:{ type:"number", label:"Map Longitude" },
      showForm:{ type:"boolean", label:"Show Inline Form" },
    },
    defaults: {
      title:"Get in touch", subtitle:"We respond to every enquiry within 4 hours.",
      showMap:true, mapLat:35.9180, mapLng:14.4890, showForm:true,
      items:[
        { icon:"Mail", label:"Email", value:"info@cvpm.mt", href:"mailto:info@cvpm.mt" },
        { icon:"Phone", label:"Phone / WhatsApp", value:"+356 7979 0202", href:"tel:+35679790202" },
        { icon:"MapPin", label:"Office", value:"St Julian's, Malta", href:"#" },
      ],
    },
  },

  form: {
    type:"form", label:"Contact Form", category:"conversion", icon: ClipboardList,
    description:"Customizable contact form with fields, validation, and webhook support",
    aiFields:["fields"],
    ai: ai(["content generation"], ["claude-sonnet-4-5"], { generate:"Suggest 5 form fields (name,label,type,required,placeholder) for: {{topic}}" }),
    fields: {
      title:{ type:"text", label:"Form Title" },
      subtitle:{ type:"text", label:"Subtitle" },
      fields:{ type:"array", label:"Form Fields", itemFields:["name","label","type","required","placeholder"] },
      submitText:{ type:"text", label:"Submit Button Text" },
      successMessage:{ type:"text", label:"Success Message" },
      webhookUrl:{ type:"text", label:"Webhook URL (optional)" },
    },
    defaults: {
      title:"Send us a message", subtitle:"We'll reply within 24 hours.",
      submitText:"Send Message", successMessage:"Thank you! We'll be in touch shortly.",
      fields:[
        { name:"name", label:"Full Name", type:"text", required:true, placeholder:"Your name" },
        { name:"email", label:"Email", type:"email", required:true, placeholder:"your@email.com" },
        { name:"phone", label:"Phone", type:"tel", required:false, placeholder:"+356..." },
        { name:"type", label:"I'm a...", type:"select", required:true, options:["Property Owner","Guest / Traveller","Other"] },
        { name:"message", label:"Message", type:"textarea", required:true, placeholder:"Tell us about your property or enquiry..." },
      ],
    },
  },

  newsletter: {
    type:"newsletter", label:"Newsletter Signup", category:"conversion", icon: AtSign,
    description:"Email newsletter signup with title, body, placeholder, and CTA",
    aiFields:["title","body"],
    ai: ai(["content generation"], ["claude-sonnet-4-5"], { generate:"Write a newsletter signup title + body (≤30 words) for: {{topic}}" }),
    fields: {
      title:{ type:"text", label:"Title" },
      body:{ type:"textarea", label:"Body" },
      placeholder:{ type:"text", label:"Email Placeholder" },
      cta:{ type:"text", label:"Button Text" },
      disclaimer:{ type:"text", label:"Disclaimer Text" },
    },
    defaults: { title:"Stay in the loop", body:"Monthly insights for Malta property owners — market trends, tips, and updates.", placeholder:"your@email.com", cta:"Subscribe", disclaimer:"No spam. Unsubscribe anytime." },
  },

  countdown: {
    type:"countdown", label:"Countdown Timer", category:"conversion", icon: Timer,
    description:"Countdown timer for promotions with configurable time units and completion action",
    ai: ai(["content generation"], ["claude-sonnet-4-6"], { generate:"Write a countdown section title and offer description for a seasonal Malta rental promotion." }),
    fields: {
      title:{ type:"text", label:"Title" },
      description:{ type:"textarea", label:"Description" },
      targetDate:{ type:"text", label:"Target Date (ISO)" },
      showDays:{ type:"boolean", label:"Show Days" },
      showHours:{ type:"boolean", label:"Show Hours" },
      showMinutes:{ type:"boolean", label:"Show Minutes" },
      showSeconds:{ type:"boolean", label:"Show Seconds" },
      style:{ type:"select", label:"Style", options:["minimal","bold","card"] },
      completeMessage:{ type:"text", label:"Completion Message" },
      completeRedirect:{ type:"text", label:"Completion Redirect URL" },
    },
    defaults: {
      title:"Special Offer Ends In", description:"Book now and save 20%",
      targetDate:new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      showDays:true, showHours:true, showMinutes:true, showSeconds:true,
      style:"bold", completeMessage:"", completeRedirect:"",
    },
  },

  advanced_form: {
    type:"advanced_form", label:"Advanced Form", category:"conversion", icon: ClipboardList,
    description:"Multi-field form with text, email, tel, textarea, select, checkbox, radio, and file upload",
    ai: ai(["content generation"], ["claude-sonnet-4-6"], { generate:"Suggest 6 form fields (name, label, type, required, placeholder) for a property owner inquiry form." }),
    fields: {
      title:{ type:"text", label:"Title" },
      subtitle:{ type:"textarea", label:"Subtitle" },
      fields:{ type:"array", label:"Form Fields", itemFields:["name","label","type","required","placeholder","options"] },
      submitText:{ type:"text", label:"Submit Button Text" },
      successMessage:{ type:"textarea", label:"Success Message" },
      redirectUrl:{ type:"text", label:"Redirect URL (on success)" },
      emailTo:{ type:"text", label:"Email To (notification)" },
    },
    defaults: {
      title:"Property Owner Inquiry", subtitle:"Let us know about your property",
      submitText:"Submit", successMessage:"Thank you! We'll be in touch within 24 hours.", redirectUrl:"", emailTo:"info@cvpm.mt",
      fields:[
        { name:"name", label:"Full Name", type:"text", required:true, placeholder:"Your name" },
        { name:"email", label:"Email", type:"email", required:true, placeholder:"your@email.com" },
        { name:"phone", label:"Phone", type:"tel", required:true, placeholder:"+356..." },
        { name:"property_type", label:"Property Type", type:"select", required:true, placeholder:"", options:["Apartment","Villa","Penthouse","Townhouse","Other"] },
        { name:"location", label:"Property Location", type:"text", required:false, placeholder:"e.g. Sliema, Valletta" },
        { name:"message", label:"Message", type:"textarea", required:true, placeholder:"Tell us about your property..." },
      ],
    },
  },
};
