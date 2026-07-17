import type { Metadata } from "next";
import bruz from "../../data/bruz.json";
import histoire from "../../data/histoire.json";
import NavBar from "../../components/NavBar";
import SiteFooter from "../../components/SiteFooter";
import LineSeriesChart from "../../components/charts/LineSeriesChart";

export const metadata: Metadata = {
  title: "Histoire de Bruz — des origines à aujourd'hui | Bruz en Action",
  description:
    "L'histoire de Bruz racontée par les faits et les chiffres : des origines médiévales au bombardement du 8 mai 1944, de la reconstruction à Ker Lann, jusqu'à la ZAC Multisites d'aujourd'hui.",
  openGraph: {
    title: "Histoire de Bruz — des origines à aujourd'hui | Bruz en Action",
    description:
      "Le bombardement de 1944, la reconstruction, Ker Lann, les mandats municipaux depuis 1881 — l'histoire de Bruz, sourcée.",
    url: "https://sylvain35170.github.io/bruz-en-action/histoire",
    siteName: "Bruz en Action",
    locale: "fr_FR",
    type: "website",
  },
};

type FriseEvent = {
  id: string;
  periode: string;
  titre: string;
  texte: string;
  niveau_confiance: "haute" | "mixte";
  cycle_urbanisation?: number;
  dossier_lien?: string;
};

const CYCLE_COLORS: Record<number, string> = {
  1: "#E8A040",
  2: "#0284c7",
  3: "#7c3aed",
  4: "#dc2626",
};

function SectionTitle({ emoji, children }: { emoji: string; children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 21, fontWeight: 800, color: "#0f172a", margin: "0 0 16px", display: "flex", alignItems: "center", gap: 10 }}>
      <span>{emoji}</span>
      {children}
    </h2>
  );
}

function LienDossier({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} style={{ fontSize: 13, fontWeight: 600, color: "#1A4177", textDecoration: "none" }}>
      📁 {label} →
    </a>
  );
}

const fr = (n: number) => n.toLocaleString("fr-FR");

export default function HistoirePage() {
  const pop = bruz.series_longues.population;
  const seriePop = Object.entries(pop.valeurs).map(([annee, valeur]) => ({
    annee: Number(annee),
    valeur: Number(valeur),
  }));
  const frise = histoire.frise as FriseEvent[];
  const cycles = histoire.cycles_urbanisation;
  const maires = histoire.maires;
  const sources = histoire.sources;

  const popActuelle = seriePop[seriePop.length - 1].valeur;
  const pop1968 = seriePop.find((p) => p.annee === 1968)?.valeur;
  const pop1954 = seriePop.find((p) => p.annee === 1954)?.valeur;

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
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "36px 24px 0" }}>
          <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, lineHeight: 1.2, margin: "0 0 12px", color: "#fff" }}>
            🕰️ Bruz au fil du temps
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: "rgba(255,255,255,0.7)", maxWidth: 640, margin: 0 }}>
            Des origines médiévales aux 19 683 habitants d'aujourd'hui — l'histoire de Bruz racontée par les faits
            et par les chiffres, avec une attention particulière au moment le plus tragique de la commune : le
            bombardement du 8 mai 1944.
          </p>
        </div>
      </section>

      <main style={{ flex: 1 }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px 56px" }}>

          {/* ————— Population ————— */}
          <section style={{ marginBottom: 48 }}>
            <SectionTitle emoji="📈">Une population multipliée par huit depuis 1793</SectionTitle>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: "#334155", margin: "0 0 20px" }}>
              La courbe raconte à elle seule la trajectoire de la commune : un bourg rural stable entre 2 000 et
              3 500 habitants pendant plus d'un siècle, un choc démographique nul malgré les 183 morts du
              bombardement de 1944 (la population communale — hors bourg détruit — ne recule pas), puis une
              croissance continue portée par la reconstruction, l'automobile et enfin le campus de Ker Lann.
              {pop1968 && (
                <>
                  {" "}Depuis 1968 ({fr(pop1968)} hab.), la population a été multipliée par{" "}
                  <strong>{(popActuelle / pop1968).toFixed(1)}</strong> — et par{" "}
                  <strong>{pop1954 ? (popActuelle / pop1954).toFixed(1) : "?"}</strong> depuis 1954, sortie de la
                  reconstruction.
                </>
              )}
            </p>
            <LineSeriesChart
              titre="Population de Bruz depuis 1793"
              sousTitre="Points 1793-1872 : Cassini/EHESS. Points 1876-2023 : INSEE (concepts de population variables selon les époques — voir /statistiques)."
              serie={seriePop}
              unite="Habitants"
              source={pop.source}
              sourceUrl={pop.source_url}
            />
          </section>

          {/* ————— Frise ————— */}
          <section style={{ marginBottom: 48 }}>
            <SectionTitle emoji="🕐">La frise</SectionTitle>
            <div style={{ position: "relative", paddingLeft: 32 }}>
              <div style={{ position: "absolute", left: 10, top: 0, bottom: 0, width: 2, background: "#e2e8f0" }} />
              {frise.map((ev) => {
                const color = ev.cycle_urbanisation ? CYCLE_COLORS[ev.cycle_urbanisation] : "#64748b";
                return (
                  <div key={ev.id} style={{ position: "relative", marginBottom: 28 }}>
                    <div style={{ position: "absolute", left: -28, top: 4, width: 16, height: 16, borderRadius: "50%", background: color, border: "3px solid #f8fafc", boxShadow: "0 0 0 2px #cbd5e1", flexShrink: 0 }} />
                    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderLeft: `3px solid ${color}`, borderRadius: 8, padding: "14px 18px" }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: color }}>
                          {ev.periode}
                        </span>
                        {ev.niveau_confiance === "mixte" && (
                          <span style={{ fontSize: 9.5, fontWeight: 700, color: "#92400e", background: "#fffbeb", padding: "1px 7px", borderRadius: 999 }}>
                            sources tertiaires
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>{ev.titre}</div>
                      <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.7, color: "#334155" }}>{ev.texte}</p>
                      {ev.dossier_lien && (
                        <div style={{ marginTop: 10, borderTop: "1px solid #f1f5f9", paddingTop: 10 }}>
                          <LienDossier href={`/bruz-en-action/dossiers/${ev.dossier_lien}`} label={`Dossier ${ev.dossier_lien} — la suite aujourd'hui`} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ————— Les 4 cycles d'urbanisation ————— */}
          <section style={{ marginBottom: 48 }}>
            <SectionTitle emoji="🏗️">Quatre cycles d'urbanisation</SectionTitle>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: "#334155", margin: "0 0 20px" }}>
              Depuis la Seconde Guerre mondiale, Bruz a connu quatre grandes vagues de construction — la ZAC
              Multisites d'aujourd'hui n'est que la dernière d'une longue série.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
              {cycles.map((c) => (
                <div key={c.numero} style={{ background: "#fff", border: "1px solid #e2e8f0", borderTop: `3px solid ${CYCLE_COLORS[c.numero]}`, borderRadius: 10, padding: "16px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: CYCLE_COLORS[c.numero] }}>{c.numero}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: "4px 0 2px" }}>{c.label}</div>
                  <div style={{ fontSize: 11.5, color: "#64748b" }}>{c.periode}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16 }}>
              <LienDossier href="/bruz-en-action/dossiers/D02" label="Dossier ZAC Multisites : le 4ᵉ cycle en cours" />
            </div>
          </section>

          {/* ————— Les maires ————— */}
          <section style={{ marginBottom: 32 }}>
            <SectionTitle emoji="🏛️">Les maires de Bruz depuis 1881</SectionTitle>
            <p style={{ fontSize: 13.5, lineHeight: 1.7, color: "#334155", margin: "0 0 16px" }}>
              Le bombardement de 1944 décapite le conseil municipal — maire, premier adjoint et dix conseillers
              tués. Trois maires se succèdent en cinq ans à la Libération, dont Germaine Marquer, l'une des
              premières femmes élues maires en France, elle-même sinistrée du bombardement et issue d'une famille
              qui a dirigé la commune 38 ans avant elle. Vient ensuite une ère de stabilité : 29 ans pour Alphonse
              Legault, 19 pour Robert Barré.
            </p>
            <div style={{ overflowX: "auto", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    <th style={{ textAlign: "left", padding: "8px 14px", color: "#64748b", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Mandat</th>
                    <th style={{ textAlign: "left", padding: "8px 14px", color: "#64748b", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Maire</th>
                    <th style={{ textAlign: "left", padding: "8px 14px", color: "#64748b", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {maires.map((m, i) => (
                    <tr key={i} style={{ borderTop: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "8px 14px", color: "#64748b", whiteSpace: "nowrap" }}>{m.debut} – {m.fin ?? "en cours"}</td>
                      <td style={{ padding: "8px 14px", fontWeight: 700, color: "#0f172a" }}>{m.nom}</td>
                      <td style={{ padding: "8px 14px", color: "#334155" }}>{m.note ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ————— Sources ————— */}
          <section>
            <details>
              <summary style={{ fontSize: 13, fontWeight: 700, color: "#64748b", cursor: "pointer" }}>
                Sources ({sources.length})
              </summary>
              <ul style={{ marginTop: 10, paddingLeft: 20, fontSize: 12.5, lineHeight: 1.9, color: "#475569" }}>
                {sources.map((s, i) => (
                  <li key={i}>
                    {s.url ? (
                      <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: "#0284c7", textDecoration: "none" }}>
                        {s.label} ↗
                      </a>
                    ) : (
                      s.label
                    )}
                  </li>
                ))}
              </ul>
            </details>
          </section>

        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
