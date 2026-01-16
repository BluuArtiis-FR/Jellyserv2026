# Contribuer à Homelab-Media-Server

Merci de l'intérêt que vous portez à ce projet ! Toutes les contributions, qu'il s'agisse de rapports de bugs, de nouvelles fonctionnalités ou d'ajouts de services, sont les bienvenues.

## Code de Conduite

Ce projet et tous ses participants sont régis par le [Code de Conduite](./CODE_OF_CONDUCT.md). En participant, vous vous engagez à respecter ce code.

## Comment Contribuer

### Signaler un Bug

Si vous rencontrez un bug avec le configurateur ou le projet en général, veuillez [ouvrir une "issue"](https://github.com/BluuArtiis-FR/Homelab-Media-Server/issues/new/choose) en utilisant le modèle "Bug Report". Veuillez être aussi détaillé que possible.

### Proposer une Amélioration ou une Fonctionnalité

Si vous avez une idée pour une nouvelle fonctionnalité ou une amélioration, [ouvrez une "issue"](https://github.com/BluuArtiis-FR/Homelab-Media-Server/issues/new/choose) en utilisant le modèle "Feature Request".

## Développement Local du Configurateur

Si vous souhaitez modifier le code du configurateur web, voici comment mettre en place un environnement de développement local.

1.  **Forkez et Clonez le Dépôt**
    ```bash
    git clone https://github.com/<votre-nom-d-utilisateur>/Homelab-Media-Server.git
    cd Homelab-Media-Server
    ```

2.  **Naviguez vers le Dossier du Configurateur**
    ```bash
    cd homelab-configurator
    ```

3.  **Installez les Dépendances**
    ```bash
    npm install
    ```

4.  **Lancez le Serveur de Développement**
    ```bash
    npm run dev
    ```
    L'application sera alors disponible sur `http://localhost:5173` (ou un port similaire).

## Ajouter un Nouveau Service

L'ajout d'un nouveau service se fait en modifiant le fichier `homelab-configurator/src/services.js`.

1.  **Trouvez le nom du service** dans le `docker-compose.yml` principal (ex: `new-service`).
2.  **Ajoutez une nouvelle entrée** dans l'objet `SERVICE_MANIFEST`.
3.  **Remplissez les informations requises** :
    - `group`: La catégorie du service (ex: `media`, `cloud`).
    - `name`: Le nom affiché dans l'interface (ex: "New Service").
    - `description`: Une courte description.
    - `doc_url`: Un lien vers la documentation officielle du service.
    - `dependencies`: Un tableau des autres services requis (ex: `['gluetun']`).
    - `env_vars`: Un tableau des variables d'environnement nécessaires.

**Exemple d'une nouvelle entrée de service :**
```javascript
"new-service": {
    group: "utils",
    name: "New Service",
    description: "Ceci est un nouveau service de test.",
    doc_url: "https://example.com",
    dependencies: [], // Pas de dépendances
    expose: true, // Peut être exposé à l'extérieur
    port: 8080 // Port par défaut
}
```
