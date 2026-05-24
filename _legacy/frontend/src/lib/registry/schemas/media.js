import { Image as ImageIcon, Images, Play, Code, MapPin, ImagePlus, SlidersHorizontal, GalleryVerticalEnd, Map as MapIcon, PanelTop } from "lucide-react";
import { ai } from "../helpers";

export const MEDIA_SCHEMAS = {
  image: {
    type:"image", label:"Image", category:"media", icon: ImageIcon,
    description:"Single image with alt text, caption, aspect ratio, and width options",
    ai: ai(["image analysis"], ["gemini-2.5-flash"], {}),
    fields: {
      src:{ type:"image", label:"Image URL" },
      alt:{ type:"text", label:"Alt Text" },
      caption:{ type:"text", label:"Caption" },
      aspectRatio:{ type:"select", label:"Aspect Ratio", options:["auto","16:9","4:3","3:2","1:1","2:3"] },
      width:{ type:"select", label:"Width", options:["full","3/4","1/2","1/3"] },
      rounded:{ type:"boolean", label:"Rounded Corners" },
    },
    defaults: { src:"", alt:"", caption:"", aspectRatio:"16:9", width:"full", rounded:false },
  },

  gallery: {
    type:"gallery", label:"Image Gallery", category:"media", icon: Images,
    description:"Multi-image gallery in grid, masonry, carousel, or lightbox layout",
    ai: ai(["image analysis"], ["gemini-2.5-flash"], {}),
    fields: {
      items:{ type:"array", label:"Images", itemFields:["src","alt","caption"] },
      style:{ type:"select", label:"Gallery Style", options:["grid","masonry","carousel","lightbox"] },
      columns:{ type:"select", label:"Columns", options:["2","3","4"] },
    },
    defaults: {
      style:"grid", columns:"3",
      items:[
        { src:"https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/pembroke-pent-20250427__mg_5998-edit-edit-high.jpg", alt:"", caption:"" },
        { src:"https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/img_9620-high.jpg", alt:"", caption:"" },
        { src:"https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/img_2625-high-g3dssk.jpg", alt:"", caption:"" },
      ],
    },
  },

  video: {
    type:"video", label:"Video Embed", category:"media", icon: Play,
    description:"YouTube or Vimeo video embed with optional title, caption, and autoplay",
    ai: ai([], [], {}),
    fields: {
      url:{ type:"text", label:"YouTube or Vimeo URL" },
      title:{ type:"text", label:"Section Title" },
      caption:{ type:"text", label:"Caption" },
      autoplay:{ type:"boolean", label:"Autoplay (muted)" },
    },
    defaults: { url:"", title:"", caption:"", autoplay:false },
  },

  embed: {
    type:"embed", label:"Custom Embed", category:"media", icon: Code,
    description:"Custom HTML/iframe embed with configurable height",
    ai: ai(["code generation"], ["claude-sonnet-4-5"], { generate:"Generate HTML embed code for: {{topic}}" }),
    fields: {
      html:{ type:"code", label:"Embed HTML" },
      height:{ type:"number", label:"Height (px)", min:100, max:1200 },
      title:{ type:"text", label:"Section Title" },
    },
    defaults: { html:"", height:400, title:"" },
  },

  map: {
    type:"map", label:"Map / Location", category:"media", icon: MapPin,
    description:"Embedded map with location pin, zoom, and caption",
    ai: ai([], [], {}),
    fields: {
      title:{ type:"text", label:"Section Title" },
      lat:{ type:"number", label:"Latitude" }, lng:{ type:"number", label:"Longitude" },
      zoom:{ type:"number", label:"Zoom (1-18)", min:1, max:18 },
      height:{ type:"number", label:"Map Height (px)", min:200, max:800 },
      caption:{ type:"text", label:"Caption" },
    },
    defaults: { title:"Find us", lat:35.9180, lng:14.4890, zoom:13, height:420, caption:"Malta & Gozo" },
  },

  image_carousel: {
    type:"image_carousel", label:"Image Carousel", category:"media", icon: ImagePlus,
    description:"Image gallery carousel with autoplay, customizable items per view",
    ai: ai(["image analysis"], ["claude-sonnet-4-6"], {}),
    fields: {
      title:{ type:"text", label:"Title" },
      images:{ type:"array", label:"Images", itemFields:["src","alt","caption"] },
      layout:{ type:"select", label:"Layout", options:["carousel","grid","masonry","fullscreen"] },
      autoplay:{ type:"boolean", label:"Autoplay" },
      interval:{ type:"number", label:"Interval (ms)", min:2000, max:15000 },
      itemsPerView:{ type:"number", label:"Items Per View", min:1, max:6 },
    },
    defaults: {
      title:"Property Gallery", layout:"carousel", autoplay:false, interval:4000, itemsPerView:1,
      images:[
        { src:"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200", alt:"Modern apartment", caption:"Sliema Luxury Apartment" },
        { src:"https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200", alt:"Villa exterior", caption:"Valletta Penthouse" },
        { src:"https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1200", alt:"Interior design", caption:"St Julians Modern Living" },
      ],
    },
  },

  image_banner: {
    type:"image_banner", label:"Image Banner", category:"media", icon: GalleryVerticalEnd,
    description:"Full-width image banner with optional text overlay and CTA",
    ai: ai(["content generation"], ["claude-sonnet-4-5"], { generate:"Write a banner headline + CTA for: {{topic}}" }),
    fields: {
      image:{ type:"image", label:"Background Image" },
      title:{ type:"text", label:"Title" },
      subtitle:{ type:"textarea", label:"Subtitle" },
      ctaText:{ type:"text", label:"CTA Text" },
      ctaHref:{ type:"text", label:"CTA Link" },
      overlay:{ type:"boolean", label:"Show Text Overlay" },
      overlayOpacity:{ type:"number", label:"Overlay Opacity (0-100)", min:0, max:100 },
      height:{ type:"select", label:"Height", options:["auto","medium","large","full"] },
    },
    defaults: {
      image:"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920",
      title:"Luxury Malta Living", subtitle:"Experience the best of Mediterranean hospitality",
      ctaText:"Learn More", ctaHref:"/properties",
      overlay:true, overlayOpacity:40, height:"medium",
    },
  },

  before_after: {
    type:"before_after", label:"Before/After", category:"media", icon: SlidersHorizontal,
    description:"Interactive before/after image slider for property transformations",
    ai: ai(["image analysis"], ["claude-sonnet-4-6"], {}),
    fields: {
      title:{ type:"text", label:"Title" },
      beforeImage:{ type:"image", label:"Before Image" },
      afterImage:{ type:"image", label:"After Image" },
      beforeLabel:{ type:"text", label:"Before Label" },
      afterLabel:{ type:"text", label:"After Label" },
      startPosition:{ type:"number", label:"Start Position (%)", min:0, max:100 },
    },
    defaults: {
      title:"Property Transformation",
      beforeImage:"https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200",
      afterImage:"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200",
      beforeLabel:"Before", afterLabel:"After", startPosition:50,
    },
  },

  interactive_map: {
    type:"interactive_map", label:"Interactive Map", category:"media", icon: MapIcon,
    description:"Interactive map with custom markers, descriptions, and dark/light modes",
    ai: ai([], [], {}),
    fields: {
      title:{ type:"text", label:"Title" },
      centerLat:{ type:"number", label:"Center Latitude" },
      centerLng:{ type:"number", label:"Center Longitude" },
      zoom:{ type:"number", label:"Zoom (1-18)", min:1, max:18 },
      markers:{ type:"array", label:"Markers", itemFields:["lat","lng","title","description","image","link"] },
      style:{ type:"select", label:"Map Style", options:["standard","satellite","dark","light"] },
      height:{ type:"number", label:"Height (px)", min:200, max:1000 },
    },
    defaults: {
      title:"Our Properties", centerLat:35.9, centerLng:14.5, zoom:12,
      style:"dark", height:600,
      markers:[
        { lat:35.9180, lng:14.4890, title:"St Julian's", description:"The Fives Apartments", image:"", link:"" },
      ],
    },
  },

  parallax_section: {
    type:"parallax_section", label:"Parallax Section", category:"premium", icon: PanelTop,
    description:"Full-width parallax scrolling section with background image and overlay",
    ai: ai(["content generation"], ["claude-sonnet-4-6"], { generate:"Write a parallax section headline + body text for: {{topic}}" }),
    fields: {
      backgroundImage:{ type:"image", label:"Background Image" },
      title:{ type:"text", label:"Title" },
      subtitle:{ type:"textarea", label:"Subtitle" },
      content:{ type:"textarea", label:"Content" },
      overlayOpacity:{ type:"number", label:"Overlay Opacity (0-100)", min:0, max:100 },
      speed:{ type:"number", label:"Parallax Speed (0-1)", min:0, max:1, step:0.1 },
      height:{ type:"select", label:"Height", options:["auto","full","large","medium"] },
    },
    defaults: {
      backgroundImage:"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920",
      title:"Malta Awaits", subtitle:"Your property's full potential",
      content:"From the historic streets of Valletta to the sparkling shores of St Julian's — we manage Malta's finest properties.",
      overlayOpacity:60, speed:0.5, height:"large",
    },
  },
};
