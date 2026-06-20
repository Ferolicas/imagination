import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <div className="font-display text-7xl font-bold">
        <span className="bg-gradient-to-br from-rose-400 to-fuchsia-500 bg-clip-text text-transparent">404</span>
      </div>
      <p className="mt-4 text-white/60">Esta página no existe.</p>
      <Link
        href="/"
        className="mt-8 cursor-pointer rounded-2xl bg-gradient-to-br from-rose-500 to-fuchsia-600 px-6 py-3 font-display font-semibold text-white transition-[filter] hover:brightness-110"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
