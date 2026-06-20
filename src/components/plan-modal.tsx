"use client";

import { useState } from "react";
import { PLANS } from "@/lib/plans";

export default function PlanModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState("");
  if (!open) return null;

  async function choose(plan: string) {
    if (plan === "FREE") {
      onClose();
      return;
    }
    setLoading(plan);
    try {
      const r = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const d = await r.json();
      if (d.url) {
        window.location.href = d.url;
        return;
      }
      alert(d.error || "No se pudo continuar.");
    } catch {
      alert("Error de red.");
    } finally {
      setLoading("");
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/85 p-4 backdrop-blur" onClick={onClose}>
      <div className="my-8 w-full max-w-4xl rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">Elige tu plan</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="cursor-pointer text-2xl leading-none text-white/50 hover:text-white">✕</button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.values(PLANS).map((p) => (
            <div key={p.id} className={`flex flex-col rounded-2xl border p-4 ${p.id === "PRO" ? "border-rose-400/60 bg-rose-500/5" : "border-[var(--border)]"}`}>
              <h3 className="font-display text-lg font-bold">{p.label}</h3>
              <div className="mt-1">
                <span className="font-display text-2xl font-bold">{p.priceEur === 0 ? "Gratis" : `${p.priceEur}€`}</span>
                {p.priceEur > 0 && <span className="text-xs text-white/50">/mes</span>}
              </div>
              <ul className="mt-3 flex-1 space-y-1.5 text-xs text-white/65">
                <li>✦ {p.monthlyCredits} créditos/mes</li>
                <li>✦ {p.models}</li>
                <li>{p.video ? "✦ Vídeo incluido" : "— Solo imagen"}</li>
              </ul>
              <button
                type="button"
                onClick={() => choose(p.id)}
                disabled={loading === p.id}
                className={`mt-4 cursor-pointer rounded-xl px-3 py-2.5 text-sm font-semibold transition-[filter] disabled:opacity-60 ${
                  p.id === "FREE" ? "border border-white/15 text-white/80" : "bg-gradient-to-br from-rose-500 to-fuchsia-600 text-white hover:brightness-110"
                }`}
              >
                {loading === p.id ? "…" : p.id === "FREE" ? "Seguir gratis" : "Elegir"}
              </button>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-white/35">Pago seguro con Stripe. Cancela cuando quieras.</p>
      </div>
    </div>
  );
}
