import { SERVICE_MANIFEST } from '../services';

export const generateDockerComposeContent = (selectedServices, configValues, serviceManifest = SERVICE_MANIFEST) => {
    let dockerComposeContent = `version: '3.8'\n\nservices:\n`;
    let servicesBlock = '';
    let volumesBlock = '';
    let networksBlock = '';

    const requiredNetworks = new Set();
    const requiredVolumes = new Set();
    
    // Fallback for PROJECT_BASE_DIR if it's not in configValues
    const projectBaseDir = configValues.PROJECT_BASE_DIR || '/opt/homelab';

    const baseNetworkName = projectBaseDir.replace(/\//g, '_').replace(/^_/, '') + '_network';
    requiredNetworks.add(baseNetworkName);

    const useTraefik = configValues.DOMAIN && configValues.ACME_EMAIL;
    if (useTraefik) {
      servicesBlock += `  traefik:\n`;
      servicesBlock += `    image: traefik:v2.10\n`;
      servicesBlock += `    container_name: traefik\n`;
      servicesBlock += `    restart: unless-stopped\n`;
      servicesBlock += `    command:\n`;
      servicesBlock += `      - --providers.docker.network=${baseNetworkName}\n`;
      servicesBlock += `      - --log.level=INFO\n`;
      servicesBlock += `      - --api.dashboard=true\n`;
      servicesBlock += `      - --providers.docker=true\n`;
      servicesBlock += `      - --providers.docker.exposedbydefault=false\n`;
      servicesBlock += `      - --entrypoints.web.address=:80\n`;
      servicesBlock += `      - --entrypoints.websecure.address=:443\n`;
      servicesBlock += `      - --entrypoints.web.http.redirections.entrypoint.to=websecure\n`;
      servicesBlock += `      - --entrypoints.web.http.redirections.entrypoint.scheme=https\n`;
      servicesBlock += `      - --certificatesresolvers.myresolver.acme.email=${configValues.ACME_EMAIL}\n`;
      servicesBlock += `      - --certificatesresolvers.myresolver.acme.storage=/etc/traefik/acme.json\n`;
      servicesBlock += `      - --certificatesresolvers.myresolver.acme.httpchallenge=true\n`;
      servicesBlock += `      - --certificatesresolvers.myresolver.acme.httpchallenge.entrypoint=web\n`;
      servicesBlock += `    ports:\n`;
      servicesBlock += `      - "80:80"\n`;
      servicesBlock += `      - "443:443"\n`;
      servicesBlock += `      - "8080:8080"\n`;
      servicesBlock += `    volumes:\n`;
      servicesBlock += `      - /var/run/docker.sock:/var/run/docker.sock:ro\n`;
      servicesBlock += `      - ${projectBaseDir}/acme.json:/etc/traefik/acme.json\n`;
      servicesBlock += `    networks:\n      - ${baseNetworkName}\n\n`;

      requiredVolumes.add('acme_json_volume');
    }

    selectedServices.forEach(sKey => {
      const serviceDef = serviceManifest[sKey];
      if (serviceDef) {
        // This is a simplified version based on the original logic.
        // It assumes an image property exists in the manifest, which needs to be added.
        // For the purpose of this refactoring, we will use a placeholder.
        const imageName = serviceDef.image || `lscr.io/linuxserver/${sKey}:latest`;

        servicesBlock += `  ${sKey}:\n`;
        servicesBlock += `    image: ${imageName}\n`;
        servicesBlock += `    container_name: ${sKey}\n`;
        servicesBlock += `    restart: unless-stopped\n`;
        servicesBlock += `    networks:\n      - ${baseNetworkName}\n`;

        if (useTraefik && serviceDef.expose && configValues[`${sKey}_expose_traefik`]) {
          const subdomain = configValues[`${sKey}_custom_subdomain`] || sKey;
          const serviceDomain = `${subdomain}.${configValues.DOMAIN}`;
          servicesBlock += `    labels:\n`;
          servicesBlock += `      - "traefik.enable=true"\n`;
          servicesBlock += `      - "traefik.http.routers.${sKey}.rule=Host(\`${serviceDomain}\`)"\n`;
          servicesBlock += `      - "traefik.http.services.${sKey}-service.loadbalancer.server.port=${serviceDef.port || 80}"\n`;
        }
      }
    });

    dockerComposeContent += servicesBlock;
    
    networksBlock = `\nnetworks:\n`;
    requiredNetworks.forEach(net => {
      networksBlock += `  ${net}:\n    driver: bridge\n`;
    });
    dockerComposeContent += networksBlock;

    if (requiredVolumes.size > 0) {
      volumesBlock = `\nvolumes:\n`;
      volumesBlock += `  acme_json_volume:\n    driver: local\n`; // Simplified for example
      dockerComposeContent += volumesBlock;
    }

    return dockerComposeContent;
  };
