import { notFound } from "next/navigation";
import Link from "next/link";
import actusData from "../../../data/actus.json";
import metaData from "../../../data/meta.json";
import NavBar from "../../../components/NavBar";
import SiteFooter from "../../../components/SiteFooter";

type Section = { titre: string; contenu: string };
type Contenu = { intro: string; sections: Section[]; sources: string[] };
type Analyse = {
  id: string;
  titre: string;
  date: string;
  dossier?: string;
  detail: string;
  contenu: Contenu;
  source_label: string;
};

export function generateStaticParams() {
  return actusData.actus
    .filter((a: any) => a.type === "analyse" && a.contenu)
    .map((a: any) => ({ id: a.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = actusData.actus.find((a: any) => a.id === id && a.type === "analyse") as Analyse | undefined;
  if (!article) return {};
  return {
    title: `${article.titre} — Bruz en Action`,
    description: article.detail,
    openGraph: {
      title: article.titre,
      description: article.detail,
      url: `https://sylvain35170.github.io/bruz-en-action/articles/${id}`,
      siteName: "Bruz en Action",
      locale: "fr_FR",
      type: "article",
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = actusData.actus.find((a: any) => a.id === id && a.type === "analyse") as Analyse | undefined;
  if (!article) notFound();

  const { contenu } = article;
  const dateStr = new Date(article.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "var(--font-sans, system-ui)", background: "#f8fafc" }}>
      <NavBar />

      <main style={{ flex: 1, maxWidth: 780, margin: "0 auto", width: "100%", padding: "32px 16px 64px" }}>

        {/* Breadcrumb */}
        <div style={{ marginBottom: 24, fontSize: 13, color: "#94a3b8" }}>
          <Link href="/bruz-en-action/dossiers" style={{ color: "#64748b", textDecoration: "none" }}>Dossiers</Link>
          {article.dossier && (
            <>
              {" · "}
              <Link href={`/bruz-en-action/dossiers/${article.dossier}`} style={{ color: "#64748b", textDecoration: "none" }}>{article.dossier}</Link>
            </>
          )}
          {" · "}
          <span>Analyse</span>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span style={{ background: "#fef3c7", color: "#92400e", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Analyse
            </span>
            <span style={{ fontSize: 13, color: "#94a3b8" }}>{dateStr}</span>
            <span style={{ fontSize: 13, color: "#cbd5e1" }}>· {article.source_label}</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#0f172a", lineHeight: 1.25, margin: "0 0 16px" }}>
            {article.titre}
          </h1>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.7, color: "#475569", borderLeft: "3px solid #E8920E", paddingLeft: 16 }}>
            {contenu.intro}
          </p>
        </div>

        {/* Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {contenu.sections.map((s, i) => (
            <section key={i}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 12px", paddingBottom: 8, borderBottom: "2px solid #E8920E", display: "inline-block" }}>
                {s.titre}
              </h2>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.8, color: "#334155" }}>
                {s.contenu}
              </p>
            </section>
          ))}
        </div>

        {/* Sources */}
        {contenu.sources.length > 0 && (
          <div style={{ marginTop: 40, padding: "16px 20px", background: "#f1f5f9", borderRadius: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
              Sources
            </div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {contenu.sources.map((s, i) => (
                <li key={i} style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Retour dossier */}
        {article.dossier && (
          <div style={{ marginTop: 40 }}>
            <Link href={`/bruz-en-action/dossiers/${article.dossier}`}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 600, color: "#E8920E", textDecoration: "none" }}>
              ← Retour au dossier {article.dossier}
            </Link>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
