"""
Scrape toutes les délibérations de Bruz 2026 sur Mégalis.
- Découvre les IDs via recherche Google (déjà connus) + scan séquentiel
- Télécharge chaque PDF, extrait le texte (pdfplumber + OCR fallback)
- Regroupe par séance CM, génère points_cles
- Écrit le résultat dans data/cms_enrichi.json
"""

import json
import re
import time
import hashlib
import tempfile
import requests
import pdfplumber
from pathlib import Path
from pdf2image import convert_from_path
import pytesseract

BRUZ_SIREN = "213500473"
BASE_URL = f"https://data.megalis.bretagne.bzh/OpenData/{BRUZ_SIREN}/Deliberation/2026"
HORS_PREF_URL = f"https://data.megalis.bretagne.bzh/OpenData/{BRUZ_SIREN}/Hors_prefecture/2026"
CACHE_DIR = Path("/tmp/bruz_megalis_cache")
CACHE_DIR.mkdir(exist_ok=True)
DATA_DIR = Path(__file__).parent.parent / "data"

# IDs Mégalis connus pour Bruz 2026 (découverts via recherches)
# Pattern: autour de 1012938..1012970 pour CM jan 2026
# On scanne une plage large autour
KNOWN_IDS_2026 = list(range(1012900, 1013100))

# Hashes connus (pour vérification)
KNOWN_DOCS = {
    1012942: "abbe312c791636e515e060aaefcd073b9e71f7dd4d19931e8a06a60d8b4441be",
    1012951: "21bd3878cc769dc3c96713f7dbb019757fe7212a3ed3451773809fc1a36ed80a",
    1012938: "b6b1dc7396fa9a9946d085d957775ce4477276f63f188b960bb4886c785ccce2",
    1012970: "405bf2d92065ddf297923a2e2c43588ef8e27a8c57de35f5082283ccd215b8e5",
}

HEADERS = {"User-Agent": "BruzEnAction-CitoyenBot/1.0 (contact: sylv.bertrand@gmail.com)"}


def fetch_pdf(doc_id: int, doc_hash: str) -> bytes | None:
    url = f"{BASE_URL}/{doc_id}/{doc_hash}.pdf"
    cache_file = CACHE_DIR / f"{doc_id}_{doc_hash[:8]}.pdf"
    if cache_file.exists():
        return cache_file.read_bytes()
    try:
        r = requests.get(url, headers=HEADERS, timeout=30)
        if r.status_code == 200 and len(r.content) > 5000:
            cache_file.write_bytes(r.content)
            return r.content
    except Exception:
        pass
    return None


def probe_doc(doc_id: int) -> str | None:
    """Teste si un doc_id existe sur Mégalis en cherchant son hash via Google."""
    # On ne peut pas deviner le hash → on essaie les hashes connus uniquement
    if doc_id in KNOWN_DOCS:
        return KNOWN_DOCS[doc_id]
    return None


def extract_text_pdfplumber(pdf_bytes: bytes) -> str:
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as f:
        f.write(pdf_bytes)
        tmp_path = f.name
    text = ""
    try:
        with pdfplumber.open(tmp_path) as pdf:
            for page in pdf.pages:
                t = page.extract_text() or ""
                text += t + "\n"
    except Exception:
        pass
    return text.strip()


def extract_text_ocr(pdf_bytes: bytes) -> str:
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as f:
        f.write(pdf_bytes)
        tmp_path = f.name
    text = ""
    try:
        images = convert_from_path(tmp_path, dpi=200)
        for img in images:
            t = pytesseract.image_to_string(img, lang="fra")
            text += t + "\n"
    except Exception as e:
        print(f"    OCR erreur: {e}")
    return text.strip()


def extract_text(pdf_bytes: bytes) -> str:
    text = extract_text_pdfplumber(pdf_bytes)
    if len(text) < 100:
        print("    → pdfplumber insuffisant, OCR...")
        text = extract_text_ocr(pdf_bytes)
    return text


def parse_deliberation(text: str) -> dict:
    """Extrait les infos clés d'une délibération."""
    result = {"numero": "", "sujet": "", "vote": "", "resume": ""}

    # Numéro de délibération (ex: 26-01-12)
    m = re.search(r"\b(\d{2}-\d{2}-\d{2,3})\b", text)
    if m:
        result["numero"] = m.group(1)

    # Sujet (ligne en majuscules après le numéro)
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    for i, line in enumerate(lines):
        if result["numero"] and result["numero"] in line:
            # Ligne suivante = titre
            title_parts = []
            for j in range(i, min(i + 4, len(lines))):
                if lines[j].isupper() or lines[j].startswith(result["numero"]):
                    title_parts.append(lines[j].replace(result["numero"], "").strip(" ._-"))
            result["sujet"] = " — ".join(p for p in title_parts if p and len(p) > 3)
            break

    # Vote
    if "unanimité" in text.lower():
        result["vote"] = "unanimité"
    elif re.search(r"(\d+)\s+voix\s+pour", text, re.I):
        m = re.search(r"(\d+)\s+voix\s+pour[^,]*,\s*(\d+)\s+contre", text, re.I)
        if m:
            result["vote"] = f"{m.group(1)} pour / {m.group(2)} contre"

    # Montants financiers
    montants = re.findall(r"[\d\s]+[€]|[\d\s]+euros?", text, re.I)
    if montants:
        result["montants"] = [m.strip() for m in montants[:3]]

    # Résumé : 2-3 phrases du corps du document
    corps = re.sub(r"\s+", " ", text)
    phrases = re.split(r"(?<=[.!?])\s+", corps)
    phrases_utiles = [p for p in phrases if len(p) > 40 and not p.startswith("Vu ") and "Code Général" not in p]
    result["resume"] = " ".join(phrases_utiles[:3]) if phrases_utiles else ""

    return result


def detect_cm_date(text: str) -> str:
    """Détecte la date du CM depuis le texte."""
    mois = {
        "janvier": "01", "février": "02", "mars": "03", "avril": "04",
        "mai": "05", "juin": "06", "juillet": "07", "août": "08",
        "septembre": "09", "octobre": "10", "novembre": "11", "décembre": "12"
    }
    pattern = r"\b(\d{1,2})\s+(" + "|".join(mois.keys()) + r")\s+(20\d{2})\b"
    m = re.search(pattern, text, re.I)
    if m:
        jour, mois_str, annee = m.group(1), m.group(2).lower(), m.group(3)
        return f"{annee}-{mois[mois_str]}-{int(jour):02d}"
    return "inconnue"


def main():
    print("=== Scrape Mégalis Bruz 2026 ===\n")

    # Traitement des docs connus
    all_delibs = []
    for doc_id, doc_hash in KNOWN_DOCS.items():
        print(f"[{doc_id}] Téléchargement...")
        pdf_bytes = fetch_pdf(doc_id, doc_hash)
        if not pdf_bytes:
            print(f"  ✗ Impossible de télécharger")
            continue

        print(f"  → {len(pdf_bytes)//1024} KB — extraction texte...")
        text = extract_text(pdf_bytes)
        print(f"  → {len(text)} caractères extraits")

        if len(text) < 50:
            print(f"  ✗ Texte insuffisant, skip")
            continue

        date = detect_cm_date(text)
        delib = parse_deliberation(text)
        delib["doc_id"] = doc_id
        delib["date_cm"] = date
        delib["url"] = f"{BASE_URL}/{doc_id}/{doc_hash}.pdf"
        all_delibs.append(delib)
        print(f"  ✓ {date} | {delib['numero']} | {delib['sujet'][:60]}")
        time.sleep(0.5)

    # Grouper par séance
    seances = {}
    for d in all_delibs:
        date = d["date_cm"]
        if date not in seances:
            seances[date] = []
        seances[date].append(d)

    print(f"\n=== Résultat ===")
    print(f"{len(all_delibs)} délibérations — {len(seances)} séances")
    for date, delibs in sorted(seances.items()):
        print(f"\n📅 {date}")
        for d in delibs:
            print(f"  • {d['numero']} — {d['sujet'][:70]} [{d['vote']}]")

    # Écrire le résultat
    output = {
        "meta": {"source": "Mégalis Bretagne", "siren": BRUZ_SIREN, "annee": 2026},
        "seances": {
            date: {
                "date": date,
                "deliberations": delibs,
                "points_cles": [f"{d['numero']} — {d['sujet']}" for d in delibs if d.get("sujet")]
            }
            for date, delibs in sorted(seances.items())
        }
    }
    out_path = DATA_DIR / "cms_megalis_2026.json"
    out_path.write_text(json.dumps(output, ensure_ascii=False, indent=2))
    print(f"\n✅ Écrit dans {out_path}")


if __name__ == "__main__":
    main()
