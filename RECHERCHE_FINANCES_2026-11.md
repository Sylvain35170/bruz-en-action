# Recherche open data — finances de Bruz (D03 + /statistiques)

> Recherche du 2026-11-28. Reportée le jour même dans `data/bruz.json` (import : `scripts/fetch_finances.py`), D03, sa page « En profondeur » et la page /statistiques.
> Données brutes : OFGL (API `data.ofgl.fr`), DGFiP comptes individuels 2009-2025
> (`data.economie.gouv.fr`), Fonds vert (`data.gouv.fr`), Mégalis (DOB/ROB, AP/CP, arrêtés),
> rapport CRC Bretagne 2018.

---

## 1. Erreurs à corriger sur le site (priorité absolue)

| Affirmation actuelle (D03, `bruz.json`, /statistiques) | Ce que disent les sources | Sources |
|---|---|---|
| Dette fin 2023 : **1,63 M€ / 81 €/hab**, « dette quasi nulle » | **11,12 M€ / 568 €/hab** (11 emprunts, taux moyen 1,97 %) | OFGL, DGFiP, ROB 2025 p.15 |
| 2024 : « premier recours à l'emprunt », dette qui « bondit » | **Aucun emprunt depuis 2016** (sauf 75 k€ CAF à 0 % en 2020). La dette **baisse** chaque année depuis 2015 | ROB 2025 p.15, DOB 2024 |
| Série dette : 81 → 458 → 380 €/hab | 1 643 (2015) → 1 341 (2017) → 1 046 (2019) → 684 (2022) → 568 (2023) → 466 (2024) → 380 (2025) | DGFiP |
| g4 : Bruz 81 €/hab « très largement sous le 1er quartile » (médiane 888) | Bruz 2023 = 568 €/hab ; moyenne de la strate 801 €/hab (2023), 1 014 (2025) | DGFiP, OFGL |
| /statistiques : « Dette / recettes de fonctionnement : 3,91 % en 2023 » | Le 3,91 du CFU 2023 n'est pas un pourcentage. Encours / RRF 2023 ≈ 41 % | CFU 2023 |
| 4e groupe scolaire : AP de 9,5 M€ | **AP de 11 M€** (mise à jour de février 2024), 3,08 M€ réalisés fin 2025, CP de 6,23 M€ en 2026 et 1,70 M€ en 2027. Fin des travaux prévue en **décembre 2026** (le ROB 2025 annonçait une ouverture en septembre 2026) | Délib. 26-03-07 du 09/03/2026 |
| Rénovation de l'Hôtel de Ville : AP de 1,4 M€ | **AP de 2,1 M€** (mise à jour de mars 2025), puis **2,25 M€** le 18/05/2026 (+150 k€ : lots peu concurrentiels, assurance dommages-ouvrage oubliée) ; 1,14 M€ réalisés fin 2025 | Délib. 26-03-07 et 26-05-2 |

**Origine de l'erreur des 81 €/hab** : le tableau des ratios de la note du CFU 2023 (Ville de Bruz)
est lui-même incohérent. Le ratio « RRF/population = 2 071 € » suppose une population d'environ
13 200 habitants, et le « ratio d'endettement = 3,91 » ne correspond à aucune des définitions
possibles. Le site a repris ce tableau tel quel, puis « l'encours estimé » (1,63 M€ = 81 × 20 118)
en a été recalculé. Leçon : **ne jamais prendre un ratio de note synthétique sans le recouper avec
l'encours en euros** (OFGL/DGFiP).

---

## 2. Éléments absents du site

### 2.1 L'emprunt toxique (2007-2015) : il explique toute la trajectoire de la dette
- 13/03/2007 : prêt Dexia de **4,8 M€ sur 21 ans**, indexé sur la parité euro/franc suisse.
- 2015 : taux de **24,47 %**, soit 1 M€ d'intérêts par an sur un capital restant dû de 4 M€.
- CM spécial du 30/11/2015, **vote à l'unanimité** d'un protocole transactionnel avec Caffil, Sfil et Dexia.
- Indemnité de sortie : **9,7 M€**, dont **57,5 % pris en charge par le fonds de soutien de l'État**,
  versés sur 15 ans (**348 k€ par an** encaissés par la Ville, selon le ROB 2025).
- Conséquence : la dette passe de **19,9 M€ (2015) à 28,2 M€ (2016)**. Les investissements sont
  arrêtés en 2015 (moins de 1 M€), et les **taux d'impôts augmentent de 6,7 % en 2016**, une hausse
  « destinée à couvrir la sortie de l'emprunt toxique » selon la CRC (TFB 18,31 % → 19,54 %, TH 17,11 % → 18,26 %).
- ⚠️ À vérifier : dans l'OFGL, la créance « fonds de soutien » passe de 1,71 M€ (2024) à 0 (2025),
  alors qu'elle baissait de 0,43 M€ par an. Solde anticipé ou simple reclassement comptable ?
  La note du CFU 2025 devrait le dire.

### 2.2 Le rapport de la Chambre régionale des comptes (2018, exercices 2013 et suivants)
- Conclusion : « situation financière globale **saine** ».
- Potentiel financier : 983 €/hab contre 1 215 pour la strate, soit des « marges de manœuvre fiscales limitées ».
- Remarques : pas de PPI avant 2016, investissements présentés trop globalement au DOB, absence de
  contrôle de gestion. Emprunt de 1 M€ souscrit en 2016 « alors que la situation de sa trésorerie
  permettait manifestement de reporter ce dernier ».
- Le transfert de la voirie à Rennes Métropole en 2014 a coûté 233 k€ à la commune, une dérogation
  au CGI que la CRC qualifie d'« irrégulière ».
- Les rythmes scolaires ont représenté un surcoût de 142 k€ en 2016.
- URL : https://www.ccomptes.fr/sites/default/files/2018-04/BRR2018-05.pdf

### 2.3 Le nouvel emprunt de 2026
- Arrêté DG-2025-207 du 01/12/2025 (P. Salmon) : **4 M€ auprès du Crédit Mutuel de Bretagne**,
  sur 15 ans, au taux du Livret A + 0,45 %, amortissement linéaire, versement au plus tard le
  30/06/2026, pour financer le 4e groupe scolaire.
- C'est le premier vrai emprunt depuis 2016. Le BP 2026 inscrit 4,1 M€.
- Ordre de grandeur, à confirmer par le CFU 2026 : fin 2026, environ 7,6 − 1,7 + 4 ≈ **9,9 M€**,
  soit environ 490 €/hab. Ce chiffre reste inférieur à la moitié de la moyenne de la strate.

### 2.4 Le plan pluriannuel d'investissement 2025-2030 (DOB 2026, CM du 26/01/2026)
| k€ | 2025 | 2026 | 2027 | 2028 | 2029 | 2030 |
|---|---|---|---|---|---|---|
| AP (groupe scolaire + HDV) | 2 793 | 7 186 | 1 698 | | | |
| Dépenses récurrentes | 1 061 | 2 140 | 1 342 | 1 302 | 1 302 | 1 302 |
| Suite du PPI | 1 539 | 3 943 | 2 310 | 520 | 320 | 320 |
| Capacité autre | | 505 | 1 625 | 2 100 | 1 000 | |
| **Total** | **5 393** | **13 773** | **6 975** | **3 922** | **2 622** | **1 622** |

- Hypothèses : recettes +0,68 % par an et dépenses +3 % par an en 2025-2031 (effet ciseau annoncé),
  masse salariale +5,5 % en 2025, fonctionnement du groupe scolaire à partir de 2027,
  DMTO à 800 k€, DGF constante.
- La Ville annonce, dans le ROB 2025, une capacité de désendettement de 4 ans au plus en 2029 et une dette inférieure à 10 M€.
- Projets cités : foyer foot, SSI Vert Buisson, chaufferies, Grand Logis, ombrières de la place
  de Bretagne, cimetière Champ Niguel, schéma directeur immobilier et énergétique, cours
  d'école, équipements de Ker Lann (acquis en juillet 2024, 325 k€ de travaux).

### 2.5 Comparaisons (OFGL 2025, €/hab, budget principal)
| | Bruz | Strate nat. (n=341) | Communes de Rennes Métropole* |
|---|---|---|---|
| Recettes de fonctionnement | 1 184 | 1 594 | 1 300 |
| Dépenses de fonctionnement | 930 | 1 389 | 1 138 |
| dont personnel | 527 | 848 | 675 |
| Impôts locaux | 798 | 1 012 | 794 |
| DGF | 127 | 208 | 170 |
| Épargne brute | 254 | 205 | 162 |
| Dépenses d'équipement | 385 | 417 | 336 |
| Encours de dette | 380 | 1 014 | 974 |
\* agrégat pondéré, Rennes incluse (ce qui tire les moyennes vers Rennes).

À dire aux habitants : Bruz est une commune **pauvre en ressources** (potentiel financier de
1 186 €/hab contre 1 401 pour la strate en 2026, soit −15 %), qui **sollicite davantage ses
contribuables** (effort fiscal de 1,30 contre 1,18 pour la strate), **dépense peu** et a **peu
investi** de 2018 à 2024 (127 à 160 €/hab contre 330 à 394 pour la strate). Le rattrapage
commence en 2025.

### 2.6 Séries longues disponibles (DGFiP 2009-2025 et OFGL 2018-2025)
Population, recettes et dépenses de fonctionnement, personnel, impôts locaux, DGF, équipement,
emprunts, CAF brute et nette, encours, annuité, fonds de roulement, taux TH/TFB/TFNB
(**les moyennes de la strate sont fournies pour chaque année**). Il y a de quoi faire un graphique
« dette 2009-2025 » et « équipement par habitant comparé à la strate ».

Le **trou de g1 (fiscalité 2015-2021)** peut se combler avec la série DGFiP `impo1`
(impôts locaux) : 7,9 M€ (2015), 8,5 (2016), 8,8 (2017), 9,0 (2018), 9,3 (2019),
9,6 (2020), 11,3 (2022). Le périmètre diffère du chapitre 731 : il faudrait soit changer
l'indicateur de g1 pour une série homogène 2009-2025, soit garder le 731 et laisser le trou.

### 2.7 Fiscalité (OFGL base fiscale)
- Taux TFB communal : 18,31 % (2009-2015) → 19,54 % (2016) → 41,84 % (2021, part
  départementale intégrée) → **45,34 % (2024, +3,5 points)**, maintenu en 2025 et 2026.
  TFNB : 48,19 %. THRS : 18,26 %.
- Bases TFB : 16,6 M€ (2012) → 26,2 M€ (2025), soit +58 %. Le produit est porté autant par la
  croissance des bases que par les taux.
- THRS : base volatile (0,99 → 1,95 → 1,43 → 0,48 M€ de 2022 à 2026), avec une majoration
  votée (88 k€ en 2025). Délibération du 27/09/2024 sur l'exonération des fondations et associations.
- DMTO : 944 k€ (2023) → 770 k€ (2024), prévus à 750-800 k€.

### 2.8 Dotations de l'État (OFGL)
- DGF : 2,32 M€ (2021) → 2,55 M€ (2026), dont dotation forfaitaire 1,59 M€, **DSU 660 k€**
  et DNP 303 k€.
- L'attribution de compensation de Rennes Métropole est **négative (−2 570 €)** : c'est la
  commune qui verse, conséquence du transfert de la voirie. La DSC est en baisse (−18 k€ en 2025).
- La perte du Contrat départemental de territoire représente 78 k€ par an en moins.

### 2.9 Subventions Fonds vert (data.gouv.fr)
- 2024 : rénovation énergétique de l'Hôtel de Ville, **500 000 €**.
- 2025 : ZAC multisites (recyclage de friches, secteur Gare), **600 000 €**.
- 2025 : Atlas de la biodiversité intercommunal (Bruz, Laillé, Pont-Péan, Orgères), **58 369 €**.
- 2025 : place de Bretagne (bénéficiaire : Rennes Métropole), 33 671 €.
- Mégalis : subventions ADEME Fonds chaleur pour le 4e groupe scolaire (10/2024) et la chaufferie du GS Vert Buisson (05/2023).

### 2.10 Budgets annexes et satellites
- Restauration scolaire : environ 1,1 M€ de recettes par an, sans dette. ZA Éperon : marginale.
  Parc grandes écoles Ker Lann : clos en 2019.
- SPL « Nouvel objectif aménagement » (ex-SEMBA), Bruz majoritaire : sa dissolution a produit
  l'exceptionnel de 4,8 M€ de 2023 (déjà mentionné sur le site).
- Effectifs : 234 ETP en 2024, stables (238 en 2021).

---

## 3. Pistes non explorées
- **Balances comptables DGFiP** (compte par compte, data.economie.gouv.fr) : subventions aux
  associations, contributions aux syndicats (piscine de la Conterie, pour D06).
- **Délibération des subventions aux associations 2026** (Mégalis, 597 lignes) : liste complète
  des bénéficiaires, téléchargée mais pas lue.
- **Rapport de la CRC sur Rennes Métropole** (communiqué en CM le 19/12/2024, sur Mégalis) :
  pacte financier, DSC, fonds de concours.
- **DM n°2 2026** (21/09/2026) : téléchargée mais pas lue.
- Note du CFU 2025 : expliquer le passage à 0 de la créance « fonds de soutien ».
