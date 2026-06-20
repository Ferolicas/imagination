import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import type { EnhanceTier, PromptEnhancer } from "./types";

const SYSTEM = `Eres un experto en prompts para generación de imágenes con IA.
Reescribe la idea del usuario como un prompt EN INGLÉS, rico y descriptivo:
sujeto, composición, iluminación, estilo artístico, lente/cámara, paleta y nivel de detalle,
manteniendo SIEMPRE la intención original. Mantén el contenido apto para todos los públicos (SFW).
Devuelve SOLO el prompt mejorado, en una línea, sin comillas ni explicaciones.`;

async function enhanceWithGroq(prompt: string): Promise<string> {
  const { text } = await generateText({
    model: groq("llama-3.3-70b-versatile"),
    system: SYSTEM,
    prompt: `Idea del usuario: "${prompt}"`,
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
