import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { stripe, PLAN_PRICE } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  plan: z.enum(["BASIC", "PRO", "PREMIUM"]).optional(),
  pack: z.enum(["S", "M", "L"]).optional(),
});

const PACKS: Record<string, string | undefined> = {
  S: process.env.STRIPE_PRICE_TOPUP_S,
  M: process.env.STRIPE_PRICE_TOPUP_M,
  L: process.env.STRIPE_PRICE_TOPUP_L,
};

export async function POST(req: NextRequest) {
  if (!stripe) return NextResponse.json({ error: "Pagos no disponibles todavía." }, { status: 503 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });

  const user = await getCurrentUser();
  const cancel_url = `${env.APP_URL}/precios?pago=cancel`;

  // ── Packs de créditos: requieren cuenta ──
  if (parsed.data.pack) {
    if (!user) return NextResponse.json({ error: "Inicia sesión para comprar créditos.", needAuth: true }, { status: 401 });
    const price = PACKS[parsed.data.pack];
    if (!price) return NextResponse.json({ error: "Pack no configurado." }, { status: 400 });
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const c = await stripe.customers.create({ email: user.email, metadata: { userId: user.id } });
      customerId = c.id;
      await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
    }
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      line_items: [{ price, quantity: 1 }],
      success_url: `${env.APP_URL}/cuenta?pago=ok`,
      cancel_url,
      metadata: { userId: user.id, kind: "topup", priceId: price },
    });
    return NextResponse.json({ url: session.url });
  }

  // ── Suscripción: PAGO PRIMERO (no requiere cuenta; se crea al pagar) ──
  if (parsed.data.plan) {
    const price = PLAN_PRICE[parsed.data.plan];
    if (!price) return NextResponse.json({ error: "Ese plan aún no está configurado." }, { status: 400 });
    const success_url = `${env.APP_URL}/api/auth/post-checkout?session_id={CHECKOUT_SESSION_ID}`;

    if (user) {
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const c = await stripe.customers.create({ email: user.email, metadata: { userId: user.id } });
        customerId = c.id;
        await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
      }
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        line_items: [{ price, quantity: 1 }],
        success_url,
        cancel_url,
        allow_promotion_codes: true,
        metadata: { userId: user.id, kind: "subscription", plan: parsed.data.plan },
      });
      return NextResponse.json({ url: session.url });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity: 1 }],
      success_url,
      cancel_url,
      allow_promotion_codes: true,
      metadata: { kind: "subscription", plan: parsed.data.plan },
    });
    return NextResponse.json({ url: session.url });
  }

  return NextResponse.json({ error: "Falta el plan o el pack." }, { status: 400 });
}
