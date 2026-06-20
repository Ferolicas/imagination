import Link from "next/link";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <Link href="/" className="font-display text-xl font-bold tracking-tight">
        <span className="bg-gradient-to-br from-rose-400 to-fuchsia-500 bg-clip-text text-transparent">Imagination</span>
      </Link>
      <article className="mt-8 space-y-3 text-sm leading-relaxed text-white/70 [&_h1]:font-display [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-white [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-white [&_a]:text-rose-400 hover:[&_a]:underline">
        {children}
      </article>
    </div>
  );
}
