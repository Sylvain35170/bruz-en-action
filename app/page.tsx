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
  const tauxTenues = total > 0 ? Math.round((tenues / total) * 100) : 0;
  const countByPilier = (id: number) => promesses.filter((p) => p.pilier_id === id).length;
  const tenusByPilier = (id: number) =>
    promesses.filter((p) => p.pilier_id === id && p.statut_id === "tenu").length;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f1f5f9" }}>

      {/* ── HEADER ── */}
      <header
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1e4976 100%)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6">

          {/* Top bar */}
          <div className="flex items-center justify-between py-4 border-b border-white/10">
            <Image
              src="/logo.png"
              alt={association.nom}
              width={180}
              height={72}
              className="object-contain"
              style={{ filter: "brightness(0) invert(1)" }}
              priority
            />
            <span
              className="text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}
            >
              Veille citoyenne · Bruz (35)
            </span>
          </div>

          {/* Hero */}
          <div className="py-12 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8">
            <div className="max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#93c5fd" }}>
                Mandat 2026 – 2031
              </p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4">
                {association.mission}
              </h1>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                {association.positionnement}
              </p>
            </div>

            {/* Score global */}
            <div
              className="shrink-0 rounded-2xl p-6 text-center"
              style={{ backgroundColor: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)", minWidth: "160px" }}
            >
              <p className="text-5xl font-black text-white mb-1">{tauxTenues}%</p>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#93c5fd" }}>
                Taux de réalisation
              </p>
              {total === 0 && (
                <p className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.4)" }}>
                  (données à venir)
                </p>
              )}
            </div>
          </div>

          {/* Bureau */}
          <div
            className="flex flex-wrap gap-x-8 gap-y-1 pb-5 text-xs"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            {[
              { role: "Président", name: bureau.president },
              { role: "Secrétaire", name: bureau.secretaire },
              { role: "Trésorier", name: bureau.tresorier },
            ].map(({ role, name }) => (
              <span key={role}>
                {role} ·{" "}
                <span style={{ color: "rgba(255,255,255,0.75)" }} className="font-medium">
                  {name}
                </span>
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* ── STATS BAND ── */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Promesses totales", value: total, color: "#1e3a5f", bg: "#eff6ff" },
              { label: "Tenues", value: tenues, color: "#16a34a", bg: "#f0fdf4" },
              { label: "En cours", value: enCours, color: "#d97706", bg: "#fffbeb" },
              { label: "Non commencées", value: nonCommences, color: "#6b7280", bg: "#f9fafb" },
            ].map(({ label, value, color, bg }) => (
              <div
                key={label}
                className="rounded-xl px-5 py-4 flex items-center gap-4"
                style={{ backgroundColor: bg }}
              >
                <p className="text-3xl font-black" style={{ color }}>
                  {value}
                </p>
                <p className="text-xs font-medium leading-tight" style={{ color: "#64748b" }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-10 w-full space-y-10">

        {/* ── PILIERS ── */}
        <section>
          <SectionTitle>Les 6 piliers du programme</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {piliers.map((pilier) => {
              const count = countByPilier(pilier.id);
              const tenus = tenusByPilier(pilier.id);
              const pct = count > 0 ? Math.round((tenus / count) * 100) : 0;
              return (
                <div
                  key={pilier.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  style={{ borderTop: `4px solid ${pilier.color}` }}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-sm font-bold text-gray-800 leading-tight pr-2">
                        {pilier.label}
                      </h3>
                      <span
                        className="text-2xl font-black shrink-0"
                        style={{ color: pilier.color }}
                      >
                        {count}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs" style={{ color: "#94a3b8" }}>
                        <span>{count === 0 ? "Aucune promesse" : `${tenus} tenue${tenus > 1 ? "s" : ""}`}</span>
                        {count > 0 && <span className="font-semibold" style={{ color: pilier.color }}>{pct}%</span>}
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#f1f5f9" }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: pilier.color }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── PROMESSES ── */}
        <section>
          <SectionTitle>Suivi des promesses</SectionTitle>
          <PromessesSection promesses={promesses} piliers={piliers} statuts={statuts} />
        </section>

        {/* ── ACTUS ── */}
        <section>
          <SectionTitle>Actualités de suivi</SectionTitle>
          {actus.length === 0 ? (
            <EmptyState text="Aucune actualité pour le moment." />
          ) : (
            <div className="space-y-3">
              {actus.map((actu) => (
                <div key={actu.id} className="bg-white rounded-2xl shadow-sm p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: "#94a3b8" }}>
                        {actu.date}
                      </p>
                      <p className="font-bold text-gray-800">{actu.titre}</p>
                      <p className="text-sm mt-1 leading-relaxed" style={{ color: "#64748b" }}>
                        {actu.contenu}
                      </p>
                    </div>
                    {actu.lien && (
                      <a
                        href={actu.lien}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
                        style={{ backgroundColor: "#eff6ff", color: "#2563eb" }}
                      >
                        Source →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: "#0f172a" }}>
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-wrap gap-6 items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#475569" }}>
                Sources surveillées
              </p>
              <div className="flex flex-wrap gap-4">
                {sources_surveillees.map((s) => (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs transition-colors hover:text-white"
                    style={{ color: "#64748b" }}
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs" style={{ color: "#334155" }}>
                {association.nom} · Fondée en {association.fondee_en}
              </p>
              <p className="text-xs mt-1" style={{ color: "#1e293b" }}>
                Association non partisane de veille municipale
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-extrabold text-gray-800 mb-4 flex items-center gap-2">
      <span className="w-1 h-5 rounded-full inline-block" style={{ backgroundColor: "#2563eb" }} />
      {children}
    </h2>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div
      className="rounded-2xl p-12 text-center border-2 border-dashed"
      style={{ borderColor: "#e2e8f0", backgroundColor: "white" }}
    >
      <p className="text-sm" style={{ color: "#94a3b8" }}>
        {text}
      </p>
    </div>
  );
}
