// services.js
// This file is the "manifest" of all services available in docker-compose.yml
// It defines their group, dependencies, and specific configuration variables.
// SYNCHRONIZED with docker-compose.yml v5.0.0 (62 services)

// Helper function to create a standard secret variable definition
const createSecret = (name, description, link_to = null) => ({
  name,
  description,
  type: 'password',
  link_to: link_to || name,
  generator: true
});

export const SERVICE_GROUPS = {
  "infrastructure": "🏗️ Infrastructure (Toujours actif)",
  "download": "⬇️ Téléchargement & Automatisation",
  "media": "🎬 Média & Streaming",
  "cloud": "☁️ Cloud Personnel & Fichiers",
  "office": "💼 Bureautique & Productivité",
  "docs": "📚 Documentation & Prise de Notes",
  "monitoring": "📊 Monitoring & Alertes",
  "management": "🛠️ Gestion de la Stack",
  "recipes": "🍲 Gestion de Recettes",
  "photos": "🖼️ Gestion de Photos",
  "home-automation": "🏠 Domotique",
  "utils": "⚙️ Utilitaires",
  "finance": "💰 Finances Personnelles",
  "security": "🛡️ Sécurité",
  "inventory": "📦 Inventaire & Stock",
  "network": "🌐 Réseau & DNS",
  "remote-support": "🆘 Support à distance",
  "health-fitness": "💪 Santé & Fitness"
};

export const SERVICE_MANIFEST = {
  // ===========================================================================
  // INFRASTRUCTURE - Always active (no profile)
  // ===========================================================================
  "traefik": {
    group: "infrastructure",
    name: "Traefik",
    description: "Reverse proxy et load balancer avec SSL automatique via Let's Encrypt.",
    doc_url: "https://doc.traefik.io/traefik/",
    always_on: true,
    port: 443,
    env_vars: [
      { name: "ACME_EMAIL", description: "Email pour les certificats Let's Encrypt.", type: "email" }
    ]
  },
  "authentik-postgres": {
    group: "infrastructure",
    name: "Authentik PostgreSQL",
    description: "Base de données PostgreSQL pour Authentik.",
    internal: true,
    always_on: true
  },
  "authentik-redis": {
    group: "infrastructure",
    name: "Authentik Redis",
    description: "Cache Redis pour Authentik.",
    internal: true,
    always_on: true
  },
  "authentik-server": {
    group: "infrastructure",
    name: "Authentik Server",
    description: "Serveur d'authentification SSO et gestion d'identité.",
    doc_url: "https://docs.goauthentik.io/",
    always_on: true,
    dependencies: ["authentik-postgres", "authentik-redis"],
    expose: true,
    subdomain: "auth",
    port: 9000,
    env_vars: [
      createSecret("AUTHENTIK_SECRET_KEY", "Clé secrète pour Authentik (min 50 caractères)."),
      createSecret("AUTHENTIK_PG_PASS", "Mot de passe PostgreSQL pour Authentik.")
    ]
  },
  "authentik-worker": {
    group: "infrastructure",
    name: "Authentik Worker",
    description: "Worker de tâches pour Authentik.",
    internal: true,
    always_on: true,
    dependencies: ["authentik-postgres", "authentik-redis"]
  },

  // ===========================================================================
  // DOWNLOAD PROFILE - Download services
  // ===========================================================================
  "gluetun": {
    group: "download",
    name: "Gluetun (VPN)",
    description: "Container VPN essentiel pour anonymiser le trafic des services de téléchargement.",
    doc_url: "https://github.com/qdm12/gluetun-wiki",
    dependencies: [],
    env_vars: [
      { name: "VPN_SERVICE_PROVIDER", description: "Fournisseur VPN.", type: "select", options: ['protonvpn', 'mullvad', 'nordvpn', 'expressvpn', 'private internet access', 'surfshark', 'windscribe', 'custom'] },
      { name: "VPN_TYPE", description: "Type de protocole VPN.", type: "select", options: ['openvpn', 'wireguard'] },
      { name: "OPENVPN_USER", description: "Nom d'utilisateur OpenVPN.", type: "text", condition: (config) => config.VPN_TYPE === 'openvpn' },
      { name: "OPENVPN_PASSWORD", description: "Mot de passe OpenVPN.", type: "password", condition: (config) => config.VPN_TYPE === 'openvpn' },
      { name: "SERVER_COUNTRIES", description: "Pays des serveurs VPN (séparés par virgule).", type: "text", default: "Switzerland" }
    ]
  },
  "qbittorrent": {
    group: "download",
    name: "qBittorrent",
    description: "Client BitTorrent avec interface web.",
    doc_url: "https://github.com/qbittorrent/qBittorrent/wiki",
    dependencies: ["gluetun"],
    port: 8080
  },
  "prowlarr": {
    group: "download",
    name: "Prowlarr",
    description: "Gestionnaire d'indexers pour Sonarr, Radarr, Lidarr.",
    doc_url: "https://wiki.servarr.com/prowlarr",
    dependencies: ["gluetun"],
    expose: true,
    subdomain: "prowlarr",
    port: 9696
  },
  "sonarr": {
    group: "download",
    name: "Sonarr",
    description: "Gestion automatique de séries TV.",
    doc_url: "https://wiki.servarr.com/sonarr",
    dependencies: ["prowlarr"],
    expose: true,
    subdomain: "sonarr",
    port: 8989,
    env_vars: [
      createSecret("SONARR_API_KEY", "Clé API pour Sonarr (obtenue dans Settings > General).")
    ]
  },
  "radarr": {
    group: "download",
    name: "Radarr",
    description: "Gestion automatique de films.",
    doc_url: "https://wiki.servarr.com/radarr",
    dependencies: ["prowlarr"],
    expose: true,
    subdomain: "radarr",
    port: 7878,
    env_vars: [
      createSecret("RADARR_API_KEY", "Clé API pour Radarr (obtenue dans Settings > General).")
    ]
  },
  "lidarr": {
    group: "download",
    name: "Lidarr",
    description: "Gestion automatique de musique.",
    doc_url: "https://wiki.servarr.com/lidarr",
    dependencies: ["prowlarr"],
    expose: true,
    subdomain: "lidarr",
    port: 8686,
    env_vars: [
      createSecret("LIDARR_API_KEY", "Clé API pour Lidarr.")
    ]
  },
  "bazarr": {
    group: "download",
    name: "Bazarr",
    description: "Gestion de sous-titres pour Sonarr & Radarr.",
    doc_url: "https://wiki.bazarr.media",
    dependencies: ["sonarr", "radarr"],
    expose: true,
    subdomain: "bazarr",
    port: 6767
  },
  "unpackerr": {
    group: "download",
    name: "Unpackerr",
    description: "Décompresse automatiquement les archives téléchargées.",
    doc_url: "https://unpackerr.zip",
    dependencies: ["sonarr", "radarr"],
    internal: true
  },

  // ===========================================================================
  // MEDIA PROFILE - Streaming and media management
  // ===========================================================================
  "jellyfin": {
    group: "media",
    name: "Jellyfin",
    description: "Serveur de streaming multimédia open source.",
    doc_url: "https://jellyfin.org/docs",
    expose: true,
    subdomain: "jellyfin",
    port: 8096
  },
  "jellyseerr": {
    group: "media",
    name: "Jellyseerr",
    description: "Interface de demandes de contenu pour Jellyfin.",
    doc_url: "https://docs.overseerr.dev",
    dependencies: ["jellyfin"],
    expose: true,
    subdomain: "requests",
    port: 5055
  },
  "tdarr": {
    group: "media",
    name: "Tdarr",
    description: "Automatisation du transcodage de librairies multimédias.",
    doc_url: "https://docs.tdarr.io",
    expose: true,
    subdomain: "tdarr",
    port: 8265
  },
  "jellystat": {
    group: "media",
    name: "Jellystat",
    description: "Statistiques et suivi d'activité pour Jellyfin.",
    doc_url: "https://github.com/CyferShepard/Jellystat",
    dependencies: ["jellyfin", "jellystat-db"],
    expose: true,
    subdomain: "jellystat",
    port: 3000,
    env_vars: [
      createSecret("JELLYSTAT_DB_PASS", "Mot de passe PostgreSQL pour Jellystat."),
      createSecret("JELLYSTAT_JWT_SECRET", "Clé secrète JWT pour Jellystat.")
    ]
  },
  "jellystat-db": {
    group: "media",
    name: "Jellystat DB",
    description: "Base de données PostgreSQL pour Jellystat.",
    internal: true
  },

  // ===========================================================================
  // CLOUD PROFILE - Storage and files
  // ===========================================================================
  "nextcloud": {
    group: "cloud",
    name: "Nextcloud",
    description: "Suite cloud personnel (fichiers, contacts, calendriers...).",
    doc_url: "https://docs.nextcloud.com",
    dependencies: ["nextcloud-db", "nextcloud-redis"],
    expose: true,
    subdomain: "nextcloud",
    port: 80,
    env_vars: [
      createSecret("NEXTCLOUD_ADMIN_PASS", "Mot de passe administrateur Nextcloud."),
      createSecret("NEXTCLOUD_DB_PASS", "Mot de passe PostgreSQL pour Nextcloud.")
    ]
  },
  "nextcloud-db": {
    group: "cloud",
    name: "Nextcloud DB",
    description: "Base de données PostgreSQL pour Nextcloud.",
    internal: true
  },
  "nextcloud-redis": {
    group: "cloud",
    name: "Nextcloud Redis",
    description: "Cache Redis pour Nextcloud.",
    internal: true
  },
  "duplicati": {
    group: "cloud",
    name: "Duplicati",
    description: "Logiciel de sauvegarde avec chiffrement.",
    doc_url: "https://duplicati.readthedocs.io",
    expose: true,
    subdomain: "backup",
    port: 8200
  },
  "filebrowser": {
    group: "cloud",
    name: "FileBrowser",
    description: "Interface web de gestion de fichiers.",
    doc_url: "https://filebrowser.org",
    expose: true,
    subdomain: "files",
    port: 80
  },

  // ===========================================================================
  // OFFICE PROFILE - Office suite
  // ===========================================================================
  "onlyoffice": {
    group: "office",
    name: "OnlyOffice",
    description: "Suite bureautique en ligne (édition de documents).",
    doc_url: "https://helpcenter.onlyoffice.com",
    expose: true,
    subdomain: "office",
    port: 80,
    env_vars: [
      createSecret("ONLYOFFICE_JWT_SECRET", "Clé secrète JWT pour OnlyOffice.")
    ]
  },
  "stirling-pdf": {
    group: "office",
    name: "Stirling PDF",
    description: "Outil complet pour manipuler les fichiers PDF.",
    doc_url: "https://docs.stirlingpdf.com",
    expose: true,
    subdomain: "pdf",
    port: 8080
  },
  "jirafeau": {
    group: "office",
    name: "Jirafeau",
    description: "Partage de fichiers volumineux avec un lien temporaire.",
    doc_url: "https://gitlab.com/mojo42/jirafeau",
    expose: true,
    subdomain: "share",
    port: 80
  },

  // ===========================================================================
  // DOCS PROFILE - Documentation and notes
  // ===========================================================================
  "bookstack": {
    group: "docs",
    name: "Bookstack",
    description: "Plateforme de documentation et de wiki.",
    doc_url: "https://www.bookstackapp.com/docs",
    dependencies: ["bookstack-db"],
    expose: true,
    subdomain: "wiki",
    port: 80,
    env_vars: [
      createSecret("BOOKSTACK_DB_PASS", "Mot de passe MariaDB pour Bookstack."),
      createSecret("BOOKSTACK_DB_ROOT_PASS", "Mot de passe root MariaDB (optionnel).")
    ]
  },
  "bookstack-db": {
    group: "docs",
    name: "Bookstack DB",
    description: "Base de données MariaDB pour Bookstack.",
    internal: true
  },
  "paperless-ngx": {
    group: "docs",
    name: "Paperless-ngx",
    description: "Archive numérique intelligente pour documents physiques.",
    doc_url: "https://docs.paperless-ngx.com",
    dependencies: ["paperless-db", "paperless-redis"],
    expose: true,
    subdomain: "paperless",
    port: 8000,
    env_vars: [
      createSecret("PAPERLESS_SECRET_KEY", "Clé secrète pour Paperless-ngx."),
      createSecret("PAPERLESS_DB_PASS", "Mot de passe PostgreSQL pour Paperless."),
      { name: "PAPERLESS_ADMIN_USER", description: "Nom d'utilisateur admin.", type: "text", default: "admin" },
      createSecret("PAPERLESS_ADMIN_PASS", "Mot de passe admin pour Paperless.")
    ]
  },
  "paperless-db": {
    group: "docs",
    name: "Paperless DB",
    description: "Base de données PostgreSQL pour Paperless.",
    internal: true
  },
  "paperless-redis": {
    group: "docs",
    name: "Paperless Redis",
    description: "Cache Redis pour Paperless.",
    internal: true
  },

  // ===========================================================================
  // SECURITY PROFILE - Security and passwords
  // ===========================================================================
  "vaultwarden": {
    group: "security",
    name: "Vaultwarden",
    description: "Gestionnaire de mots de passe compatible Bitwarden.",
    doc_url: "https://github.com/dani-garcia/vaultwarden/wiki",
    expose: true,
    subdomain: "vault",
    port: 80,
    env_vars: [
      { name: "VAULTWARDEN_SIGNUPS", description: "Autoriser les inscriptions.", type: "select", options: ['true', 'false'], default: 'false' },
      createSecret("VAULTWARDEN_ADMIN_TOKEN", "Token admin pour Vaultwarden (optionnel).")
    ]
  },
  "tailscale": {
    group: "security",
    name: "Tailscale",
    description: "Réseau privé VPN entre vos appareils.",
    doc_url: "https://tailscale.com/kb",
    env_vars: [
      { name: "TAILSCALE_AUTHKEY", description: "Clé d'authentification Tailscale.", type: "text" }
    ]
  },

  // ===========================================================================
  // RECIPES PROFILE - Recipe management
  // ===========================================================================
  "mealie": {
    group: "recipes",
    name: "Mealie",
    description: "Gestionnaire de recettes de cuisine.",
    doc_url: "https://docs.mealie.io",
    expose: true,
    subdomain: "recipes",
    port: 9000
  },

  // ===========================================================================
  // PHOTOS PROFILE - Photo management
  // ===========================================================================
  "immich-server": {
    group: "photos",
    name: "Immich",
    description: "Solution de sauvegarde de photos et vidéos (Google Photos alternative).",
    doc_url: "https://immich.app/docs",
    dependencies: ["immich-db", "immich-redis", "immich-ml"],
    expose: true,
    subdomain: "photos",
    port: 3001,
    env_vars: [
      createSecret("IMMICH_DB_PASS", "Mot de passe PostgreSQL pour Immich.")
    ]
  },
  "immich-ml": {
    group: "photos",
    name: "Immich ML",
    description: "Service Machine Learning pour Immich (reconnaissance faciale, etc.).",
    internal: true,
    port: 3003
  },
  "immich-db": {
    group: "photos",
    name: "Immich DB",
    description: "Base de données PostgreSQL avec pgvecto-rs pour Immich.",
    internal: true
  },
  "immich-redis": {
    group: "photos",
    name: "Immich Redis",
    description: "Cache Redis pour Immich.",
    internal: true
  },

  // ===========================================================================
  // FINANCE PROFILE - Financial management
  // ===========================================================================
  "firefly-iii": {
    group: "finance",
    name: "Firefly III",
    description: "Gestionnaire de finances personnelles.",
    doc_url: "https://docs.firefly-iii.org",
    dependencies: ["firefly-db"],
    expose: true,
    subdomain: "finance",
    port: 8080,
    env_vars: [
      createSecret("FIREFLY_APP_KEY", "Clé d'application Laravel (32 caractères)."),
      createSecret("FIREFLY_DB_PASS", "Mot de passe PostgreSQL pour Firefly III.")
    ]
  },
  "firefly-db": {
    group: "finance",
    name: "Firefly DB",
    description: "Base de données PostgreSQL pour Firefly III.",
    internal: true
  },

  // ===========================================================================
  // INVENTORY PROFILE - Stock management
  // ===========================================================================
  "grocy": {
    group: "inventory",
    name: "Grocy",
    description: "ERP pour votre maison, gestion de stock alimentaire.",
    doc_url: "https://grocy.info",
    expose: true,
    subdomain: "grocy",
    port: 80
  },

  // ===========================================================================
  // HOME-AUTOMATION PROFILE - Home automation
  // ===========================================================================
  "home-assistant": {
    group: "home-automation",
    name: "Home Assistant",
    description: "Plateforme de domotique open-source.",
    doc_url: "https://www.home-assistant.io/docs",
    expose: true,
    subdomain: "home",
    port: 8123
  },

  // ===========================================================================
  // UTILS PROFILE - Various utilities
  // ===========================================================================
  "freshrss": {
    group: "utils",
    name: "FreshRSS",
    description: "Agrégateur de flux RSS auto-hébergé.",
    doc_url: "https://freshrss.github.io/FreshRSS",
    expose: true,
    subdomain: "rss",
    port: 80
  },
  "metube": {
    group: "utils",
    name: "MeTube",
    description: "Téléchargeur vidéo basé sur yt-dlp.",
    doc_url: "https://github.com/alexta69/metube",
    expose: true,
    subdomain: "metube",
    port: 8081
  },
  "changedetection": {
    group: "utils",
    name: "Changedetection.io",
    description: "Surveille les changements sur les pages web.",
    doc_url: "https://changedetection.io/docs",
    dependencies: ["changedetection-browser"],
    expose: true,
    subdomain: "changes",
    port: 5000
  },
  "changedetection-browser": {
    group: "utils",
    name: "Changedetection Browser",
    description: "Navigateur headless Chrome pour Changedetection.",
    internal: true
  },
  "shlink": {
    group: "utils",
    name: "Shlink",
    description: "Raccourcisseur d'URL auto-hébergé.",
    doc_url: "https://shlink.io/documentation",
    dependencies: ["shlink-db"],
    expose: true,
    subdomain: "s",
    port: 8080,
    env_vars: [
      createSecret("SHLINK_DB_PASS", "Mot de passe PostgreSQL pour Shlink."),
      createSecret("SHLINK_API_KEY", "Clé API initiale pour Shlink."),
      { name: "GEOLITE_LICENSE_KEY", description: "Clé MaxMind GeoLite2 (optionnel, pour géolocalisation).", type: "text" }
    ]
  },
  "shlink-db": {
    group: "utils",
    name: "Shlink DB",
    description: "Base de données PostgreSQL pour Shlink.",
    internal: true
  },

  // ===========================================================================
  // MANAGEMENT PROFILE - Administration
  // ===========================================================================
  "portainer": {
    group: "management",
    name: "Portainer",
    description: "Interface de gestion de conteneurs Docker.",
    doc_url: "https://docs.portainer.io",
    expose: true,
    subdomain: "portainer",
    port: 9000
  },
  "code-server": {
    group: "management",
    name: "Code-Server",
    description: "VS Code accessible depuis un navigateur.",
    doc_url: "https://coder.com/docs/code-server",
    expose: true,
    subdomain: "code",
    port: 8443,
    env_vars: [
      createSecret("CODESERVER_PASSWORD", "Mot de passe pour Code-Server."),
      createSecret("CODESERVER_SUDO_PASSWORD", "Mot de passe sudo (optionnel).")
    ]
  },
  "dozzle": {
    group: "management",
    name: "Dozzle",
    description: "Visualiseur de logs Docker en temps réel.",
    doc_url: "https://dozzle.dev",
    expose: true,
    subdomain: "logs",
    port: 8080
  },

  // ===========================================================================
  // NETWORK PROFILE - Network and DNS
  // ===========================================================================
  "adguardhome": {
    group: "network",
    name: "AdGuard Home",
    description: "Bloqueur de pubs et traqueurs au niveau DNS.",
    doc_url: "https://adguard.com/kb/adguard-home",
    expose: true,
    subdomain: "adguard",
    port: 80,
    env_vars: [
      { name: "ADGUARD_HOME_USER", description: "Nom d'utilisateur admin.", type: "text" },
      createSecret("ADGUARD_HOME_ADMIN_PASS", "Mot de passe admin AdGuard.")
    ]
  },

  // ===========================================================================
  // REMOTE-SUPPORT PROFILE - Remote assistance
  // ===========================================================================
  "rustdesk-server": {
    group: "remote-support",
    name: "RustDesk Server",
    description: "Serveur de signalisation pour RustDesk.",
    doc_url: "https://rustdesk.com/docs/en/self-host",
    dependencies: ["rustdesk-relay"],
    port: 21116
  },
  "rustdesk-relay": {
    group: "remote-support",
    name: "RustDesk Relay",
    description: "Serveur relais pour RustDesk.",
    internal: true,
    port: 21117
  },

  // ===========================================================================
  // HEALTH-FITNESS PROFILE - Health and fitness
  // ===========================================================================
  "wger": {
    group: "health-fitness",
    name: "Wger",
    description: "Suivi d'entraînement et de nutrition.",
    doc_url: "https://wger.readthedocs.io",
    dependencies: ["wger-db", "wger-redis"],
    expose: true,
    subdomain: "wger",
    port: 8000,
    env_vars: [
      createSecret("WGER_SECRET_KEY", "Clé secrète Django pour Wger."),
      createSecret("WGER_DB_PASS", "Mot de passe PostgreSQL pour Wger.")
    ]
  },
  "wger-db": {
    group: "health-fitness",
    name: "Wger DB",
    description: "Base de données PostgreSQL pour Wger.",
    internal: true
  },
  "wger-redis": {
    group: "health-fitness",
    name: "Wger Redis",
    description: "Cache Redis pour Wger.",
    internal: true
  },

  // ===========================================================================
  // MONITORING PROFILE - Monitoring and alerting
  // ===========================================================================
  "prometheus": {
    group: "monitoring",
    name: "Prometheus",
    description: "Système de monitoring et base de données de métriques.",
    doc_url: "https://prometheus.io/docs",
    expose: true,
    subdomain: "prometheus",
    port: 9090
  },
  "grafana": {
    group: "monitoring",
    name: "Grafana",
    description: "Plateforme de visualisation et tableaux de bord.",
    doc_url: "https://grafana.com/docs/grafana",
    dependencies: ["prometheus"],
    expose: true,
    subdomain: "grafana",
    port: 3000,
    env_vars: [
      createSecret("GRAFANA_ADMIN_PASS", "Mot de passe admin Grafana."),
      { name: "GRAFANA_OAUTH_CLIENT_ID", description: "Client ID OAuth Authentik (optionnel).", type: "text" },
      createSecret("GRAFANA_OAUTH_CLIENT_SECRET", "Client Secret OAuth Authentik (optionnel).")
    ]
  },
  "alertmanager": {
    group: "monitoring",
    name: "Alertmanager",
    description: "Gestion des alertes Prometheus.",
    doc_url: "https://prometheus.io/docs/alerting/alertmanager",
    expose: true,
    subdomain: "alerts",
    port: 9093
  },
  "node-exporter": {
    group: "monitoring",
    name: "Node Exporter",
    description: "Exporte les métriques système pour Prometheus.",
    doc_url: "https://prometheus.io/docs/guides/node-exporter",
    internal: true,
    port: 9100
  },
  "cadvisor": {
    group: "monitoring",
    name: "cAdvisor",
    description: "Exporte les métriques des conteneurs pour Prometheus.",
    doc_url: "https://github.com/google/cadvisor",
    internal: true,
    port: 8080
  }
};

// Helper function to get all services in a group
export const getServicesByGroup = (groupId) => {
  return Object.entries(SERVICE_MANIFEST)
    .filter(([, service]) => service.group === groupId)
    .map(([id, service]) => ({ id, ...service }));
};

// Helper function to get all exposed (non-internal) services
export const getExposedServices = () => {
  return Object.entries(SERVICE_MANIFEST)
    .filter(([, service]) => !service.internal && service.expose)
    .map(([id, service]) => ({ id, ...service }));
};

// Helper function to get service dependencies recursively
export const getServiceDependencies = (serviceId, visited = new Set()) => {
  if (visited.has(serviceId)) return [];
  visited.add(serviceId);

  const service = SERVICE_MANIFEST[serviceId];
  if (!service || !service.dependencies) return [serviceId];

  const deps = [serviceId];
  for (const depId of service.dependencies) {
    deps.push(...getServiceDependencies(depId, visited));
  }
  return deps;
};

// Count of total services
export const TOTAL_SERVICES = Object.keys(SERVICE_MANIFEST).length;
