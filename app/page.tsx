import NavBar from "../components/NavBar";
const LOGO = "/bruz-en-action/logo.png";
import promessesData from "../data/promesses.json";
import actusData from "../data/actus.json";
import metaData from "../data/meta.json";
import dossiersData from "../data/dossiers.json";
import cmsData from "../data/cms.json";
import evenementsData from "../data/evenements.json";
import type { Pilier, Statut, Promesse, Actu } from "../types";

function fmtShort(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function Home() {
  const { piliers, statuts, promesses } = promessesData as {
    piliers: Pilier[]; statuts: Statut[]; promesses: Promesse[]; meta: unknown;
  };
  const { actus } = actusData as { actus: Actu[]; meta: unknown };
  const { association, contact, reseaux_sociaux } = metaData;
  const { dossiers } = dossiersData;

  const total = promesses.length;
  const tenues = promesses.filter(p => p.statut_id === "tenu").length;
  const enCours = promesses.filter(p => p.statut_id === "en_cours").length;
  const nonCommences = promesses.filter(p => p.statut_id === "non_commence").length;
  const score = total > 0 ? Math.round((tenues / total) * 100) : 0;

  const hasHelloAsso = Boolean(contact.hello_asso_url);
  const hasSocial = Boolean(reseaux_sociaux.facebook || reseaux_sociaux.instagram);

  const prochainCM = cmsData.seances.find(s => s.statut === "a_venir");

  const topDossiers = ([...dossiers] as (typeof dossiers[0] & { featured?: boolean; last_activity?: string })[])
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      const ad = a.last_activity ?? a.date_ouverture;
      const bd = b.last_activity ?? b.date_ouverture;
      return bd.localeCompare(ad);
    })
    .slice(0, 4);

  const lastActus = [...actus]
    .filter(a => a.type !== "analyse" && a.date && a.date.length >= 8)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);
  const { evenements } = evenementsData;
  const prochainEvts = evenements
    .filter(e => new Date(e.date) >= new Date())
    .slice(0, 4);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--surface-page)" }}>

      {/* ── HEADER ── */}
      <header style={{ position: "relative", background: "var(--night-gradient)", color: "#fff", overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/bruz-en-action/bruz-place.jpg" alt="" aria-hidden="true" style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover", objectPosition: "center 60%",
          opacity: 0.22, pointerEvents: "none", userSelect: "none",
        }} />
        <a href="https://commons.wikimedia.org/wiki/File:Bruz-place.jpg" target="_blank" rel="noopener noreferrer"
          style={{ position: "absolute", bottom: 8, right: 12, fontSize: 10, color: "rgba(255,255,255,0.45)", textDecoration: "none", zIndex: 1 }}>
          Photo : Yves LC — CC BY-SA 4.0
        </a>

        <div style={{ position: "relative", zIndex: 1, maxWidth: "var(--container-max)", margin: "0 auto", padding: "20px var(--container-pad) 44px" }}>

          {/* Nav */}
          <div style={{ paddingBottom: 32, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <NavBar />
          </div>

          {/* Hero */}
          <div style={{ paddingTop: 40, maxWidth: 680 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#f97316", display: "block", marginBottom: 10 }}>
              Association citoyenne · Bruz (35)
            </span>
            <h1 style={{ color: "#fff", fontSize: "clamp(2rem, 4.5vw, 3rem)", fontWeight: 900, margin: "0 0 16px", lineHeight: 1.1 }}>
              {association.tagline}
            </h1>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 17, maxWidth: 560, margin: "0 0 32px", lineHeight: 1.7 }}>
              {association.mission}
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href={contact.hello_asso_url || "#"} target="_blank" rel="noopener noreferrer" style={{
                padding: "12px 24px", borderRadius: 999, background: "#f97316", color: "#fff",
                fontSize: 15, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 16px rgba(249,115,22,0.4)",
              }}>
                ❤️ Rejoindre l'association
              </a>
              <a href="/bruz-en-action/promesses" style={{
                padding: "12px 24px", borderRadius: 999, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
                color: "#fff", fontSize: 15, fontWeight: 600, textDecoration: "none",
              }}>
                Voir le suivi des promesses
              </a>
            </div>
          </div>

          <div style={{ marginTop: 36, fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em" }}>
            {association.fondee_en} · Bruz (35170) · Association loi 1901
          </div>
        </div>
      </header>

      {/* ── PROCHAIN CM ── */}
      {prochainCM && (
        <div style={{ background: "#fffbeb", borderBottom: "1px solid #fcd34d" }}>
          <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "14px var(--container-pad)", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 20 }}>📅</span>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 700, color: "#92400e", fontSize: 14 }}>Prochain conseil municipal — </span>
              <span style={{ fontSize: 14, color: "#78350f" }}>
                {new Date(prochainCM.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                {prochainCM.lieu ? ` · ${prochainCM.lieu}` : ""}
              </span>
            </div>
            <a href="/bruz-en-action/conseils" style={{ fontSize: 13, color: "#2563eb", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
              Tous les CMs →
            </a>
          </div>
        </div>
      )}

      {/* ── QUI SOMMES-NOUS ── */}
      <section style={{ background: "#fff", borderBottom: "1px solid var(--border-subtle)" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "56px var(--container-pad)", display: "flex", gap: 48, alignItems: "center", flexWrap: "wrap" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/bruz-en-action/og-image.jpg"
            alt="Bruz En Action — présentation de l'association"
            style={{ width: "min(340px, 100%)", borderRadius: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 260 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#f97316", display: "block", marginBottom: 10 }}>
              Qui sommes-nous ?
            </span>
            <h2 style={{ fontSize: "clamp(1.4rem,2.8vw,2rem)", fontWeight: 900, color: "#0f172a", margin: "0 0 16px", lineHeight: 1.2 }}>
              Une association citoyenne<br />au service de Bruz
            </h2>
            <p style={{ fontSize: 16, color: "#475569", lineHeight: 1.75, margin: "0 0 16px" }}>
              <strong>Bruz En Action</strong> {association.mission}
            </p>
            <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.7, margin: "0 0 28px" }}>
              Nous croyons qu&apos;une ville se construit <strong>avec ses habitants</strong> — en favorisant le dialogue,
              soutenant les initiatives locales et participant activement à la vie de Bruz dans un esprit
              d&apos;écoute, de partage et d&apos;action.
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
              {reseaux_sociaux.facebook && (
                <a href={reseaux_sociaux.facebook} target="_blank" rel="noopener noreferrer" style={{
                  padding: "10px 20px", borderRadius: 999, background: "#1877f2", color: "#fff",
                  fontSize: 14, fontWeight: 700, textDecoration: "none",
                }}>
                  Suivre sur Facebook
                </a>
              )}
              {contact.hello_asso_url && (
                <a href={contact.hello_asso_url} target="_blank" rel="noopener noreferrer" style={{
                  padding: "10px 20px", borderRadius: 999, border: "2px solid #f97316", color: "#f97316",
                  fontSize: 14, fontWeight: 700, textDecoration: "none",
                }}>
                  ❤️ Adhérer
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── DOSSIERS ── */}
      <section style={{ background: "var(--surface-card)", borderBottom: "1px solid var(--border-subtle)" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "48px var(--container-pad)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#64748b", display: "block", marginBottom: 6 }}>Nos dossiers</span>
              <h2 style={{ fontSize: "clamp(1.3rem,2.5vw,1.8rem)", fontWeight: 800, margin: 0, color: "#0f172a" }}>Enquêtes &amp; analyses</h2>
            </div>
            <a href="/bruz-en-action/dossiers" style={{ fontSize: 14, fontWeight: 600, color: "#2563eb", textDecoration: "none" }}>
              Tous les dossiers ({dossiers.length}) →
            </a>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {topDossiers.map(d => (
              <a key={d.id} href={"lien_externe" in d && d.lien_externe ? String(d.lien_externe) : `/bruz-en-action/dossiers/${d.id}`}
                style={{ textDecoration: "none", display: "flex", flexDirection: "column", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "20px", gap: 10,
                  borderTop: `3px solid ${d.featured ? "#E8920E" : "#3b82f6"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", padding: "2px 8px", background: "#f1f5f9", borderRadius: 999 }}>{d.categorie}</span>
                  {d.featured && <span style={{ fontSize: 11, color: "#E8920E", fontWeight: 700 }}>● Actif</span>}
                </div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a", lineHeight: 1.4 }}>{d.titre}</h3>
                <p style={{ margin: 0, fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{d.chapeau}</p>
                <div style={{ marginTop: "auto", paddingTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#E8920E" }}>Lire →</span>
                  {d.last_activity && (
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>Màj {fmtShort(d.last_activity)}</span>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── AGENDA ── */}
      <section style={{ background: "var(--surface-page)", borderBottom: "1px solid var(--border-subtle)" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "40px var(--container-pad)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#64748b", display: "block", marginBottom: 6 }}>Agenda citoyen</span>
              <h2 style={{ fontSize: "clamp(1.2rem,2vw,1.6rem)", fontWeight: 800, margin: 0, color: "#0f172a" }}>La vie de notre ville</h2>
            </div>
            <a href="https://www.ville-bruz.fr/mes-loisirs/agenda/" target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 13, fontWeight: 600, color: "#2563eb", textDecoration: "none" }}>
              Agenda complet mairie ↗
            </a>
          </div>

          {/* Événements */}
          {prochainEvts.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: 14, marginBottom: 24 }}>
              {prochainEvts.map(ev => (
                <div key={ev.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#64748b", padding: "2px 8px", background: "#f1f5f9", borderRadius: 999 }}>
                      {ev.categorie}
                    </span>
                    <span style={{ fontSize: 12, color: "#2563eb", fontWeight: 700, whiteSpace: "nowrap" }}>
                      {fmtShort(ev.date)}{"date_fin" in ev && ev.date_fin ? ` → ${fmtShort(String(ev.date_fin))}` : ""}
                    </span>
                  </div>
                  <p style={{ margin: "0 0 4px", fontWeight: 700, color: "#0f172a", fontSize: 14, lineHeight: 1.4 }}>{ev.titre}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>{ev.organisateur}</p>
                  {"note" in ev && ev.note && (
                    <p style={{ margin: "6px 0 0", fontSize: 12, color: "#2563eb", fontStyle: "italic" }}>{String(ev.note)}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Sources agenda externes */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 18px", display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Voir aussi</span>
            {[
              { label: "🏛️ Agenda mairie de Bruz", url: "https://www.ville-bruz.fr/mes-loisirs/agenda/" },
              { label: "📰 Bruz Mag", url: "https://www.ville-bruz.fr/bruz-mag/" },
              { label: "🗞️ La Semaine dans le Bocage", url: "https://www.lasemainedanslebocage.fr/communes/bruz" },
              { label: "🎭 Grands événements Bruz", url: "https://www.ville-bruz.fr/mes-loisirs/grands-evenements/" },
            ].map(({ label, url }) => (
              <a key={url} href={url} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 13, color: "#2563eb", textDecoration: "none", fontWeight: 500 }}>
                {label} ↗
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROMESSES (barre) ── */}
      <section style={{ background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "40px var(--container-pad)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#64748b", display: "block", marginBottom: 6 }}>Transparence</span>
              <h2 style={{ fontSize: "clamp(1.2rem,2vw,1.6rem)", fontWeight: 800, margin: 0, color: "#0f172a" }}>Suivi des {total} engagements</h2>
            </div>
            <a href="/bruz-en-action/promesses" style={{ fontSize: 14, fontWeight: 600, color: "#2563eb", textDecoration: "none" }}>
              Voir le détail →
            </a>
          </div>
          <div style={{ maxWidth: 640 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "#64748b" }}>Mandat 2026-2031</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#16a34a" }}>{score}% tenus</span>
            </div>
            <div style={{ height: 12, borderRadius: 999, background: "#f1f5f9", overflow: "hidden", display: "flex" }}>
              <div style={{ height: "100%", background: "#22c55e", width: `${(tenues / total) * 100}%`, transition: "width 0.6s" }} />
              <div style={{ height: "100%", background: "#f97316", width: `${(enCours / total) * 100}%`, transition: "width 0.6s" }} />
              <div style={{ height: "100%", background: "#e2e8f0", width: `${(nonCommences / total) * 100}%` }} />
            </div>
            <div style={{ display: "flex", gap: 20, marginTop: 10, flexWrap: "wrap" }}>
              {[
                { color: "#22c55e", label: `${tenues} tenus` },
                { color: "#f97316", label: `${enCours} en cours` },
                { color: "#e2e8f0", label: `${nonCommences} non commencés` },
              ].map(({ color, label }) => (
                <span key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: color, flexShrink: 0 }} />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ACTUS ── */}
      {lastActus.length > 0 && (
        <section style={{ background: "var(--surface-page)", borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "48px var(--container-pad)" }}>
            <div style={{ marginBottom: 24 }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#64748b", display: "block", marginBottom: 4 }}>Veille citoyenne</span>
              <h2 style={{ fontSize: "clamp(1.2rem,2vw,1.5rem)", fontWeight: 800, margin: 0, color: "#0f172a" }}>Dernières actualités</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 16 }}>
              {lastActus.map(actu => {
                const isMailrie = actu.type === "mairie";
                const color = isMailrie ? "#16a34a" : actu.type === "presse" ? "#0284c7" : "#7c3aed";
                const typeLabel = isMailrie ? "Mairie" : actu.type === "presse" ? "Presse" : "CM";
                const inner = (
                  <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
                    <div style={{ height: 3, background: color }} />
                    <div style={{ padding: "16px 18px 18px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color, padding: "2px 8px", borderRadius: 999, border: `1px solid ${color}44`, background: `${color}10` }}>
                          {typeLabel}
                        </span>
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>{actu.date}</span>
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: 0, lineHeight: 1.5, flex: 1 }}>{actu.titre}</p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>{actu.source_label}</p>
                      </div>
                    </div>
                  </div>
                );
                return isMailrie && actu.source_url ? (
                  <a key={actu.id} href={actu.source_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
                    {inner}
                  </a>
                ) : (
                  <div key={actu.id}>{inner}</div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── QUI SOMMES-NOUS (mini) ── */}
      <section style={{ background: "var(--surface-page)", borderBottom: "1px solid var(--border-subtle)" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "48px var(--container-pad)" }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#64748b", display: "block", marginBottom: 8 }}>Qui sommes-nous ?</span>
          <h2 style={{ fontSize: "clamp(1.2rem,2vw,1.6rem)", fontWeight: 800, margin: "0 0 8px", color: "#0f172a" }}>Accompagner et valoriser le projet municipal</h2>
          <p style={{ fontSize: 15, color: "#475569", margin: "0 0 28px", maxWidth: 640, lineHeight: 1.7 }}>
            <strong>Bruz en Action</strong> est née de l'engagement de citoyens ayant soutenu Jean-René Houssin et la liste <em>« Un nouvel élan pour Bruz »</em>.
            Notre seule boussole : l'amélioration concrète du quotidien des Bruzois.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 16 }}>
            {[
              { icon: "📋", titre: "On suit", texte: "50 promesses documentées, sourcées, mises à jour au fil du mandat." },
              { icon: "👂", titre: "On écoute", texte: "Les préoccupations des habitants. L'asso est le canal entre les Bruzois et leurs élus." },
              { icon: "🤝", titre: "On transmet", texte: "Dialogue constructif avec la majorité. Bienveillant, sans complaisance." },
            ].map(({ icon, titre, texte }) => (
              <div key={titre} style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 18px" }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
                <div>
                  <p style={{ margin: "0 0 4px", fontWeight: 700, color: "#0f172a", fontSize: 14 }}>{titre}</p>
                  <p style={{ margin: 0, color: "#64748b", fontSize: 13, lineHeight: 1.6 }}>{texte}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REJOINDRE ── */}
      <section style={{ background: "linear-gradient(135deg, #2A5298 0%, #1B3A6B 100%)", color: "#fff" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "64px var(--container-pad)", textAlign: "center" }}>
          <h2 style={{ color: "#fff", fontSize: "clamp(1.4rem,3vw,2rem)", margin: "0 0 16px" }}>
            Rejoignez le mouvement citoyen
          </h2>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 16, margin: "0 auto 36px", maxWidth: 480, lineHeight: 1.7 }}>
            {association.positionnement} Chaque adhésion renforce notre capacité d'action à Bruz.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={contact.hello_asso_url || "#"} target="_blank" rel="noopener noreferrer" style={{
              padding: "14px 32px", borderRadius: 999, background: "#f97316", color: "#fff",
              fontSize: 16, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 24px rgba(249,115,22,0.5)",
            }}>
              ❤️ Adhérer sur HelloAsso
            </a>
            {contact.email && (
              <a href={`mailto:${contact.email}`} style={{
                padding: "14px 32px", borderRadius: 999, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
                color: "#fff", fontSize: 16, fontWeight: 600, textDecoration: "none",
              }}>
                Nous contacter
              </a>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#1B3A6B", color: "rgba(255,255,255,0.5)" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "40px var(--container-pad)" }}>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap", justifyContent: "space-between", marginBottom: 32 }}>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO} alt={association.nom} width={140} height={44} style={{ objectFit: "contain", background: "rgba(255,255,255,0.92)", borderRadius: 8, padding: "4px 8px", display: "block", marginBottom: 12 }} />
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: 0, maxWidth: 280, lineHeight: 1.6 }}>{association.description}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", margin: "0 0 12px" }}>Pages</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { href: "/bruz-en-action/dossiers", label: "📁 Dossiers" },
                  { href: "/bruz-en-action/conseils", label: "🏛️ Conseils municipaux" },
                  { href: "/bruz-en-action/promesses", label: "✅ Suivi des promesses" },
                  { href: "/bruz-en-action/elus", label: "👥 Élus 2026-2032" },
                  { href: "/bruz-en-action/carte", label: "🗺️ Carte de Bruz" },
                  { href: "/bruz-en-action/chronologie", label: "🕐 Chronologie" },
                  { href: "/bruz-en-action/metropole", label: "🏙️ Rennes Métropole" },
                ].map(({ href, label }) => (
                  <a key={href} href={href} style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>{label}</a>
                ))}
              </div>
            </div>
          </div>
          <div style={{ paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.1)", fontSize: 12, color: "rgba(255,255,255,0.3)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <span>© {association.fondee_en} {association.nom} · Association loi 1901</span>
            <span>{association.positionnement}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
