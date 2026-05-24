import { MessageCircle, Eye } from "lucide-react";
import { ai } from "../helpers";

export const AI_SCHEMAS = {
  agent_chat: {
    type:"agent_chat", label:"AI Chat Assistant", category:"ai", icon: MessageCircle,
    description:"Conversational AI assistant for guest inquiries and concierge services",
    aiFields:["systemPrompt"],
    ai: ai(["conversational ai","content generation"], ["claude-sonnet-4-5"], { generate:"Write an AI concierge greeting message for a Malta property website." }),
    fields: {
      label:{ type:"text", label:"Block Label" },
      title:{ type:"text", label:"Widget Title" },
      greeting:{ type:"textarea", label:"Initial Greeting" },
      placeholder:{ type:"text", label:"Input Placeholder" },
      height:{ type:"number", label:"Widget Height (px)" },
      systemPrompt:{ type:"textarea", label:"System Prompt (optional override)" },
    },
    defaults: {
      label:"AI assistant", title:"Ask the concierge",
      greeting:"Hi! I can help you find a stay in Malta or Gozo, or answer questions about our property management services. What can I help with?",
      placeholder:"e.g. 2 bedroom in Sliema for 4 nights in June...", height:520, systemPrompt:"",
    },
  },

  vision_qa: {
    type:"vision_qa", label:"Vision Q&A (Image AI)", category:"ai", icon: Eye,
    description:"Upload property images and ask AI questions about them",
    ai: ai(["image analysis"], ["gemini-2.5-flash"], {}),
    fields: {
      label:{ type:"text", label:"Block Label" },
      title:{ type:"text", label:"Title" },
      subtitle:{ type:"textarea", label:"Subtitle" },
      defaultQuestion:{ type:"text", label:"Default Question" },
    },
    defaults: {
      label:"Image insight", title:"Upload a photo, ask anything",
      subtitle:"Our AI will describe and answer questions about any property image.",
      defaultQuestion:"What style and features stand out in this property?",
    },
  },
};
