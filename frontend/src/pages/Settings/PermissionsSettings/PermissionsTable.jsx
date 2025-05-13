import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../../utils/AuthUtils';
import { BASE_API_URL } from '../../../common/constants';

function PermissionsTable({ projectId, roleId }) {
  const [permissions, setPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [changes, setChanges] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [userId, setUserId] = useState(null);

  // Module-wise permission groups as seen in the screenshot
  const permissionGroups = [
    { 
      name: 'Epics', 
      actions: ['View epics', 'Add epics', 'Modify epics', 'Comment epics', 'Delete epics'] 
    },
    { 
      name: 'Sprints', 
      actions: ['View sprints', 'Add sprints', 'Modify sprints', 'Delete sprints'] 
    },
    {
      name: 'User Stories',
      actions: ['View user stories', 'Add user stories', 'Modify user stories', 'Comment user stories', 'Delete user stories']
    },
    {
      name: 'Tasks',
      actions: ['View tasks', 'Add tasks', 'Modify tasks', 'Comment tasks', 'Delete tasks']
    },
    {
      name: 'Issues',
      actions: ['View issues', 'Add issues', 'Modify issues', 'Comment issues', 'Delete issues']
    },
    {
      name: 'Wiki',
      actions: ['View wiki pages', 'Add wiki pages', 'Modify wiki pages', 'Delete wiki pages', 'Add wiki links']
    }
  ];

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
        setError('Failed to get user information. Please try logging in again.');
      }
    }
  }, []);

  useEffect(() => {
    if (projectId && roleId && userId) {
      fetchPermissionsData();
    }
  }, [projectId, roleId, userId]);

  const fetchPermissionsData = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all available permissions
      const permissionsRes = await fetchWithAuth(
        `${BASE_API_URL}/v1/projects/${projectId}/roles/permissions`,
        null, 
        true
      );

      if (!permissionsRes.ok) {
        throw new Error(`Failed to fetch permissions: ${permissionsRes.status} ${permissionsRes.statusText}`);
      }

      const permissionsResponse = await permissionsRes.json();
      console.log('All permissions response:', permissionsResponse);
      
      // Extract permissions from response
      let allPermissions = permissionsResponse;
      if (permissionsResponse && permissionsResponse.data) {
        allPermissions = permissionsResponse.data;
      }
      
      setPermissions(Array.isArray(allPermissions) ? allPermissions : []);
      
      // Fetch role-specific permissions
      const rolePermissionsRes = await fetchWithAuth(
        `${BASE_API_URL}/v1/projects/${projectId}/roles/${roleId}/permissions`,
        null,
        true
      );

      if (!rolePermissionsRes.ok) {
        throw new Error(`Failed to fetch role permissions: ${rolePermissionsRes.status} ${rolePermissionsRes.statusText}`);
      }

      const rolePermsResponse = await rolePermissionsRes.json();
      console.log('Role permissions response:', rolePermsResponse);
      
      // Extract role permissions from response
      let rolePerms = rolePermsResponse;
      if (rolePermsResponse && rolePermsResponse.data) {
        rolePerms = rolePermsResponse.data;
      }
      
      setRolePermissions(Array.isArray(rolePerms) ? rolePerms : []);
      // Reset changes when loading new role permissions
      setChanges({});
    } catch (err) {
      console.error('Error fetching permissions data:', err);
      setError(err.message || 'An error occurred while fetching permissions');
    } finally {
      setLoading(false);
    }
  };

  const isPermissionEnabled = (module, action) => {
    const permissionName = `${action.toLowerCase()}`;
    const permission = permissions.find(p => 
      p.module.toLowerCase() === module.toLowerCase() && 
      p.name.toLowerCase() === permissionName
    );
    
    if (!permission) return false;
    
    return rolePermissions.some(rp => rp.id === permission.id);
  };

  const hasPermissionChanged = (permissionId) => {
    return changes[permissionId] !== undefined;
  };

  const togglePermission = (module, action) => {
    const permissionName = `${action.toLowerCase()}`;
    const permission = permissions.find(p => 
      p.module.toLowerCase() === module.toLowerCase() && 
      p.name.toLowerCase() === permissionName
    );
    
    if (!permission) {
      console.error('Permission not found:', module, action);
      return;
    }

    const isCurrentlyEnabled = rolePermissions.some(rp => rp.id === permission.id);
    const newValue = !isCurrentlyEnabled;

    // Update changes object for API call
    setChanges(prev => ({
      ...prev,
      [permission.id]: newValue
    }));

    // Update local state for immediate feedback
    if (newValue) {
      setRolePermissions(prev => [...prev, permission]);
    } else {
      setRolePermissions(prev => prev.filter(p => p.id !== permission.id));
    }
    
    // Clear success message when making new changes
    setSuccessMessage('');
  };

  const saveChanges = async () => {
    if (!userId || Object.keys(changes).length === 0) return;

    setSaving(true);
    setSuccessMessage('');
    setError(null);

    try {
      // Format the data as expected by the backend
      // Convert the changes object to a list of permission IDs with their enabled status
      const permissionIdsToUpdate = [];
      
      // Add permission IDs that should be enabled
      Object.entries(changes).forEach(([permissionId, enabled]) => {
        if (enabled) {
          permissionIdsToUpdate.push(parseInt(permissionId, 10));
        }
      });
      
      // Make the API call to update role permissions
      const res = await fetchWithAuth(
        `${BASE_API_URL}/v1/user/${userId}/project/${projectId}/roles/${roleId}`,
        null,
        true,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            roleName: rolePermissions[0]?.roleName || `Role ${roleId}`,
            permissionIds: permissionIdsToUpdate
          })
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.message || `Failed to save permission changes: ${res.status}`);
      }

      const response = await res.json();
      console.log('Save permissions response:', response);
      
      setSuccessMessage('Permissions updated successfully');
      setChanges({});
      
      // Refresh permissions after save to ensure data consistency
      fetchPermissionsData();
    } catch (err) {
      console.error('Error saving permissions:', err);
      setError(err.message || 'An error occurred while saving permissions');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !permissions.length) {
    return <div className="p-6">Loading permissions...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  if (!permissions || permissions.length === 0) {
    return <div className="p-6">No permissions found. Please contact an administrator.</div>;
  }

  return (
    <div className="p-6">
      {successMessage && (
        <div className="bg-green-100 text-green-700 p-3 mb-4 rounded">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">
          {error}
        </div>
      )}
      
      <div className="mb-4 flex justify-end">
        <button 
          onClick={saveChanges}
          disabled={Object.keys(changes).length === 0 || saving}
          className={`px-4 py-2 rounded ${
            Object.keys(changes).length === 0 || saving
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {permissionGroups.map((group) => (
        <div key={group.name} className="mb-8">
          <h3 className="text-lg font-medium mb-2">{group.name}</h3>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permission
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enabled
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {group.actions.map((action) => {
                  const permissionName = action.toLowerCase();
                  const permission = permissions.find(p => 
                    p.module.toLowerCase() === group.name.toLowerCase() && 
                    p.name.toLowerCase() === permissionName
                  );
                  
                  const isEnabled = isPermissionEnabled(group.name, action);

                  return (
                    <tr key={action}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {action}
                        {permission && <div className="text-xs text-gray-500">{permission.apiPath}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={isEnabled}
                            onChange={() => togglePermission(group.name, action)}
                            disabled={!permission}
                          />
                          <div className={`w-11 h-6 ${permission ? 'bg-gray-200' : 'bg-gray-100'} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${
                            isEnabled ? 'peer-checked:bg-blue-500' : ''
                          } ${!permission ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                        </label>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PermissionsTable; 