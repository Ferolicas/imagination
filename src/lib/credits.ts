import { prisma } from "./db";

export interface DebitResult {
  ok: boolean;
  balance: number;
}

// Débito ATÓMICO: bloquea la fila del usuario, consume primero del bucket mensual y luego del de top-up.
// Nunca cobra si no hay saldo suficiente. Registra la transacción en el ledger.
export async function debitCredits(
  userId: string,
  amount: number,
  reason: string,
  generationId?: string,
): Promise<DebitResult> {
  if (amount <= 0) return { ok: true, balance: -1 };
  return prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<
      { creditsMonthly: number; creditsTopup: number }[]
    >`SELECT "creditsMonthly", "creditsTopup" FROM "User" WHERE id = ${userId} FOR UPDATE`;
    if (!rows.length) return { ok: false, balance: 0 };

    let { creditsMonthly, creditsTopup } = rows[0];
    const total = creditsMonthly + creditsTopup;
    if (total < amount) return { ok: false, balance: total };

    let rem = amount;
    const fromMonthly = Math.min(creditsMonthly, rem);
    creditsMonthly -= fromMonthly;
    rem -= fromMonthly;
    creditsTopup -= rem;

    await tx.user.update({
      where: { id: userId },
      data: { creditsMonthly, creditsTopup },
    });
    await tx.creditTx.create({
      data: {
        userId,
        amount: -amount,
        type: "CONSUME",
        reason,
        generationId,
        balanceAfter: creditsMonthly + creditsTopup,
      },
    });
    return { ok: true, balance: creditsMonthly + creditsTopup };
  });
}

// Reembolso (p.ej. si la generación falla tras cobrar). Va al bucket de top-up (persistente).
export async function refundCredits(
  userId: string,
  amount: number,
  reason: string,
  generationId?: string,
): Promise<void> {
  if (amount <= 0) return;
  await prisma.$transaction(async (tx) => {
    const u = await tx.user.update({
      where: { id: userId },
      data: { creditsTopup: { increment: amount } },
    });
    await tx.creditTx.create({
      data: {
        userId,
        amount,
        type: "REFUND",
        bucket: "TOPUP",
        reason,
        generationId,
        balanceAfter: u.creditsMonthly + u.creditsTopup,
      },
    });
  });
}

// Créditos de bienvenida — UNA sola vez por usuario (flag welcomeGranted).
export async function grantWelcomeCredits(userId: string, amount: number): Promise<void> {
  if (amount <= 0) return;
  await prisma.$transaction(async (tx) => {
    const u = await tx.user.findUnique({
      where: { id: userId },
      select: { welcomeGranted: true },
    });
    if (!u || u.welcomeGranted) return;
    const updated = await tx.user.update({
      where: { id: userId },
      data: { creditsTopup: { increment: amount }, welcomeGranted: true },
    });
    await tx.creditTx.create({
      data: {
        userId,
        amount,
        type: "WELCOME",
        bucket: "TOPUP",
        reason: "Créditos de bienvenida",
        balanceAfter: updated.creditsMonthly + updated.creditsTopup,
      },
    });
  });
}
