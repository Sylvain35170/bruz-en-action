import Image from "next/image";
import promessesData from "../data/promesses.json";
import actusData from "../data/actus.json";
import metaData from "../data/meta.json";
import PromessesSection from "../components/PromessesSection";
import type { Pilier, Statut, Promesse, Actu } from "../types";

export default function Home() {
  const { piliers, statuts, promesses } = promessesData as {
    piliers: Pilier[];
    statuts: Statut[];
    promesses: Promesse[];
    meta: unknown;
  };
  const { actus } = actusData as { actus: Actu[]; meta: unknown };
  const { association, bureau, sources_surveillees } = metaData;

  const total = promesses.length;
  const tenues = promesses.filter((p) => p.statut_id === "tenu").length;
  const enCours = promesses.filter((p) => p.statut_id === "en_cours").length;
  const nonCommences = promesses.filter((p) => p.statut_id === "non_commence").length;
  const score = total > 0 ? Math.round((tenues / total) * 100) : 0;

  const countByPilier = (id: number) => promesses.filter((p) => p.pilier_id === id).length;
  const tenusByPilier = (id: number) =>
    promesses.filter((p) => p.pilier_id === id && p.statut_id === "tenu").length;

  const bureauLine = `Présidence · ${bureau.president} · Trésorerie · ${bureau.tresorier} · Secrétariat · ${bureau.secretaire}`;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--surface-page)" }}>

      {/* ── HEADER ── */}
      <header style={{ background: "var(--night-gradient)", color: "#fff" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "20px var(--container-pad) 44px" }}>

          {/* Top bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, paddingBottom: 36, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <Image
              src="/logo.png"
              alt={association.nom}
              width={180}
              height={56}
              style={{ objectFit: "contain", filter: "brightness(0) invert(1)" }}
              priority
            />
            <span style={{ fontSize: "var(--fs-sm)", fontWeight: "var(--fw-semibold)", letterSpacing: "var(--ls-wide)", color: "var(--text-on-dark-muted)" }}>
              Veille citoyenne · Bruz (35)
            </span>
          </div>

          {/* Hero */}
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 32, alignItems: "center", marginTop: 36 }} className="bea-hero">
            <div>
              <span className="eyebrow" style={{ color: "var(--brand-accent)" }}>Mandat 2026 – 2031</span>
              <h1 style={{ color: "#fff", fontSize: "clamp(1.9rem, 4vw, 2.6rem)", fontWeight: "var(--fw-black)", margin: "12px 0 0", maxWidth: 620, lineHeight: 1.12 }}>
                Suivre, sans parti pris, les engagements pris par Jean-René Houssin.
              </h1>
              <p style={{ color: "var(--text-on-dark-muted)", fontSize: "var(--fs-lg)", maxWidth: 560, margin: "16px 0 0", lineHeight: "var(--lh-relaxed)" }}>
                {association.mission}
              </p>
            </div>

            {/* Score block */}
            <div style={{
              flexShrink: 0,
              minWidth: 160,
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              backdropFilter: "blur(14px)",
              borderRadius: "var(--radius-xl)",
              padding: "28px 32px",
              textAlign: "center",
            }}>
              <p className="tabular" style={{ fontSize: "var(--fs-display)", fontWeight: "var(--fw-black)", color: "#fff", margin: 0, lineHeight: 1 }}>
                {score}%
              </p>
              <p style={{ fontSize: "var(--fs-xs)", fontWeight: "var(--fw-semibold)", letterSpacing: "var(--ls-label)", textTransform: "uppercase", color: "var(--brand-accent)", margin: "8px 0 0" }}>
                Des promesses tenues
              </p>
              <p style={{ fontSize: "var(--fs-2xs)", color: "var(--text-on-dark-faint)", margin: "6px 0 0" }}>
                {total} engagements suivis
              </p>
            </div>
          </div>

          {/* Bureau */}
          <div style={{ marginTop: 40, fontSize: "var(--fs-2xs)", color: "var(--text-on-dark-faint)", letterSpacing: "var(--ls-wide)" }}>
            {bureauLine}
          </div>
        </div>
      </header>

      {/* ── COMPTEURS ── */}
      <div style={{ background: "var(--surface-card)", borderBottom: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-xs)" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "28px var(--container-pad)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--grid-gap)" }}>
            {[
              { value: total,        label: "Promesses totales", color: "var(--slate-900)", tint: "var(--slate-50)" },
              { value: tenues,       label: "Tenues",            color: "var(--status-done)",      tint: "var(--status-done-tint)" },
              { value: enCours,      label: "En cours",          color: "var(--status-progress)",  tint: "var(--status-progress-tint)" },
              { value: nonCommences, label: "Non commencées",    color: "var(--status-todo)",      tint: "var(--status-todo-tint)" },
            ].map(({ value, label, color, tint }) => (
              <div key={label} style={{ background: tint, borderRadius: "var(--radius-lg)", padding: "20px 24px", display: "flex", alignItems: "center", gap: 16 }}>
                <p className="tabular" style={{ fontSize: "var(--fs-display)", fontWeight: "var(--fw-black)", color, margin: 0, lineHeight: 1 }}>{value}</p>
                <p style={{ fontSize: "var(--fs-xs)", fontWeight: "var(--fw-medium)", color: "var(--text-muted)", margin: 0, lineHeight: "var(--lh-snug)" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PILIERS ── */}
      <section style={{ background: "var(--surface-page)" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "var(--section-gap) var(--container-pad)" }}>
          <div style={{ maxWidth: 680, marginBottom: "var(--space-8)" }}>
            <span className="eyebrow">Programme électoral</span>
            <h2 style={{ fontSize: "var(--fs-h2)", margin: "10px 0 0" }}>L'avancement, thème par thème</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "var(--fs-lg)", margin: "10px 0 0", lineHeight: "var(--lh-relaxed)" }}>
              Les {total} engagements du programme, répartis en {piliers.length} thèmes.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "var(--grid-gap)" }}>
            {piliers.map((pilier) => {
              const count = countByPilier(pilier.id);
              const tenus = tenusByPilier(pilier.id);
              const pct = count > 0 ? Math.round((tenus / count) * 100) : 0;
              return (
                <div key={pilier.id} style={{
                  background: "var(--surface-card)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "var(--shadow-sm)",
                  overflow: "hidden",
                }}>
                  <div style={{ height: "var(--pillar-bar-height)", background: pilier.color }} />
                  <div style={{ padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-3)" }}>
                      <h3 style={{ fontSize: "var(--fs-h3)", fontWeight: "var(--fw-bold)" }}>
                        {pilier.emoji} {pilier.label}
                      </h3>
                      <span className="tabular" style={{
                        flexShrink: 0,
                        padding: "3px 10px",
                        borderRadius: "var(--radius-pill)",
                        background: `color-mix(in srgb, ${pilier.color} 12%, white)`,
                        color: pilier.color,
                        fontSize: "var(--fs-xs)",
                        fontWeight: "var(--fw-bold)",
                      }}>
                        {count} promesse{count > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span className="eyebrow" style={{ color: "var(--text-faint)" }}>Avancement</span>
                        <span className="tabular" style={{ fontSize: "var(--fs-sm)", fontWeight: "var(--fw-bold)", color: "var(--text-strong)" }}>{pct}%</span>
                      </div>
                      <div style={{ height: 8, borderRadius: "var(--radius-pill)", background: "var(--surface-sunken)", overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: "var(--radius-pill)", background: pilier.color, width: `${pct}%`, transition: `width var(--dur-base) var(--ease-out)` }} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SUIVI ── */}
      <PromessesSection promesses={promesses} piliers={piliers} statuts={statuts} />

      {/* ── ACTUALITÉS ── */}
      <section style={{ background: "var(--surface-page)" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "var(--section-gap) var(--container-pad)" }}>
          <div style={{ maxWidth: 680, marginBottom: "var(--space-8)" }}>
            <span className="eyebrow">Actualités</span>
            <h2 style={{ fontSize: "var(--fs-h2)", margin: "10px 0 0" }}>Les avancées et reculs, au fil du mandat</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "var(--fs-lg)", margin: "10px 0 0", lineHeight: "var(--lh-relaxed)" }}>
              La veille publiera ici chaque évolution constatée sur un engagement, avec sa source.
            </p>
          </div>

          {actus.length === 0 ? (
            <div style={{
              background: "var(--surface-card)",
              border: "2px dashed var(--border-subtle)",
              borderRadius: "var(--radius-lg)",
              padding: "64px 24px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>🗞️</div>
              <p style={{ fontWeight: "var(--fw-bold)", color: "var(--text-strong)", margin: "0 0 8px", fontSize: "var(--fs-lg)" }}>
                Aucune actualité pour le moment
              </p>
              <p style={{ color: "var(--text-muted)", margin: 0, fontSize: "var(--fs-sm)", maxWidth: 400, marginLeft: "auto", marginRight: "auto" }}>
                Le suivi vient de démarrer. Les premières actualités sourcées apparaîtront ici dès qu'une évolution sera constatée.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--grid-gap)" }}>
              {actus.map((actu) => (
                <div key={actu.id} style={{ background: "var(--surface-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", padding: "var(--space-6)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                    <div>
                      <p style={{ fontSize: "var(--fs-xs)", color: "var(--text-faint)", margin: "0 0 4px" }}>{actu.date}</p>
                      <p style={{ fontWeight: "var(--fw-bold)", color: "var(--text-strong)", margin: "0 0 6px" }}>{actu.titre}</p>
                      <p style={{ fontSize: "var(--fs-sm)", color: "var(--text-muted)", margin: 0 }}>{actu.contenu}</p>
                    </div>
                    {actu.lien && (
                      <a href={actu.lien} target="_blank" rel="noopener noreferrer" style={{
                        flexShrink: 0,
                        padding: "6px 14px",
                        fontSize: "var(--fs-xs)",
                        fontWeight: "var(--fw-semibold)",
                        color: "var(--pillar-eco, #2563eb)",
                        background: "var(--pillar-eco-tint, #eff6ff)",
                        borderRadius: "var(--radius-pill)",
                        alignSelf: "flex-start",
                      }}>
                        Source ↗
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "var(--night-900)", color: "var(--text-on-dark-muted)", marginTop: "auto" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "48px var(--container-pad)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.2fr) minmax(0,2fr)", gap: 40 }} className="bea-foot">
            <div>
              <Image src="/logo.png" alt={association.nom} width={160} height={50} style={{ objectFit: "contain", filter: "brightness(0) invert(1)" }} />
              <p style={{ fontSize: "var(--fs-sm)", lineHeight: "var(--lh-relaxed)", maxWidth: 320, marginTop: 16, color: "var(--text-on-dark-muted)" }}>
                Association citoyenne de veille municipale. Non partisane, sans étiquette. Fondée en {association.fondee_en}.
              </p>
            </div>
            <div>
              <span className="eyebrow" style={{ color: "var(--text-on-dark-faint)" }}>Sources surveillées</span>
              <ul style={{ listStyle: "none", padding: 0, margin: "14px 0 0", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: "8px 24px" }}>
                {sources_surveillees.map((s) => (
                  <li key={s.id}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--link-on-dark)", fontSize: "var(--fs-sm)", fontWeight: "var(--fw-medium)" }}>
                      {s.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.1)", fontSize: "var(--fs-xs)", color: "var(--text-on-dark-faint)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <span>© {association.fondee_en} {association.nom} · Association loi 1901</span>
            <span>{association.positionnement}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
