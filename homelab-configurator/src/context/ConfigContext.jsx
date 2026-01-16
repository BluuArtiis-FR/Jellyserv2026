import { createContext, useState, useMemo, useEffect } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { SERVICE_MANIFEST } from '../services';

const ConfigContext = createContext();

const initialGlobalConfig = {
  DOMAIN: '',
  ACME_EMAIL: '',
  TZ: 'Europe/Paris',
  PUID: '1000',
  PGID: '1000',
  RESTART_POLICY: 'unless-stopped',
  PROJECT_BASE_DIR: '/opt/homelab',
};

const generateRandomString = (length = 32) => {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

import { generateDockerComposeContent } from '../utils/dockerComposeGenerator';

export const ConfigProvider = ({ children }) => {
  const [selectedServices, setSelectedServices] = useState(new Set());
  const [configValues, setConfigValues] = useState(initialGlobalConfig);
  const [pathMode, setPathMode] = useState('default'); // 'default' or 'custom'

  const togglePathMode = () => {
    setPathMode(prev => (prev === 'default' ? 'custom' : 'default'));
  };

  const defaultPaths = useMemo(() => {
    const baseDir = configValues.PROJECT_BASE_DIR || initialGlobalConfig.PROJECT_BASE_DIR;
    return {
      CONFIG_PATH: `${baseDir}/config`,
      DATA_PATH: `${baseDir}/data`,
      DOWNLOADS_PATH: `${baseDir}/downloads`,
      MEDIA_PATH: `${baseDir}/media`,
      UPLOAD_PATH: `${baseDir}/uploads`,
    };
  }, [configValues.PROJECT_BASE_DIR]);

  useEffect(() => {
    if (pathMode === 'default') {
      setConfigValues(prev => ({
        ...prev,
        ...defaultPaths
      }));
    }
  }, [defaultPaths, pathMode]);

  const getRequiredDependencies = (serviceKey, manifest) => {
    let deps = new Set();
    const toCheck = [serviceKey];
    const checked = new Set();
    while (toCheck.length > 0) {
      const currentKey = toCheck.pop();
      if (checked.has(currentKey)) continue;
      checked.add(currentKey);
      if (manifest[currentKey]?.dependencies) {
        for (const depKey of manifest[currentKey].dependencies) {
          if (!deps.has(depKey)) {
            deps.add(depKey);
            toCheck.push(depKey);
          }
        }
      }
    }
    return deps;
  };

  const updateSelection = (servicesToUpdate, isChecked) => {
    const newSelected = new Set(selectedServices);
    if (isChecked) {
      servicesToUpdate.forEach(key => {
        newSelected.add(key);
        getRequiredDependencies(key, SERVICE_MANIFEST).forEach(dep => newSelected.add(dep));
      });
    } else {
      const allDepsToKeep = new Set();
      newSelected.forEach(key => {
        if (!servicesToUpdate.has(key)) {
          getRequiredDependencies(key, SERVICE_MANIFEST).forEach(dep => allDepsToKeep.add(dep));
        }
      });
      servicesToUpdate.forEach(key => {
        newSelected.delete(key);
        const depsOfKey = getRequiredDependencies(key, SERVICE_MANIFEST);
        depsOfKey.forEach(depKey => {
          if (!allDepsToKeep.has(depKey)) {
            newSelected.delete(depKey);
          }
        });
      });
    }
    setSelectedServices(newSelected);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfigValues(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const setRandomValue = (fieldName) => {
    setConfigValues(prev => ({ ...prev, [fieldName]: generateRandomString() }));
  };

  useEffect(() => {
    const newValues = {};
    let needsUpdate = false;
    selectedServices.forEach(sKey => {
      const service = SERVICE_MANIFEST[sKey];
      if (service?.env_vars) {
        service.env_vars.forEach(envVar => {
          const varName = envVar.link_to || envVar.name;
          if (envVar.generator && !configValues[varName]) {
            newValues[varName] = generateRandomString();
            needsUpdate = true;
          }
        });
      }
      if (service?.expose) {
        const exposeKey = `${sKey}_expose_traefik`;
        if (configValues[exposeKey] === undefined) {
          newValues[exposeKey] = service.expose_traefik !== undefined ? service.expose_traefik : true;
          needsUpdate = true;
        }
        const subdomainKey = `${sKey}_custom_subdomain`;
        if (configValues[subdomainKey] === undefined) {
          newValues[subdomainKey] = service.custom_subdomain || '';
          needsUpdate = true;
        }
      }
    });

    const currentConfigKeys = Object.keys(configValues);
    for(const key of currentConfigKeys) {
        if (key.endsWith('_expose_traefik') || key.endsWith('_custom_subdomain')) {
            const sKey = key.split('_')[0];
            if (!selectedServices.has(sKey)) {
                delete configValues[key];
                needsUpdate = true;
            }
        }
    }

    if (needsUpdate) {
      setConfigValues(prev => ({ ...prev, ...newValues }));
    }
  }, [selectedServices, configValues]);

  const generateTraefikYamlContent = (configValues) => {
    return `api:
  dashboard: true
  insecure: true

entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entryPoint:
          to: "websecure"
          scheme: "https"
  websecure:
    address: ":443"

providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false
  file:
    directory: "/etc/traefik/dynamic/"
    watch: true

certificatesResolvers:
  myresolver:
    acme:
      email: "${configValues.ACME_EMAIL}"
      storage: "/etc/traefik/acme.json"
      httpChallenge:
        entryPoint: "web"
`;
  };



  const generatePackage = async () => {
    if (!configValues.DOMAIN || !configValues.ACME_EMAIL) {
      alert("Veuillez remplir le nom de domaine et l'email (Configuration Générale).");
      return;
    }
    const zip = new JSZip();
    const finalProfiles = Array.from(selectedServices).join(',');
    let envContent = "# Configuration generated by HomeLab Configurator\n";
    envContent += "# Date: " + new Date().toLocaleString() + "\n\n";
    envContent += `COMPOSE_PROFILES=${finalProfiles}\n\n`;
    for (const key in configValues) {
      if (!key.endsWith('_PATH') && key !== 'PROJECT_BASE_DIR') {
        envContent += `${key}=${configValues[key]}\n`;
      }
    }
    envContent += `\n# --- Paths ---\n`;
    for (const pathKey of Object.keys(defaultPaths)) {
      envContent += `${pathKey}=${configValues[pathKey] || defaultPaths[pathKey]}\n`;
    }
    zip.file('.env', envContent);
    zip.file('start.sh', "#!/bin/bash\necho \"Starting HomeLab Media Server...\"\ndocker compose -p homedia --env-file ./.env up -d\necho \"Stack started!\"\n", { unixPermissions: 0o755 });
    zip.file('start.bat', "@echo off\necho \"Starting HomeLab Media Server...\"\ndocker compose -p homedia --env-file ./.env up -d\npause\n");
    const readmeContent = `...`; // Full README content here
    const dockerComposeContent = generateDockerComposeContent(selectedServices, configValues);
    zip.file('docker-compose.yml', dockerComposeContent);

    // Generate Traefik static config and acme.json if Traefik is used
    if (configValues.DOMAIN && configValues.ACME_EMAIL) {
      const traefikYamlContent = generateTraefikYamlContent(configValues);
      zip.file('traefik.yml', traefikYamlContent);
      zip.file('acme.json', ''); // Empty file for ACME storage
    }

    zip.file('README.txt', readmeContent);
    try {
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'configuration.zip');
    } catch (error) {
      console.error("ZIP Error:", error);
    }
  };

  const value = {
    selectedServices,
    configValues,
    pathMode,
    togglePathMode,
    defaultPaths,
    servicesByGroup: useMemo(() => {
        const groups = {};
        for (const serviceKey in SERVICE_MANIFEST) {
          const service = SERVICE_MANIFEST[serviceKey];
          if (!service.internal) {
              if (!groups[service.group]) {
                  groups[service.group] = [];
              }
              groups[service.group].push({ key: serviceKey, ...service });
          }
        }
        return groups;
      }, []),
    updateSelection,
    handleInputChange,
    setRandomValue,
    generatePackage
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
};

export default ConfigContext;
