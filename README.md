<div align="center">

# Homelab-Media-Server v5.0.0

**Plateforme complete de deploiement de serveur multimedia personnel avec Docker**

*Inspire de YunoHost pour la robustesse et la facilite d'utilisation*

[![License](https://img.shields.io/github/license/BluuArtiis-FR/Homelab-Media-Server?style=for-the-badge)](LICENSE)
[![Deploy](https://img.shields.io/github/actions/workflow/status/BluuArtiis-FR/Homelab-Media-Server/pages/pages-build-deployment?label=Deploy&style=for-the-badge)](https://bluuartiis-fr.github.io/Homelab-Media-Server/)

[Configurateur Web](https://bluuartiis-fr.github.io/Homelab-Media-Server/) | [Guide Avance](./docs/GUIDE_AVANCE.md) | [Troubleshooting](./docs/TROUBLESHOOTING.md)

</div>

---

## Fonctionnalites

- **60+ services Docker** pre-configures avec healthchecks et limites de ressources
- **SSL automatique** via Traefik + Let's Encrypt
- **SSO integre** avec Authentik pour tous vos services
- **Systeme de profils** pour activer/desactiver facilement des groupes de services
- **Stack de monitoring** complete (Prometheus, Grafana, Alertmanager)
- **Backup integre** avec Duplicati + scripts de sauvegarde DB
- **VPN pour telechargements** via Gluetun
- **Configurateur web** pour generer votre configuration sans toucher au code
- **CLI puissante** avec Makefile pour gerer votre stack

---

## Demarrage Rapide

### Option 1: Configurateur Web (Recommande)

1. Allez sur [le configurateur](https://bluuartiis-fr.github.io/Homelab-Media-Server/)
2. Selectionnez vos services
3. Configurez votre domaine et vos chemins
4. Telechargez le package `.zip`
5. Extrayez et lancez `docker compose up -d`

### Option 2: CLI

```bash
# Cloner le depot
git clone https://github.com/BluuArtiis-FR/Homelab-Media-Server.git
cd Homelab-Media-Server

# Installation initiale
make install

# Editer la configuration
nano .env

# Generer les secrets
make secrets-generate

# Demarrer les services
make up
```

---

## Architecture

```
                         INTERNET
                            |
                     +------v------+
                     |   TRAEFIK   |
                     | (SSL/Proxy) |
                     +------+------+
                            |
            +---------------+---------------+
            |                               |
     +------v------+                 +------v------+
     |  AUTHENTIK  |                 |  SERVICES   |
     |    (SSO)    |                 |  (Profils)  |
     +-------------+                 +------+------+
                                            |
       +----------+----------+----------+---+---+----------+
       |          |          |          |       |          |
    +--v--+   +---v--+   +--v---+   +--v--+  +--v--+   +--v---+
    |MEDIA|   |CLOUD |   |OFFICE|   |DOCS |  |UTILS|   | ... |
    +-----+   +------+   +------+   +-----+  +-----+   +-----+
```

---

## Services Disponibles

### Media & Streaming
| Service | Description | URL |
|---------|-------------|-----|
| Jellyfin | Serveur multimedia | `jellyfin.DOMAIN` |
| Jellyseerr | Demandes de contenu | `requests.DOMAIN` |
| Tdarr | Transcodage automatique | `tdarr.DOMAIN` |
| Jellystat | Statistiques Jellyfin | `jellystat.DOMAIN` |

### Download & Automation
| Service | Description | URL |
|---------|-------------|-----|
| Gluetun | Tunnel VPN | - |
| qBittorrent | Client torrent | `localhost:8080` |
| Prowlarr | Gestionnaire d'indexeurs | `prowlarr.DOMAIN` |
| Sonarr | Series TV | `sonarr.DOMAIN` |
| Radarr | Films | `radarr.DOMAIN` |
| Lidarr | Musique | `lidarr.DOMAIN` |
| Bazarr | Sous-titres | `bazarr.DOMAIN` |

### Cloud & Files
| Service | Description | URL |
|---------|-------------|-----|
| Nextcloud | Cloud personnel | `nextcloud.DOMAIN` |
| Duplicati | Sauvegarde | `backup.DOMAIN` |
| FileBrowser | Gestionnaire de fichiers | `files.DOMAIN` |

### Office & Productivity
| Service | Description | URL |
|---------|-------------|-----|
| OnlyOffice | Suite bureautique | `office.DOMAIN` |
| Stirling PDF | Outils PDF | `pdf.DOMAIN` |
| Jirafeau | Partage de fichiers | `share.DOMAIN` |

### Documentation & Notes
| Service | Description | URL |
|---------|-------------|-----|
| Bookstack | Wiki | `wiki.DOMAIN` |
| Paperless-NGX | GED | `paperless.DOMAIN` |

### Security
| Service | Description | URL |
|---------|-------------|-----|
| Vaultwarden | Gestionnaire de mots de passe | `vault.DOMAIN` |
| Tailscale | VPN mesh | - |

### Photos
| Service | Description | URL |
|---------|-------------|-----|
| Immich | Sauvegarde photos | `photos.DOMAIN` |

### Finance
| Service | Description | URL |
|---------|-------------|-----|
| Firefly III | Gestion finances | `finance.DOMAIN` |

### Home Automation
| Service | Description | URL |
|---------|-------------|-----|
| Home Assistant | Domotique | `home.DOMAIN` |

### Utils
| Service | Description | URL |
|---------|-------------|-----|
| FreshRSS | Lecteur RSS | `rss.DOMAIN` |
| MeTube | Telechargeur video | `metube.DOMAIN` |
| Changedetection | Surveillance web | `changes.DOMAIN` |
| Shlink | Raccourcisseur URL | `s.DOMAIN` |

### Management
| Service | Description | URL |
|---------|-------------|-----|
| Portainer | UI Docker | `portainer.DOMAIN` |
| Code-Server | VS Code web | `code.DOMAIN` |
| Dozzle | Logs Docker | `logs.DOMAIN` |

### Network
| Service | Description | URL |
|---------|-------------|-----|
| AdGuard Home | DNS/Bloqueur pub | `adguard.DOMAIN` |

### Monitoring
| Service | Description | URL |
|---------|-------------|-----|
| Prometheus | Metriques | `prometheus.DOMAIN` |
| Grafana | Dashboards | `grafana.DOMAIN` |
| Alertmanager | Alertes | `alerts.DOMAIN` |

---

## Commandes Make

```bash
# Gestion de la stack
make up              # Demarrer les services
make down            # Arreter les services
make restart         # Redemarrer
make update          # Mise a jour complete

# Monitoring
make ps              # Liste des conteneurs
make logs            # Tous les logs
make logs s=jellyfin # Logs d'un service
make health          # Verification sante

# Backup
make backup          # Sauvegarde configuration
make db-backup       # Sauvegarde bases de donnees
make restore f=FILE  # Restauration

# Diagnostic
make diagnose        # Diagnostic complet
make info            # Informations installation
make services        # Liste des services

# Utilitaires
make secrets-generate # Generer secrets
make shell s=SERVICE  # Shell dans conteneur
make validate        # Valider docker-compose
```

---

## Configuration

### Profils

Editez `COMPOSE_PROFILES` dans `.env`:

```bash
# Stack media de base
COMPOSE_PROFILES=media,download

# Stack complete
COMPOSE_PROFILES=media,download,cloud,office,docs,security,recipes,photos,finance,inventory,home-automation,utils,management,network,monitoring
```

### Secrets

Generez tous les secrets avec:

```bash
make secrets-generate
```

Puis copiez les valeurs dans votre `.env`.

---

## Pre-requis

- **Docker** 24.0+
- **Docker Compose** v2.20+
- **Nom de domaine** avec acces aux enregistrements DNS
- **Ports 80/443** ouverts
- **4 Go RAM** minimum (8 Go recommandes)
- **20 Go disque** minimum pour les services

---

## Structure du Projet

```
.
├── docker-compose.yml      # Definition des 60+ services
├── .env.example            # Template de configuration
├── .env                    # Votre configuration (a creer)
├── Makefile                # Interface CLI
├── GEMINI.md               # Instructions pour Gemini CLI
├── install.sh              # Script d'installation Linux
├── config/                 # Configurations des services
├── data/                   # Donnees des applications
├── downloads/              # Fichiers telecharges
├── media/                  # Bibliotheque multimedia
├── uploads/                # Photos Immich
├── backups/                # Sauvegardes
├── homelab-configurator/   # Application React du configurateur
└── docs/
    ├── GUIDE_AVANCE.md     # Guide CLI
    └── TROUBLESHOOTING.md  # Depannage
```

---

## Securite

- **SSL/TLS** automatique via Let's Encrypt
- **Headers de securite** configures (HSTS, X-Frame-Options, etc.)
- **SSO centralise** avec Authentik
- **VPN obligatoire** pour les telechargements
- **Secrets** generes aleatoirement
- **Healthchecks** sur tous les services

---

## Contribuer

Les contributions sont les bienvenues ! Voir [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Support

- **Documentation**: Ce README + [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/BluuArtiis-FR/Homelab-Media-Server/issues)
- **Gemini CLI**: Le fichier `GEMINI.md` permet d'obtenir de l'aide via Gemini

---

## Licence

MIT License - Voir [LICENSE](LICENSE)

---

<div align="center">

**Homelab-Media-Server** - Votre serveur multimedia, simplifie.

</div>
