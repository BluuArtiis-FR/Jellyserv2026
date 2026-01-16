import { useConfig } from '../hooks/useConfig';
import { Download, Loader2, Package, Wand2 } from 'lucide-react';

const Header = () => {
  const { selectedServices, generatePackage } = useConfig();
  const generating = false; // Placeholder for now

  const appsCount = selectedServices.size;

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-blue-600" />
              <span>HomeLab Configurator</span>
            </h1>
            <p className="text-xs text-slate-500">Créez votre stack sur mesure</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Package className="w-4 h-4" />
                {appsCount} services
              </span>
              {/* <span className="flex items-center gap-1">
                <Zap className="w-4 h-4" />
                {modulesEnabled} modules
              </span> */}
            </div>
            <button
              onClick={generatePackage}
              disabled={generating || appsCount === 0}
              className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors shadow-sm"
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
