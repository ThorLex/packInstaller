# Qu'est-ce que packi ?

packi est un outil CLI qui permet aux développeurs Node.js d'installer toutes leurs dépendances npm en une seule commande, depuis un fichier `requirements.txt`.

Maintenu par [ThorLex](https://github.com/ThorLex), packi fournit une approche simple et directe pour gérer vos dépendances — avec détection de fautes, suggestions automatiques et base de packages communautaire.

---

## Vous voulez voir du code ?

[**Démarrage rapide** — Lancez packi en 2 minutes](utilisation/index.md)
&nbsp;&nbsp;·&nbsp;&nbsp;
[**Commandes** — Référence complète](utilisation/commandes.md)

---

## Fonctionnalités

### Support requirements.txt

Listez vos packages à la manière Python, un par ligne. Commentaires et versions exactes supportés.
[En savoir plus](utilisation/requirements.md)

### Fuzzy Search

Notre moteur de correspondance approximative détecte les fautes de frappe et suggère le bon package avec un score de similarité.
[En savoir plus](fonctionnement.md)

### Progression en temps réel

Barre de progression ASCII, timestamps et rapport final détaillé — vous savez exactement ce qui se passe à chaque étape.

### Base de données communautaire

`exists.txt` s'enrichit à chaque installation. Le moteur de suggestions devient plus intelligent au fil des utilisations.
[En savoir plus](reference/database.md)

### packi freeze

Générez un `requirements.txt` automatiquement depuis votre projet existant, comme `pip freeze` en Python.
[En savoir plus](utilisation/freeze.md)

### Zéro configuration

Aucun fichier de config à créer. Une seule dépendance runtime : `string-similarity`.

---

## Installez et lancez en quelques secondes

### Sans installation

```bash
npx packi
```

### Installation globale

```bash
npm install -g packi
```

### Dans un projet

```bash
npm install packi
```

---

## Fiable et prévisible

### Transparent et open source

Chaque commit est disponible sur [GitHub](https://github.com/ThorLex/packInstaller). Vous pouvez inspecter le code, signaler un bug ou proposer une amélioration à tout moment.

### Léger par conception

packi ne repose que sur une seule dépendance externe. Pas de dépendances natives, pas de compilation, pas de configuration système requise.

---

## Fonctionne à toute échelle

### Projets personnels

Un fichier, une commande. Idéal pour démarrer rapidement sur un nouveau projet ou une nouvelle machine.

### Projets en équipe

Committez `requirements.txt` avec votre code. N'importe quel membre de l'équipe reconstruit l'environnement exact en une commande.

### CI/CD

Intégrez `packi` dans vos pipelines d'intégration continue. Les codes de sortie permettent de détecter les échecs automatiquement.

---

## Open source

### Développé en public sur GitHub

Curieux de ce sur quoi nous travaillons ? Chaque PR et commit est disponible sur notre GitHub. Vous avez rencontré un bug ? Ouvrez une issue.

[Voir le dépôt GitHub](https://github.com/ThorLex/packInstaller)

### Contribuer

La documentation, le code, la base de packages — toutes les contributions sont les bienvenues, quelle que soit leur taille.

[Guide de contribution](contribuer.md)

---

## Rejoignez la communauté

[Lire la documentation complète](installation.md)
&nbsp;&nbsp;·&nbsp;&nbsp;
[Voir les commandes disponibles](utilisation/commandes.md)
&nbsp;&nbsp;·&nbsp;&nbsp;
[Comprendre le fonctionnement](fonctionnement.md)
&nbsp;&nbsp;·&nbsp;&nbsp;
[Contribuer au projet](contribuer.md)
-------------------------------------
