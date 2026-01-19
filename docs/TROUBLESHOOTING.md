# Troubleshooting - Homelab Media Server

Guide de depannage pour les problemes courants.

## Diagnostic Rapide

```bash
# Diagnostic complet du systeme
make diagnose

# Verification sante des services
make health

# Logs d'un service specifique
make logs s=NOM_SERVICE
```

---

## Problemes Courants

### SSL / Certificats Let's Encrypt

**Symptome:** Les certificats ne sont pas generes, erreur HTTPS.

**Solutions:**

1. **Verifier la resolution DNS**
   ```bash
   dig +short jellyfin.votre-domaine.com
   # Doit retourner l'IP de votre serveur
   ```

2. **Verifier les ports ouverts**
   ```bash
   sudo ufw status
   # Ports 80 et 443 doivent etre ouverts
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

3. **Verifier l'email ACME**
   ```bash
   grep ACME_EMAIL .env
   # Doit contenir un email valide
   ```

4. **Verifier les logs Traefik**
   ```bash
   make logs s=traefik | grep -i acme
   ```

5. **Forcer le renouvellement**
   ```bash
   docker exec traefik rm /letsencrypt/acme.json
   make restart
   ```

---

### Service ne Demarre Pas

**Symptome:** Un conteneur reste en "Restarting" ou ne demarre pas.

**Solutions:**

1. **Verifier les logs**
   ```bash
   make logs s=SERVICE_NAME
   ```

2. **Verifier les dependances**
   ```bash
   docker inspect SERVICE_NAME --format='{{json .State.Health}}'
   ```

3. **Verifier les ressources**
   ```bash
   docker stats SERVICE_NAME
   free -h
   df -h
   ```

4. **Forcer la recreation**
   ```bash
   docker compose up -d --force-recreate SERVICE_NAME
   ```

5. **Supprimer et recreer le conteneur**
   ```bash
   docker compose rm -sf SERVICE_NAME
   docker compose up -d SERVICE_NAME
   ```

---

### Probleme de Permissions

**Symptome:** Erreur "Permission denied" dans les logs.

**Solutions:**

1. **Verifier PUID/PGID**
   ```bash
   # Votre UID/GID
   id $USER

   # Dans .env
   grep -E "PUID|PGID" .env
   ```

2. **Corriger les permissions**
   ```bash
   sudo chown -R $PUID:$PGID ./config ./data ./downloads ./media ./uploads
   ```

3. **Pour les services specifiques**
   ```bash
   # Jellyfin
   sudo chown -R $PUID:$PGID ./media

   # Nextcloud
   sudo chown -R www-data:www-data ./data/nextcloud
   ```

---

### Base de Donnees Inaccessible

**Symptome:** Service ne peut pas se connecter a sa base de donnees.

**Solutions:**

1. **Verifier que la DB est healthy**
   ```bash
   make health | grep -E "db|postgres|redis|mariadb"
   ```

2. **Verifier les logs de la DB**
   ```bash
   make logs s=authentik-postgres
   make logs s=nextcloud-db
   ```

3. **Verifier les credentials**
   ```bash
   grep _DB_PASS .env
   grep _PG_PASS .env
   ```

4. **Redemarrer dans l'ordre**
   ```bash
   make down
   sleep 5
   make up
   ```

---

### Authentik ne Fonctionne Pas

**Symptome:** Impossible de se connecter, erreur SSO.

**Solutions:**

1. **Verifier les dependances**
   ```bash
   docker inspect authentik-redis --format='{{.State.Health.Status}}'
   docker inspect authentik-postgres --format='{{.State.Health.Status}}'
   ```

2. **Verifier les logs**
   ```bash
   make logs s=authentik-server
   make logs s=authentik-worker
   ```

3. **Verifier la configuration**
   ```bash
   grep AUTHENTIK .env
   ```

4. **Reinitialiser le mot de passe admin**
   ```bash
   docker exec -it authentik-server ak create_recovery_key 10 akadmin
   ```

---

### VPN / Gluetun ne Connecte Pas

**Symptome:** qBittorrent n'a pas acces a Internet.

**Solutions:**

1. **Verifier les logs Gluetun**
   ```bash
   make logs s=gluetun
   ```

2. **Verifier les credentials VPN**
   ```bash
   grep -E "OPENVPN_USER|OPENVPN_PASSWORD|VPN_" .env
   ```

3. **Tester la connexion**
   ```bash
   docker exec gluetun curl -s ifconfig.me
   # Doit retourner l'IP du VPN, pas la votre
   ```

4. **Verifier le fournisseur**
   ```bash
   # Liste des fournisseurs supportes
   # https://github.com/qdm12/gluetun-wiki
   ```

---

### Jellyfin / Media Non Detectes

**Symptome:** Jellyfin ne voit pas les fichiers media.

**Solutions:**

1. **Verifier le montage**
   ```bash
   docker exec jellyfin ls -la /media
   ```

2. **Verifier le chemin dans .env**
   ```bash
   grep MEDIA_PATH .env
   ls -la $MEDIA_PATH
   ```

3. **Verifier les permissions**
   ```bash
   sudo chown -R $PUID:$PGID $MEDIA_PATH
   ```

4. **Relancer le scan**
   - Dans Jellyfin: Dashboard > Libraries > Scan All Libraries

---

### Nextcloud Erreur "Trusted Domain"

**Symptome:** "Access through untrusted domain".

**Solutions:**

1. **Verifier le domaine dans .env**
   ```bash
   grep DOMAIN .env
   ```

2. **Ajouter manuellement le domaine**
   ```bash
   docker exec -u www-data nextcloud php occ config:system:set trusted_domains 1 --value=nextcloud.votre-domaine.com
   ```

---

### Immich ne Traite Pas les Photos

**Symptome:** Photos uploadees mais pas de vignettes/reconnaissance.

**Solutions:**

1. **Verifier le service ML**
   ```bash
   make health | grep immich
   make logs s=immich-ml
   ```

2. **Verifier les ressources**
   ```bash
   docker stats immich-ml
   # ML necessite beaucoup de RAM (4GB+)
   ```

3. **Redemarrer les workers**
   ```bash
   docker compose restart immich-server immich-ml
   ```

---

## Commandes Utiles

```bash
# Voir tous les conteneurs (y compris arretes)
docker ps -a

# Voir les logs en temps reel
docker compose logs -f

# Inspecter un conteneur
docker inspect CONTAINER_NAME

# Voir l'utilisation des ressources
docker stats

# Nettoyer les ressources inutilisees
make clean

# Valider la configuration
make validate

# Voir les reseaux Docker
docker network ls

# Voir les volumes Docker
docker volume ls
```

---

## Obtenir de l'Aide

1. **Documentation:** [README.md](../README.md)
2. **Guide Avance:** [GUIDE_AVANCE.md](./GUIDE_AVANCE.md)
3. **Issues GitHub:** [Ouvrir une issue](https://github.com/BluuArtiis-FR/Jellyserv2026/issues)
4. **Gemini CLI:** Utilisez le fichier `GEMINI.md` pour obtenir de l'aide contextuelle
