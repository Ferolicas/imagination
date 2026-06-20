import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { PLANS, VIDEO_OPTIONS } from "@/lib/plans";
import { enhancePrompt } from "@/lib/engines";
import { hintsForStyles } from "@/lib/styles";
import { debitCredits, refundCredits } from "@/lib/credits";
import { killSwitchOn } from "@/lib/ratelimit";
import { prisma } from "@/lib/db";
import { submitKlingVideo } from "@/lib/engines/kling";

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
  if (!PLANS[user.plan].video) return NextResponse.json({ error: "El vídeo está en los planes Pro y Premium.", needPlan: true }, { status: 402 });

  const opt = VIDEO_OPTIONS.find((o) => o.key === parsed.data.option);
  if (!opt) return NextResponse.json({ error: "Opción de vídeo no válida." }, { status: 400 });
  if (await killSwitchOn()) return NextResponse.json({ error: "Generación pausada temporalmente." }, { status: 503 });

  // Veo 4K aún sin proveedor conectado.
  if (opt.provider === "veo") {
    return NextResponse.json({ error: "Veo 4K se está activando — disponible muy pronto.", comingSoon: true }, { status: 501 });
  }

  // Débito antes de enviar; si el envío falla, se reembolsa.
  const debit = await debitCredits(user.id, opt.credits, `video:${opt.key}`);
  if (!debit.ok) return NextResponse.json({ error: "No te quedan créditos suficientes.", needCredits: true }, { status: 402 });

  const finalPrompt = await enhancePrompt(parsed.data.prompt, "paid", hintsForStyles(parsed.data.styles));
  const sub = await submitKlingVideo({ prompt: finalPrompt, durationSec: opt.durationSec });
  if (!sub.taskId) {
    await refundCredits(user.id, opt.credits, "refund: no se pudo iniciar el vídeo");
    return NextResponse.json({ error: sub.error || "No se pudo iniciar el vídeo (créditos reembolsados)." }, { status: 502 });
  }

  const gen = await prisma.generation.create({
    data: {
      userId: user.id, promptOriginal: parsed.data.prompt, promptFinal: finalPrompt,
      engine: "kling", plan: user.plan, quality: "premium", width: 1280, height: 720,
      count: 1, creditCost: opt.credits, status: "RUNNING", images: [], jobId: sub.taskId,
    },
  });

  return NextResponse.json({ generationId: gen.id, status: "running", credits: debit.balance });
}
