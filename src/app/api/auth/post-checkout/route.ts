import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth/session";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Stripe redirige aquí tras pagar. Crea/encuentra la cuenta por el email del pago e inicia sesión.
export async function GET(req: NextRequest) {
  const sid = req.nextUrl.searchParams.get("session_id");
  if (!stripe || !sid) return NextResponse.redirect(`${env.APP_URL}/`);
  try {
    const cs = await stripe.checkout.sessions.retrieve(sid);
    const email = (cs.customer_details?.email || cs.customer_email || "").toLowerCase();
    const paid = cs.status === "complete" || cs.payment_status === "paid";
    if (email && paid) {
      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        const customerId = typeof cs.customer === "string" ? cs.customer : undefined;
        user = await prisma.user.create({ data: { email, emailVerified: new Date(), stripeCustomerId: customerId } });
      }
      await createSession(user.id);
      return NextResponse.redirect(`${env.APP_URL}/crear?bienvenido=1`);
    }
  } catch {
    /* noop */
  }
  return NextResponse.redirect(`${env.APP_URL}/entrar`);
}
