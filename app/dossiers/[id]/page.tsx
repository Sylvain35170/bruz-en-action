import { notFound } from "next/navigation";
import dossiersData from "../../../data/dossiers.json";
import metaData from "../../../data/meta.json";

const LOGO = "/bruz-en-action/logo.png";

export function generateStaticParams() {
  return dossiersData.dossiers.map(d => ({ id: d.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dossier = dossiersData.dossiers.find(d => d.id === id);
  if (!dossier) return {};
  return { title: `${dossier.titre} — Bruz en Action`, description: dossier.chapeau };
}

const STATUT_LABEL: Record<string, string> = {
  en_cours: "En cours",
  publie: "Publié",
  a_venir: "À venir",
};
const STATUT_COLOR: Record<string, string> = {
  en_cours: "#d97706",
  publie: "#16a34a",
  a_venir: "#64748b",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontSize: 20, fontWeight: 800, margin: "0 0 16px", color: "#0f172a",
      paddingBottom: 10, borderBottom: "2px solid #e84d0e", display: "inline-block",
    }}>{children}</h2>
  );
}

type GraphiqueDonnee = { label: string; valeur: number; confirme?: boolean };
type Graphique = {
  id: string;
  type: "bar" | "horizontal_bar";
  titre: string;
  sous_titre?: string;
  source?: string;
  note?: string;
  donnees: GraphiqueDonnee[];
};

function SvgBarChart({ g }: { g: Graphique }) {
  const W = 560, H = 200, PAD_L = 40, PAD_B = 48, PAD_T = 20, BAR_GAP = 0.35;
  const max = Math.max(...g.donnees.map(d => d.valeur)) * 1.15;
  const chartH = H - PAD_T - PAD_B;
  const barW = ((W - PAD_L) / g.donnees.length) * (1 - BAR_GAP);
  const barSpacing = (W - PAD_L) / g.donnees.length;

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "20px 24px", marginBottom: 24 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>{g.titre}</div>
      {g.sous_titre && <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>{g.sous_titre}</div>}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W, display: "block" }}>
        {/* Grille horizontale */}
        {[0, 0.25, 0.5, 0.75, 1].map(p => {
          const y = PAD_T + chartH * (1 - p);
          return (
            <g key={p}>
              <line x1={PAD_L} y1={y} x2={W} y2={y} stroke="#f1f5f9" strokeWidth={p === 0 ? 0 : 1} />
              {p > 0 && (
                <text x={PAD_L - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#94a3b8">
                  {(max * p).toFixed(max * p > 100 ? 0 : 1)}
                </text>
              )}
            </g>
          );
        })}
        {/* Axe X */}
        <line x1={PAD_L} y1={PAD_T + chartH} x2={W} y2={PAD_T + chartH} stroke="#e2e8f0" strokeWidth={1} />
        {/* Barres */}
        {g.donnees.map((d, i) => {
          const bH = (d.valeur / max) * chartH;
          const x = PAD_L + i * barSpacing + (barSpacing - barW) / 2;
          const y = PAD_T + chartH - bH;
          const fill = d.confirme === false ? "#94a3b8" : "#e84d0e";
          const lines = d.label.split("\n");
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={bH} rx={4} fill={fill} />
              <text x={x + barW / 2} y={y - 5} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#0f172a">
                {d.valeur}
              </text>
              {lines.map((line, li) => (
                <text key={li} x={x + barW / 2} y={PAD_T + chartH + 14 + li * 11} textAnchor="middle" fontSize={10} fill="#475569">
                  {line}
                </text>
              ))}
            </g>
          );
        })}
      </svg>
      {/* Légende confirmation */}
      {g.donnees.some(d => d.confirme === false) && (
        <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
          <span style={{ fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 12, height: 12, background: "#e84d0e", borderRadius: 2, display: "inline-block" }} /> Donnée confirmée
          </span>
          <span style={{ fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 12, height: 12, background: "#94a3b8", borderRadius: 2, display: "inline-block" }} /> Estimation indicative
          </span>
        </div>
      )}
      {g.note && <p style={{ margin: "10px 0 0", fontSize: 11, color: "#94a3b8", lineHeight: 1.5, fontStyle: "italic" }}>{g.note}</p>}
      {g.source && <p style={{ margin: "4px 0 0", fontSize: 11, color: "#cbd5e1" }}>Source : {g.source}</p>}
    </div>
  );
}

function SvgHorizontalBarChart({ g }: { g: Graphique }) {
  const ROW_H = 40, PAD_L = 190, PAD_R = 50, BAR_MAX_W = 280;
  const svgH = g.donnees.length * ROW_H + 20;
  const max = Math.max(...g.donnees.map(d => d.valeur));

  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "20px 24px", marginBottom: 24 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 2 }}>{g.titre}</div>
      {g.sous_titre && <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>{g.sous_titre}</div>}
      <svg viewBox={`0 0 ${PAD_L + BAR_MAX_W + PAD_R} ${svgH}`} style={{ width: "100%", display: "block" }}>
        {g.donnees.map((d, i) => {
          const y = i * ROW_H + 10;
          const bW = (d.valeur / max) * BAR_MAX_W;
          const fill = d.confirme === false ? "#94a3b8" : "#e84d0e";
          return (
            <g key={i}>
              <text x={PAD_L - 8} y={y + 14} textAnchor="end" fontSize={11} fill="#334155">{d.label}</text>
              <rect x={PAD_L} y={y + 2} width={bW} height={22} rx={4} fill={fill} />
              <text x={PAD_L + bW + 6} y={y + 17} fontSize={11} fontWeight="bold" fill="#0f172a">
                {d.valeur} M€
              </text>
            </g>
          );
        })}
      </svg>
      {g.donnees.some(d => d.confirme === false) && (
        <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
          <span style={{ fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 12, height: 12, background: "#e84d0e", borderRadius: 2, display: "inline-block" }} /> Donnée confirmée
          </span>
          <span style={{ fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 12, height: 12, background: "#94a3b8", borderRadius: 2, display: "inline-block" }} /> Estimation indicative
          </span>
        </div>
      )}
      {g.note && <p style={{ margin: "10px 0 0", fontSize: 11, color: "#94a3b8", lineHeight: 1.5, fontStyle: "italic" }}>{g.note}</p>}
      {g.source && <p style={{ margin: "4px 0 0", fontSize: 11, color: "#cbd5e1" }}>Source : {g.source}</p>}
    </div>
  );
}

function Card({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div style={{
      background: accent ? "#fef9f7" : "#fff",
      border: `1px solid ${accent ? "#fbd5c8" : "#e2e8f0"}`,
      borderRadius: 12,
      padding: "20px 24px",
      marginBottom: 32,
    }}>{children}</div>
  );
}

export default async function DossierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dossier = dossiersData.dossiers.find(d => d.id === id) as any;
  if (!dossier) notFound();

  const { association, contact } = metaData;
  const hasHelloAsso = Boolean(contact.hello_asso_url);
  const autresDossiers = dossiersData.dossiers.filter(d => d.id !== id).slice(0, 4);

  const hasRichContent = dossier.pourquoi || dossier.gouvernance?.length || dossier.decisions?.length;

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
              <a href="/bruz-en-action/dossiers" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>📁 Dossiers</a>
              <a href="/bruz-en-action" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>← Accueil</a>
              {hasHelloAsso && (
                <a href={contact.hello_asso_url} target="_blank" rel="noopener noreferrer"
                  style={{ padding: "7px 16px", borderRadius: 999, background: "#f97316", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                  ❤️ Adhérer
                </a>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)", color: "#fff", paddingBottom: 48 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 24px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <span style={{ padding: "4px 12px", borderRadius: 999, background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {dossier.categorie}
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: STATUT_COLOR[dossier.statut] ?? "#64748b" }}>
              ● {STATUT_LABEL[dossier.statut] ?? dossier.statut}
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)", fontWeight: 800, lineHeight: 1.2, margin: "0 0 20px", maxWidth: 720 }}>
            {dossier.titre}
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.7, color: "rgba(255,255,255,0.8)", maxWidth: 680, margin: 0 }}>
            {dossier.chapeau}
          </p>
          <p style={{ marginTop: 16, fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
            Ouvert le {new Date(dossier.date_ouverture).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      </section>

      {/* Lien externe (D05 carte) */}
      {dossier.lien_externe && (
        <div style={{ background: "#f0f9ff", borderBottom: "1px solid #bae6fd", padding: "16px 24px", textAlign: "center" }}>
          <a href={dossier.lien_externe}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 24px", background: "#0369a1", color: "#fff", borderRadius: 8, fontWeight: 700, textDecoration: "none", fontSize: 15 }}>
            🗺️ Ouvrir la carte interactive →
          </a>
        </div>
      )}

      <main style={{ flex: 1 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "48px 24px", display: "grid", gridTemplateColumns: "1fr minmax(0, 300px)", gap: 48, alignItems: "start" }}>

          {/* Colonne principale */}
          <div>

            {/* À retenir */}
            {dossier.points_cles?.length > 0 && (
              <section style={{ marginBottom: 40 }}>
                <SectionTitle>À retenir</SectionTitle>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                  {dossier.points_cles.map((pt: string, i: number) => (
                    <li key={i} style={{
                      display: "flex", gap: 12, padding: "13px 16px",
                      background: "#fff", border: "1px solid #e2e8f0", borderLeft: "3px solid #e84d0e",
                      borderRadius: 8, fontSize: 15, lineHeight: 1.6, color: "#334155",
                    }}>
                      <span style={{ color: "#e84d0e", fontWeight: 800, flexShrink: 0 }}>→</span>
                      {pt}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {hasRichContent && (
              <>
                {/* Pourquoi ce dossier */}
                {dossier.pourquoi && (
                  <section style={{ marginBottom: 40 }}>
                    <SectionTitle>Pourquoi ce dossier ?</SectionTitle>
                    <Card>
                      <p style={{ margin: 0, fontSize: 16, lineHeight: 1.8, color: "#334155" }}>{dossier.pourquoi}</p>
                    </Card>
                  </section>
                )}

                {/* Gouvernance */}
                {dossier.gouvernance?.length > 0 && (
                  <section style={{ marginBottom: 40 }}>
                    <SectionTitle>Gouvernance — qui décide quoi ?</SectionTitle>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {dossier.gouvernance.map((g: { acteur: string; role: string; detail?: string }, i: number) => (
                        <div key={i} style={{
                          background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10,
                          padding: "16px 20px", display: "grid", gridTemplateColumns: "200px 1fr", gap: 16,
                        }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>{g.acteur}</div>
                            <div style={{ fontSize: 12, color: "#e84d0e", fontWeight: 600 }}>{g.role}</div>
                          </div>
                          {g.detail && <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: "#475569" }}>{g.detail}</p>}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Décisions */}
                {dossier.decisions?.length > 0 && (
                  <section style={{ marginBottom: 40 }}>
                    <SectionTitle>Les décisions clés</SectionTitle>
                    <div style={{ position: "relative", paddingLeft: 24 }}>
                      <div style={{ position: "absolute", left: 7, top: 8, bottom: 8, width: 2, background: "#e2e8f0" }} />
                      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                        {dossier.decisions.map((d: { date: string; titre: string; detail: string; source_url?: string }, i: number) => (
                          <div key={i} style={{ position: "relative" }}>
                            <div style={{ position: "absolute", left: -22, top: 6, width: 10, height: 10, borderRadius: "50%", background: "#e84d0e", border: "2px solid #fff", boxShadow: "0 0 0 2px #e84d0e" }} />
                            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 20px" }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{d.date}</div>
                              <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>{d.titre}</div>
                              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: "#475569" }}>{d.detail}</p>
                              {d.source_url && (
                                <a href={d.source_url} target="_blank" rel="noopener noreferrer"
                                  style={{ display: "inline-block", marginTop: 10, fontSize: 13, color: "#2563eb", textDecoration: "none" }}>
                                  Voir le document source ↗
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                {/* Graphiques */}
                {dossier.graphiques?.length > 0 && (
                  <section style={{ marginBottom: 40 }}>
                    <SectionTitle>Visualisations</SectionTitle>
                    {dossier.graphiques.map((g: Graphique) =>
                      g.type === "horizontal_bar"
                        ? <SvgHorizontalBarChart key={g.id} g={g} />
                        : <SvgBarChart key={g.id} g={g} />
                    )}
                  </section>
                )}

                {/* Coût & financement */}
                {dossier.cout_financement && (
                  <section style={{ marginBottom: 40 }}>
                    <SectionTitle>Coût & financement</SectionTitle>
                    <Card>
                      {dossier.cout_financement.montant && (
                        <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginBottom: 12 }}>
                          {dossier.cout_financement.montant}
                        </div>
                      )}
                      <p style={{ margin: "0 0 16px", fontSize: 15, lineHeight: 1.8, color: "#334155" }}>
                        {dossier.cout_financement.detail}
                      </p>
                      {dossier.cout_financement.repartition?.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                          {dossier.cout_financement.repartition.map((r: { source: string; detail: string }, i: number) => (
                            <div key={i} style={{
                              display: "grid", gridTemplateColumns: "180px 1fr", gap: 12,
                              padding: "10px 14px", background: "#f8fafc", borderRadius: 8, fontSize: 14,
                            }}>
                              <span style={{ fontWeight: 700, color: "#0f172a" }}>{r.source}</span>
                              <span style={{ color: "#475569" }}>{r.detail}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  </section>
                )}

                {/* Impact qualité de vie */}
                {dossier.impact_qualite_vie?.length > 0 && (
                  <section style={{ marginBottom: 40 }}>
                    <SectionTitle>Impact sur la qualité de vie des Bruzois</SectionTitle>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {dossier.impact_qualite_vie.map((item: string, i: number) => (
                        <div key={i} style={{
                          display: "flex", gap: 12, padding: "14px 16px",
                          background: "#f0fdf4", border: "1px solid #bbf7d0",
                          borderRadius: 10, fontSize: 15, lineHeight: 1.6, color: "#14532d",
                        }}>
                          <span style={{ flexShrink: 0, fontSize: 16 }}>✓</span>
                          {item}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Risques systémiques */}
                {dossier.risques?.length > 0 && (
                  <section style={{ marginBottom: 40 }}>
                    <SectionTitle>Risques systémiques</SectionTitle>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {dossier.risques.map((item: string, i: number) => (
                        <div key={i} style={{
                          display: "flex", gap: 12, padding: "14px 16px",
                          background: "#fff7ed", border: "1px solid #fed7aa",
                          borderRadius: 10, fontSize: 15, lineHeight: 1.6, color: "#7c2d12",
                        }}>
                          <span style={{ flexShrink: 0, fontSize: 16 }}>⚠</span>
                          {item}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Conclusion */}
                {dossier.conclusion && (
                  <section style={{ marginBottom: 40 }}>
                    <SectionTitle>Notre analyse</SectionTitle>
                    <Card accent>
                      <p style={{ margin: 0, fontSize: 16, lineHeight: 1.8, color: "#334155" }}>{dossier.conclusion}</p>
                    </Card>
                  </section>
                )}

                {/* Actus récentes */}
                {dossier.actus_recentes?.length > 0 && (
                  <section style={{ marginBottom: 40 }}>
                    <SectionTitle>Dernières nouvelles</SectionTitle>
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      {dossier.actus_recentes.map((a: { date: string; titre: string; detail: string; source_url?: string }, i: number) => (
                        <div key={i} style={{
                          background: "#fff", border: "1px solid #e2e8f0",
                          borderRadius: 10, padding: "16px 20px",
                        }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                            {new Date(a.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                          </div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>{a.titre}</div>
                          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: "#475569" }}>{a.detail}</p>
                          {a.source_url && (
                            <a href={a.source_url} target="_blank" rel="noopener noreferrer"
                              style={{ display: "inline-block", marginTop: 10, fontSize: 13, color: "#2563eb" }}>
                              Source ↗
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}

            {/* Bloc contribuer */}
            <section style={{ padding: "24px", background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 12, marginBottom: 40 }}>
              <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 700, color: "#0369a1" }}>
                📋 Vous avez des informations sur ce dossier ?
              </h3>
              <p style={{ margin: "0 0 12px", fontSize: 14, color: "#0c4a6e", lineHeight: 1.6 }}>
                Bruz en Action est une association citoyenne non partisane. Si vous avez connaissance de décisions, de documents publics ou de faits en lien avec ce dossier, contactez-nous.
              </p>
              <a href={contact.hello_asso_url || "https://www.helloasso.com/associations/bruz-en-action"}
                target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 14, fontWeight: 600, color: "#0369a1", textDecoration: "underline" }}>
                Nous contacter via HelloAsso →
              </a>
            </section>
          </div>

          {/* Sidebar */}
          <aside style={{ display: "flex", flexDirection: "column", gap: 24, position: "sticky", top: 24 }}>

            {/* Sources */}
            {dossier.sources?.length > 0 && (
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
                <h3 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748b" }}>
                  Sources
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {dossier.sources.map((s: { label: string; url: string }, i: number) => (
                    <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 13, color: "#2563eb", lineHeight: 1.5, textDecoration: "none", borderBottom: "1px solid #f1f5f9", paddingBottom: 10 }}>
                      {s.label} ↗
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Liens officiels */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
              <h3 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748b" }}>
                Liens officiels
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <a href="https://www.ville-bruz.fr/" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#2563eb" }}>Site Ville de Bruz ↗</a>
                <a href="https://www.ville-bruz.fr/ma-ville-de-bruz/conseil-municipal/conseil-municipal/" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#2563eb" }}>Conseil municipal (CRs + délibérations) ↗</a>
                <a href="https://data.megalis.bretagne.bzh/organization/commune-de-bruz" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#2563eb" }}>Open data Mégalis Bretagne ↗</a>
                <a href="https://www.youtube.com/playlist?list=PLnSe2hJFinqpupninWlKBHSmzmwLW-8i7" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#2563eb" }}>CMs en audio sur YouTube ↗</a>
              </div>
            </div>

            {/* Autres dossiers */}
            {autresDossiers.length > 0 && (
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 }}>
                <h3 style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748b" }}>
                  Autres dossiers
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {autresDossiers.map(d => (
                    <a key={d.id} href={`/bruz-en-action/dossiers/${d.id}`}
                      style={{ fontSize: 13, color: "#2563eb", lineHeight: 1.5, textDecoration: "none", paddingBottom: 10, borderBottom: "1px solid #f1f5f9" }}>
                      <span style={{ fontWeight: 600, display: "block" }}>{d.titre}</span>
                      <span style={{ color: "#94a3b8", fontSize: 12 }}>{d.categorie}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ background: "#0f172a", color: "rgba(255,255,255,0.6)", padding: "32px 24px", textAlign: "center" }}>
        <a href="/bruz-en-action" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", fontSize: 13 }}>
          ← Retour à l'accueil — {association.nom}
        </a>
      </footer>
    </div>
  );
}
