// services.js
// This file will act as a "manifest" or a map of all services available in the docker-compose.yml
// It defines their group, dependencies, and specific configuration variables.

// Helper function to create a standard secret variable definition
const createSecret = (name, description, link_to = null) => ({
  name,
  description,
  type: 'password',
  link_to: link_to || name, // Links to a variable in the main config state
  generator: true
});

export const SERVICE_GROUPS = {
  "download": "⬇️ Téléchargement & Automatisation",
  "media": "🎬 Média & Streaming",
  "cloud": "☁️ Cloud Personnel & Fichiers",
  "office": "💼 Bureautique & Productivité",
  "docs": "📚 Documentation & Prise de Notes",
  "monitoring": "📊 Monitoring & Statut",
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
  // --- DOWNLOAD GROUP ---
    "gluetun": {
      group: "download",
      name: "Gluetun (VPN)",
      description: "Container VPN essentiel pour anonymiser le trafic des autres services de téléchargement.",
      doc_url: "https://github.com/qdm12/gluetun/wiki",
      dependencies: [],
      env_vars: [
        { name: "VPN_SERVICE_PROVIDER", description: "Votre fournisseur de service VPN.", type: "select", options: ['protonvpn', 'mullvad', 'nordvpn', 'expressvpn', 'private internet access', 'surfshark', 'windscribe', 'custom'] },
        { name: "VPN_TYPE", description: "Type de protocole VPN.", type: "select", options: ['openvpn', 'wireguard'] },
        { name: "OPENVPN_USER", description: "Nom d'utilisateur OpenVPN.", type: "text", condition: (config) => config.VPN_TYPE === 'openvpn' },
        { name: "OPENVPN_PASSWORD", description: "Mot de passe OpenVPN.", type: "password", condition: (config) => config.VPN_TYPE === 'openvpn' },
        { name: "SERVER_COUNTRIES", description: "Pays des serveurs VPN (séparés par une virgule).", type: "text" },
      ]
    },  "qbittorrent": {
    group: "download",
    name: "qBittorrent",
    description: "Client BitTorrent.",
    doc_url: "https://github.com/qbittorrent/qBittorrent/wiki",
    dependencies: ["gluetun"]
  },  "prowlarr": {
    group: "download",
    name: "Prowlarr",
    description: "Gestionnaire d'indexers pour Sonarr, Radarr, etc.",
    doc_url: "https://prowlarr.com/docs", // Placeholder doc URL
    dependencies: ["gluetun"],
    env_vars: [createSecret("PROWLARR_API_KEY", "Clé API pour Prowlarr.")]
  },
  "sonarr": {
    group: "download",
    name: "Sonarr",
    description: "Gestion automatique de séries TV.",
    doc_url: "https://sonarr.tv/docs", // Placeholder doc URL
    dependencies: ["gluetun", "prowlarr"],
    env_vars: [
      createSecret("SONARR_API_KEY", "Clé API pour Sonarr."),
      { name: "SONARR_URL_BASE", description: "Base URL si Sonarr est derrière un reverse proxy.", type: "text", default: "/sonarr" }
    ]
  },
  "radarr": {
    group: "download",
    name: "Radarr",
    description: "Gestion automatique de films.",
    doc_url: "https://radarr.video/docs", // Placeholder doc URL
    dependencies: ["gluetun", "prowlarr"],
    env_vars: [
      createSecret("RADARR_API_KEY", "Clé API pour Radarr."),
      { name: "RADARR_URL_BASE", description: "Base URL si Radarr est derrière un reverse proxy.", type: "text", default: "/radarr" }
    ]
  },
  "lidarr": {
    group: "download",
    name: "Lidarr",
    description: "Gestion automatique de musique.",
    doc_url: "https://github.com/Servarr/Wiki/wiki/Lidarr",
    dependencies: ["gluetun", "prowlarr"]
  },
  "bazarr": {
    group: "download",
    name: "Bazarr",
    description: "Gestion de sous-titres pour Sonarr & Radarr.",
    doc_url: "https://wiki.bazarr.media",
    dependencies: ["sonarr", "radarr"]
  },  "unpackerr": {
    group: "download",
    name: "Unpackerr",
    description: "Utilitaire qui décompresse automatiquement les archives téléchargées par les *arr.",
    doc_url: "https://unpackerr.zip", // Official documentation
    dependencies: ["sonarr", "radarr"],
    env_vars: [
      { name: "SONARR_API_KEY", description: "Clé API de Sonarr.", type: "text" },
      { name: "RADARR_API_KEY", description: "Clé API de Radarr.", type: "text" }
    ]
  },

  // --- MEDIA GROUP ---
  "jellyfin": {
    group: "media",
    name: "Jellyfin",
    description: "Serveur de streaming multimédia.",
    doc_url: "https://jellyfin.org/docs",
    expose: true, // Can be exposed
    expose_traefik: true, // Exposed via Traefik by default
    custom_subdomain: "", // User can override
    port: 8096
  },
  "jellyseerr": {
    group: "media",
    name: "Jellyseerr",
    description: "Demandes de contenu pour Jellyfin/Plex.",
    doc_url: "https://seerr.dev", // Official documentation
    dependencies: ["jellyfin"],
    expose: true, port: 5055
  },
  "tdarr": {
    group: "media",
    name: "Tdarr",
    description: "Automatisation du transcodage de librairies multimédias.",
    doc_url: "https://tdarr.io/docs", // Official documentation
    expose: true, port: 8080
  },
  "jellystat": {
    group: "media",
    name: "Jellystat",
    description: "Statistiques et suivi d'activité pour votre serveur Jellyfin.",
    doc_url: "https://github.com/jellystat/jellystat",
    dependencies: ["jellyfin"],
    expose: true, port: 8085
  },

  // --- CLOUD GROUP ---
  "nextcloud-db": { group: "cloud", name: "Nextcloud DB", internal: true, dependencies: [] },
  "nextcloud": {
    group: "cloud",
    name: "Nextcloud",
    description: "Suite de cloud personnel (fichiers, contacts, calendriers...).",
    doc_url: "https://docs.nextcloud.com", // Official documentation
    dependencies: ["nextcloud-db"],
    expose: true, port: 80,
    env_vars: [
      createSecret("NEXTCLOUD_ADMIN_PASS", "Mot de passe de l'administrateur Nextcloud."),
      createSecret("NEXTCLOUD_DB_PASS", "Mot de passe pour la base de données de Nextcloud.")
    ]
  },
  "duplicati": {
    group: "cloud",
    name: "Duplicati",
    description: "Logiciel de sauvegarde.",
    doc_url: "https://duplicati.com/docs", // Official documentation
    expose: true, port: 8200
  },
  "filebrowser": {
    group: "cloud",
    name: "FileBrowser",
    description: "Interface simple de gestion de fichiers.",
    doc_url: "https://filebrowser.org", // Official documentation
    expose: true, port: 80
  },

  // --- NETWORK GROUP ---
  "adguardhome": {
    group: "network",
    name: "AdGuard Home",
    description: "Bloqueur de pubs et traqueurs au niveau du réseau.",
    doc_url: "https://adguard.com/kb/adguard-home/", // Official documentation
    dependencies: [],
    expose: true, port: 80,
    env_vars: [
      { name: "ADGUARD_HOME_USER", description: "Nom d'utilisateur pour l'interface web d'AdGuard Home.", type: "text" },
      createSecret("ADGUARD_HOME_ADMIN_PASS", "Mot de passe administrateur pour AdGuard Home.")
    ]
  },

  // --- DOCS GROUP ---
  "bookstack_db": { group: "docs", name: "Bookstack DB", internal: true, dependencies: [] },
  "bookstack": {
    group: "docs",
    name: "Bookstack",
    description: "Plateforme de documentation et de wiki.",
    doc_url: "https://www.bookstackapp.com/docs", // Official documentation
    dependencies: ["bookstack_db"],
    expose: true, port: 80,
    env_vars: [
      createSecret("BOOKSTACK_DB_PASS", "Mot de passe pour la base de données de Bookstack.")
    ]
  },
  "paperless_db": { group: "docs", name: "Paperless DB", internal: true, dependencies: [] },
  "paperless_redis": { group: "docs", name: "Paperless Redis", internal: true, dependencies: [] },
  "paperless-ngx": {
    group: "docs",
    name: "Paperless-ngx",
    description: "Archive numérique intelligente pour tous vos documents physiques.",
    doc_url: "https://docs.paperless-ngx.com", // Official documentation
    dependencies: ["paperless_db", "paperless_redis"],
    expose: true, port: 8000,
    env_vars: [
      createSecret("PAPERLESS_DB_PASS", "Mot de passe pour la base de données de Paperless."),
      createSecret("PAPERLESS_SECRET_KEY", "Clé secrète pour Paperless-ngx."),
      { name: "PAPERLESS_ADMIN_USER", description: "Utilisateur admin pour Paperless-ngx.", type: "text" },
      createSecret("PAPERLESS_ADMIN_PASSWORD", "Mot de passe admin pour Paperless-ngx.")
    ]
  },
  
  // --- INVENTORY GROUP ---
  "grocy": {
    group: "inventory",
    name: "Grocy",
    description: "ERP pour votre maison, gestion de stock alimentaire.",
    doc_url: "https://grocy.info/", // Official documentation
    dependencies: [],
    expose: true, port: 80
  },

  // --- OFFICE GROUP ---
  "onlyoffice": {
    group: "office",
    name: "OnlyOffice",
    description: "Suite bureautique en ligne (édition de documents).",
    doc_url: "https://help.onlyoffice.com/", // Official documentation
    dependencies: [],
    expose: true, port: 80,
    env_vars: [createSecret("ONLYOFFICE_JWT_SECRET", "Clé secrète pour sécuriser le serveur OnlyOffice.")]
  },
  "stirling-pdf": {
    group: "office",
    name: "Stirling PDF",
    description: "Outil complet pour manipuler les fichiers PDF.",
    doc_url: "https://docs.stirlingpdf.com/", // Official documentation
    expose: true, port: 8080
  },
  "jirafeau": {
    group: "office",
    name: "Jirafeau",
    description: "Partage de fichiers volumineux avec un lien.",
    doc_url: "https://gitlab.com/mojo42/jirafeau", // Official documentation (GitLab repo)
    expose: true, port: 80
  },

  // --- SECURITY GROUP ---
  "vaultwarden": {
    group: "security",
    name: "Vaultwarden",
    description: "Gestionnaire de mots de passe compatible Bitwarden.",
    doc_url: "https://github.com/dani-garcia/vaultwarden/wiki", // Official documentation
    expose: true, port: 80
  },
  "tailscale": {
    group: "security",
    name: "Tailscale",
    description: "Crée un réseau privé sécurisé (VPN) entre vos appareils.",
    doc_url: "https://tailscale.com/docs", // Official documentation
    dependencies: [],
    env_vars: [
      { name: "TS_AUTHKEY", description: "Clé d'authentification de votre compte Tailscale.", type: "text" }
    ]
  },

  // --- REMOTE SUPPORT GROUP ---
  "rustdesk-hbbs": { group: "remote-support", name: "RustDesk HBBS", internal: true, dependencies: [] },
  "rustdesk-hbbr": { group: "remote-support", name: "RustDesk HBBR", internal: true, dependencies: [] },
  "rustdesk": {
    group: "remote-support",
    name: "RustDesk (Serveur)",
    description: "Serveur auto-hébergé pour la prise de contrôle à distance (alternative TeamViewer/AnyDesk).",
    doc_url: "https://rustdesk.com/docs/en/self-host/rustdesk-server-oss/install/", // Official documentation
    dependencies: ["rustdesk-hbbs", "rustdesk-hbbr"],
    expose: true, port: 21119, // Web UI port
    env_vars: [
      createSecret("RUSTDESK_KEY", "Clé de chiffrement pour votre serveur RustDesk. Partagez-la avec vos clients.")
    ]
  },

  // --- HEALTH & FITNESS GROUP ---
  "wger-db": { group: "health-fitness", name: "Wger DB", internal: true, dependencies: [] },
  "wger-cache": { group: "health-fitness", name: "Wger Cache", internal: true, dependencies: [] },
  "wger-celery-worker": { group: "health-fitness", name: "Wger Celery Worker", internal: true, dependencies: ["wger-db", "wger-cache"] },
  "wger-celery-beat": { group: "health-fitness", name: "Wger Celery Beat", internal: true, dependencies: ["wger-db", "wger-cache"] },
  "wger": {
    group: "health-fitness",
    name: "Wger",
    description: "Suivi d'entraînement et de nutrition.",
    doc_url: "https://wger.readthedocs.io", // Official documentation
    dependencies: ["wger-db", "wger-cache", "wger-celery-worker", "wger-celery-beat"],
    expose: true, port: 8000,
    env_vars: [
      createSecret("WGER_SECRET_KEY", "Clé secrète pour Wger."),
      createSecret("WGER_DB_PASS", "Mot de passe pour la base de données de Wger.")
    ]
  },
  
  // --- RECIPES GROUP ---
  "mealie": {
    group: "recipes",
    name: "Mealie",
    description: "Gestionnaire de recettes de cuisine.",
    doc_url: "https://mealie.io/documentation/", // Official documentation
    expose: true, port: 9000
  },
  
  // --- UTILS GROUP ---
  "freshrss": {
    group: "utils",
    name: "FreshRSS",
    description: "Agrégateur de flux RSS.",
    doc_url: "https://freshrss.github.io/FreshRSS/", // Official documentation
    expose: true, port: 80
  },
  "metube": {
    group: "utils",
    name: "MeTube",
    description: "Téléchargeur vidéo basé sur yt-dlp avec interface web.",
    doc_url: "https://github.com/alexta69/metube/wiki", // Official documentation
    dependencies: [],
    expose: true, port: 8080
  },
  "changedetection": {
    group: "utils",
    name: "Changedetection.io",
    description: "Surveille les changements sur les pages web et vous envoie des notifications.",
    doc_url: "https://changedetection.io", // Official documentation
    dependencies: [],
    expose: true, port: 5000
  },
  "shlink_db": { group: "utils", name: "Shlink DB", internal: true, dependencies: [] },
  "shlink": {
    group: "utils",
    name: "Shlink",
    description: "Raccourcisseur d'URL auto-hébergé.",
    doc_url: "https://shlink.io/documentation/", // Official documentation
    dependencies: ["shlink_db"],
    expose: true, port: 8080,
    env_vars: [
      createSecret("SHLINK_DB_PASS", "Mot de passe pour la base de données de Shlink."),
      { name: "GEOLITE2_LICENSE_KEY", description: "Clé de licence MaxMind GeoLite2 (nécessaire pour la géolocalisation des liens).", type: "text" },
      createSecret("SHLINK_API_KEY", "Clé API pour l'administration de Shlink.")
    ]
  },
  
  // --- MANAGEMENT GROUP ---
  "code-server": {
      group: "management",
      name: "Code-Server",
      description: "VS Code accessible depuis un navigateur.",
      doc_url: "https://coder.com/docs/code-server/latest/", // Official documentation
      expose: true, port: 8080,
      env_vars: [createSecret("CODESERVER_PASSWORD", "Mot de passe pour accéder à l'interface de Code-Server.")]
  },
  "portainer": { // New service entry for Portainer
    group: "management",
    name: "Portainer",
    description: "Interface de gestion de conteneurs Docker.",
    doc_url: "https://docs.portainer.io/", // Official documentation
    expose: true, // Mark Portainer as externally exposed
    dependencies: [],
    env_vars: [],
    port: 9000 // Portainer UI port
  },
  "dozzle": {
    group: "management",
    name: "Dozzle",
    description: "Visualiseur de logs Docker en temps réel.",
    doc_url: "https://dozzle.dev/guide/", // Official documentation
    dependencies: [],
    expose: true, port: 8080
  },
  "npm_db": { group: "management", name: "NPM DB", internal: true, dependencies: [] },
  "npm": {
    group: "management",
    name: "Nginx Proxy Manager",
    description: "Interface graphique pour gérer le reverse proxy (en complément de Traefik).",
    doc_url: "https://nginxproxymanager.com/guide/", // Official documentation
    dependencies: ["npm_db"],
    expose: true, port: 81,
    env_vars: [
      createSecret("NPM_DB_PASS", "Mot de passe pour la base de données de Nginx Proxy Manager."),
      { name: "NPM_ADMIN_EMAIL", description: "Email de l'administrateur de Nginx Proxy Manager (premier login).", type: "email" },
      createSecret("NPM_ADMIN_PASSWORD", "Mot de passe de l'administrateur de Nginx Proxy Manager (premier login).")
    ]
  },

  
  // --- HOME AUTOMATION GROUP ---
  "home-assistant": {
    group: "home-automation",
    name: "Home Assistant",
    description: "Plateforme de domotique open-source.",
    doc_url: "https://www.home-assistant.io/docs/", // Official documentation
    expose: true, port: 8123
  },
  
  // --- PHOTOS GROUP (Immich) ---
  "immich-db": { group: "photos", name: "Immich DB", internal: true, dependencies: [] },
  "immich-redis": { group: "photos", name: "Immich Redis", internal: true, dependencies: [] },
  "immich": {
      group: "photos",
      name: "Immich",
      description: "Solution de sauvegarde de photos et vidéos.",
      doc_url: "https://docs.immich.app", // Official documentation
      dependencies: ["immich-db", "immich-redis"],
      expose: true, port: 8080,
      env_vars: [createSecret("IMMICH_DB_PASS", "Mot de passe pour la base de données d'Immich.")]
  },
  
  // --- FINANCE GROUP ---
  "firefly-db": { group: "finance", name: "Firefly DB", internal: true, dependencies: [] },
  "firefly-iii": {
      group: "finance",
      name: "Firefly III",
      description: "Gestionnaire de finances personnelles.",
      doc_url: "https://docs.firefly-iii.org/", // Official documentation
      dependencies: ["firefly-db"],
      expose: true, port: 80,
      env_vars: [
          createSecret("FIREFLY_DB_PASS", "Mot de passe pour la base de données de Firefly III."),
          createSecret("FIREFLY_APP_KEY", "Clé d'application pour Firefly III.")
      ]
  }
};
