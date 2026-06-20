import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/cuenta", "/galeria", "/api/"] },
    sitemap: "https://imagination.olcas.app/sitemap.xml",
  };
}
