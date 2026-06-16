"use client";

import { useState } from "react";
import type { Promesse, Pilier, Statut } from "../types";

interface Props {
  promesses: Promesse[];
  piliers: Pilier[];
  statuts: Statut[];
}

export default function PromessesSection({ promesses, piliers, statuts }: Props) {
  const [pilierFilter, setPilierFilter] = useState<number | null>(null);
  const [statutFilter, setStatutFilter] = useState<string | null>(null);

  const filtered = promesses.filter((p) => {
    if (pilierFilter !== null && p.pilier_id !== pilierFilter) return false;
    if (statutFilter !== null && p.statut_id !== statutFilter) return false;
    return true;
  });

  const getPilier = (id: number) => piliers.find((p) => p.id === id);
  const getStatut = (id: string) => statuts.find((s) => s.id === id);

  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Suivi des promesses</h2>

      {/* Filtres piliers */}
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          onClick={() => setPilierFilter(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
            pilierFilter === null
              ? "bg-gray-800 text-white border-gray-800"
              : "bg-white text-gray-600 border-gray-300 hover:border-gray-500"
          }`}
        >
          Tous les piliers
        </button>
        {piliers.map((p) => (
          <button
            key={p.id}
            onClick={() => setPilierFilter(pilierFilter === p.id ? null : p.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              pilierFilter === p.id
                ? "text-white border-transparent"
                : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
            }`}
            style={pilierFilter === p.id ? { backgroundColor: p.color, borderColor: p.color } : {}}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Filtres statuts */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setStatutFilter(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            statutFilter === null
              ? "bg-gray-800 text-white border-gray-800"
              : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
          }`}
        >
          Tous les statuts
        </button>
        {statuts.map((s) => (
          <button
            key={s.id}
            onClick={() => setStatutFilter(statutFilter === s.id ? null : s.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              statutFilter === s.id ? "text-white border-transparent" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
            }`}
            style={statutFilter === s.id ? { backgroundColor: s.color, borderColor: s.color } : {}}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Tableau ou état vide */}
      {promesses.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-400 text-lg mb-2">Aucune promesse saisie pour le moment</p>
          <p className="text-gray-400 text-sm">Les données seront ajoutées après analyse du programme électoral.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400">Aucune promesse ne correspond aux filtres sélectionnés.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Promesse</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 w-40">Pilier</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 w-40">Statut</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 w-20">Page</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((p) => {
                const pilier = getPilier(p.pilier_id);
                const statut = getStatut(p.statut_id);
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-gray-800 font-medium">{p.titre}</td>
                    <td className="px-4 py-3">
                      {pilier && (
                        <span
                          className="inline-flex items-center gap-1.5 text-xs font-medium"
                          style={{ color: pilier.color }}
                        >
                          <span
                            className="w-2 h-2 rounded-full inline-block"
                            style={{ backgroundColor: pilier.color }}
                          />
                          {pilier.label}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {statut && (
                        <span
                          className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: statut.color }}
                        >
                          {statut.label}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {p.page_programme ? `p. ${p.page_programme}` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-400">
            {filtered.length} promesse{filtered.length > 1 ? "s" : ""} affichée{filtered.length > 1 ? "s" : ""}
            {filtered.length < promesses.length && ` sur ${promesses.length}`}
          </div>
        </div>
      )}
    </section>
  );
}
