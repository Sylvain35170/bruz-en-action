#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Repère dans les bulletins municipaux les initiatives à mettre en « coup de pouce ».

Source : les PDF Semaine à Bruz / Bruz Mag déjà collectés par `agent_bruz_mag`
dans `data/bulletins.json`. C'est là qu'atterrit l'information cherchée : la
mairie renvoie explicitement les nouveaux commerçants vers ces bulletins pour
communiquer, et la rubrique « LES ASSOCIATIONS » y concentre les appels à dons
et à bénévoles. Les autres sources envisagées sont inexploitables : HelloAsso
répond 403 comme les autres plateformes anti-bot du projet, France Bénévolat ne
liste aucune mission sur Bruz, et l'annuaire municipal n'est qu'une liste de
contacts sans expression de besoin.

⚠️ Extraction en colonnes obligatoire. Ces bulletins sont mis en page sur 5 à 6
colonnes ; un `extract_text()` linéaire entrelace les colonnes voisines et
recoller ces fragments attribuerait à une association le téléphone de sa
voisine. `blocs_par_colonne()` découpe la page avant d'extraire.

L'agent ne publie jamais directement : il dépose des candidats dans
`scripts/proposals/coup_de_pouce_pending.json` (gitignoré). Mettre une
initiative en avant est un choix éditorial de l'association, pas une donnée
factuelle comme une délibération — la validation humaine reste obligatoire.

Usage :
    python3 scripts/agents/agent_coup_de_pouce.py           # analyse + propose
    python3 scripts/agents/agent_coup_de_pouce.py --list    # relit les candidats
"""

from __future__ import annotations

import argparse
import re
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from utils import DATA_DIR, fetch, load_json, log, save_json, stable_id, today  # noqa: E402

try:
    import pdfplumber
except ImportError:
    log("pdfplumber manquant — pip install pdfplumber", "ERR")
    raise

PROPOSALS = Path(__file__).parent.parent / "proposals" / "coup_de_pouce_pending.json"
COUP_DE_POUCE = DATA_DIR / "coup_de_pouce.json"
BULLETINS = DATA_DIR / "bulletins.json"

# Détection des colonnes par les gouttières (bandes verticales sans aucun mot).
# Un découpage en N bandes fixes ne marche pas : sans recouvrement il tronque
# les emails en bord de bande, et avec recouvrement il fait déborder un
# fragment de la colonne voisine sur la même ligne — « EMMAÜS BRUZ » devenait
# « EMMAÜS BRUZ Grat », cessait d'être reconnu comme intertitre, et le mail
# d'Emmaüs se retrouvait attribué à l'association précédente.
PAS_BIN_PT = 2        # granularité de l'analyse d'occupation horizontale
GOUTTIERE_MIN_PT = 8  # largeur minimale d'un blanc pour valoir séparation

# Un signal seul ne suffit pas à qualifier un bloc : « ouverture » apparaît dans
# « horaires d'ouverture ». On exige une formulation de besoin explicite.
SIGNAUX = {
    "dons": [
        r"\brecherche\b.{0,80}\b(?:mobilier|électroménager|equipements|équipements|matériel)",
        r"\b(?:déposez|dépôt de|collecte de)\s+(?:vos\s+)?dons\b",
        r"\bappel aux? dons\b",
    ],
    "bénévoles": [
        r"\b(?:recherche|cherche|recrute)\b.{0,60}\bbénévoles?\b",
        r"\bappel à bénévoles?\b",
        r"\bbénévoles? recherchés?\b",
    ],
    "clients": [
        r"\b(?:nouveau|nouvelle)\s+(?:commerce|boutique|enseigne|restaurant)\b",
        r"\bvient de s'installer\b",
        r"\bouvre ses portes\b",
    ],
    "visibilité": [
        r"\bnouvelle section\b",
        r"\bnouvelle association\b",
        r"\binscriptions? ouvertes?\b",
    ],
}

RE_MAIL = re.compile(r"[\w.\-]+@[\w.\-]+\.[a-z]{2,4}")
RE_TEL = re.compile(r"0[1-9](?:[ .]?\d{2}){4}")
RE_SITE = re.compile(r"(?:https?://|www\.)[\w.\-/]+|\b[\w\-]{3,}\.(?:fr|bzh|com|org)\b")

# En-têtes de rubrique du bulletin : ce sont des titres en majuscules comme les
# noms d'association, mais ils n'en sont pas. Sans cette liste, « INFOS
# PRATIQUES » remonte comme candidat avec le contenu du premier bloc qui suit.
INTERTITRES_GENERIQUES = {
    "les associations", "infos pratiques", "à voir, à faire", "a voir, a faire",
    "en bref", "suivez-nous sur les réseaux", "la semaine", "sommaire",
    "vie municipale", "grand angle", "en mouvement", "agenda",
}


def est_intertitre(ligne: str) -> bool:
    """Vrai si la ligne est un intertitre (nom d'association, titre de rubrique).

    Un test sur `ligne == ligne.upper()` est bien plus robuste qu'une classe de
    caractères explicite : la première version manquait `EMMAÜS BRUZ` faute d'un
    `Ü` dans la classe, si bien que ce bloc était absorbé par le précédent et
    que le mail d'Emmaüs se retrouvait attribué à l'association d'à côté.

    Args:
        ligne: Ligne de texte déjà nettoyée.

    Returns:
        True si la ligne se comporte comme un intertitre.
    """
    if not (4 <= len(ligne) <= 60):
        return False
    lettres = [c for c in ligne if c.isalpha()]
    if len(lettres) < 3:
        return False
    return all(c.isupper() for c in lettres)


def detecter_colonnes(page) -> list[tuple[float, float]]:
    """Repère les colonnes d'une page via les gouttières verticales vides.

    Args:
        page: Page pdfplumber.

    Returns:
        Liste de couples (x0, x1), un par colonne détectée.
    """
    mots = page.extract_words() or []
    if not mots:
        return [(0, page.width)]

    n_bins = int(page.width / PAS_BIN_PT) + 1
    occupe = [False] * n_bins
    for mot in mots:
        debut = max(0, int(mot["x0"] / PAS_BIN_PT))
        fin = min(n_bins - 1, int(mot["x1"] / PAS_BIN_PT))
        for b in range(debut, fin + 1):
            occupe[b] = True

    colonnes: list[tuple[float, float]] = []
    debut_col = None
    vides = 0
    for i, plein in enumerate(occupe):
        if plein:
            if debut_col is None:
                debut_col = i
            vides = 0
        else:
            if debut_col is None:
                continue
            vides += 1
            if vides * PAS_BIN_PT >= GOUTTIERE_MIN_PT:
                colonnes.append((debut_col * PAS_BIN_PT, (i - vides + 1) * PAS_BIN_PT))
                debut_col = None
                vides = 0
    if debut_col is not None:
        colonnes.append((debut_col * PAS_BIN_PT, page.width))

    return colonnes or [(0, page.width)]


def blocs_par_colonne(page) -> list[str]:
    """Retourne le texte de chaque colonne réelle de la page.

    Le découpage suit les gouttières détectées : aucune coupe ne traverse un
    mot, et aucun fragment de colonne voisine ne vient polluer une ligne.

    Args:
        page: Page pdfplumber.

    Returns:
        Liste de textes, un par colonne.
    """
    textes = []
    for x0, x1 in detecter_colonnes(page):
        if x1 - x0 < 40:  # filet trop étroit pour porter du texte utile
            continue
        textes.append(page.crop((x0, 0, min(x1 + 2, page.width), page.height)).extract_text() or "")
    return textes


def decouper_en_blocs(texte_colonne: str) -> list[tuple[str, str]]:
    """Sépare une colonne en (intertitre, corps) sur les lignes en majuscules.

    Args:
        texte_colonne: Texte brut d'une bande verticale.

    Returns:
        Liste de tuples (titre, corps).
    """
    blocs: list[tuple[list[str], list[str]]] = []
    for ligne in texte_colonne.splitlines():
        nettoyee = ligne.strip()
        if not nettoyee:
            continue
        if est_intertitre(nettoyee):
            # Un nom d'association tient souvent sur deux lignes (« SECOURS
            # CATHOLIQUE – » / « RIVES DE LA SEICHE ») : tant qu'aucun corps
            # n'a commencé, on continue de compléter le titre courant.
            if blocs and not blocs[-1][1]:
                blocs[-1][0].append(nettoyee)
            else:
                blocs.append(([nettoyee], []))
        elif blocs:
            blocs[-1][1].append(nettoyee)

    resultat = []
    for titre_lignes, corps in blocs:
        if not corps:
            continue
        # Retirer les en-têtes de rubrique du titre fusionné : « LES
        # ASSOCIATIONS » précède immédiatement le premier nom d'association et
        # se retrouverait sinon collé devant lui.
        utiles = [l for l in titre_lignes if l.lower().strip(" –-") not in INTERTITRES_GENERIQUES]
        if not utiles:
            continue
        resultat.append((" ".join(utiles), " ".join(corps)))
    return resultat


def qualifier(corps: str) -> str | None:
    """Retourne le besoin détecté dans un corps de bloc, ou None.

    Args:
        corps: Texte du bloc.

    Returns:
        Le besoin (`dons`, `bénévoles`, `clients`, `visibilité`) ou None.
    """
    for besoin, motifs in SIGNAUX.items():
        for motif in motifs:
            if re.search(motif, corps, re.IGNORECASE):
                return besoin
    return None


def extraire_contacts(corps: str) -> dict:
    """Relève mail, téléphone et site DANS LE MÊME BLOC — jamais ailleurs.

    Args:
        corps: Texte du bloc (donc d'une seule colonne).

    Returns:
        Dict avec les clés `contact`, `telephone`, `lien` (valeurs ou None).
    """
    mail = RE_MAIL.search(corps)
    tel = RE_TEL.search(corps)

    # Chercher le site APRÈS avoir retiré les emails du texte : sans ça, le
    # domaine d'une adresse est pris pour un site (secath.seiche@orange.fr
    # donnait « orange.fr », aabruz35@gmail.com donnait « gmail.com »).
    sans_mails = RE_MAIL.sub(" ", corps)
    site = None
    for candidat in RE_SITE.findall(sans_mails):
        if "ville-bruz.fr" in candidat:
            continue
        site = candidat if candidat.startswith("http") else f"https://{candidat.removeprefix('www.')}"
        break
    return {
        "contact": mail.group(0) if mail else None,
        "telephone": tel.group(0) if tel else None,
        "lien": site,
    }


def derniers_bulletins() -> list[dict]:
    """Retourne le bulletin le plus récent de CHAQUE type.

    Les deux publications ne portent pas la même matière : la rubrique « LES
    ASSOCIATIONS », où se trouvent les appels à dons et à bénévoles, est propre
    à la Semaine à Bruz. Ne regarder que le plus récent tous types confondus
    ferait manquer cette rubrique dès qu'un Bruz Mag paraît après.
    """
    bulletins = load_json(BULLETINS).get("bulletins", [])
    avec_pdf = [b for b in bulletins if (b.get("sources") or [{}])[0].get("url")]
    if not avec_pdf:
        log("Aucun bulletin avec URL PDF dans bulletins.json", "WARN")
        return []

    par_type: dict[str, dict] = {}
    for bulletin in avec_pdf:
        # Repli sur le préfixe d'id (BM- / SAB-) si le champ `type` manque.
        cle = bulletin.get("type") or bulletin.get("id", "").split("-")[0]
        connu = par_type.get(cle)
        if not connu or (bulletin.get("date") or "") > (connu.get("date") or ""):
            par_type[cle] = bulletin
    return list(par_type.values())


def cle_titre(titre: str) -> str:
    """Clé de comparaison d'un titre, insensible à la casse et à la ponctuation.

    Comparer les titres bruts ne suffit pas : le bulletin écrit « SECOURS
    CATHOLIQUE – RIVES DE LA SEICHE » avec un tiret demi-cadratin là où la
    fiche publiée utilise un tiret cadratin, et l'item était reproposé à chaque
    run malgré une publication existante.

    Args:
        titre: Titre brut.

    Returns:
        Chaîne réduite aux caractères alphanumériques, en minuscules.
    """
    return "".join(c for c in titre.lower() if c.isalnum())[:40]


def deja_connus() -> set[str]:
    """Titres déjà publiés ou déjà proposés — pour ne rien reproposer.

    Reprend la leçon du registre `pending.json` : sans mémoire des items écartés,
    chaque run les reproposerait indéfiniment.
    """
    connus = set()
    for fichier in (COUP_DE_POUCE, PROPOSALS):
        for item in load_json(fichier).get("items", []):
            connus.add(cle_titre(item.get("titre", "")))
    return connus


def run() -> bool:
    """Analyse le dernier bulletin et propose des candidats coup de pouce.

    Returns:
        True si au moins un nouveau candidat a été déposé.
    """
    bulletins = derniers_bulletins()
    if not bulletins:
        return False

    candidats = []
    connus = deja_connus()

    for bulletin in bulletins:
        source = bulletin["sources"][0]
        log(f"Analyse de {bulletin.get('titre') or bulletin.get('id')}…")

        reponse = fetch(source["url"], timeout=60)
        if not reponse or len(reponse.content) < 10_000:
            log(f"PDF non récupéré : {source['url']}", "WARN")
            continue

        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            tmp.write(reponse.content)
            chemin = tmp.name

        try:
            with pdfplumber.open(chemin) as pdf:
                for page in pdf.pages:
                    for colonne in blocs_par_colonne(page):
                        for titre, corps in decouper_en_blocs(colonne):
                            besoin = qualifier(corps)
                            if not besoin:
                                continue
                            cle = cle_titre(titre)
                            if cle in connus:
                                continue
                            connus.add(cle)
                            candidats.append({
                                "id": stable_id("cdp", source["url"] + "#" + titre),
                                "titre": titre.title(),
                                "chapeau": corps[:400],
                                "besoin": besoin,
                                "type": "commerce" if besoin == "clients" else "association",
                                **extraire_contacts(corps),
                                "date_ajout": today(),
                                "date_fin": None,
                                "active": True,
                                "source": {"label": bulletin.get("titre") or bulletin["id"], "url": source["url"]},
                                "statut": "à_valider",
                            })
        finally:
            Path(chemin).unlink(missing_ok=True)

    if not candidats:
        log("Coup de pouce : aucun nouveau candidat.", "INFO")
        return False

    registre = load_json(PROPOSALS)
    registre.setdefault("items", []).extend(candidats)
    PROPOSALS.parent.mkdir(parents=True, exist_ok=True)
    save_json(PROPOSALS, registre)

    log(f"Coup de pouce : {len(candidats)} candidat(s) à valider → {PROPOSALS.name}", "OK")
    for c in candidats:
        log(f"  • [{c['besoin']}] {c['titre']} — {c['contact'] or c['telephone'] or 'pas de contact'}")
    return True


def lister() -> None:
    """Affiche les candidats en attente de validation."""
    items = load_json(PROPOSALS).get("items", [])
    if not items:
        log("Aucun candidat coup de pouce en attente.", "INFO")
        return
    log(f"{len(items)} candidat(s) en attente :", "INFO")
    for c in items:
        print(f"\n  [{c['id']}] {c['besoin']} · {c['type']}")
        print(f"      {c['titre']}")
        print(f"      {c['chapeau'][:200]}")
        print(f"      contact={c.get('contact')} tel={c.get('telephone')} lien={c.get('lien')}")


if __name__ == "__main__":
    parseur = argparse.ArgumentParser(description=__doc__)
    parseur.add_argument("--list", action="store_true", help="lister les candidats en attente")
    args = parseur.parse_args()
    lister() if args.list else run()
