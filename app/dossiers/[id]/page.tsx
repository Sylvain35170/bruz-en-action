import { notFound } from "next/navigation";
import Link from "next/link";
import dossiersData from "../../../data/dossiers.json";
import metaData from "../../../data/meta.json";
import NavBar from "../../../components/NavBar";
import SiteFooter from "../../../components/SiteFooter";
import SignalementButton from "../../../components/SignalementButton";

export function generateStaticParams() {
  return dossiersData.dossiers.map(d => ({ id: d.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dossier = dossiersData.dossiers.find(d => d.id === id);
  if (!dossier) return {};
  const title = `${dossier.titre} — Bruz en Action`;
  const description = dossier.chapeau;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://sylvain35170.github.io/bruz-en-action/dossiers/${id}`,
      siteName: "Bruz en Action",
      locale: "fr_FR",
      type: "article",
    },
  };
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
        {[0, 0.25, 0.5, 0.75, 1].map(p => {
          const y = PAD_T + chartH * (1 - p);
          return (
            <g key={p}>
              <line x1={PAD_L} y1={y} x2={W} y2={y} stroke="#f1f5f9" strokeWidth={p === 0 ? 0 : 1} />
              {p > 0 && <text x={PAD_L - 4} y={y + 4} textAnchor="end" fontSize={9} fill="#94a3b8">{(max * p).toFixed(max * p > 100 ? 0 : 1)}</text>}
            </g>
          );
        })}
        <line x1={PAD_L} y1={PAD_T + chartH} x2={W} y2={PAD_T + chartH} stroke="#e2e8f0" strokeWidth={1} />
        {g.donnees.map((d, i) => {
          const bH = (d.valeur / max) * chartH;
          const x = PAD_L + i * barSpacing + (barSpacing - barW) / 2;
          const y = PAD_T + chartH - bH;
          const fill = d.confirme === false ? "#94a3b8" : "#E8A040";
          const lines = d.label.split("\n");
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={bH} rx={4} fill={fill} />
              <text x={x + barW / 2} y={y - 5} textAnchor="middle" fontSize={10} fontWeight="bold" fill="#0f172a">{d.valeur}</text>
              {lines.map((line, li) => (
                <text key={li} x={x + barW / 2} y={PAD_T + chartH + 14 + li * 11} textAnchor="middle" fontSize={10} fill="#475569">{line}</text>
              ))}
            </g>
          );
        })}
      </svg>
      {g.donnees.some(d => d.confirme === false) && (
        <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
          <span style={{ fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 12, height: 12, background: "#E8A040", borderRadius: 2, display: "inline-block" }} /> Donnée confirmée</span>
          <span style={{ fontSize: 11, color: "#64748b", display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 12, height: 12, background: "#94a3b8", borderRadius: 2, display: "inline-block" }} /> Estimation indicative</span>
        </div>
      )}
      {g.note && <p style={{ margin: "10px 0 0", fontSize: 11, color: "#94a3b8", lineHeight: 1.5, fontStyle: "italic" }}>{g.note}</p>}
      {g.source && <p style={{ margin: "4px 0 0", fontSize: 11, color: "#cbd5e1" }}>Source : {g.source}</p>}
    </div>
  );
}

function SvgHorizontalBarChart({ g }: { g: Graphique }) {
  const ROW_H = 40, PAD_L = 130, PAD_R = 50, BAR_MAX_W = 240;
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
          const fill = d.confirme === false ? "#94a3b8" : "#E8A040";
          return (
            <g key={i}>
              <text x={PAD_L - 8} y={y + 14} textAnchor="end" fontSize={11} fill="#334155">{d.label}</text>
              <rect x={PAD_L} y={y + 2} width={bW} height={22} rx={4} fill={fill} />
              <text x={PAD_L + bW + 6} y={y + 17} fontSize={11} fontWeight="bold" fill="#0f172a">{d.valeur} M€</text>
            </g>
          );
        })}
      </svg>
      {g.note && <p style={{ margin: "10px 0 0", fontSize: 11, color: "#94a3b8", lineHeight: 1.5, fontStyle: "italic" }}>{g.note}</p>}
      {g.source && <p style={{ margin: "4px 0 0", fontSize: 11, color: "#cbd5e1" }}>Source : {g.source}</p>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 17, fontWeight: 800, margin: "0 0 16px", color: "#0f172a", paddingBottom: 8, borderBottom: "2px solid #E8A040", display: "inline-block" }}>
      {children}
    </h2>
  );
}

export default async function DossierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dossier = dossiersData.dossiers.find(d => d.id === id) as any;
  if (!dossier) notFound();

  const { association, contact } = metaData;
  const hasHelloAsso = Boolean(contact.hello_asso_url);
  const autresDossiers = dossiersData.dossiers.filter(d => d.id !== id).slice(0, 5);

  const ceQuOnSait: string[] = dossier.ce_quon_sait ?? [];
  const quiDecide: { nom: string; role: string }[] = dossier.qui_decide ?? [];
  const decisions: { date: string; description: string; source_url?: string }[] = dossier.decisions ?? [];
  const ceQuOnSuit: string[] = dossier.ce_quon_suit ?? [];
  const actus: { date: string; titre: string; detail: string; source_url?: string; source_label?: string; article_id?: string }[] = dossier.actus_recentes ?? [];
  const sources: { label: string; url: string }[] = dossier.sources ?? [];
  const graphiques: Graphique[] = dossier.graphiques ?? [];
  const ideesAilleurs: { commune: string; idee: string; pourquoi_bruz: string; source_url?: string }[] = dossier.idees_ailleurs ?? [];

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "var(--font-sans, system-ui)", background: "#f8fafc" }}>

      {/* Header */}
      <header style={{ background: "linear-gradient(135deg, #0E2F62 0%, #1A4177 100%)", color: "#fff" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "16px 24px" }}>
          <NavBar />
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg, #0E2F62 0%, #1A4177 100%)", color: "#fff", paddingBottom: 48 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 24px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <span style={{ padding: "3px 10px", borderRadius: 999, background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {dossier.categorie}
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: STATUT_COLOR[dossier.statut] ?? "#94a3b8" }}>
              ● {STATUT_LABEL[dossier.statut] ?? dossier.statut}
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 2.2rem)", fontWeight: 800, lineHeight: 1.2, margin: "0 0 16px", maxWidth: 720, color: "#fff" }}>
            {dossier.titre}
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.75, color: "rgba(255,255,255,0.8)", maxWidth: 680, margin: 0 }}>
            {dossier.chapeau}
          </p>
        </div>
      </section>

      {/* Lien "En profondeur" pour D01 et D02 */}
      {(dossier.id === "D01" || dossier.id === "D02") && (
        <div style={{ background: "linear-gradient(90deg, #fff8f5, #fff)", borderBottom: "1px solid #fed7aa", padding: "16px 24px" }}>
          <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#E8A040", display: "block", marginBottom: 2 }}>Analyse éditoriale</span>
              <span style={{ fontSize: 14, color: "#334155" }}>
                {dossier.id === "D01"
                  ? "Pourquoi ça compte, les deux visions du terminus, notre lecture"
                  : "Les acteurs nommés, la densité expliquée en chiffres, notre lecture"}
              </span>
            </div>
            <a href={`/bruz-en-action/dossiers/${dossier.id}/en-profondeur`}
              style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#E8A040", color: "#fff", borderRadius: 999, textDecoration: "none", fontSize: 14, fontWeight: 700 }}>
              Lire en profondeur →
            </a>
          </div>
        </div>
      )}

      {/* Illustration dossier */}
      {dossier.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={dossier.image} alt={`Illustration — ${dossier.titre}`}
          style={{ width: "100%", maxHeight: 260, objectFit: "cover", objectPosition: "center", display: "block" }} />
      )}

      {/* Lien carte D05 */}
      {dossier.lien_externe && (
        <div style={{ background: "#f0f9ff", borderBottom: "1px solid #bae6fd", padding: "16px 24px", textAlign: "center" }}>
          <a href={dossier.lien_externe}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 24px", background: "#0369a1", color: "#fff", borderRadius: 8, fontWeight: 700, textDecoration: "none", fontSize: 15 }}>
            🗺️ Ouvrir la carte interactive →
          </a>
        </div>
      )}

      <main style={{ flex: 1 }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 600px), 1fr))", gap: 48, alignItems: "start" }}>

          {/* Colonne principale */}
          <div>

            {/* Ce qu'on sait */}
            {ceQuOnSait.length > 0 && (
              <section style={{ marginBottom: 36 }}>
                <SectionTitle>Ce qu'on sait</SectionTitle>
                <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "4px 0" }}>
                  {ceQuOnSait.map((pt, i) => (
                    <div key={i} style={{
                      display: "flex", gap: 14, padding: "13px 20px",
                      borderBottom: i < ceQuOnSait.length - 1 ? "1px solid #f1f5f9" : "none",
                      fontSize: 14, lineHeight: 1.65, color: "#334155",
                    }}>
                      <span style={{ color: "#E8A040", fontWeight: 800, flexShrink: 0, marginTop: 1 }}>→</span>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Idées d'ailleurs */}
            {ideesAilleurs.length > 0 && (
              <section style={{ marginBottom: 36 }}>
                <SectionTitle>Ce que font d'autres communes</SectionTitle>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {ideesAilleurs.map((item, i) => (
                    <div key={i} style={{
                      background: "#fff", border: "1px solid #e2e8f0",
                      borderLeft: "3px solid #7c3aed", borderRadius: 10, padding: "16px 20px",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 800, textTransform: "uppercase",
                          letterSpacing: "0.08em", color: "#7c3aed",
                          background: "#f5f3ff", padding: "2px 10px", borderRadius: 999,
                        }}>{item.commune}</span>
                      </div>
                      <p style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 600, color: "#0f172a", lineHeight: 1.5 }}>
                        {item.idee}
                      </p>
                      <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.6, fontStyle: "italic" }}>
                        → Pour Bruz : {item.pourquoi_bruz}
                      </p>
                      {item.source_url && (
                        <a href={item.source_url} target="_blank" rel="noopener noreferrer"
                          style={{ display: "inline-block", marginTop: 8, fontSize: 12, color: "#7c3aed", textDecoration: "none" }}>
                          Source ↗
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Qui décide */}
            {quiDecide.length > 0 && (
              <section style={{ marginBottom: 36 }}>
                <SectionTitle>Qui décide ?</SectionTitle>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {quiDecide.map((q, i) => (
                    <div key={i} style={{
                      background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10,
                      padding: "14px 18px", display: "flex", gap: 16, alignItems: "flex-start",
                    }}>
                      <div style={{ flexShrink: 0, width: 8, height: 8, borderRadius: "50%", background: "#E8A040", marginTop: 7 }} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginBottom: 3 }}>{q.nom}</div>
                        <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>{q.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Décisions */}
            {decisions.length > 0 && (
              <section style={{ marginBottom: 36 }}>
                <SectionTitle>Décisions clés</SectionTitle>
                <div style={{ position: "relative", paddingLeft: 20 }}>
                  <div style={{ position: "absolute", left: 5, top: 6, bottom: 6, width: 2, background: "#e2e8f0" }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {decisions.map((d, i) => (
                      <div key={i} style={{ position: "relative" }}>
                        <div style={{ position: "absolute", left: -18, top: 5, width: 8, height: 8, borderRadius: "50%", background: "#E8A040", border: "2px solid #fff", boxShadow: "0 0 0 2px #E8A040" }} />
                        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "12px 16px" }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>
                            {new Date(d.date + (d.date.length <= 7 ? "-01" : "")).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                          </div>
                          <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.6 }}>{d.description}</div>
                          {d.source_url && (
                            <a href={d.source_url} target="_blank" rel="noopener noreferrer"
                              style={{ display: "inline-block", marginTop: 8, fontSize: 12, color: "#2563eb" }}>
                              Source ↗
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
            {graphiques.length > 0 && (
              <section style={{ marginBottom: 36 }}>
                <SectionTitle>Données</SectionTitle>
                {graphiques.map(g =>
                  g.type === "horizontal_bar"
                    ? <SvgHorizontalBarChart key={g.id} g={g} />
                    : <SvgBarChart key={g.id} g={g} />
                )}
              </section>
            )}

            {/* Ce qu'on surveille */}
            {ceQuOnSuit.length > 0 && (
              <section style={{ marginBottom: 36 }}>
                <SectionTitle>Ce qu'on surveille</SectionTitle>
                <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "4px 0" }}>
                  {ceQuOnSuit.map((item, i) => (
                    <div key={i} style={{
                      display: "flex", gap: 14, padding: "12px 20px",
                      borderBottom: i < ceQuOnSuit.length - 1 ? "1px solid #fef3c7" : "none",
                      fontSize: 14, lineHeight: 1.65, color: "#78350f",
                    }}>
                      <span style={{ flexShrink: 0, marginTop: 1 }}>👁</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Actus récentes */}
            {actus.length > 0 && (
              <section style={{ marginBottom: 36 }}>
                <SectionTitle>Dernières actus</SectionTitle>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {actus.map((a, i) => (
                    <div key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 18px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          {new Date(a.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                        {a.source_label && <span style={{ fontSize: 11, color: "#cbd5e1" }}>{a.source_label}</span>}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{a.titre}</div>
                      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "#64748b" }}>{a.detail}</p>
                      {a.article_id && (
                        <Link href={`/bruz-en-action/articles/${a.article_id}`}
                          style={{ display: "inline-block", marginTop: 8, fontSize: 12, fontWeight: 600, color: "#E8A040" }}>
                          Lire l'analyse →
                        </Link>
                      )}
                      {!a.article_id && a.source_url && (
                        <a href={a.source_url} target="_blank" rel="noopener noreferrer"
                          style={{ display: "inline-block", marginTop: 8, fontSize: 12, color: "#2563eb" }}>
                          Lire l'article ↗
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Contribuer */}
            <section style={{ padding: "20px 24px", background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: 12 }}>
              <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: "#0369a1" }}>
                Vous avez des infos sur ce dossier ?
              </h3>
              <p style={{ margin: "0 0 14px", fontSize: 13, color: "#0c4a6e", lineHeight: 1.6 }}>
                Témoignage, document public, inexactitude à corriger — on lit tout et on répond.
              </p>
              <SignalementButton reference={`${dossier.id} — ${dossier.titre}`} />
            </section>
          </div>

          {/* Sidebar */}
          <aside style={{ display: "flex", flexDirection: "column", gap: 20, position: "sticky", top: 24 }}>

            {/* Sources */}
            {sources.length > 0 && (
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 20px" }}>
                <h3 style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748b" }}>
                  Sources
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {sources.map((s, i) => (
                    <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 13, color: "#2563eb", lineHeight: 1.5, textDecoration: "none", paddingBottom: 8, borderBottom: i < sources.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                      {s.label} ↗
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Liens officiels */}
            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 20px" }}>
              <h3 style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748b" }}>
                Liens officiels
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <a href="https://www.ville-bruz.fr/" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#2563eb" }}>Ville de Bruz ↗</a>
                <a href="https://data.megalis.bretagne.bzh/organization/commune-de-bruz" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#2563eb" }}>Open data Mégalis ↗</a>
                <a href="https://www.youtube.com/playlist?list=PLnSe2hJFinqpupninWlKBHSmzmwLW-8i7" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#2563eb" }}>CMs audio YouTube ↗</a>
              </div>
            </div>

            {/* Autres dossiers */}
            {autresDossiers.length > 0 && (
              <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "16px 20px" }}>
                <h3 style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748b" }}>
                  Autres dossiers
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {autresDossiers.map(d => (
                    <a key={d.id} href={`/bruz-en-action/dossiers/${d.id}`}
                      style={{ fontSize: 13, color: "#334155", textDecoration: "none", paddingBottom: 8, borderBottom: "1px solid #f1f5f9", lineHeight: 1.4 }}>
                      <span style={{ fontWeight: 600, color: "#2563eb", display: "block" }}>{d.titre}</span>
                      <span style={{ color: "#94a3b8", fontSize: 11 }}>{d.categorie}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
