import { MoveVertical, Minus } from "lucide-react";
import { ai } from "../helpers";

export const UTILITY_SCHEMAS = {
  spacer: {
    type:"spacer", label:"Spacer", category:"utility", icon: MoveVertical,
    description:"Vertical spacing block with optional divider line",
    ai: ai([], [], {}),
    fields: {
      height:{ type:"number", label:"Height (px)", min:8, max:400 },
      showLine:{ type:"boolean", label:"Show Divider Line" },
    },
    defaults: { height:80, showLine:false },
  },

  divider: {
    type:"divider", label:"Divider", category:"utility", icon: Minus,
    description:"Section divider with solid, dashed, gradient, dots, or double styles",
    ai: ai([], [], {}),
    fields: {
      style:{ type:"select", label:"Style", options:["solid","dashed","gradient","dots","double"] },
      color:{ type:"color", label:"Color" },
    },
    defaults: { style:"gradient", color:"rgba(212,175,55,0.3)" },
  },
};
