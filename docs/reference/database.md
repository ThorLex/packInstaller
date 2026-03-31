# Base de donnees communautaire

`packi` s'appuie sur un fichier texte local appele `exists.txt` qui sert de base de donnees des packages connus. Ce fichier est au coeur du systeme de suggestions par correspondance fuzzy.

---

## Qu'est-ce que `exists.txt` ?

`exists.txt` est un fichier texte contenant une liste de noms de packages npm, un par ligne. Il est utilise par `packi` pour :

1. **Valider** les noms de packages avant installation
2. **Suggerer** des alternatives quand un package est introuvable
3. **Enrichir** les suggestions au fil des utilisations

```text title="exists.txt (extrait)"
express
lodash
axios
chalk
dotenv
mongoose
redis
jsonwebtoken
bcryptjs
winston
morgan
...
```

---

## Comment le fichier grandit-il ?

La base de donnees s'enrichit grace aux contributions des utilisateurs. Apres chaque installation reussie d'un package absent de la base :

```
  Le package "express" n'est pas encore dans la base de donnees.
  Voulez-vous l'ajouter pour aider la communaute ? (o/n) :
```

- **`o`** → le package est ajoute a `exists.txt` et votre reponse est sauvegardee dans la config
- **`n`** → le package est ignore, votre reponse est sauvegardee pour ne plus vous demander

---

## Algorithme de correspondance fuzzy

Quand un package echoue, `packi` utilise la bibliotheque `string-similarity` pour calculer un score de similarite entre le nom saisi et chaque entree de `exists.txt`.

### Exemple de calcul

Si vous ecrivez `axois` au lieu d'`axios` :

| Package dans exists.txt | Score de similarite |
| ----------------------- | -------------------- |
| `axios`                 | 83.3%               |
| `axos`                  | 57.1%               |
| `express`               | 12.5%               |
| `lodash`                | 0%                  |

Seuls les packages avec un score superieur a un seuil minimal sont proposes comme suggestions.

---

## Editer `exists.txt` manuellement

Vous pouvez ajouter des packages manuellement en editant directement `exists.txt` dans votre editeur, un nom par ligne :

```text title="exists.txt"
express
axios
lodash
# Ajout manuel
my-custom-package
```

!!! warning "Format strict"
    - Un package par ligne
    - Pas d'espaces superflus
    - Noms exacts tels qu'ils apparaissent sur npm

---

## Partage en equipe

Si vous travaillez en equipe, committez `exists.txt` dans votre depot Git. Cela permet a tous vos collegues de beneficier d'une base de suggestions enrichie :

```bash
git add exists.txt
git commit -m "chore: update package database"
```

!!! tip "Contribuer au projet open-source"
    Si vous souhaitez contribuer votre `exists.txt` enrichi au projet officiel, ouvrez une **Pull Request** sur [GitHub](https://github.com/ThorLex/packInstaller). Votre contribution beneficiera a tous les utilisateurs de `packi`.
