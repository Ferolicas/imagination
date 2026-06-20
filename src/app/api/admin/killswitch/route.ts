import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { isAdmin } from "@/lib/auth/admin";
import { redis } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const u = await getCurrentUser();
  if (!isAdmin(u)) return NextResponse.json({ error: "no autorizado" }, { status: 403 });
  const on =
    process.env.KILL_SWITCH === "on" || (redis ? (await redis.get("killswitch")) === "on" : false);
  return NextResponse.json({ on });
}

export async function POST(req: NextRequest) {
  const u = await getCurrentUser();
  if (!isAdmin(u)) return NextResponse.json({ error: "no autorizado" }, { status: 403 });
  if (!redis) return NextResponse.json({ error: "Redis no disponible" }, { status: 503 });
  const body = await req.json().catch(() => ({}));
  const on = Boolean(body.on);
  if (on) await redis.set("killswitch", "on");
  else await redis.del("killswitch");
  return NextResponse.json({ on });
}
