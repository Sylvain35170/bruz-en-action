# Dossier input/ — Fichiers sources bruts

Ce dossier contient les fichiers d'entrée qui alimentent le référentiel des promesses.

## Fichiers attendus

| Fichier | Description |
|---------|-------------|
| `promesses_source.xlsx` | Excel maître — source de vérité des promesses (Sylvain) |
| `tracts/`              | Tracts de campagne scannés (PDF/images) |
| `comptes_rendus/`      | Comptes rendus de conseil municipal |

## Pipeline de mise à jour

```
input/promesses_source.xlsx
        ↓
scripts/import_excel.py
        ↓
data/promesses.json   ← consommé par le site Next.js
```

## Règles

- Ce dossier est en **lecture/écriture** pour l'agent
- Ne jamais modifier `data/promesses.json` directement — passer par les scripts
- Versionner l'Excel dans git pour historique des modifications
