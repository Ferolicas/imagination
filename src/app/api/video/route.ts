import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { PLANS, VIDEO_OPTIONS } from "@/lib/plans";
import { getVideoEngine } from "@/lib/engines/video";
import { enhancePrompt } from "@/lib/engines";
import { hintsForStyles } from "@/lib/styles";
import { debitCredits, refundCredits } from "@/lib/credits";
import { killSwitchOn } from "@/lib/ratelimit";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  prompt: z.string().min(2).max(1000),
  option: z.string(),
  styles: z.array(z.string()).max(8).default([]),
});

export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Crea una cuenta para generar vídeo.", needAuth: true }, { status: 401 });
  if (!user.emailVerified) return NextResponse.json({ error: "Verifica tu correo.", needVerify: true }, { status: 403 });

  if (!PLANS[user.plan].video) {
    return NextResponse.json({ error: "El vídeo está en los planes Pro y Premium.", needPlan: true }, { status: 402 });
  }

  const opt = VIDEO_OPTIONS.find((o) => o.key === parsed.data.option);
  if (!opt) return NextResponse.json({ error: "Opción de vídeo no válida." }, { status: 400 });

  if (await killSwitchOn()) return NextResponse.json({ error: "Generación pausada temporalmente." }, { status: 503 });

  const engine = getVideoEngine();
  if (!engine) {
    return NextResponse.json({ error: "El vídeo se está activando — disponible muy pronto.", comingSoon: true }, { status: 501 });
  }

  const debit = await debitCredits(user.id, opt.credits, `video:${opt.key}`);
  if (!debit.ok) return NextResponse.json({ error: "No te quedan créditos suficientes.", needCredits: true }, { status: 402 });

  const finalPrompt = await enhancePrompt(parsed.data.prompt, "paid", hintsForStyles(parsed.data.styles));
  try {
    const result = await engine.generate({ prompt: finalPrompt, durationSec: opt.durationSec, width: 1280, height: 720 });
    prisma.generation
      .create({ data: { userId: user.id, promptOriginal: parsed.data.prompt, promptFinal: finalPrompt, engine: result.engine, plan: user.plan, quality: "premium", width: 1280, height: 720, count: 1, creditCost: opt.credits, status: "DONE", images: result.videos } })
      .catch(() => {});
    return NextResponse.json({ videos: result.videos, finalPrompt, cost: opt.credits, credits: debit.balance });
  } catch {
    await refundCredits(user.id, opt.credits, "refund: fallo vídeo");
    return NextResponse.json({ error: "No se pudo generar el vídeo (créditos reembolsados)." }, { status: 502 });
  }
}
