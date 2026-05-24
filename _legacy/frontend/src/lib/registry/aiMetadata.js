const ai = (useCases = [], requiredModels = [], prompts = {}) => ({ useCases, requiredModels, prompts });

export const AI_METADATA = {
  header:  ai([], [], {}),
  footer:  ai([], [], {}),
  seo:     ai(["content generation"], ["claude-sonnet-4-5"], { generate:"Write an SEO meta title (≤60 chars) and description (≤160 chars) for a luxury Malta property management page about: {{topic}}" }),

  hero:        ai(["content generation"], ["claude-sonnet-4-5"], { generate:"Write a luxury hero headline + subheadline for {{topic}}. Use <em> for the gold-italic emphasis word." }),
  owners_hero: ai(["content generation"], ["claude-sonnet-4-5"], { generate:"Write a confident owners-page hero with a 'titleAccent' gold word for: {{topic}}" }),
  columns:     ai(["content generation"], ["claude-sonnet-4-5"], { generate:"Suggest 3 columns of content (title, body) for: {{topic}}" }),

  text:     ai(["content generation","summarization"], ["claude-sonnet-4-5"], { generate:"Write a short editorial body paragraph for: {{topic}}", summarize:"Summarise this into 2 sentences: {{body}}" }),
  richtext: ai(["content generation"], ["claude-sonnet-4-5"], { generate:"Write rich HTML (h2 + 2 p) on: {{topic}}" }),
  about:    ai(["content generation"], ["claude-sonnet-4-5"], { generate:"Write an About section with 3 short paragraphs and a 'titleAccent' italic word for: {{topic}}" }),
  quote:    ai(["content generation"], ["claude-sonnet-4-5"], { generate:"Write a realistic guest testimonial quote (max 2 lines) about a Malta stay." }),

  stats:         ai(["content generation"], ["claude-sonnet-4-5"], { generate:"Suggest 4 short impressive stats (value + label) for a luxury Malta PM business about: {{topic}}" }),
  features:      ai(["content generation"], ["claude-sonnet-4-5"], { generate:"Write 6 short feature cards (icon name + title + 1-line body) for: {{topic}}" }),
  pricing:       ai(["content generation"], ["claude-sonnet-4-5"], { generate:"Propose 2 pricing plans for short-let property management with 5-6 features each, EUR." }),
  faq:           ai(["content generation"], ["claude-sonnet-4-5"], { generate:"Write 6 FAQ Q&A pairs for a Malta short-let property owner audience about: {{topic}}" }),
  animated_stats: ai(["content generation"], ["claude-sonnet-4-6"], { generate:"Suggest 4 animated counter stats (value, prefix/suffix, label, icon name) for a luxury Malta PM company." }),

  testimonials:         ai(["content generation"], ["claude-sonnet-4-5"], { generate:"Write 6 realistic 5-star guest testimonials (name, date, rating, text) for: {{topic}}" }),
  team:                 ai(["content generation"], ["claude-sonnet-4-5"], { generate:"Suggest team bios (initials, name, role, 1-line bio) for: {{topic}}" }),
  logos:                ai([], [], {}),
  testimonial_carousel: ai(["content generation"], ["claude-sonnet-4-6"], { generate:"Write 5 realistic guest testimonials (name, rating, text, stay type) for a luxury Malta short-let property." }),
  social_feed:          ai([], [], {}),

  properties:       ai([], [], {}),
  guesty_listings:  ai([], [], {}),
  guesty_book:      ai([], [], {}),
  property_carousel: ai([], [], {}),

  cta:           ai(["content generation"], ["claude-sonnet-4-5"], { generate:"Write a high-conversion CTA headline (≤8 words) + 1-line subheadline for: {{topic}}" }),
  contact:       ai(["content generation"], ["claude-sonnet-4-5"], { generate:"Suggest a contact section title + subtitle + 3 contact methods for: {{topic}}" }),
  form:          ai(["content generation"], ["claude-sonnet-4-5"], { generate:"Suggest 5 form fields (name,label,type,required,placeholder) for: {{topic}}" }),
  newsletter:    ai(["content generation"], ["claude-sonnet-4-5"], { generate:"Write a newsletter signup title + body (≤30 words) for: {{topic}}" }),
  countdown:     ai(["content generation"], ["claude-sonnet-4-6"], { generate:"Write a countdown section title and offer description for a seasonal Malta rental promotion." }),
  advanced_form: ai(["content generation"], ["claude-sonnet-4-6"], { generate:"Suggest 6 form fields (name, label, type, required, placeholder) for a property owner inquiry form." }),

  agent_chat: ai(["conversational ai","content generation"], ["claude-sonnet-4-5"], { generate:"Write an AI concierge greeting message for a Malta property website." }),
  vision_qa:  ai(["image analysis"], ["gemini-2.5-flash"], {}),

  image:          ai(["image analysis"], ["gemini-2.5-flash"], {}),
  gallery:        ai(["image analysis"], ["gemini-2.5-flash"], {}),
  video:          ai([], [], {}),
  embed:          ai(["code generation"], ["claude-sonnet-4-5"], { generate:"Generate HTML embed code for: {{topic}}" }),
  map:            ai([], [], {}),
  image_carousel: ai(["image analysis"], ["claude-sonnet-4-6"], {}),
  image_banner:   ai(["content generation"], ["claude-sonnet-4-5"], { generate:"Write a banner headline + CTA for: {{topic}}" }),
  before_after:   ai(["image analysis"], ["claude-sonnet-4-6"], {}),
  interactive_map: ai([], [], {}),

  spacer:  ai([], [], {}),
  divider: ai([], [], {}),

  carousel_hero:    ai(["content generation"], ["claude-sonnet-4-6"], { generate:"Write 3 carousel slides (headline, subheadline, cta) for a luxury Malta property hero. Each slide has a distinct angle." }),
  video_hero:       ai(["content generation"], ["claude-sonnet-4-6"], { generate:"Write a video hero overlay headline + subheadline + CTA for: {{topic}}" }),
  parallax_section: ai(["content generation"], ["claude-sonnet-4-6"], { generate:"Write a parallax section headline + body text for: {{topic}}" }),
};
