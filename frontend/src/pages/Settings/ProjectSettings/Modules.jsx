import React, { useState, useEffect } from 'react';
import { FiSave } from 'react-icons/fi';

const Modules = ({ projectId }) => {
  const [modules, setModules] = useState({
    epics: true,
    scrum: true,
    kanban: true,
    issues: true,
    wiki: true
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // In a real implementation, fetch module settings
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [projectId]);

  const handleToggleModule = (module) => {
    setModules(prev => ({
      ...prev,
      [module]: !prev[module]
    }));
  };

  const handleSaveSettings = () => {
    // In a real implementation, save module settings
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
    }, 800);
  };

  if (loading) {
    return <div>Loading module settings...</div>;
  }

  return (
    <div className="max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Project Modules</h1>
        <button 
          onClick={handleSaveSettings}
          disabled={saving}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          <FiSave className="mr-2" /> {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      <p className="text-gray-600 mb-6">
        Enable or disable specific modules for this project. Disabling a module will hide its interface from users,
        but will not delete any associated data.
      </p>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <h3 className="text-md font-medium text-gray-800">Epics</h3>
              <p className="text-sm text-gray-500">Organize issues into larger units of work</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={modules.epics}
                onChange={() => handleToggleModule('epics')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <h3 className="text-md font-medium text-gray-800">Scrum</h3>
              <p className="text-sm text-gray-500">Manage project using sprints and backlogs</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={modules.scrum}
                onChange={() => handleToggleModule('scrum')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <h3 className="text-md font-medium text-gray-800">Kanban</h3>
              <p className="text-sm text-gray-500">Visualize workflow with customizable boards</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={modules.kanban}
                onChange={() => handleToggleModule('kanban')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <h3 className="text-md font-medium text-gray-800">Issues</h3>
              <p className="text-sm text-gray-500">Track tasks, bugs, and feature requests</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={modules.issues}
                onChange={() => handleToggleModule('issues')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <h3 className="text-md font-medium text-gray-800">Wiki</h3>
              <p className="text-sm text-gray-500">Document project requirements and knowledge</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={modules.wiki}
                onChange={() => handleToggleModule('wiki')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modules; 