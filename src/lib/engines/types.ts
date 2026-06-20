// Capa de motores: adaptadores intercambiables. Cambiar de proveedor = config, no reescritura.

export type Quality = "draft" | "standard" | "high" | "ultra";
export type EngineKind = "free" | "openai";

export interface ImageGenRequest {
  prompt: string; // prompt FINAL (ya mejorado)
  negative?: string;
  width: number;
  height: number;
  count: number;
  quality: Quality;
  model?: string;
  seed?: number;
}

export interface ImageGenResult {
  images: string[]; // URLs (o data URLs) listas para servir
  engine: string;
  model?: string;
}

export interface ImageEngine {
  id: string;
  available(): boolean;
  generate(req: ImageGenRequest): Promise<ImageGenResult>;
  healthy?(): Promise<boolean>;
}

export type EnhanceTier = "free" | "paid";

export interface PromptEnhancer {
  id: string;
  available(): boolean;
  enhance(prompt: string, tier: EnhanceTier): Promise<string>;
}
