import Stripe from "stripe";
import type { Plan } from "@prisma/client";

const key = process.env.STRIPE_SECRET_KEY;
export const stripe = key ? new Stripe(key) : null;

// Plan → price id de suscripción (configurado por env).
export const PLAN_PRICE: Record<"BASIC" | "PRO" | "PREMIUM", string | undefined> = {
  BASIC: process.env.STRIPE_PRICE_BASIC,
  PRO: process.env.STRIPE_PRICE_PRO,
  PREMIUM: process.env.STRIPE_PRICE_PREMIUM,
};

export function planForPrice(priceId: string): Plan | null {
  if (priceId && priceId === process.env.STRIPE_PRICE_BASIC) return "BASIC";
  if (priceId && priceId === process.env.STRIPE_PRICE_PRO) return "PRO";
  if (priceId && priceId === process.env.STRIPE_PRICE_PREMIUM) return "PREMIUM";
  return null;
}

// Packs de créditos (top-up): price id → créditos.
export const TOPUP_CREDITS: Record<string, number> = {};
if (process.env.STRIPE_PRICE_TOPUP_S) TOPUP_CREDITS[process.env.STRIPE_PRICE_TOPUP_S] = 250;
if (process.env.STRIPE_PRICE_TOPUP_M) TOPUP_CREDITS[process.env.STRIPE_PRICE_TOPUP_M] = 900;
if (process.env.STRIPE_PRICE_TOPUP_L) TOPUP_CREDITS[process.env.STRIPE_PRICE_TOPUP_L] = 2800;
