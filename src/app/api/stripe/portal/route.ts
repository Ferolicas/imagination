import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/auth/session";
import { env } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  if (!stripe) return NextResponse.json({ error: "Pagos no disponibles." }, { status: 503 });
  const user = await getCurrentUser();
  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: "No tienes suscripción todavía." }, { status: 400 });
  }
  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${env.APP_URL}/cuenta`,
  });
  return NextResponse.json({ url: session.url });
}
