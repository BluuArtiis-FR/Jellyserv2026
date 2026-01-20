import { useState, useEffect } from 'react';
import { useConfig } from '../hooks/useConfig';
import { Download, Loader2, Package, Wand2, Moon, Sun, Zap } from 'lucide-react';

const Header = () => {
  const { selectedServices, generatePackage, applyPreset } = useConfig();
  const [generating, setGenerating] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [showPresets, setShowPresets] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generatePackage();
    } finally {
      setGenerating(false);
    }
  };

  const appsCount = selectedServices.size;

  const presets = [
    {
      id: 'media',
      name: 'Media Stack',
      icon: '🎬',
      services: [
        'jellyfin', 'jellyseerr', 'requestrr', 'wizarr', 'maintainerr', 'tdarr', 'jellystat',
        'sonarr', 'radarr', 'lidarr', 'readarr', 'bazarr',
        'prowlarr', 'flaresolverr', 'qbittorrent', 'gluetun',
        'unpackerr', 'recyclarr', 'cross-seed'
      ]
    },
    {
      id: 'cloud',
      name: 'Cloud Stack',
      icon: '☁️',
      services: ['nextcloud', 'duplicati', 'filebrowser', 'onlyoffice', 'stirling-pdf', 'paperless-ngx']
    },
    {
      id: 'full',
      name: 'Full Stack',
      icon: '🚀',
      services: 'all'
    },
    {
      id: 'minimal',
      name: 'Minimal',
      icon: '📦',
      services: ['jellyfin', 'sonarr', 'radarr', 'prowlarr', 'qbittorrent', 'gluetun']
    },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-700/50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>HomeLab Configurator</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Créez votre stack sur mesure</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Presets dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowPresets(!showPresets)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">Presets</span>
              </button>
              {showPresets && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50">
                  {presets.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        applyPreset(preset.services);
                        setShowPresets(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                    >
                      <span>{preset.icon}</span>
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dark mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title={darkMode ? 'Mode clair' : 'Mode sombre'}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Service count */}
            <div className="hidden sm:flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <Package className="w-4 h-4" />
              <span>{appsCount} services</span>
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={generating || appsCount === 0}
              className="bg-blue-600 dark:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-sm"
            >
              {generating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              <span>Générer</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
