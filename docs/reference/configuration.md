# Configuration

`packi` cree automatiquement un fichier de configuration persistent dans votre repertoire de travail pour sauvegarder vos preferences entre les sessions.

---

## Fichier de configuration

Le fichier `.package-installer-config.json` est genere automatiquement lors de votre premiere interaction avec `packi` :

```json title=".package-installer-config.json"
{
  "willContribute": true,
  "gms": "npm"
}
```

---

## Options de configuration

### `willContribute`

**Type :** `boolean`
**Valeurs :** `true` | `false`
**Defaut :** Demande lors de la premiere utilisation

Indique si `packi` doit automatiquement ajouter les nouveaux packages installes a la base de donnees communautaire (`exists.txt`), sans vous le redemander a chaque fois.

| Valeur  | Comportement                                                          |
| ------- | --------------------------------------------------------------------- |
| `true`  | Les nouveaux packages sont ajoutes a `exists.txt` sans confirmation   |
| `false` | `packi` ne contribue pas a la base, sans vous le demander            |

!!! example "Exemple"
    Si vous avez repondu **oui** a la question de contribution lors de votre premiere session, `willContribute` sera defini a `true` et `packi` enrichira automatiquement `exists.txt` a chaque nouvelle installation.

---

### `gms`

**Type :** `string`
**Valeurs :** `"npm"` (seule valeur supportee actuellement)
**Defaut :** `"npm"`

Definit le gestionnaire de packages utilise par `packi` pour installer les dependances.

!!! info "Evolutions futures"
    Le support d'autres gestionnaires comme `yarn` ou `pnpm` est prevu dans les prochaines versions. La cle `gms` (pour *Global Manager System*) est deja la pour les anticiper.

---

## Modifier la configuration manuellement

Vous pouvez editer `.package-installer-config.json` directement dans votre editeur de texte. Les modifications prennent effet au prochain lancement de `packi`.

```json title=".package-installer-config.json"
{
  "willContribute": false,
  "gms": "npm"
}
```

---

## Reinitialiser la configuration

Pour reinitialiser votre configuration et repondre a nouveau aux questions de premiere utilisation, supprimez simplement le fichier :

```bash
# Sur Linux / macOS
rm .package-installer-config.json

# Sur Windows (PowerShell)
Remove-Item .package-installer-config.json
```

Au prochain lancement de `packi`, le fichier sera regenere avec vos nouvelles reponses.

---

## Configuration et Git

!!! warning "Ne committez pas ce fichier !"
    Le fichier `.package-installer-config.json` est specifique a votre machine et a vos preferences personnelles. Ajoutez-le a votre `.gitignore` :

    ```text title=".gitignore"
    .package-installer-config.json
    ```

    En revanche, **committez bien** `requirements.txt` et `exists.txt` si vous travaillez en equipe.

---

## Recapitulatif

| Fichier                           | Versionner ?  | Description                            |
| ---------------------------------- | ------------- | --------------------------------------- |
| `requirements.txt`                 | Oui           | Liste des packages a installer          |
| `exists.txt`                       | Oui (equipe)  | Base de donnees communautaire           |
| `.package-installer-config.json`   | Non           | Preferences personnelles                |
