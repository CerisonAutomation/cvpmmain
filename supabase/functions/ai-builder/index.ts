// AI Page Builder gateway — generate / critique / suggest copy for blocks.
// Uses Lovable AI Gateway (LOVABLE_API_KEY).
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const DEFAULT_MODEL = "google/gemini-3-flash-preview";

const AiModeSchema = z.enum(["generate", "critique", "rewrite", "seo"]);

const AiRequestSchema = z.object({
  mode: AiModeSchema.default("generate"),
  prompt: z.string().min(1).max(5000),
  context: z.unknown().optional(),
  model: z.string().optional(),
});

const SYSTEM_PROMPTS: Record<string, string> = {
  generate:
    "You are a senior editorial copywriter for a luxury Mediterranean property brand (Malta/Gozo). Write tight, elegant, conversion-focused copy. Return JSON only — no prose, no markdown fences.",
  critique:
    "You are a UX & conversion auditor. Review the given block JSON and return JSON: { score:0-100, issues:[{severity,note}], suggestions:[string] }. JSON only.",
  rewrite:
    "Rewrite the given copy keeping intent, but elevate tone to refined editorial luxury. Return JSON only matching the same shape.",
  seo:
    "Generate SEO meta for the provided page outline. Return JSON: { title, description, keywords:[] } — title<60 chars, description<160.",
};

const AiResponseSchema = z.object({
  mode: z.string(),
  model: z.string(),
  result: z.unknown(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST required" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const validated = AiRequestSchema.safeParse(body);
    if (!validated.success) {
      return new Response(JSON.stringify({ error: "Invalid request", details: validated.error.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { mode, prompt: userPrompt, context, model = DEFAULT_MODEL } = validated.data;

    const system = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.generate;
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const messages = [
      { role: "system", content: system },
      {
        role: "user",
        content: context
          ? `${userPrompt}\n\n---CONTEXT---\n${JSON.stringify(context)}`
          : userPrompt,
      },
    ];

    const aiRes = await fetch(GATEWAY, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        response_format: { type: "json_object" },
      }),
    });

    if (aiRes.status === 429)
      return new Response(JSON.stringify({ error: "Rate limited" }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    if (aiRes.status === 402)
      return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    const data = await aiRes.json();
    const text = data?.choices?.[0]?.message?.content ?? "{}";
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { raw: text };
    }

    const response = AiResponseSchema.parse({ mode, model, result: parsed });
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
