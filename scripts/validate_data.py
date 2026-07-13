#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Validateur des données data/*.json — garde-fou avant commit et avant build CI.

Encode les règles du projet qui ont déjà causé des bugs :
  - dates au format ISO YYYY-MM-DD ou null (jamais de RFC tronquée "Sun, 21 De")
  - IDs uniques (actus, dossiers Dxx, séances CM, promesses)
  - champs requis présents (titre, statut_id parmi les statuts déclarés…)
  - URLs en http(s)
  - pas de "undefined" / "[object Object]" sérialisés dans les valeurs

Usage :
  python3 scripts/validate_data.py            # exit 0 si OK, 1 si erreurs
  python3 scripts/validate_data.py --verbose  # détaille aussi les warnings

Branché en CI (step avant npm run build) et à lancer avant tout commit de data/.
"""

import argparse
import json
import re
import sys
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"
ISO_DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
DOSSIER_ID = re.compile(r"^D\d{2}$")
SUSPECT_VALUES = ("undefined", "[object Object]", "NaN")

errors: list[str] = []
warnings: list[str] = []


def err(msg: str) -> None:
    errors.append(msg)


def warn(msg: str) -> None:
    warnings.append(msg)


def check_date(value, where: str, allow_null: bool = True) -> None:
    if value is None:
        if not allow_null:
            err(f"{where} : date null interdite ici")
        return
    if not isinstance(value, str) or not ISO_DATE.match(value):
        err(f"{where} : date non-ISO «{value}»")


def check_url(value, where: str) -> None:
    if value in (None, ""):
        return
    if not isinstance(value, str) or not value.startswith(("http://", "https://")):
        err(f"{where} : URL invalide «{str(value)[:60]}»")


def check_no_suspect(node, where: str) -> None:
    """Détecte les valeurs de rendu cassé sérialisées dans les données."""
    if isinstance(node, dict):
        for k, v in node.items():
            check_no_suspect(v, f"{where}.{k}")
    elif isinstance(node, list):
        for i, v in enumerate(node):
            check_no_suspect(v, f"{where}[{i}]")
    elif isinstance(node, str):
        for s in SUSPECT_VALUES:
            if s in node:
                err(f"{where} : valeur suspecte «{s}» dans «{node[:60]}»")


def check_unique(ids: list, where: str) -> None:
    seen = set()
    for i in ids:
        if i in seen:
            err(f"{where} : id dupliqué «{i}»")
        seen.add(i)


def load(name: str) -> dict | None:
    path = DATA_DIR / name
    if not path.exists():
        warn(f"{name} absent")
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        err(f"{name} : JSON invalide — {e}")
        return None


def validate_actus() -> None:
    data = load("actus.json")
    if not data:
        return
    actus = data.get("actus", [])
    check_unique([a.get("id") for a in actus], "actus.json")
    for a in actus:
        aid = a.get("id", "?")
        where = f"actus.json[{aid}]"
        if not a.get("titre"):
            err(f"{where} : titre manquant")
        check_date(a.get("date"), where)
        check_date(a.get("date_publication_estimee"), where + ".date_publication_estimee")
        if not a.get("date") and not a.get("date_publication_estimee"):
            warn(f"{where} : ni date ni date_publication_estimee — invisible dans les listes triées")
        check_url(a.get("source_url"), where)
        if "contenu" in a and a.get("type") != "analyse":
            warn(f"{where} : champ «contenu» réservé au type analyse (type={a.get('type')})")
    check_no_suspect(data, "actus.json")


def validate_dossiers() -> None:
    data = load("dossiers.json")
    if not data:
        return
    dossiers = data.get("dossiers", [])
    check_unique([d.get("id") for d in dossiers], "dossiers.json")
    for d in dossiers:
        did = d.get("id", "?")
        where = f"dossiers.json[{did}]"
        if not DOSSIER_ID.match(str(did)):
            err(f"{where} : id hors format Dxx")
        if not d.get("titre"):
            err(f"{where} : titre manquant")
        check_date(d.get("last_activity"), where + ".last_activity")
        for i, a in enumerate(d.get("actus_recentes", [])):
            check_date(a.get("date"), f"{where}.actus_recentes[{i}]")
            check_url(a.get("source_url"), f"{where}.actus_recentes[{i}]")
    check_no_suspect(data, "dossiers.json")


def validate_promesses() -> None:
    data = load("promesses.json")
    if not data:
        return
    statuts_valides = {s.get("id") for s in data.get("statuts", [])}
    promesses = data.get("promesses", [])
    if len(promesses) != 50:
        err(f"promesses.json : {len(promesses)} promesses (attendu : 50)")
    check_unique([p.get("ref") for p in promesses], "promesses.json (ref)")
    check_unique([p.get("id") for p in promesses], "promesses.json (id)")
    for p in promesses:
        where = f"promesses.json[{p.get('ref', '?')}]"
        if p.get("statut_id") not in statuts_valides:
            err(f"{where} : statut_id «{p.get('statut_id')}» hors référentiel {sorted(statuts_valides)}")
        if not p.get("titre"):
            err(f"{where} : titre manquant")
        check_url((p.get("source") or {}).get("url"), where + ".source")
    check_no_suspect(data, "promesses.json")


def validate_cms() -> None:
    data = load("cms.json")
    if not data:
        return
    seances = data.get("seances", [])
    check_unique([s.get("id") for s in seances], "cms.json")
    for s in seances:
        where = f"cms.json[{s.get('id', '?')}]"
        check_date(s.get("date"), where, allow_null=False)
        if not s.get("titre"):
            err(f"{where} : titre manquant")
        for i, src in enumerate(s.get("sources", [])):
            check_url(src.get("url"), f"{where}.sources[{i}]")
    check_no_suspect(data, "cms.json")


def validate_evenements() -> None:
    data = load("evenements.json")
    if not data:
        return
    for i, e in enumerate(data.get("evenements", [])):
        where = f"evenements.json[{i}]"
        check_date(e.get("date"), where)
        if not e.get("titre"):
            err(f"{where} : titre manquant")
    check_no_suspect(data, "evenements.json")


def validate_elus() -> None:
    data = load("elus.json")
    if not data:
        return
    elus = data.get("elus", [])
    if elus and len(elus) != 33:
        warn(f"elus.json : {len(elus)} élus (attendu : 33)")
    for i, e in enumerate(elus):
        if not e.get("nom"):
            err(f"elus.json[{i}] : nom manquant")
    check_no_suspect(data, "elus.json")


def validate_bruz() -> None:
    """bruz.json : le bloc stats_dossiers doit rester cohérent (il pilote le
    panneau « Chiffres de contexte » des pages dossier)."""
    data = load("bruz.json")
    if not data:
        return
    dossiers_data = load("dossiers.json") or {}
    dossier_ids = {d.get("id") for d in dossiers_data.get("dossiers", [])}

    def resolve(path: str):
        node = data
        for key in path.split("."):
            if not isinstance(node, dict) or key not in node:
                return None
            node = node[key]
        return node

    for did, stats in (data.get("stats_dossiers") or {}).items():
        where = f"bruz.json.stats_dossiers[{did}]"
        if did not in dossier_ids:
            err(f"{where} : dossier inconnu dans dossiers.json")
        for i, s in enumerate(stats):
            w = f"{where}[{i}]"
            for field in ("label", "source", "source_url", "annee"):
                if not s.get(field):
                    err(f"{w} : champ «{field}» manquant")
            check_url(s.get("source_url"), w)
            if not s.get("valeur") and not s.get("valeur_path"):
                err(f"{w} : ni valeur ni valeur_path")
            if s.get("valeur_path") and resolve(s["valeur_path"]) is None:
                err(f"{w} : valeur_path «{s['valeur_path']}» ne résout pas dans bruz.json")
    check_no_suspect(data, "bruz.json")


def validate_programme() -> None:
    """programme.json : les 10 priorités pilotent la page /programme, et
    pilier_id doit renvoyer à un pilier existant de promesses.json."""
    data = load("programme.json")
    if not data:
        return
    pilier_ids = {p.get("id") for p in (load("promesses.json") or {}).get("piliers", [])}
    priorites = data.get("priorites", [])
    if len(priorites) != 10:
        err(f"programme.json : {len(priorites)} priorités (attendu : 10)")
    check_unique([p.get("num") for p in priorites], "programme.json (num)")
    for p in priorites:
        where = f"programme.json[{p.get('num', '?')}]"
        for field in ("titre", "accroche", "color", "emoji"):
            if not p.get(field):
                err(f"{where} : champ «{field}» manquant")
        if p.get("pilier_id") not in pilier_ids:
            err(f"{where} : pilier_id «{p.get('pilier_id')}» hors référentiel promesses.json")
        if not p.get("engagements") or not p.get("actions"):
            err(f"{where} : engagements/actions vides")
    check_no_suspect(data, "programme.json")


def validate_parse_only() -> None:
    """Les autres fichiers data/ doivent au minimum parser."""
    done = {"actus.json", "dossiers.json", "promesses.json", "cms.json",
            "evenements.json", "elus.json", "actus_queue.json", "bruz.json",
            "programme.json"}
    for path in sorted(DATA_DIR.glob("*.json")):
        if path.name in done:
            continue
        load(path.name)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--verbose", action="store_true")
    args = parser.parse_args()

    validate_actus()
    validate_dossiers()
    validate_promesses()
    validate_cms()
    validate_evenements()
    validate_elus()
    validate_bruz()
    validate_programme()
    validate_parse_only()

    if warnings and args.verbose:
        print(f"⚠️  {len(warnings)} warning(s) :")
        for w in warnings:
            print(f"   {w}")
    if errors:
        print(f"❌ {len(errors)} erreur(s) :")
        for e in errors:
            print(f"   {e}")
        sys.exit(1)
    print(f"✅ data/*.json valides ({len(warnings)} warning(s))")


if __name__ == "__main__":
    main()
