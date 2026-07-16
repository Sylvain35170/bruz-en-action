# -*- coding: utf-8 -*-
"""Import reproductible des séries longues INSEE dans data/bruz.json.

Source : « Historique des populations communales » (INSEE, recensements
1876-2023) — https://www.insee.fr/fr/statistiques/3698339

Le fichier xlsx est téléchargé dans scripts/cache/ (gitignoré) puis la ligne
de Bruz (CODGEO 35047) est extraite et écrite dans bruz.json sous
`series_longues.population`, avec source, URL et date de mise à jour.

Usage :
    python3 scripts/fetch_insee.py           # utilise le cache s'il existe
    python3 scripts/fetch_insee.py --force   # re-télécharge le fichier

Pattern : même esprit que validate_data.py — idempotent, aucune donnée en dur,
la page /statistiques ne fait que rendre ce que ce script écrit.
"""

from __future__ import annotations

import json
import sys
import urllib.request
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CACHE_DIR = Path(__file__).resolve().parent / "cache"
BRUZ_JSON = ROOT / "data" / "bruz.json"

CODGEO_BRUZ = "35047"
INSEE_PAGE = "https://www.insee.fr/fr/statistiques/3698339"
INSEE_XLSX = (
    "https://www.insee.fr/fr/statistiques/fichier/3698339/"
    "base-pop-historiques-1876-2023.xlsx"
)
SHEET = "pop_1876_2023"
HEADER_ROW_IDX = 5  # ligne des codes colonnes (CODGEO, REG, DEP, LIBGEO, PMUN…)


def telecharger_xlsx(force: bool = False) -> Path:
    """Télécharge le fichier INSEE dans le cache local (sauf s'il existe déjà).

    Returns:
        Chemin local du fichier xlsx.
    """
    CACHE_DIR.mkdir(exist_ok=True)
    dest = CACHE_DIR / INSEE_XLSX.rsplit("/", 1)[-1]
    if dest.exists() and not force:
        print(f"· cache utilisé : {dest.name} (--force pour re-télécharger)")
        return dest
    print(f"↓ téléchargement {INSEE_XLSX}")
    req = urllib.request.Request(INSEE_XLSX, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=120) as resp:
        contenu = resp.read()
    if contenu[:2] != b"PK":
        raise RuntimeError(
            "Le fichier téléchargé n'est pas un xlsx (page HTML ?) — "
            f"vérifier l'URL sur {INSEE_PAGE}"
        )
    dest.write_bytes(contenu)
    print(f"✓ {dest.name} ({len(contenu) // 1024} Ko)")
    return dest


def extraire_serie_population(xlsx: Path) -> dict[str, int]:
    """Extrait la série de population de Bruz depuis le xlsx INSEE.

    Les colonnes PMUN<année> / PSDC<année> / PTOT<année> correspondent à des
    concepts de population différents selon les époques (municipale, sans
    doubles comptes, totale) — on garde l'année et la valeur, le concept est
    documenté dans la note écrite dans bruz.json.

    Returns:
        Dictionnaire {année: population}, trié par année croissante.
    """
    import openpyxl  # import local : seul ce script en dépend

    wb = openpyxl.load_workbook(xlsx, read_only=True)
    ws = wb[SHEET]
    header: tuple | None = None
    ligne_bruz: tuple | None = None
    for i, row in enumerate(ws.iter_rows(values_only=True)):
        if i == HEADER_ROW_IDX:
            header = row
        elif header is not None and str(row[0]) == CODGEO_BRUZ:
            ligne_bruz = row
            break
    wb.close()
    if header is None or ligne_bruz is None:
        raise RuntimeError(f"CODGEO {CODGEO_BRUZ} introuvable dans {xlsx.name}")

    serie: dict[str, int] = {}
    for code, valeur in zip(header, ligne_bruz):
        code = str(code or "")
        if code[:4] in ("PMUN", "PSDC", "PTOT") and valeur is not None:
            annee = code[4:]
            serie[annee] = int(valeur)
    if len(serie) < 30:
        raise RuntimeError(f"Série suspecte : seulement {len(serie)} points extraits")
    return dict(sorted(serie.items()))


def ecrire_bruz_json(serie: dict[str, int]) -> None:
    """Écrit la série sous series_longues.population dans bruz.json."""
    data = json.loads(BRUZ_JSON.read_text(encoding="utf-8"))
    data.setdefault("series_longues", {})["population"] = {
        "source": "INSEE, Historique des populations communales (recensements 1876-2023)",
        "source_url": INSEE_PAGE,
        "derniere_maj": date.today().isoformat(),
        "unite": "habitants",
        "note": (
            "Concepts selon les époques : population totale (1876-1954), "
            "sans doubles comptes (1962-1999), municipale (2006-2023) — "
            "colonnes PTOT/PSDC/PMUN du fichier INSEE. Import : scripts/fetch_insee.py"
        ),
        "valeurs": serie,
    }
    BRUZ_JSON.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    annees = list(serie)
    print(
        f"✓ bruz.json : series_longues.population — {len(serie)} points "
        f"({annees[0]} → {annees[-1]}, dernier : {serie[annees[-1]]} hab.)"
    )


def main() -> int:
    """Point d'entrée : télécharge, extrait, écrit."""
    force = "--force" in sys.argv
    xlsx = telecharger_xlsx(force=force)
    serie = extraire_serie_population(xlsx)
    ecrire_bruz_json(serie)
    return 0


if __name__ == "__main__":
    sys.exit(main())
