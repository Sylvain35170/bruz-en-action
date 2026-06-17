const LOGO = "/bruz-en-action/logo.png";
import promessesData from "../data/promesses.json";
import actusData from "../data/actus.json";
import metaData from "../data/meta.json";
import evenementsData from "../data/evenements.json";
import elusData from "../data/elus.json";
import dossiersData from "../data/dossiers.json";
import cmsData from "../data/cms.json";
import PromessesSection from "../components/PromessesSection";
import type { Pilier, Statut, Promesse, Actu } from "../types";

/* ─── helpers ─── */
function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}
function fmtShort(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function Home() {
  const { piliers, statuts, promesses } = promessesData as {
    piliers: Pilier[]; statuts: Statut[]; promesses: Promesse[]; meta: unknown;
  };
  const { actus } = actusData as { actus: Actu[]; meta: unknown };
  const { association, bureau, contact, reseaux_sociaux, sources_surveillees } = metaData;
  const { evenements } = evenementsData;
  const { elus } = elusData;
  const { dossiers } = dossiersData;

  const total = promesses.length;
  const tenues = promesses.filter(p => p.statut_id === "tenu").length;
  const enCours = promesses.filter(p => p.statut_id === "en_cours").length;
  const nonCommences = promesses.filter(p => p.statut_id === "non_commence").length;
  const score = total > 0 ? Math.round((tenues / total) * 100) : 0;
  const countByPilier = (id: number) => promesses.filter(p => p.pilier_id === id).length;
  const tenusByPilier = (id: number) => promesses.filter(p => p.pilier_id === id && p.statut_id === "tenu").length;

  const hasHelloAsso = Boolean(contact.hello_asso_url);
  const hasSocial = Boolean(reseaux_sociaux.facebook || reseaux_sociaux.instagram);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--surface-page)" }}>

      {/* ── HEADER ── */}
      <header style={{ background: "var(--night-gradient)", color: "#fff" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "20px var(--container-pad) 44px" }}>

          {/* Top bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, paddingBottom: 32, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt={association.nom} width={160} height={50} style={{ objectFit: "contain", background: "rgba(255,255,255,0.92)", borderRadius: 8, padding: "4px 10px" }} />
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              {hasSocial && reseaux_sociaux.facebook && (
                <a href={reseaux_sociaux.facebook} target="_blank" rel="noopener noreferrer" style={{ fontSize: "var(--fs-xs)", color: "var(--text-on-dark-muted)", fontWeight: "var(--fw-semibold)" }}>Facebook</a>
              )}
              {hasSocial && reseaux_sociaux.instagram && (
                <a href={reseaux_sociaux.instagram} target="_blank" rel="noopener noreferrer" style={{ fontSize: "var(--fs-xs)", color: "var(--text-on-dark-muted)", fontWeight: "var(--fw-semibold)" }}>Instagram</a>
              )}
              {hasHelloAsso && (
                <a href={contact.hello_asso_url} target="_blank" rel="noopener noreferrer" style={{
                  padding: "8px 18px", borderRadius: "var(--radius-pill)", background: "#f97316",
                  color: "#fff", fontSize: "var(--fs-sm)", fontWeight: "var(--fw-bold)", whiteSpace: "nowrap",
                }}>
                  ❤️ Adhérer
                </a>
              )}
            </div>
          </div>

          {/* Hero */}
          <div style={{ paddingTop: 40, maxWidth: 680 }}>
            <span className="eyebrow" style={{ color: "var(--brand-accent)" }}>Association citoyenne · Bruz (35)</span>
            <h1 style={{ color: "#fff", fontSize: "clamp(2rem, 4.5vw, 3rem)", fontWeight: "var(--fw-black)", margin: "14px 0 0", lineHeight: 1.1 }}>
              {association.tagline}
            </h1>
            <p style={{ color: "var(--text-on-dark-muted)", fontSize: "var(--fs-lg)", maxWidth: 560, margin: "18px 0 0", lineHeight: "var(--lh-relaxed)" }}>
              {association.mission}
            </p>

            {/* CTA */}
            <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" }}>
              <a
                href={contact.hello_asso_url || "#"}
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "12px 24px", borderRadius: "var(--radius-pill)",
                  background: "#f97316", color: "#fff",
                  fontSize: "var(--fs-base)", fontWeight: "var(--fw-bold)",
                  textDecoration: "none", boxShadow: "0 4px 16px rgba(249,115,22,0.4)",
                }}
              >
                ❤️ Rejoindre l'association
              </a>
              <a
                href="#suivi"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "12px 24px", borderRadius: "var(--radius-pill)",
                  background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
                  color: "#fff", fontSize: "var(--fs-base)", fontWeight: "var(--fw-semibold)",
                  textDecoration: "none",
                }}
              >
                Voir le suivi des promesses
              </a>
            </div>
          </div>

          {/* Bureau */}
          <div style={{ marginTop: 40, fontSize: "var(--fs-2xs)", color: "var(--text-on-dark-faint)", letterSpacing: "var(--ls-wide)" }}>
            Présidence · {bureau.president} · Trésorerie · {bureau.tresorier} · Secrétariat · {bureau.secretaire}
          </div>
        </div>
      </header>

      {/* ── QUI SOMMES-NOUS ── */}
      <section style={{ background: "var(--surface-card)", borderBottom: "1px solid var(--border-subtle)" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "64px var(--container-pad)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 48, alignItems: "start" }} className="bea-foot">

            {/* Présentation */}
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO} alt={association.nom} width={200} height={63} style={{ objectFit: "contain", marginBottom: 24 }} />
              <span className="eyebrow">Qui sommes-nous ?</span>
              <h2 style={{ fontSize: "var(--fs-h2)", margin: "10px 0 20px" }}>Une association née du besoin de s'informer ensemble</h2>
              <p style={{ color: "var(--text-body)", fontSize: "var(--fs-base)", lineHeight: "var(--lh-relaxed)", margin: "0 0 16px" }}>
                <strong>Bruz en Action</strong> est une association citoyenne créée en {association.fondee_en} par des habitants de Bruz qui voulaient mieux suivre la vie municipale — sans parti pris, sans étiquette politique.
              </p>
              <p style={{ color: "var(--text-body)", fontSize: "var(--fs-base)", lineHeight: "var(--lh-relaxed)", margin: "0 0 16px" }}>
                Notre conviction : une démocratie locale vivante passe par des citoyens informés et actifs. On suit les engagements pris pendant la campagne, on relaie les événements de la commune, et on crée des occasions de se rencontrer et d'agir ensemble.
              </p>
              <p style={{ color: "var(--text-body)", fontSize: "var(--fs-base)", lineHeight: "var(--lh-relaxed)", margin: 0 }}>
                <strong>Ouverte à tous les Bruzois</strong>, sans condition d'opinion. Adhérer, c'est simplement dire qu'on tient à notre ville.
              </p>
            </div>

            {/* Ce qu'on fait + Bureau */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Nos 3 piliers d'action */}
              {[
                { icon: "👁️", titre: "On informe", texte: "Suivi des 50 engagements du programme municipal. Chaque évolution est sourcée et publiée ici." },
                { icon: "📅", titre: "On relaie", texte: "L'agenda des événements de Bruz — associations, manifestations sportives, culturelles et citoyennes." },
                { icon: "🤝", titre: "On agit", texte: "Réunions, interpellations des élus, participation aux conseils de quartier. L'asso est un collectif, pas juste un site." },
              ].map(({ icon, titre, texte }) => (
                <div key={titre} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 24, flexShrink: 0, lineHeight: 1, marginTop: 2 }}>{icon}</span>
                  <div>
                    <p style={{ margin: "0 0 4px", fontWeight: "var(--fw-bold)", color: "var(--text-strong)", fontSize: "var(--fs-base)" }}>{titre}</p>
                    <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "var(--fs-sm)", lineHeight: "var(--lh-relaxed)" }}>{texte}</p>
                  </div>
                </div>
              ))}

              {/* Bureau */}
              <div style={{ marginTop: 8, padding: "20px 24px", background: "var(--surface-sunken)", borderRadius: "var(--radius-lg)", borderLeft: "4px solid #2563eb" }}>
                <span className="eyebrow" style={{ marginBottom: 12, display: "block" }}>Le bureau</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { role: "Présidence", nom: bureau.president },
                    { role: "Secrétariat", nom: bureau.secretaire },
                    { role: "Trésorerie", nom: bureau.tresorier },
                  ].map(({ role, nom }) => (
                    <div key={role} style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "var(--fs-sm)", color: "var(--text-muted)" }}>{role}</span>
                      <span style={{ fontSize: "var(--fs-sm)", fontWeight: "var(--fw-semibold)", color: "var(--text-strong)" }}>{nom}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AGENDA ── */}
      <section style={{ background: "var(--surface-card)", borderBottom: "1px solid var(--border-subtle)" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "48px var(--container-pad)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "var(--space-8)", flexWrap: "wrap", gap: 12 }}>
            <div>
              <span className="eyebrow">Agenda citoyen</span>
              <h2 style={{ fontSize: "var(--fs-h2)", margin: "8px 0 0" }}>La vie de notre ville</h2>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "var(--fs-sm)", margin: 0 }}>
              Événements à venir à Bruz et alentours
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "var(--grid-gap)" }}>
            {evenements.map(ev => (
              <div key={ev.id} className="bea-fade" style={{
                background: "var(--surface-page)", border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-lg)", padding: "var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-3)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <span style={{
                    display: "inline-block", padding: "3px 10px", borderRadius: "var(--radius-pill)",
                    background: "var(--surface-sunken)", color: "var(--text-muted)",
                    fontSize: "var(--fs-2xs)", fontWeight: "var(--fw-bold)", letterSpacing: "var(--ls-label)", textTransform: "uppercase",
                  }}>
                    {ev.categorie}
                  </span>
                  <span className="tabular" style={{ fontSize: "var(--fs-xs)", color: "#2563eb", fontWeight: "var(--fw-bold)", whiteSpace: "nowrap" }}>
                    {fmtShort(ev.date)}{ev.date_fin ? ` → ${fmtShort(ev.date_fin)}` : ""}
                  </span>
                </div>
                <p style={{ margin: 0, fontWeight: "var(--fw-bold)", color: "var(--text-strong)", fontSize: "var(--fs-base)", lineHeight: "var(--lh-snug)" }}>
                  {ev.titre}
                </p>
                <p style={{ margin: 0, fontSize: "var(--fs-xs)", color: "var(--text-muted)" }}>{ev.organisateur}</p>
                {ev.note && (
                  <p style={{ margin: 0, fontSize: "var(--fs-xs)", color: "#2563eb", fontStyle: "italic" }}>{ev.note}</p>
                )}
                <div style={{ marginTop: "auto", paddingTop: "var(--space-2)", display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {"lien" in ev && ev.lien && (
                    <a href={ev.lien as string} target="_blank" rel="noopener noreferrer" style={{
                      fontSize: "var(--fs-xs)", color: "#2563eb", fontWeight: "var(--fw-semibold)",
                    }}>
                      {"lien_label" in ev ? String(ev.lien_label) : "En savoir plus"} ↗
                    </a>
                  )}
                  {"lien_article" in ev && ev.lien_article && (
                    <a href={ev.lien_article as string} target="_blank" rel="noopener noreferrer" style={{
                      fontSize: "var(--fs-xs)", color: "var(--text-muted)",
                    }}>
                      Article JAB ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONSEIL MUNICIPAL ── */}
      <section style={{ background: "var(--surface-page)" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "48px var(--container-pad)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "var(--space-8)", flexWrap: "wrap", gap: 12 }}>
            <div>
              <span className="eyebrow">Conseil municipal 2026–2032</span>
              <h2 style={{ fontSize: "var(--fs-h2)", margin: "8px 0 0" }}>L'équipe municipale</h2>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="https://www.ville-bruz.fr/actualites/decouvrez-les-elus-du-conseil-municipal-de-bruz/" target="_blank" rel="noopener noreferrer"
                style={{ fontSize: "var(--fs-xs)", color: "#2563eb", fontWeight: "var(--fw-semibold)" }}>
                Page officielle ↗
              </a>
              <a href="https://www.youtube.com/playlist?list=PLnSe2hJFinqpupninWlKBHSmzmwLW-8i7" target="_blank" rel="noopener noreferrer"
                style={{ fontSize: "var(--fs-xs)", color: "#2563eb", fontWeight: "var(--fw-semibold)" }}>
                CMs en audio (YouTube) ↗
              </a>
            </div>
          </div>

          {/* Résultats élection */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "var(--space-4)", marginBottom: 36 }}>
            {[
              { label: "Sièges majorité", val: `${elusData.composition.majorite.sieges}/33`, sub: elusData.composition.majorite.score },
              { label: "Sièges opposition", val: `${elusData.composition.opposition.sieges}/33`, sub: elusData.composition.opposition.score },
              { label: "Participation", val: elusData.composition.participation, sub: `1er tour — ${new Date(elusData.composition.date_election).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}` },
              { label: "Contact élus", val: "elus@", sub: elusData.meta.contact_elus },
            ].map(({ label, val, sub }) => (
              <div key={label} style={{ background: "var(--surface-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "var(--space-4)" }}>
                <p style={{ margin: "0 0 4px", fontSize: "var(--fs-2xs)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "var(--ls-label)", fontWeight: "var(--fw-bold)" }}>{label}</p>
                <p style={{ margin: "0 0 2px", fontSize: "var(--fs-lg)", fontWeight: "var(--fw-bold)", color: "var(--text-strong)" }}>{val}</p>
                <p style={{ margin: 0, fontSize: "var(--fs-2xs)", color: "var(--text-faint)" }}>{sub}</p>
              </div>
            ))}
          </div>

          {/* Timeline des séances */}
          <h3 style={{ fontSize: "var(--fs-sm)", fontWeight: "var(--fw-bold)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "var(--ls-label)", marginBottom: 20 }}>
            Séances
          </h3>
          <div style={{ position: "relative", paddingLeft: 32, marginBottom: 32 }}>
            {/* Ligne verticale */}
            <div style={{ position: "absolute", left: 7, top: 8, bottom: 8, width: 2, background: "var(--slate-200)", borderRadius: 2 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {cmsData.seances.map((cm, idx) => {
                const isAvenir = cm.statut === "a_venir";
                const hasPts = cm.points_cles.length > 0;
                const dotColor = isAvenir ? "#0ea5e9" : hasPts ? "#3b82f6" : "#cbd5e1";
                return (
                  <div key={cm.id} className="bea-fade" style={{ position: "relative", paddingBottom: idx < cmsData.seances.length - 1 ? 24 : 0 }}>
                    {/* Dot */}
                    <div className={isAvenir ? "bea-pulse" : ""} style={{
                      position: "absolute", left: -28, top: 4,
                      width: 16, height: 16, borderRadius: "50%",
                      background: dotColor, border: "2px solid #fff",
                      boxShadow: `0 0 0 2px ${dotColor}`,
                    }} />
                    {/* Contenu */}
                    <div style={{
                      background: isAvenir ? "#f0f9ff" : "var(--surface-card)",
                      border: `1px solid ${isAvenir ? "#bae6fd" : "var(--border-subtle)"}`,
                      borderRadius: "var(--radius-lg)", padding: "14px 18px",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: hasPts ? 10 : 0, flexWrap: "wrap" }}>
                        <span style={{ fontSize: "var(--fs-xs)", fontWeight: "var(--fw-black)", color: "var(--text-strong)", whiteSpace: "nowrap" }}>
                          {new Date(cm.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                        {isAvenir && (
                          <span style={{ padding: "1px 8px", borderRadius: 999, background: "#0ea5e9", color: "#fff", fontSize: "var(--fs-2xs)", fontWeight: "var(--fw-bold)" }}>À venir</span>
                        )}
                        <span style={{ fontSize: "var(--fs-xs)", color: "var(--text-muted)" }}>{cm.titre}</span>
                        {cm.lieu && <span style={{ fontSize: "var(--fs-2xs)", color: "var(--text-faint)", marginLeft: "auto" }}>{cm.lieu}</span>}
                      </div>
                      {hasPts && (
                        <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 5 }}>
                          {cm.points_cles.map((pt, i) => (
                            <li key={i} style={{ display: "flex", gap: 8, fontSize: "var(--fs-xs)", color: "var(--text-body)", lineHeight: 1.5 }}>
                              <span style={{ color: "#3b82f6", flexShrink: 0 }}>→</span>{pt}
                            </li>
                          ))}
                        </ul>
                      )}
                      {!hasPts && cm.statut === "passe" && (
                        <p style={{ margin: 0, fontSize: "var(--fs-xs)", color: "var(--text-faint)", fontStyle: "italic" }}>
                          Compte-rendu à paraître — <a href={cmsData.meta.youtube} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb" }}>audio YouTube ↗</a>
                        </p>
                      )}
                      {cm.sources.length > 0 && (
                        <div style={{ marginTop: 8, display: "flex", gap: 12, flexWrap: "wrap" }}>
                          {cm.sources.map((s, i) => (
                            <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "var(--fs-2xs)", color: "#2563eb" }}>{s.label} ↗</a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Maire + adjoints */}
          <h3 style={{ fontSize: "var(--fs-sm)", fontWeight: "var(--fw-bold)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "var(--ls-label)", marginBottom: 12 }}>
            Maire &amp; adjoints
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: "var(--space-3)", marginBottom: 28 }}>
            {elus.filter(e => e.type === "maire" || e.type === "adjoint").map(elu => (
              <div key={elu.id} style={{
                background: "var(--surface-card)", border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-lg)", padding: "var(--space-4)",
                borderLeft: elu.type === "maire" ? "4px solid var(--brand-accent)" : "4px solid #3b82f6",
              }}>
                <p style={{ margin: "0 0 2px", fontWeight: "var(--fw-bold)", color: "var(--text-strong)", fontSize: "var(--fs-sm)" }}>{elu.nom}</p>
                <p style={{ margin: "0 0 4px", fontSize: "var(--fs-xs)", color: "#2563eb", fontWeight: "var(--fw-semibold)" }}>{elu.role}</p>
                {elu.delegation && <p style={{ margin: 0, fontSize: "var(--fs-xs)", color: "var(--text-muted)" }}>{elu.delegation}</p>}
                {elu.citations && elu.citations.length > 0 && (
                  <p style={{ margin: "8px 0 0", fontSize: "var(--fs-xs)", color: "var(--text-body)", fontStyle: "italic", lineHeight: 1.5 }}>
                    « {elu.citations[0].texte} »
                    {elu.citations[0].lien && <> <a href={elu.citations[0].lien} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb" }}>↗</a></>}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Conseillers délégués */}
          <h3 style={{ fontSize: "var(--fs-sm)", fontWeight: "var(--fw-bold)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "var(--ls-label)", marginBottom: 12 }}>
            Conseillers délégués
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "var(--space-3)", marginBottom: 28 }}>
            {elus.filter(e => e.type === "delegue").map(elu => (
              <div key={elu.id} style={{
                background: "var(--surface-card)", border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)", padding: "12px 14px",
              }}>
                <p style={{ margin: "0 0 2px", fontWeight: "var(--fw-bold)", color: "var(--text-strong)", fontSize: "var(--fs-xs)" }}>{elu.nom}</p>
                {elu.delegation && <p style={{ margin: 0, fontSize: "var(--fs-2xs)", color: "var(--text-muted)" }}>{elu.delegation}</p>}
              </div>
            ))}
          </div>

          {/* Conseillers sans délégation + Opposition */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-5)", flexWrap: "wrap" }}>
            <div style={{ background: "var(--surface-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "var(--space-4)" }}>
              <p style={{ margin: "0 0 10px", fontSize: "var(--fs-2xs)", fontWeight: "var(--fw-bold)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "var(--ls-label)" }}>Conseillers — Majorité</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 12px" }}>
                {elus.filter(e => e.type === "conseiller" && e.groupe === "majorite").map(e => (
                  <span key={e.id} style={{ fontSize: "var(--fs-xs)", color: "var(--text-body)" }}>{e.nom}</span>
                ))}
              </div>
            </div>
            <div style={{ background: "var(--surface-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "var(--space-4)", borderLeft: "4px solid #94a3b8" }}>
              <p style={{ margin: "0 0 10px", fontSize: "var(--fs-2xs)", fontWeight: "var(--fw-bold)", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "var(--ls-label)" }}>
                Opposition — {elusData.composition.opposition.sieges} sièges ({elusData.composition.opposition.liste})
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 12px" }}>
                {elus.filter(e => e.groupe === "opposition").map(e => (
                  <span key={e.id} style={{ fontSize: "var(--fs-xs)", color: "var(--text-body)" }}>
                    {e.nom}{e.nom === "Philippe Salmon" ? " (ex-maire)" : ""}
                  </span>
                ))}
              </div>
              <a href="https://bruz2026.fr" target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: 10, fontSize: "var(--fs-xs)", color: "#2563eb" }}>Site de l'opposition ↗</a>
            </div>
          </div>
          <p style={{ marginTop: 12, fontSize: "var(--fs-xs)", color: "var(--text-faint)" }}>
            Source : <a href="https://www.ville-bruz.fr/wp-content/uploads/2026/05/Bruz-Mag-n%C2%B0260-de-mai-juin-2026.pdf" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb" }}>Bruz Mag n°260 (mai-juin 2026)</a>
          </p>

          {/* Prochain CM */}
          <div style={{ marginTop: 32, padding: "16px 20px", background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: "var(--radius-lg)", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: "var(--fs-xl)" }}>📅</span>
            <div>
              <p style={{ margin: 0, fontWeight: "var(--fw-bold)", color: "#92400e", fontSize: "var(--fs-sm)" }}>Prochain conseil municipal public</p>
              <p style={{ margin: 0, fontSize: "var(--fs-xs)", color: "#78350f" }}>
                Vendredi 3 juillet 2026 — Halle Pagnol, Bruz — Séance ouverte au public
              </p>
            </div>
            <a href="https://www.ville-bruz.fr/ma-ville-de-bruz/conseil-municipal/conseil-municipal/" target="_blank" rel="noopener noreferrer"
              style={{ marginLeft: "auto", fontSize: "var(--fs-xs)", color: "#2563eb", fontWeight: "var(--fw-semibold)", whiteSpace: "nowrap" }}>
              Agenda mairie ↗
            </a>
          </div>
        </div>
      </section>

      {/* ── DOSSIERS ── */}
      <section style={{ background: "var(--surface-card)", borderBottom: "1px solid var(--border-subtle)" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "48px var(--container-pad)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "var(--space-8)", flexWrap: "wrap", gap: 12 }}>
            <div>
              <span className="eyebrow">Nos dossiers</span>
              <h2 style={{ fontSize: "var(--fs-h2)", margin: "8px 0 0" }}>Enquêtes & analyses</h2>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "var(--fs-sm)", margin: 0 }}>
              Sujets clés du mandat suivis en continu
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "var(--grid-gap)" }}>
            {dossiers.map(d => (
              <div key={d.id} style={{
                background: "var(--surface-page)", border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-lg)", padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-4)",
                borderTop: `3px solid ${d.statut === "a_venir" ? "var(--text-faint)" : "var(--brand-accent)"}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <span style={{
                    display: "inline-block", padding: "3px 10px", borderRadius: "var(--radius-pill)",
                    background: "var(--surface-sunken)", color: "var(--text-muted)",
                    fontSize: "var(--fs-2xs)", fontWeight: "var(--fw-bold)", letterSpacing: "var(--ls-label)", textTransform: "uppercase",
                  }}>{d.categorie}</span>
                  {d.statut === "a_venir" && (
                    <span style={{ fontSize: "var(--fs-2xs)", color: "var(--text-faint)", fontWeight: "var(--fw-semibold)" }}>À venir</span>
                  )}
                  {d.statut === "en_cours" && (
                    <span style={{ fontSize: "var(--fs-2xs)", color: "#d97706", fontWeight: "var(--fw-semibold)" }}>● En cours</span>
                  )}
                </div>
                <div>
                  <h3 style={{ margin: "0 0 8px", fontSize: "var(--fs-base)", fontWeight: "var(--fw-bold)", color: "var(--text-strong)", lineHeight: "var(--lh-snug)" }}>{d.titre}</h3>
                  <p style={{ margin: 0, fontSize: "var(--fs-sm)", color: "var(--text-muted)", lineHeight: "var(--lh-relaxed)" }}>{d.chapeau}</p>
                </div>
                {d.points_cles.length > 0 && (
                  <ul style={{ margin: 0, paddingLeft: "1.2em", display: "flex", flexDirection: "column", gap: 4 }}>
                    {d.points_cles.map((pt, i) => (
                      <li key={i} style={{ fontSize: "var(--fs-xs)", color: "var(--text-body)", lineHeight: "var(--lh-relaxed)" }}>{pt}</li>
                    ))}
                  </ul>
                )}
                <div style={{ marginTop: "auto", paddingTop: "var(--space-3)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <a href={`/bruz-en-action/dossiers/${d.id}`} style={{
                    fontSize: "var(--fs-xs)", fontWeight: "var(--fw-bold)", color: "var(--brand-accent)",
                  }}>
                    Lire le dossier →
                  </a>
                  <span style={{ fontSize: "var(--fs-2xs)", color: "var(--text-faint)" }}>{d.sources.length} source{d.sources.length > 1 ? "s" : ""}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REJOINDRE ── */}
      <section style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)", color: "#fff" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "64px var(--container-pad)", textAlign: "center" }}>
          <span className="eyebrow" style={{ color: "var(--brand-accent)" }}>Bruz en Action</span>
          <h2 style={{ color: "#fff", fontSize: "var(--fs-h1)", margin: "14px auto 0", maxWidth: 560 }}>
            Rejoignez le mouvement citoyen
          </h2>
          <p style={{ color: "var(--text-on-dark-muted)", fontSize: "var(--fs-lg)", margin: "18px auto 0", maxWidth: 520, lineHeight: "var(--lh-relaxed)" }}>
            {association.positionnement} Chaque adhésion renforce notre voix et notre capacité d'action à Bruz.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 36, flexWrap: "wrap" }}>
            <a
              href={contact.hello_asso_url || "#"}
              target="_blank" rel="noopener noreferrer"
              style={{
                padding: "14px 32px", borderRadius: "var(--radius-pill)",
                background: "#f97316", color: "#fff",
                fontSize: "var(--fs-lg)", fontWeight: "var(--fw-bold)",
                textDecoration: "none", boxShadow: "0 4px 24px rgba(249,115,22,0.5)",
              }}
            >
              ❤️ Adhérer sur HelloAsso
            </a>
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                style={{
                  padding: "14px 32px", borderRadius: "var(--radius-pill)",
                  background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
                  color: "#fff", fontSize: "var(--fs-lg)", fontWeight: "var(--fw-semibold)",
                  textDecoration: "none",
                }}
              >
                Nous contacter
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── SUIVI DES PROMESSES ── */}
      <div style={{ background: "var(--surface-card)", borderBottom: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-xs)" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "28px var(--container-pad)" }}>
          {/* Barre de progression segmentée */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
              <span style={{ fontSize: "var(--fs-sm)", fontWeight: "var(--fw-bold)", color: "var(--text-strong)" }}>
                Avancement du mandat — {total} engagements
              </span>
              <span style={{ fontSize: "var(--fs-sm)", fontWeight: "var(--fw-black)", color: "var(--status-done)" }}>
                {score} % tenus
              </span>
            </div>
            <div className="bea-progress-bar">
              <div className="bea-progress-seg" style={{ width: `${(tenues / total) * 100}%`, background: "var(--status-done)" }} />
              <div className="bea-progress-seg" style={{ width: `${(enCours / total) * 100}%`, background: "var(--status-progress)" }} />
              <div className="bea-progress-seg" style={{ width: `${(nonCommences / total) * 100}%`, background: "var(--slate-200)" }} />
            </div>
            <div style={{ display: "flex", gap: 20, marginTop: 8, flexWrap: "wrap" }}>
              {[
                { color: "var(--status-done)", label: `${tenues} tenus` },
                { color: "var(--status-progress)", label: `${enCours} en cours` },
                { color: "var(--slate-300)", label: `${nonCommences} non commencés` },
              ].map(({ color, label }) => (
                <span key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--fs-xs)", color: "var(--text-muted)" }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: color, flexShrink: 0 }} />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section style={{ background: "var(--surface-page)" }} id="suivi">
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "var(--section-gap) var(--container-pad)" }}>
          <div style={{ maxWidth: 680, marginBottom: "var(--space-8)" }}>
            <span className="eyebrow">Transparence municipale</span>
            <h2 style={{ fontSize: "var(--fs-h2)", margin: "10px 0 0" }}>Les {total} engagements du programme</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "var(--fs-lg)", margin: "10px 0 0", lineHeight: "var(--lh-relaxed)" }}>
              Chaque promesse du mandat 2026-2031, suivie depuis sa source publique.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--grid-gap)", marginBottom: "var(--section-gap)" }}>
            {piliers.map(pilier => {
              const count = countByPilier(pilier.id);
              const tenus = tenusByPilier(pilier.id);
              const pct = count > 0 ? Math.round((tenus / count) * 100) : 0;
              return (
                <div key={pilier.id} style={{ background: "var(--surface-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
                  <div style={{ height: "var(--pillar-bar-height)", background: pilier.color }} />
                  <div style={{ padding: "var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-3)" }}>
                      <h3 style={{ fontSize: "var(--fs-base)", fontWeight: "var(--fw-bold)" }}>{pilier.emoji} {pilier.label}</h3>
                      <span className="tabular" style={{ flexShrink: 0, padding: "2px 8px", borderRadius: "var(--radius-pill)", background: `color-mix(in srgb, ${pilier.color} 12%, white)`, color: pilier.color, fontSize: "var(--fs-xs)", fontWeight: "var(--fw-bold)" }}>
                        {count}
                      </span>
                    </div>
                    <div>
                      <div style={{ height: 6, borderRadius: "var(--radius-pill)", background: "var(--surface-sunken)", overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: "var(--radius-pill)", background: pilier.color, width: `${pct}%` }} />
                      </div>
                      <div style={{ fontSize: "var(--fs-xs)", color: "var(--text-faint)", marginTop: 4 }}>{pct}% tenus</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <PromessesSection promesses={promesses} piliers={piliers} statuts={statuts} />

      {/* ── ACTUS ── */}
      {actus.length > 0 && (
        <section style={{ background: "var(--surface-page)" }}>
          <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "var(--section-gap) var(--container-pad)" }}>
            <span className="eyebrow">Actualités</span>
            <h2 style={{ fontSize: "var(--fs-h2)", margin: "10px 0 24px" }}>Les dernières évolutions</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--grid-gap)" }}>
              {actus.map(actu => (
                <div key={actu.id} style={{ background: "var(--surface-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "var(--space-6)", boxShadow: "var(--shadow-sm)" }}>
                  <p style={{ fontSize: "var(--fs-xs)", color: "var(--text-faint)", margin: "0 0 4px" }}>{actu.date}</p>
                  <p style={{ fontWeight: "var(--fw-bold)", color: "var(--text-strong)", margin: "0 0 6px" }}>{actu.titre}</p>
                  <p style={{ fontSize: "var(--fs-sm)", color: "var(--text-muted)", margin: 0 }}>{actu.contenu}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer style={{ background: "var(--night-900)", color: "var(--text-on-dark-muted)", marginTop: "auto" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "48px var(--container-pad)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.2fr) minmax(0,2fr)", gap: 40 }} className="bea-foot">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO} alt={association.nom} width={160} height={50} style={{ objectFit: "contain", background: "rgba(255,255,255,0.92)", borderRadius: 8, padding: "4px 10px" }} />
              <p style={{ fontSize: "var(--fs-sm)", lineHeight: "var(--lh-relaxed)", maxWidth: 320, marginTop: 16, color: "var(--text-on-dark-muted)" }}>
                {association.description}
              </p>
              {contact.hello_asso_url && (
                <a href={contact.hello_asso_url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: 16, padding: "8px 20px", borderRadius: "var(--radius-pill)", background: "#f97316", color: "#fff", fontSize: "var(--fs-sm)", fontWeight: "var(--fw-bold)", textDecoration: "none" }}>
                  ❤️ Adhérer
                </a>
              )}
            </div>
            <div>
              <span className="eyebrow" style={{ color: "var(--text-on-dark-faint)" }}>Sources surveillées</span>
              <ul style={{ listStyle: "none", padding: 0, margin: "14px 0 0", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: "8px 24px" }}>
                {sources_surveillees.map(s => (
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
