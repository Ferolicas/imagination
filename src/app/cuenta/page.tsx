import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { PLANS } from "@/lib/plans";
import LogoutButton from "./logout-button";

export const dynamic = "force-dynamic";

export default async function Cuenta() {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");

  const plan = PLANS[user.plan];
  const credits = user.creditsMonthly + user.creditsTopup;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <Link href="/crear" className="font-display text-xl font-bold tracking-tight">
          <span className="bg-gradient-to-br from-rose-400 to-fuchsia-500 bg-clip-text text-transparent">Imagination</span>
        </Link>
        <LogoutButton />
      </header>

      <h1 className="font-display text-3xl font-bold tracking-tight">Tu cuenta</h1>
      <p className="mt-1 text-white/55">{user.email}</p>
      {!user.emailVerified && (
        <p className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Tu correo aún no está verificado. Revisa tu bandeja para activar todos los créditos.
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)]/60 p-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Plan actual</div>
          <div className="mt-1 font-display text-2xl font-bold">{plan.label}</div>
          <Link href="/precios" className="mt-3 inline-block text-sm text-rose-400 hover:underline">
            {user.plan === "FREE" ? "Mejorar plan →" : "Cambiar de plan →"}
          </Link>
        </div>
        <div className="rounded-3xl border border-rose-400/40 bg-rose-500/5 p-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-white/50">Créditos</div>
          <div className="mt-1 font-display text-2xl font-bold text-rose-200">{credits}</div>
          <div className="mt-1 text-xs text-white/40">
            {user.creditsMonthly} mensuales · {user.creditsTopup} comprados
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Link href="/crear" className="cursor-pointer rounded-xl bg-gradient-to-br from-rose-500 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white transition-[filter] hover:brightness-110">
          Crear imágenes
        </Link>
        <Link href="/galeria" className="cursor-pointer rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-medium text-white/80 transition-colors hover:border-white/30">
          Mi galería
        </Link>
      </div>
    </div>
  );
}
