#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Agent Dossiers — Enrichissement automatique des dossiers thématiques.

Lit actus.json et cms.json, détecte les items qui concernent un dossier
(par mots-clés), les injecte dans dossiers.json (section actus_recentes)
et met à jour last_activity + featured si activité récente.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from utils import DATA_DIR, load_json, log, save_json, today

AGENT_NAME = "dossiers"

# Mots-clés par dossier — ordre décroissant de précision
DOSSIER_KEYWORDS: dict[str, list[str]] = {
    "D01": ["t4", "trambus", "terminus", "tram", "mobilité", "ker lann", "gare bruz", "transport"],
    "D02": ["zac", "multisites", "logement", "urbanisme", "mrae", "ker lann", "mons rouaudière", "grand-pâtis"],
    "D03": ["budget", "finances", "budget primitif", "conseil municipal", "bp 2026", "dotation"],
    "D04": ["fiscalité", "taxe foncière", "tfb", "salmon", "impôts locaux", "taux communal"],
    "D05": ["carte", "equipement", "quartier", "openstreetmap"],
    "D06": ["piscine", "équipement sportif", "rénovation", "bassin"],
    "D07": ["police municipale", "sécurité", "vidéoprotection", "pm", "renfort"],
    "D08": ["city stade", "stade", "terrain de sport", "équipement", "fabrice jan"],
}

# Seuil : nb de jours depuis last_activity pour retirer le featured
FEATURED_STALE_DAYS = 60


def match_dossier(text: str) -> list[str]:
    """Retourne les IDs de dossiers concernés par ce texte."""
    text_l = text.lower()
    matched = []
    for dossier_id, keywords in DOSSIER_KEYWORDS.items():
        if any(k in text_l for k in keywords):
            matched.append(dossier_id)
    return matched


def build_news_item(source: dict, source_type: str) -> dict:
    # Schéma actus.json : source_url, detail, source_label (pas url/contenu/source)
    return {
        "date": source.get("date", today())[:10],
        "titre": source.get("titre", "")[:120],
        "detail": (source.get("detail") or source.get("contenu") or "")[:300],
        "source_url": source.get("source_url") or source.get("url") or "",
        "source_label": source.get("source_label") or source.get("source") or source_type,
    }


def run() -> bool:
    dossiers_data = load_json(DATA_DIR / "dossiers.json")
    actus_data = load_json(DATA_DIR / "actus.json")
    cms_data = load_json(DATA_DIR / "cms.json")

    dossiers = dossiers_data.get("dossiers", [])
    dossier_map = {d["id"]: d for d in dossiers}

    # S'assurer que chaque dossier a actus_recentes et les nouveaux champs
    for d in dossiers:
        d.setdefault("actus_recentes", [])
        d.setdefault("featured", False)
        d.setdefault("last_activity", d.get("date_ouverture", today()))

    known_urls_by_dossier: dict[str, set[str]] = {
        d["id"]: {a.get("source_url", "") for a in d.get("actus_recentes", []) if a.get("source_url")}
        for d in dossiers
    }

    injected = 0

    # --- Depuis actus.json ---
    for actu in actus_data.get("actus", []):
        texte = actu.get("titre", "") + " " + (actu.get("detail") or actu.get("contenu") or "")
        for dossier_id in match_dossier(texte):
            if dossier_id not in dossier_map:
                continue
            url = actu.get("source_url") or actu.get("url") or ""
            if url and url in known_urls_by_dossier[dossier_id]:
                continue
            if not url:
                continue  # ignorer les actus sans URL (évite les doublons)
            news = build_news_item(actu, "Presse / Mairie")
            dossier_map[dossier_id]["actus_recentes"].insert(0, news)
            known_urls_by_dossier[dossier_id].add(url)
            # Mettre à jour last_activity si plus récent
            if news["date"] > dossier_map[dossier_id].get("last_activity", ""):
                dossier_map[dossier_id]["last_activity"] = news["date"]
                dossier_map[dossier_id]["featured"] = True
            injected += 1
            log(f"  🆕 [{dossier_id}] ← {news['titre'][:60]}", "NEW")

    # --- Depuis cms.json (délibérations + Bruz Mag) ---
    for seance in cms_data.get("seances", []):
        texte = seance.get("titre", "") + " " + " ".join(seance.get("points_cles", []))
        for dossier_id in match_dossier(texte):
            if dossier_id not in dossier_map:
                continue
            for src in seance.get("sources", []):
                url = src.get("url", "")
                if url in known_urls_by_dossier[dossier_id]:
                    continue
                news = {
                    "date": seance.get("date", today()),
                    "titre": seance.get("titre", "")[:120],
                    "detail": " | ".join(seance.get("points_cles", []))[:300],
                    "source_url": url,
                    "source_label": src.get("label", "Délibération"),
                }
                dossier_map[dossier_id]["actus_recentes"].insert(0, news)
                known_urls_by_dossier[dossier_id].add(url)
                if news["date"] > dossier_map[dossier_id].get("last_activity", ""):
                    dossier_map[dossier_id]["last_activity"] = news["date"]
                    dossier_map[dossier_id]["featured"] = True
                injected += 1
                log(f"  🆕 [{dossier_id}] ← CM {seance['date']}", "NEW")

    # Garder max 20 actus par dossier (les plus récentes en tête)
    for d in dossiers:
        d["actus_recentes"] = sorted(
            d["actus_recentes"], key=lambda x: x.get("date", ""), reverse=True
        )[:20]

    if injected == 0:
        log("Dossiers : aucune nouvelle info à injecter.", "INFO")
        return False

    dossiers_data["dossiers"] = dossiers
    dossiers_data["meta"]["last_updated"] = today()
    save_json(DATA_DIR / "dossiers.json", dossiers_data)
    log(f"Dossiers : {injected} injection(s) → dossiers.json", "OK")
    return True


if __name__ == "__main__":
    run()
