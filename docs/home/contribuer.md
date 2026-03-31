# Contribuer a packi

`packi` est un projet open-source et les contributions sont les bienvenues, quelle que soit leur forme : correction de bugs, nouvelles fonctionnalites, amelioration de la documentation, ou enrichissement de la base de packages.

---

## Facon 1 — Contribuer via la CLI (la plus simple)

La contribution la plus simple ne necessite aucune connaissance de Git. Quand vous installez un package avec `packi`, il vous propose de l'ajouter a `exists.txt` :

```
  Le package "uuid" n'est pas encore dans la base de donnees.
  Voulez-vous l'ajouter pour aider la communaute ? (o/n) :
```

Repondez **`o`** et votre package sera ajoute localement. Vous pouvez ensuite soumettre votre `exists.txt` enrichi via une Pull Request.

---

## Facon 2 — Contribuer au code source

### Etape 1 — Fork du depot

Rendez-vous sur [github.com/ThorLex/packInstaller](https://github.com/ThorLex/packInstaller) et cliquez sur **Fork** en haut a droite.

### Etape 2 — Cloner votre fork

```bash
git clone https://github.com/VOTRE-USERNAME/packInstaller.git
cd packInstaller
```

### Etape 3 — Creer une branche

Utilisez la convention de nommage suivante pour vos branches :

| Type de changement | Prefixe    | Exemple                          |
| ------------------ | ---------- | -------------------------------- |
| Nouvelle feature   | `feat/`    | `feat/support-yarn`              |
| Correction de bug  | `fix/`     | `fix/freeze-command-crash`       |
| Documentation      | `docs/`    | `docs/improve-readme`            |
| Refactorisation    | `refactor/`| `refactor/fuzzy-search-logic`    |

```bash
git checkout -b feat/ma-fonctionnalite
```

### Etape 4 — Developper et tester

Apportez vos modifications et testez-les localement :

```bash
# Lancer packi en mode developpement
node index.js

# Tester la commande freeze
node index.js freeze
```

### Etape 5 — Committer vos changements

Suivez la convention [Conventional Commits](https://www.conventionalcommits.org/) :

```bash
git add .
git commit -m "feat: ajouter le support de yarn comme gestionnaire de packages"
```

Exemples de messages de commit valides :

```
feat: add support for pnpm
fix: correct typo detection threshold
docs: update requirements.txt syntax section
refactor: simplify fuzzy search algorithm
chore: update string-similarity to v5
```

### Etape 6 — Pousser et ouvrir une Pull Request

```bash
git push origin feat/ma-fonctionnalite
```

Puis rendez-vous sur GitHub et cliquez sur **"Compare & pull request"**. Decrivez clairement :

- Ce que fait votre changement
- Pourquoi il est utile
- Comment le tester

---

## Contribuer a la documentation

La documentation se trouve dans le dossier `docs/` et est construite avec [MkDocs](https://www.mkdocs.org/) + le theme [Material](https://squidfunk.github.io/mkdocs-material/).

Pour contribuer a la documentation :

```bash
# Installer MkDocs et le theme Material
pip install mkdocs mkdocs-material

# Lancer le serveur de documentation en local
mkdocs serve

# Ouvrir http://127.0.0.1:8000 dans votre navigateur
```

---

## Contribuer a `exists.txt`

Si vous avez enrichi votre base de donnees locale avec des packages utiles, partagez-la :

1. Ouvrez `exists.txt` et verifiez que tous les noms sont corrects
2. Faites une Pull Request avec votre version enrichie
3. Indiquez les packages ajoutes dans la description

!!! warning "Regles pour `exists.txt`"
    - Noms de packages exacts (verifiez sur [npmjs.com](https://www.npmjs.com))
    - Un package par ligne
    - Pas de doublons
    - Pas de packages malveillants ou abandonnes

---

## Code de conduite

- Soyez respectueux et constructif dans vos echanges
- Toute contribution, meme petite, est appreciee
- En cas de doute, ouvrez d'abord une **Issue** avant de coder

---

## Signaler un bug ou proposer une idee

Utilisez le systeme d'**Issues** GitHub :

- [Signaler un bug](https://github.com/ThorLex/packInstaller/issues/new?template=bug_report.md)
- [Proposer une fonctionnalite](https://github.com/ThorLex/packInstaller/issues/new?template=feature_request.md)

Merci de votre contribution !
