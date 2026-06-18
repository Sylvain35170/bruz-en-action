#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Agent Mairie — Scrape ville-bruz.fr.

Détecte les nouvelles actualités, CR de conseil municipal et arrêtés
publiés sur le site officiel de la mairie → data/actus.json.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from utils import DATA_DIR, fetch, load_json, log, save_json, today, dedup

try:
    from bs4 import BeautifulSoup
except ImportError:
    log("pip install beautifulsoup4", "ERR")
    sys.exit(1)

AGENT_NAME = "mairie"

SOURCES = [
    {
        "id": "actualites",
        "url": "https://www.ville-bruz.fr/actualites/",
        "label": "Mairie de Bruz — Actualités",
        "selectors": ["article", ".post", ".actualite", ".news-item"],
    },
    {
        "id": "conseil",
        "url": "https://www.ville-bruz.fr/ma-ville-de-bruz/conseil-municipal/conseil-municipal/",
        "label": "Mairie de Bruz — Conseil municipal",
        "selectors": ["article", ".attachment", "li > a[href*='pdf']", ".entry-content li"],
    },
]


def scrape_source(source: dict) -> list[dict]:
    r = fetch(source["url"])
    if not r:
        return []
    soup = BeautifulSoup(r.text, "html.parser")
    items = []

    for selector in source["selectors"]:
        elements = soup.select(selector)
        for el in elements:
            # Titre
            titre_el = el.find(["h2", "h3", "h4", "a"])
            titre = titre_el.get_text(strip=True) if titre_el else ""
            if not titre or len(titre) < 5:
                continue

            # URL
            lien_el = el.find("a", href=True)
            url = lien_el["href"] if lien_el else source["url"]
            if url.startswith("/"):
                url = "https://www.ville-bruz.fr" + url

            # Date publiée (si disponible)
            date_el = el.find(["time", ".date", ".entry-date"])
            date_pub = date_el.get("datetime", date_el.get_text(strip=True)) if date_el else today()

            items.append({
                "id": f"mairie-{hash(url) & 0xFFFFFF:06x}",
                "titre": titre,
                "url": url,
                "source": source["label"],
                "date": today(),
                "date_publication": date_pub[:10] if date_pub else today(),
                "contenu": "",
            })

    return items


def run() -> bool:
    actus_data = load_json(DATA_DIR / "actus.json")
    existing = {a["url"] for a in actus_data.get("actus", [])}
    nouvelles = []

    for source in SOURCES:
        log(f"Scan {source['label']}…")
        items = scrape_source(source)
        for item in items:
            if item["url"] not in existing:
                nouvelles.append(item)
                existing.add(item["url"])
                log(f"  🆕 {item['titre'][:70]}", "NEW")

    if not nouvelles:
        log("Mairie : aucune nouvelle publication.", "INFO")
        return False

    actus_data["actus"] = dedup(nouvelles + actus_data.get("actus", []), "url")
    actus_data.setdefault("meta", {})["last_updated"] = today()
    save_json(DATA_DIR / "actus.json", actus_data)
    log(f"Mairie : {len(nouvelles)} nouvelle(s) actu(s) → actus.json", "OK")
    return True


if __name__ == "__main__":
    run()
