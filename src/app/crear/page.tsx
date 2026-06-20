"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { STYLES } from "@/lib/styles";

type SizeKey = "square" | "portrait" | "landscape";
type Shot = { url: string; prompt: string };

const SIZES: { key: SizeKey; label: string }[] = [
  { key: "square", label: "Cuadrada" },
  { key: "portrait", label: "Retrato" },
  { key: "landscape", label: "Paisaje" },
];

const PRO_TIERS = [
  { key: "img1", label: "Imagen 1" },
  { key: "img15", label: "Imagen 1.5" },
  { key: "img2", label: "Imagen 2" },
];

function Ic({ d, c = "h-5 w-5", fill = "none" }: { d: string; c?: string; fill?: string }) {
  return (
    <svg className={c} viewBox="0 0 24 24" fill={fill} stroke={fill === "none" ? "currentColor" : "none"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
function Spinner({ c = "h-5 w-5" }: { c?: string }) {
  return (
    <svg className={`${c} animate-spin`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-90" d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
const SPARK = "m12 3 1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3z";

export default function CrearPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [styles, setStyles] = useState<string[]>([]);
  const [size, setSize] = useState<SizeKey>("square");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [me, setMe] = useState<{ email: string; credits: number; verified: boolean; plan: string } | null>(null);
  const [shots, setShots] = useState<Shot[]>([]);
  const [lb, setLb] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/me").then((r) => r.json()).then((d) => setMe(d.user)).catch(() => {});
    fetch("/api/history")
      .then((r) => r.json())
      .then((d: { items?: { images: string[]; promptOriginal: string }[] }) => {
        const list = (d.items || []).flatMap((it) => it.images.map((url) => ({ url, prompt: it.promptOriginal })));
        setShots(list);
      })
      .catch(() => {});
  }, []);

  function toggleStyle(k: string) {
    setStyles((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));
  }

  async function generate() {
    if (prompt.trim().length < 2) {
      setError("Escribe una idea primero.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, size, quality: "standard", styles }),
      });
      const data = await r.json();
      if (!r.ok) {
        if (data.needAuth) {
          router.push("/registro");
          return;
        }
        setError(data.error || "Error al generar.");
        return;
      }
      const url = data.images?.[0] as string | undefined;
      if (url) {
        setShots((prev) => [{ url, prompt: data.finalPrompt || prompt }, ...prev]);
        setLb(0);
      }
      if (typeof data.credits === "number") setMe((m) => (m ? { ...m, credits: data.credits } : m));
    } catch {
      setError("Error de red. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const navLb = useCallback(
    (dir: number) => {
      setLb((i) => {
        if (i === null) return i;
        const n = i + dir;
        return n < 0 || n >= shots.length ? i : n;
      });
    },
    [shots.length],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (lb === null) return;
      if (e.key === "Escape") setLb(null);
      else if (e.key === "ArrowLeft") navLb(-1);
      else if (e.key === "ArrowRight") navLb(1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lb, navLb]);

  function fullscreen() {
    const el = document.getElementById("lb-img");
    if (el?.requestFullscreen) el.requestFullscreen();
  }

  const recent = shots.slice(0, 5);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-10">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between">
        <Link href="/" className="font-display text-xl font-bold tracking-tight">
          <span className="bg-gradient-to-br from-rose-400 to-fuchsia-500 bg-clip-text text-transparent">Imagination</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/galeria" className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-white/80 transition-colors hover:border-rose-400/60 hover:text-white">
            Galería
          </Link>
          {me ? (
            <Link href="/cuenta" className="rounded-full border border-rose-400/40 bg-rose-500/10 px-3 py-1.5 text-sm font-semibold text-rose-200 transition-colors hover:border-rose-400">
              {me.credits} créditos
            </Link>
          ) : (
            <Link href="/registro" className="rounded-full bg-gradient-to-br from-rose-500 to-fuchsia-600 px-4 py-1.5 text-sm font-semibold text-white">
              Crear cuenta
            </Link>
          )}
        </div>
      </header>

      {/* Input */}
      <div className="rounded-[28px] border border-[var(--border)] bg-gradient-to-b from-[var(--card-2)] to-[var(--card)] p-5 shadow-2xl shadow-black/50">
        <div className="rounded-3xl border border-white/10 bg-[var(--background)]/60 p-1 focus-within:border-rose-400/70 transition-colors">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe lo que imaginas… un retrato, un paisaje, un producto. La IA lo perfecciona por ti."
            className="min-h-28 w-full resize-none rounded-3xl bg-transparent p-4 text-lg outline-none placeholder:text-white/30"
          />
        </div>

        {/* Estilos */}
        <div className="mt-4 flex flex-wrap gap-2">
          {STYLES.map((s) => {
            const on = styles.includes(s.key);
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => toggleStyle(s.key)}
                className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  on ? "border-rose-400 bg-rose-500/20 text-white" : "border-[var(--border)] bg-[var(--background)]/40 text-white/65 hover:border-white/30"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Formato */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {SIZES.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setSize(s.key)}
              className={`cursor-pointer rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                size === s.key ? "border-rose-400 bg-rose-500/15 text-white" : "border-[var(--border)] bg-[var(--background)]/40 text-white/70 hover:border-white/30"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Calidad */}
        <div className="mt-4">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/45">Calidad</span>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-xl border border-rose-400 bg-rose-500/15 px-3.5 py-2 text-sm font-medium text-white">Normal</span>
            {PRO_TIERS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => router.push("/precios")}
                className="group flex cursor-pointer items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)]/40 px-3.5 py-2 text-sm font-medium text-white/70 transition-colors hover:border-amber-300/60"
              >
                {t.label}
                <span className="pro-shine rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">Pro</span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 to-fuchsia-600 px-5 py-4 font-display text-lg font-semibold text-white shadow-lg shadow-rose-900/40 transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Spinner /> : <Ic d={SPARK} />}
          {loading ? "Creando tu imagen…" : "Generar imagen"}
        </button>
        {error && <p className="mt-3 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
      </div>

      {/* Mosaico últimas 5 */}
      {recent.length > 0 && (
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-white/70">Tus últimas creaciones</span>
            <Link href="/galeria" className="text-sm text-rose-400 hover:underline">Ver galería →</Link>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {recent.map((s, i) => (
              <button key={s.url + i} type="button" onClick={() => setLb(i)} className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl border border-[var(--border)] bg-black/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.url} alt={s.prompt} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modal de resultado */}
      {lb !== null && shots[lb] && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur">
          <div className="flex justify-end gap-2 p-3">
            <button type="button" onClick={fullscreen} aria-label="Pantalla completa" className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20">
              <Ic d="M8 3H5a2 2 0 0 0-2 2v3 M21 8V5a2 2 0 0 0-2-2h-3 M3 16v3a2 2 0 0 0 2 2h3 M16 21h3a2 2 0 0 0 2-2v-3" />
            </button>
            <a href={shots[lb].url} download target="_blank" rel="noreferrer" aria-label="Descargar" className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20">
              <Ic d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3" />
            </a>
            <button type="button" onClick={() => setLb(null)} aria-label="Cerrar" className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20">
              <Ic d="M18 6 6 18M6 6l12 12" />
            </button>
          </div>
          <div className="relative flex flex-1 items-center justify-center overflow-hidden p-3">
            {lb > 0 && (
              <button type="button" onClick={() => navLb(-1)} aria-label="Anterior" className="absolute left-3 flex h-14 w-12 cursor-pointer items-center justify-center rounded-xl bg-black/50 text-white hover:bg-black/70">
                <Ic d="m15 18-6-6 6-6" c="h-7 w-7" />
              </button>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img id="lb-img" src={shots[lb].url} alt={shots[lb].prompt} className="max-h-full max-w-full rounded-xl object-contain" />
            {lb < shots.length - 1 && (
              <button type="button" onClick={() => navLb(1)} aria-label="Siguiente" className="absolute right-3 flex h-14 w-12 cursor-pointer items-center justify-center rounded-xl bg-black/50 text-white hover:bg-black/70">
                <Ic d="m9 18 6-6-6-6" c="h-7 w-7" />
              </button>
            )}
          </div>
          <div className="px-4 pb-4 text-center text-xs text-white/40">{lb + 1} / {shots.length}</div>
        </div>
      )}
    </div>
  );
}
