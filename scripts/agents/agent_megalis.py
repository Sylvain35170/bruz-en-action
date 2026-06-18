#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Agent Mégalis — Détection des nouveaux Conseils Municipaux de Bruz.

Source : RSS YouTube de la chaîne officielle Ville de Bruz.
Signal : nouvelle vidéo "Conseil Municipal" → signale un CM, inject dans cms.json.

Les délibérations complètes sont sur data.megalis.bretagne.bzh (plateforme authentifiée).
Cet agent détecte les nouveaux CMs et ajoute une entrée dans cms.json avec le lien YouTube.
"""

import re
import sys
from pathlib import Path
from xml.etree import ElementTree

sys.path.insert(0, str(Path(__file__).parent.parent))
from utils import DATA_DIR, fetch, load_json, log, save_json, today

AGENT_NAME = "megalis"

# RSS YouTube — chaîne officielle Ville de Bruz (UCfaKRNhoJ4chuaEtWV-bWjg)
YOUTUBE_RSS = "https://www.youtube.com/feeds/videos.xml?channel_id=UCfaKRNhoJ4chuaEtWV-bWjg"
CM_TITLE_PATTERN = re.compile(r"conseil\s+municipal", re.I)

# Mégalis PDF base URL (pour injection manuelle si hash connu)
MEGALIS_BASE = "https://data.megalis.bretagne.bzh/OpenData/213500473/Deliberation"


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


def run() -> bool:
    log("Scan YouTube Ville de Bruz — Conseils Municipaux…")
    r = fetch(YOUTUBE_RSS)
    if not r:
        return False

    cms_data = load_json(DATA_DIR / "cms.json")
    seances = cms_data.setdefault("seances", [])

    known_ids = {s.get("youtube_id", "") for s in seances}
    known_dates = {s.get("date", "") for s in seances}

    items = parse_youtube_rss(r.content)
    nouvelles = []

    for item in items:
        vid_id = item["youtube_url"].split("/")[-1]
        if vid_id in known_ids or item["date_cm"] in known_dates:
            continue
        seance = {
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
            "deliberations_url": f"{MEGALIS_BASE}/{item['date_cm'][:4]}/",
            "source_label": item["source_label"],
            "date_publication": item["date_publication"],
        }
        seances.append(seance)
        nouvelles.append(seance)
        log(f"  🆕 CM {item['date_cm']} — {item['titre'][:60]}", "NEW")

    if not nouvelles:
        log("Mégalis/CMs : aucun nouveau conseil municipal.", "INFO")
        return False

    cms_data["seances"] = sorted(seances, key=lambda s: s.get("date", ""), reverse=True)
    cms_data.setdefault("meta", {})["last_updated"] = today()
    save_json(DATA_DIR / "cms.json", cms_data)
    log(f"Mégalis : {len(nouvelles)} nouveau(x) CM(s) → cms.json", "OK")
    return True


if __name__ == "__main__":
    run()
