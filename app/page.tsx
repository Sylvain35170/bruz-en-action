import NavBar from "../components/NavBar";
import SiteFooter from "../components/SiteFooter";
import { CATEGORIE_COLOR } from "../lib/categories";

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
  const countStatut = (id: string) => promesses.filter(p => p.statut_id === id).length;
  const tenues = countStatut("tenu");
  const score = total > 0 ? Math.round((tenues / total) * 100) : 0;
  const segments = [
    { id: "tenu", color: "#22c55e", label: "tenus" },
    { id: "partiel", color: "#2563eb", label: "partiels" },
    { id: "en_cours", color: "#E8A040", label: "en cours" },
    { id: "abandonne", color: "#dc2626", label: "abandonnés" },
    { id: "inconnu", color: "#94a3b8", label: "statut inconnu" },
    { id: "non_commence", color: "#e2e8f0", label: "non commencés" },
  ].map(s => ({ ...s, n: countStatut(s.id) }));

  const hasHelloAsso = Boolean(contact.hello_asso_url);
  const hasSocial = Boolean(reseaux_sociaux.facebook || reseaux_sociaux.instagram);

  const prochainCM = cmsData.seances.find(s => s.statut === "a_venir");

  type DossierExt = typeof dossiers[0] & {
    featured?: boolean;
    last_activity?: string;
    lien_externe?: string;
    actus_recentes?: { date: string; titre: string }[];
    chapeau?: string;
    image?: string;
  };

  const topDossiers = ([...dossiers] as DossierExt[])
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      const ad = a.last_activity ?? a.date_ouverture;
      const bd = b.last_activity ?? b.date_ouverture;
      return bd.localeCompare(ad);
    })
    .slice(0, 4);

  const isoDate = /^\d{4}-\d{2}-\d{2}$/;
  const lastActus = [...actus]
    .filter(a => a.type !== "analyse" && a.date && isoDate.test(a.date))
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
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
        <img src="/bruz-en-action/bruz-place.webp" alt="" aria-hidden="true" style={{
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
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#E8A040", display: "block", marginBottom: 10 }}>
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
                padding: "12px 24px", borderRadius: 999, background: "#E8A040", color: "#0E2F62",
                fontSize: 15, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 16px rgba(232,160,64,0.4)",
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

      {/* ── ILLUSTRATION HERO ── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/bruz-en-action/illus-hero.webp"
        alt="Illustration de Bruz — citoyens et ville"
        style={{ width: "100%", maxHeight: 280, objectFit: "cover", objectPosition: "center top", display: "block" }}
      />

      {/* ── QUI SOMMES-NOUS ── */}
      <section style={{ background: "#fff", borderBottom: "1px solid var(--border-subtle)" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "56px var(--container-pad)", display: "flex", gap: 48, alignItems: "center", flexWrap: "wrap" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/bruz-en-action/illus-asso.webp"
            loading="lazy"
            alt="Bruz En Action — citoyens engagés"
            style={{ width: "min(380px, 100%)", borderRadius: 16, flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 260 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#E8A040", display: "block", marginBottom: 10 }}>
              Qui sommes-nous ?
            </span>
            <h2 style={{ fontSize: "clamp(1.4rem,2.8vw,2rem)", fontWeight: 900, color: "#0f172a", margin: "0 0 16px", lineHeight: 1.2 }}>
              Une association citoyenne<br />au service de Bruz
            </h2>
            <p style={{ fontSize: 16, color: "#475569", lineHeight: 1.75, margin: "0 0 16px" }}>
              <strong>Bruz En Action</strong> {association.mission}
            </p>
            <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.7, margin: "0 0 16px" }}>
              L&apos;association est née de l&apos;engagement de citoyens ayant soutenu Jean-René Houssin et la liste <em>« Un nouvel élan pour Bruz »</em>.
              Notre seule boussole : l&apos;amélioration concrète du quotidien des Bruzois.
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
              {reseaux_sociaux.instagram && (
                <a href={reseaux_sociaux.instagram} target="_blank" rel="noopener noreferrer" style={{
                  padding: "10px 20px", borderRadius: 999,
                  background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
                  color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none",
                }}>
                  Suivre sur Instagram
                </a>
              )}
              {contact.hello_asso_url && (
                <a href={contact.hello_asso_url} target="_blank" rel="noopener noreferrer" style={{
                  padding: "10px 20px", borderRadius: 999, border: "2px solid #E8A040", color: "#E8A040",
                  fontSize: 14, fontWeight: 700, textDecoration: "none",
                }}>
                  ❤️ Adhérer
                </a>
              )}
            </div>
          </div>
        </div>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "0 var(--container-pad) 56px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 16 }}>
            {[
              { icon: "📋", titre: "On suit", texte: "50 promesses documentées, sourcées, mises à jour au fil du mandat." },
              { icon: "👂", titre: "On écoute", texte: "Les préoccupations des habitants. L'asso est le canal entre les Bruzois et leurs élus." },
              { icon: "🤝", titre: "On transmet", texte: "Dialogue constructif avec la majorité. Bienveillant, sans complaisance." },
            ].map(({ icon, titre, texte }) => (
              <div key={titre} style={{ display: "flex", gap: 14, alignItems: "flex-start", background: "var(--surface-page)", border: "1px solid #e2e8f0", borderRadius: 10, padding: "16px 18px" }}>
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(300px,100%), 1fr))", gap: 20 }}>
            {topDossiers.map(d => {
              const catColor = CATEGORIE_COLOR[d.categorie] ?? "#64748b";
              const href = d.lien_externe ?? `/bruz-en-action/dossiers/${d.id}`;
              const lastActu = d.actus_recentes?.[0];
              const lastActuDate = lastActu?.date
                ? new Date(lastActu.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
                : null;
              return (
                <a key={d.id} href={href} style={{ textDecoration: "none", display: "flex", flexDirection: "column" }}>
                  <div style={{
                    border: "1px solid #e2e8f0", borderRadius: 14, overflow: "hidden",
                    display: "flex", flexDirection: "column", height: "100%",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  }}>
                    {d.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={d.image} alt={d.titre} loading="lazy"
                        style={{ width: "100%", height: 130, objectFit: "cover", objectPosition: "center", display: "block" }} />
                    )}
                    <div style={{ background: catColor, padding: "18px 20px 16px", position: "relative" }}>
                      {d.featured && (
                        <span style={{
                          position: "absolute", top: 10, right: 12,
                          fontSize: 10, fontWeight: 700, color: "#fff",
                          background: "rgba(255,255,255,0.25)", padding: "2px 8px", borderRadius: 999,
                          letterSpacing: "0.06em", textTransform: "uppercase",
                        }}>● Actif</span>
                      )}
                      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.75)", display: "block", marginBottom: 6 }}>{d.categorie}</span>
                      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>{d.titre}</h3>
                    </div>
                    <div style={{ background: "#fff", padding: "14px 20px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                      {d.chapeau && (
                        <p style={{
                          margin: 0, fontSize: 13, color: "#475569", lineHeight: 1.6,
                          display: "-webkit-box", WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical" as const, overflow: "hidden",
                        }}>{d.chapeau}</p>
                      )}
                      {lastActu && (
                        <div style={{ borderLeft: `3px solid ${catColor}`, paddingLeft: 10 }}>
                          <span style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
                            Dernière actu · {lastActuDate}
                          </span>
                          <p style={{
                            margin: "3px 0 0", fontSize: 12, color: "#334155", lineHeight: 1.5,
                            display: "-webkit-box", WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical" as const, overflow: "hidden",
                          }}>{lastActu.titre}</p>
                        </div>
                      )}
                      <div style={{ marginTop: "auto", paddingTop: 10, borderTop: "1px solid #f1f5f9" }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: catColor }}>
                          {d.lien_externe ? "Ouvrir la carte →" : "Lire le dossier →"}
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
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
              <span style={{ fontSize: 12, color: "#94a3b8", marginTop: 4, display: "block" }}>
                Prochain bilan : automne 2026 · Mis à jour le {new Date(promessesData.meta.last_updated).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
            <a href="/bruz-en-action/promesses" style={{ fontSize: 14, fontWeight: 600, color: "#2563eb", textDecoration: "none" }}>
              Voir le détail →
            </a>
          </div>
          <div style={{ maxWidth: 640 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: "#64748b" }}>Mandat 2026-2032</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: "#16a34a" }}>{score}% tenus</span>
            </div>
            <div style={{ height: 12, borderRadius: 999, background: "#f1f5f9", overflow: "hidden", display: "flex" }}>
              {segments.filter(s => s.n > 0).map(s => (
                <div key={s.id} style={{ height: "100%", background: s.color, width: `${(s.n / total) * 100}%`, transition: "width 0.6s" }} />
              ))}
            </div>
            <div style={{ display: "flex", gap: 20, marginTop: 10, flexWrap: "wrap" }}>
              {segments.filter(s => s.n > 0).map(s => (
                <span key={s.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b" }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} />
                  {s.n} {s.label}
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

      {/* ── REJOINDRE ── */}
      <section style={{ background: "linear-gradient(135deg, #1A4177 0%, #0E2F62 100%)", color: "#fff" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "64px var(--container-pad)", textAlign: "center" }}>
          <h2 style={{ color: "#fff", fontSize: "clamp(1.4rem,3vw,2rem)", margin: "0 0 16px" }}>
            Rejoignez le mouvement citoyen
          </h2>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 16, margin: "0 auto 36px", maxWidth: 480, lineHeight: 1.7 }}>
            {association.positionnement} Chaque adhésion renforce notre capacité d'action à Bruz.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={contact.hello_asso_url || "#"} target="_blank" rel="noopener noreferrer" style={{
              padding: "14px 32px", borderRadius: 999, background: "#E8A040", color: "#0E2F62",
              fontSize: 16, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 24px rgba(232,160,64,0.5)",
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
      <SiteFooter />
    </div>
  );
}
