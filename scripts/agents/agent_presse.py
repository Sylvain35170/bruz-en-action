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
from utils import DATA_DIR, fetch, load_json, log, save_json, stable_id, today, dedup, known_ids, known_urls, append_to_queue

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


CONSENT_HOSTS = ("consent.google.com", "consent.youtube.com")


def _sans_mur_consentement(final: str, origine: str) -> str:
    """Renvoie une URL exploitable, jamais un mur de consentement Google.

    Depuis la France, résoudre un lien Google News aboutit à
    `consent.google.com/ml?continue=<lien d'origine>&…&escs=<jeton>`. Ce jeton est
    régénéré à chaque requête : stocker cette URL rend l'item indédupliquable (il
    repart en queue à chaque run) et publie un lien qui envoie le lecteur sur un
    écran de consentement au lieu de l'article. Le paramètre `continue` ne rend
    que le lien d'origine — il n'y a donc rien à gagner à suivre le redirect.
    """
    if not any(h in final for h in CONSENT_HOSTS):
        return final
    suite = _urlparse.parse_qs(_urlparse.urlparse(final).query).get("continue", [""])[0]
    return suite or origine


# Cookie de consentement Google. Vérifié le 2026-09-08 : `CONSENT=YES+…` ne
# franchit PLUS le mur (on retombe sur consent.google.com), `SOCS` oui. Sans lui,
# la page RSS ne renvoie pas les jetons data-n-a-sg / data-n-a-ts et la
# résolution batchexecute échoue silencieusement.
SOCS_COOKIE = "CAISHAgBEhJnd3NfMjAyNDAxMDEtMF9SQzIaAmZyIAEaBgiA_LyuBg"
UA_NAVIGATEUR = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                 "AppleWebKit/537.36 (KHTML, like Gecko) "
                 "Chrome/120.0.0.0 Safari/537.36")
BATCH_URL = "https://news.google.com/_/DotsSplashUi/data/batchexecute"


def _resolve_gnews(url: str) -> str | None:
    """Résout un lien Google News RSS via batchexecute, ou None si l'API refuse.

    Le format `rss/articles/CBMi…` est un protobuf opaque, pas du base64 : seule
    Google peut le déplier. On lit la signature et le timestamp dans le HTML de la
    page, puis on les rejoue sur l'endpoint batchexecute.
    """
    import json as _json
    import re as _re

    import requests

    session = requests.Session()
    session.headers["User-Agent"] = UA_NAVIGATEUR
    session.cookies.set("SOCS", SOCS_COOKIE, domain=".google.com")

    page = session.get(url, timeout=25)
    page.raise_for_status()
    sig = _re.search(r'data-n-a-sg="([^"]+)"', page.text)
    horodatage = _re.search(r'data-n-a-ts="([^"]+)"', page.text)
    if not (sig and horodatage):
        return None

    jeton = url.rstrip("/").split("/")[-1].split("?")[0]
    requete = _json.dumps([
        "garturlreq",
        [["X", "X", ["X", "X"], None, None, 1, 1, "FR:fr", None, 1,
          None, None, None, None, None, 0, 1],
         "X", "X", 1, [1, 1, 1], 1, 1, None, 0, 0, None, 0],
        jeton, int(horodatage.group(1)), sig.group(1),
    ])
    reponse = session.post(
        BATCH_URL,
        data={"f.req": _json.dumps([[["Fbv4je", requete, None, "generic"]]])},
        timeout=25,
        headers={"Content-Type":
                 "application/x-www-form-urlencoded;charset=UTF-8"},
    )
    reponse.raise_for_status()
    bloc = reponse.text.split("garturlres", 1)
    if len(bloc) < 2:
        return None
    lien = _re.search(r'"(https?://[^"\\]+)"', bloc[1])
    return lien.group(1) if lien else None


def _resolve_url(url: str) -> str:
    """Suit le redirect Google News pour stocker l'URL finale de l'article.

    Deux passes : le redirect simple d'abord (peu coûteux), puis la résolution
    batchexecute si le lien reste un lien Google News. Un lien non résolu qui part
    en base coûte la source de l'article : cf. `presse-f2c23dbc`, jamais retrouvé.
    """
    if "news.google.com" not in url:
        return url
    try:
        import requests
        r = requests.head(url, allow_redirects=True, timeout=6, headers=HEADERS)
        final = _sans_mur_consentement(r.url, url)
        if final != url and "news.google.com" not in final:
            return final
    except Exception:
        pass
    try:
        reel = _resolve_gnews(url)
        if reel:
            return reel
    except Exception as exc:
        log(f"résolution Google News échouée ({exc}) — lien brut conservé", "warn")
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
                "id": stable_id("presse", url),
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
    existing_ids = known_ids()
    nouvelles = []

    # RSS
    for src in RSS_SOURCES:
        log(f"RSS {src['label']}…")
        r = fetch(src["url"])
        if not r:
            continue
        items = parse_rss(r.content, src["label"])
        for item in items:
            if item["id"] in existing_ids:
                continue
            if item["source_url"] not in existing:
                nouvelles.append(item)
                existing.add(item["source_url"])
                existing_ids.add(item["id"])
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
                            "id": stable_id("presse", url),
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
