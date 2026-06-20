import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { enhancePrompt, getImageEngine } from "@/lib/engines";
import { resolveGen } from "@/lib/plans";
import { killSwitchOn, rateLimit, bumpDailyCounter } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  prompt: z.string().min(2).max(1000),
  size: z.enum(["square", "portrait", "landscape"]).default("square"),
  quality: z.enum(["draft", "standard"]).default("standard"),
  enhance: z.boolean().default(true),
});

const SIZES = {
  square: { width: 1024, height: 1024 },
  portrait: { width: 832, height: 1216 },
  landscape: { width: 1216, height: 832 },
} as const;

function getIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  return (xff ? xff.split(",")[0] : "").trim() || "0.0.0.0";
}

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { prompt, size, quality, enhance } = parsed.data;

  if (await killSwitchOn()) {
    return NextResponse.json(
      { error: "La generación gratuita está pausada temporalmente. Vuelve en un rato." },
      { status: 503 },
    );
  }

  // Anti-abuso: tope diario por IP (tier gratuito / anónimo).
  const ip = getIp(req);
  const rl = await rateLimit(`gen:${ip}`, env.FREE_DAILY_CAP, 24 * 3600);
  if (!rl.ok) {
    return NextResponse.json(
      {
        error: `Has alcanzado el límite diario gratuito (${env.FREE_DAILY_CAP}). Crea una cuenta o vuelve mañana.`,
        remaining: 0,
      },
      { status: 429 },
    );
  }

  const { engine: engineKind, pollinationsModel } = resolveGen("FREE", quality);
  const dims = SIZES[size];
  const finalPrompt = enhance ? await enhancePrompt(prompt, "free") : prompt.trim();

  const engine = getImageEngine(engineKind);
  try {
    const result = await engine.generate({
      prompt: finalPrompt,
      width: dims.width,
      height: dims.height,
      count: 1,
      quality,
      model: pollinationsModel,
    });
    await bumpDailyCounter("pollinations");
    return NextResponse.json({
      images: result.images,
      engine: result.engine,
      finalPrompt,
      enhanced: enhance && finalPrompt !== prompt.trim(),
      remaining: rl.remaining,
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudo generar la imagen. Inténtalo de nuevo." },
      { status: 502 },
    );
  }
}
