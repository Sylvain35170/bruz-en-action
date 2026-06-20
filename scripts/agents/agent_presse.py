#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Agent Presse — Actualités locales sur Bruz.

Scrape les flux RSS et pages presse locale (Ouest-France, La Semaine de Bruz,
Le Journal des Associations de Bruz) sur les mots-clés Bruz → data/actus.json.

Ouest-France a un RSS par commune : on l'utilise en priorité (pas de scraping HTML).
"""

import sys
from datetime import datetime
from email.utils import parsedate_to_datetime
from pathlib import Path
from xml.etree import ElementTree

sys.path.insert(0, str(Path(__file__).parent.parent))
from utils import DATA_DIR, fetch, load_json, log, save_json, today, dedup

AGENT_NAME = "presse"

# Flux RSS publics — Google News RSS (fiable, pas d'auth requise)
import urllib.parse as _urlparse

def _gnews(query: str) -> str:
    q = _urlparse.quote(query)
    return f"https://news.google.com/rss/search?q={q}&hl=fr&gl=FR&ceid=FR:fr"


RSS_SOURCES = [
    # Ouest-France Bruz — via Google News (OF bloque le scraping direct)
    # Google News indexe leurs articles et fournit le lien d'origine.
    # actus.json constitue l'archive permanente car OF supprime les vieux liens.
    {
        "label": "Ouest-France — Bruz",
        "url": _gnews("site:ouest-france.fr Bruz"),
    },
    {
        "label": "Ouest-France — Bruz Conseil Municipal",
        "url": _gnews("site:ouest-france.fr Bruz conseil municipal"),
    },
    # Sources complémentaires
    {
        "label": "Google News — Bruz actualités",
        "url": _gnews("Bruz Ille-et-Vilaine actualités"),
    },
    {
        "label": "Google News — Bruz Houssin",
        "url": _gnews("Bruz Houssin municipalité 2026"),
    },
]

# Pages web à scraper (fallback uniquement si RSS vide)
WEB_SOURCES: list[dict] = []

MOTS_CLES = ["bruz", "houssin", "conseil municipal", "zac", "t4", "trambus"]

# Articles à exclure (résultats sportifs, offres d'emploi, faits divers hors sujet)
MOTS_EXCLUS = [
    "offre d'emploi", "recrutement", "cdi", "cdd", "h/f", "f/h",
    "1-0", "1-1", "2-0", "2-1", "3-0", "3-1", "3-2",  # scores sportifs
    "volley", "football", "basket", "rugby", "natation", "athlétisme",
    "us gosné", "fc bruz", "jeanne d'arc",
    "nécrologie", "avis de décès",
]


def parse_rss(content: bytes, label: str) -> list[dict]:
    items = []
    try:
        root = ElementTree.fromstring(content)
        ns = {"atom": "http://www.w3.org/2005/Atom"}
        # RSS 2.0
        for item in root.findall(".//item"):
            titre = item.findtext("title", "").strip()
            url = item.findtext("link", "").strip()
            raw_date = item.findtext("pubDate", "")
            try:
                date_pub = parsedate_to_datetime(raw_date).strftime("%Y-%m-%d")
            except Exception:
                date_pub = today()
            desc = item.findtext("description", "").strip()
            if not titre or not url:
                continue
            # Filtrer sur mots-clés Bruz + exclure bruit (sport, emploi, faits divers)
            texte = (titre + " " + desc).lower()
            if not any(k in texte for k in MOTS_CLES):
                continue
            if any(k in texte for k in MOTS_EXCLUS):
                continue
            items.append({
                "id": f"presse-{hash(url) & 0xFFFFFF:06x}",
                "titre": titre,
                "source_url": url,
                "source_label": label,
                "date": date_pub[:10],
                "detail": desc[:300],
                "type": "presse",
            })
    except Exception as e:
        log(f"RSS parse {label}: {e}", "WARN")
    return items


def run() -> bool:
    actus_data = load_json(DATA_DIR / "actus.json")
    existing = {a.get("source_url", "") for a in actus_data.get("actus", [])}
    nouvelles = []

    # RSS
    for src in RSS_SOURCES:
        log(f"RSS {src['label']}…")
        r = fetch(src["url"])
        if not r:
            continue
        items = parse_rss(r.content, src["label"])
        for item in items:
            if item["source_url"] not in existing:
                nouvelles.append(item)
                existing.add(item["source_url"])
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
                            "source_url": url,
                            "source_label": src["label"],
                            "date": today(),
                            "detail": "",
                            "type": "presse",
                        })
                        existing.add(url)
                        log(f"  🆕 {titre[:70]}", "NEW")

    if not nouvelles:
        log("Presse : aucune nouvelle publication.", "INFO")
        return False

    actus_data["actus"] = dedup(nouvelles + actus_data.get("actus", []), "source_url")
    actus_data.setdefault("meta", {})["last_updated"] = today()
    save_json(DATA_DIR / "actus.json", actus_data)
    log(f"Presse : {len(nouvelles)} nouvelle(s) actu(s) → actus.json", "OK")
    return True


if __name__ == "__main__":
    run()
