import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/db";
import { redis } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const u = await getCurrentUser();
  if (!isAdmin(u)) return NextResponse.json({ error: "no autorizado" }, { status: 403 });

  const since = new Date();
  since.setHours(0, 0, 0, 0);

  const [users, gensToday, gensTotal, paid] = await Promise.all([
    prisma.user.count(),
    prisma.generation.count({ where: { createdAt: { gte: since } } }),
    prisma.generation.count(),
    prisma.user.count({ where: { plan: { not: "FREE" } } }),
  ]);

  let pollToday = 0;
  if (redis) {
    const day = new Date().toISOString().slice(0, 10);
    pollToday = Number(await redis.get(`count:pollinations:${day}`)) || 0;
  }

  return NextResponse.json({ users, gensToday, gensTotal, paid, pollToday });
}
