import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth/session";
import { grantWelcomeCredits } from "@/lib/credits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const jar = await cookies();
  const saved = jar.get("g_state")?.value;
  const fail = () => NextResponse.redirect(`${env.APP_URL}/entrar?error=google`);

  if (!code || !state || !saved || state !== saved) return fail();
  jar.delete("g_state");

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return fail();

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${env.APP_URL}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });
    const token = await tokenRes.json();
    if (!token.access_token) return fail();

    const infoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    const info = await infoRes.json();
    const email = (info.email as string | undefined)?.toLowerCase();
    if (!email) return fail();

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email, name: info.name, image: info.picture, emailVerified: new Date() },
      });
      await grantWelcomeCredits(user.id, env.FREE_WELCOME_CREDITS);
    } else if (!user.emailVerified) {
      user = await prisma.user.update({ where: { id: user.id }, data: { emailVerified: new Date() } });
      await grantWelcomeCredits(user.id, env.FREE_WELCOME_CREDITS);
    }

    if (info.sub) {
      await prisma.account
        .upsert({
          where: { provider_providerAccountId: { provider: "google", providerAccountId: info.sub } },
          create: { userId: user.id, type: "oauth", provider: "google", providerAccountId: info.sub },
          update: {},
        })
        .catch(() => {});
    }

    await createSession(user.id);
    return NextResponse.redirect(`${env.APP_URL}/crear`);
  } catch {
    return fail();
  }
}
