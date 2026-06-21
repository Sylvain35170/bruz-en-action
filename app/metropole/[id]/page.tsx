import { notFound } from "next/navigation";
import type { Metadata } from "next";
import metropoleData from "../../../data/metropole.json";
import metaData from "../../../data/meta.json";
import SiteFooter from "../../../components/SiteFooter";

const LOGO = "/bruz-en-action/logo.png";

const CATEGORIE_COLORS: Record<string, string> = {
  "Mobilités": "#2563eb",
  "Urbanisme": "#7c3aed",
  "Environnement": "#059669",
  "Services publics": "#0891b2",
  "Gouvernance": "#374151",
};

export function generateStaticParams() {
  return metropoleData.dossiers.map(d => ({ id: d.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const dossier = metropoleData.dossiers.find(d => d.id === id);
  if (!dossier) return {};
  return {
    title: `${dossier.titre} — Bruz en Action`,
    description: dossier.chapeau,
    openGraph: {
      title: `${dossier.titre} — Bruz en Action`,
      description: dossier.chapeau,
      url: `https://sylvain35170.github.io/bruz-en-action/metropole/${id}`,
      siteName: "Bruz en Action",
      locale: "fr_FR",
      type: "article",
    },
  };
}

export default async function MetropoleDossierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dossier = metropoleData.dossiers.find(d => d.id === id);
  if (!dossier) notFound();

  const { association, contact } = metaData;
  const color = CATEGORIE_COLORS[dossier.categorie] ?? "#64748b";
  const decisions = dossier.decisions as { date: string; description: string; source_url?: string }[];
  const actus = dossier.actus_recentes as { date: string; titre: string; detail: string; source_url?: string; source_label?: string }[];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "var(--font-sans, system-ui)", background: "#f8fafc" }}>

      {/* Header */}
      <header style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)", color: "#fff" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "16px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <a href="/bruz-en-action" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO} alt={association.nom} width={140} height={44} style={{ objectFit: "contain", background: "rgba(255,255,255,0.92)", borderRadius: 8, padding: "4px 8px" }} />
            </a>
            <nav style={{ display: "flex", gap: 20, alignItems: "center" }}>
              <a href="/bruz-en-action/metropole" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>← Métropole</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)", color: "#fff", paddingBottom: 48 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "36px 24px 0" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
            <span style={{ padding: "3px 10px", borderRadius: 999, background: "rgba(232,77,14,0.2)", color: "#f97316", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Rennes Métropole
            </span>
            <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, color, background: `${color}25` }}>
              {dossier.categorie}
            </span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>{dossier.id}</span>
          </div>
          <h1 style={{ fontSize: "clamp(1.3rem, 3vw, 2rem)", fontWeight: 800, lineHeight: 1.2, margin: "0 0 16px", maxWidth: 760, color: "#fff" }}>
            {dossier.titre}
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: "rgba(255,255,255,0.72)", maxWidth: 680, margin: 0 }}>
            {dossier.chapeau}
          </p>
          {dossier.lien_dossiers_communaux.length > 0 && (
            <div style={{ display: "flex", gap: 8, marginTop: 20, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Dossiers Bruz liés :</span>
              {dossier.lien_dossiers_communaux.map(did => (
                <a key={did} href={`/bruz-en-action/dossiers/${did}`}
                  style={{ fontSize: 12, padding: "3px 10px", background: "rgba(255,255,255,0.1)", color: "#fff", borderRadius: 999, textDecoration: "none", fontWeight: 600 }}>
                  → Dossier {did}
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      <main style={{ flex: 1 }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px" }}>

          {/* Ce qu'on sait */}
          <section style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 16px", color: "#0f172a", paddingBottom: 8, borderBottom: "2px solid #e84d0e", display: "inline-block" }}>Ce qu'on sait</h2>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
              {dossier.ce_quon_sait.map((item, i) => (
                <li key={i} style={{ display: "flex", gap: 12, padding: "12px 16px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, color: "#334155", lineHeight: 1.6 }}>
                  <span style={{ color: color, fontWeight: 900, flexShrink: 0, marginTop: 1 }}>▸</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Qui décide */}
          <section style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 16px", color: "#0f172a", paddingBottom: 8, borderBottom: "2px solid #e84d0e", display: "inline-block" }}>Qui décide ?</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {dossier.qui_decide.map((q, i) => (
                <div key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "14px 18px", display: "flex", gap: 14 }}>
                  <div style={{ flexShrink: 0, width: 8, height: 8, borderRadius: "50%", background: color, marginTop: 5 }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 3 }}>{q.nom}</div>
                    <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>{q.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Décisions */}
          {decisions.length > 0 && (
            <section style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 16px", color: "#0f172a", paddingBottom: 8, borderBottom: "2px solid #e84d0e", display: "inline-block" }}>Décisions clés</h2>
              <div style={{ position: "relative", paddingLeft: 20 }}>
                <div style={{ position: "absolute", left: 5, top: 6, bottom: 6, width: 2, background: "#e2e8f0" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {decisions.map((d, i) => (
                    <div key={i} style={{ position: "relative" }}>
                      <div style={{ position: "absolute", left: -18, top: 5, width: 8, height: 8, borderRadius: "50%", background: color, border: "2px solid #fff", boxShadow: `0 0 0 2px ${color}` }} />
                      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px 16px" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>{d.date}</div>
                        <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.6 }}>{d.description}</div>
                        {d.source_url && (
                          <a href={d.source_url} target="_blank" rel="noopener noreferrer"
                            style={{ display: "inline-block", marginTop: 8, fontSize: 12, color: "#2563eb", textDecoration: "none" }}>Source ↗</a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Ce qu'on suit */}
          <section style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 16px", color: "#0f172a", paddingBottom: 8, borderBottom: "2px solid #e84d0e", display: "inline-block" }}>Ce qu'on surveille</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {dossier.ce_quon_suit.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "12px 16px", background: "#fefce8", border: "1px solid #fde68a", borderRadius: 8, fontSize: 14, lineHeight: 1.6, color: "#713f12" }}>
                  <span style={{ flexShrink: 0 }}>👁</span>
                  {item}
                </div>
              ))}
            </div>
          </section>

          {/* Actus */}
          {actus.length > 0 && (
            <section style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 16px", color: "#0f172a", paddingBottom: 8, borderBottom: "2px solid #e84d0e", display: "inline-block" }}>Dernières actus</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {actus.map((a, i) => (
                  <div key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>
                        {new Date(a.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                      {a.source_label && <span style={{ fontSize: 11, color: "#cbd5e1" }}>{a.source_label}</span>}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{a.titre}</div>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "#64748b" }}>{a.detail}</p>
                    {a.source_url && (
                      <a href={a.source_url} target="_blank" rel="noopener noreferrer"
                        style={{ display: "inline-block", marginTop: 8, fontSize: 12, color: "#2563eb", textDecoration: "none" }}>Lire ↗</a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Sources */}
          {dossier.sources.length > 0 && (
            <section style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 16px", color: "#0f172a", paddingBottom: 8, borderBottom: "2px solid #e84d0e", display: "inline-block" }}>Sources</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {dossier.sources.map((s, i) => (
                  <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, textDecoration: "none", fontSize: 13, color: "#0284c7", fontWeight: 500 }}>
                    ↗ {s.label}
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Signalement */}
          <div style={{ background: "#fff8f5", border: "1px solid #fed7aa", borderLeft: "4px solid #e84d0e", borderRadius: 12, padding: "20px 24px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#e84d0e", marginBottom: 8 }}>Vous avez des informations sur ce dossier ?</div>
            <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 12px", lineHeight: 1.6 }}>
              Délibérations, documents, témoignages — partagez-les avec nous.
            </p>
            <a href={`mailto:${contact.email}?subject=${encodeURIComponent(`[${dossier.id}] ${dossier.titre}`)}`}
              style={{ fontSize: 13, color: "#e84d0e", fontWeight: 700, textDecoration: "none" }}>
              Nous écrire ↗
            </a>
          </div>

        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
