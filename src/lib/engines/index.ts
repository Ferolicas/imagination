import type { EngineKind, ImageEngine } from "./types";
import { pollinationsEngine } from "./pollinations";

// Registro de motores. Añadir SwarmLocal/OpenAI/Vídeo = registrar aquí, sin tocar el flujo.
const registry: Partial<Record<string, ImageEngine>> = {
  pollinations: pollinationsEngine,
  // swarm:  swarmLocalEngine,   (Fase 1 — balanceo/backup por Tailscale)
  // openai: openaiImageEngine,  (Fase 2)
};

// Selecciona el motor de imagen según el tipo resuelto del plan.
export function getImageEngine(kind: EngineKind): ImageEngine {
  if (kind === "openai") {
    return registry.openai ?? pollinationsEngine; // fallback hasta Fase 2
  }
  // free: por ahora Pollinations; el balanceo con SwarmLocal se añade en anti-abuso.
  return registry.pollinations!;
}

export { enhancePrompt } from "./enhancer";
export type { ImageEngine, ImageGenRequest, ImageGenResult, Quality } from "./types";
