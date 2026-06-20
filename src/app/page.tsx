import Link from "next/link";
import { PLANS, QUALITIES } from "@/lib/plans";
import AuthCta from "@/components/auth-cta";

function Icon({ d, className = "h-6 w-6" }: { d: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

const STEPS = [
  {
    t: "Escribe una idea",
    d: "En lenguaje natural, sin tecnicismos. «Un gato astronauta».",
    d2: "M12 20h9 M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z",
  },
  {
    t: "La IA la mejora",
    d: "Convertimos tu frase en un prompt profesional automáticamente.",
    d2: "m12 3 1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3z",
  },
  {
    t: "Genera y descarga",
    d: "Tu imagen lista en segundos. Mejor calidad según tu plan.",
    d2: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  },
];

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-white/5 bg-[var(--background)]/70 backdrop-blur-lg">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <span className="font-display text-xl font-bold tracking-tight">
            <span className="bg-gradient-to-br from-rose-400 to-fuchsia-500 bg-clip-text text-transparent">
              Imagination
            </span>
          </span>
          <div className="flex items-center gap-2">
            <Link href="/precios" className="hidden rounded-full px-4 py-2 text-sm text-white/70 transition-colors hover:text-white sm:block">
              Planes
            </Link>
            <Link
              href="/crear"
              className="cursor-pointer rounded-full bg-gradient-to-br from-rose-500 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-900/30 transition-[filter] hover:brightness-110"
            >
              Crear gratis
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden px-4 py-20 text-center sm:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[520px] max-w-[1100px]"
            style={{ background: "radial-gradient(620px 320px at 50% 0, rgba(168,85,247,.20), transparent 70%)" }}
          />
          <div className="relative mx-auto max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-white/60">
              Generación de imágenes con IA
            </span>
            <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">
              De una idea simple a una{" "}
              <span className="bg-gradient-to-br from-rose-400 via-rose-500 to-fuchsia-500 bg-clip-text text-transparent">
                imagen profesional
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-white/60">
              Escribe lo que imaginas en una frase. La IA mejora tu prompt y genera
              la imagen. Empieza gratis, sin tarjeta.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <AuthCta label="Crear mi primera imagen" className="w-full sm:w-auto" />
              <Link
                href="/precios"
                className="w-full cursor-pointer rounded-2xl border border-white/15 px-7 py-4 text-center font-medium text-white/80 transition-colors hover:border-white/30 hover:text-white sm:w-auto"
              >
                Ver planes
              </Link>
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="mx-auto max-w-5xl px-4 py-16">
          <h2 className="text-center font-display text-3xl font-bold tracking-tight">Así de fácil</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.t} className="rounded-3xl border border-[var(--border)] bg-[var(--card)]/60 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400">
                  <Icon d={s.d2} className="h-5 w-5" />
                </div>
                <div className="mt-4 text-xs font-semibold text-rose-400/80">PASO {i + 1}</div>
                <h3 className="mt-1 font-display text-lg font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{s.d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Planes teaser */}
        <section id="planes" className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-center font-display text-3xl font-bold tracking-tight">Planes para cada nivel</h2>
          <p className="mt-3 text-center text-white/55">Empieza gratis. Sube de plan cuando quieras más calidad y créditos.</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.values(PLANS).map((p) => (
              <div
                key={p.id}
                className={`flex flex-col rounded-3xl border p-6 ${
                  p.id === "PRO" ? "border-rose-400/60 bg-rose-500/5" : "border-[var(--border)] bg-[var(--card)]/50"
                }`}
              >
                <h3 className="font-display text-xl font-bold">{p.label}</h3>
                <div className="mt-2">
                  <span className="font-display text-3xl font-bold">
                    {p.priceEur === 0 ? "Gratis" : `${p.priceEur}€`}
                  </span>
                  {p.priceEur > 0 && <span className="text-sm text-white/50">/mes</span>}
                </div>
                <ul className="mt-5 flex-1 space-y-2 text-sm text-white/65">
                  <li>{p.monthlyCredits > 0 ? `${p.monthlyCredits} créditos/mes` : "Créditos de bienvenida"}</li>
                  <li>Calidad: {p.qualities.map((q) => QUALITIES[q].label).join(", ")}</li>
                  <li>{p.video ? "Vídeo incluido" : "Solo imagen"}</li>
                </ul>
                <Link
                  href={p.id === "FREE" ? "/crear" : "/precios"}
                  className={`mt-6 cursor-pointer rounded-xl px-4 py-3 text-center text-sm font-semibold transition-[filter,colors] ${
                    p.id === "PRO"
                      ? "bg-gradient-to-br from-rose-500 to-fuchsia-600 text-white hover:brightness-110"
                      : "border border-white/15 text-white/80 hover:border-white/30"
                  }`}
                >
                  {p.id === "FREE" ? "Empezar" : "Elegir"}
                </Link>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 px-4 py-8 text-center text-sm text-white/40">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <Link href="/precios" className="hover:text-white/70">Planes</Link>
          <Link href="/legal/terminos" className="hover:text-white/70">Términos</Link>
          <Link href="/legal/privacidad" className="hover:text-white/70">Privacidad</Link>
          <Link href="/legal/cookies" className="hover:text-white/70">Cookies</Link>
        </div>
        <div className="mt-3">© {new Date().getFullYear()} Imagination · Generación de imágenes con IA</div>
      </footer>
    </>
  );
}
