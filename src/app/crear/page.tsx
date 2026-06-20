"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type SizeKey = "square" | "portrait" | "landscape";
type Quality = "draft" | "standard";

const SIZES: { key: SizeKey; label: string; box: string }[] = [
  { key: "square", label: "Cuadrada", box: "aspect-square" },
  { key: "portrait", label: "Retrato", box: "aspect-[3/4]" },
  { key: "landscape", label: "Paisaje", box: "aspect-[4/3]" },
];

function Spinner() {
  return (
    <svg
      className="h-5 w-5 animate-spin text-current"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-90" d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function Sparkles({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m12 3 1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3z" />
    </svg>
  );
}

export default function CrearPage() {
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState<SizeKey>("square");
  const [quality, setQuality] = useState<Quality>("standard");
  const [enhance, setEnhance] = useState(true);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [imgReady, setImgReady] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState("");
  const [error, setError] = useState("");
  const [me, setMe] = useState<{ email: string; credits: number; verified: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => setMe(d.user))
      .catch(() => {});
  }, []);

  async function generate() {
    if (prompt.trim().length < 2) {
      setError("Escribe una idea primero.");
      return;
    }
    setLoading(true);
    setError("");
    setImage(null);
    setImgReady(false);
    setFinalPrompt("");
    try {
      const r = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, size, quality, enhance }),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data.error || "Error al generar.");
        return;
      }
      setImage(data.images?.[0] ?? null);
      setFinalPrompt(data.finalPrompt ?? "");
      if (typeof data.credits === "number") {
        setMe((m) => (m ? { ...m, credits: data.credits } : m));
      }
    } catch {
      setError("Error de red. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  const sizeBox = SIZES.find((s) => s.key === size)!.box;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-10">
      <header className="mb-6 flex items-center justify-between">
        <Link href="/" className="font-display text-xl font-bold tracking-tight">
          <span className="bg-gradient-to-br from-rose-400 to-fuchsia-500 bg-clip-text text-transparent">
            Imagination
          </span>
        </Link>
        {me ? (
          <Link
            href="/cuenta"
            className="cursor-pointer rounded-full border border-rose-400/40 bg-rose-500/10 px-3 py-1.5 text-sm font-semibold text-rose-200 transition-colors hover:border-rose-400"
          >
            {me.credits} créditos
          </Link>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/entrar" className="rounded-full px-3 py-1.5 text-sm text-white/70 transition-colors hover:text-white">
              Entrar
            </Link>
            <Link
              href="/registro"
              className="cursor-pointer rounded-full bg-gradient-to-br from-rose-500 to-fuchsia-600 px-4 py-1.5 text-sm font-semibold text-white transition-[filter] hover:brightness-110"
            >
              Crear cuenta
            </Link>
          </div>
        )}
      </header>

      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)]/70 p-4 shadow-2xl shadow-black/40 sm:p-6">
        <label htmlFor="prompt" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">
          Tu idea
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Un astronauta tomando café en Marte al amanecer…"
          className="min-h-24 w-full resize-y rounded-2xl border border-[var(--border)] bg-[var(--background)] p-4 text-base outline-none transition-colors placeholder:text-white/30 focus:border-rose-400"
        />

        <div className="mt-4">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/50">
            Formato
          </span>
          <div className="grid grid-cols-3 gap-2">
            {SIZES.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setSize(s.key)}
                className={`cursor-pointer rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${
                  size === s.key
                    ? "border-rose-400 bg-rose-500/15 text-white"
                    : "border-[var(--border)] bg-[var(--background)] text-white/70 hover:border-white/30"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {(["standard", "draft"] as Quality[]).map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setQuality(q)}
              className={`cursor-pointer rounded-xl border px-3 py-3 text-sm font-medium transition-colors ${
                quality === q
                  ? "border-rose-400 bg-rose-500/15 text-white"
                  : "border-[var(--border)] bg-[var(--background)] text-white/70 hover:border-white/30"
              }`}
            >
              {q === "standard" ? "Calidad estándar" : "Rápida"}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setEnhance((v) => !v)}
          className="mt-4 flex w-full cursor-pointer items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 text-left transition-colors hover:border-white/30"
        >
          <span
            className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${
              enhance ? "bg-rose-500" : "bg-white/15"
            }`}
          >
            <span
              className={`h-5 w-5 rounded-full bg-white transition-transform ${
                enhance ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </span>
          <span className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-rose-400" />
            Mejorar mi idea automáticamente
          </span>
        </button>

        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 to-fuchsia-600 px-5 py-4 font-display text-lg font-semibold text-white shadow-lg shadow-rose-900/40 transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Spinner /> : <Sparkles />}
          {loading ? "Generando…" : "Generar imagen"}
        </button>

        {error && (
          <p className="mt-3 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        )}
      </div>

      {(loading || image) && (
        <div className="mt-6 rounded-3xl border border-[var(--border)] bg-[var(--card)]/70 p-4">
          <div className={`relative w-full overflow-hidden rounded-2xl bg-black/40 ${sizeBox}`}>
            {image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt={finalPrompt || prompt}
                onLoad={() => setImgReady(true)}
                className={`h-full w-full object-cover transition-opacity duration-500 ${
                  imgReady ? "opacity-100" : "opacity-0"
                }`}
              />
            )}
            {(!image || !imgReady) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/50">
                <Spinner />
                <span className="text-sm">Pintando tu imagen…</span>
              </div>
            )}
          </div>

          {image && imgReady && (
            <div className="mt-3 flex items-center gap-2">
              <a
                href={image}
                download
                target="_blank"
                rel="noreferrer"
                className="flex-1 cursor-pointer rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-center text-sm font-medium transition-colors hover:border-white/30"
              >
                Descargar
              </a>
              <button
                type="button"
                onClick={generate}
                className="flex-1 cursor-pointer rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-center text-sm font-medium transition-colors hover:border-white/30"
              >
                Otra variación
              </button>
            </div>
          )}

          {finalPrompt && enhance && (
            <p className="mt-3 text-xs leading-relaxed text-white/40">
              <span className="font-semibold text-white/60">Prompt mejorado:</span> {finalPrompt}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
