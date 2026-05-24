import { Home, Building, CalendarDays } from "lucide-react";
import { ai } from "../helpers";

export const PROPERTIES_SCHEMAS = {
  properties: {
    type:"properties", label:"Property Grid", category:"properties", icon: Home,
    description:"Featured properties grid with images, pricing, and booking links",
    ai: ai([], [], {}),
    fields: {
      label:{ type:"text", label:"Section Label" },
      title:{ type:"text", label:"Title" },
      ctaText:{ type:"text", label:"CTA Text" },
      ctaHref:{ type:"text", label:"CTA Link" },
      items:{ type:"array", label:"Properties", itemFields:["name","location","image","price","beds","baths","guests","link"] },
      columns:{ type:"select", label:"Columns", options:["2","3","4"] },
      showPrice:{ type:"boolean", label:"Show Price" },
    },
    defaults: {
      label:"Featured Properties", title:"Currently managed",
      ctaText:"View all properties", ctaHref:"/properties",
      columns:"3", showPrice:true,
      items:[
        { name:"The Fives Apartments", location:"St Julian's, Malta", image:"https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/pembroke-pent-20250427__mg_5998-edit-edit-high.jpg", price:"€180", beds:"3 Bed", baths:"3 Bath", guests:"6 Guests", link:"https://malta.guestybookings.com/en/properties/6878a53283f1c400114b71e8" },
        { name:"123 St Ursula Street", location:"Valletta, Malta", image:"https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/img_2625-high-g3dssk.jpg", price:"€150", beds:"1 Bed", baths:"2 Bath", guests:"4 Guests", link:"https://malta.guestybookings.com/en/properties/6878a5365a563c0013969391" },
        { name:"St Julian's Penthouse", location:"San Ġiljan, Malta", image:"https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/img_9620-high.jpg", price:"€155", beds:"2 Bed", baths:"2 Bath", guests:"4 Guests", link:"https://malta.guestybookings.com/en/properties/6878a53de8249000105817f8" },
      ],
    },
  },

  guesty_listings: {
    type:"guesty_listings", label:"Live Listings (Guesty)", category:"properties", icon: Building,
    description:"Live property listings fetched from Guesty booking API",
    ai: ai([], [], {}),
    fields: {
      label:{ type:"text", label:"Section Label" },
      title:{ type:"text", label:"Title" },
      limit:{ type:"number", label:"Max Properties to Show", min:1, max:20 },
      apiUrl:{ type:"text", label:"Guesty Booking API URL" },
    },
    defaults: { label:"Available now", title:"Featured properties", limit:6, apiUrl:"https://malta.guestybookings.com/en" },
  },

  guesty_book: {
    type:"guesty_book", label:"Direct Booking Widget", category:"properties", icon: CalendarDays,
    description:"Embedded Guesty booking widget for direct reservations",
    ai: ai([], [], {}),
    fields: {
      title:{ type:"text", label:"Section Title" },
      subtitle:{ type:"text", label:"Subtitle" },
      url:{ type:"text", label:"Booking URL" },
      height:{ type:"number", label:"Widget Height (px)", min:400, max:1200 },
    },
    defaults: { title:"Book direct & save", subtitle:"Real-time rates and availability. No booking fees.", url:"https://malta.guestybookings.com/en", height:760 },
  },

  property_carousel: {
    type:"property_carousel", label:"Property Carousel", category:"properties", icon: Home,
    description:"Carousel of property listings with responsive items per view",
    ai: ai([], [], {}),
    fields: {
      title:{ type:"text", label:"Title" },
      properties:{ type:"array", label:"Properties", itemFields:["id","name","location","image","price","beds","baths","link"] },
      autoplay:{ type:"boolean", label:"Autoplay" },
      showPrice:{ type:"boolean", label:"Show Price" },
    },
    defaults: { title:"Featured Properties", autoplay:false, showPrice:true, properties:[] },
  },
};
