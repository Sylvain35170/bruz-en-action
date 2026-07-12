# Audit du site Bruz en Action — fond & forme

> Analyse du 2026-07-11 (code local + site déployé). Document de travail : chaque
> suggestion est numérotée pour qu'on les passe en revue une par une. Rien n'est
> appliqué — on décide ensemble ce qui part au BACKLOG.md.
>
> Légende effort : ⚡ < 1h · 🔨 une session · 🏗️ plusieurs sessions

---

## A. Le fond — contenu & éditorial

### A1. Le tableau de bord promesses est le point faible du site 🔨
**Constat.** 49 promesses sur 50 sont à `non_commence`, la homepage et /promesses
affichent « 2 % tenus » en gros. Or des décisions déjà documentées ailleurs sur le
site (D04 maintien du taux TFB, D13 activation plan canicule, budget 2026 voté…)
ne sont pas répercutées. C'est la promesse centrale du site (« suivi des
engagements ») et c'est sa partie la plus datée — un visiteur lit « 2 % » comme un
jugement sévère alors que c'est un artefact de non-mise-à-jour.
**Suggestion.** L'audit complet est gelé en attendant la discussion avec le maire
(décision 2026-07-05) — OK. Mais en attendant, deux mesures conservatrices :
(a) passer en `en_cours` les promesses dont une décision actée est déjà tracée
dans un dossier du site (fait vérifiable, pas un jugement) ; (b) afficher un
bandeau honnête sur /promesses : « Statuts en cours de consolidation — premier
bilan complet à l'automne 2026 ».

### A2. Incohérence de mandat : 2026-2031 vs 2026-2032 ⚡
**Constat.** `layout.tsx`, /promesses (×3), /conseils et la homepage (l. 365)
disent « 2026-2031 » ; /programme, /elus et la homepage (l. 503) disent
« 2026-2032 ». `bruz.json` (gouvernance) dit 2026-2032 — c'est le bon (mandat de 6 ans).
**Suggestion.** Unifier sur **2026-2032** partout (7 occurrences à corriger).

### A3. 73 actus sur 107 sont invisibles (dates null) 🔨
**Constat.** Les actus presse Google News arrivent sans date exploitable
(`date: null`, conforme au piège « ne jamais deviner une date »). Mais la homepage
filtre sur date ISO → ces 73 items validés en revue ne s'affichent **nulle part**.
Il n'existe d'ailleurs aucune page « Actualités » listant les 107 actus.
**Suggestion.** (a) Au moment de la revue (`review_proposals.py --accept`),
renseigner une date : celle de l'article si lisible, sinon la date d'acceptation
(champ distinct `date_publication_estimee` si on veut rester rigoureux).
(b) Créer une page **/actualites** (archive filtrable par type/dossier) — la
veille tourne tous les jours, autant montrer le stock.

### A4. Le lien actu → dossier n'existe que dans un sens ⚡
**Constat.** Aucune des 107 actus n'a de `dossier_id`, alors que le rattachement
existe (agent_dossiers duplique l'info dans `actus_recentes` des dossiers).
**Suggestion.** Renseigner `dossier_id` à l'acceptation (l'agent_dossiers sait déjà
matcher) → permet le filtre par dossier sur la future page /actualites et des liens
croisés propres.

### A5. Qualité inégale des dossiers — définir une « fiche minimum » 🔨
**Constat.** D01–D13 sont riches ; D15/D16/D21 n'ont **aucune décision**, D16 zéro
actu, D21 n'a que 2 items « ce qu'on sait », D20 dort depuis le 19 mai, 6 dossiers
sans illustration (déjà au backlog).
**Suggestion.** Définir un seuil de publication : image + ≥ 4 faits sourcés +
décisions renseignées **ou** mention explicite « Aucune décision recensée à ce
jour » (le silence actuel ressemble à un oubli). Afficher un badge « Dossier en
construction » sur ceux qui sont sous le seuil, plutôt que de les présenter comme
aboutis.

### A6. Mentions légales & RGPD absentes ⚡→🔨
**Constat.** Pas de page mentions légales (directeur de publication, hébergeur) —
obligation LCEN pour un site d'association. Et `globals.css` importe Public Sans
et JetBrains Mono depuis Google Fonts : transfert d'IP vers Google sans
consentement, position CNIL défavorable. Pour une asso qui joue la carte
transparence, c'est un angle d'attaque facile.
**Suggestion.** (a) Page /mentions-legales (asso, bureau, hébergeur GitHub Pages,
contact) — le contenu existe déjà dans `meta.json`. (b) Self-hoster les polices
(voir B5, même chantier).

### A7. Stats codées en dur dans les pages ⚡
**Constat.** /conseils affiche « Femmes 17/33 » et « Âge moyen 57 ans » en dur dans
le TSX ; /metro embarque ses décisions en dur ; /programme embarque tout le
programme en dur. La règle du projet (piège 2026-07-05) : jamais de stat en dur,
tout vient des JSON.
**Suggestion.** Déplacer vers `elus.json` (composition), `metropole.json` et un
nouveau `data/programme.json`. Bonus : le programme devient réutilisable pour
croiser promesses ↔ piliers.

### A8. Agenda citoyen : section qui va se vider toute seule 🔨
**Constat.** 6 événements saisis à la main dans `evenements.json`, dont 2 déjà
passés. Aucun agent ne scrape l'agenda mairie → dans un mois la section homepage
sera vide et le site aura l'air à l'abandon.
**Suggestion.** Soit un `agent_agenda` (l'agenda ville-bruz.fr est structuré), soit
replier la section quand il reste < 2 événements futurs (avec le lien mairie en
fallback). Option a + b idéalement.

### A9. Deux sections « Qui sommes-nous ? » sur la homepage ⚡
**Constat.** La homepage a une grande section « Qui sommes-nous ? » (avec
illustration) puis une mini du même nom plus bas (« On suit / On écoute / On
transmet »). Redondance, et deux messages légèrement différents.
**Suggestion.** Fusionner : garder la grande, y intégrer les 3 cartes
« On suit / On écoute / On transmet », supprimer la mini.

### A10. Une phrase de posture ambiguë sur /interagir ⚡
**Constat.** « Si un élu nous transmet une information, on considère qu'elle a été
validée par le maire avant de nous parvenir. » — la formulation peut se lire comme
« nous relayons la parole officielle sans vérifier », ce qui contredit la carte
« Les faits d'abord » juste au-dessus.
**Suggestion.** Reformuler, p. ex. : « Une information transmise par un élu est
traitée comme une déclaration officielle de la majorité — elle est citée comme
telle, et vérifiée comme le reste. »

---

## B. La forme — design, UX, technique

### B1. 🐛 Navigation invisible sur les pages /articles ⚡
**Constat.** `app/articles/[id]/page.tsx` rend `<NavBar />` sans le header bleu
nuit : liens blancs sur fond `#f8fafc` → nav illisible (vérifié dans le build).
**Suggestion.** Envelopper NavBar dans le même header gradient que les autres
pages (3 lignes).

### B2. 🐛 Lien mort « Voir tous les élus → » ⚡
**Constat.** /conseils pointe vers `/bruz-en-action#elus` — ancre inexistante sur
la homepage. Le clic ramène en haut de l'accueil.
**Suggestion.** Pointer vers `/bruz-en-action/elus`.

### B3. Deux footers qui divergent ⚡
**Constat.** La homepage a son propre footer inline, différent de `SiteFooter`
(liens Publications/Interagir absents, pas de bloc signalement, pas d'email).
Toute évolution du footer devra être faite deux fois — et elles ont déjà divergé.
**Suggestion.** Utiliser `SiteFooter` sur la homepage aussi, supprimer l'inline.

### B4. Palette catégories : 3 systèmes divergents et incomplets ⚡→🔨
**Constat.** `CATEGORIE_COLOR` est dupliqué dans `page.tsx` et
`dossiers/page.tsx` — et il manque **Santé** et **Économie** : D15/D16 sortent en
gris terne sur la homepage et l'index dossiers. /chronologie a sa propre palette
par ID de dossier (D21 manquant → gris ; D09 fantôme). /metropole a la sienne.
**Suggestion.** Une seule source : soit un module `lib/categories.ts`, soit — mieux,
conforme au schéma du CLAUDE.md (« categorie avec couleur ») — la couleur dans
`dossiers.json` par catégorie. Ajouter Santé et Économie.

### B5. Deux polices chargées, une seule utilisée ⚡
**Constat.** `layout.tsx` charge Geist (next/font) et le body inline la force ;
`globals.css` importe Public Sans + JetBrains Mono depuis Google Fonts et les met
dans `--font-sans`. Résultat : les pages qui posent `fontFamily: var(--font-sans)`
(dossiers, articles, chronologie) sont en Public Sans, les autres en Geist — deux
typos cohabitent selon la page, et on paie un import render-blocking + RGPD (A6).
**Suggestion.** Choisir **une** police (Public Sans colle mieux à l'identité
institutionnelle-citoyenne), la self-hoster via `next/font/local`, supprimer
l'import Google Fonts et l'inline du body.

### B6. Deux oranges de marque ⚡
**Constat.** Le token `--brand-orange` vaut `#E8A040` (utilisé dans les dossiers,
graphiques, soulignés de titres) mais tous les CTA/hero utilisent `#f97316` en
dur. Les deux cohabitent sur la même page (ex. détail dossier).
**Suggestion.** Trancher pour l'un des deux (le `#E8A040` est celui du logo ?),
mettre à jour le token, remplacer les valeurs en dur par `var(--brand-orange)`.

### B7. La barre de promesses ignore 3 statuts sur 6 ⚡
**Constat.** Homepage et /promesses ne dessinent que tenu/en_cours/non_commencé.
Le jour où une promesse passe à `partiel`, `abandonne` ou `inconnu`, elle
disparaît de la barre et la somme des segments < 100 %.
**Suggestion.** Ajouter les 3 segments manquants (les couleurs existent déjà en
tokens `--status-*`) + légende conditionnelle (n'afficher que les statuts > 0).

### B8. Sitemap en retard sur le site ⚡
**Constat.** `sitemap.ts` référence les orphelines /metro et /liens mais **pas**
/publications, /coup-de-pouce ni /articles/*.
**Suggestion.** Ajouter les manquantes, retirer /metro (voir B9). Idem pour la
nav footer.

### B9. /metro : doublon avec données en dur, à supprimer ⚡
**Constat.** /metro duplique /metropole avec des décisions **codées dans le TSX**
(déjà en train de diverger). /liens en revanche a du contenu utile mais n'est
accessible nulle part.
**Suggestion.** Supprimer /metro (garder /metropole, piloté par
`metropole.json`). Rattacher /liens au groupe nav « Suivre » et au footer.
(Déjà en 💡 au backlog — je propose de trancher comme ça.)

### B10. « En profondeur » câblé en dur ⚡
**Constat.** La liste des dossiers ayant une page en-profondeur (`D01, D02, D03,
D07`) et leurs sous-titres sont dans le TSX de la page dossier. Le backlog prévoit
des « en profondeur » pour D10, D16, D20 → il faudra retoucher le code à chaque fois.
**Suggestion.** Champ `en_profondeur: { sous_titre: string }` dans
`dossiers.json`, le TSX devient générique.

### B11. Contrastes insuffisants sur les petits textes ⚡→🔨
**Constat.** Les sources de graphiques et liens de stats utilisent `#cbd5e1` sur
blanc (ratio ≈ 1,6:1 — l'AA demande 4,5:1), les dates `#94a3b8` (≈ 2,8:1).
Illisible pour une partie du lectorat — qui, pour un site citoyen, est souvent
âgée.
**Suggestion.** Passe de contraste : rien sous `--slate-500` (#64748b) pour du
texte porteur d'information. Vérifier aussi les émojis porteurs de sens dans la
nav (doubler d'un libellé — c'est déjà le cas, OK).

### B12. og-image en 1200×1200 ⚡
**Constat.** Les partages FB/WhatsApp/LinkedIn attendent du 1200×630 ; le carré
sera recadré ou réduit selon les plateformes.
**Suggestion.** Décliner une version 1200×630 pour l'OpenGraph (garder le carré
pour les avatars).

### B13. Modifs locales non déployées ⚡
**Constat.** `app/page.tsx` + `NavBar.tsx` modifiés (liens Instagram) non commités
— reliquat de la session interrompue d'hier soir (draft non exporté). Le site
déployé n'a pas encore Instagram.
**Suggestion.** Vérifier, commiter, pousser — et purger le `session_draft.md`.

### B14. Images : pas de lazy loading ⚡
**Constat.** Toutes les `<img>` chargent immédiatement (illustrations de dossiers,
photos). Sur mobile/3G la homepage charge tout d'un coup.
**Suggestion.** `loading="lazy"` sur toutes les images sous la ligne de flottaison
(garder eager pour le hero).

---

## C. Nouvelles pages — statistiques, base de connaissance, histoire

> Votre demande du jour. Les trois idées se renforcent : une seule fondation de
> données (`bruz.json` étendu + séries INSEE), trois mises en scène.

### C1. 📊 « Bruz en chiffres » — pages statistiques 🏗️
**L'atout : `bruz.json` existe déjà** (démographie, logement, emploi-revenus,
santé, sécurité, finances CFU 2023/2025, économie, sport…, tout sourcé INSEE/DGFiP)
mais n'alimente que les petites sidebars « Chiffres de contexte ».
**Proposition.**
- Page **/statistiques** (hub) + sous-pages thématiques : population, logement,
  emploi & revenus, finances communales, santé, sécurité, éducation.
- Chaque page : 3-4 KPI en tuiles, graphiques de séries longues, comparaison
  systématique **Bruz vs Rennes Métropole vs Ille-et-Vilaine vs France** (c'est la
  comparaison qui rend un chiffre parlant), source + année sous chaque graphe
  (la mécanique `stats_dossiers`/`valeur_path` est déjà là, on la généralise).
- **Sources à brancher** (toutes open data, récupération scriptable) :
  - INSEE séries historiques RP (population 1968→2023, logements, CSP, âges)
  - INSEE Filosofi (revenus, pauvreté) — déjà partiellement dans bruz.json
  - DVF / app.dvf.etalab.gouv.fr (prix immobilier par an et par quartier — très parlant pour la ZAC)
  - DGFiP comptes communaux (dette, investissement — CFU déjà en base)
  - SSMSI base communale de la délinquance (déjà repérée dans bruz.json `a_verifier`)
  - Éducation nationale (effectifs par école — nourrit D10)
  - Résultats électoraux ministère de l'Intérieur (participation municipales 2026, historique)
- **Graphiques** : composants SVG server-rendered (comme les SvgBarChart existants,
  donc zéro JS client, compatible export statique) — à enrichir : courbe de série
  longue, aires empilées, pyramide des âges, jauge comparative. Un seul module
  `components/charts/` réutilisé partout, avec la charte du site.

### C2. 📚 Base de connaissance consultable 🏗️
**Constat.** `bruz.json` est riche mais invisible ; le glossaire est éparpillé
par dossier ; les notes méthodologiques (« faits constatés ≠ délinquance réelle »)
sont enfouies.
**Proposition.**
- Page **/connaitre-bruz** (ou « Bruz de A à Z ») : la base rendue navigable —
  sections identité / démographie / équipements / institutions / finances, chaque
  fait avec sa source et son année, moteur de filtre simple côté client.
- **Glossaire global** consolidé (les entrées par dossier existent déjà dans
  `dossiers.json`) : page /glossaire + liens depuis les dossiers.
- Encadrés « Comment lire ce chiffre ? » pour les notions piégeuses (population
  légale vs recensée, faits constatés, taux d'endettement…). Ça positionne l'asso
  comme pédagogue, pas comme donneuse de leçons.
- Règle d'or à conserver : **une seule source de vérité** (`bruz.json`), les pages
  ne font que le rendre — jamais de chiffre en dur (règle projet existante).

### C3. 🕰️ « Bruz au fil du temps » — histoire fine de la commune 🏗️
**Proposition.** Page(s) /histoire mêlant récit et données — le différenciant :
**l'histoire racontée par les chiffres**.
- **Frise longue** : des origines (Brutius/paroisse) à 2026 — événements clés :
  le bombardement du 8 mai 1944 (nuit tragique de Bruz, ~180 victimes — moment
  fondateur de la mémoire communale, à documenter avec soin et sources), la
  reconstruction, l'arrivée du campus Ker Lann (années 1990), les ZAC successives,
  le passage des 20 000 habitants (2023), les mandats municipaux successifs.
- **Séries longues animant le récit** : population 1793→2023 (données
  Cassini/EHESS + INSEE — la courbe ×5 depuis 1968 raconte à elle seule la
  périurbanisation), constructions de logements par décennie, évolution des
  équipements.
- **Sources** : INSEE séries historiques, base Cassini/EHESS des villages de
  France, archives dép. 35 (en ligne), site mairie (histoire), Wikipédia comme
  index (jamais comme source finale), presse rétro Ouest-France. Le Bruz Mag fait
  parfois des pages histoire — la veille peut les capter.
- **Angle éditorial** : chaque époque reliée aux dossiers d'aujourd'hui (« la ZAC
  Multisites est le 4e grand cycle d'urbanisation de Bruz ») — ça donne de la
  profondeur au travail de veille actuel.
- Réutilise le composant timeline de /chronologie (déjà bien fait) et les
  composants charts de C1.

### C4. Ordre de construction suggéré pour le volet C
1. **Fondation** : module `components/charts/` + extension `bruz.json`
   (`series_longues` : population, logements, dette…) + script
   `scripts/fetch_insee.py` pour l'import reproductible (pattern validate_data).
2. **/statistiques** (le plus vite rentable : données déjà en base à 60 %).
3. **/histoire** (nécessite un travail de recherche documentaire — quelques
   sessions de collecte sourcée avant d'écrire).
4. **/connaitre-bruz + glossaire** (mise en scène de l'existant, peut se faire en
   parallèle).

---

## D. Priorisation proposée (à discuter)

| Lot | Contenu | Effort |
|-----|---------|--------|
| **Lot 1 — corrections immédiates** | B1 nav articles · B2 lien élus · A2 mandat 2032 · B8 sitemap · B13 commit Instagram · B3 footer unique · A9 fusion « Qui sommes-nous » | ~1 session |
| **Lot 2 — cohérence design** | B4 palette unique · B5 police unique (+ A6 RGPD fonts) · B6 orange unique · B7 barre 6 statuts · B11 contrastes · B9 /metro-/liens · B10 en-profondeur JSON · B12 og-image · B14 lazy | 1-2 sessions |
| **Lot 3 — fond éditorial** | A1 promesses (bandeau + en_cours factuel) · A3 page /actualites + dates · A4 dossier_id · A5 fiche minimum dossiers · A6 mentions légales · A7 data-driven · A8 agenda · A10 reformulation | 2-3 sessions |
| **Lot 4 — nouvelles pages** | C1 statistiques → C3 histoire → C2 base de connaissance (ordre C4) | chantier au long cours |

---
*Généré le 2026-07-11 — à passer en revue ensemble, puis reporter les items retenus dans BACKLOG.md.*
