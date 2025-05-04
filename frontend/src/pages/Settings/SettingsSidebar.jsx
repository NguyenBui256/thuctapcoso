import React, { useState, useEffect } from 'react';
import { FiSettings, FiTag, FiLock, FiChevronRight } from 'react-icons/fi';

const SettingsSidebar = ({ section, subSection, onSectionChange, onSubSectionChange, projectId }) => {
  const [roles, setRoles] = useState([
    { id: 'front', name: 'Front' },
    { id: 'back', name: 'Back' },
    { id: 'product_owner', name: 'Product Owner' },
    { id: 'stakeholder', name: 'Stakeholder' },
    { id: 'external_user', name: 'External User' }
  ]);

  // Get tertiary menu options based on selected section
  const getTertiaryMenuItems = () => {
    if (section === 'project') {
      return [
        { id: 'details', name: 'Project Details' },
        { id: 'presets', name: 'Presets' },
        { id: 'modules', name: 'Modules' }
      ];
    } else if (section === 'attributes') {
      return [
        { id: 'statuses', name: 'Statuses' },
        { id: 'points', name: 'Points' },
        { id: 'priorities', name: 'Priorities' },
        { id: 'severities', name: 'Severities' },
        { id: 'types', name: 'Types' },
        { id: 'tags', name: 'Tags' }
      ];
    } else if (section === 'permissions') {
      return roles.map(role => ({
        id: role.id,
        name: role.name
      }));
    }
    return [];
  };

  const tertiaryItems = getTertiaryMenuItems();

  return (
    <div className="flex h-full">
      {/* Secondary Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex-shrink-0">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Settings</h2>
          
          <nav className="space-y-1">
            <button
              onClick={() => onSectionChange('project')}
              className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-md ${
                section === 'project' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center">
                <FiSettings className="mr-3" />
                <span>Project</span>
              </div>
              {section === 'project' && <FiChevronRight />}
            </button>
            
            <button
              onClick={() => onSectionChange('attributes')}
              className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-md ${
                section === 'attributes' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center">
                <FiTag className="mr-3" />
                <span>Attributes</span>
              </div>
              {section === 'attributes' && <FiChevronRight />}
            </button>
            
            <button
              onClick={() => onSectionChange('permissions')}
              className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-md ${
                section === 'permissions' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center">
                <FiLock className="mr-3" />
                <span>Permissions</span>
              </div>
              {section === 'permissions' && <FiChevronRight />}
            </button>
          </nav>
        </div>
      </div>
      
      {/* Tertiary Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            {section === 'project' && 'Project Settings'}
            {section === 'attributes' && 'Attributes'}
            {section === 'permissions' && 'Permissions'}
          </h2>
          
          <nav className="space-y-1">
            {tertiaryItems.map(item => (
              <button
                key={item.id}
                onClick={() => onSubSectionChange(item.id)}
                className={`flex w-full items-center px-3 py-2 text-sm rounded-md ${
                  subSection === item.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.name}
              </button>
            ))}
            
            {section === 'permissions' && (
              <button
                onClick={() => {}}
                className="flex items-center justify-center w-full px-3 py-2 mt-4 text-sm text-blue-600 border border-dashed border-blue-300 rounded-md hover:bg-blue-50"
              >
                + New Role
              </button>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default SettingsSidebar; 