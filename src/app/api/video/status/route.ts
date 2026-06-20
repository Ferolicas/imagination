import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { pollKlingVideo } from "@/lib/engines/kling";
import { saveImageBytes } from "@/lib/storage";
import { refundCredits } from "@/lib/credits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  const user = await getCurrentUser();
  if (!user || !id) return NextResponse.json({ status: "error" }, { status: 400 });

  const gen = await prisma.generation.findUnique({ where: { id } });
  if (!gen || gen.userId !== user.id) return NextResponse.json({ status: "error" }, { status: 404 });

  if (gen.status === "DONE") return NextResponse.json({ status: "done", url: gen.images[0] });
  if (gen.status === "ERROR") return NextResponse.json({ status: "error", error: gen.error });
  if (!gen.jobId) return NextResponse.json({ status: "running" });

  const p = await pollKlingVideo(gen.jobId);

  if (p.status === "done" && p.url) {
    let stored = p.url;
    try {
      const r = await fetch(p.url);
      const buf = new Uint8Array(await r.arrayBuffer());
      stored = await saveImageBytes(buf, "mp4");
    } catch {
      /* si falla el guardado, dejamos la URL de Kling */
    }
    await prisma.generation.update({ where: { id: gen.id }, data: { status: "DONE", images: [stored], finishedAt: new Date() } });
    return NextResponse.json({ status: "done", url: stored });
  }

  if (p.status === "error") {
    await prisma.generation.update({ where: { id: gen.id }, data: { status: "ERROR", error: p.error } });
    await refundCredits(user.id, gen.creditCost, "refund: vídeo fallido");
    return NextResponse.json({ status: "error", error: p.error || "El vídeo falló (créditos reembolsados)." });
  }

  return NextResponse.json({ status: "running" });
}
