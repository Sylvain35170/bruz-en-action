#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Agent Ouest-France — Actualités locales Bruz sur ouest-france.fr.

OF bloque les scrapers HTTP (bot protection). Cet agent utilise Playwright
pour piloter un vrai Chrome avec le profil utilisateur (cookies inclus).

Prérequis :
    pip install playwright && playwright install chromium

Si Playwright n'est pas disponible, l'agent logue un avertissement et
retourne False sans planter l'orchestrateur.

Alternative manuelle : ouvrir Claude Code avec claude-in-chrome, naviguer
sur /bretagne/bruz-35170/ et lancer :  python3 scripts/agents/agent_ouestfrance.py --inject <json>
"""

import json
import sys
from datetime import date, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from utils import log, today, known_urls, append_to_queue

AGENT_NAME = "ouestfrance"

OF_BRUZ_URL = "https://www.ouest-france.fr/bretagne/bruz-35170/"
CHROME_PROFILE = Path.home() / "Library/Application Support/Google/Chrome"
FENETRE_JOURS = 7

MOTS_SUJET = ["bruz", "houssin", "conterie", "ker lann", "vert-buisson", "cosec"]
MOTS_THEME = ["trambus", "t4 ", "zac multisites", "rennes métropole"]
MOTS_EXCLUS = [
    "offre d'emploi", "recrutement", "cdi", "cdd",
    "us gosné", "fc bruz", "jeanne d'arc", "stade rennais",
    "nécrologie", "avis de décès",
    "saint-malo", "saint-grégoire", "dinard", "cancale",
    "météo", "horoscope",
]

JS_EXTRACT = """
(function() {
  const results = [];
  const seen = new Set();
  const links = document.querySelectorAll('a[href*="/bretagne/bruz-35170/bruz-"]');
  for (const a of links) {
    const url = a.href.split('?')[0].split('#')[0];
    if (seen.has(url)) continue;
    seen.add(url);
    const titre = a.textContent.trim().replace(/\\s+/g, ' ');
    if (titre.length < 8) continue;
    const container = a.closest('article') || a.closest('li') || a.parentElement;
    const time = container ? container.querySelector('time') : null;
    const dateStr = time ? (time.getAttribute('datetime') || '').substring(0,10) : '';
    const p = container ? container.querySelector('p') : null;
    const resume = p ? p.textContent.trim().substring(0,300).replace(/\\s+/g,' ') : '';
    results.push({ titre, url, date: dateStr, resume });
  }
  return JSON.stringify(results);
})()
"""


def _filter(articles: list[dict]) -> list[dict]:
    """Garde uniquement les articles Bruz récents et pertinents."""
    date_min = date.today() - timedelta(days=FENETRE_JOURS)
    kept = []
    for a in articles:
        try:
            if a.get("date") and date.fromisoformat(a["date"]) < date_min:
                continue
        except ValueError:
            pass
        texte = (a.get("titre", "") + " " + a.get("resume", "")).lower()
        titre_lower = a.get("titre", "").lower()
        if not any(k in titre_lower for k in MOTS_SUJET) and not any(k in texte for k in MOTS_THEME):
            continue
        if any(k in texte for k in MOTS_EXCLUS):
            continue
        kept.append(a)
    return kept


def _get_chrome_cookies() -> list[dict]:
    """Extrait les cookies OF depuis le profil Chrome via browser_cookie3."""
    try:
        import browser_cookie3
        cj = browser_cookie3.chrome(domain_name=".ouest-france.fr")
        return [
            {"name": c.name, "value": c.value, "domain": c.domain or ".ouest-france.fr",
             "path": c.path or "/", "httpOnly": False, "secure": bool(c.secure)}
            for c in cj
        ]
    except Exception as e:
        log(f"Ouest-France : lecture cookies Chrome échouée ({e})", "WARN")
        return []


def _scrape_with_playwright() -> list[dict]:
    """Lance Chrome système via Playwright avec les cookies Chrome injectés.

    Utilise channel='chrome' (Chrome installé) plutôt que Chromium bundlé :
    OF retourne 403 sur headless Chromium mais accepte Chrome réel.
    """
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        log("Ouest-France : Playwright non installé.", "WARN")
        log("  → pip install playwright", "WARN")
        return []

    cookies = _get_chrome_cookies()
    if not cookies:
        log("Ouest-France : aucun cookie Chrome disponible.", "WARN")
        return []

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=True,
                channel="chrome",
                args=["--disable-blink-features=AutomationControlled"],
            )
            ctx = browser.new_context(
                user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
                locale="fr-FR",
            )
            ctx.add_cookies(cookies)
            page = ctx.new_page()
            page.goto(OF_BRUZ_URL, wait_until="domcontentloaded", timeout=20_000)
            page.wait_for_timeout(2000)
            raw = page.evaluate(JS_EXTRACT)
            browser.close()
        return json.loads(raw)
    except Exception as e:
        log(f"Ouest-France : Playwright échoué ({e})", "WARN")
        return []


def run(inject: list[dict] | None = None) -> bool:
    """
    inject : liste d'articles pré-extraits (mode manuel via claude-in-chrome).
    Sans inject : tente Playwright.
    """
    if inject is not None:
        articles = inject
        log(f"Ouest-France : {len(articles)} articles injectés manuellement.")
    else:
        log("Scan Ouest-France — Bruz (Playwright)…")
        articles = _scrape_with_playwright()

    if not articles:
        log("Ouest-France : aucun article récupéré.")
        return False

    articles = _filter(articles)
    if not articles:
        log("Ouest-France : aucun article pertinent après filtrage.")
        return False

    existing = known_urls()
    nouvelles = [
        {
            "id": f"of-{hash(a['url']) & 0xFFFFFF:06x}",
            "titre": a["titre"],
            "source_url": a["url"],
            "source_label": "Ouest-France",
            "date": a.get("date") or today(),
            "detail": a.get("resume", ""),
            "type": "presse",
        }
        for a in articles if a["url"] not in existing
    ]

    if not nouvelles:
        log("Ouest-France : aucun nouvel article.")
        return False

    for a in nouvelles:
        log(f"  🆕 {a['titre'][:70]}", "NEW")

    n = append_to_queue(nouvelles)
    log(f"Ouest-France : {n} nouvelle(s) actu(s) → queue", "OK")
    return n > 0


if __name__ == "__main__":
    run()
