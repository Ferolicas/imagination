export default function Home() {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[600px] max-w-[1200px]"
        style={{
          background:
            "radial-gradient(600px 300px at 50% 0, rgba(168,85,247,.18), transparent 70%)",
        }}
      />
      <span className="z-10 rounded-full border border-white/15 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-white/60">
        Próximamente
      </span>
      <h1 className="z-10 mt-6 bg-gradient-to-br from-rose-400 via-rose-500 to-fuchsia-500 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-7xl">
        Imagination
      </h1>
      <p className="z-10 mt-5 max-w-xl text-pretty text-base text-white/60 sm:text-lg">
        Escribe una idea simple. La IA la convierte en un prompt profesional y
        genera tu imagen.
      </p>
    </main>
  );
}
