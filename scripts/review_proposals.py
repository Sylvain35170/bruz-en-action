#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Revue éditoriale des propositions — applique les décisions au registre.

C'est l'outil de la convention "on examine les propositions" (Claude Code) :
  1. --list           : affiche les items en attente (statut pending), triés par pertinence
  2. --accept / --reject : applique les décisions
       accepté → publié dans data/actus.json + statut "accepted"
       rejeté  → statut "rejected" (mémorisé : ne sera jamais re-proposé)
  3. --purge-accepted : retire du registre les accepted vieux de +60 jours
       (leur URL est dans actus.json, qui suffit à la dédup ; les rejected
        restent pour toujours — c'est la mémoire anti re-proposition)

Usage :
  python3 scripts/review_proposals.py --list
  python3 scripts/review_proposals.py --accept id1,id2 --reject id3,id4
  python3 scripts/review_proposals.py --accept id1 --dossier D05
  python3 scripts/review_proposals.py --purge-accepted

Après acceptation : lancer agent_dossiers puis build + push (revue humaine
dans Claude Code — le push reste manuel, cf. run_agents.py).
"""

import argparse
import sys
from datetime import date, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from utils import DATA_DIR, load_json, load_registry, log, save_json, save_registry, today

PURGE_ACCEPTED_DAYS = 60


def list_pending() -> None:
    registry = load_registry()
    pending = [p for p in registry["items"] if p.get("statut") == "pending"]
    if not pending:
        log("Aucune proposition en attente de revue.", "OK")
        return
    pending.sort(key=lambda p: (-p.get("pertinence", 0), p.get("first_seen", "")))
    log(f"{len(pending)} proposition(s) en attente :\n")
    for p in pending:
        print(f"  [{p.get('id')}] p{p.get('pertinence', '?')} · {p.get('dossier', 'à_classer'):9} "
              f"· vu le {p.get('first_seen', '?')} · {p.get('source_label', '')}")
        print(f"      {p.get('titre', '')}")
        print(f"      {p.get('resume', '')}")
        print(f"      {p.get('source_url', '')}\n")


def _to_actu(p: dict) -> dict:
    """Mappe un item du registre vers le schéma de data/actus.json."""
    actu = {
        "id": p.get("id", ""),
        "titre": p.get("titre", ""),
        "date": p.get("date") or None,
        "detail": p.get("resume", ""),
        "source_url": p.get("source_url", ""),
        "source_label": p.get("source_label", ""),
        "type": p.get("type") or "presse",
    }
    if p.get("dossier") and p["dossier"] != "à_classer":
        actu["dossier"] = p["dossier"]
    return actu


def apply_decisions(accept_ids: list[str], reject_ids: list[str],
                    dossier_override: str | None) -> None:
    registry = load_registry()
    by_id = {p.get("id"): p for p in registry["items"]}

    unknown = [i for i in accept_ids + reject_ids if i not in by_id]
    if unknown:
        log(f"IDs inconnus dans le registre : {', '.join(unknown)}", "ERR")
        sys.exit(1)
    not_pending = [i for i in accept_ids + reject_ids
                   if by_id[i].get("statut") != "pending"]
    if not_pending:
        log(f"Déjà décidés (statut ≠ pending) : {', '.join(not_pending)}", "ERR")
        sys.exit(1)

    actus_data = load_json(DATA_DIR / "actus.json")
    actus = actus_data.setdefault("actus", [])
    published_urls = {a.get("source_url", "") for a in actus}

    n_published = 0
    for item_id in accept_ids:
        p = by_id[item_id]
        if dossier_override:
            p["dossier"] = dossier_override
        url = p.get("source_url", "")
        if url and url in published_urls:
            log(f"  {item_id} déjà présent dans actus.json — statut accepté sans doublon.", "WARN")
        else:
            actus.insert(0, _to_actu(p))
            n_published += 1
            log(f"  ✅ publié : {p.get('titre', '')[:70]}", "OK")
        p["statut"] = "accepted"
        p["decided_at"] = today()

    for item_id in reject_ids:
        p = by_id[item_id]
        p["statut"] = "rejected"
        p["decided_at"] = today()
        log(f"  ❌ rejeté : {p.get('titre', '')[:70]}")

    if n_published:
        actus_data.setdefault("meta", {})["last_updated"] = today()
        save_json(DATA_DIR / "actus.json", actus_data)
    save_registry(registry)

    remaining = sum(1 for p in registry["items"] if p.get("statut") == "pending")
    log(f"\nRevue appliquée : {n_published} publié(s), {len(reject_ids)} rejeté(s) — "
        f"{remaining} encore en attente.", "OK")
    if n_published:
        log("Étapes suivantes : agent_dossiers → npm run build → commit + push data/.")


def purge_accepted() -> None:
    registry = load_registry()
    cutoff = (date.today() - timedelta(days=PURGE_ACCEPTED_DAYS)).isoformat()
    before = len(registry["items"])
    registry["items"] = [
        p for p in registry["items"]
        if not (p.get("statut") == "accepted" and (p.get("decided_at") or "") < cutoff)
    ]
    removed = before - len(registry["items"])
    save_registry(registry)
    log(f"Purge : {removed} accepted de plus de {PURGE_ACCEPTED_DAYS} jours retirés du registre.", "OK")


def main() -> None:
    parser = argparse.ArgumentParser(description="Revue des propositions éditoriales")
    parser.add_argument("--list", action="store_true", help="Afficher les items pending")
    parser.add_argument("--accept", default="", help="IDs à publier, séparés par des virgules")
    parser.add_argument("--reject", default="", help="IDs à rejeter, séparés par des virgules")
    parser.add_argument("--dossier", default=None, help="Forcer le dossier des items acceptés (ex: D05)")
    parser.add_argument("--purge-accepted", action="store_true",
                        help=f"Retirer les accepted de +{PURGE_ACCEPTED_DAYS} jours")
    args = parser.parse_args()

    if args.purge_accepted:
        purge_accepted()
        return
    accept_ids = [i.strip() for i in args.accept.split(",") if i.strip()]
    reject_ids = [i.strip() for i in args.reject.split(",") if i.strip()]
    if accept_ids or reject_ids:
        apply_decisions(accept_ids, reject_ids, args.dossier)
        return
    list_pending()


if __name__ == "__main__":
    main()
