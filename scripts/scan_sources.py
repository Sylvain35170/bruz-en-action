"""
scan_sources.py — Scanne les sources web (mairie, campagne, presse)
et met à jour data/actus.json avec les nouvelles publications détectées.

Usage : python3 scripts/scan_sources.py
Cron  : 0 8 * * * python3 /chemin/scripts/scan_sources.py && git add data/ && git commit -m "chore: scan sources [auto]" && git push
"""

import json
import sys
from pathlib import Path
from datetime import date

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("❌ Requis : pip install requests beautifulsoup4")
    sys.exit(1)

ROOT = Path(__file__).parent.parent
META_FILE  = ROOT / "data" / "meta.json"
ACTUS_FILE = ROOT / "data" / "actus.json"

def fetch_page(url: str) -> BeautifulSoup | None:
    try:
        r = requests.get(url, timeout=10, headers={"User-Agent": "BruzEnAction-bot/1.0"})
        r.raise_for_status()
        return BeautifulSoup(r.text, "html.parser")
    except Exception as e:
        print(f"⚠️  Erreur fetch {url} : {e}")
        return None

def scan_mairie(url: str) -> list[dict]:
    soup = fetch_page(url)
    if not soup:
        return []
    items = []
    # À adapter selon la structure réelle du site ville-bruz.fr
    for article in soup.select("article, .news-item, .actualite"):
        titre = article.find(["h2", "h3", "h4"])
        lien  = article.find("a")
        items.append({
            "source": "mairie",
            "titre": titre.get_text(strip=True) if titre else "",
            "url":   lien["href"] if lien and lien.get("href") else url,
            "date_detectee": str(date.today()),
        })
    return items

def main():
    with open(META_FILE) as f:
        meta = json.load(f)

    with open(ACTUS_FILE) as f:
        actus_data = json.load(f)

    existing_urls = {a["url"] for a in actus_data.get("actus", [])}
    nouvelles = []

    for source in meta.get("sources_surveillees", []):
        print(f"🔍 Scan {source['label']}...")
        if source["id"] == "mairie":
            items = scan_mairie(source["url"])
        else:
            # Autres sources à implémenter
            items = []

        for item in items:
            if item["url"] not in existing_urls:
                nouvelles.append(item)
                existing_urls.add(item["url"])

    if nouvelles:
        actus_data["actus"] = nouvelles + actus_data.get("actus", [])
        actus_data["meta"]["last_updated"] = str(date.today())
        with open(ACTUS_FILE, "w") as f:
            json.dump(actus_data, f, ensure_ascii=False, indent=2)
        print(f"✅ {len(nouvelles)} nouvelle(s) actu(s) ajoutée(s)")
    else:
        print("ℹ️  Aucune nouvelle publication détectée")

if __name__ == "__main__":
    main()
