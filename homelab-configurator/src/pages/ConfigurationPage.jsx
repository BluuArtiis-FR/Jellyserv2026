import { useConfig } from '../hooks/useConfig';
import Header from '../components/Header';
import ServiceSelector from '../components/ServiceSelector';
import ConfigurationSections from '../components/ConfigurationSections';
import { Loader2 } from 'lucide-react';

const ConfigurationPage = () => {
  const { servicesByGroup } = useConfig();

  if (!servicesByGroup) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <ServiceSelector />
        <ConfigurationSections />
      </main>
    </div>
  );
};

export default ConfigurationPage;
