# =============================================================================
# HOMELAB MEDIA SERVER v5.0.0 - MAKEFILE
# =============================================================================
# Interface CLI principale pour la gestion de la stack
# Inspire de YunoHost pour la simplicite d'utilisation
# =============================================================================

.DEFAULT_GOAL := help
.PHONY: help install up down start stop restart logs ps pull clean validate config \
        backup restore status health diagnose update shell exec services info \
        secrets-generate db-backup db-restore

# Variables
DOCKER_COMPOSE := docker compose
ENV_FILE := .env
ENV_EXAMPLE := .env.example
BACKUP_DIR := ./backups
SCRIPTS_DIR := ./scripts

# Couleurs pour l'affichage
BLUE := \033[34m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
CYAN := \033[36m
RESET := \033[0m
BOLD := \033[1m

# =============================================================================
# AIDE
# =============================================================================

help: ## Affiche cette aide
	@echo ""
	@echo "$(BOLD)$(CYAN)HOMELAB MEDIA SERVER - Commandes disponibles$(RESET)"
	@echo ""
	@echo "$(BOLD)$(GREEN)DEMARRAGE$(RESET)"
	@echo "  $(YELLOW)make install$(RESET)        Premiere installation (prepare l'hote)"
	@echo "  $(YELLOW)make up$(RESET)             Demarre tous les services actives"
	@echo "  $(YELLOW)make down$(RESET)           Arrete tous les services"
	@echo "  $(YELLOW)make restart$(RESET)        Redemarre tous les services"
	@echo ""
	@echo "$(BOLD)$(GREEN)MONITORING$(RESET)"
	@echo "  $(YELLOW)make ps$(RESET)             Liste les conteneurs en cours"
	@echo "  $(YELLOW)make logs$(RESET)           Affiche les logs en temps reel"
	@echo "  $(YELLOW)make logs s=SERVICE$(RESET) Logs d'un service specifique"
	@echo "  $(YELLOW)make status$(RESET)         Statut detaille de tous les services"
	@echo "  $(YELLOW)make health$(RESET)         Verifie la sante des services"
	@echo ""
	@echo "$(BOLD)$(GREEN)MAINTENANCE$(RESET)"
	@echo "  $(YELLOW)make pull$(RESET)           Met a jour toutes les images Docker"
	@echo "  $(YELLOW)make update$(RESET)         Met a jour et redemarre les services"
	@echo "  $(YELLOW)make clean$(RESET)          Nettoie les ressources Docker inutilisees"
	@echo "  $(YELLOW)make validate$(RESET)       Valide la syntaxe docker-compose"
	@echo ""
	@echo "$(BOLD)$(GREEN)BACKUP & RESTORE$(RESET)"
	@echo "  $(YELLOW)make backup$(RESET)         Sauvegarde complete de la configuration"
	@echo "  $(YELLOW)make db-backup$(RESET)      Sauvegarde toutes les bases de donnees"
	@echo "  $(YELLOW)make restore$(RESET)        Restaure depuis une sauvegarde"
	@echo ""
	@echo "$(BOLD)$(GREEN)DIAGNOSTIC$(RESET)"
	@echo "  $(YELLOW)make diagnose$(RESET)       Diagnostic complet du systeme"
	@echo "  $(YELLOW)make info$(RESET)           Informations sur l'installation"
	@echo "  $(YELLOW)make services$(RESET)       Liste tous les services disponibles"
	@echo ""
	@echo "$(BOLD)$(GREEN)UTILITAIRES$(RESET)"
	@echo "  $(YELLOW)make config$(RESET)         Cree le fichier .env si manquant"
	@echo "  $(YELLOW)make secrets-generate$(RESET) Genere des secrets aleatoires"
	@echo "  $(YELLOW)make shell s=SERVICE$(RESET) Ouvre un shell dans un conteneur"
	@echo "  $(YELLOW)make exec s=SERVICE c=CMD$(RESET) Execute une commande"
	@echo ""

# =============================================================================
# INSTALLATION
# =============================================================================

install: ## Premiere installation - prepare l'hote
	@echo "$(BOLD)$(CYAN)Installation de Homelab Media Server...$(RESET)"
	@if [ ! -f $(ENV_FILE) ]; then \
		echo "$(YELLOW)Creation du fichier .env...$(RESET)"; \
		cp $(ENV_EXAMPLE) $(ENV_FILE); \
		echo "$(GREEN)Fichier .env cree. Editez-le avant de continuer.$(RESET)"; \
	else \
		echo "$(GREEN)Fichier .env existant.$(RESET)"; \
	fi
	@mkdir -p config data downloads media uploads backups
	@mkdir -p config/prometheus config/grafana/provisioning config/alertmanager config/authentik
	@echo "$(GREEN)Repertoires crees.$(RESET)"
	@echo ""
	@echo "$(BOLD)$(YELLOW)Prochaines etapes:$(RESET)"
	@echo "1. Editez le fichier .env avec vos parametres"
	@echo "2. Generez les secrets: make secrets-generate"
	@echo "3. Demarrez les services: make up"
	@echo ""

config: ## Cree le fichier .env s'il n'existe pas
	@if [ ! -f $(ENV_FILE) ]; then \
		cp $(ENV_EXAMPLE) $(ENV_FILE); \
		echo "$(GREEN)Fichier .env cree depuis .env.example$(RESET)"; \
		echo "$(YELLOW)N'oubliez pas de le configurer !$(RESET)"; \
	else \
		echo "$(YELLOW)Le fichier .env existe deja.$(RESET)"; \
	fi

secrets-generate: ## Genere des secrets aleatoires pour .env
	@echo "$(BOLD)$(CYAN)Generation de secrets aleatoires...$(RESET)"
	@echo ""
	@echo "$(YELLOW)Copiez ces valeurs dans votre fichier .env:$(RESET)"
	@echo ""
	@echo "AUTHENTIK_SECRET_KEY=$$(openssl rand -hex 32)"
	@echo "AUTHENTIK_PG_PASS=$$(openssl rand -hex 32)"
	@echo "NEXTCLOUD_DB_PASS=$$(openssl rand -hex 32)"
	@echo "ONLYOFFICE_JWT_SECRET=$$(openssl rand -hex 32)"
	@echo "BOOKSTACK_DB_PASS=$$(openssl rand -hex 32)"
	@echo "PAPERLESS_SECRET_KEY=$$(openssl rand -hex 32)"
	@echo "PAPERLESS_DB_PASS=$$(openssl rand -hex 32)"
	@echo "IMMICH_DB_PASS=$$(openssl rand -hex 32)"
	@echo "FIREFLY_APP_KEY=$$(openssl rand -hex 16)"
	@echo "FIREFLY_DB_PASS=$$(openssl rand -hex 32)"
	@echo "SHLINK_DB_PASS=$$(openssl rand -hex 32)"
	@echo "SHLINK_API_KEY=$$(openssl rand -hex 32)"
	@echo "WGER_SECRET_KEY=$$(openssl rand -hex 32)"
	@echo "WGER_DB_PASS=$$(openssl rand -hex 32)"
	@echo "JELLYSTAT_DB_PASS=$$(openssl rand -hex 32)"
	@echo "JELLYSTAT_JWT_SECRET=$$(openssl rand -hex 32)"
	@echo "VAULTWARDEN_ADMIN_TOKEN=$$(openssl rand -hex 32)"
	@echo ""

# =============================================================================
# GESTION DES SERVICES
# =============================================================================

up: ## Demarre tous les services actives
	@echo "$(BOLD)$(GREEN)Demarrage des services...$(RESET)"
	@$(DOCKER_COMPOSE) up -d
	@echo "$(GREEN)Services demarres.$(RESET)"
	@make --no-print-directory ps

down: ## Arrete tous les services
	@echo "$(BOLD)$(YELLOW)Arret des services...$(RESET)"
	@$(DOCKER_COMPOSE) down
	@echo "$(GREEN)Services arretes.$(RESET)"

start: up ## Alias pour 'up'

stop: down ## Alias pour 'down'

restart: ## Redemarre tous les services
	@echo "$(BOLD)$(YELLOW)Redemarrage des services...$(RESET)"
	@$(DOCKER_COMPOSE) restart
	@echo "$(GREEN)Services redemarres.$(RESET)"

# =============================================================================
# MONITORING
# =============================================================================

ps: ## Liste les conteneurs en cours
	@$(DOCKER_COMPOSE) ps

logs: ## Affiche les logs (make logs s=SERVICE pour un service specifique)
	@if [ -n "$(s)" ]; then \
		$(DOCKER_COMPOSE) logs -f $(s); \
	else \
		$(DOCKER_COMPOSE) logs -f; \
	fi

status: ## Statut detaille de tous les services
	@echo "$(BOLD)$(CYAN)Statut des services$(RESET)"
	@echo ""
	@$(DOCKER_COMPOSE) ps -a --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

health: ## Verifie la sante des services
	@echo "$(BOLD)$(CYAN)Verification de la sante des services...$(RESET)"
	@echo ""
	@for container in $$(docker ps --format '{{.Names}}'); do \
		health=$$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}N/A{{end}}' $$container 2>/dev/null); \
		status=$$(docker inspect --format='{{.State.Status}}' $$container 2>/dev/null); \
		if [ "$$health" = "healthy" ]; then \
			echo "$(GREEN)[OK]$(RESET) $$container ($$status, $$health)"; \
		elif [ "$$health" = "unhealthy" ]; then \
			echo "$(RED)[KO]$(RESET) $$container ($$status, $$health)"; \
		elif [ "$$status" = "running" ]; then \
			echo "$(YELLOW)[--]$(RESET) $$container ($$status, no healthcheck)"; \
		else \
			echo "$(RED)[!!]$(RESET) $$container ($$status)"; \
		fi \
	done
	@echo ""

# =============================================================================
# MAINTENANCE
# =============================================================================

pull: ## Met a jour toutes les images Docker
	@echo "$(BOLD)$(CYAN)Mise a jour des images Docker...$(RESET)"
	@$(DOCKER_COMPOSE) pull
	@echo "$(GREEN)Images mises a jour.$(RESET)"

update: ## Met a jour et redemarre les services
	@echo "$(BOLD)$(CYAN)Mise a jour complete...$(RESET)"
	@make --no-print-directory pull
	@make --no-print-directory down
	@make --no-print-directory up
	@echo "$(GREEN)Mise a jour terminee.$(RESET)"

clean: ## Nettoie les ressources Docker inutilisees
	@echo "$(BOLD)$(YELLOW)Nettoyage des ressources Docker...$(RESET)"
	@docker system prune -f
	@docker volume prune -f
	@echo "$(GREEN)Nettoyage termine.$(RESET)"

validate: ## Valide la syntaxe docker-compose
	@echo "$(BOLD)$(CYAN)Validation de docker-compose.yml...$(RESET)"
	@$(DOCKER_COMPOSE) config --quiet && echo "$(GREEN)Configuration valide !$(RESET)" || echo "$(RED)Erreurs detectees.$(RESET)"

# =============================================================================
# BACKUP & RESTORE
# =============================================================================

backup: ## Sauvegarde complete de la configuration
	@echo "$(BOLD)$(CYAN)Sauvegarde en cours...$(RESET)"
	@mkdir -p $(BACKUP_DIR)
	@BACKUP_NAME="homelab-backup-$$(date +%Y%m%d-%H%M%S)"; \
	tar -czvf $(BACKUP_DIR)/$$BACKUP_NAME.tar.gz \
		--exclude='./downloads/*' \
		--exclude='./media/*' \
		--exclude='./backups/*' \
		--exclude='*.log' \
		./config ./.env ./docker-compose.yml 2>/dev/null || true; \
	echo "$(GREEN)Sauvegarde creee: $(BACKUP_DIR)/$$BACKUP_NAME.tar.gz$(RESET)"

db-backup: ## Sauvegarde toutes les bases de donnees
	@echo "$(BOLD)$(CYAN)Sauvegarde des bases de donnees...$(RESET)"
	@mkdir -p $(BACKUP_DIR)/databases
	@TIMESTAMP=$$(date +%Y%m%d-%H%M%S); \
	for db in authentik-postgres nextcloud-db paperless-db firefly-db immich-db bookstack-db shlink-db wger-db jellystat-db; do \
		if docker ps --format '{{.Names}}' | grep -q "^$$db$$"; then \
			echo "Sauvegarde de $$db..."; \
			if echo "$$db" | grep -q "mariadb\|bookstack"; then \
				docker exec $$db sh -c 'mysqldump -u root -p"$$MYSQL_ROOT_PASSWORD" --all-databases' > $(BACKUP_DIR)/databases/$$db-$$TIMESTAMP.sql 2>/dev/null || true; \
			else \
				docker exec $$db pg_dumpall -U postgres > $(BACKUP_DIR)/databases/$$db-$$TIMESTAMP.sql 2>/dev/null || true; \
			fi \
		fi \
	done; \
	echo "$(GREEN)Sauvegardes DB creees dans $(BACKUP_DIR)/databases/$(RESET)"

restore: ## Restaure depuis une sauvegarde (make restore f=FICHIER)
	@if [ -z "$(f)" ]; then \
		echo "$(RED)Usage: make restore f=chemin/vers/backup.tar.gz$(RESET)"; \
		echo "$(YELLOW)Sauvegardes disponibles:$(RESET)"; \
		ls -la $(BACKUP_DIR)/*.tar.gz 2>/dev/null || echo "Aucune sauvegarde trouvee."; \
	else \
		echo "$(BOLD)$(YELLOW)Restauration de $(f)...$(RESET)"; \
		tar -xzvf $(f); \
		echo "$(GREEN)Restauration terminee.$(RESET)"; \
	fi

# =============================================================================
# DIAGNOSTIC
# =============================================================================

diagnose: ## Diagnostic complet du systeme
	@echo "$(BOLD)$(CYAN)============================================$(RESET)"
	@echo "$(BOLD)$(CYAN)    DIAGNOSTIC HOMELAB MEDIA SERVER$(RESET)"
	@echo "$(BOLD)$(CYAN)============================================$(RESET)"
	@echo ""
	@echo "$(BOLD)$(GREEN)[SYSTEME]$(RESET)"
	@echo "  OS: $$(uname -s) $$(uname -r)"
	@echo "  Hostname: $$(hostname)"
	@echo "  Date: $$(date)"
	@echo "  Uptime: $$(uptime -p 2>/dev/null || uptime)"
	@echo ""
	@echo "$(BOLD)$(GREEN)[DOCKER]$(RESET)"
	@echo "  Version: $$(docker --version)"
	@echo "  Compose: $$(docker compose version)"
	@echo "  Conteneurs actifs: $$(docker ps -q | wc -l)"
	@echo "  Images: $$(docker images -q | wc -l)"
	@echo "  Volumes: $$(docker volume ls -q | wc -l)"
	@echo ""
	@echo "$(BOLD)$(GREEN)[RESSOURCES]$(RESET)"
	@echo "  CPU: $$(nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo 'N/A') cores"
	@echo "  RAM: $$(free -h 2>/dev/null | awk '/^Mem:/ {print $$2}' || echo 'N/A')"
	@echo "  Disque:"
	@df -h / 2>/dev/null | tail -1 | awk '{print "    Total: " $$2 "  Utilise: " $$3 "  Libre: " $$4 "  Usage: " $$5}'
	@echo ""
	@echo "$(BOLD)$(GREEN)[RESEAU]$(RESET)"
	@echo "  Reseaux Docker:"
	@docker network ls --format "    {{.Name}}: {{.Driver}}" | grep -E "homelab|traefik"
	@echo ""
	@echo "$(BOLD)$(GREEN)[CONFIGURATION]$(RESET)"
	@if [ -f $(ENV_FILE) ]; then \
		echo "  .env: $(GREEN)Present$(RESET)"; \
		echo "  DOMAIN: $$(grep '^DOMAIN=' $(ENV_FILE) | cut -d= -f2)"; \
		echo "  PROFILES: $$(grep '^COMPOSE_PROFILES=' $(ENV_FILE) | cut -d= -f2)"; \
	else \
		echo "  .env: $(RED)Manquant$(RESET)"; \
	fi
	@echo ""
	@echo "$(BOLD)$(GREEN)[SERVICES]$(RESET)"
	@make --no-print-directory health
	@echo ""
	@echo "$(BOLD)$(GREEN)[PORTS UTILISES]$(RESET)"
	@docker ps --format '{{.Ports}}' | tr ',' '\n' | grep -oE '[0-9]+->|:[0-9]+' | sort -u | head -20
	@echo ""

info: ## Informations sur l'installation
	@echo "$(BOLD)$(CYAN)Homelab Media Server v5.0.0$(RESET)"
	@echo ""
	@if [ -f $(ENV_FILE) ]; then \
		echo "$(GREEN)Configuration:$(RESET)"; \
		echo "  Domaine: $$(grep '^DOMAIN=' $(ENV_FILE) | cut -d= -f2)"; \
		echo "  Profils: $$(grep '^COMPOSE_PROFILES=' $(ENV_FILE) | cut -d= -f2)"; \
		echo "  Timezone: $$(grep '^TZ=' $(ENV_FILE) | cut -d= -f2)"; \
	fi
	@echo ""
	@echo "$(GREEN)Documentation:$(RESET) https://github.com/BluuArtiis-FR/Homelab-Media-Server"
	@echo "$(GREEN)Configurateur:$(RESET) https://BluuArtiis-FR.github.io/Homelab-Media-Server"
	@echo ""

services: ## Liste tous les services disponibles
	@echo "$(BOLD)$(CYAN)Services disponibles par profil:$(RESET)"
	@echo ""
	@echo "$(YELLOW)download$(RESET): gluetun, qbittorrent, prowlarr, sonarr, radarr, lidarr, bazarr, unpackerr"
	@echo "$(YELLOW)media$(RESET): jellyfin, jellyseerr, tdarr, jellystat"
	@echo "$(YELLOW)cloud$(RESET): nextcloud, duplicati, filebrowser"
	@echo "$(YELLOW)office$(RESET): onlyoffice, stirling-pdf, jirafeau"
	@echo "$(YELLOW)docs$(RESET): bookstack, paperless-ngx"
	@echo "$(YELLOW)security$(RESET): vaultwarden, tailscale"
	@echo "$(YELLOW)recipes$(RESET): mealie"
	@echo "$(YELLOW)photos$(RESET): immich-server, immich-ml, immich-db, immich-redis"
	@echo "$(YELLOW)finance$(RESET): firefly-iii, firefly-db"
	@echo "$(YELLOW)inventory$(RESET): grocy"
	@echo "$(YELLOW)home-automation$(RESET): home-assistant"
	@echo "$(YELLOW)utils$(RESET): freshrss, metube, changedetection, shlink"
	@echo "$(YELLOW)management$(RESET): portainer, code-server, dozzle"
	@echo "$(YELLOW)network$(RESET): adguardhome"
	@echo "$(YELLOW)remote-support$(RESET): rustdesk-server, rustdesk-relay"
	@echo "$(YELLOW)health-fitness$(RESET): wger, wger-db, wger-redis"
	@echo "$(YELLOW)monitoring$(RESET): prometheus, grafana, alertmanager, node-exporter, cadvisor"
	@echo ""
	@echo "$(CYAN)Infrastructure (toujours actif):$(RESET) traefik, authentik"
	@echo ""

# =============================================================================
# UTILITAIRES
# =============================================================================

shell: ## Ouvre un shell dans un conteneur (make shell s=SERVICE)
	@if [ -z "$(s)" ]; then \
		echo "$(RED)Usage: make shell s=nom-du-service$(RESET)"; \
		echo "$(YELLOW)Services disponibles:$(RESET)"; \
		docker ps --format '  {{.Names}}'; \
	else \
		docker exec -it $(s) /bin/sh -c "[ -x /bin/bash ] && exec /bin/bash || exec /bin/sh"; \
	fi

exec: ## Execute une commande dans un conteneur (make exec s=SERVICE c="COMMANDE")
	@if [ -z "$(s)" ] || [ -z "$(c)" ]; then \
		echo "$(RED)Usage: make exec s=nom-du-service c=\"commande\"$(RESET)"; \
	else \
		docker exec -it $(s) $(c); \
	fi
