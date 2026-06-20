import { generateText, type LanguageModel } from "ai";
import { groq } from "@ai-sdk/groq";
import { anthropic } from "@ai-sdk/anthropic";
import type { EnhanceTier, PromptEnhancer } from "./types";

// Mejora "PRO": convierte ideas simples en prompts de calidad profesional.
const SYSTEM = `You are a world-class prompt engineer for state-of-the-art text-to-image models (Flux, SDXL, GPT Image).
Transform the user's idea into ONE single, vivid, professional image prompt written in ENGLISH (always English, regardless of the input language).
Make the result look like a top-tier photograph or artwork. Include, when relevant:
- the main subject and what it is doing, with concrete descriptive detail;
- setting / background and depth;
- composition and framing (rule of thirds, close-up, wide shot, leading lines);
- for photographic looks: camera + lens + settings (e.g. 85mm, f/1.4, shallow depth of field);
- lighting (golden hour, soft studio light, rim light, dramatic shadows);
- mood, atmosphere and a coherent color palette;
- materials and textures;
- explicit quality boosters: "highly detailed, intricate detail, sharp focus, physically accurate, professional, masterpiece, ultra high resolution".
Amplify and respect the user's intent. NEVER add subjects or elements the user did not ask for. Keep it strictly SFW (safe for work).
Output ONLY the final English prompt — a single line, no quotes, no preamble, no explanations.`;

async function run(model: LanguageModel, userMsg: string): Promise<string> {
  const { text } = await generateText({
    model,
    system: SYSTEM,
    prompt: userMsg,
    temperature: 0.8,
    maxOutputTokens: 400,
  });
  return text.trim();
}

// Mejora el prompt (siempre activo). Pago → Claude Haiku; resto → Groq Llama. Nunca bloquea.
export async function enhancePrompt(
  prompt: string,
  tier: EnhanceTier,
  styleHints: string[] = [],
): Promise<string> {
  const clean = prompt.trim();
  const styleLine = styleHints.length
    ? `\nDesired style: ${styleHints.join(", ")}. Make the prompt strongly reflect this style.`
    : "";
  const userMsg = `User's idea: "${clean}"${styleLine}`;
  try {
    if (tier === "paid" && process.env.ANTHROPIC_API_KEY) {
      return (await run(anthropic("claude-haiku-4-5-20251001"), userMsg)) || clean;
    }
    if (process.env.GROQ_API_KEY) {
      return (await run(groq("llama-3.3-70b-versatile"), userMsg)) || clean;
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
