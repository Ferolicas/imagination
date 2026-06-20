"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Item = { id: string; images: string[]; promptOriginal: string; createdAt: string };

export default function Galeria() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const photos = items.flatMap((it) =>
    it.images.map((url, i) => ({ key: `${it.id}-${i}`, url, prompt: it.promptOriginal })),
  );

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <Link href="/crear" className="font-display text-xl font-bold tracking-tight">
          <span className="bg-gradient-to-br from-rose-400 to-fuchsia-500 bg-clip-text text-transparent">Imagination</span>
        </Link>
        <Link href="/cuenta" className="rounded-full px-3 py-1.5 text-sm text-white/70 transition-colors hover:text-white">
          Mi cuenta
        </Link>
      </header>

      <h1 className="font-display text-3xl font-bold tracking-tight">Mi galería</h1>

      {loading ? (
        <p className="mt-6 text-white/50">Cargando…</p>
      ) : photos.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-[var(--border)] bg-[var(--card)]/50 p-10 text-center">
          <p className="text-white/55">Aún no has creado nada.</p>
          <Link href="/crear" className="mt-4 inline-block cursor-pointer rounded-xl bg-gradient-to-br from-rose-500 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white transition-[filter] hover:brightness-110">
            Crear mi primera imagen
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {photos.map((p) => (
            <a
              key={p.key}
              href={p.url}
              target="_blank"
              rel="noreferrer"
              className="group relative aspect-square overflow-hidden rounded-2xl border border-[var(--border)] bg-black/40"
              title={p.prompt}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={p.prompt} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
