# 📖 Guide d'Utilisation Avancée (CLI)

Ce guide est destiné aux utilisateurs qui choisissent de cloner le dépôt et de gérer leur serveur via la ligne de commande (CLI) avec `make`.

## 1. Installation de l'Hôte

La première étape consiste à préparer votre machine hôte.

```bash
# Clonez d'abord le projet
git clone https://github.com/BluuArtiis-FR/Homelab-Media-Server.git
cd Homelab-Media-Server

# Lancez l'installation
sudo make install
```

### Que fait `sudo make install` ?

Cette commande exécute le script `install.sh` qui prépare votre système :
- **Vérifications** : S'assure que vous êtes sur un OS de type Debian et que la commande est lancée avec `sudo`.
- **Installation de Docker** : Installe Docker et Docker Compose s'ils ne sont pas présents et ajoute votre utilisateur au groupe `docker`.
- **Configuration du Pare-feu (UFW)** : Installe et configure UFW en n'ouvrant que les ports 80 (HTTP) et 443 (HTTPS) pour le reverse proxy, ainsi que le port 22 pour SSH. La sécurité est centralisée.
- **Création des Fichiers** : Crée l'arborescence de dossiers (`config/`, `data/`, etc.) et génère votre fichier de configuration `.env` à partir du modèle `env.example`.

## 2. Configuration via le fichier `.env`

Le fichier `.env` est le panneau de contrôle de votre serveur. Vous devez le modifier avant le premier lancement.

```bash
nano .env
```

### Variables Essentielles (À Modifier)

-   `DOMAIN`: Votre nom de domaine public.
-   `ACME_EMAIL`: Votre adresse e-mail pour les certificats SSL.
-   `*_SECRET_KEY` / `*_PASS`: **Toutes** les variables contenant `CHANGEME` doivent être remplacées par des valeurs sécurisées. Utilisez `openssl rand -base64 32` pour générer des chaînes de caractères aléatoires.

### Permissions et Chemins

-   `PUID` / `PGID`: L'ID de l'utilisateur et du groupe qui posséderont les fichiers. Tapez `id` dans votre terminal pour obtenir les vôtres. `1000` est une valeur par défaut courante.
-   `CONFIG_PATH`, `MEDIA_PATH`, etc. : Les chemins vers vos dossiers sur la machine hôte. Il est recommandé de conserver les valeurs par défaut.

## 3. Le Système de Profils (`COMPOSE_PROFILES`)

Vous avez un contrôle total sur les services à démarrer grâce à la variable `COMPOSE_PROFILES`.

Chaque service appartient à un ou plusieurs profils, ce qui vous permet deux modes de sélection :

### Mode 1 : Sélection par Groupe (Simple)

C'est la méthode la plus simple. Vous listez les groupes de fonctionnalités que vous souhaitez.

**Exemple :** Pour une stack orientée média et cloud.
```env
COMPOSE_PROFILES=media,download,cloud
```
*(La liste complète des groupes est disponible dans le fichier `.env.example`)*

### Mode 2 : Sélection à la Carte (Avancé)

Si vous ne voulez qu'un ou deux services d'un groupe, vous pouvez les lister par leur nom individuel (le nom du service dans `docker-compose.yml`).

**Exemple :** Vous ne voulez que Jellyfin pour le streaming, Sonarr pour les séries, et qBittorrent pour le téléchargement.
```env
# Note : Il faut aussi inclure les dépendances, comme le VPN (gluetun) pour les services de téléchargement.
COMPOSE_PROFILES=jellyfin,sonarr,prowlarr,qbittorrent,gluetun
```

Vous pouvez bien sûr mixer les deux modes.

## 4. Démarrage et Gestion de la Stack

Une fois votre fichier `.env` configuré, lancez tous les services :

```bash
make up
```

Votre serveur est maintenant en ligne ! Les services seront accessibles via leurs sous-domaines respectifs (ex: `https://jellyfin.mondomaine.com`).

### Commandes Utiles

Utilisez les commandes `make` pour gérer votre stack :
-   `make down` : Arrête tous les services.
-   `make logs` : Affiche les journaux en temps réel.
-   `make pull` : Met à jour les images de vos services.
-   `make ps` : Affiche le statut de vos conteneurs.

Consultez `make help` pour voir toutes les commandes disponibles.
