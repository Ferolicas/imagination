import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import type { EnhanceTier, PromptEnhancer } from "./types";

const SYSTEM = `You are an expert at writing prompts for AI image generators.
Rewrite the user's idea as ONE rich, descriptive prompt written in ENGLISH — always English, no matter what language the user used.
Include: subject, composition, lighting, art style, camera/lens, color palette and level of detail, always preserving the original intent.
Keep it strictly SFW (safe for work). Output ONLY the improved English prompt — one line, no quotes, no preamble, no explanations.`;

async function enhanceWithGroq(prompt: string): Promise<string> {
  const { text } = await generateText({
    model: groq("llama-3.3-70b-versatile"),
    system: SYSTEM,
    prompt: `User's idea: "${prompt}"`,
    temperature: 0.7,
    maxOutputTokens: 300,
  });
  return text.trim();
}

// Mejora el prompt. NUNCA bloquea la generación: si falla o no hay clave, devuelve el original.
export async function enhancePrompt(prompt: string, tier: EnhanceTier): Promise<string> {
  const clean = prompt.trim();
  try {
    if (tier === "free") {
      if (!process.env.GROQ_API_KEY) return clean;
      return (await enhanceWithGroq(clean)) || clean;
    }
    // tier "paid" (Claude Haiku) se conecta en Fase 2; de momento usa Groq si existe.
    if (process.env.GROQ_API_KEY) return (await enhanceWithGroq(clean)) || clean;
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
