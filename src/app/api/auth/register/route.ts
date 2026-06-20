import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { isDisposableEmail, hasValidMx, ipAccountAllowed } from "@/lib/auth/signup-guard";
import { sendEmail, verifyEmailHtml } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  email: z.string().email().max(200),
  password: z.string().min(8).max(100),
  name: z.string().max(80).optional(),
});

function getIp(req: NextRequest): string {
  const x = req.headers.get("x-forwarded-for");
  return (x ? x.split(",")[0] : "").trim() || "0.0.0.0";
}

export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Email o contraseña no válidos (mínimo 8 caracteres)." }, { status: 400 });
  }
  const email = parsed.data.email.toLowerCase();
  const { password, name } = parsed.data;

  if (isDisposableEmail(email)) {
    return NextResponse.json({ error: "Usa un correo real, no uno temporal/desechable." }, { status: 400 });
  }
  if (!(await hasValidMx(email))) {
    return NextResponse.json({ error: "Ese dominio de correo no existe o no puede recibir email." }, { status: 400 });
  }

  const ip = getIp(req);
  if (!(await ipAccountAllowed(ip, env.MAX_FREE_ACCOUNTS_PER_IP))) {
    return NextResponse.json({ error: "Demasiadas cuentas creadas desde esta red. Inténtalo más tarde." }, { status: 429 });
  }

  if (await prisma.user.findUnique({ where: { email } })) {
    return NextResponse.json({ error: "Ya existe una cuenta con ese correo." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { email, passwordHash, name, signupIp: ip } });

  const token = nanoid(40);
  await prisma.verificationToken.create({
    data: { identifier: email, token, expires: new Date(Date.now() + 24 * 3600 * 1000) },
  });
  const link = `${env.APP_URL}/api/auth/verify?token=${token}`;
  const sent = await sendEmail(email, "Confirma tu correo · Imagination", verifyEmailHtml(link));

  await createSession(user.id);

  // Si aún no hay Resend configurado, devolvemos el link para poder verificar (modo provisional).
  return NextResponse.json({ ok: true, emailSent: sent, verifyLink: sent ? undefined : link });
}
