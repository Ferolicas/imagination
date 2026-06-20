import Link from "next/link";
import type { Metadata } from "next";
import { PLANS, QUALITIES } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Planes y precios",
  description: "Free, Basic, Pro y Premium. Empieza gratis y sube cuando quieras más calidad y créditos.",
};

export default function PreciosPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-10 flex items-center justify-between">
        <Link href="/" className="font-display text-xl font-bold tracking-tight">
          <span className="bg-gradient-to-br from-rose-400 to-fuchsia-500 bg-clip-text text-transparent">
            Imagination
          </span>
        </Link>
        <Link href="/crear" className="cursor-pointer rounded-full bg-gradient-to-br from-rose-500 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white transition-[filter] hover:brightness-110">
          Crear gratis
        </Link>
      </header>

      <h1 className="text-center font-display text-4xl font-bold tracking-tight sm:text-5xl">
        Elige tu plan
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-center text-white/55">
        El mejorador de prompt está en todos los planes. Los créditos mensuales no se acumulan al mes siguiente.
      </p>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.values(PLANS).map((p) => (
          <div
            key={p.id}
            className={`flex flex-col rounded-3xl border p-6 ${
              p.id === "PRO" ? "border-rose-400/60 bg-rose-500/5 shadow-xl shadow-rose-900/20" : "border-[var(--border)] bg-[var(--card)]/50"
            }`}
          >
            {p.id === "PRO" && (
              <span className="mb-3 inline-block w-fit rounded-full bg-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-300">
                Más popular
              </span>
            )}
            <h2 className="font-display text-2xl font-bold">{p.label}</h2>
            <div className="mt-2">
              <span className="font-display text-4xl font-bold">
                {p.priceEur === 0 ? "Gratis" : `${p.priceEur}€`}
              </span>
              {p.priceEur > 0 && <span className="text-sm text-white/50">/mes</span>}
            </div>
            <ul className="mt-6 flex-1 space-y-2.5 text-sm text-white/70">
              <li>✦ {p.monthlyCredits > 0 ? `${p.monthlyCredits} créditos al mes` : "Créditos de bienvenida"}</li>
              <li>✦ Calidad: {p.qualities.map((q) => QUALITIES[q].label).join(" · ")}</li>
              <li>✦ Hasta {p.maxBatch} {p.maxBatch === 1 ? "imagen" : "imágenes"} por generación</li>
              <li>✦ Prompt enhancer {p.enhancer === "paid" ? "premium" : "incluido"}</li>
              <li>{p.video ? "✦ Vídeo con IA (próximamente)" : "— Sin vídeo"}</li>
            </ul>
            {p.id === "FREE" ? (
              <Link href="/crear" className="mt-6 cursor-pointer rounded-xl border border-white/15 px-4 py-3 text-center text-sm font-semibold text-white/80 transition-colors hover:border-white/30">
                Empezar gratis
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="mt-6 cursor-not-allowed rounded-xl bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white/40"
              >
                Disponible pronto
              </button>
            )}
          </div>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-white/35">
        Los pagos se activarán muy pronto. Mientras tanto, disfruta del plan gratuito.
      </p>
    </div>
  );
}
