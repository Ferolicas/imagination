import { generateText, type LanguageModel } from "ai";
import { groq } from "@ai-sdk/groq";
import { anthropic } from "@ai-sdk/anthropic";
import type { EnhanceTier, PromptEnhancer } from "./types";

const SYSTEM = `You are an expert at writing prompts for AI image generators.
Rewrite the user's idea as ONE rich, descriptive prompt written in ENGLISH — always English, no matter what language the user used.
Include: subject, composition, lighting, art style, camera/lens, color palette and level of detail, always preserving the original intent.
Keep it strictly SFW (safe for work). Output ONLY the improved English prompt — one line, no quotes, no preamble, no explanations.`;

async function run(model: LanguageModel, prompt: string): Promise<string> {
  const { text } = await generateText({
    model,
    system: SYSTEM,
    prompt: `User's idea: "${prompt}"`,
    temperature: 0.7,
    maxOutputTokens: 300,
  });
  return text.trim();
}

// Mejora el prompt. Pago → Claude Haiku; gratis → Groq Llama. Nunca bloquea: si falla, devuelve el original.
export async function enhancePrompt(prompt: string, tier: EnhanceTier): Promise<string> {
  const clean = prompt.trim();
  try {
    if (tier === "paid" && process.env.ANTHROPIC_API_KEY) {
      return (await run(anthropic("claude-haiku-4-5-20251001"), clean)) || clean;
    }
    if (process.env.GROQ_API_KEY) {
      return (await run(groq("llama-3.3-70b-versatile"), clean)) || clean;
    }
    return clean;
  } catch (e) {
    console.error("[enhancer]", (e as Error).message);
    return clean;
  }
}

export const groqEnhancer: PromptEnhancer = {
  id: "groq",
  available: () => Boolean(process.env.GROQ_API_KEY),
  enhance: (prompt, tier) => enhancePrompt(prompt, tier),
};
