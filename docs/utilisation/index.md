# Utilisation — Vue d'ensemble

Cette section couvre tout ce dont vous avez besoin pour utiliser `packi` au quotidien, de la creation du fichier `requirements.txt` a l'execution des commandes avancees.

---

## Flux de travail typique

Le flux d'utilisation standard de `packi` se deroule en trois etapes :

```mermaid
flowchart LR
    A[Creer requirements.txt] --> B[Lancer packi]
    B --> C[Voir le rapport]
```

1. **Creez** votre `requirements.txt` avec la liste de vos packages
2. **Lancez** `packi` (ou `npx packi`)
3. **Consultez** le rapport de fin d'installation

---

## Commande de base

```bash
packi
```

ou via `npx` sans installation prealable :

```bash
npx packi
```

### Ce que fait `packi` au lancement

Quand vous lancez `packi`, il effectue les operations suivantes dans l'ordre :

1. Recherche le fichier `requirements.txt` dans le repertoire courant
2. Si absent, tente de le generer depuis votre `package.json`
3. Charge la base de donnees locale (`exists.txt`)
4. Installe chaque package via `npm install`
5. En cas d'echec, propose des alternatives par recherche fuzzy
6. Vous invite a contribuer les nouveaux packages a la base de donnees
7. Affiche un rapport de synthese

---

## Exemple de session complete

Voici ce qu'affiche `packi` lors d'une installation typique :

```
=== Debut de l'installation ===
Nombre total de packages a installer: 4

[14:22:01] Chargement de la base de donnees des packages

   Tentative d'installation de express
  express installe avec succes
[██████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 25%

   Tentative d'installation de axois
  Echec de l'installation de axois

  Suggestions de packages similaires:
   1. axios (2,500,000 telechargements) - Similarite: 83.3%
   2. axos  (12,000 telechargements)   - Similarite: 57.1%

  Voulez-vous installer axios a la place ? (o/n): o
  axios installe avec succes
[████████████████████░░░░░░░░░░░░░░░░░░░░] 50%

   Tentative d'installation de lodash
  lodash installe avec succes
[██████████████████████████████░░░░░░░░░░] 75%

   Tentative d'installation de dotenv
  dotenv installe avec succes
[████████████████████████████████████████] 100%

=== Resume de l'installation ===
  Duree totale: 12.37 secondes
  Packages installes avec succes: 4
  Echecs d'installation: 0
```

---

## Pages detaillees

Consultez les sous-pages pour aller plus loin :

- [**Fichier requirements.txt**](requirements.md) — Syntaxe, format, exemples
- [**Commandes disponibles**](commandes.md) — Reference de toutes les commandes
- [**Commande freeze**](freeze.md) — Generer `requirements.txt` depuis votre projet
