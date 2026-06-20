import type { Plan } from "@prisma/client";
import type { EngineKind, Quality } from "./engines/types";

export interface QualitySpec {
  key: Quality;
  label: string;
  credits: number;
}

// Coste en créditos por calidad (global).
export const QUALITIES: Record<Quality, QualitySpec> = {
  basica: { key: "basica", label: "Básica", credits: 1 },
  alta: { key: "alta", label: "Alta", credits: 2 },
  premium: { key: "premium", label: "Premium", credits: 4 },
};

export interface PlanConfig {
  id: Plan;
  label: string;
  priceEur: number; // mensual
  monthlyCredits: number;
  engine: EngineKind;
  enhancer: "free" | "paid";
  qualities: Quality[];
  defaultQuality: Quality;
  maxBatch: number;
  video: boolean;
  models: string; // descripción para la UI
}

export const PLANS: Record<Plan, PlanConfig> = {
  FREE: {
    id: "FREE", label: "Free", priceEur: 0, monthlyCredits: 30,
    engine: "free", enhancer: "free", qualities: ["basica"], defaultQuality: "basica",
    maxBatch: 1, video: false, models: "Pollinations (Flux)",
  },
  BASIC: {
    id: "BASIC", label: "Basic", priceEur: 12.99, monthlyCredits: 100,
    engine: "openai", enhancer: "paid", qualities: ["basica", "alta"], defaultQuality: "basica",
    maxBatch: 2, video: false, models: "GPT Image Mini + GPT Image 1.5",
  },
  PRO: {
    id: "PRO", label: "Pro", priceEur: 39.99, monthlyCredits: 300,
    engine: "openai", enhancer: "paid", qualities: ["alta"], defaultQuality: "alta",
    maxBatch: 4, video: true, models: "GPT Image 1.5 + Kling Pro + Veo 4K",
  },
  PREMIUM: {
    id: "PREMIUM", label: "Premium", priceEur: 89.99, monthlyCredits: 650,
    engine: "openai", enhancer: "paid", qualities: ["premium"], defaultQuality: "premium",
    maxBatch: 6, video: true, models: "GPT Image 2 High + Kling Pro + Veo 4K",
  },
};

export interface ResolvedGen {
  engine: EngineKind;
  credits: number;
  pollinationsModel?: string;
  openaiQuality?: "low" | "medium" | "high";
}

export function resolveGen(plan: Plan, quality: Quality): ResolvedGen {
  const p = PLANS[plan];
  const q = quality && p.qualities.includes(quality) ? quality : p.defaultQuality;
  const credits = QUALITIES[q].credits;
  if (p.engine === "free") {
    return { engine: "free", credits, pollinationsModel: "flux" };
  }
  const openaiQuality = q === "premium" ? "high" : q === "alta" ? "medium" : "low";
  return { engine: "openai", credits, openaiQuality };
}

export interface TopupPack {
  key: "S" | "M" | "L";
  credits: number;
  priceEur: number;
}

export const TOPUPS: TopupPack[] = [
  { key: "S", credits: 250, priceEur: 5 },
  { key: "M", credits: 900, priceEur: 15 },
  { key: "L", credits: 2800, priceEur: 40 },
];

export interface VideoOption {
  key: string;
  label: string;
  provider: "kling" | "veo";
  durationSec: number;
  credits: number;
  audio: boolean;
  fourK: boolean;
}

// Coste en créditos por vídeo (Pro/Premium).
export const VIDEO_OPTIONS: VideoOption[] = [
  { key: "k5", label: "5s con audio", provider: "kling", durationSec: 5, credits: 30, audio: true, fourK: false },
  { key: "k10", label: "10s con audio", provider: "kling", durationSec: 10, credits: 55, audio: true, fourK: false },
  { key: "v5", label: "5s · Veo 4K", provider: "veo", durationSec: 5, credits: 60, audio: false, fourK: true },
  { key: "v10", label: "10s · Veo 4K", provider: "veo", durationSec: 10, credits: 120, audio: false, fourK: true },
];
