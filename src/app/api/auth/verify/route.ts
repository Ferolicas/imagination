import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { grantWelcomeCredits } from "@/lib/credits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.redirect(`${env.APP_URL}/entrar?error=token`);

  const vt = await prisma.verificationToken.findUnique({ where: { token } });
  if (!vt || vt.expires < new Date()) {
    return NextResponse.redirect(`${env.APP_URL}/entrar?error=expirado`);
  }

  const user = await prisma.user.update({
    where: { email: vt.identifier },
    data: { emailVerified: new Date() },
  });
  await prisma.verificationToken.delete({ where: { token } }).catch(() => {});

  // Créditos de bienvenida (una sola vez) al verificar.
  await grantWelcomeCredits(user.id, env.FREE_WELCOME_CREDITS);

  return NextResponse.redirect(`${env.APP_URL}/crear?verificado=1`);
}
