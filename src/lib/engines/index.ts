import type { EngineKind, ImageEngine } from "./types";
import { pollinationsEngine } from "./pollinations";
import { openaiImageEngine } from "./openai";

// Registro de motores (100% API, sin PC). Añadir vídeo = registrar aquí, sin tocar el flujo.
const registry: Record<string, ImageEngine> = {
  pollinations: pollinationsEngine,
  openai: openaiImageEngine,
};

// Selecciona el motor de imagen según el tipo resuelto del plan.
export function getImageEngine(kind: EngineKind): ImageEngine {
  if (kind === "openai") {
    return openaiImageEngine.available() ? openaiImageEngine : pollinationsEngine;
  }
  return pollinationsEngine;
}

export { registry };
export { enhancePrompt } from "./enhancer";
export type { ImageEngine, ImageGenRequest, ImageGenResult, Quality } from "./types";
