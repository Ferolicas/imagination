import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, planForPrice, TOPUP_CREDITS } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { PLANS } from "@/lib/plans";
import type { Plan, SubStatus } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function mapStatus(s: string): SubStatus {
  switch (s) {
    case "active": return "ACTIVE";
    case "trialing": return "TRIALING";
    case "past_due": return "PAST_DUE";
    case "canceled": return "CANCELED";
    default: return "INCOMPLETE";
  }
}

async function applyPlan(customerId: string, plan: Plan, sub: Stripe.Subscription) {
  const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
  if (!user) return;
  const priceId = sub.items.data[0]?.price.id;
  // creditsMonthly se SETEA (no se suma) → reset no-acumulable e idempotente.
  await prisma.user.update({
    where: { id: user.id },
    data: { plan, creditsMonthly: PLANS[plan].monthlyCredits },
  });
  await prisma.subscription.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id, stripeSubscriptionId: sub.id, stripePriceId: priceId, plan,
      status: mapStatus(sub.status), cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
    update: {
      stripeSubscriptionId: sub.id, stripePriceId: priceId, plan,
      status: mapStatus(sub.status), cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
  });
}

async function downgrade(customerId: string) {
  const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });
  if (!user) return;
  await prisma.user.update({ where: { id: user.id }, data: { plan: "FREE", creditsMonthly: 0 } });
  await prisma.subscription.updateMany({ where: { userId: user.id }, data: { status: "CANCELED" } });
}

export async function POST(req: NextRequest) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe no configurado." }, { status: 503 });
  }
  const sig = req.headers.get("stripe-signature") || "";
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Firma inválida." }, { status: 400 });
  }

  // Idempotencia: si ya procesamos este evento, salimos.
  try {
    await prisma.webhookEvent.create({ data: { id: event.id, type: event.type } });
  } catch {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const priceId = sub.items.data[0]?.price.id;
        const plan = priceId ? planForPrice(priceId) : null;
        if (plan && (sub.status === "active" || sub.status === "trialing")) {
          await applyPlan(sub.customer as string, plan, sub);
        } else if (sub.status === "canceled" || sub.status === "unpaid") {
          await downgrade(sub.customer as string);
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await downgrade(sub.customer as string);
        break;
      }
      case "invoice.paid": {
        const inv = event.data.object as Stripe.Invoice;
        const user = await prisma.user.findFirst({ where: { stripeCustomerId: inv.customer as string } });
        if (user && user.plan !== "FREE") {
          await prisma.user.update({
            where: { id: user.id },
            data: { creditsMonthly: PLANS[user.plan].monthlyCredits },
          });
          await prisma.creditTx.create({
            data: { userId: user.id, amount: PLANS[user.plan].monthlyCredits, type: "MONTHLY_GRANT", bucket: "MONTHLY", reason: "Renovación mensual" },
          });
        }
        break;
      }
      case "checkout.session.completed": {
        const cs = event.data.object as Stripe.Checkout.Session;
        if (cs.metadata?.kind === "topup" && cs.metadata.priceId) {
          const credits = TOPUP_CREDITS[cs.metadata.priceId];
          const user = await prisma.user.findFirst({ where: { stripeCustomerId: cs.customer as string } });
          if (user && credits) {
            await prisma.user.update({ where: { id: user.id }, data: { creditsTopup: { increment: credits } } });
            await prisma.creditTx.create({
              data: { userId: user.id, amount: credits, type: "TOPUP", bucket: "TOPUP", reason: "Pack de créditos" },
            });
          }
        }
        break;
      }
    }
  } catch (e) {
    console.error("[stripe webhook]", (e as Error).message);
    return NextResponse.json({ error: "handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
