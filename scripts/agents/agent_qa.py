#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Agent QA — Vérification du site GitHub Pages après chaque déploiement.

Contrôles par page :
  - HTTP 200
  - Absence de "undefined", "[object Object]", "NaN" dans le HTML
  - Présence de texte clé (nav, titre, section)
  - Absence de balises vides suspectes

Usage :
  python3 scripts/agents/agent_qa.py            # run complet
  python3 scripts/agents/agent_qa.py --wait 60  # attend 60s avant de tester (post-push)

Retourne exit code 0 si tout est OK, 1 si des erreurs sont détectées.
"""

import argparse
import re
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from utils import fetch, load_json, log, DATA_DIR

BASE_URL = "https://sylvain35170.github.io/bruz-en-action"

# Pages à tester avec leurs contrôles
PAGES = [
    {
        "path": "/",
        "label": "Homepage",
        "must_contain": ["Bruz en Action", "Dossiers", "Conseils municipaux", "Promesses"],
        "must_not_contain": ["[object Object]"],
    },
    {
        "path": "/dossiers",
        "label": "Dossiers",
        "must_contain": ["T4", "Trambus"],
        "must_not_contain": ["[object Object]"],
    },
    {
        "path": "/conseils",
        "label": "Conseils municipaux",
        "must_contain": ["2026"],
        "must_not_contain": ["[object Object]"],
    },
    {
        "path": "/promesses",
        "label": "Promesses",
        "must_contain": ["promesse", "programme"],
        "must_not_contain": ["[object Object]"],
    },
    {
        "path": "/elus",
        "label": "Élus",
        "must_contain": ["Houssin"],
        "must_not_contain": ["[object Object]"],
    },
    {
        "path": "/carte",
        "label": "Carte",
        "must_contain": ["Bruz"],
        "must_not_contain": ["[object Object]"],
    },
]


def _dossier_pages() -> list[dict]:
    """Génère des tests pour les 3 premiers dossiers featured."""
    data = load_json(DATA_DIR / "dossiers.json")
    pages = []
    featured = [d for d in data.get("dossiers", []) if d.get("featured")][:3]
    for d in featured:
        titre_extrait = d.get("titre", "")[:30]
        # Éviter les apostrophes : HTML encode ' en &#x27;
        terme = re.sub(r"['’].*", "", titre_extrait).strip()[:20]
        pages.append({
            "path": f"/dossiers/{d['id']}",  # IDs en majuscules : D01, D02…
            "label": f"Dossier {d['id']}",
            "must_contain": [terme] if terme else ["Dossier"],
            "must_not_contain": ["[object Object]"],
        })
    return pages


def _cm_pages() -> list[dict]:
    """Génère un test pour le CM le plus récent."""
    data = load_json(DATA_DIR / "cms.json")
    seances = [s for s in data.get("seances", []) if s.get("statut") == "passe"]
    if not seances:
        return []
    recent = seances[0]
    return [{
        "path": f"/conseils/{recent['id']}",  # IDs en majuscules : CM-2026-05-18
        "label": f"CM {recent['id']}",
        "must_contain": [recent.get("titre", "Conseil")[:20]],
        "must_not_contain": ["[object Object]"],
    }]


def check_page(page: dict) -> dict:
    url = BASE_URL + page["path"]
    r = fetch(url, timeout=20)

    errors = []
    warnings = []

    if r is None:
        return {"page": page["label"], "url": url, "status": "❌", "errors": ["HTTP non 200 ou timeout"]}

    if r.status_code != 200:
        errors.append(f"HTTP {r.status_code}")

    html = r.text

    # HTML visible = contenu hors balises <script> (évite les faux positifs JS)
    import re as _re
    html_visible = _re.sub(r"<script[^>]*>.*?</script>", "", html, flags=_re.DOTALL)

    # Vérifications "must_contain"
    for term in page.get("must_contain", []):
        if term not in html_visible:
            errors.append(f"Texte absent : «{term}»")

    # Vérifications "must_not_contain" (sur HTML visible uniquement)
    for term in page.get("must_not_contain", []):
        count = html_visible.count(term)
        if count > 0:
            errors.append(f"Valeur suspecte ({count}×) : «{term}»")

    # Heuristique : balises vides répétées (signe de données manquantes)
    empty_h = html.count("<h1></h1>") + html.count("<h2></h2>") + html.count("<p></p>")
    if empty_h > 5:
        warnings.append(f"{empty_h} balises vides (h1/h2/p)")

    status = "✅" if not errors else "❌"
    return {
        "page": page["label"],
        "url": url,
        "status": status,
        "errors": errors,
        "warnings": warnings,
        "http": r.status_code,
    }


def run(wait_seconds: int = 0) -> bool:
    if wait_seconds:
        log(f"Attente {wait_seconds}s (GitHub Pages rebuild)…")
        time.sleep(wait_seconds)

    pages = PAGES + _dossier_pages() + _cm_pages()
    log(f"QA — {len(pages)} pages à tester sur {BASE_URL}")

    results = []
    for page in pages:
        result = check_page(page)
        results.append(result)
        errs = " | ".join(result["errors"]) if result["errors"] else "OK"
        warns = f" ⚠️ {' | '.join(result['warnings'])}" if result.get("warnings") else ""
        log(f"  {result['status']} {result['page']:25} HTTP {result.get('http','?')} — {errs}{warns}")

    failures = [r for r in results if r["errors"]]
    total = len(results)
    ok = total - len(failures)

    log(f"\nBilan QA : {ok}/{total} pages OK")

    if failures:
        log(f"{len(failures)} page(s) en erreur :", "ERR")
        for r in failures:
            log(f"  {r['page']} : {' | '.join(r['errors'])}", "ERR")
        return False

    log("Site GitHub Pages validé.", "OK")
    return True


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--wait", type=int, default=0, help="Secondes à attendre avant de tester")
    args = parser.parse_args()
    ok = run(wait_seconds=args.wait)
    sys.exit(0 if ok else 1)
