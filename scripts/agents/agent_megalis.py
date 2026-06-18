#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Agent Mégalis — Délibérations Bruz + Rennes Métropole.

Scrape la page organisation Mégalis pour découvrir les URLs de nouvelles
délibérations (ID + hash dans l'URL), télécharge les PDFs, extrait le texte,
met à jour data/cms.json.
"""

import re
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from utils import DATA_DIR, HEADERS, fetch, load_json, log, save_json, today

try:
    from bs4 import BeautifulSoup
    import pdfplumber
except ImportError:
    log("pip install beautifulsoup4 pdfplumber", "ERR")
    sys.exit(1)

AGENT_NAME = "megalis"

BRUZ_SIREN = "213500473"
METRO_SIREN = "243500139"  # Rennes Métropole

MEGALIS_ORG_BRUZ = f"https://data.megalis.bretagne.bzh/organization/commune-de-bruz"
MEGALIS_ORG_METRO = "https://data.megalis.bretagne.bzh/organization/rennes-metropole"
MEGALIS_BASE = "https://data.megalis.bretagne.bzh"

# Pattern URL délibération : /OpenData/{SIREN}/Deliberation/{year}/{id}/{hash}.pdf
PDF_PATTERN = re.compile(
    r"/OpenData/(\d+)/Deliberation/(\d{4})/(\d+)/([a-f0-9]{64})\.pdf", re.I
)


def discover_delib_urls(org_url: str, label: str) -> list[dict]:
    """Scrape la page organisation Mégalis pour trouver les liens PDF de délibérations."""
    log(f"Scan {label}…")
    found = []
    # Paginer si nécessaire (?page=1, ?page=2…)
    for page in range(1, 6):
        url = f"{org_url}?page={page}" if page > 1 else org_url
        r = fetch(url)
        if not r:
            break
        soup = BeautifulSoup(r.text, "html.parser")
        links = soup.find_all("a", href=PDF_PATTERN)
        if not links:
            # Chercher aussi dans les iframes et les data-src
            links = [a for a in soup.find_all("a", href=True)
                     if PDF_PATTERN.search(a["href"])]
        if not links:
            break
        for a in links:
            m = PDF_PATTERN.search(a["href"])
            if m:
                siren, year, doc_id, doc_hash = m.group(1), m.group(2), m.group(3), m.group(4)
                found.append({
                    "url": f"{MEGALIS_BASE}/OpenData/{siren}/Deliberation/{year}/{doc_id}/{doc_hash}.pdf",
                    "doc_id": int(doc_id),
                    "doc_hash": doc_hash,
                    "siren": siren,
                    "annee": int(year),
                    "label_source": label,
                })
    log(f"  → {len(found)} lien(s) trouvé(s) pour {label}")
    return found


def extract_text_pdf(pdf_bytes: bytes) -> str:
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as f:
        f.write(pdf_bytes)
        tmp = Path(f.name)
    text = ""
    try:
        with pdfplumber.open(tmp) as pdf:
            for page in pdf.pages:
                text += (page.extract_text() or "") + "\n"
    except Exception as e:
        log(f"pdfplumber: {e}", "WARN")
    finally:
        tmp.unlink(missing_ok=True)
    return text.strip()


def detect_date(text: str) -> str:
    mois = {
        "janvier": "01", "février": "02", "mars": "03", "avril": "04",
        "mai": "05", "juin": "06", "juillet": "07", "août": "08",
        "septembre": "09", "octobre": "10", "novembre": "11", "décembre": "12",
    }
    pattern = r"\b(\d{1,2})\s+(" + "|".join(mois) + r")\s+(20\d{2})\b"
    m = re.search(pattern, text, re.I)
    if m:
        return f"{m.group(3)}-{mois[m.group(2).lower()]}-{int(m.group(1)):02d}"
    return "inconnue"


def parse_delib(text: str, url: str) -> dict:
    # Numéro (ex: 26-04-12)
    num_m = re.search(r"\b(\d{2}-\d{2,3}-\d{2,3})\b", text)
    numero = num_m.group(1) if num_m else ""

    # Sujet : première ligne en majuscules significative
    sujet = ""
    for line in text.split("\n"):
        line = line.strip()
        if len(line) > 10 and line.isupper() and not line.startswith("VU "):
            sujet = line.title()
            break

    # Vote
    vote = ""
    if "unanimité" in text.lower():
        vote = "unanimité"
    else:
        m = re.search(r"(\d+)\s+voix\s+pour[^.]*(\d+)\s+contre", text, re.I)
        if m:
            vote = f"{m.group(1)} pour / {m.group(2)} contre"

    return {
        "numero": numero,
        "sujet": sujet,
        "vote": vote,
        "url": url,
        "date_detected": today(),
    }


def run() -> bool:
    """Retourne True si cms.json a été mis à jour."""
    cms = load_json(DATA_DIR / "cms.json")
    known_urls: set[str] = set()
    for seance in cms.get("seances", []):
        for s in seance.get("sources", []):
            known_urls.add(s.get("url", ""))

    new_delibs: list[dict] = []

    for org_url, label in [
        (MEGALIS_ORG_BRUZ, "Bruz"),
        (MEGALIS_ORG_METRO, "Rennes Métropole"),
    ]:
        for doc in discover_delib_urls(org_url, label):
            if doc["url"] in known_urls:
                continue
            log(f"  Nouveau doc {doc['doc_id']} ({label}) — téléchargement…")
            r = fetch(doc["url"], timeout=30)
            if not r or len(r.content) < 5000:
                continue
            text = extract_text_pdf(r.content)
            if len(text) < 80:
                log(f"  Texte insuffisant ({len(text)} chars), skip.", "WARN")
                continue
            date_cm = detect_date(text)
            delib = parse_delib(text, doc["url"])
            delib["date_cm"] = date_cm
            delib["source"] = label
            new_delibs.append(delib)
            log(f"  🆕 {date_cm} | {delib['numero']} | {delib['sujet'][:60]}", "NEW")

    if not new_delibs:
        log("Mégalis : aucune nouvelle délibération.", "INFO")
        return False

    # Injecter dans cms.json — regrouper par date de séance
    seances_map: dict[str, dict] = {s["date"]: s for s in cms.get("seances", [])}
    for d in new_delibs:
        date_key = d["date_cm"]
        if date_key not in seances_map:
            seances_map[date_key] = {
                "id": f"CM-{date_key}",
                "date": date_key,
                "statut": "passe",
                "titre": f"Séance du {date_key}",
                "points_cles": [],
                "sources": [],
            }
        seance = seances_map[date_key]
        if d["sujet"]:
            seance["points_cles"].append(d["sujet"])
        seance["sources"].append({"label": d.get("numero") or "Délibération", "url": d["url"]})

    cms["seances"] = sorted(seances_map.values(), key=lambda s: s["date"], reverse=True)
    cms["meta"]["last_updated"] = today()
    save_json(DATA_DIR / "cms.json", cms)
    log(f"Mégalis : {len(new_delibs)} nouvelle(s) délibération(s) → cms.json", "OK")
    return True


if __name__ == "__main__":
    run()
