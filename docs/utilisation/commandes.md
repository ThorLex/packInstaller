# Commandes disponibles

Reference complete de toutes les commandes et options disponibles dans `packi`.

---

## `packi` — Commande principale

Lance l'installation de tous les packages listes dans `requirements.txt`.

```bash
packi
# ou
npx packi
```

### Comportement detaille

| Etape | Action                                                              |
| ----- | ------------------------------------------------------------------- |
| 1     | Recherche `requirements.txt` dans le repertoire courant             |
| 2     | Si absent, genere le fichier depuis `package.json` automatiquement  |
| 3     | Charge la base de donnees communautaire (`exists.txt`)              |
| 4     | Installe chaque package via `npm install`                           |
| 5     | En cas d'echec, effectue une recherche fuzzy pour des suggestions   |
| 6     | Propose d'ajouter les nouveaux packages a la base de donnees        |
| 7     | Affiche le rapport de synthese                                      |

### Exemple de sortie

```
=== Debut de l'installation ===
Nombre total de packages a installer: 3

[14:22:01] Chargement de la base de donnees des packages

   Tentative d'installation de express
  express installe avec succes

[█████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░] 33.3%

   Tentative d'installation de lodash
  lodash installe avec succes

[██████████████████████████░░░░░░░░░░░░░░] 66.7%

   Tentative d'installation de axios
  axios installe avec succes

[████████████████████████████████████████] 100%

=== Resume de l'installation ===
  Duree totale: 8.42 secondes
  Packages installes avec succes: 3
  Echecs d'installation: 0
```

---

## `packi freeze` — Generer requirements.txt

Genere automatiquement un fichier `requirements.txt` depuis votre projet existant.

```bash
packi freeze
# ou
npx packi freeze
```

Consultez la page [Commande freeze](freeze.md) pour la documentation complete.

---

## Gestion des erreurs et suggestions interactives

Quand un package echoue a l'installation, `packi` ne s'arrete pas. Il cherche des alternatives et vous propose un menu interactif :

```
  Echec de l'installation de axois

  Suggestions de packages similaires:
   1. axios (2,500,000 telechargements) - Similarite: 83.3%
   2. axos  (12,000 telechargements)   - Similarite: 57.1%
   3. Passer ce package

  Votre choix [1-3] :
```

### Options disponibles dans le menu

| Option       | Description                                           |
| ------------ | ----------------------------------------------------- |
| `1`, `2`...  | Installer le package suggere a la place               |
| Dernier choix | Passer ce package et continuer l'installation        |

!!! info "Algorithme de similarite"
    Les suggestions sont calculees avec la bibliotheque `string-similarity` en comparant le nom saisi avec les packages connus de la base `exists.txt`. Le score de similarite va de 0 (aucun rapport) a 100% (identique).

---

## Contribution a la base de donnees

Apres chaque installation reussie d'un package absent de la base de donnees, `packi` vous demande si vous souhaitez contribuer :

```
  Le package "express" n'est pas encore dans la base de donnees.
  Voulez-vous l'ajouter pour aider la communaute ? (o/n) :
```

Si vous repondez **`o`**, le package est ajoute a `exists.txt` et votre preference est sauvegardee dans `.package-installer-config.json` pour les prochaines sessions.

---

## Codes de sortie

| Code | Signification                                   |
| ---- | ----------------------------------------------- |
| `0`  | Tous les packages ont ete installes avec succes |
| `1`  | Un ou plusieurs packages ont echoue             |
| `2`  | `requirements.txt` introuvable et non generee  |

Ces codes sont utiles pour integrer `packi` dans des scripts CI/CD :

```bash
packi && echo "Installation reussie" || echo "Des packages ont echoue"
```
