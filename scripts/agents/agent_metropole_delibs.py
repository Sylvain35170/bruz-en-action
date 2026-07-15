#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Agent Métropole — délibérations de Rennes Métropole concernant Bruz.

Source : dataset Opendatasoft « Délibérations Rennes Métropole » sur
data.rennesmetropole.fr (API explore v2.1). C'est le SEUL index fiable :
Mégalis (SIREN 243500139) ne reçoit que les actes réglementaires de la
Métropole via son moteur de recherche — les PDF de délibérations y sont
hébergés (les `delib_url` du dataset pointent dessus) mais introuvables
par la recherche du portail (constat 2026-07-14).

Les délibérations matchant les mots-clés Bruz entrent dans la queue de
veille (actus_queue.json) → agent_select → revue humaine, comme la presse.
Pas d'écriture directe dans cms.json > conseil_metropolitain : les champs
éditoriaux (impact_bruz, points_cles) demandent une lecture humaine du PDF.

Usage :
  python3 -m agents.agent_metropole_delibs              # fenêtre standard
  python3 -m agents.agent_metropole_delibs --days 400 --dry-run   # test
"""

import argparse
import sys
from datetime import date, timedelta
from urllib.parse import urlencode
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from utils import append_to_queue, fetch, known_urls, log, stable_id

AGENT_NAME = "metropole_delibs"

API_URL = ("https://data.rennesmetropole.fr/api/explore/v2.1/catalog/datasets/"
           "deliberations-rennes-metropole-2021-copie/records")
SOURCE_LABEL = "Rennes Métropole — délibérations (open data)"

# Mots-clés full-text ODSQL — un OR sur l'ensemble. « trambus » couvre les
# délibérations T4 (toujours intitulées « ligne de Trambus T4 »).
KEYWORDS = ["Bruz", "Ker Lann", "trambus", "PLUiH"]

DEFAULT_DAYS = 120  # fenêtre glissante ; la dédup (known_urls) absorbe le recouvrement

ORGANE = {"C": "Conseil métropolitain", "B": "Bureau métropolitain"}


def _clean_objet(objet: str, delib_id: str) -> str:
    """Retire le préfixe delib_id concaténé dans l'objet (« C2026_108Administration… »)."""
    objet = (objet or "").strip()
    if delib_id and objet.startswith(delib_id):
        objet = objet[len(delib_id):]
    return objet.lstrip("_- ").strip()


def _vote_str(r: dict) -> str:
    if r.get("vote_pour") is None:
        return ""
    contre = r.get("vote_contre") or 0
    abst = r.get("vote_abstention") or 0
    if not contre and not abst:
        return f"Vote : unanimité ({r['vote_pour']} pour)."
    parts = [f"{r['vote_pour']} pour"]
    if contre:
        parts.append(f"{contre} contre")
    if abst:
        parts.append(f"{abst} abstention(s)")
    return "Vote : " + ", ".join(parts) + "."


def fetch_deliberations(days: int) -> list[dict]:
    """Interroge l'API Opendatosoft : mots-clés en OR sur delib_objet + fenêtre glissante.

    ⚠️ Syntaxe ODSQL piégeuse (constat 2026-07-14) : un groupe full-text nu
    parenthésé combiné à un filtre de champ — `("Bruz" OR …) AND delib_date >= …`
    — retourne 0 résultat SANS erreur, tout comme `now(days=-N)`. Seule forme
    fiable : `delib_objet like "…"` par mot-clé + date littérale calculée.
    """
    cutoff = (date.today() - timedelta(days=days)).isoformat()
    likes = " OR ".join(f'delib_objet like "{k}"' for k in KEYWORDS)
    where = f'({likes}) AND delib_date >= "{cutoff}"'
    results, offset = [], 0
    while True:
        params = urlencode({
            "select": ("delib_id,delib_date,delib_objet,delib_url,delib_matiere_nom,"
                       "vote_pour,vote_contre,vote_abstention"),
            "order_by": "-delib_date",
            "limit": 100,
            "offset": offset,
            "where": where,
        })
        r = fetch(f"{API_URL}?{params}")
        if not r:
            return results
        data = r.json()
        batch = data.get("results", [])
        results.extend(batch)
        offset += len(batch)
        if not batch or offset >= data.get("total_count", 0):
            return results


def to_queue_item(r: dict) -> dict | None:
    url = r.get("delib_url") or ""
    if not url:
        return None
    delib_id = r.get("delib_id") or ""
    organe = ORGANE.get(delib_id[:1], "Rennes Métropole")
    date = (r.get("delib_date") or "")[:10]
    objet = _clean_objet(r.get("delib_objet"), delib_id)
    detail_parts = [p for p in (
        f"Délibération {delib_id} du {organe.lower()} ({r.get('delib_matiere_nom') or 'matière non précisée'}).",
        _vote_str(r),
    ) if p]
    return {
        "id": stable_id("metropole", url),
        "titre": f"{organe} — {objet}",
        "source_url": url,
        "source_label": SOURCE_LABEL,
        "date": date,
        "detail": " ".join(detail_parts),
        "type": "metropole",
    }


def run(days: int = DEFAULT_DAYS, dry_run: bool = False) -> bool:
    delibs = fetch_deliberations(days)
    log(f"Métropole : {len(delibs)} délibération(s) matchant {KEYWORDS} sur {days} j.")
    existing = known_urls()
    nouvelles = []
    for r in delibs:
        item = to_queue_item(r)
        if item and item["source_url"] not in existing:
            nouvelles.append(item)
            existing.add(item["source_url"])
            log(f"  🆕 {item['date']} · {item['titre'][:80]}", "NEW")

    if dry_run:
        log(f"Métropole (dry-run) : {len(nouvelles)} item(s) auraient été mis en queue.", "INFO")
        return False
    if not nouvelles:
        log("Métropole : rien de nouveau.", "INFO")
        return False
    n = append_to_queue(nouvelles)
    log(f"Métropole : {n} délibération(s) → queue", "OK")
    return n > 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Veille délibérations Rennes Métropole")
    parser.add_argument("--days", type=int, default=DEFAULT_DAYS)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    run(days=args.days, dry_run=args.dry_run)
