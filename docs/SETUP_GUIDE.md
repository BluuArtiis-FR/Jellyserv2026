# Guide de Configuration Initiale

Ce guide vous accompagne dans la configuration de votre stack media apres le premier demarrage.

## Table des Matieres

1. [Premier Demarrage](#premier-demarrage)
2. [Configuration de Prowlarr](#configuration-de-prowlarr)
3. [Configuration de Sonarr](#configuration-de-sonarr)
4. [Configuration de Radarr](#configuration-de-radarr)
5. [Configuration de Lidarr](#configuration-de-lidarr)
6. [Configuration de Readarr](#configuration-de-readarr)
7. [Configuration de Bazarr](#configuration-de-bazarr)
8. [Configuration de Jellyfin](#configuration-de-jellyfin)
9. [Configuration de Jellyseerr](#configuration-de-jellyseerr)
10. [Configuration de Recyclarr](#configuration-de-recyclarr)
11. [Configuration de Requestrr](#configuration-de-requestrr)
12. [Configuration de Wizarr](#configuration-de-wizarr)
13. [Configuration de Maintainerr](#configuration-de-maintainerr)
14. [Configuration de Cross-Seed](#configuration-de-cross-seed)

---

## Premier Demarrage

Apres `docker compose up -d`, attendez quelques minutes que tous les services demarrent.

### Verifier l'etat des services

```bash
make health
# ou
docker compose ps
```

### URLs de Configuration

| Service | URL | Identifiants par defaut |
|---------|-----|------------------------|
| Prowlarr | `https://prowlarr.DOMAIN` | A creer au premier acces |
| Sonarr | `https://sonarr.DOMAIN` | A creer au premier acces |
| Radarr | `https://radarr.DOMAIN` | A creer au premier acces |
| Lidarr | `https://lidarr.DOMAIN` | A creer au premier acces |
| Readarr | `https://readarr.DOMAIN` | A creer au premier acces |
| Bazarr | `https://bazarr.DOMAIN` | A creer au premier acces |
| Jellyfin | `https://jellyfin.DOMAIN` | Assistant de configuration |
| Wizarr | `https://invite.DOMAIN` | A creer au premier acces |
| Maintainerr | `https://maintainerr.DOMAIN` | A creer au premier acces |
| qBittorrent | `http://localhost:8080` | admin / adminadmin |
| Cross-Seed | `http://localhost:2468` | Voir config.js |

---

## Configuration de Prowlarr

Prowlarr est le gestionnaire d'indexeurs centralise pour tous vos *arr.

### 1. Ajouter FlareSolverr

FlareSolverr permet de contourner les protections Cloudflare.

1. Allez dans **Settings > Indexers**
2. Cliquez sur le **+** a cote de "Indexer Proxies"
3. Selectionnez **FlareSolverr**
4. Configurez:
   - **Name**: `FlareSolverr`
   - **Tags**: laissez vide (applique a tous)
   - **Host**: `http://flaresolverr:8191`
5. Cliquez sur **Test** puis **Save**

### 2. Ajouter des Indexeurs

1. Allez dans **Indexers**
2. Cliquez sur **Add Indexer**
3. Recherchez vos indexeurs preferes (1337x, RARBG, etc.)
4. Pour les indexeurs proteges par Cloudflare, FlareSolverr sera utilise automatiquement

### 3. Connecter les Applications *arr

1. Allez dans **Settings > Apps**
2. Cliquez sur **+** pour chaque application:

**Sonarr:**
- **Name**: `Sonarr`
- **Sync Level**: `Full Sync`
- **Prowlarr Server**: `http://prowlarr:9696`
- **Sonarr Server**: `http://sonarr:8989`
- **API Key**: Copiez depuis Sonarr > Settings > General

**Radarr:**
- **Name**: `Radarr`
- **Sync Level**: `Full Sync`
- **Prowlarr Server**: `http://prowlarr:9696`
- **Radarr Server**: `http://radarr:7878`
- **API Key**: Copiez depuis Radarr > Settings > General

**Lidarr:**
- **Name**: `Lidarr`
- **Sync Level**: `Full Sync`
- **Prowlarr Server**: `http://prowlarr:9696`
- **Lidarr Server**: `http://lidarr:8686`
- **API Key**: Copiez depuis Lidarr > Settings > General

**Readarr:**
- **Name**: `Readarr`
- **Sync Level**: `Full Sync`
- **Prowlarr Server**: `http://prowlarr:9696`
- **Readarr Server**: `http://readarr:8787`
- **API Key**: Copiez depuis Readarr > Settings > General

---

## Configuration de Sonarr

### 1. Recuperer la Cle API

1. Allez dans **Settings > General**
2. Copiez l'**API Key** (vous en aurez besoin pour Prowlarr, Jellyseerr, etc.)

### 2. Ajouter qBittorrent comme Client de Telechargement

1. Allez dans **Settings > Download Clients**
2. Cliquez sur **+** puis selectionnez **qBittorrent**
3. Configurez:
   - **Name**: `qBittorrent`
   - **Host**: `gluetun` (passe par le VPN)
   - **Port**: `8080`
   - **Username**: `admin`
   - **Password**: `adminadmin` (changez-le dans qBittorrent)
   - **Category**: `tv-sonarr`
4. Cliquez sur **Test** puis **Save**

### 3. Configurer les Dossiers Root

1. Allez dans **Settings > Media Management**
2. Cliquez sur **Add Root Folder**
3. Selectionnez `/tv`
4. Activez **Rename Episodes** et **Replace Illegal Characters**

### 4. Configurer les Profils de Qualite

Les profils seront synchronises automatiquement par Recyclarr. Sinon:

1. Allez dans **Settings > Profiles**
2. Creez ou modifiez un profil (ex: "HD - 720p/1080p")
3. Selectionnez les qualites souhaitees

---

## Configuration de Radarr

### 1. Recuperer la Cle API

1. **Settings > General** > Copiez l'**API Key**

### 2. Ajouter qBittorrent

1. **Settings > Download Clients** > **+** > **qBittorrent**
2. Configurez:
   - **Host**: `gluetun`
   - **Port**: `8080`
   - **Username**: `admin`
   - **Password**: `adminadmin`
   - **Category**: `movies-radarr`

### 3. Configurer les Dossiers Root

1. **Settings > Media Management** > **Add Root Folder**
2. Selectionnez `/movies`

---

## Configuration de Lidarr

### 1. Recuperer la Cle API

1. **Settings > General** > Copiez l'**API Key**

### 2. Ajouter qBittorrent

1. **Settings > Download Clients** > **+** > **qBittorrent**
2. Configurez:
   - **Host**: `gluetun`
   - **Port**: `8080`
   - **Category**: `music-lidarr`

### 3. Configurer les Dossiers Root

1. **Settings > Media Management** > **Add Root Folder**
2. Selectionnez `/music`

---

## Configuration de Readarr

### 1. Recuperer la Cle API

1. **Settings > General** > Copiez l'**API Key**

### 2. Ajouter qBittorrent

1. **Settings > Download Clients** > **+** > **qBittorrent**
2. Configurez:
   - **Host**: `gluetun`
   - **Port**: `8080`
   - **Category**: `books-readarr`

### 3. Configurer les Dossiers Root

1. **Settings > Media Management** > **Add Root Folder**
2. Selectionnez `/books`

---

## Configuration de Bazarr

Bazarr gere automatiquement les sous-titres.

### 1. Connecter Sonarr

1. Allez dans **Settings > Sonarr**
2. Activez **Use Sonarr**
3. Configurez:
   - **Address**: `sonarr`
   - **Port**: `8989`
   - **API Key**: Votre cle API Sonarr
4. Cliquez sur **Test** puis **Save**

### 2. Connecter Radarr

1. Allez dans **Settings > Radarr**
2. Activez **Use Radarr**
3. Configurez:
   - **Address**: `radarr`
   - **Port**: `7878`
   - **API Key**: Votre cle API Radarr
4. Cliquez sur **Test** puis **Save**

### 3. Configurer les Fournisseurs de Sous-titres

1. Allez dans **Settings > Providers**
2. Activez les fournisseurs souhaites:
   - **OpenSubtitles.com** (compte gratuit requis)
   - **Subscene**
   - **Addic7ed**
3. Configurez vos langues preferees dans **Settings > Languages**

---

## Configuration de Jellyfin

### 1. Assistant Initial

Au premier acces, Jellyfin lance un assistant:

1. Choisissez votre langue
2. Creez un compte administrateur
3. Ajoutez vos bibliotheques:
   - **Films**: `/data/movies`
   - **Series**: `/data/tv`
   - **Musique**: `/data/music`
4. Configurez les metadonnees (langue, pays)

### 2. Activer le Transcodage Materiel (Optionnel)

1. **Dashboard > Playback > Transcoding**
2. Selectionnez votre acceleration materielle (VAAPI, NVENC, QSV)

---

## Configuration de Jellyseerr

Jellyseerr permet aux utilisateurs de demander des films/series.

### 1. Connecter Jellyfin

1. Au premier acces, selectionnez **Jellyfin**
2. Configurez:
   - **Jellyfin URL**: `http://jellyfin:8096`
   - Connectez-vous avec votre compte admin Jellyfin

### 2. Connecter Radarr

1. Allez dans **Settings > Radarr**
2. Cliquez sur **Add Radarr Server**
3. Configurez:
   - **Server Name**: `Radarr`
   - **Hostname**: `radarr`
   - **Port**: `7878`
   - **API Key**: Votre cle API Radarr
   - **Quality Profile**: Selectionnez votre profil
   - **Root Folder**: `/movies`

### 3. Connecter Sonarr

1. Allez dans **Settings > Sonarr**
2. Cliquez sur **Add Sonarr Server**
3. Configurez:
   - **Server Name**: `Sonarr`
   - **Hostname**: `sonarr`
   - **Port**: `8989`
   - **API Key**: Votre cle API Sonarr
   - **Quality Profile**: Selectionnez votre profil
   - **Root Folder**: `/tv`

---

## Configuration de Recyclarr

Recyclarr synchronise automatiquement les profils de qualite TRaSH Guides.

### 1. Configurer les Cles API

Editez le fichier `.env` et ajoutez:

```bash
SONARR_API_KEY=votre_cle_api_sonarr
RADARR_API_KEY=votre_cle_api_radarr
```

### 2. Executer la Synchronisation

```bash
# Synchronisation manuelle
docker exec recyclarr recyclarr sync

# Voir les logs
docker logs recyclarr
```

### 3. Verifier les Profils

Apres la synchronisation, verifiez dans Sonarr/Radarr:
- **Settings > Profiles**: Nouveaux profils de qualite
- **Settings > Custom Formats**: Formats personnalises TRaSH

---

## Configuration de Requestrr

Requestrr est un bot Discord pour les demandes de contenu.

### 1. Creer un Bot Discord

1. Allez sur [Discord Developer Portal](https://discord.com/developers/applications)
2. Cliquez sur **New Application**
3. Donnez un nom (ex: "Media Requests")
4. Allez dans **Bot** > **Add Bot**
5. Copiez le **Token**
6. Activez **Message Content Intent** dans **Privileged Gateway Intents**
7. Allez dans **OAuth2 > URL Generator**
8. Selectionnez les scopes: `bot`, `applications.commands`
9. Selectionnez les permissions: `Send Messages`, `Embed Links`, `Add Reactions`
10. Copiez l'URL et invitez le bot sur votre serveur

### 2. Configurer Requestrr

1. Accedez a `https://requestrr.DOMAIN`
2. Creez un compte administrateur
3. Allez dans **Bot Settings**:
   - **Bot Token**: Collez votre token Discord
   - **Command Prefix**: `!` (ou autre)
4. Allez dans **Movies > Radarr**:
   - **Hostname**: `radarr`
   - **Port**: `7878`
   - **API Key**: Votre cle API Radarr
5. Allez dans **TV Shows > Sonarr**:
   - **Hostname**: `sonarr`
   - **Port**: `8989`
   - **API Key**: Votre cle API Sonarr

### 3. Utilisation

Sur Discord, vos utilisateurs peuvent:
- `!movie <titre>` - Demander un film
- `!tv <titre>` - Demander une serie

---

## Configuration de Wizarr

Wizarr simplifie l'invitation d'utilisateurs a votre serveur Jellyfin.

### 1. Configuration Initiale

1. Accedez a `https://invite.DOMAIN`
2. Creez un compte administrateur
3. Connectez Jellyfin:
   - **Server URL**: `http://jellyfin:8096`
   - **API Key**: Creez une cle API dans Jellyfin > Dashboard > API Keys

### 2. Creer des Invitations

1. Allez dans **Invitations**
2. Cliquez sur **Create Invitation**
3. Configurez:
   - **Uses**: Nombre d'utilisations (1 pour invitation unique)
   - **Expiry**: Duree de validite
   - **Libraries**: Bibliotheques accessibles
4. Partagez le lien genere avec vos invites

### 3. Fonctionnalites

- Onboarding automatique des nouveaux utilisateurs
- Personnalisation du message de bienvenue
- Gestion des bibliotheques par invitation
- Expiration automatique des liens

---

## Configuration de Maintainerr

Maintainerr nettoie automatiquement vos bibliotheques des medias non regardes.

### 1. Connecter les Services

1. Accedez a `https://maintainerr.DOMAIN`
2. Allez dans **Settings > Connections**
3. Ajoutez Jellyfin:
   - **URL**: `http://jellyfin:8096`
   - **API Key**: Votre cle API Jellyfin
4. Ajoutez Sonarr (optionnel):
   - **URL**: `http://sonarr:8989`
   - **API Key**: Votre cle API Sonarr
5. Ajoutez Radarr (optionnel):
   - **URL**: `http://radarr:7878`
   - **API Key**: Votre cle API Radarr

### 2. Creer des Regles

1. Allez dans **Rules**
2. Cliquez sur **Add Rule**
3. Exemples de regles:
   - **Films non regardes depuis 6 mois**
   - **Series terminees sans visionnage**
   - **Medias avec mauvaise note**
4. Configurez l'action: **Delete** ou **Move to collection**

### 3. Planification

1. Allez dans **Settings > Scheduler**
2. Configurez la frequence d'execution
3. Activez les notifications (optionnel)

---

## Configuration de Cross-Seed

Cross-Seed permet le cross-seeding automatique pour ameliorer vos ratios sur les trackers.

### 1. Configuration du fichier config.js

Editez `config/cross-seed/config.js`:

```javascript
module.exports = {
  // Client torrent
  qbittorrentUrl: "http://gluetun:8080",
  action: "inject",

  // Chemins
  torrentDir: "/downloads",
  outputDir: "/cross-seed",

  // Indexeurs Torznab depuis Prowlarr
  // Prowlarr > Settings > Apps > Show Indexer URLs
  torznab: [
    "http://prowlarr:9696/1/api?apikey=VOTRE_CLE_API",
    "http://prowlarr:9696/2/api?apikey=VOTRE_CLE_API"
  ],

  // Delai entre recherches (respectez les indexeurs)
  delay: 30,

  // Port API
  port: 2468,
};
```

### 2. Obtenir les URLs Torznab

1. Dans Prowlarr, allez dans **Settings > Apps**
2. Cliquez sur votre indexeur
3. Copiez l'URL Torznab complete
4. Ajoutez-la dans le tableau `torznab` de config.js

### 3. Utilisation

Cross-Seed fonctionne en mode daemon et scanne automatiquement vos torrents.

```bash
# Voir les logs
docker logs cross-seed

# Forcer un scan
docker exec cross-seed cross-seed search
```

### 4. Conseils

- Commencez avec `action: "save"` pour tester sans injecter
- Utilisez `matchMode: "safe"` pour eviter les faux positifs
- Respectez les delais pour ne pas surcharger les indexeurs

---

## Recapitulatif des URLs Internes

Pour la communication entre services Docker, utilisez ces URLs:

| Service | URL Interne |
|---------|-------------|
| Prowlarr | `http://prowlarr:9696` |
| Sonarr | `http://sonarr:8989` |
| Radarr | `http://radarr:7878` |
| Lidarr | `http://lidarr:8686` |
| Readarr | `http://readarr:8787` |
| Bazarr | `http://bazarr:6767` |
| Jellyfin | `http://jellyfin:8096` |
| qBittorrent | `http://gluetun:8080` |
| FlareSolverr | `http://flaresolverr:8191` |
| Wizarr | `http://wizarr:5690` |
| Maintainerr | `http://maintainerr:6246` |
| Cross-Seed | `http://cross-seed:2468` |

---

## Ordre de Configuration Recommande

1. **qBittorrent** - Changez le mot de passe par defaut
2. **Prowlarr** - Ajoutez FlareSolverr et vos indexeurs
3. **Sonarr/Radarr/Lidarr/Readarr** - Configurez les clients de telechargement et dossiers
4. **Prowlarr** - Connectez les applications *arr
5. **Recyclarr** - Synchronisez les profils de qualite
6. **Bazarr** - Connectez Sonarr/Radarr pour les sous-titres
7. **Jellyfin** - Ajoutez vos bibliotheques
8. **Jellyseerr** - Connectez Jellyfin et les *arr pour les demandes
9. **Wizarr** - Configurez les invitations Jellyfin
10. **Maintainerr** - Configurez les regles de nettoyage
11. **Cross-Seed** - Configurez le cross-seeding (optionnel)
12. **Requestrr** - Configurez le bot Discord (optionnel)

---

## Troubleshooting

### Les indexeurs ne fonctionnent pas

1. Verifiez que FlareSolverr est demarre: `docker logs flaresolverr`
2. Testez FlareSolverr: `curl http://localhost:8191/health`
3. Dans Prowlarr, verifiez que le proxy FlareSolverr est configure

### qBittorrent inaccessible

1. Verifiez que Gluetun est connecte au VPN: `docker logs gluetun`
2. Verifiez les credentials VPN dans `.env`

### Recyclarr ne synchronise pas

1. Verifiez les cles API: `docker logs recyclarr`
2. Testez la connexion: `docker exec recyclarr recyclarr sync --preview`

### Jellyfin ne trouve pas les medias

1. Verifiez les chemins: `/data/movies`, `/data/tv`, `/data/music`
2. Verifiez les permissions: `ls -la /path/to/media`
3. Relancez un scan de bibliotheque dans Jellyfin

---

## Support

- **Documentation**: [README.md](../README.md)
- **Troubleshooting**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- **Issues**: [GitHub Issues](https://github.com/BluuArtiis-FR/Jellyserv2026/issues)
