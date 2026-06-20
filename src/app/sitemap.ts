import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://imagination.olcas.app";
  const paths = ["", "/precios", "/crear", "/registro", "/entrar", "/legal/terminos", "/legal/privacidad", "/legal/cookies"];
  return paths.map((p) => ({ url: `${base}${p}`, lastModified: new Date(), changeFrequency: "weekly", priority: p === "" ? 1 : 0.7 }));
}
