# =============================================================================
# 🚀 HOMELAB MEDIA SERVER - MAKEFILE
# =============================================================================
# Interface de commande principale pour gérer la stack Docker.
# Lit la configuration depuis les fichiers .env et docker-compose.yml.
#
# Utilisation :
#   make <commande>
#
# Exemples :
#   make install    - Première installation et configuration de l'hôte.
#   make up         - Démarre la stack avec les profils définis dans .env.
#   make logs       - Affiche les logs de tous les services actifs.
#   make down       - Arrête et supprime les conteneurs de la stack.
#
# =============================================================================

# Charge les variables du .env pour les utiliser dans le Makefile si nécessaire
# et s'assure que docker compose les utilise.
include .env
export

# Variables du Makefile
COMPOSE := docker compose
GREEN  := \033[0;32m
YELLOW := \033[1;33m
BLUE   := \033[0;34m
NC     := \033[0m

.PHONY: help install up down start stop restart pull logs ps config clean validate

##
## ------------------ AIDE ------------------
##
help: ## 🙋 Affiche ce message d'aide
	@echo -e "$(BLUE)Commandes disponibles pour le HomeLab Media Server:$(NC)"
	@awk 'BEGIN {FS = ":.*##"; printf ""} /^[a-zA-Z_-]+:.*?##/ { printf "  $(GREEN)%%-15s$(NC) %%s\n", $$1, $$2 }' $(MAKEFILE_LIST)

##
## ------------------ GESTION DE LA STACK ------------------
##
up: ## 🚀 Démarre tous les services définis par les profils dans .env
	@echo -e "$(BLUE)Démarrage de la stack avec les profils : $(YELLOW)$(COMPOSE_PROFILES)$(NC)ப்பூர்..."
	@$(COMPOSE) up -d
	@echo -e "$(GREEN)✅ Stack démarrée. Utilisez 'make ps' pour voir les services actifs.$(NC)"

down: ## ❌ Arrête et supprime tous les conteneurs de la stack
	@echo -e "$(YELLOW)Arrêt de la stack...$(NC)"
	@$(COMPOSE) down
	@echo -e "$(GREEN)✅ Stack arrêtée.$(NC)"

start: up ## Alias pour 'up'
stop: down ## Alias pour 'down'

restart: ## 🔄 Redémarre tous les services actifs
	@echo -e "$(BLUE)Redémarrage des services...$(NC)"
	@$(COMPOSE) restart
	@echo -e "$(GREEN)✅ Services redémarrés.$(NC)"

pull: ## ⬇️ Met à jour toutes les images des services de la stack
	@echo -e "$(BLUE)Mise à jour des images Docker...$(NC)"
	@$(COMPOSE) pull
	@echo -e "$(GREEN)✅ Images mises à jour. Redémarrez la stack avec 'make up' pour appliquer.$(NC)"

logs: ## 📜 Affiche les logs de tous les services actifs en temps réel
	@$(COMPOSE) logs -f

ps: ## 📊 Affiche le statut de tous les services actifs
	@$(COMPOSE) ps

##
## ------------------ INSTALLATION & MAINTENANCE ------------------
##
install: ## 🛠️  (PREMIÈRE UTILISATION) Prépare l'hôte et configure .env
	@echo -e "$(BLUE)Lancement du script d'installation de l'hôte...$(NC)"
	@chmod +x install.sh
	@sudo ./install.sh

config: ## 📝 Crée le fichier .env à partir du template s'il n'existe pas
	@if [ ! -f .env ]; then \
		echo -e "$(BLUE)Création du fichier .env à partir du .env.example...$(NC)"; \
		cp .env.example .env; \
		echo -e "$(GREEN)✅ Fichier .env créé. Veuillez le modifier avec vos informations.$(NC)"; \
	else \
		echo -e "$(YELLOW)Le fichier .env existe déjà.$(NC)"; \
	fi

clean: ## 🧹 Supprime les ressources Docker inutilisées (images, réseaux...)
	@echo -e "$(YELLOW)Nettoyage des ressources Docker non utilisées...$(NC)"
	@docker system prune -f
	@echo -e "$(GREEN)✅ Nettoyage terminé.$(NC)"

validate: ## ✅ Valide la syntaxe des fichiers docker-compose et .env
	@echo -e "$(BLUE)Validation de la configuration Docker Compose...$(NC)"
	@$(COMPOSE) config -q
	@echo -e "$(GREEN)✅ La configuration est valide.$(NC)"

.DEFAULT_GOAL := help