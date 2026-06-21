import type { MetadataRoute } from "next";
import dossiers from "@/data/dossiers.json";
import promessesData from "@/data/promesses.json";
import cmsData from "@/data/cms.json";
import metropoleData from "@/data/metropole.json";

export const dynamic = "force-static";

const BASE = "https://sylvain35170.github.io/bruz-en-action";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, priority: 1.0, changeFrequency: "weekly" },
    { url: `${BASE}/dossiers`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${BASE}/promesses`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${BASE}/conseils`, priority: 0.8, changeFrequency: "weekly" },
    { url: `${BASE}/elus`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE}/carte`, priority: 0.6, changeFrequency: "monthly" },
    { url: `${BASE}/interagir`, priority: 0.6, changeFrequency: "monthly" },
    { url: `${BASE}/metro`, priority: 0.7, changeFrequency: "weekly" },
    { url: `${BASE}/metropole`, priority: 0.9, changeFrequency: "weekly" },
    { url: `${BASE}/liens`, priority: 0.5, changeFrequency: "monthly" },
    { url: `${BASE}/chronologie`, priority: 0.8, changeFrequency: "weekly" },
  ];

  const dossierRoutes: MetadataRoute.Sitemap = dossiers.dossiers.map((d) => ({
    url: `${BASE}/dossiers/${d.id}`,
    priority: d.featured ? 0.8 : 0.6,
    changeFrequency: "weekly" as const,
    lastModified: d.last_activity,
  }));

  const promesseRoutes: MetadataRoute.Sitemap = (promessesData.promesses ?? []).map((p) => ({
    url: `${BASE}/promesses/${p.id}`,
    priority: 0.6,
    changeFrequency: "monthly" as const,
  }));

  const cmRoutes: MetadataRoute.Sitemap = (cmsData.seances ?? []).map((s) => ({
    url: `${BASE}/conseils/${s.id}`,
    priority: 0.6,
    changeFrequency: "monthly" as const,
    lastModified: s.date,
  }));

  const metropoleRoutes: MetadataRoute.Sitemap = metropoleData.dossiers.map((d) => ({
    url: `${BASE}/metropole/${d.id}`,
    priority: d.featured ? 0.8 : 0.6,
    changeFrequency: "weekly" as const,
    lastModified: d.last_activity,
  }));

  return [...staticRoutes, ...dossierRoutes, ...promesseRoutes, ...cmRoutes, ...metropoleRoutes];
}
