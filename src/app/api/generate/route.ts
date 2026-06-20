import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { enhancePrompt, getImageEngine } from "@/lib/engines";
import { PLANS, resolveGen } from "@/lib/plans";
import { killSwitchOn, rateLimit, bumpDailyCounter } from "@/lib/ratelimit";
import { getCurrentUser } from "@/lib/auth/session";
import { debitCredits, refundCredits } from "@/lib/credits";
import { prisma } from "@/lib/db";
import type { Quality } from "@/lib/engines/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  prompt: z.string().min(2).max(1000),
  size: z.enum(["square", "portrait", "landscape"]).default("square"),
  quality: z.enum(["draft", "standard", "high", "ultra"]).default("standard"),
  enhance: z.boolean().default(true),
});

const SIZES = {
  square: { width: 1024, height: 1024 },
  portrait: { width: 832, height: 1216 },
  landscape: { width: 1216, height: 832 },
} as const;

function getIp(req: NextRequest): string {
  const x = req.headers.get("x-forwarded-for");
  return (x ? x.split(",")[0] : "").trim() || "0.0.0.0";
}

export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  const { prompt, size, enhance } = parsed.data;
  let quality: Quality = parsed.data.quality;
  const dims = SIZES[size];

  if (await killSwitchOn()) {
    return NextResponse.json(
      { error: "La generación está pausada temporalmente. Vuelve en un rato." },
      { status: 503 },
    );
  }

  const ip = getIp(req);
  const user = await getCurrentUser();

  // ── Anónimo: prueba gratis limitada por IP (motor gratis, sin créditos) ──
  if (!user) {
    if (quality !== "draft" && quality !== "standard") quality = "standard";
    const rl = await rateLimit(`gen:ip:${ip}`, env.FREE_ANON_DAILY_CAP, 24 * 3600);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Has agotado tus pruebas gratis. Crea una cuenta gratuita para seguir.", needAuth: true, remaining: 0 },
        { status: 429 },
      );
    }
    const { pollinationsModel } = resolveGen("FREE", quality);
    const finalPrompt = enhance ? await enhancePrompt(prompt, "free") : prompt.trim();
    try {
      const result = await getImageEngine("free").generate({
        prompt: finalPrompt, width: dims.width, height: dims.height, count: 1, quality, model: pollinationsModel,
      });
      await bumpDailyCounter("pollinations");
      return NextResponse.json({ images: result.images, finalPrompt, remaining: rl.remaining, anon: true });
    } catch {
      return NextResponse.json({ error: "No se pudo generar. Inténtalo de nuevo." }, { status: 502 });
    }
  }

  // ── Usuario registrado ──
  if (!user.emailVerified) {
    return NextResponse.json({ error: "Verifica tu correo para empezar a generar.", needVerify: true }, { status: 403 });
  }

  const plan = user.plan;
  const planCfg = PLANS[plan];
  if (!planCfg.qualities.includes(quality)) quality = planCfg.defaultQuality;
  const resolved = resolveGen(plan, quality);

  // Tope diario de ráfaga (protección Pollinations) — solo plan FREE.
  if (plan === "FREE") {
    const cap = await rateLimit(`gen:u:${user.id}`, env.FREE_DAILY_CAP, 24 * 3600);
    if (!cap.ok) {
      return NextResponse.json({ error: "Has alcanzado el máximo diario de tu plan. Sube de plan para más.", remaining: 0 }, { status: 429 });
    }
  }

  // Débito ATÓMICO antes de generar (nunca genera sin saldo).
  const debit = await debitCredits(user.id, resolved.credits, `gen:${quality}`);
  if (!debit.ok) {
    return NextResponse.json({ error: "No te quedan créditos suficientes.", needCredits: true, balance: debit.balance }, { status: 402 });
  }

  const finalPrompt = enhance ? await enhancePrompt(prompt, planCfg.enhancer) : prompt.trim();
  try {
    const result = await getImageEngine(resolved.engine).generate({
      prompt: finalPrompt, width: dims.width, height: dims.height, count: 1, quality, model: resolved.pollinationsModel,
    });
    if (resolved.engine === "free") await bumpDailyCounter("pollinations");
    // Persistencia best-effort (historial/galería).
    prisma.generation
      .create({
        data: {
          userId: user.id, promptOriginal: prompt, promptFinal: finalPrompt,
          engine: result.engine, model: result.model, plan, quality,
          width: dims.width, height: dims.height, count: 1,
          creditCost: resolved.credits, status: "DONE", images: result.images, ip,
        },
      })
      .catch(() => {});
    return NextResponse.json({ images: result.images, finalPrompt, cost: resolved.credits, credits: debit.balance });
  } catch {
    // Nunca cobrar un fallo: reembolso compensatorio.
    await refundCredits(user.id, resolved.credits, "refund: fallo de generación");
    return NextResponse.json({ error: "No se pudo generar (créditos reembolsados). Inténtalo de nuevo." }, { status: 502 });
  }
}
