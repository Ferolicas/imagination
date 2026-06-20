"use client";

import { useState } from "react";
import Link from "next/link";
import GoogleButton from "@/components/google-button";

export default function Entrar() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error || "No se pudo iniciar sesión.");
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
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
      <Link href="/" className="mb-8 text-center font-display text-2xl font-bold tracking-tight">
        <span className="bg-gradient-to-br from-rose-400 to-fuchsia-500 bg-clip-text text-transparent">Imagination</span>
      </Link>
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)]/70 p-6 shadow-2xl shadow-black/40">
        <h1 className="font-display text-2xl font-bold">Entrar</h1>

        <div className="mt-5">
          <GoogleButton />
        </div>
        <div className="my-4 flex items-center gap-3 text-xs text-white/30">
          <span className="h-px flex-1 bg-white/10" /> o <span className="h-px flex-1 bg-white/10" />
        </div>
        <form onSubmit={submit} className="mt-5 space-y-3">
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none transition-colors placeholder:text-white/30 focus:border-rose-400"
          />
          <input
            type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none transition-colors placeholder:text-white/30 focus:border-rose-400"
          />
          {error && <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
          <button
            type="submit" disabled={loading}
            className="w-full cursor-pointer rounded-2xl bg-gradient-to-br from-rose-500 to-fuchsia-600 px-5 py-3.5 font-display text-lg font-semibold text-white transition-[filter] hover:brightness-110 disabled:opacity-60"
          >
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-white/50">
          ¿No tienes cuenta? <Link href="/registro" className="text-rose-400 hover:underline">Crear una gratis</Link>
        </p>
      </div>
    </div>
  );
}
