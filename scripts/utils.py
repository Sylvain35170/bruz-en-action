#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Helpers partagés pour les agents de veille Bruz en Action."""

import json
import subprocess
from datetime import date, datetime
from pathlib import Path

import requests

ROOT = Path(__file__).parent.parent
DATA_DIR = ROOT / "data"
QUEUE_FILE = DATA_DIR / "actus_queue.json"
PROPOSALS_DIR = ROOT / "scripts" / "proposals"
HEADERS = {"User-Agent": "BruzEnAction-CitoyenBot/1.0 (contact: sylv.bertrand@gmail.com)"}


def log(msg: str, level: str = "INFO") -> None:
    ts = datetime.now().strftime("%H:%M:%S")
    icons = {"INFO": "·", "OK": "✅", "WARN": "⚠️", "ERR": "❌", "NEW": "🆕"}
    print(f"[{ts}] {icons.get(level, '·')}  {msg}", flush=True)


def today() -> str:
    return date.today().isoformat()


def load_json(path: Path) -> dict:
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, data: dict) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def dedup(items: list[dict], key: str) -> list[dict]:
    """Déduplique une liste de dicts sur une clé donnée (conserve le premier)."""
    seen: set[str] = set()
    result: list[dict] = []
    for item in items:
        k = str(item.get(key, ""))
        if k and k not in seen:
            seen.add(k)
            result.append(item)
    return result


def fetch(url: str, timeout: int = 15) -> requests.Response | None:
    try:
        r = requests.get(url, headers=HEADERS, timeout=timeout)
        r.raise_for_status()
        return r
    except Exception as e:
        log(f"fetch {url} → {e}", "WARN")
        return None


def known_urls() -> set[str]:
    """URLs déjà connues : actus.json publiées + queue en attente."""
    actus = load_json(DATA_DIR / "actus.json")
    queue = load_json(QUEUE_FILE)
    return (
        {a.get("source_url", "") for a in actus.get("actus", [])} |
        {i.get("source_url", "") for i in queue.get("items", [])}
    )


def append_to_queue(new_items: list[dict]) -> int:
    """Ajoute des items à la queue si non-dupliqués. Retourne le nb ajouté."""
    queue = load_json(QUEUE_FILE)
    items = queue.get("items", [])
    existing = {i.get("source_url", "") for i in items}
    added = 0
    for item in new_items:
        url = item.get("source_url", "")
        if url and url not in existing:
            items.append(item)
            existing.add(url)
            added += 1
    if added:
        QUEUE_FILE.write_text(
            json.dumps({"items": items, "meta": {"last_updated": today()}},
                       ensure_ascii=False, indent=2), encoding="utf-8"
        )
    return added


def git_commit_push(message: str) -> bool:
    """git add data/ → commit → push. Retourne True si un commit a été créé."""
    try:
        # Y a-t-il des changements dans data/ ?
        result = subprocess.run(
            ["git", "diff", "--quiet", "--", "data/"],
            cwd=ROOT, capture_output=True,
        )
        # returncode 1 = il y a des diffs, 0 = rien
        if result.returncode == 0:
            # Vérifier aussi les fichiers non trackés dans data/
            result2 = subprocess.run(
                ["git", "ls-files", "--others", "--exclude-standard", "data/"],
                cwd=ROOT, capture_output=True, text=True,
            )
            if not result2.stdout.strip():
                log("Aucun changement dans data/ — pas de commit.", "INFO")
                return False

        subprocess.run(["git", "add", "data/"], cwd=ROOT, check=True)
        subprocess.run(["git", "commit", "-m", message], cwd=ROOT, check=True)
        subprocess.run(["git", "push"], cwd=ROOT, check=True)
        log(f"Push OK : {message}", "OK")
        return True
    except subprocess.CalledProcessError as e:
        log(f"Git error : {e}", "ERR")
        return False
