# Prompts illustrations — dossiers sans image

> Généré le 2026-07-27. Objectif : combler les 9 dossiers sans illustration
> (D05, D12, D15, D16, D20, D21, D22, D23, D24) dans le style des 10 existantes.

---

## Style de référence (extrait des illustrations existantes)

Analyse de `illus-d01-mobilite.webp`, `illus-d03-finances.webp`, `illus-d13-canicule.webp` :

| Paramètre | Valeur observée |
|-----------|-----------------|
| Technique | Flat vector illustration, aplats purs, **aucun dégradé**, pas d'ombres portées réalistes |
| Fond | Blanc pur, avec parfois une forme organique bleu très clair (`#DCE6F4`) en toile de fond |
| Palette | Navy `#0E2F62` · bleu moyen `#2E5490` · bleu clair `#7FA3D4` · bleu pâle `#C5D6EC` · or `#E8A33D` · ocre `#D98C2B` · blanc |
| Ratio d'accent | Bleus = 80 % de la surface, or/orange = 15 %, blanc = 5 % |
| Personnages | Silhouettes simplifiées, **sans traits de visage détaillés**, diversité d'âges et de morphologies, postures naturelles |
| Architecture | Codes bretons : toits d'ardoise sombres, murs blancs, clocher, granit |
| Composition | Bannière horizontale, scène latérale lisible de gauche à droite |
| Texte | **Aucun texte, aucun chiffre, aucun logo dans l'image** |
| Format | **1456 × 720 px** (ratio 2:1) — 1376 × 768 accepté (les deux existent) |

### Bloc de style à coller à la fin de chaque prompt

```
Flat vector editorial illustration, clean geometric shapes, solid flat colors,
no gradients, no shadows, no texture. Strict color palette: deep navy blue
#0E2F62, medium blue #2E5490, light blue #7FA3D4, pale blue #C5D6EC, warm gold
#E8A33D, ochre #D98C2B, white. Blues dominate (~80%), gold used only as accent.
Pure white background. Simplified human silhouettes without detailed facial
features, diverse ages and body types. Brittany French architecture cues: dark
slate roofs, white rendered walls, granite. Wide horizontal banner composition.
Absolutely no text, no numbers, no letters, no logos, no watermark.
--ar 2:1 --style raw
```

> **DALL-E 3** : retirer les flags `--ar`, demander « wide horizontal banner, 1792×1024 »
> et insister sur « no text of any kind » (DALL-E a tendance à en glisser).
> **Midjourney** : garder `--ar 2:1 --style raw`, ajouter `--no text, words, letters, watermark`.

---

## Les 9 prompts

### D05 — Bruz en carte : quartiers, chantiers et petits projets urbains
`public/illus-d05-carte.webp`

```
An isometric stylized city map of a small French town seen from above at a
slight angle. Distinct neighborhood blocks separated by tree-lined streets, a
river curving through, a few construction cranes and roadwork zones marked with
small gold cones and barriers. Map pin markers hovering above three different
districts. A dashed route line crossing the map from one edge to the other.
Church spire and a town hall as landmarks. No labels on the map.
```
*Intention : la page `/carte`, le PLUi, les chantiers portés par Rennes Métropole.*

---

### D12 — City stade de Siméon Beliard
`public/illus-d12-citystade.webp`

```
An empty outdoor multi-sport court at the edge of a residential street: a
rectangular fenced pitch with metal mesh barriers, goal frames and painted
ground markings, but nobody playing. Four suburban houses with slate roofs and
small gardens stand very close on the right, separated only by a narrow strip of
lawn and a hedge. Concentric gold arcs radiate from the court toward the houses,
suggesting noise travelling. A few teenagers stand outside the fence with a ball,
waiting. Late afternoon, calm and tense.
```
*Intention : équipement mal implanté (20 m des riverains, 70-80 dB), démonté en 2026,
reconstruction attendue. Le terrain vide + les ados qui attendent = le sujet du dossier.*

---

### D15 — Offre de soins à Bruz
`public/illus-d15-sante.webp`

```
A general practitioner's waiting room and medical office in cross-section, seen
from the side. On the left, a queue of diverse patients waiting — an elderly
person with a cane, a parent with a small child, a young adult. On the right, a
single doctor at a desk with a stethoscope, clearly outnumbered. Behind them
through a window, a town skyline in the far distance suggesting specialists are
elsewhere. A gold cross medical symbol on the building facade.
```
*Intention : ~125 médecins/100 000 hab (sous la moyenne nationale), zéro spécialiste
sur place, tout à Rennes à 8-15 km.*

---

### D16 — Économie locale : commerce, artisanat et zones d'activité
`public/illus-d16-economie.webp`

```
A lively French open-air weekly market in the foreground: rows of stalls with
striped canopies selling vegetables, flowers and bread, shoppers with baskets
moving between them. In the middle ground, a row of small shopfronts with awnings.
In the background on the right, a business park of low rectangular warehouses and
workshops with trucks and a delivery van. Trees separating the two worlds.
```
*Intention : marché du vendredi (130 commerçants depuis 1960), commerce de proximité,
3 zones d'activité (Ker Lann, Champ Niguel, Haie Gautrais).*

---

### D20 — Ker Lann : campus et logement étudiant
`public/illus-d20-kerlann.webp`

```
A modern university campus scene: two or three contemporary teaching buildings
with large glass facades and flat roofs, wide lawns and young trees between them,
students walking with backpacks, sitting on benches with laptops, cycling on a
campus path. On the right edge, a compact student residence building with rows of
identical small balconies. A bus stop shelter in the foreground. Open, spacious,
lots of sky.
```
*Intention : 165 ha, ~6 000 étudiants, 17 établissements, 7 résidences toutes privées
(aucun CROUS), campus géré par Rennes Métropole.*

---

### D21 — Culture : Grand Logis, programmation et projets d'ampleur
`public/illus-d21-culture.webp`

```
The interior of a small municipal theatre seen from the back of the auditorium:
rows of tiered seats partly filled with a diverse audience seen from behind, a
lit stage with open curtains, stage lighting rigs above casting warm gold beams
onto three performers in mid-motion. Warm gold light on the stage contrasting
with the deep navy of the darkened hall.
```
*Intention : Grand Logis (400 places + salle Molière 50 places), ~30 spectacles/an,
réflexion sur un événement d'ampleur et l'évolution de la jauge.*

---

### D22 — Friche Bonna Sabla
`public/illus-d22-friche.webp`

```
A disused industrial concrete factory seen in wide shot: a long low workshop
building with a sawtooth roof, silent overhead gantry crane, stacks of large
precast concrete pipes and drainage elements lying unused in the yard, a chain
across the closed entrance gate. Weeds and wild grass reclaiming the cracked
concrete apron in the foreground. Empty parking spaces. Grey-blue overcast
atmosphere, one small patch of gold light on the horizon.
```
*Intention : usine fermée printemps 2026 (Vicat/Consolis), ~30 salariés licenciés,
9 ha de foncier en vente, reconversion non actée.
⚠️ Ne pas illustrer de projet de reconversion — rien n'est décidé (piège Archyde 17/07).*

---

### D23 — Démocratie locale : le pilier 7
`public/illus-d23-democratie.webp`

```
A neighborhood public meeting in a plain community hall: a diverse group of
residents seated in a semicircle on folding chairs, several with raised hands,
facing two elected officials standing near a blank flip chart. Around the main
scene, floating in the white space, four simple flat icons in gold: a speech
bubble, a group of young figures, a group of elderly figures, and an open
document. The icons are drawn as light outlines, deliberately unfinished
compared to the solid meeting scene.
```
*Intention : 5 engagements du pilier 7 (élus référents, réunions de quartier, CMJ,
Conseil des sages, CR des décisions) — aucun mis en œuvre. Les icônes en contour
non rempli = les promesses encore à l'état de projet.*

---

### D24 — Les équipements sportifs de Bruz
`public/illus-d24-sports.webp`

```
A cutaway view of a municipal sports complex showing three activity zones side by
side: an indoor gymnasium with a polished wooden floor and basketball hoops where
people play, a gymnastics room with mats and a balance beam, and an outdoor
synthetic pitch with goals and floodlights. Diverse athletes of all ages in each
zone — children, teenagers, adults, a wheelchair basketball player. Simple flat
roof lines separating the three spaces.
```
*Intention : une vingtaine d'équipements communaux (salles Mauduit, Besson, Tabarly,
Charles Joly, complexe Cosec-Siméon Beliard, gymnase Brossolette...).*

---

## Intégration une fois les images générées

1. Déposer les fichiers générés (PNG/JPG) dans `input/illustrations/`
2. Conversion + redimensionnement :
   ```bash
   cd ~/Documents/dev/bruz-en-action
   cwebp -q 82 -resize 1456 0 input/illustrations/d05.png -o public/illus-d05-carte.webp
   ```
   (répéter par dossier — ou me redonner la main, je scripte la passe complète)
3. Renseigner le champ `image` de chaque dossier dans `data/dossiers.json` :
   `"image": "/bruz-en-action/illus-d05-carte.webp"` — **le basePath est obligatoire**
4. `python3 scripts/validate_data.py` puis `npm run build`
5. Commit `data/` + `public/`, push, puis `gh run list` pour vérifier le déploiement
   (un commit réussi ne prouve pas que le site est déployé — piège du 26/07)
