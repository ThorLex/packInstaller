# Fonctionnement interne

Cette page detaille le pipeline technique de packi.

## Architecture logicielle

```mermaid
flowchart LR
    A[cli.js] --> B[src/commands/install.js]
    A --> C[src/commands/freeze.js]
    B --> D[src/classes/PackageDatabase.js]
    B --> E[src/classes/InstallationLogger.js]
    B --> F[src/classes/ConfigManager.js]
    B --> G[src/utils/npm-commands.js]
    B --> H[src/utils/cli-helpers.js]
```

## Cycle d'execution de la commande packi

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant CLI as packi
    participant FS as Fichiers
    participant NPM as npm

    U->>CLI: packi
    CLI->>FS: lire requirements.txt
    alt requirements.txt absent
      CLI->>FS: generer depuis package.json
    end
    CLI->>FS: charger exists.txt
    loop pour chaque package
      CLI->>NPM: npm install <package>
      alt succes
        CLI->>FS: maj eventuelle de exists.txt
      else echec
        CLI->>CLI: calcul suggestions fuzzy
        CLI->>U: proposer alternatives
      end
    end
    CLI->>U: afficher resume final
```

## Machine d'etats simplifiee

```mermaid
stateDiagram-v2
    [*] --> Initialisation
    Initialisation --> LectureRequirements
    LectureRequirements --> Installation
    Installation --> Installation: package suivant
    Installation --> Suggestion: echec package
    Suggestion --> Installation: alternative choisie
    Suggestion --> Installation: package ignore
    Installation --> Resume: fin de liste
    Resume --> [*]
```

## Gestion des erreurs reseau

packi s'appuie sur npm pour la couche transport et applique une strategie de robustesse au niveau orchestration :
- poursuite du traitement des packages suivants
- conservation des echecs dans le resume final
- possibilite de relance simple de la commande

## Recommandation operationnelle

Pour connexion fragile, combiner packi avec des retries npm :

```bash
npm config set fetch-retries 5
npm config set fetch-retry-factor 2
npm config set fetch-retry-mintimeout 20000
npm config set fetch-retry-maxtimeout 120000
```
