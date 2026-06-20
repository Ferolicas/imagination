import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const u = await getCurrentUser();
  if (!u) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: {
      email: u.email,
      name: u.name,
      plan: u.plan,
      verified: Boolean(u.emailVerified),
      credits: u.creditsMonthly + u.creditsTopup,
    },
  });
}
