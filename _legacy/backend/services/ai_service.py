"""
AI Content Generation Service — OpenRouter (free models via OpenAI-compatible API)
"""
import os
import json
import logging
from fastapi import HTTPException
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)

OPENROUTER_API_KEY = os.environ.get('OPENROUTER_API_KEY', '')
FREE_MODEL = "google/gemini-flash-1.5:free"

_client = AsyncOpenAI(
    api_key=OPENROUTER_API_KEY,
    base_url="https://openrouter.ai/api/v1",
) if OPENROUTER_API_KEY else None


class AIService:
    def __init__(self):
        self.brand_context = {
            "brand": "Christiano Property Management",
            "industry": "luxury vacation rental property management",
            "location": "Malta",
            "tone": "professional, elegant, sophisticated yet approachable",
            "audience": "discerning travelers and property owners",
        }

    def _client_or_raise(self):
        if not _client:
            raise HTTPException(status_code=503, detail="AI service not configured — set OPENROUTER_API_KEY")
        return _client

    async def _chat(self, system: str, user: str) -> str:
        client = self._client_or_raise()
        resp = await client.chat.completions.create(
            model=FREE_MODEL,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            max_tokens=512,
        )
        return (resp.choices[0].message.content or "").strip()

    async def generate_content(self, prompt: str, context: dict = None, **_) -> str:
        merged = {**self.brand_context, **(context or {})}
        system = (
            "You are a professional copywriter for a luxury vacation rental and property management company in Malta.\n"
            "Write compelling, elegant, and professional content that matches a premium brand voice.\n"
            "Keep responses concise but impactful. DO NOT wrap your response in quotes. Return content directly.\n"
            f"Brand: {merged['brand']} | Location: {merged['location']} | Tone: {merged['tone']}"
        )
        try:
            content = await self._chat(system, prompt)
            if len(content) >= 2 and content[0] == content[-1] and content[0] in ('"', "'"):
                content = content[1:-1]
            return content
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"AI generation error: {e}")
            raise HTTPException(status_code=500, detail="AI generation failed")

    async def generate_block_content(self, block_type: str, field: str, current_value: str = None, context: dict = None) -> str:
        prompts = {
            "hero": {
                "badge": "Generate a short, prestigious badge text (max 5 words) for a luxury property management hero section.",
                "headline": "Generate a captivating headline (max 8 words) for a luxury Malta property management website.",
                "headlineSub": "Generate an elegant italic accent phrase (3-5 words) to complement a property headline.",
                "subheadline": "Generate a compelling subheadline (1-2 sentences) for a luxury vacation rental service.",
                "cta1": "Generate a primary CTA button text (2-4 words) for property owners.",
                "cta2": "Generate a secondary CTA button text (2-4 words) for guests.",
            },
            "features": {
                "label": "Generate a short section label (2-3 words) for a features section.",
                "title": "Generate an engaging section title (4-8 words) for features/benefits.",
            },
            "testimonials": {
                "title": "Generate a testimonials section title (3-6 words).",
                "text": "Generate a realistic guest testimonial (2-3 sentences) about excellent property management service.",
            },
            "cta": {
                "title": "Generate a compelling CTA section title (4-7 words).",
                "subtitle": "Generate an engaging CTA subtitle (1-2 sentences).",
            },
            "text": {"content": "Generate engaging paragraph content (2-3 sentences) about luxury Malta vacation rentals."},
            "heading": {"text": "Generate a captivating section heading (3-6 words)."},
        }
        specific_prompt = prompts.get(block_type, {}).get(
            field, f"Generate professional content for the {field} field of a {block_type} section."
        )
        if current_value:
            specific_prompt += f"\n\nCurrent content for reference: {current_value}\n\nGenerate improved content."
        return await self.generate_content(specific_prompt, context)

    async def generate_seo_content(self, page: str = "home", context: dict = None) -> dict:
        system = (
            "You are an SEO expert for a luxury vacation rental and property management company in Malta.\n"
            "Generate SEO-optimized metadata. Return valid JSON only — no markdown, no explanation."
        )
        prompt = (
            f"Generate SEO metadata for the {page} page of Christiano Property Management (Malta vacation rentals).\n"
            'Return JSON with exactly these fields: {"title": "(50-60 chars)", "description": "(150-160 chars)", "keywords": "comma-separated 5-8 keywords"}'
        )
        try:
            raw = await self._chat(system, prompt)
            start, end = raw.find('{'), raw.rfind('}') + 1
            if start >= 0 and end > start:
                return json.loads(raw[start:end])
        except Exception as e:
            logger.error(f"SEO generation error: {e}")
        return {
            "title": "Christiano Property Management | Luxury Malta Accommodations",
            "description": "Malta's premier luxury short-term rental management company. Professional property management with transparent fees.",
            "keywords": "malta property management, vacation rentals malta, airbnb management",
        }


    async def generate_image(self, prompt: str) -> str:
        """Generate image via OpenRouter image model"""
        client = self._client_or_raise()
        try:
            resp = await client.chat.completions.create(
                model="openai/dall-e-3",
                messages=[
                    {"role": "user", "content": f"Generate an image: {prompt}"}
                ],
                max_tokens=100,
            )
            return (resp.choices[0].message.content or "").strip()
        except Exception as e:
            logger.warning(f"AI image generation failed, using fallback: {e}")
            return f"https://placehold.co/800x600/D4AF37/FFFFFF?text={prompt[:50].replace(' ', '+')}"


ai_service = AIService()
