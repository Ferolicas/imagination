"use client";

import { useState } from "react";
import GoogleButton from "./google-button";

export default function AuthCta({ label, className = "" }: { label: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"register" | "login">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const url = tab === "register" ? "/api/auth/register" : "/api/auth/login";
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error || "Algo salió mal.");
        return;
      }
      if (tab === "register" && d.emailSent) {
        setInfo("¡Casi! Te enviamos un correo para confirmar tu cuenta.");
        return;
      }
      if (tab === "register" && d.verifyLink) {
        window.location.href = d.verifyLink;
        return;
      }
      window.location.href = "/crear";
    } catch {
      setError("Error de red. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 to-fuchsia-600 px-7 py-4 font-display text-lg font-semibold text-white shadow-xl shadow-rose-900/40 transition-[filter] hover:brightness-110 ${className}`}
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m12 3 1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3z" />
        </svg>
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur" onClick={() => setOpen(false)}>
          <div className="w-full max-w-sm rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">{tab === "register" ? "Crea tu cuenta" : "Entrar"}</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar" className="cursor-pointer text-white/50 hover:text-white">✕</button>
            </div>

            {info ? (
              <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{info}</p>
            ) : (
              <>
                <GoogleButton />
                <div className="my-4 flex items-center gap-3 text-xs text-white/30">
                  <span className="h-px flex-1 bg-white/10" /> o <span className="h-px flex-1 bg-white/10" />
                </div>
                <form onSubmit={submit} className="space-y-3">
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none transition-colors placeholder:text-white/30 focus:border-rose-400" />
                  <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={tab === "register" ? "Contraseña (mín. 8)" : "Contraseña"} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none transition-colors placeholder:text-white/30 focus:border-rose-400" />
                  {error && <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-200">{error}</p>}
                  <button type="submit" disabled={loading} className="w-full cursor-pointer rounded-2xl bg-gradient-to-br from-rose-500 to-fuchsia-600 px-5 py-3.5 font-display text-base font-semibold text-white transition-[filter] hover:brightness-110 disabled:opacity-60">
                    {loading ? "Un momento…" : tab === "register" ? "Crear cuenta" : "Entrar"}
                  </button>
                </form>
                <p className="mt-4 text-center text-sm text-white/50">
                  {tab === "register" ? "¿Ya tienes cuenta? " : "¿No tienes cuenta? "}
                  <button type="button" onClick={() => { setTab(tab === "register" ? "login" : "register"); setError(""); }} className="cursor-pointer text-rose-400 hover:underline">
                    {tab === "register" ? "Entrar" : "Crear una gratis"}
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
