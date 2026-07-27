#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Intègre une illustration générée dans le site : conversion webp + champ `image`.

Prend une image source (PNG/JPG, typiquement fraîchement téléchargée), l'aplatit
sur fond blanc si elle a un canal alpha, la redimensionne à la largeur de
référence du site (1456 px), l'encode en webp et renseigne le champ `image` du
dossier concerné dans `data/dossiers.json`.

Usage :
    python3 scripts/integre_illustration.py D15 sante ~/Downloads/image.png
    python3 scripts/integre_illustration.py D15 sante --derniere-image

Le second argument est le mot-clé du nom de fichier : `illus-d15-sante.webp`.
"""

from __future__ import annotations

import argparse
import collections
import json
import subprocess
import sys
from pathlib import Path

from PIL import Image

RACINE = Path(__file__).resolve().parent.parent
DOSSIERS_JSON = RACINE / "data" / "dossiers.json"
PUBLIC = RACINE / "public"
SOURCES = RACINE / "input" / "illustrations"
TELECHARGEMENTS = Path.home() / "Downloads"

LARGEUR_CIBLE = 1456
QUALITE_WEBP = 82
BASE_PATH = "/bruz-en-action"


def derniere_image_telechargee() -> Path:
    """Retourne l'image la plus récemment déposée dans ~/Downloads.

    Returns:
        Chemin de l'image la plus récente (png/jpg/jpeg/webp).

    Raises:
        FileNotFoundError: si aucune image n'est trouvée.
    """
    candidats = [
        f
        for f in TELECHARGEMENTS.iterdir()
        if f.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"}
    ]
    if not candidats:
        raise FileNotFoundError(f"Aucune image trouvée dans {TELECHARGEMENTS}")
    return max(candidats, key=lambda f: f.stat().st_mtime)


def convertir_en_webp(source: Path, destination: Path) -> tuple[int, int]:
    """Aplatit, redimensionne et encode une image source en webp.

    Args:
        source: Image d'origine (peut être en RGBA).
        destination: Fichier .webp à produire.

    Returns:
        Tuple (largeur, hauteur) de l'image produite.
    """
    img = Image.open(source)
    if img.mode == "RGBA":
        fond = Image.new("RGB", img.size, (255, 255, 255))
        fond.paste(img, mask=img.split()[3])
        img = fond
    else:
        img = img.convert("RGB")

    if img.size[0] != LARGEUR_CIBLE:
        hauteur = round(img.size[1] * LARGEUR_CIBLE / img.size[0])
        img = img.resize((LARGEUR_CIBLE, hauteur), Image.LANCZOS)

    tampon = destination.with_suffix(".tmp.png")
    img.save(tampon, "PNG")
    subprocess.run(
        ["cwebp", "-q", str(QUALITE_WEBP), str(tampon), "-o", str(destination)],
        check=True,
        capture_output=True,
    )
    tampon.unlink()
    return img.size


def renseigner_champ_image(id_dossier: str, chemin_web: str) -> None:
    """Ajoute ou met à jour le champ `image` d'un dossier dans dossiers.json.

    Le champ est inséré juste avant `mots_cles_ia` pour respecter l'ordre des
    clés des dossiers déjà illustrés.

    Args:
        id_dossier: Identifiant du dossier (ex. "D15").
        chemin_web: Chemin public préfixé du basePath.

    Raises:
        KeyError: si le dossier n'existe pas.
    """
    with open(DOSSIERS_JSON, encoding="utf-8") as f:
        data = json.load(f, object_pairs_hook=collections.OrderedDict)

    dossiers = data["dossiers"] if isinstance(data, dict) else data
    for i, dossier in enumerate(dossiers):
        if dossier["id"] != id_dossier:
            continue
        remanie: collections.OrderedDict = collections.OrderedDict()
        for cle, valeur in dossier.items():
            if cle == "mots_cles_ia" and "image" not in remanie:
                remanie["image"] = chemin_web
            if cle == "image":
                continue
            remanie[cle] = valeur
        remanie.setdefault("image", chemin_web)
        dossiers[i] = remanie
        break
    else:
        raise KeyError(f"Dossier {id_dossier} introuvable dans {DOSSIERS_JSON}")

    with open(DOSSIERS_JSON, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def main() -> int:
    """Point d'entrée CLI."""
    parseur = argparse.ArgumentParser(description=__doc__)
    parseur.add_argument("dossier", help="ID du dossier, ex. D15")
    parseur.add_argument("motcle", help="Mot-clé du nom de fichier, ex. sante")
    parseur.add_argument("source", nargs="?", help="Chemin de l'image source")
    parseur.add_argument(
        "--derniere-image",
        action="store_true",
        help="Utiliser l'image la plus récente de ~/Downloads",
    )
    args = parseur.parse_args()

    if args.derniere_image:
        source = derniere_image_telechargee()
    elif args.source:
        source = Path(args.source).expanduser()
    else:
        parseur.error("Fournir un chemin source ou --derniere-image")

    slug = args.dossier.lower()
    nom = f"illus-{slug}-{args.motcle}.webp"
    destination = PUBLIC / nom

    SOURCES.mkdir(parents=True, exist_ok=True)
    archive = SOURCES / f"{slug}-{args.motcle}-src{source.suffix.lower()}"
    archive.write_bytes(source.read_bytes())

    largeur, hauteur = convertir_en_webp(source, destination)
    chemin_web = f"{BASE_PATH}/{nom}"
    renseigner_champ_image(args.dossier, chemin_web)

    poids = destination.stat().st_size // 1024
    print(f"✅ {args.dossier} — {nom} ({largeur}×{hauteur}, {poids} Ko)")
    print(f"   source archivée : {archive.relative_to(RACINE)}")
    print(f"   dossiers.json   : image = {chemin_web}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
