import { notFound } from "next/navigation";
import dossiersData from "../../../../data/dossiers.json";
import metaData from "../../../../data/meta.json";
import SiteFooter from "../../../../components/SiteFooter";

const LOGO = "/bruz-en-action/logo.png";

// Seuls les dossiers avec une page "En profondeur" sont listés ici
const EN_PROFONDEUR_IDS = ["D01"];

export function generateStaticParams() {
  return EN_PROFONDEUR_IDS.map(id => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const dossier = dossiersData.dossiers.find(d => d.id === id);
  if (!dossier) return {};
  return {
    title: `${dossier.titre} — En profondeur — Bruz en Action`,
    description: `Analyse détaillée : ${dossier.chapeau}`,
  };
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 20px", color: "#0f172a", paddingBottom: 10, borderBottom: "2px solid #e84d0e", display: "inline-block" }}>
      {children}
    </h2>
  );
}

function InfoBox({ icon, titre, children }: { icon: string; titre: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "20px 24px", marginBottom: 24 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
        <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0f172a" }}>{titre}</h3>
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.75, color: "#334155" }}>{children}</div>
    </div>
  );
}

export default async function EnProfondeurPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!EN_PROFONDEUR_IDS.includes(id)) notFound();

  const dossier = dossiersData.dossiers.find(d => d.id === id);
  if (!dossier) notFound();

  const { association, contact } = metaData;
  const hasHelloAsso = Boolean(contact.hello_asso_url);

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
              <a href={`/bruz-en-action/dossiers/${id}`} style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: 14, fontWeight: 500 }}>← {dossier.titre}</a>
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
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ padding: "3px 10px", borderRadius: 999, background: "rgba(232,77,14,0.2)", color: "#f97316", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              En profondeur
            </span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{dossier.id}</span>
          </div>
          <h1 style={{ fontSize: "clamp(1.4rem, 3vw, 2.2rem)", fontWeight: 800, lineHeight: 1.2, margin: "0 0 16px", maxWidth: 720, color: "#fff" }}>
            Trambus T4 à Bruz : pourquoi ça compte, qui décide, et quelle vision pour la ville ?
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.75, color: "rgba(255,255,255,0.75)", maxWidth: 680, margin: 0 }}>
            Le T4 n'est pas un simple projet de transport. C'est une décision qui va remodeler Bruz pour trente ans.
            Voici ce qu'il faut comprendre — et les deux visions qui s'affrontent sur le terminus.
          </p>
        </div>
      </section>

      <main style={{ flex: 1 }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px" }}>

          {/* C'est quoi le T4 */}
          <section style={{ marginBottom: 48 }}>
            <SectionTitle>C'est quoi le Trambus T4 ?</SectionTitle>
            <InfoBox icon="🚌" titre="Un Bus à Haut Niveau de Service guidé">
              Le T4 est une ligne de <strong>trambus guidé</strong> (BHNS sur voie propre), à mi-chemin entre le tramway et le bus express.
              Moins coûteux que le tram sur rail, il circule sur une voie réservée, s'arrête à des stations fixes,
              et atteint des capacités de <strong>100 à 150 passagers par rame</strong>.
            </InfoBox>
            <InfoBox icon="🗺️" titre="De Rennes jusqu'à Bruz — ~21 stations">
              La ligne reliera le centre de Rennes aux portes de Bruz en passant par Cesson-Sévigné, Chantepie et Ker Lann.
              Maîtrise d'ouvrage : <strong>Rennes Métropole</strong> (réseau Star).
              Livraison prévue : <strong>2030–2031</strong>.
            </InfoBox>
            <InfoBox icon="⚠️" titre="Bruz ne décide pas — mais ses votes au Conseil Métropolitain comptent">
              Le tracé et le terminus sont validés par Rennes Métropole, pas par la mairie de Bruz.
              Bruz dispose cependant de <strong>représentants au Conseil Métropolitain</strong>.
              Le rapport de force politique — et la capacité à faire entendre la position de Bruz — est donc déterminant.
            </InfoBox>
          </section>

          {/* Pourquoi c'est crucial */}
          <section style={{ marginBottom: 48 }}>
            <SectionTitle>Pourquoi c'est crucial pour Bruz ?</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 16, marginBottom: 24 }}>
              {[
                { icon: "👥", titre: "2ème ville de la métropole", texte: "~20 000 habitants, croissance soutenue. Bruz est la commune la mieux placée pour bénéficier d'une desserte forte vers Rennes." },
                { icon: "🚆", titre: "Gare TER déjà là", texte: "Bruz possède une gare SNCF active (ligne Rennes–Redon). Un terminus T4 à la gare crée un hub multimodal naturel sans infrastructure nouvelle." },
                { icon: "🏗️", titre: "ZAC Multisites en développement", texte: "Le secteur Ker Lann concentre emplois, commerces et logements futurs. Le T4 conditionne sa densification — Rennes Métropole impose 60 lgts/ha sur ce secteur." },
                { icon: "🚗", titre: "Navetteurs nombreux", texte: "Une large part des actifs bruzois travaille à Rennes. Le T4 est une alternative crédible à la voiture si le terminus est bien positionné." },
              ].map(({ icon, titre, texte }) => (
                <div key={titre} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "18px 20px" }}>
                  <div style={{ fontSize: 24, marginBottom: 10 }}>{icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>{titre}</div>
                  <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>{texte}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Les deux visions */}
          <section style={{ marginBottom: 48 }}>
            <SectionTitle>Deux visions du terminus</SectionTitle>
            <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7, marginBottom: 28 }}>
              Là où la ligne se termine, c'est là que la ville se développe.
              Un terminus en centre-ville change tout vs un terminus en gare. Voici les deux lectures en présence.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

              {/* Ancienne majorité */}
              <div style={{ background: "#fff", border: "2px solid #e2e8f0", borderRadius: 16, overflow: "hidden" }}>
                <div style={{ background: "#64748b", padding: "14px 20px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>Ancienne majorité · Salmon (2020–2026)</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>Terminus centre-ville</div>
                </div>
                <div style={{ padding: "20px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      "Faire venir le T4 jusqu'au cœur de Bruz (place de l'Église ou proche)",
                      "Objectif : revitaliser le centre-bourg, attirer flux piétons",
                      "Implique des travaux lourds : voirie, réseaux enterrés, stationnement",
                      "Délais plus longs, coûts d'infrastructure élevés côté commune",
                      "Centre-ville transformé — partisans : dynamisme ; opposants : chantier long et impactant",
                    ].map((pt, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, fontSize: 13, color: "#334155", lineHeight: 1.6 }}>
                        <span style={{ color: "#94a3b8", flexShrink: 0 }}>·</span>
                        {pt}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Nouvelle majorité */}
              <div style={{ background: "#fff", border: "2px solid #e84d0e", borderRadius: 16, overflow: "hidden" }}>
                <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)", padding: "14px 20px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>Nouvelle majorité · Houssin (2026–2032)</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>Terminus gare SNCF + hub multimodal</div>
                </div>
                <div style={{ padding: "20px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      "Terminus à la gare SNCF de Bruz — connexion TER + T4 au même point",
                      "Navettes électriques (bus ou véhicules légers) vers les quartiers et le centre-ville",
                      "Moins de travaux lourds sur le centre-bourg : moins d'impact sur la qualité de vie",
                      "Hub multimodal : une logique de rupture de charge fluide (train → T4 → navette)",
                      "Déploiement plus rapide, coûts de génie civil réduits côté Bruz",
                    ].map((pt, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, fontSize: 13, color: "#334155", lineHeight: 1.6 }}>
                        <span style={{ color: "#e84d0e", flexShrink: 0 }}>→</span>
                        {pt}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Notre lecture */}
          <section style={{ marginBottom: 48 }}>
            <div style={{ background: "#fff8f5", border: "1px solid #fed7aa", borderLeft: "4px solid #e84d0e", borderRadius: 12, padding: "24px 28px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#e84d0e", marginBottom: 10 }}>Notre lecture — position de Bruz en Action</div>
              <p style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: "#0f172a", lineHeight: 1.5 }}>
                Le hub multimodal gare SNCF nous semble la stratégie la plus pragmatique pour Bruz.
              </p>
              <p style={{ margin: "0 0 12px", fontSize: 14, color: "#334155", lineHeight: 1.75 }}>
                Bruz n'a pas les infrastructures souterraines d'une grande ville.
                Refaire le centre-bourg pour accueillir un trambus représente des années de chantier,
                des coûts importants, et un impact fort sur la vie quotidienne des habitants.
              </p>
              <p style={{ margin: "0 0 12px", fontSize: 14, color: "#334155", lineHeight: 1.75 }}>
                À l'inverse, la gare SNCF est déjà un pôle de mobilité. Y connecter le T4 crée une rupture de charge
                efficace, et des navettes électriques peuvent desservir le centre de façon souple et évolutive —
                sans bétonner trente ans de voirie.
              </p>
              <p style={{ margin: 0, fontSize: 14, color: "#64748b", lineHeight: 1.75, fontStyle: "italic" }}>
                Nous soutenons la majorité Houssin et nous assumons cette posture.
                Si vous avez des arguments contraires documentés, <a href={`mailto:${metaData.contact.email}?subject=${encodeURIComponent("[D01] Argumentation terminus T4")}`} style={{ color: "#e84d0e" }}>faites-les nous parvenir</a>.
              </p>
            </div>
          </section>

          {/* Ce qui va se décider */}
          <section style={{ marginBottom: 48 }}>
            <SectionTitle>Ce qui va se décider</SectionTitle>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { periode: "2026–2027", description: "Délibération officielle de Rennes Métropole sur le terminus final. C'est le vote à surveiller au Conseil Métropolitain.", importance: "haute" },
                { periode: "2026–2028", description: "Concertation publique et études d'impact. L'occasion pour les Bruzois de se faire entendre.", importance: "moyenne" },
                { periode: "2028–2030", description: "Travaux de voirie et d'infrastructure sur le tracé Ker Lann–terminus.", importance: "neutre" },
                { periode: "2030–2031", description: "Mise en service prévue de la ligne T4.", importance: "neutre" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 16, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "14px 18px", alignItems: "flex-start" }}>
                  <div style={{ flexShrink: 0, minWidth: 80 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: item.importance === "haute" ? "#e84d0e" : "#64748b" }}>{item.periode}</span>
                  </div>
                  <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.6 }}>
                    {item.description}
                    {item.importance === "haute" && <span style={{ display: "inline-block", marginLeft: 8, fontSize: 10, fontWeight: 700, textTransform: "uppercase", color: "#e84d0e", background: "#fff1ee", padding: "1px 6px", borderRadius: 999 }}>À surveiller</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Retour dossier */}
          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 32, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <a href={`/bruz-en-action/dossiers/${id}`}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#0f172a", color: "#fff", borderRadius: 999, textDecoration: "none", fontSize: 14, fontWeight: 700 }}>
              ← Retour au dossier {id}
            </a>
            <a href="/bruz-en-action/carte"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: "#fff", border: "1px solid #e2e8f0", color: "#0f172a", borderRadius: 999, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
              🗺️ Voir la carte T4
            </a>
          </div>

        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
