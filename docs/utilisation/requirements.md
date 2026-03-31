# Le fichier requirements.txt

Le fichier `requirements.txt` est le coeur de `packi`. C'est lui qui liste tous les packages npm que vous souhaitez installer.

---

## Creer le fichier manuellement

Creez un fichier nomme `requirements.txt` a la racine de votre projet et listez vos packages, **un par ligne** :

```text title="requirements.txt"
express
lodash
axios
chalk
dotenv
```

!!! note "Emplacement du fichier"
    `packi` recherche `requirements.txt` dans le **repertoire courant** ou vous lancez la commande. Assurez-vous d'etre au bon endroit avant de l'executer.

---

## Syntaxe supportee

### Package simple

La forme la plus basique : le nom du package tel qu'il apparait sur npm.

```text
express
lodash
axios
```

### Package avec version precise

Vous pouvez specifier une version exacte avec la notation `@version` :

```text
express@4.18.2
lodash@4.17.21
axios@1.4.0
```

!!! tip "Bonne pratique"
    Specifier les versions garantit la reproductibilite de votre environnement sur n'importe quelle machine.

### Commentaires

Les lignes commencant par `#` sont ignorees et servent de commentaires pour documenter votre fichier :

```text
# Serveur web 
express
cors

# === Utilitaires ===
lodash
dotenv

# === HTTP Client ===
axios@1.4.0
```

### Lignes vides

Les lignes vides sont ignorees. Utilisez-les pour organiser vos packages par categorie :

```text
express
cors

lodash
chalk

dotenv
```

---

## Exemple complet annote

Voici un exemple realiste d'un fichier `requirements.txt` pour une API Node.js :

```text title="requirements.txt"
# === Framework web ===
express
express-validator

# === Base de donnees ===
mongoose
redis

# === Authentification ===
jsonwebtoken
bcryptjs

# === Utilitaires ===
lodash
dotenv
chalk@4.1.2

# === HTTP ===
axios

# === Logging ===
winston
morgan
```

---

## Generation automatique

Si `requirements.txt` est absent au moment de lancer `packi`, il sera **automatiquement genere** depuis votre `package.json` existant.

Vous pouvez aussi generer ce fichier deliberement avec la commande [`packi freeze`](freeze.md).

---

## Bonnes pratiques

!!! success "A faire"
    - Un package par ligne
    - Commenter les sections avec `#`
    - Specifier les versions pour les projets en production
    - Versionner `requirements.txt` avec Git

!!! warning "A eviter"
    - Mettre plusieurs packages sur une meme ligne
    - Laisser des noms de packages avec des espaces (sauf si c'est voulu)
    - Oublier de mettre a jour le fichier apres avoir ajoute des dependances

---

## Differences avec `package.json`

| Critere              | `requirements.txt`          | `package.json`                  |
| -------------------- | --------------------------- | -------------------------------- |
| Format               | Texte simple                | JSON structure                   |
| Lisibilite           | Tres simple                 | Necessite de connaitre le format |
| Versionning          | Optionnel (`pkg@x.y.z`)     | Obligatoire (semver)             |
| Commentaires         | Oui (`#`)                   | Non (JSON ne supporte pas `//`)  |
| Usage avec packi     | Natif                       | Lecture automatique en fallback  |
