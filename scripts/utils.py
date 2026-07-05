#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Helpers partagés pour les agents de veille Bruz en Action."""

import difflib
import hashlib
import json
import subprocess
from datetime import date, datetime
from pathlib import Path

import requests

ROOT = Path(__file__).parent.parent
DATA_DIR = ROOT / "data"
QUEUE_FILE = DATA_DIR / "actus_queue.json"
PROPOSALS_DIR = ROOT / "scripts" / "proposals"
REGISTRY_FILE = PROPOSALS_DIR / "pending.json"
HEADERS = {"User-Agent": "BruzEnAction-CitoyenBot/1.0 (contact: sylv.bertrand@gmail.com)"}


def log(msg: str, level: str = "INFO") -> None:
    ts = datetime.now().strftime("%H:%M:%S")
    icons = {"INFO": "·", "OK": "✅", "WARN": "⚠️", "ERR": "❌", "NEW": "🆕"}
    print(f"[{ts}] {icons.get(level, '·')}  {msg}", flush=True)


def today() -> str:
    return date.today().isoformat()


def stable_id(prefix: str, url: str) -> str:
    """ID stable et reproductible pour un item de veille.

    hash() Python est randomisé par processus (PYTHONHASHSEED) : le même article
    changeait d'id à chaque run. md5 garantit le même id partout, pour toujours.
    """
    return f"{prefix}-{hashlib.md5(url.encode('utf-8')).hexdigest()[:8]}"


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


def check_url_status(url: str, timeout: int = 10) -> dict:
    """Vérifie qu'une URL répond, sans télécharger le corps (HEAD, fallback GET en streaming
    si HEAD est refusé/mal supporté). Ne juge que l'accessibilité HTTP, pas le contenu réel :
    un site qui nécessite du JS (ex. Mégalis) répondra 200 même si la page rendue diffère.
    """
    try:
        r = requests.head(url, headers=HEADERS, timeout=timeout, allow_redirects=True)
        if r.status_code in (403, 405) or r.status_code >= 500:
            r = requests.get(url, headers=HEADERS, timeout=timeout, allow_redirects=True, stream=True)
            r.close()
        return {"ok": r.status_code < 400, "status": r.status_code}
    except requests.exceptions.RequestException as e:
        return {"ok": False, "error": type(e).__name__}


def load_registry() -> dict:
    """Registre incrémental des propositions éditoriales (proposals/pending.json).

    Un seul fichier vivant — chaque item y entre une fois (statut "pending") et
    y reste jusqu'à décision de revue ("accepted"/"rejected"). Les items décidés
    sont conservés : c'est la mémoire qui empêche de re-proposer un rejet.
    """
    reg = load_json(REGISTRY_FILE)
    reg.setdefault("items", [])
    reg.setdefault("meta", {})
    return reg


def save_registry(reg: dict) -> None:
    reg.setdefault("meta", {})["last_updated"] = today()
    PROPOSALS_DIR.mkdir(parents=True, exist_ok=True)
    save_json(REGISTRY_FILE, reg)


def known_urls() -> set[str]:
    """URLs déjà connues : actus publiées + queue en attente + registre proposals.

    Le registre (pending/accepted/rejected confondus) est indispensable : sans lui,
    un item sorti de la queue par le select mais pas encore revu était re-scrapé,
    re-analysé par Claude et re-mailé chaque jour (constaté du 01 au 04/07/2026).
    """
    actus = load_json(DATA_DIR / "actus.json")
    queue = load_json(QUEUE_FILE)
    registry = load_registry()
    return (
        {a.get("source_url", "") for a in actus.get("actus", [])} |
        {i.get("source_url", "") for i in queue.get("items", [])} |
        {i.get("source_url", "") for i in registry.get("items", [])}
    )


def published_actus() -> list[tuple[str, str]]:
    """(titre, source_url) de chaque actu déjà publiée dans data/actus.json."""
    actus = load_json(DATA_DIR / "actus.json")
    return [(a.get("titre", ""), a.get("source_url", "")) for a in actus.get("actus", [])]


def is_already_published(titre: str, source_url: str = "", threshold: float = 0.6) -> bool:
    """True si un item très proche (URL identique ou titre similaire) est déjà dans actus.json.

    Les scrapers (Mairie/OF/Presse) reformulent souvent le même sujet avec des titres
    différents et des URLs différentes — la comparaison URL seule ne suffit pas.
    """
    for actu_titre, actu_url in published_actus():
        if source_url and actu_url and source_url == actu_url:
            return True
        ratio = difflib.SequenceMatcher(None, titre.lower(), actu_titre.lower()).ratio()
        if ratio >= threshold:
            return True
    return False


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
