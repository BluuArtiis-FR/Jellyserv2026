// Cross-Seed Configuration
// Documentation: https://cross-seed.org/docs/basics/options

module.exports = {
  // ==========================================================================
  // TORRENT CLIENT SETTINGS
  // ==========================================================================

  // qBittorrent connection (via Gluetun VPN container)
  qbittorrentUrl: "http://gluetun:8080",

  // Action to perform when a cross-seed match is found
  // Options: "inject" (add to client) or "save" (save .torrent file)
  action: "inject",

  // ==========================================================================
  // PATHS
  // ==========================================================================

  // Path where your torrents are stored (read-only)
  torrentDir: "/downloads",

  // Path where cross-seed will output .torrent files (if action is "save")
  outputDir: "/cross-seed",

  // Include torrents in subfolders of torrentDir
  includeNonVideos: true,

  // ==========================================================================
  // MATCHING OPTIONS
  // ==========================================================================

  // Matching mode: "safe" (exact match) or "risky" (allows more matches)
  matchMode: "safe",

  // Skip torrents smaller than this size (in bytes)
  // Default: 10 MB = 10 * 1024 * 1024
  skipRecheck: false,

  // ==========================================================================
  // INDEXERS / TRACKERS
  // ==========================================================================

  // Torznab URLs from Prowlarr
  // Get these from Prowlarr > Settings > Apps > Show Torznab URLs
  // Format: ["http://prowlarr:9696/1/api?apikey=YOUR_API_KEY"]
  torznab: [],

  // ==========================================================================
  // SEARCH SETTINGS
  // ==========================================================================

  // Delay between searches (in milliseconds)
  // Be respectful to indexers - don't set too low
  delay: 30,

  // Search timeout (in milliseconds)
  searchTimeout: 30000,

  // ==========================================================================
  // API SERVER
  // ==========================================================================

  // Port for the cross-seed API/web interface
  port: 2468,

  // API key for authentication (generate with: openssl rand -hex 16)
  // Leave empty to disable authentication
  apiKey: "",

  // ==========================================================================
  // NOTIFICATIONS
  // ==========================================================================

  // Notification URLs (Apprise format)
  // Example: ["discord://webhook_id/webhook_token"]
  notificationWebhookUrl: [],

  // ==========================================================================
  // DUPLICATE HANDLING
  // ==========================================================================

  // How to handle duplicates
  duplicateCategories: false,

  // ==========================================================================
  // RSS
  // ==========================================================================

  // RSS feed URLs to monitor for cross-seeding opportunities
  rssCadence: null,

  // ==========================================================================
  // ADVANCED
  // ==========================================================================

  // Verbose logging
  verbose: false,
};
