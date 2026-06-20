import type { VideoEngine } from "./types";

// Arquitectura preparada para vídeo. Para activarlo, implementa un VideoEngine
// (Kling / Seedance / Veo) y regístralo aquí — es configuración, no reescritura del flujo.
// El gating por plan (solo Pro/Premium) y el coste en créditos ya están contemplados.

const registry: Partial<Record<string, VideoEngine>> = {
  // kling: klingEngine,
  // veo: veoEngine,
};

export function getVideoEngine(): VideoEngine | null {
  const id = process.env.VIDEO_ENGINE; // p.ej. "kling"
  if (id && registry[id]?.available()) return registry[id]!;
  return null;
}
