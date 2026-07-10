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
from utils import (
    DATA_DIR, fetch, load_json, log, save_json, stable_id, today, dedup,
    known_urls, append_to_queue, check_content_changed,
)

try:
    from bs4 import BeautifulSoup
except ImportError:
    log("pip install beautifulsoup4", "ERR")
    sys.exit(1)

AGENT_NAME = "mairie"

SOURCES = [
    {
        "id": "actualites",
        "url": "https://www.ville-bruz.fr/ma-ville-de-bruz/actualites/",
        "label": "Mairie de Bruz — Actualités",
        "selectors": ["article", ".post", ".actualite", ".news-item", "h2 a", "h3 a"],
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

            # Texte complet du bloc — utilisé pour la détection de mise à jour
            # (une page réutilisée en place change de contenu sans changer d'URL)
            teaser_text = el.get_text(strip=True)

            # URL
            lien_el = el.find("a", href=True)
            url = lien_el["href"] if lien_el else source["url"]
            if url.startswith("/"):
                url = "https://www.ville-bruz.fr" + url

            # Date publiée (si disponible)
            date_el = el.find(["time", ".date", ".entry-date"])
            date_pub = date_el.get("datetime", date_el.get_text(strip=True)) if date_el else today()

            items.append({
                "id": stable_id("mairie", url),
                "titre": titre,
                "source_url": url,
                "source_label": source["label"],
                "date": date_pub[:10] if date_pub else today(),
                "detail": "",
                "type": "mairie",
                "_teaser_text": teaser_text,
            })

    return items


def run() -> bool:
    existing = known_urls()
    nouvelles = []

    for source in SOURCES:
        log(f"Scan {source['label']}…")
        items = scrape_source(source)
        for item in items:
            teaser_text = item.pop("_teaser_text", "")
            changed = check_content_changed(item["source_url"], teaser_text or item["titre"])
            if item["source_url"] not in existing:
                nouvelles.append(item)
                existing.add(item["source_url"])
                log(f"  🆕 {item['titre'][:70]}", "NEW")
            elif changed:
                # URL déjà connue mais contenu modifié en place (ex. page de vigilance
                # jaune → rouge) — requeue avec un id distinct pour ne pas entrer en
                # collision avec la décision de revue déjà prise sur l'ancien contenu.
                item["id"] = stable_id("mairie", item["source_url"] + "#" + today())
                item["titre"] = f"{item['titre']} (mise à jour)"
                nouvelles.append(item)
                log(f"  🔁 mise à jour détectée : {item['titre'][:70]}", "NEW")

    if not nouvelles:
        log("Mairie : aucune nouvelle publication.", "INFO")
        return False

    n = append_to_queue(nouvelles)
    log(f"Mairie : {n} nouvelle(s) actu(s) → queue", "OK")
    return n > 0


if __name__ == "__main__":
    run()
