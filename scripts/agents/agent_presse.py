#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Agent Presse — Actualités locales sur Bruz.

Scrape les flux RSS et pages presse locale (Ouest-France, La Semaine de Bruz,
Le Journal des Associations de Bruz) sur les mots-clés Bruz → data/actus.json.

Ouest-France a un RSS par commune : on l'utilise en priorité (pas de scraping HTML).
"""

import sys
from datetime import datetime, date, timedelta
from email.utils import parsedate_to_datetime
from pathlib import Path
from xml.etree import ElementTree

sys.path.insert(0, str(Path(__file__).parent.parent))
from utils import DATA_DIR, fetch, load_json, log, save_json, today, dedup, known_urls, append_to_queue

AGENT_NAME = "presse"

# Flux RSS publics — Google News RSS (fiable, pas d'auth requise)
import urllib.parse as _urlparse

def _gnews(query: str) -> str:
    q = _urlparse.quote(query)
    return f"https://news.google.com/rss/search?q={q}&hl=fr&gl=FR&ceid=FR:fr"


# Requêtes ciblées par thématique communale / métropolitaine
# Chaque requête force "Bruz" comme sujet principal
RSS_SOURCES = [
    {"label": "CM Bruz",          "url": _gnews('Bruz "conseil municipal"')},
    {"label": "Transport Bruz",   "url": _gnews("Bruz trambus OR T4 OR transport OR gare")},
    {"label": "Urbanisme Bruz",   "url": _gnews("Bruz logement OR urbanisme OR ZAC OR construction OR aménagement")},
    {"label": "Budget Bruz",      "url": _gnews('Bruz budget OR fiscalité OR "taxe foncière" OR finances')},
    {"label": "Équipements Bruz", "url": _gnews("Bruz piscine OR école OR gymnase OR équipement OR salle")},
    {"label": "Sécurité Bruz",    "url": _gnews("Bruz police OR sécurité OR vidéoprotection")},
    {"label": "Environnement Bruz","url": _gnews("Bruz environnement OR canicule OR espaces verts OR biodiversité")},
    {"label": "Bruz Houssin",     "url": _gnews("Houssin Bruz")},
    {"label": "Métropole Bruz",   "url": _gnews('"Rennes Métropole" Bruz')},
]

# Pages web à scraper (fallback uniquement si RSS vide)
WEB_SOURCES: list[dict] = []

# Le titre DOIT contenir au moins un de ces termes (Bruz est le sujet)
MOTS_SUJET = ["bruz", "houssin", "conterie", "ker lann", "vert-buisson", "cosec"]

# Thématiques acceptées même sans "bruz" dans le titre (métropole / intercommunalité)
MOTS_THEME = ["trambus", "t4 ", " t4,", "zac multisites", "rennes métropole"]

FENETRE_JOURS = 7

HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; BruzEnAction/1.0)"}


def _resolve_url(url: str) -> str:
    """Suit le redirect Google News pour stocker l'URL finale de l'article."""
    if "news.google.com" not in url:
        return url
    try:
        import requests
        r = requests.head(url, allow_redirects=True, timeout=6, headers=HEADERS)
        final = r.url
        # Garder le redirect Google News si la résolution échoue (URL inchangée)
        return final if final != url else url
    except Exception:
        return url

# Articles à exclure systématiquement
MOTS_EXCLUS = [
    # Emploi
    "offre d'emploi", "recrutement", "cdi", "cdd", "h/f", "f/h",
    # Scores sportifs
    "1-0", "1-1", "2-0", "2-1", "3-0", "3-1", "3-2", "4-0", "4-1",
    # Clubs sportifs locaux hors mandat municipal
    "us gosné", "fc bruz", "jeanne d'arc", "stade rennais", "en avant",
    # Faits divers sans rapport avec la commune
    "nécrologie", "avis de décès", "accident mortel", "incendie criminel",
    # Communes hors périmètre (articles parasites Google News)
    "saint-malo", "saint-grégoire", "montauban-de-bretagne", "tresboeuf",
    "dinard", "cancale", "vitré", "redon", "fougères", "cesson",
    # Divers hors scope
    "ina.fr", "météo", "horoscope", "station-service", "essence", "gasoil",
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
            # Filtre 1 : fenêtre glissante 7 jours
            date_min = date.today() - timedelta(days=FENETRE_JOURS)
            try:
                article_date = date.fromisoformat(date_pub[:10])
                if article_date < date_min:
                    continue
            except ValueError:
                pass  # date inconnue → on garde

            # Filtre 2 : Bruz doit être le sujet (dans le titre) ou thématique intercommunale
            titre_lower = titre.lower()
            texte = (titre + " " + desc).lower()
            est_sujet = any(k in titre_lower for k in MOTS_SUJET)
            est_theme = any(k in texte for k in MOTS_THEME)
            if not est_sujet and not est_theme:
                continue
            # Filtre 3 : exclure le bruit (sport, emploi, communes hors périmètre)
            if any(k in texte for k in MOTS_EXCLUS):
                continue
            final_url = _resolve_url(url)
            items.append({
                "id": f"presse-{hash(url) & 0xFFFFFF:06x}",
                "titre": titre,
                "source_url": final_url,
                "source_label": label,
                "date": date_pub[:10],
                "detail": desc[:300],
                "type": "presse",
            })
    except Exception as e:
        log(f"RSS parse {label}: {e}", "WARN")
    return items


def run() -> bool:
    existing = known_urls()
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

    n = append_to_queue(nouvelles)
    log(f"Presse : {n} nouvelle(s) actu(s) → queue", "OK")
    return n > 0


if __name__ == "__main__":
    run()
