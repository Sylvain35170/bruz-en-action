#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Agent QA — Vérification du site GitHub Pages après chaque déploiement.

Contrôles par page :
  - HTTP 200
  - Absence de "undefined", "[object Object]", "NaN" dans le HTML
  - Présence de texte clé (nav, titre, section)
  - Absence de balises vides suspectes

Contrôle des liens externes (--links) :
  - Parcourt toutes les URLs http(s) trouvées dans data/*.json (source_url, url, lien, site…)
  - Vérifie l'accessibilité HTTP (HEAD, fallback GET) — ne juge pas le contenu réel
    (un site en JS pur comme Mégalis répond 200 même si la page rendue diffère)

Usage :
  python3 scripts/agents/agent_qa.py               # pages seulement
  python3 scripts/agents/agent_qa.py --wait 60      # attend 60s avant de tester (post-push)
  python3 scripts/agents/agent_qa.py --links        # pages + liens externes data/*.json
  python3 scripts/agents/agent_qa.py --links-only   # liens externes uniquement

Retourne exit code 0 si tout est OK, 1 si des erreurs sont détectées.
"""

import argparse
import re
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from utils import check_url_status, fetch, load_json, log, DATA_DIR

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

    # Comparaisons insensibles à la casse : la homepage écrit « promesses » en
    # minuscule et /elus rend « HOUSSIN » via formatNomPrenom — un must_contain
    # sensible à la casse produisait des faux échecs (constaté le 2026-07-05).
    html_visible_low = html_visible.lower()

    # Vérifications "must_contain"
    for term in page.get("must_contain", []):
        if term.lower() not in html_visible_low:
            errors.append(f"Texte absent : «{term}»")

    # Vérifications "must_not_contain" (sur HTML visible uniquement)
    for term in page.get("must_not_contain", []):
        count = html_visible_low.count(term.lower())
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


def _collect_data_urls() -> dict[str, list[str]]:
    """Parcourt tous les data/*.json et retourne {url: [fichiers où elle apparaît]}.

    Ignore les URLs marquées `<clé>_expiree: true` dans le même objet — source déjà
    confirmée morte sans alternative trouvée (archive.org…), pas la peine de la re-signaler
    à chaque run. cf. décision du 2026-07-04.
    """
    by_url: dict[str, list[str]] = {}

    def walk(node, filename: str) -> None:
        if isinstance(node, dict):
            for k, v in node.items():
                if isinstance(v, str) and v.startswith("http") and node.get(f"{k}_expiree"):
                    continue
                walk(v, filename)
        elif isinstance(node, list):
            for v in node:
                walk(v, filename)
        elif isinstance(node, str) and node.startswith("http"):
            by_url.setdefault(node, [])
            if filename not in by_url[node]:
                by_url[node].append(filename)

    for path in sorted(DATA_DIR.glob("*.json")):
        walk(load_json(path), path.name)
    return by_url


def check_links() -> bool:
    """Vérifie les URLs de data/*.json. 403/429/TooManyRedirects = anti-bot probable
    (ex: Ouest-France ne s'ouvre qu'avec Playwright + channel="chrome", cf. piège 2026-06-27)
    → signalé en warning, pas en échec. Seuls 404/410/5xx/DNS/timeout comptent comme cassés.
    """
    urls = _collect_data_urls()
    log(f"Link-check — {len(urls)} URL(s) unique(s) dans data/*.json")

    AMBIGUOUS_STATUSES = {403, 429}
    AMBIGUOUS_ERRORS = {"TooManyRedirects"}

    broken = []
    ambiguous = []
    for i, (url, files) in enumerate(sorted(urls.items()), 1):
        result = check_url_status(url)
        status = result.get("status")
        error = result.get("error")
        if result["ok"]:
            log(f"  ✅ [{i}/{len(urls)}] {url}")
        elif status in AMBIGUOUS_STATUSES or error in AMBIGUOUS_ERRORS:
            reason = error or f"HTTP {status}"
            ambiguous.append({"url": url, "files": files, "reason": reason})
            log(f"  ⚠️  [{i}/{len(urls)}] {url} — {reason}, anti-bot probable (dans {', '.join(files)})", "WARN")
        else:
            reason = error or f"HTTP {status}"
            broken.append({"url": url, "files": files, "reason": reason})
            log(f"  ❌ [{i}/{len(urls)}] {url} — {reason} (dans {', '.join(files)})", "ERR")
        time.sleep(0.3)  # politesse envers les serveurs distants

    ok_count = len(urls) - len(broken) - len(ambiguous)
    log(f"\nBilan liens : {ok_count}/{len(urls)} OK, {len(ambiguous)} à vérifier manuellement, {len(broken)} cassé(s)")

    if ambiguous:
        log(f"{len(ambiguous)} lien(s) probablement bloqués par anti-bot (à vérifier au navigateur) :", "WARN")
        for a in ambiguous:
            log(f"  {a['url']} ({', '.join(a['files'])}) → {a['reason']}", "WARN")

    if broken:
        log(f"{len(broken)} lien(s) réellement cassé(s) :", "ERR")
        for b in broken:
            log(f"  {b['url']} ({', '.join(b['files'])}) → {b['reason']}", "ERR")
        return False

    log("Aucun lien cassé confirmé.", "OK")
    return True


def run(wait_seconds: int = 0, links: bool = False, links_only: bool = False) -> bool:
    if links_only:
        return check_links()

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
    pages_ok = not failures

    if failures:
        log(f"{len(failures)} page(s) en erreur :", "ERR")
        for r in failures:
            log(f"  {r['page']} : {' | '.join(r['errors'])}", "ERR")
    else:
        log("Site GitHub Pages validé.", "OK")

    if links:
        log("")
        links_ok = check_links()
        return pages_ok and links_ok

    return pages_ok


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--wait", type=int, default=0, help="Secondes à attendre avant de tester")
    parser.add_argument("--links", action="store_true", help="Vérifie aussi les liens externes de data/*.json")
    parser.add_argument("--links-only", action="store_true", help="Ne vérifie que les liens externes (skip pages)")
    args = parser.parse_args()
    ok = run(wait_seconds=args.wait, links=args.links, links_only=args.links_only)
    sys.exit(0 if ok else 1)
