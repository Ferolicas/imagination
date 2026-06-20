import type { Plan } from "@prisma/client";
import type { EngineKind, Quality } from "./engines/types";

export interface QualitySpec {
  key: Quality;
  label: string; // etiqueta UI (es)
  credits: number;
}

export const QUALITIES: Record<Quality, QualitySpec> = {
  draft: { key: "draft", label: "Rápida", credits: 1 },
  standard: { key: "standard", label: "Estándar", credits: 2 },
  high: { key: "high", label: "Alta", credits: 8 },
  ultra: { key: "ultra", label: "Ultra", credits: 15 },
};

export interface PlanConfig {
  id: Plan;
  label: string;
  priceEur: number; // mensual
  monthlyCredits: number;
  engine: EngineKind; // qué motor de imagen usa el plan
  enhancer: "free" | "paid"; // qué LLM mejora el prompt
  qualities: Quality[]; // calidades permitidas
  defaultQuality: Quality;
  maxBatch: number; // imágenes por generación
  video: boolean;
}

// Defaults de negocio (ajustables). Free corre sobre motores gratis (coste 0).
export const PLANS: Record<Plan, PlanConfig> = {
  FREE: {
    id: "FREE",
    label: "Free",
    priceEur: 0,
    monthlyCredits: 0,
    engine: "free",
    enhancer: "free",
    qualities: ["draft", "standard"],
    defaultQuality: "standard",
    maxBatch: 1,
    video: false,
  },
  BASIC: {
    id: "BASIC",
    label: "Basic",
    priceEur: 7.99,
    monthlyCredits: 300,
    engine: "openai",
    enhancer: "paid",
    qualities: ["standard", "high"],
    defaultQuality: "standard",
    maxBatch: 2,
    video: false,
  },
  PRO: {
    id: "PRO",
    label: "Pro",
    priceEur: 17.99,
    monthlyCredits: 1000,
    engine: "openai",
    enhancer: "paid",
    qualities: ["high", "ultra"],
    defaultQuality: "high",
    maxBatch: 4,
    video: false,
  },
  PREMIUM: {
    id: "PREMIUM",
    label: "Premium",
    priceEur: 39.99,
    monthlyCredits: 3000,
    engine: "openai",
    enhancer: "paid",
    qualities: ["high", "ultra"],
    defaultQuality: "ultra",
    maxBatch: 6,
    video: true,
  },
};

export interface ResolvedGen {
  engine: EngineKind;
  credits: number;
  pollinationsModel?: string;
  openaiQuality?: "low" | "medium" | "high";
}

// Resuelve motor + coste + params a partir de (plan, calidad). Config, no reescritura.
export function resolveGen(plan: Plan, quality: Quality): ResolvedGen {
  const p = PLANS[plan];
  const q = quality && p.qualities.includes(quality) ? quality : p.defaultQuality;
  const credits = QUALITIES[q].credits;
  if (p.engine === "free") {
    return { engine: "free", credits, pollinationsModel: q === "draft" ? "turbo" : "flux" };
  }
  const openaiQuality = q === "standard" ? "low" : q === "high" ? "medium" : "high";
  return { engine: "openai", credits, openaiQuality };
}

export interface TopupPack {
  key: "S" | "M" | "L";
  credits: number;
  priceEur: number;
}

// Packs de créditos adicionales (persistentes, no caducan con el ciclo).
export const TOPUPS: TopupPack[] = [
  { key: "S", credits: 250, priceEur: 5 },
  { key: "M", credits: 900, priceEur: 15 },
  { key: "L", credits: 2800, priceEur: 40 },
];
