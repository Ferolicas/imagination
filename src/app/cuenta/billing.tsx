"use client";

import { useState } from "react";
import { TOPUPS } from "@/lib/plans";

export default function Billing({ hasSub }: { hasSub: boolean }) {
  const [loading, setLoading] = useState("");

  async function call(url: string, body?: object) {
    setLoading(body ? JSON.stringify(body) : url);
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const d = await r.json();
      if (d.url) window.location.href = d.url;
      else alert(d.error || "No se pudo continuar.");
    } catch {
      alert("Error de red.");
    } finally {
      setLoading("");
    }
  }

  return (
    <div className="mt-8">
      <h2 className="font-display text-xl font-bold">Comprar créditos extra</h2>
      <p className="mt-1 text-sm text-white/50">Packs que no caducan, se suman a tu saldo.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {TOPUPS.map((t) => (
          <button
            key={t.key}
            type="button"
            disabled={loading !== ""}
            onClick={() => call("/api/stripe/checkout", { pack: t.key })}
            className="cursor-pointer rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 p-4 text-left transition-colors hover:border-rose-400/60 disabled:opacity-60"
          >
            <div className="font-display text-lg font-bold">{t.credits} créditos</div>
            <div className="text-sm text-white/55">{t.priceEur} €</div>
          </button>
        ))}
      </div>
      {hasSub && (
        <button
          type="button"
          disabled={loading !== ""}
          onClick={() => call("/api/stripe/portal")}
          className="mt-4 cursor-pointer rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-medium text-white/80 transition-colors hover:border-white/30 disabled:opacity-60"
        >
          Gestionar suscripción
        </button>
      )}
    </div>
  );
}
