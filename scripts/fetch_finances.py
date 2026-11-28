# -*- coding: utf-8 -*-
"""Import reproductible des séries financières de Bruz dans data/bruz.json.

Sources (open data, sans clé d'API) :
- DGFiP — « Comptes individuels des communes (fichier global) », un jeu de
  données par millésime sur data.economie.gouv.fr. Budget principal, montants
  en milliers d'euros, avec la moyenne par habitant de la strate de population.
- OFGL — « Fiscalité directe locale 2012-2025 - base simplifiée » et
  « Dotations des communes » (data.ofgl.fr) : CFE/CVAE/IFER prélevées sur le
  territoire de Bruz mais perçues par Rennes Métropole (fiscalité
  professionnelle unique).

Écrit sous `finances_communales` :
- `series_dgfip` : une entrée par exercice (2009 → dernier publié) ;
- `series_ofgl` : agrégats en opérations réelles (2018 → dernier publié) —
  seule série où « recettes − dépenses de fonctionnement = épargne brute »
  (les charges DGFiP incluent les dotations aux amortissements, écritures
  d'ordre, et les produits DGFiP incluent les cessions) ;
- `fiscalite_entreprises` : ce que paient les entreprises implantées à Bruz et
  qui le perçoit.

Usage :
    python3 scripts/fetch_finances.py           # utilise le cache s'il existe
    python3 scripts/fetch_finances.py --force   # re-télécharge

Même esprit que fetch_insee.py : idempotent, aucune donnée en dur, la page
/statistiques ne fait que rendre ce que ce script écrit.
"""

from __future__ import annotations

import json
import sys
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CACHE_DIR = Path(__file__).resolve().parent / "cache" / "finances"
BRUZ_JSON = ROOT / "data" / "bruz.json"

INSEE_BRUZ = "35047"
DGFIP_API = "https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets"
DGFIP_PAGE = "https://data.economie.gouv.fr/explore/?q=comptes+individuels+des+communes"
# Millésimes publiés par la DGFiP (un dataset peut couvrir plusieurs années).
DGFIP_DATASETS = [
    "20090", "2010", "2011-2015", "2016", "2017", "2018", "2019-2020",
    "2021", "2022", "2023-2024", "2025",
]
OFGL_API = "https://data.ofgl.fr/api/explore/v2.1/catalog/datasets"
OFGL_PAGE = "https://data.ofgl.fr/explore/dataset/base-fiscale-simplifiee/"

# Champs DGFiP retenus : montants en k€ (sans préfixe), f = €/hab Bruz,
# m = moyenne €/hab de la strate.
CHAMPS_KEUR = {
    "prod": "recettes_fonctionnement",
    "charge": "depenses_fonctionnement",
    "perso": "personnel",
    "impo1": "impots_locaux",
    "dgf": "dgf",
    "equip": "depenses_equipement",
    "emp": "emprunts_nouveaux",
    "remb": "remboursement_capital",
    "caf": "epargne_brute",
    "cafn": "epargne_nette",
    "dette": "encours_dette",
    "annu": "annuite_dette",
}
CHAMPS_STRATE_HAB = {
    "mprod": "recettes_fonctionnement_hab",
    "mcharge": "depenses_fonctionnement_hab",
    "mequip": "depenses_equipement_hab",
    "mdette": "encours_dette_hab",
    "mperso": "personnel_hab",
    "mimpo1": "impots_locaux_hab",
}
CHAMPS_BRUZ_HAB = {
    "fprod": "recettes_fonctionnement_hab",
    "fcharge": "depenses_fonctionnement_hab",
    "fequip": "depenses_equipement_hab",
    "fdette": "encours_dette_hab",
    "fperso": "personnel_hab",
    "fimpo1": "impots_locaux_hab",
}


def _get_json(url: str, cache_name: str, force: bool) -> object:
    """Télécharge une URL JSON avec cache disque.

    Returns:
        Le JSON décodé.
    """
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    dest = CACHE_DIR / cache_name
    if dest.exists() and not force:
        return json.loads(dest.read_text(encoding="utf-8"))
    with urllib.request.urlopen(url, timeout=60) as r:
        contenu = r.read().decode("utf-8")
    dest.write_text(contenu, encoding="utf-8")
    return json.loads(contenu)


def _num(v: object) -> float | None:
    """Convertit une valeur DGFiP en float (None si absente)."""
    return float(v) if isinstance(v, (int, float)) else None


def lire_dgfip(force: bool) -> dict[str, dict]:
    """Lit les comptes DGFiP de Bruz, un exercice par clé.

    Returns:
        {année: {indicateur: valeur}} — montants en euros, ratios en €/hab.
    """
    where = urllib.parse.quote('dep="035" and icom="047"')
    annees: dict[str, dict] = {}
    for ds in DGFIP_DATASETS:
        url = f"{DGFIP_API}/comptes-individuels-des-communes-fichier-global-{ds}/exports/json?where={where}"
        lignes = _get_json(url, f"dgfip_{ds}.json", force)
        if not isinstance(lignes, list):
            raise RuntimeError(f"Réponse inattendue DGFiP {ds} : {str(lignes)[:200]}")
        for l in lignes:
            an = str(l.get("an"))[:4]
            e: dict = {"population": l.get("pop1")}
            for k, nom in CHAMPS_KEUR.items():
                v = _num(l.get(k))
                e[nom] = round(v * 1000) if v is not None else None
            e["bruz_hab"] = {nom: _num(l.get(k)) for k, nom in CHAMPS_BRUZ_HAB.items()}
            e["strate_hab"] = {nom: _num(l.get(k)) for k, nom in CHAMPS_STRATE_HAB.items()}
            e["strate"] = l.get("nomsst2") or l.get("nomsst1")
            e["taux_tfb"] = _num(l.get("tfb"))
            e["taux_th"] = _num(l.get("tth"))
            annees[an] = e
    if len(annees) < 15:
        raise RuntimeError(f"Série DGFiP suspecte : {len(annees)} exercices seulement")
    return dict(sorted(annees.items()))


AGREGATS_OFGL = {
    "Recettes de fonctionnement": "recettes_fonctionnement",
    "Dépenses de fonctionnement": "depenses_fonctionnement",
    "Epargne brute": "epargne_brute",
    "Frais de personnel": "personnel",
    "Impôts locaux": "impots_locaux",
    "Dépenses d'équipement": "depenses_equipement",
    "Encours de dette": "encours_dette",
}


def lire_ofgl_comptes(force: bool) -> dict[str, dict]:
    """Lit les agrégats OFGL du budget principal de Bruz (opérations réelles).

    Returns:
        {année: {indicateur: montant en euros}}.
    """
    w = urllib.parse.quote(f'com_code="{INSEE_BRUZ}" and type_de_budget="Budget principal"')
    lignes = _get_json(f"{OFGL_API}/ofgl-base-communes/exports/json?where={w}", "ofgl_comptes.json", force)
    annees: dict[str, dict] = {}
    for r in lignes:
        nom = AGREGATS_OFGL.get(r["agregat"])
        if nom:
            annees.setdefault(str(r["exer"])[:4], {})[nom] = round(r["montant"])
    for an, e in annees.items():
        ecart = e["recettes_fonctionnement"] - e["depenses_fonctionnement"] - e["epargne_brute"]
        if abs(ecart) > 1000:
            raise RuntimeError(f"OFGL {an} : recettes − dépenses ≠ épargne brute (écart {ecart} €)")
    return dict(sorted(annees.items()))


def lire_fiscalite_entreprises(force: bool) -> dict:
    """Lit la CFE (base fiscale OFGL) et la CVAE/IFER (dotations OFGL) de Bruz.

    Returns:
        Dictionnaire prêt à écrire dans bruz.json.
    """
    w = urllib.parse.quote(f'idcom="{INSEE_BRUZ}"')
    fisc = _get_json(f"{OFGL_API}/base-fiscale-simplifiee/exports/json?where={w}", "ofgl_fiscalite.json", force)
    w2 = urllib.parse.quote(f'code_insee="{INSEE_BRUZ}"')
    dot = _get_json(f"{OFGL_API}/dotations-communes/exports/json?where={w2}", "ofgl_dotations.json", force)

    cfe = {
        str(r["exer"])[:4]: round(r["produit"])
        for r in fisc
        if r["dispositif_fiscal"] == "CFE" and r["destinataire"] == "GFP / hors zone" and r.get("produit")
    }
    def serie(variable: str) -> dict[str, int]:
        return {
            str(r["exercice"])[:4]: round(r["valeur"])
            for r in dot
            if r["variable"] == variable and r.get("valeur") is not None
        }
    cvae = serie("CVAE perçue par l'EPCI sur la commune")
    ifer = serie("IFER perçues par l'EPCI sur la commune")
    ac = serie("Attribution de compensation de la commune")
    if not cfe or not cvae:
        raise RuntimeError("CFE ou CVAE introuvable dans les jeux OFGL")
    a_cfe, a_cvae = max(cfe), max(cvae)
    return {
        "source": "OFGL — base fiscale simplifiée (CFE) et dotations des communes (CVAE, IFER, attribution de compensation)",
        "source_url": OFGL_PAGE,
        "derniere_maj": date.today().isoformat(),
        "beneficiaire": "Rennes Métropole (fiscalité professionnelle unique)",
        "cfe_annee": int(a_cfe),
        "cfe_produit": cfe[a_cfe],
        "cvae_annee": int(a_cvae),
        "cvae_produit": cvae[a_cvae],
        "ifer_annee": int(max(ifer)) if ifer else None,
        "ifer_produit": ifer[max(ifer)] if ifer else None,
        "attribution_compensation": ac[max(ac)] if ac else None,
        "attribution_compensation_annee": int(max(ac)) if ac else None,
        "cfe_serie": dict(sorted(cfe.items())),
        "note": (
            "Membre de Rennes Métropole, Bruz ne perçoit pas les impôts économiques "
            "(CFE, CVAE, IFER) payés par les entreprises de son territoire : ils vont "
            "à la Métropole. La commune garde la taxe foncière de leurs locaux et reçoit "
            "en retour une dotation de solidarité communautaire. L'attribution de "
            "compensation est négative depuis le transfert de la voirie (2014) : c'est "
            "la commune qui la verse. Import : scripts/fetch_finances.py"
        ),
    }


def ecrire_bruz_json(series: dict[str, dict], ofgl: dict[str, dict], entreprises: dict) -> None:
    """Écrit les séries sous finances_communales dans bruz.json."""
    data = json.loads(BRUZ_JSON.read_text(encoding="utf-8"))
    fin = data.setdefault("finances_communales", {})
    fin["series_dgfip"] = {
        "source": "DGFiP — Comptes individuels des communes (budget principal)",
        "source_url": DGFIP_PAGE,
        "derniere_maj": date.today().isoformat(),
        "unite": "euros (montants) ; euros par habitant (bruz_hab, strate_hab)",
        "note": (
            "Comptes exécutés du budget principal, tels que la DGFiP les publie. "
            "« strate_hab » = moyenne par habitant des communes de même taille "
            "(Bruz change de strate en 2024 en passant 20 000 habitants). Les "
            "recettes et dépenses de fonctionnement incluent l'exceptionnel : "
            "indemnité de sortie de l'emprunt toxique en 2015 (9,7 M€), "
            "dissolution de la SPL NOA en 2023 (4,8 M€). Import : scripts/fetch_finances.py"
        ),
        "annees": series,
    }
    fin["series_ofgl"] = {
        "source": "OFGL — Comptes des communes, budget principal (opérations réelles)",
        "source_url": "https://data.ofgl.fr/explore/dataset/ofgl-base-communes/",
        "derniere_maj": date.today().isoformat(),
        "unite": "euros",
        "note": (
            "Agrégats OFGL en opérations réelles, hors cessions : recettes − dépenses "
            "de fonctionnement = épargne brute. 2023 inclut 4,8 M€ exceptionnels "
            "(dissolution de la SPL NOA). Import : scripts/fetch_finances.py"
        ),
        "annees": ofgl,
    }
    fin["fiscalite_entreprises"] = entreprises
    BRUZ_JSON.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    annees = list(series)
    print(f"✓ bruz.json : finances_communales.series_dgfip — {len(annees)} exercices ({annees[0]} → {annees[-1]})")
    print(f"✓ bruz.json : finances_communales.series_ofgl — {len(ofgl)} exercices ({min(ofgl)} → {max(ofgl)})")
    print(f"✓ bruz.json : finances_communales.fiscalite_entreprises — CFE {entreprises['cfe_annee']}, CVAE {entreprises['cvae_annee']}")


def main() -> int:
    """Point d'entrée : télécharge, contrôle et écrit."""
    force = "--force" in sys.argv
    series = lire_dgfip(force)
    ofgl = lire_ofgl_comptes(force)
    entreprises = lire_fiscalite_entreprises(force)
    ecrire_bruz_json(series, ofgl, entreprises)
    return 0


if __name__ == "__main__":
    sys.exit(main())
