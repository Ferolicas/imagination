import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const u = await getCurrentUser();
  if (!u) return NextResponse.json({ items: [] });
  const items = await prisma.generation.findMany({
    where: { userId: u.id, status: "DONE" },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { id: true, images: true, promptOriginal: true, createdAt: true },
  });
  return NextResponse.json({ items });
}
