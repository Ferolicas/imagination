export interface StyleOption {
  key: string;
  label: string;
  hint: string; // se inyecta al enhancer
}

// Estilos que el usuario marca; cada uno guía la mejora del prompt.
export const STYLES: StyleOption[] = [
  { key: "realista", label: "Realista", hint: "photorealistic, ultra realistic, lifelike, true to life" },
  { key: "personas", label: "Personas", hint: "realistic human portrait, natural detailed skin texture, lifelike eyes" },
  { key: "anime", label: "Anime", hint: "anime style, clean cel shading, vibrant colors, expressive" },
  { key: "caricatura", label: "Caricatura", hint: "cartoon illustration, bold clean outlines, playful, stylized" },
  { key: "acuarela", label: "Acuarela", hint: "watercolor painting, soft color washes, delicate brush strokes, artistic" },
  { key: "futurista", label: "Futurista", hint: "futuristic sci-fi, neon lighting, cyberpunk aesthetic, high tech" },
  { key: "3d", label: "3D", hint: "3D render, octane render, cinematic CGI, physically based materials" },
  { key: "8k", label: "8K", hint: "8k, ultra high resolution, extremely detailed, crisp" },
];

export function hintsForStyles(keys: string[]): string[] {
  return STYLES.filter((s) => keys.includes(s.key)).map((s) => s.hint);
}
