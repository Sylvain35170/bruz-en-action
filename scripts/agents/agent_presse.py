#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Agent Presse — Actualités locales sur Bruz.

Scrape les flux RSS et pages presse locale (Ouest-France, La Semaine de Bruz,
Le Journal des Associations de Bruz) sur les mots-clés Bruz → data/actus.json.

Ouest-France a un RSS par commune : on l'utilise en priorité (pas de scraping HTML).
"""

import sys
from pathlib import Path
from xml.etree import ElementTree

sys.path.insert(0, str(Path(__file__).parent.parent))
from utils import DATA_DIR, fetch, load_json, log, save_json, today, dedup

AGENT_NAME = "presse"

# Flux RSS publics — pas de scraping, pas de friction
RSS_SOURCES = [
    {
        "label": "Ouest-France — Bruz",
        "url": "https://www.ouest-france.fr/rss/commune/bruz-35170",
    },
    {
        "label": "Ouest-France — Bruz (recherche)",
        "url": "https://www.ouest-france.fr/rss/recherche/bruz",
    },
]

# Pages web à scraper si RSS insuffisant
WEB_SOURCES = [
    {
        "label": "La Semaine de Bruz",
        "url": "https://www.lasemaine.fr/bruz/",
        "selectors": ["article h2 a", ".article-title a", "h3 a"],
    },
]

MOTS_CLES = ["bruz", "houssin", "conseil municipal", "zac", "t4", "trambus"]


def parse_rss(content: bytes, label: str) -> list[dict]:
    items = []
    try:
        root = ElementTree.fromstring(content)
        ns = {"atom": "http://www.w3.org/2005/Atom"}
        # RSS 2.0
        for item in root.findall(".//item"):
            titre = item.findtext("title", "").strip()
            url = item.findtext("link", "").strip()
            date_pub = item.findtext("pubDate", today())[:10]
            desc = item.findtext("description", "").strip()
            if not titre or not url:
                continue
            # Filtrer sur mots-clés Bruz
            texte = (titre + " " + desc).lower()
            if not any(k in texte for k in MOTS_CLES):
                continue
            items.append({
                "id": f"presse-{hash(url) & 0xFFFFFF:06x}",
                "titre": titre,
                "url": url,
                "source": label,
                "date": date_pub[:10],
                "contenu": desc[:300],
            })
    except Exception as e:
        log(f"RSS parse {label}: {e}", "WARN")
    return items


def run() -> bool:
    actus_data = load_json(DATA_DIR / "actus.json")
    existing = {a["url"] for a in actus_data.get("actus", [])}
    nouvelles = []

    # RSS
    for src in RSS_SOURCES:
        log(f"RSS {src['label']}…")
        r = fetch(src["url"])
        if not r:
            continue
        items = parse_rss(r.content, src["label"])
        for item in items:
            if item["url"] not in existing:
                nouvelles.append(item)
                existing.add(item["url"])
                log(f"  🆕 {item['titre'][:70]}", "NEW")

    # Web scraping (fallback)
    if not nouvelles:
        try:
            from bs4 import BeautifulSoup
        except ImportError:
            log("beautifulsoup4 manquant pour scraping web presse", "WARN")
        else:
            for src in WEB_SOURCES:
                log(f"Web {src['label']}…")
                r = fetch(src["url"])
                if not r:
                    continue
                soup = BeautifulSoup(r.text, "html.parser")
                for sel in src["selectors"]:
                    for a in soup.select(sel):
                        titre = a.get_text(strip=True)
                        url = a.get("href", "")
                        if url.startswith("/"):
                            url = src["url"].rstrip("/") + url
                        if not titre or url in existing:
                            continue
                        if not any(k in titre.lower() for k in MOTS_CLES):
                            continue
                        nouvelles.append({
                            "id": f"presse-{hash(url) & 0xFFFFFF:06x}",
                            "titre": titre,
                            "url": url,
                            "source": src["label"],
                            "date": today(),
                            "contenu": "",
                        })
                        existing.add(url)
                        log(f"  🆕 {titre[:70]}", "NEW")

    if not nouvelles:
        log("Presse : aucune nouvelle publication.", "INFO")
        return False

    actus_data["actus"] = dedup(nouvelles + actus_data.get("actus", []), "url")
    actus_data.setdefault("meta", {})["last_updated"] = today()
    save_json(DATA_DIR / "actus.json", actus_data)
    log(f"Presse : {len(nouvelles)} nouvelle(s) actu(s) → actus.json", "OK")
    return True


if __name__ == "__main__":
    run()
