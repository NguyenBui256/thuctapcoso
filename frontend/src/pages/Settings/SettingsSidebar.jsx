import React, { useState, useEffect } from 'react';
import { FiSettings, FiTag, FiLock, FiChevronRight } from 'react-icons/fi';
import { fetchWithAuth } from '../../utils/AuthUtils';
import { BASE_API_URL } from '../../common/constants';

const SettingsSidebar = ({ section, subSection, onSectionChange, onSubSectionChange, projectId }) => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Get user ID from local storage
    const userJson = localStorage.getItem('userData');
    if (userJson) {
      try {
        const userData = JSON.parse(userJson);
        if (userData && userData.userId) {
          setUserId(userData.userId);
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (section === 'permissions' && projectId && userId) {
      fetchRoles();
    }
  }, [section, projectId, userId]);

  const fetchRoles = async () => {
    if (!userId) {
      console.error('User ID not available');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const res = await fetchWithAuth(
        `${BASE_API_URL}/v1/user/${userId}/project/${projectId}/roles`,
        null,
        true
      );

      if (!res.ok) {
        console.error('Failed to fetch roles:', res.status, res.statusText);
        return;
      }

      const response = await res.json();
      console.log('Roles response:', response);
      
      // Extract roles from the response data field
      let rolesData = [];
      if (response && response.data && Array.isArray(response.data)) {
        rolesData = response.data;
      } else if (Array.isArray(response)) {
        rolesData = response;
      }
      
      setRoles(rolesData);
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError(err.message || 'An error occurred while fetching roles');
    } finally {
      setLoading(false);
    }
  };

  // Get tertiary menu options based on selected section
  const getTertiaryMenuItems = () => {
    if (section === 'project') {
      return [
        { id: 'details', name: 'Project Details' },
        { id: 'modules', name: 'Modules' }
      ];
    } else if (section === 'attributes') {
      return [
        { id: 'statuses', name: 'Statuses' },
        { id: 'priorities', name: 'Priorities' },
        { id: 'severities', name: 'Severities' },
        { id: 'types', name: 'Types' },
        { id: 'tags', name: 'Tags' }
      ];
    } else if (section === 'permissions') {
      // If we have roles data, map them to sidebar items
      if (roles && roles.length > 0) {
        return roles.map(role => ({
          id: role.id,
          name: role.roleName
        }));
      }
      // Fallback if no roles are available yet
      return [{ id: 'roles', name: 'Loading roles...' }];
    }
    return [];
  };

  const tertiaryItems = getTertiaryMenuItems();

  return (
    <div className="flex h-screen">
      {/* Secondary Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex-shrink-0 h-full">
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
      <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0 h-full">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            {section === 'project' && 'Project Settings'}
            {section === 'attributes' && 'Attributes'}
            {section === 'permissions' && 'Roles'}
          </h2>
          
          {section === 'permissions' && loading && (
            <div className="text-gray-500 text-sm py-2">Loading roles...</div>
          )}
          
          {section === 'permissions' && error && (
            <div className="text-red-500 text-sm py-2">{error}</div>
          )}
          
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
          </nav>
        </div>
      </div>
    </div>
  );
};

export default SettingsSidebar; 