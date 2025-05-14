import React, { useState, useEffect } from 'react';
import { FiSave } from 'react-icons/fi';
import { useOutletContext } from 'react-router-dom';
import { fetchWithAuth, getCurrentUserId } from '../../../utils/AuthUtils';
import { BASE_API_URL } from '../../../common/constants';

const Modules = ({ projectId }) => {
  const { refreshModuleSettings } = useOutletContext();
  const [modules, setModules] = useState({
    epics: { isOn: true, description: '' },
    scrum: { isOn: true, description: '' },
    kanban: { isOn: true, description: '' },
    issues: { isOn: true, description: '' },
    wiki: { isOn: true, description: '' }
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const userId = getCurrentUserId();

  useEffect(() => {
    const fetchModuleSettings = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetchWithAuth(
          `${BASE_API_URL}/v1/projects/${projectId}/modules`,
          `/projects/${projectId}/settings`,
          true
        );

        if (response && response.ok) {
          const responseData = await response.json();
          const moduleSettings = {};

          if (responseData.data && Array.isArray(responseData.data)) {
            responseData.data.forEach(module => {
              if (module.module && module.module.name) {
                const moduleName = module.module.name.toLowerCase();
                moduleSettings[moduleName] = {
                  id: module.id,
                  moduleId: module.module.id,
                  isOn: module.isOn,
                  description: module.module.description || ''
                };
              }
            });

            // Ensure all expected modules exist with defaults if not present in API response
            const expectedModules = ['epics', 'scrum', 'kanban', 'issues', 'wiki'];
            expectedModules.forEach(moduleName => {
              if (!moduleSettings[moduleName]) {
                moduleSettings[moduleName] = {
                  isOn: false,
                  description: ''
                };
              }
            });

            setModules(moduleSettings);
          }
        } else {
          setError('Failed to fetch module settings. Please try again.');
        }
      } catch (err) {
        console.error('Error fetching module settings:', err);
        setError('An error occurred while fetching module settings.');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchModuleSettings();
    }
  }, [projectId]);

  const handleToggleModule = async (module) => {
    try {
      setError(null);

      // Check if the module exists before trying to toggle it
      if (!modules[module]) {
        setError(`Module ${module} not found. Cannot toggle settings.`);
        return;
      }

      // Debug logs - before toggle
      console.log(`Before toggle - Module ${module} isOn:`, modules[module]?.isOn);
      console.log("All modules before toggle:", JSON.stringify(modules, null, 2));

      // Optimistically update UI
      setModules(prev => ({
        ...prev,
        [module]: {
          ...prev[module],
          isOn: !prev[module]?.isOn
        }
      }));

      // Log updated state
      setTimeout(() => {
        console.log(`After toggle in UI - Module ${module} isOn (expected):`, !modules[module]?.isOn);
      }, 0);

      // Prepare module settings for update - only include modules with ID and moduleId
      let moduleSettings = Object.entries(modules)
        .filter(([_, moduleData]) => moduleData.id && moduleData.moduleId)
        .map(([moduleName, moduleData]) => ({
          id: moduleData.id,
          module: {
            id: moduleData.moduleId
          },
          isOn: moduleName === module ? !moduleData.isOn : moduleData.isOn,
          projectId: parseInt(projectId)
        }));

      // Remove duplicate modules (keeping only the first occurrence of each module.id)
      const moduleIdMap = new Map();
      moduleSettings = moduleSettings.filter(setting => {
        const moduleId = setting.module.id;
        if (!moduleIdMap.has(moduleId)) {
          moduleIdMap.set(moduleId, true);
          return true;
        }
        console.log(`Removing duplicate module with id ${moduleId}`);
        return false;
      });

      // Debug logs - payload
      console.log("API request payload:", JSON.stringify(moduleSettings, null, 2));
      console.log(`Module ${module} in payload isOn:`,
        moduleSettings.find(m => m.module.id === modules[module]?.moduleId)?.isOn);

      const response = await fetchWithAuth(
        `${BASE_API_URL}/v1/projects/${projectId}/modules`,
        `/projects/${projectId}/settings`,
        true,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(moduleSettings)
        }
      );

      if (response && response.ok) {
        // Debug logs - success response
        console.log("API update successful");

        // Notify parent to refresh Sidebar's module settings
        refreshModuleSettings();

        // Fetch updated module settings
        const refreshResponse = await fetchWithAuth(
          `${BASE_API_URL}/v1/projects/${projectId}/modules`,
          `/projects/${projectId}/settings`,
          true
        );

        if (refreshResponse && refreshResponse.ok) {
          const responseData = await refreshResponse.json();
          console.log("Response after refresh:", JSON.stringify(responseData, null, 2));

          if (responseData.data && Array.isArray(responseData.data)) {
            const updatedModules = {};
            responseData.data.forEach(module => {
              if (module.module && module.module.name) {
                const moduleName = module.module.name.toLowerCase();
                updatedModules[moduleName] = {
                  id: module.id,
                  moduleId: module.module.id,
                  isOn: module.isOn,
                  description: module.module.description || ''
                };
              }
            });

            // Ensure all expected modules exist
            Object.keys(modules).forEach(moduleName => {
              if (!updatedModules[moduleName]) {
                updatedModules[moduleName] = modules[moduleName];
              }
            });

            console.log("Updated modules after refresh:", JSON.stringify(updatedModules, null, 2));
            console.log(`Module ${module} after server refresh isOn:`, updatedModules[module]?.isOn);

            setModules(updatedModules);
          }
        }
      } else {
        // Debug logs - error response
        console.error("API update failed:", response.status);

        // Revert the optimistic update if the request fails
        setModules(prev => ({
          ...prev,
          [module]: {
            ...prev[module],
            isOn: !prev[module]?.isOn
          }
        }));

        const errorData = await response.json();
        console.error("Error data:", errorData);
        setError(errorData.message || 'Failed to update module settings. Please try again.');
      }
    } catch (err) {
      // Debug logs - exception
      console.error("Exception occurred:", err);

      // Revert the optimistic update if there's an error
      setModules(prev => ({
        ...prev,
        [module]: {
          ...prev[module],
          isOn: !prev[module]?.isOn
        }
      }));

      console.error('Error updating module settings:', err);
      setError('An error occurred while updating module settings.');
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError(null);

      // Convert modules object to array of module settings
      const moduleSettings = Object.entries(modules)
        .filter(([_, moduleData]) => moduleData.id && moduleData.moduleId)
        .map(([moduleName, moduleData]) => ({
          id: moduleData.id,
          module: {
            id: moduleData.moduleId
          },
          isOn: moduleData.isOn,
          projectId: parseInt(projectId)
        }));

      if (moduleSettings.length === 0) {
        setError('No valid module settings to save.');
        setSaving(false);
        return;
      }

      const response = await fetchWithAuth(
        `${BASE_API_URL}/v1/projects/${projectId}/modules`,
        `/projects/${projectId}/settings`,
        true,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(moduleSettings)
        }
      );

      if (response && response.ok) {
        const responseData = await response.json();
        if (responseData.data) {
          // Update local state with new data from server
          const updatedModules = {};
          responseData.data.forEach(module => {
            if (module.module && module.module.name) {
              const moduleName = module.module.name.toLowerCase();
              updatedModules[moduleName] = {
                id: module.id,
                moduleId: module.module.id,
                isOn: module.isOn,
                description: module.module.description || ''
              };
            }
          });

          // Preserve existing modules that weren't in the response
          Object.keys(modules).forEach(moduleName => {
            if (!updatedModules[moduleName]) {
              updatedModules[moduleName] = modules[moduleName];
            }
          });

          setModules(updatedModules);
        }
        alert('Module settings updated successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update module settings. Please try again.');
      }
    } catch (err) {
      console.error('Error updating module settings:', err);
      setError('An error occurred while updating module settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading module settings...</div>;
  }

  return (
    <div className="max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Project Modules</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <p className="text-gray-600 mb-6">
        Enable or disable specific modules for this project. Disabling a module will hide its interface from users,
        but will not delete any associated data.
      </p>

      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <h3 className="text-md font-medium text-gray-800">Epics</h3>
              <p className="text-sm text-gray-500">{modules.epics?.description || 'Organize issues into larger units of work'}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={modules.epics?.isOn || false}
                onChange={() => handleToggleModule('epics')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <h3 className="text-md font-medium text-gray-800">Scrum</h3>
              <p className="text-sm text-gray-500">{modules.scrum?.description || 'Manage project using sprints and backlogs'}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={modules.scrum?.isOn || false}
                onChange={() => handleToggleModule('scrum')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <h3 className="text-md font-medium text-gray-800">Kanban</h3>
              <p className="text-sm text-gray-500">{modules.kanban?.description || 'Visualize workflow with customizable boards'}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={modules.kanban?.isOn || false}
                onChange={() => handleToggleModule('kanban')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <h3 className="text-md font-medium text-gray-800">Issues</h3>
              <p className="text-sm text-gray-500">{modules.issues?.description || 'Track tasks, bugs, and feature requests'}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={modules.issues?.isOn || false}
                onChange={() => handleToggleModule('issues')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <h3 className="text-md font-medium text-gray-800">Wiki</h3>
              <p className="text-sm text-gray-500">{modules.wiki?.description || 'Document project requirements and knowledge'}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={modules.wiki?.isOn || false}
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