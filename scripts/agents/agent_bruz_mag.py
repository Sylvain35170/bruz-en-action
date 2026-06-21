#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Agent Bruz Mag — Détection des bulletins municipaux de Bruz.

Scrape /ma-ville-de-bruz/bulletins-municipaux/ pour détecter :
- Un nouveau Bruz Mag (bimestriel, n°260…)
- Une nouvelle Semaine à Bruz (bimensuel, n°856…)
Les deux sont injectés dans data/cms.json.
"""

import re
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from utils import DATA_DIR, fetch, load_json, log, save_json, today

try:
    from bs4 import BeautifulSoup
    import pdfplumber
except ImportError:
    log("pip install beautifulsoup4 pdfplumber", "ERR")
    sys.exit(1)

AGENT_NAME = "bruz_mag"

SOURCES_PRESSE = [
    "https://www.ville-bruz.fr/ma-ville-de-bruz/bulletins-municipaux/",
    "https://www.ville-bruz.fr/ma-ville-de-bruz/actualites/",
]

# Pattern : Bruz-Mag-n°260-de-mai-juin-2026.pdf
MAG_PATTERN = re.compile(r"[Bb]ruz.?[Mm]ag.?n[°o]?(\d+)", re.I)

# Pattern : Semaine-a-Bruz-n°856-du-11-au-25-juin-2026.pdf
SEMAINE_PATTERN = re.compile(r"[Ss]emaine.?[àa].?[Bb]ruz.?n[°o]?(\d+)", re.I)


def find_mag_links(soup: BeautifulSoup, base_url: str) -> list[dict]:
    """Détecte les Bruz Mag dans la page."""
    results = []
    for a in soup.find_all("a", href=True):
        href = a["href"]
        text = a.get_text(strip=True)
        m = MAG_PATTERN.search(href) or MAG_PATTERN.search(text)
        if m and href.endswith(".pdf"):
            num = int(m.group(1))
            url = href if href.startswith("http") else "https://www.ville-bruz.fr" + href
            results.append({"numero": num, "url": url, "titre": text or f"Bruz Mag n°{num}"})
    return results


def find_semaine_links(soup: BeautifulSoup, base_url: str) -> list[dict]:
    """Détecte les numéros de La Semaine à Bruz dans la page."""
    results = []
    seen_urls: set[str] = set()
    for a in soup.find_all("a", href=True):
        href = a["href"]
        text = a.get_text(strip=True)
        m = SEMAINE_PATTERN.search(href) or SEMAINE_PATTERN.search(text)
        if m and href.endswith(".pdf") and href not in seen_urls:
            seen_urls.add(href)
            num = int(m.group(1))
            url = href if href.startswith("http") else "https://www.ville-bruz.fr" + href
            results.append({"numero": num, "url": url, "titre": text or f"Semaine à Bruz n°{num}"})
    return results


def extract_mag_summary(pdf_bytes: bytes) -> list[str]:
    """Extrait les titres d'articles du Bruz Mag (lignes en gras / majuscules)."""
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as f:
        f.write(pdf_bytes)
        tmp = Path(f.name)
    titres = []
    try:
        with pdfplumber.open(tmp) as pdf:
            for page in pdf.pages[:8]:  # Les 8 premières pages suffisent
                text = page.extract_text() or ""
                for line in text.split("\n"):
                    line = line.strip()
                    if 10 < len(line) < 100 and line.isupper():
                        titres.append(line.title())
    except Exception as e:
        log(f"pdfplumber bruz mag: {e}", "WARN")
    finally:
        tmp.unlink(missing_ok=True)
    return list(dict.fromkeys(titres))[:10]  # dédup, max 10


def run() -> bool:
    cms = load_json(DATA_DIR / "cms.json")
    known_mag_nums: set[int] = set()
    known_semaine_nums: set[int] = set()

    # Numéros déjà connus depuis les sources cms.json
    for seance in cms.get("seances", []):
        for src in seance.get("sources", []):
            combined = src.get("label", "") + src.get("url", "")
            if m := MAG_PATTERN.search(combined):
                known_mag_nums.add(int(m.group(1)))
            if m := SEMAINE_PATTERN.search(combined):
                known_semaine_nums.add(int(m.group(1)))

    meta = cms.get("meta", {})
    if meta.get("dernier_bruz_mag"):
        known_mag_nums.add(int(meta["dernier_bruz_mag"]))
    if meta.get("derniere_semaine_bruz"):
        known_semaine_nums.add(int(meta["derniere_semaine_bruz"]))

    new_mags = []
    new_semaines = []

    for source_url in SOURCES_PRESSE:
        log(f"Scan {source_url}…")
        r = fetch(source_url)
        if not r:
            continue
        soup = BeautifulSoup(r.text, "html.parser")

        for mag in find_mag_links(soup, source_url):
            if mag["numero"] in known_mag_nums:
                continue
            log(f"  🆕 Bruz Mag n°{mag['numero']} — téléchargement…", "NEW")
            r_pdf = fetch(mag["url"], timeout=30)
            if not r_pdf or len(r_pdf.content) < 10_000:
                continue
            mag["points_cles"] = extract_mag_summary(r_pdf.content)
            new_mags.append(mag)
            known_mag_nums.add(mag["numero"])

        for sem in find_semaine_links(soup, source_url):
            if sem["numero"] in known_semaine_nums:
                continue
            log(f"  🆕 Semaine à Bruz n°{sem['numero']} — téléchargement…", "NEW")
            r_pdf = fetch(sem["url"], timeout=30)
            if not r_pdf or len(r_pdf.content) < 10_000:
                continue
            sem["points_cles"] = extract_mag_summary(r_pdf.content)
            new_semaines.append(sem)
            known_semaine_nums.add(sem["numero"])

    if not new_mags and not new_semaines:
        log("Bulletins : aucun nouveau numéro détecté.", "INFO")
        return False

    for mag in new_mags:
        cms["seances"].insert(0, {
            "id": f"BM-{mag['numero']}",
            "date": today(),
            "statut": "passe",
            "titre": mag["titre"],
            "points_cles": mag["points_cles"],
            "sources": [{"label": mag["titre"], "url": mag["url"]}],
            "type": "bruz_mag",
        })
    for sem in new_semaines:
        cms["seances"].insert(0, {
            "id": f"SAB-{sem['numero']}",
            "date": today(),
            "statut": "passe",
            "titre": sem["titre"],
            "points_cles": sem["points_cles"],
            "sources": [{"label": sem["titre"], "url": sem["url"]}],
            "type": "semaine_bruz",
        })

    meta["last_updated"] = today()
    if new_mags:
        meta["dernier_bruz_mag"] = max(m["numero"] for m in new_mags)
    if new_semaines:
        meta["derniere_semaine_bruz"] = max(s["numero"] for s in new_semaines)
    cms["meta"] = meta
    save_json(DATA_DIR / "cms.json", cms)
    log(f"Bulletins : {len(new_mags)} Bruz Mag, {len(new_semaines)} Semaine à Bruz → cms.json", "OK")
    return True


if __name__ == "__main__":
    run()
