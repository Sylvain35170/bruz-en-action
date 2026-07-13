#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Agent Agenda — Scrape l'agenda de ville-bruz.fr → data/evenements.json.

Contrairement aux actus (pipeline à revue humaine), l'agenda est factuel et
neutre : les événements sont écrits directement dans evenements.json, marqués
`"source": "agenda_mairie"`. Les événements saisis à la main (sans ce marqueur)
ne sont jamais touchés. Les événements auto terminés depuis plus de 30 jours
sont purgés — l'agenda n'est pas une archive.

Piège structure (2026-07-13) : sur les cartes `article.event`, l'attribut
`datetime` de `time.date-from` peut être décalé d'un jour par rapport au jour
affiché (ex. Bal des pompiers : affiché « 13 juillet », datetime 2026-07-14).
On parse donc le jour/mois depuis les spans affichés et seule l'année vient du
`datetime`.
"""

import sys
from datetime import date, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from utils import DATA_DIR, fetch, load_json, log, save_json, stable_id, today

try:
    from bs4 import BeautifulSoup
except ImportError:
    log("pip install beautifulsoup4", "ERR")
    sys.exit(1)

AGENT_NAME = "agenda"
AGENDA_URL = "https://www.ville-bruz.fr/mes-loisirs/agenda/"
SOURCE_MARKER = "agenda_mairie"
PURGE_APRES_JOURS = 30

MOIS_FR = {
    "janvier": 1, "février": 2, "fevrier": 2, "mars": 3, "avril": 4, "mai": 5,
    "juin": 6, "juillet": 7, "août": 8, "aout": 8, "septembre": 9,
    "octobre": 10, "novembre": 11, "décembre": 12, "decembre": 12,
}


def _parse_time_el(time_el) -> str | None:
    """Date ISO d'un élément <time> de carte agenda : jour/mois affichés + année du datetime."""
    if time_el is None:
        return None
    datetime_attr = (time_el.get("datetime") or "").strip()
    day_el = time_el.select_one(".date-day")
    month_el = time_el.select_one(".date-month")
    if len(datetime_attr) >= 4 and day_el and month_el:
        month = MOIS_FR.get(month_el.get_text(strip=True).lower())
        try:
            day = int(day_el.get_text(strip=True))
        except ValueError:
            day = None
        if month and day:
            try:
                return date(int(datetime_attr[:4]), month, day).isoformat()
            except ValueError:
                pass
    # Fallback : datetime brut si complet
    if len(datetime_attr) == 10:
        return datetime_attr
    return None


def scrape_agenda() -> list[dict]:
    r = fetch(AGENDA_URL)
    if not r:
        return []
    soup = BeautifulSoup(r.text, "html.parser")
    evenements = []
    for card in soup.select("article.event"):
        titre_el = card.select_one("h3.card-title a") or card.select_one(".card-title a")
        if not titre_el:
            continue
        titre = titre_el.get_text(strip=True)
        url = titre_el.get("href", "")
        if url.startswith("/"):
            url = "https://www.ville-bruz.fr" + url
        if not titre or not url:
            continue

        date_debut = _parse_time_el(card.select_one("time.date-from"))
        if not date_debut:
            continue
        date_fin = _parse_time_el(card.select_one("time.date-to"))

        theme_el = card.select_one(".card-tags .term")
        categorie = theme_el.get_text(strip=True) if theme_el else "Agenda"

        ev = {
            "id": stable_id("agenda", url),
            "titre": titre,
            "date": date_debut,
            "categorie": categorie,
            "lien": url,
            "lien_label": "Agenda Ville de Bruz",
            "source": SOURCE_MARKER,
        }
        if date_fin and date_fin != date_debut:
            ev["date_fin"] = date_fin
        evenements.append(ev)
    return evenements


def run() -> bool:
    scraped = scrape_agenda()
    if not scraped:
        log("Agenda : page mairie inaccessible ou vide — evenements.json inchangé.", "WARN")
        return False

    data = load_json(DATA_DIR / "evenements.json")
    existants = data.setdefault("evenements", [])
    manuels = [e for e in existants if e.get("source") != SOURCE_MARKER]
    autos = {e.get("lien"): e for e in existants if e.get("source") == SOURCE_MARKER}
    liens_manuels = {e.get("lien") for e in manuels if e.get("lien")}

    n_new, n_maj = 0, 0
    for ev in scraped:
        if ev["lien"] in liens_manuels:
            continue  # déjà couvert par une saisie manuelle (souvent enrichie)
        ancien = autos.get(ev["lien"])
        if ancien is None:
            autos[ev["lien"]] = ev
            n_new += 1
            log(f"  🆕 {ev['date']} · {ev['titre'][:60]}", "NEW")
        elif (ancien.get("date"), ancien.get("date_fin"), ancien.get("titre")) != \
             (ev.get("date"), ev.get("date_fin"), ev.get("titre")):
            autos[ev["lien"]] = ev
            n_maj += 1
            log(f"  🔁 {ev['date']} · {ev['titre'][:60]}")

    # Purge des événements auto terminés depuis plus de PURGE_APRES_JOURS jours
    cutoff = (date.today() - timedelta(days=PURGE_APRES_JOURS)).isoformat()
    avant = len(autos)
    autos = {k: e for k, e in autos.items()
             if (e.get("date_fin") or e.get("date") or "") >= cutoff}
    n_purge = avant - len(autos)

    if not (n_new or n_maj or n_purge):
        log("Agenda : rien de nouveau.", "INFO")
        return False

    data["evenements"] = manuels + sorted(autos.values(), key=lambda e: e.get("date") or "")
    data.setdefault("meta", {})["last_updated"] = today()
    save_json(DATA_DIR / "evenements.json", data)
    log(f"Agenda : {n_new} nouveau(x), {n_maj} mis à jour, {n_purge} purgé(s) "
        f"→ {len(data['evenements'])} événements.", "OK")
    return True


if __name__ == "__main__":
    run()
