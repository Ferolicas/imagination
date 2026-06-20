"use client";

import { useEffect, useState } from "react";

type Stats = { users: number; gensToday: number; gensTotal: number; paid: number; pollToday: number };

export default function AdminPanel() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [on, setOn] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then((d) => setStats(d)).catch(() => {});
    fetch("/api/admin/killswitch").then((r) => r.json()).then((d) => setOn(Boolean(d.on))).catch(() => {});
  }, []);

  async function toggle() {
    setBusy(true);
    try {
      const r = await fetch("/api/admin/killswitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ on: !on }),
      });
      const d = await r.json();
      setOn(Boolean(d.on));
    } finally {
      setBusy(false);
    }
  }

  const cards: [string, number | undefined][] = [
    ["Usuarios", stats?.users],
    ["De pago", stats?.paid],
    ["Generaciones hoy", stats?.gensToday],
    ["Generaciones total", stats?.gensTotal],
    ["Llamadas Pollinations hoy", stats?.pollToday],
  ];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight">Panel admin</h1>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map(([label, val]) => (
          <div key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 p-4">
            <div className="text-xs uppercase tracking-wider text-white/45">{label}</div>
            <div className="mt-1 font-display text-2xl font-bold">{val ?? "—"}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-[var(--border)] bg-[var(--card)]/60 p-6">
        <h2 className="font-display text-lg font-bold">Kill switch del tier gratis</h2>
        <p className="mt-1 text-sm text-white/55">
          Si lo activas, se pausan las generaciones gratuitas (protección de gasto/baneo).
        </p>
        <button
          type="button"
          onClick={toggle}
          disabled={busy}
          className={`mt-4 flex items-center gap-3 rounded-xl px-5 py-3 text-sm font-semibold transition-colors disabled:opacity-60 ${
            on ? "bg-rose-600 text-white" : "border border-[var(--border)] text-white/80 hover:border-white/30"
          }`}
        >
          <span className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${on ? "bg-white/30" : "bg-white/15"}`}>
            <span className={`h-5 w-5 rounded-full bg-white transition-transform ${on ? "translate-x-5" : ""}`} />
          </span>
          {on ? "Generación gratis PAUSADA" : "Generación gratis activa"}
        </button>
      </div>
    </div>
  );
}
