#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Agent Bruz Mag — Détection des bulletins municipaux de Bruz.

Scrape /ma-ville-de-bruz/bulletins-municipaux/ pour détecter :
- Un nouveau Bruz Mag (bimestriel, n°260…)
- Une nouvelle Semaine à Bruz (bimensuel, n°856…)
Les deux sont injectés dans data/bulletins.json — distinct de data/cms.json (séances de
conseil municipal uniquement, voir piège 2026-07-11 dans CLAUDE.md).
"""

import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path
from urllib.parse import unquote

sys.path.insert(0, str(Path(__file__).parent.parent))
from utils import DATA_DIR, fetch, load_json, log, save_json, today

try:
    from bs4 import BeautifulSoup
    import pdfplumber
except ImportError:
    log("pip install beautifulsoup4 pdfplumber", "ERR")
    sys.exit(1)

AGENT_NAME = "bruz_mag"

# Chemin complet nécessaire sous launchd (PATH minimal, cf. agent_select.py)
CLAUDE_CLI = shutil.which("claude") or "/opt/homebrew/bin/claude"
CLAUDE_MODEL = "claude-haiku-4-5-20251001"
CLAUDE_TIMEOUT_S = 150

PROMPT_POINTS_CLES = """\
Voici le texte brut extrait d'un bulletin municipal de Bruz (35), \
« {titre} ». L'extraction PDF casse la mise en page en colonnes : le texte \
peut contenir des fragments mélangés (numéros de téléphone, en-têtes de \
rubrique, bribes de phrases).

Identifie les 5 à 8 sujets/articles distincts traités dans ce numéro et \
résume chacun en une ligne courte et factuelle, en français, du point de \
vue d'un citoyen qui veut savoir ce qui se passe à Bruz (pas les mentions \
légales, sommaire, pagination, ours).

Retourne UNIQUEMENT un tableau JSON de chaînes — aucun texte avant ou après.
Exemple : ["Le marché de Noël se tiendra place de la Mairie du 12 au 14 décembre", "..."]

Texte du bulletin :
{texte}
"""

SOURCES_PRESSE = [
    "https://www.ville-bruz.fr/ma-ville-de-bruz/bulletins-municipaux/",
    "https://www.ville-bruz.fr/ma-ville-de-bruz/actualites/",
]

# Pattern : Bruz-Mag-n°260-de-mai-juin-2026.pdf
MAG_PATTERN = re.compile(r"[Bb]ruz.?[Mm]ag.?n[°o]?(\d+)", re.I)

# Pattern : Semaine-a-Bruz-n°856-du-11-au-25-juin-2026.pdf
SEMAINE_PATTERN = re.compile(r"[Ss]emaine.?[àa].?[Bb]ruz.?n[°o]?(\d+)", re.I)

MOIS = {
    "janvier": 1, "fevrier": 2, "février": 2, "mars": 3, "avril": 4, "mai": 5,
    "juin": 6, "juillet": 7, "aout": 8, "août": 8, "septembre": 9,
    "octobre": 10, "novembre": 11, "decembre": 12, "décembre": 12,
}


def titre_et_date(url: str, prefixe: str, num: int) -> tuple[str, str | None]:
    """Reconstruit un titre lisible et une date ISO depuis le nom du PDF.

    Le texte du lien sur ville-bruz.fr vaut « Télécharger(ouverture dans un
    nouvel onglet) » : inutilisable comme titre (piège récurrent, cf. BACKLOG).
    Le nom de fichier, lui, porte le numéro et la période.

    'Semaine-a-Bruz-n°859-du-27-aout-au-2-septembre-2026.pdf'
      → ('Semaine à Bruz n°859 — du 27 août au 2 septembre 2026', '2026-08-27')
    'Bruz-Mag-n°260-de-mai-juin-2026.pdf'
      → ('Bruz Mag n°260 — mai-juin 2026', '2026-05-01')

    Args:
        url: URL du PDF.
        prefixe: « Bruz Mag » ou « Semaine à Bruz ».
        num: numéro déjà extrait.

    Returns:
        (titre, date_iso) — date_iso vaut None si la période est illisible.
    """
    slug = re.sub(r"\.pdf$", "", unquote(url.rsplit("/", 1)[-1]), flags=re.I)
    m = re.search(rf"n[°o]?{num}[-_ ]?(.*)$", slug, re.I)
    tokens = [t for t in re.split(r"[-_ ]+", m.group(1) if m else "") if t]
    while tokens and tokens[0].lower() in ("de", "des"):  # « de mai-juin » → « mai-juin » ; on garde « du 27… »
        tokens.pop(0)
    tokens = [avec if (avec := {"aout": "août", "fevrier": "février",
                                "decembre": "décembre"}.get(t.lower())) else t
              for t in tokens]

    # Reconstruit la période : espace partout, mais trait d'union entre deux
    # mois consécutifs (« mai-juin » et non « mai juin »).
    periode = ""
    for i, t in enumerate(tokens):
        if i == 0:
            periode = t
        elif t.lower() in MOIS and tokens[i - 1].lower() in MOIS:
            periode += f"-{t}"
        else:
            periode += f" {t}"

    titre = f"{prefixe} n°{num}"
    if periode:
        titre += f" — {periode}"

    date_iso = None
    if an := re.search(r"(20\d{2})", periode):
        if mo := re.search(r"\b(" + "|".join(MOIS) + r")\b", periode, re.I):
            jour = 1
            if dj := re.search(r"\b(\d{1,2})(?:er)?\b", periode):  # 1er jour de la période
                jour = min(int(dj.group(1)), 31)
            date_iso = f"{an.group(1)}-{MOIS[mo.group(1).lower()]:02d}-{jour:02d}"
    return titre, date_iso


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


def _extract_pdf_text(pdf_bytes: bytes, max_pages: int = 8) -> str:
    """Extrait le texte brut des premières pages d'un PDF."""
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as f:
        f.write(pdf_bytes)
        tmp = Path(f.name)
    texte = ""
    try:
        with pdfplumber.open(tmp) as pdf:
            texte = "\n".join((page.extract_text() or "") for page in pdf.pages[:max_pages])
    except Exception as e:
        log(f"pdfplumber bruz mag: {e}", "WARN")
    finally:
        tmp.unlink(missing_ok=True)
    return texte


def _points_cles_via_claude(texte: str, titre: str) -> list[str] | None:
    """Résume le bulletin via le CLI `claude` — la mise en page en colonnes rend
    l'ancienne heuristique (lignes en majuscules) inutilisable (cf. BACKLOG)."""
    if not texte.strip():
        return None
    prompt = PROMPT_POINTS_CLES.format(titre=titre, texte=texte[:12_000])
    try:
        result = subprocess.run(
            [CLAUDE_CLI, "--print", "--model", CLAUDE_MODEL, prompt],
            capture_output=True, text=True, timeout=CLAUDE_TIMEOUT_S,
        )
        if result.returncode != 0:
            log(f"  claude CLI erreur (bruz mag) : {(result.stderr.strip() or result.stdout.strip())[:200]}", "ERR")
            return None
        raw = result.stdout.strip()
        start, end = raw.find("["), raw.rfind("]") + 1
        points = json.loads(raw[start:end])
        return [p.strip() for p in points if isinstance(p, str) and p.strip()][:8]
    except subprocess.TimeoutExpired:
        log("  claude CLI timeout (bruz mag)", "ERR")
        return None
    except (json.JSONDecodeError, ValueError) as e:
        log(f"  JSON invalide (bruz mag) : {e}", "ERR")
        return None
    except FileNotFoundError:
        log("  claude CLI introuvable dans PATH", "WARN")
        return None


def extract_mag_summary(pdf_bytes: bytes, titre: str = "") -> list[str]:
    """Extrait les points clés d'un bulletin (Bruz Mag / Semaine à Bruz) via Claude.

    Repli explicite si le CLI échoue : liste vide plutôt que des fragments de
    colonnes inutilisables (« Découverte De Bruz 07 50 84 53 14 ») — l'ancienne
    heuristique par lignes en majuscules produisait un faux sentiment de
    complétude. Un `points_cles` vide signale clairement qu'une relecture
    manuelle du PDF est nécessaire avant publication.
    """
    texte = _extract_pdf_text(pdf_bytes)
    points = _points_cles_via_claude(texte, titre)
    if points is None:
        log("  points_cles : échec extraction Claude — relire le PDF à la main", "WARN")
        return []
    return points


def run() -> bool:
    bulletins_data = load_json(DATA_DIR / "bulletins.json")
    bulletins_data.setdefault("bulletins", [])
    bulletins_data.setdefault("meta", {})
    known_mag_nums: set[int] = set()
    known_semaine_nums: set[int] = set()

    # Numéros déjà connus depuis les sources bulletins.json
    for bulletin in bulletins_data["bulletins"]:
        for src in bulletin.get("sources", []):
            combined = src.get("label", "") + src.get("url", "")
            if m := MAG_PATTERN.search(combined):
                known_mag_nums.add(int(m.group(1)))
            if m := SEMAINE_PATTERN.search(combined):
                known_semaine_nums.add(int(m.group(1)))

    meta = bulletins_data["meta"]
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
            mag["points_cles"] = extract_mag_summary(r_pdf.content, f"Bruz Mag n°{mag['numero']}")
            new_mags.append(mag)
            known_mag_nums.add(mag["numero"])

        for sem in find_semaine_links(soup, source_url):
            if sem["numero"] in known_semaine_nums:
                continue
            log(f"  🆕 Semaine à Bruz n°{sem['numero']} — téléchargement…", "NEW")
            r_pdf = fetch(sem["url"], timeout=30)
            if not r_pdf or len(r_pdf.content) < 10_000:
                continue
            sem["points_cles"] = extract_mag_summary(r_pdf.content, f"Semaine à Bruz n°{sem['numero']}")
            new_semaines.append(sem)
            known_semaine_nums.add(sem["numero"])

    if not new_mags and not new_semaines:
        log("Bulletins : aucun nouveau numéro détecté.", "INFO")
        return False

    for mag in new_mags:
        titre, date_iso = titre_et_date(mag["url"], "Bruz Mag", mag["numero"])
        bulletins_data["bulletins"].insert(0, {
            "id": f"BM-{mag['numero']}",
            "date": date_iso or today(),
            "titre": titre,
            "points_cles": mag["points_cles"],
            "sources": [{"label": "Télécharger le PDF", "url": mag["url"]}],
            "type": "bruz_mag",
        })
    for sem in new_semaines:
        titre, date_iso = titre_et_date(sem["url"], "Semaine à Bruz", sem["numero"])
        bulletins_data["bulletins"].insert(0, {
            "id": f"SAB-{sem['numero']}",
            "date": date_iso or today(),
            "titre": titre,
            "points_cles": sem["points_cles"],
            "sources": [{"label": "Télécharger le PDF", "url": sem["url"]}],
            "type": "semaine_bruz",
        })

    bulletins_data["bulletins"].sort(key=lambda b: b.get("date", ""), reverse=True)
    meta["last_updated"] = today()
    if new_mags:
        meta["dernier_bruz_mag"] = max(m["numero"] for m in new_mags)
    if new_semaines:
        meta["derniere_semaine_bruz"] = max(s["numero"] for s in new_semaines)
    save_json(DATA_DIR / "bulletins.json", bulletins_data)
    log(f"Bulletins : {len(new_mags)} Bruz Mag, {len(new_semaines)} Semaine à Bruz → bulletins.json", "OK")
    return True


if __name__ == "__main__":
    run()
