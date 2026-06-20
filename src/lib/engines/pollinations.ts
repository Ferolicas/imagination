import type { ImageEngine, ImageGenRequest, ImageGenResult } from "./types";

// Motor GRATIS: Pollinations (Flux). Devuelve URLs; la imagen se genera al accederla.
// El throttling/caché/almacenamiento server-side se añade en el endurecimiento anti-abuso.
const BASE = process.env.POLLINATIONS_BASE || "https://image.pollinations.ai";

function buildUrl(
  prompt: string,
  o: { width: number; height: number; seed: number; model: string },
): string {
  const params = new URLSearchParams({
    width: String(o.width),
    height: String(o.height),
    seed: String(o.seed),
    model: o.model,
    nologo: "true",
    referrer: "imagination.olcas.app",
  });
  return `${BASE}/prompt/${encodeURIComponent(prompt)}?${params.toString()}`;
}

export const pollinationsEngine: ImageEngine = {
  id: "pollinations",
  available: () => true,
  async generate(req: ImageGenRequest): Promise<ImageGenResult> {
    const model = req.model || "flux";
    const baseSeed = req.seed ?? Math.floor(Math.random() * 1_000_000);
    const images = Array.from({ length: req.count }, (_, i) =>
      buildUrl(req.prompt, {
        width: req.width,
        height: req.height,
        seed: baseSeed + i,
        model,
      }),
    );
    return { images, engine: "pollinations", model };
  },
  async healthy() {
    try {
      const r = await fetch(`${BASE}/models`, { signal: AbortSignal.timeout(5000) });
      return r.ok;
    } catch {
      return false;
    }
  },
};
