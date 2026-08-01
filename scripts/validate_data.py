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

# URLs qui répondent HTTP 200 mais n'amènent pas au contenu attendu : le
# link-checker ne peut pas les voir, seul un motif interdit les attrape.
URL_INTERDITES = {
    "consent.google.com":
        "mur de consentement Google (jeton escs= volatil) — stocker l'URL de l'éditeur",
    "organization/commune-de-bruz":
        "page Mégalis inexistante, repli silencieux sur l'accueil — utiliser ?siren=213500473",
}

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


def check_urls_interdites(node, where: str) -> None:
    """Traque les URLs « vivantes en apparence » dans tout l'arbre de données.

    Une URL qui répond 200 mais retombe sur un mur de consentement ou une page
    d'accueil est indétectable par `agent_qa --links` : elle est restée des
    semaines en production (consent.google.com, lien Mégalis des séances).
    Un champ voisin `<clé>_expiree: true` vaut renoncement assumé et exempte.
    """
    if isinstance(node, dict):
        for k, v in node.items():
            if isinstance(v, str) and node.get(f"{k}_expiree"):
                continue  # source morte assumée, convention projet
            check_urls_interdites(v, f"{where}.{k}")
    elif isinstance(node, list):
        for i, v in enumerate(node):
            check_urls_interdites(v, f"{where}[{i}]")
    elif isinstance(node, str) and node.startswith(("http://", "https://")):
        for motif, raison in URL_INTERDITES.items():
            if motif in node:
                err(f"{where} : URL interdite «{motif}» — {raison}")


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
            "programme.json", "coup_de_pouce.json"}
    for path in sorted(DATA_DIR.glob("*.json")):
        if path.name in done:
            continue
        load(path.name)


TYPES_COUP_DE_POUCE = {"association", "commerce", "cause"}
BESOINS_COUP_DE_POUCE = {"bénévoles", "dons", "clients", "visibilité", "signatures"}


def validate_coup_de_pouce() -> None:
    """Contrôle data/coup_de_pouce.json — le `type` conditionne l'affichage.

    `/coup-de-pouce` construit ses sections par `byType("association" |
    "commerce" | "cause")`. Un item dont le `type` sort de ce référentiel
    n'apparaît dans aucune section, sans erreur, tout en empêchant le message
    « aucune initiative référencée » de s'afficher : il disparaît en silence.
    """
    data = load("coup_de_pouce.json")
    if not data:
        return

    items = data.get("items", [])
    check_unique([i.get("id") for i in items], "coup_de_pouce.json")

    for i, item in enumerate(items):
        where = f"coup_de_pouce.json[{i}]"
        if item.get("type") not in TYPES_COUP_DE_POUCE:
            err(f"{where} : type « {item.get('type')} » hors référentiel "
                f"{sorted(TYPES_COUP_DE_POUCE)} — l'item ne s'affichera nulle part")
        besoin = item.get("besoin")
        if besoin is not None and besoin not in BESOINS_COUP_DE_POUCE:
            warn(f"{where} : besoin « {besoin} » hors référentiel — affiché tel quel, sans pictogramme")
        if not item.get("titre"):
            err(f"{where} : titre manquant")
        check_date(item.get("date_ajout"), where, allow_null=False)
        check_date(item.get("date_fin"), where)
        if item.get("lien"):
            check_url(item["lien"], where)
        source = item.get("source")
        if source is None:
            warn(f"{where} : pas de source — la ligne éditoriale du site impose de sourcer")
        elif not source.get("url") or not source.get("label"):
            err(f"{where} : source incomplète (label et url attendus)")
        else:
            check_url(source["url"], f"{where}.source")
        if not isinstance(item.get("active"), bool):
            err(f"{where} : champ `active` absent ou non booléen — l'item serait filtré à l'affichage")

    check_no_suspect(data, "coup_de_pouce.json")


def validate_liens_nav() -> None:
    """La NavBar pointe vers des dossiers en dur — vérifier qu'ils existent.

    `components/NavBar.tsx` ne peut pas importer `dossiers.json` (204 Ko dans un
    composant client), les liens `/dossiers/DXX` y sont donc écrits en dur. Sans
    ce garde-fou, renuméroter ou retirer un dossier laisserait un lien de
    navigation en 404 sans que rien ne le signale.
    """
    navbar = Path(__file__).parent.parent / "components" / "NavBar.tsx"
    if not navbar.exists():
        warn("components/NavBar.tsx introuvable — liens de nav non vérifiés")
        return

    dossiers = load("dossiers.json")
    if not dossiers:
        return
    ids_connus = {d["id"] for d in dossiers.get("dossiers", [])}

    cibles = re.findall(r"/bruz-en-action/dossiers/(D\d{2})", navbar.read_text(encoding="utf-8"))
    for cible in sorted(set(cibles)):
        if cible not in ids_connus:
            err(f"NavBar.tsx pointe vers /dossiers/{cible} qui n'existe pas dans dossiers.json")


def validate_urls_interdites() -> None:
    """Balaye tous les data/*.json, pas seulement les fichiers au schéma connu."""
    for path in sorted(DATA_DIR.glob("*.json")):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            continue  # déjà signalé par validate_parse_only()
        check_urls_interdites(data, path.name)


def validate_urls_interdites_source() -> None:
    """Les mêmes URLs interdites, mais câblées en dur dans les pages.

    Contrôler `data/` ne suffit pas : les 4 dernières occurrences du lien
    Mégalis mort étaient écrites directement dans le TSX, invisibles pour un
    contrôle des seules données — et elles ont survécu à la correction des
    28 occurrences côté data (constaté en production le 2026-08-01).
    """
    app_dir = DATA_DIR.parent / "app"
    if not app_dir.exists():
        return
    for path in sorted(app_dir.rglob("*.tsx")):
        texte = path.read_text(encoding="utf-8")
        for motif, raison in URL_INTERDITES.items():
            if motif in texte:
                rel = path.relative_to(DATA_DIR.parent)
                err(f"{rel} : URL interdite «{motif}» câblée en dur — {raison}")


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
    validate_coup_de_pouce()
    validate_parse_only()
    validate_liens_nav()
    validate_urls_interdites()
    validate_urls_interdites_source()

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
