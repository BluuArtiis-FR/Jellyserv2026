#!/bin/bash
# =============================================================================
# 🚀 HOMELAB MEDIA SERVER - SCRIPT D'INSTALLATION DE L'HÔTE
# =============================================================================
# Ce script prépare le système pour le déploiement de la stack Docker.
# À n'exécuter qu'une seule fois avec sudo.
#
# Ce qu'il fait :
#   1. Vérifie les prérequis (OS, root).
#   2. Installe Docker et Docker Compose.
#   3. Crée la structure de dossiers sur l'hôte.
#   4. Configure le pare-feu UFW pour Traefik (ports 80 & 443).
#   5. Copie le .env.example en .env pour la configuration par l'utilisateur.
#
# =============================================================================

set -e
# Couleurs pour les messages
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Fonctions d'affichage
info() { echo -e "${BLUE}ℹ️  $*${NC}"; }
success() { echo -e "${GREEN}✅ $*${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $*${NC}"; }
error() { echo -e "${RED}❌ $*${NC}"; exit 1; }

# --- VÉRIFICATIONS PRÉLIMINAIRES ---
info "Lancement des vérifications préliminaires..."
# Doit être exécuté en tant que root
if [[ "$EUID" -ne 0 ]]; then
  error "Ce script doit être exécuté avec les privilèges sudo."
fi

# Détecter le vrai utilisateur pour les permissions
REAL_USER="${SUDO_USER:-$(whoami)}"
info "Utilisateur détecté pour les permissions : $REAL_USER"

# Détecter l'OS
if [[ -f /etc/os-release ]]; then
    . /etc/os-release
    OS=$ID
    info "Système d'exploitation détecté : $PRETTY_NAME"
    if [[ "$OS" != "ubuntu" && "$OS" != "debian" ]]; then
        warning "Cet OS n'est pas officiellement supporté. Le script tentera de continuer."
    fi
else
    error "Impossible de détecter le système d'exploitation."
fi

# --- INSTALLATION DE DOCKER ---
info "Vérification et installation de Docker..."
if command -v docker &> /dev/null; then
    success "Docker est déjà installé."
else
    info "Installation de Docker..."
    apt-get update -y
    apt-get install -y ca-certificates curl gnupg
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/${OS}/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/${OS} $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    usermod -aG docker "$REAL_USER"
    success "Docker et Docker Compose installés. L'utilisateur $REAL_USER a été ajouté au groupe docker."
    warning "Vous devrez peut-être vous déconnecter et vous reconnecter pour que les permissions du groupe docker prennent effet."
fi

# --- CONFIGURATION DU PARE-FEU (UFW) ---
info "Configuration du pare-feu UFW..."
if ! command -v ufw &> /dev/null; then
    info "Installation de UFW..."
    apt-get install -y ufw
fi
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp comment 'Traefik Web'
ufw allow 443/tcp comment 'Traefik Web Secure'
ufw --force enable
success "Pare-feu UFW configuré pour autoriser Traefik (ports 80, 443) et SSH."

# --- CRÉATION DE LA STRUCTURE DE DOSSIERS ---
info "Création de la structure de dossiers..."
# Utilise les chemins par défaut du .env.example.
# Si l'utilisateur les change, il devra créer les dossiers manuellement.
mkdir -p ./config ./data ./downloads ./media
chown -R "$REAL_USER":"$REAL_USER" ./config ./data ./downloads ./media
success "Dossiers créés : config, data, downloads, media."

# --- CRÉATION DU FICHIER .ENV ---
info "Préparation du fichier de configuration .env..."
if [ ! -f .env ]; then
    cp .env.example .env
    chown "$REAL_USER":"$REAL_USER" .env
    success "Fichier .env créé. Veuillez le modifier avant de lancer la stack."
else
    warning "Le fichier .env existe déjà. Aucune modification n'a été apportée."
fi

# --- MESSAGE FINAL ---
echo
success "🎉 Préparation de l'hôte terminée !"
echo
info "PROCHAINES ÉTAPES :"
echo "1. Modifiez le fichier .env pour définir votre domaine, vos mots de passe et les profils de services que vous souhaitez activer."
echo "2. Une fois le .env configuré, lancez la stack avec la commande : make up"
echo