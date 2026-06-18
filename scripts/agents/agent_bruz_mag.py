#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Agent Bruz Mag — Détection d'un nouveau numéro du magazine municipal.

Scrape la page presse/publications de ville-bruz.fr pour détecter un nouveau
PDF du Bruz Mag, extrait le texte, résume les articles clés → data/cms.json.
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
    "https://www.ville-bruz.fr/ma-ville-de-bruz/publications/bruz-magazine/",
    "https://www.ville-bruz.fr/actualites/",
]

# Pattern : Bruz-Mag-n°260-de-mai-juin-2026.pdf
MAG_PATTERN = re.compile(r"[Bb]ruz.?[Mm]ag.?n[°o]?(\d+)", re.I)


def find_mag_links(soup: BeautifulSoup, base_url: str) -> list[dict]:
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

    # Numéros déjà connus depuis les sources cms.json
    for seance in cms.get("seances", []):
        for src in seance.get("sources", []):
            m = MAG_PATTERN.search(src.get("label", "") + src.get("url", ""))
            if m:
                known_mag_nums.add(int(m.group(1)))

    # Aussi depuis meta cms
    meta_mag = cms.get("meta", {}).get("dernier_bruz_mag", 0)
    if meta_mag:
        known_mag_nums.add(int(meta_mag))

    new_mags = []
    for source_url in SOURCES_PRESSE:
        log(f"Scan {source_url}…")
        r = fetch(source_url)
        if not r:
            continue
        soup = BeautifulSoup(r.text, "html.parser")
        for mag in find_mag_links(soup, source_url):
            if mag["numero"] in known_mag_nums:
                continue
            log(f"  🆕 Bruz Mag n°{mag['numero']} détecté — téléchargement…", "NEW")
            r_pdf = fetch(mag["url"], timeout=30)
            if not r_pdf or len(r_pdf.content) < 10_000:
                continue
            titres = extract_mag_summary(r_pdf.content)
            mag["points_cles"] = titres
            new_mags.append(mag)
            known_mag_nums.add(mag["numero"])

    if not new_mags:
        log("Bruz Mag : aucun nouveau numéro détecté.", "INFO")
        return False

    # Injecter dans cms.json
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
    cms["meta"]["last_updated"] = today()
    cms["meta"]["dernier_bruz_mag"] = max(m["numero"] for m in new_mags)
    save_json(DATA_DIR / "cms.json", cms)
    log(f"Bruz Mag : {len(new_mags)} nouveau(x) numéro(s) → cms.json", "OK")
    return True


if __name__ == "__main__":
    run()
