import { GLOBAL_SCHEMAS } from "./global";
import { HERO_SCHEMAS } from "./hero";
import { CONTENT_SCHEMAS } from "./content";
import { DATA_SCHEMAS } from "./data";
import { SOCIAL_SCHEMAS } from "./social";
import { PROPERTIES_SCHEMAS } from "./properties";
import { CONVERSION_SCHEMAS } from "./conversion";
import { AI_SCHEMAS } from "./ai";
import { MEDIA_SCHEMAS } from "./media";
import { UTILITY_SCHEMAS } from "./utility";

export const SCHEMAS = {
  ...GLOBAL_SCHEMAS,
  ...HERO_SCHEMAS,
  ...CONTENT_SCHEMAS,
  ...DATA_SCHEMAS,
  ...SOCIAL_SCHEMAS,
  ...PROPERTIES_SCHEMAS,
  ...CONVERSION_SCHEMAS,
  ...AI_SCHEMAS,
  ...MEDIA_SCHEMAS,
  ...UTILITY_SCHEMAS,
};
