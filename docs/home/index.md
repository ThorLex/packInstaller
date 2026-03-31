# Installation

Cette page explique les differentes facons d'installer et d'utiliser `packi` selon votre cas d'usage.

---

## Prerequis

!!! warning "Verifiez votre version de Node.js"

    `packi` necessite **Node.js >= 14**. Verifiez votre version avant de continuer :

```bash
node --version
# v14.0.0 ou superieur requis
```

## Telechargez la derniere version LTS sur [nodejs.org](https://nodejs.org) si necessaire.

## Methode 1 — Utilisation sans installation (recommandee)

La facon la plus simple d'utiliser `packi` sans l'ajouter a votre systeme :

```bash
npx packi
```

!!! info "Quand utiliser `npx` ?" - Pour un usage ponctuel sur un projet - Quand vous ne voulez pas installer d'outils globaux - Pour toujours utiliser la derniere version sans mise a jour manuelle

---

## Methode 2 — Installation globale

Installez `packi` une fois pour l'utiliser dans n'importe quel projet :

```bash
npm install -g packi
```

Verifiez ensuite que l'installation a reussi :

```bash
packi --version
```

!!! tip "Avantage de l'installation globale"
    Vous pouvez simplement taper `packi` dans n'importe quel repertoire sans passer par `npx`.

---

## Methode 3 — Installation locale dans un projet

Ajoutez `packi` comme dependance de developpement dans votre projet :

```bash
npm install packi
```

Ou comme dependance de developpement uniquement :

```bash
npm install --save-dev packi
```

Puis appelez-le via npm scripts dans votre `package.json` :

```json
{
  "scripts": {
    "install-deps": "packi"
  }
}
```

```bash
npm run install-deps
```

---

## Comparaison des methodes

| Methode | Commande               | Persistant | Recommande pour        |
| ------- | ---------------------- | ---------- | ---------------------- |
| `npx`   | `npx packi`            | Non        | Usage ponctuel, CI/CD  |
| Global  | `npm install -g packi` | Oui        | Developpeurs frequents |
| Local   | `npm install packi`    | Oui        | Projets en equipe      |

---

## Verification de l'installation

Apres installation, verifiez que tout fonctionne en creant un petit `requirements.txt` de test :

```text
chalk
```

Puis lancez :

```bash
packi
# ou
npx packi
```

Vous devriez voir :

```
=== Debut de l'installation ===
Nombre total de packages a installer: 1

  Tentative d'installation de chalk
  chalk installe avec succes

[████████████████████████████████████████] 100%

=== Resume de l'installation ===
  Duree totale: 2.14 secondes
  Packages installes avec succes: 1
  Echecs d'installation: 0
```

!!! success "Tout est pret !"
    Consultez maintenant la section [Utilisation](utilisation/index.md) pour apprendre a creer et gerer vos `requirements.txt`.
