"use client";

export default function LogoutButton() {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }
  return (
    <button
      type="button"
      onClick={logout}
      className="cursor-pointer rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-white/80 transition-colors hover:border-rose-400/60 hover:text-white"
    >
      Cerrar sesión
    </button>
  );
}
