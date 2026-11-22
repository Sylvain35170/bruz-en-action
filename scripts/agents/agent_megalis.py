#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Agent Mégalis — actes officiels de Bruz + détection des nouveaux Conseils Municipaux.

Deux sources, deux sorties :
  1. API Mégalis (actes officiels)   → data/actus_queue.json → select → revue
  2. RSS YouTube (chaîne Ville)      → data/cms.json (nouvelle séance détectée)

L'API Mégalis est **publique et sans authentification** — contrairement à ce que
cet agent a longtemps affirmé, ce qui l'avait cantonné au seul flux YouTube et
laissait les délibérations officielles hors de la veille (saisies à la main
jusqu'au 2026-08-01). Endpoint repéré en écoutant le trafic du portail, qui est
un SPA Angular : `data-publication.megalis.bretagne.bzh/mq_apis/actes/v1/search`.
"""

import re
import shutil
import subprocess
import sys
import tempfile
import time
from datetime import date, datetime, timedelta
from pathlib import Path
from xml.etree import ElementTree

sys.path.insert(0, str(Path(__file__).parent.parent))
from utils import (
    DATA_DIR, append_to_queue, fetch, known_ids, known_urls, load_json, log,
    save_json, stable_id, today,
)

AGENT_NAME = "megalis"

# RSS YouTube — chaîne officielle Ville de Bruz (UCfaKRNhoJ4chuaEtWV-bWjg)
YOUTUBE_RSS = "https://www.youtube.com/feeds/videos.xml?channel_id=UCfaKRNhoJ4chuaEtWV-bWjg"
CM_TITLE_PATTERN = re.compile(r"conseil\s+municipal", re.I)

# Mégalis — SIREN de la commune de Bruz (21 + INSEE ; ne pas confondre avec les
# communes voisines, plusieurs SIREN 2135004xx se ressemblent)
SIREN_BRUZ = "213500473"
MEGALIS_API = "https://data-publication.megalis.bretagne.bzh/mq_apis/actes/v1/search"
MEGALIS_ORG_URL = f"https://data.megalis.bretagne.bzh/?siren={SIREN_BRUZ}"

# Typologies retenues. 99_AT (arrêtés temporaires de voirie) est volontairement
# exclu : volume élevé, intérêt citoyen quasi nul.
TYPOLOGIES = {
    "99_DE": "Délibération",
    "99_HP": "Acte hors préfecture",
}

# Fenêtre sur la date de PUBLICATION, pas la date d'acte : Mégalis publie 4 à
# 5 jours après la séance. 15 jours laissent une marge confortable tout en
# évitant qu'un premier run n'aspire les 2 400 actes de l'historique.
FENETRE_JOURS = 15

# Texte de l'acte transmis à agent_select. Sans lui, Haiku ne voit que le titre et
# la rubrique et invente le résumé : le 18/11, un PPRI (avis de la Ville) était
# présenté comme « révisé par la Ville », deux délibérations de la Ville étaient
# attribuées à Rennes Métropole, et les décomptes de votes manquaient.
# Chemin complet : sous launchd, PATH ne contient que /usr/bin:/bin (cf. CLAUDE_CLI).
PDFTOTEXT = shutil.which("pdftotext") or "/opt/homebrew/bin/pdftotext"
EXTRAIT_AVANT = 1000        # caractères gardés avant « après en avoir délibéré » (l'exposé)
EXTRAIT_APRES = 800         # … et après (le dispositif, le vote)
PDF_TIMEOUT_S = 25          # téléchargement d'un PDF
PDF_BUDGET_S = 120          # budget total par run : l'agent est coupé à 300 s par le watchdog
# Votes : l'OCR sépare parfois « 26 voix » de « POUR » (« à 26 voix Fixe … POUR et 7 voix
# CONTRE »). Nombres limités à 2 chiffres et non précédés d'un chiffre : un conseil compte
# 33 élus, et « 3 900 € en 2027 pour ces actions » ne doit pas devenir « 2027 pour ».
VOTE_RE = re.compile(
    r"à l['’]unanimité"
    r"|\b\d{1,2}\s+voix(?:\s+(?:pour|contre|abstentions?))?"
    r"|\b\d{1,2}\s+(?:pour|contre|abstentions?)\b", re.I)
# « délibéré » seul suffit : « après en avoir » est parfois séparé de lui par du texte
# d'une autre colonne. « délibération(s) » ne correspond pas (terminaison différente).
MARQUEUR_RE = re.compile(r"d[ée]lib[ée]r[ée]\b", re.I)


def parse_youtube_rss(content: bytes) -> list[dict]:
    """Parse le feed YouTube Atom et retourne les CM récents."""
    items = []
    ns = {
        "atom": "http://www.w3.org/2005/Atom",
        "yt": "http://www.youtube.com/xml/schemas/2015",
        "media": "http://search.yahoo.com/mrss/",
    }
    try:
        root = ElementTree.fromstring(content)
        for entry in root.findall("atom:entry", ns):
            titre = entry.findtext("atom:title", "", ns).strip()
            if not CM_TITLE_PATTERN.search(titre):
                continue
            vid_id = entry.findtext("yt:videoId", "", ns).strip()
            published = entry.findtext("atom:published", today(), ns)[:10]
            date_cm = _extract_date_from_title(titre) or published
            items.append({
                "id": f"cm-yt-{vid_id}",
                "titre": titre,
                "date_cm": date_cm,
                "youtube_url": f"https://youtu.be/{vid_id}",
                "source_label": "Ville de Bruz — YouTube",
                "date_publication": published,
            })
    except Exception as e:
        log(f"Parse YouTube RSS: {e}", "WARN")
    return items


def _extract_date_from_title(titre: str) -> str | None:
    """Extrait une date ISO depuis un titre comme 'Conseil Municipal du lundi 26 janvier 2026'."""
    mois = {
        "janvier": "01", "février": "02", "mars": "03", "avril": "04",
        "mai": "05", "juin": "06", "juillet": "07", "août": "08",
        "septembre": "09", "octobre": "10", "novembre": "11", "décembre": "12",
    }
    m = re.search(r"(\d{1,2})\s+(" + "|".join(mois) + r")\s+(\d{4})", titre.lower())
    if m:
        return f"{m.group(3)}-{mois[m.group(2)]}-{int(m.group(1)):02d}"
    return None


# Mots à ne pas décapitaliser quand on remet un objet tout-majuscules en casse
# lisible. Liste volontairement courte : mieux vaut un mot mal capitalisé qu'un
# titre faux, et la revue humaine repasse derrière.
ACRONYMES = {
    "CM", "CCAS", "ZAC", "PLU", "PLUIH", "PLUI", "DSP", "SDIS", "EHPAD", "ULIS",
    "RASED", "TFB", "BP", "CFU", "DPU", "SEM", "SPL", "EPCI", "AMO", "CIS", "TVA",
    "HT", "TTC", "PV", "ALSH", "CME", "CMJ", "SIVU", "STEP", "OAP", "ADS",
}
PROPRES = {
    "bruz", "ker", "lann", "rennes", "métropole", "vilaine", "carcé", "conterie",
    "cicé", "cice", "blossac", "pont-réan", "buisson", "vert", "pagnol", "fleming",
    "bretagne", "guichen", "vezin-le-coquet", "laillé", "sainte", "rose", "lima",
    "noë", "belliard", "siméon", "barré", "barre", "robert", "france", "breizhgo",
    "houssin", "salmon", "helena", "logis", "mérol", "bihardais", "bonna", "sabla",
}

# Un jeton contenant un chiffre est une référence (CM71, T4, D05) : le
# décapitaliser produirait « Cm71 ».
REF_CHIFFREE = re.compile(r"\d")


def _lisible(objet: str) -> str:
    """Remet un objet Mégalis tout-majuscules dans une casse lisible.

    Les objets arrivent sous la forme `RUBRIQUE_INTITULÉ EN CAPITALES`. On garde
    la rubrique en tête, séparée par un tiret cadratin. L'original reste stocké
    dans `objet_source` : cette normalisation est cosmétique et ne doit jamais
    faire perdre le libellé officiel.
    """
    segments = [s.strip(" _-") for s in objet.split("_") if s.strip(" _-")]
    sortie = []
    for seg in segments:
        if not seg.isupper():
            sortie.append(seg)
            continue
        mots = []
        for mot in seg.split():
            noyau = mot.strip(".,;:()«»\"'")
            if noyau in ACRONYMES or REF_CHIFFREE.search(noyau):
                mots.append(mot)
            elif noyau.lower() in PROPRES:
                mots.append(mot.capitalize())
            else:
                mots.append(mot.lower())
        phrase = " ".join(mots)
        sortie.append(phrase[:1].upper() + phrase[1:] if phrase else phrase)
    return " — ".join(sortie)


def extrait_depuis_texte(texte: str) -> str:
    """Isole de quoi résumer un acte dans le texte brut de son PDF.

    Les PDF Mégalis sont des scans OCRisés : colonnes mélangées, en-tête de
    préfecture, liste des présents. La partie utile entoure « après en avoir
    délibéré » (exposé avant, dispositif et vote après). Les décomptes de votes
    sont repérés par regex et placés en tête : l'OCR les noie dans le texte.
    """
    t = re.sub(r"\s+", " ", texte).strip()
    if not t:
        return ""
    m = MARQUEUR_RE.search(t)
    if m:
        corps = t[max(0, m.start() - EXTRAIT_AVANT): m.end() + EXTRAIT_APRES]
    else:
        corps = t[600: 600 + EXTRAIT_AVANT + EXTRAIT_APRES]   # repli : on saute l'en-tête
    votes = list(dict.fromkeys(v.group(0).lower() for v in VOTE_RE.finditer(t)))
    prefixe = f"[VOTE repéré dans l'acte : {' ; '.join(votes)}] " if votes else ""
    return prefixe + corps


def extrait_acte(url: str) -> str:
    """Télécharge le PDF d'un acte et retourne son extrait ('' si échec : jamais bloquant)."""
    r = fetch(url, timeout=PDF_TIMEOUT_S)
    if r is None or not r.content.startswith(b"%PDF"):
        return ""
    try:
        with tempfile.NamedTemporaryFile(suffix=".pdf") as f:
            f.write(r.content)
            f.flush()
            res = subprocess.run([PDFTOTEXT, f.name, "-"], capture_output=True,
                                 text=True, timeout=30)
    except (OSError, subprocess.TimeoutExpired) as e:
        log(f"Mégalis : pdftotext indisponible ou trop lent ({e})", "WARN")
        return ""
    return extrait_depuis_texte(res.stdout) if res.returncode == 0 else ""


def scan_actes_megalis() -> int:
    """Interroge l'API Mégalis et pousse les actes récents vers la queue de veille."""
    log(f"Scan Mégalis — actes officiels (SIREN {SIREN_BRUZ}, {FENETRE_JOURS} j)…")
    r = fetch(f"{MEGALIS_API}?query=&siren={SIREN_BRUZ}&lignes=100")
    if not r:
        log("Mégalis : API injoignable.", "ERR")
        return 0

    try:
        resultats = r.json().get("resultats", [])
    except ValueError as e:
        log(f"Mégalis : réponse illisible ({e})", "ERR")
        return 0

    date_min = date.today() - timedelta(days=FENETRE_JOURS)
    connus_urls, connus_ids = known_urls(), known_ids()
    nouveaux = []

    for acte in resultats:
        if acte.get("typologie") not in TYPOLOGIES:
            continue
        url = acte.get("url") or ""
        acte_id = acte.get("id") or ""
        if not url or not acte_id:
            continue
        try:
            publie = date.fromisoformat(acte["date_publication"][:10])
        except (KeyError, ValueError):
            continue
        if publie < date_min:
            continue

        item_id = stable_id("megalis", acte_id)
        if item_id in connus_ids or url in connus_urls:
            continue

        objet = acte.get("objet") or ""
        nouveaux.append({
            "id": item_id,
            "titre": _lisible(objet),
            "objet_source": objet,          # libellé officiel, jamais perdu
            "source_url": url,
            "source_label": f"Mégalis — {TYPOLOGIES[acte['typologie']]}",
            "date": acte.get("date_acte", "")[:10] or publie.isoformat(),
            "detail": acte.get("classification_libelle", ""),
            "type": "megalis",
        })
        connus_ids.add(item_id)
        connus_urls.add(url)
        log(f"  🆕 {_lisible(objet)[:70]}", "NEW")

    if not nouveaux:
        log("Mégalis : aucun acte nouveau sur la fenêtre.", "INFO")
        return 0

    # Texte des actes pour la sélection, dans un budget de temps borné (un acte
    # sans extrait reste valide : la sélection est alors prévenue qu'elle n'a que le titre).
    debut, n_extraits = time.monotonic(), 0
    for item in nouveaux:
        if time.monotonic() - debut > PDF_BUDGET_S:
            log("Mégalis : budget PDF épuisé — actes restants sans extrait.", "WARN")
            break
        extrait = extrait_acte(item["source_url"])
        if extrait:
            item["texte_extrait"] = extrait
            n_extraits += 1
    log(f"Mégalis : texte extrait pour {n_extraits}/{len(nouveaux)} acte(s).", "INFO")

    n = append_to_queue(nouveaux)
    log(f"Mégalis : {n} acte(s) officiel(s) → queue", "OK")
    return n


def run() -> bool:
    actes = scan_actes_megalis()

    log("Scan YouTube Ville de Bruz — Conseils Municipaux…")
    r = fetch(YOUTUBE_RSS)
    if not r:
        # Le RSS YouTube renvoie parfois un 404 transitoire (rate-limit). Sans
        # ce log, l'échec passait pour « aucun nouveau conseil municipal » et un
        # CM publié ce jour-là aurait été manqué en silence.
        log("Mégalis/CMs : RSS YouTube injoignable — détection des CM sautée.", "ERR")
        return actes > 0

    cms_data = load_json(DATA_DIR / "cms.json")
    seances = cms_data.setdefault("seances", [])

    youtube_ids = {s.get("youtube_id", "") for s in seances}
    known_dates = {s.get("date", "") for s in seances}

    items = parse_youtube_rss(r.content)
    nouvelles = []

    for item in items:
        vid_id = item["youtube_url"].split("/")[-1]
        if vid_id in youtube_ids or item["date_cm"] in known_dates:
            continue
        seance = {
            "id": f"CM-{item['date_cm']}",
            "date": item["date_cm"],
            "titre": item["titre"],
            "youtube_id": vid_id,
            "youtube_url": item["youtube_url"],
            "points_cles": [],
            "sources": [
                {
                    "label": "Vidéo YouTube",
                    "url": item["youtube_url"],
                }
            ],
            "deliberations_url": MEGALIS_ORG_URL,
            "source_label": item["source_label"],
            "date_publication": item["date_publication"],
        }
        seances.append(seance)
        nouvelles.append(seance)
        log(f"  🆕 CM {item['date_cm']} — {item['titre'][:60]}", "NEW")

    if not nouvelles:
        log("Mégalis/CMs : aucun nouveau conseil municipal.", "INFO")
        return actes > 0

    cms_data["seances"] = sorted(seances, key=lambda s: s.get("date", ""), reverse=True)
    cms_data.setdefault("meta", {})["last_updated"] = today()
    save_json(DATA_DIR / "cms.json", cms_data)
    log(f"Mégalis : {len(nouvelles)} nouveau(x) CM(s) → cms.json", "OK")
    return True


if __name__ == "__main__":
    if "--dry-run" in sys.argv:
        # Montre ce que l'API renverrait sans rien écrire dans la queue.
        import json as _json
        _r = fetch(f"{MEGALIS_API}?query=&siren={SIREN_BRUZ}&lignes=100")
        _actes = _r.json().get("resultats", []) if _r else []
        _min = date.today() - timedelta(days=FENETRE_JOURS)
        for _a in _actes:
            if _a.get("typologie") not in TYPOLOGIES:
                continue
            _p = _a.get("date_publication", "")[:10]
            _dans = _p and date.fromisoformat(_p) >= _min
            print(f"{'RETENU ' if _dans else '  hors '} {_p}  {_lisible(_a.get('objet', ''))[:78]}")
    else:
        run()
