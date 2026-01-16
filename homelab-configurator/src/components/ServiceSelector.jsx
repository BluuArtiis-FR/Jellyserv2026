import { useState } from 'react';
import { useConfig } from '../hooks/useConfig';
import { SERVICE_GROUPS } from '../services';
import { ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';

const ServiceSelector = () => {
  const { servicesByGroup, selectedServices, updateSelection } = useConfig();
  const [openGroups, setOpenGroups] = useState(() => {
    // Open the first group by default
    const firstGroupKey = Object.keys(servicesByGroup)[0];
    return firstGroupKey ? { [firstGroupKey]: true } : {};
  });

  const toggleGroup = (groupKey) => {
    setOpenGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };
  
  const handleSelectAll = (groupKey, servicesInGroup, isChecked) => {
    const serviceKeysInGroup = new Set(servicesInGroup.map(s => s.key));
    updateSelection(serviceKeysInGroup, isChecked);
  };
  
  const handleServiceChange = (serviceKey, isChecked) => {
    updateSelection(new Set([serviceKey]), isChecked);
  };

  return (
    <section className="space-y-4">
       <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Étape 1: Choix des Services</h2>
        <p className="text-slate-500">Sélectionnez les applications et services que vous souhaitez inclure dans votre stack.</p>
      </div>
      {Object.entries(servicesByGroup).map(([groupKey, services]) => {
        if (services.length === 0) return null;

        const selectedCount = services.filter(s => selectedServices.has(s.key)).length;
        const isAllSelected = selectedCount === services.length;

        return (
          <div key={groupKey} className="bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-xl shadow-sm transition-all duration-300">
            <header
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={() => toggleGroup(groupKey)}
            >
              <div className="flex items-center gap-4">
                <h3 className="font-semibold text-lg text-slate-900">{SERVICE_GROUPS[groupKey] || groupKey}</h3>
                <span className="text-sm px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-medium">
                  {selectedCount} / {services.length}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label htmlFor={`select-all-${groupKey}`} className="text-sm font-medium text-slate-600">Tout</label>
                  <input
                    type="checkbox"
                    id={`select-all-${groupKey}`}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={isAllSelected}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handleSelectAll(groupKey, services, e.target.checked)}
                  />
                </div>
                {openGroups[groupKey] ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </div>
            </header>
            <Collapse in={openGroups[groupKey]}>
              <div className="p-4 border-t border-slate-200/80">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {services.map(service => (
                    <div key={service.key} title={service.description} className="flex items-start">
                       <div className="flex items-center h-5">
                          <input
                            type="checkbox"
                            id={`service-${service.key}`}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            checked={selectedServices.has(service.key)}
                            onChange={(e) => handleServiceChange(service.key, e.target.checked)}
                          />
                       </div>
                       <div className="ml-3 text-sm">
                          <label htmlFor={`service-${service.key}`} className="font-medium text-gray-700">{service.name}</label>
                          <p className="text-gray-500 text-xs">{service.description}</p>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </Collapse>
          </div>
        );
      })}
    </section>
  );
};

// A simple Collapse component for smooth transitions
const Collapse = ({ in: inProp, children }) => {
  return (
    <div
      className={clsx('transition-all duration-300 ease-in-out overflow-hidden', {
        'grid-rows-[1fr] opacity-100': inProp,
        'grid-rows-[0fr] opacity-0': !inProp,
      })}
      style={{ display: 'grid' }}
    >
      <div className="min-h-0">{children}</div>
    </div>
  );
};


export default ServiceSelector;
