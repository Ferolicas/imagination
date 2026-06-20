"use client";

import { useState } from "react";

export default function CheckoutButton({
  plan,
  primary,
}: {
  plan: "BASIC" | "PRO" | "PREMIUM";
  primary?: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function go() {
    setLoading(true);
    try {
      const r = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const d = await r.json();
      if (d.needAuth) {
        window.location.href = "/registro";
        return;
      }
      if (d.url) {
        window.location.href = d.url;
        return;
      }
      alert(d.error || "No se pudo iniciar el pago.");
    } catch {
      alert("Error de red. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={go}
      disabled={loading}
      className={`mt-6 cursor-pointer rounded-xl px-4 py-3 text-center text-sm font-semibold transition-[filter,border-color] disabled:opacity-60 ${
        primary
          ? "bg-gradient-to-br from-rose-500 to-fuchsia-600 text-white hover:brightness-110"
          : "border border-white/15 text-white/80 hover:border-white/30"
      }`}
    >
      {loading ? "Redirigiendo…" : "Elegir plan"}
    </button>
  );
}
