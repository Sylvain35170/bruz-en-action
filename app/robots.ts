import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://sylvain35170.github.io/bruz-en-action/sitemap.xml",
  };
}
