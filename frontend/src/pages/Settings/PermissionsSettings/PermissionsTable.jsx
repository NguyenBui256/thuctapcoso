import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../../utils/AuthUtils';
import { BASE_API_URL } from '../../../common/constants';

function PermissionsTable({ projectId, roleId }) {
  const [permissions, setPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [permissionEnabledStatus, setPermissionEnabledStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [changes, setChanges] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [userId, setUserId] = useState(null);
  const [permissionGroups, setPermissionGroups] = useState([]);

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

  // Process permissions into groups once they are loaded
  useEffect(() => {
    if (permissions.length > 0) {
      organizePermissionsIntoGroups();
    }
  }, [permissions]);

  const organizePermissionsIntoGroups = () => {
    // Get unique modules
    const modules = [...new Set(permissions.map(p => p.module))];
    
    // Create groups for each module
    const groups = modules.map(module => {
      // Get all permissions for this module
      const modulePermissions = permissions.filter(p => p.module === module);
      
      // Extract unique action names
      const actions = [...new Set(modulePermissions.map(p => p.name))];
      
      return {
        name: module,
        actions: actions
      };
    });
    
    setPermissionGroups(groups);
  };

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
      
      // Fetch all permissions with their enabled status for the current role
      const rolePermissionsRes = await fetchWithAuth(
        `${BASE_API_URL}/v1/projects/${projectId}/roles/${roleId}/permissions/all`,
        null,
        true
      );

      if (!rolePermissionsRes.ok) {
        throw new Error(`Failed to fetch role permissions: ${rolePermissionsRes.status} ${rolePermissionsRes.statusText}`);
      }

      const rolePermsResponse = await rolePermissionsRes.json();
      console.log('Role permissions response:', rolePermsResponse);
      
      // Trích xuất dữ liệu từ response đảm bảo lấy đúng cấu trúc data
      let rolePermsWithStatus = [];
      
      // Kiểm tra cấu trúc phản hồi API và trích xuất dữ liệu phù hợp
      if (rolePermsResponse) {
        if (rolePermsResponse.data && Array.isArray(rolePermsResponse.data)) {
          // Cấu trúc API tiêu chuẩn: { data: [...] }
          rolePermsWithStatus = rolePermsResponse.data;
        } else if (Array.isArray(rolePermsResponse)) {
          // API trả về mảng trực tiếp
          rolePermsWithStatus = rolePermsResponse;
        } else if (typeof rolePermsResponse === 'object') {
          // Tìm kiếm trường dữ liệu khác
          const possibleDataFields = ['permissions', 'items', 'results', 'content'];
          for (const field of possibleDataFields) {
            if (rolePermsResponse[field] && Array.isArray(rolePermsResponse[field])) {
              rolePermsWithStatus = rolePermsResponse[field];
              break;
            }
          }
        }
      }
      
      console.log('Processed role permissions:', rolePermsWithStatus);
      
      // Extract enabled status for each permission
      const newEnabledStatus = {};
      
      if (Array.isArray(rolePermsWithStatus)) {
        rolePermsWithStatus.forEach(item => {
          if (item && item.permission && item.permission.id) {
            newEnabledStatus[item.permission.id] = item.isEnabled || false;
          } else if (item && item.id) {
            // Fallback: nếu permission được nhúng trực tiếp trong item
            newEnabledStatus[item.id] = item.isEnabled || false;
          }
        });
      }
      
      setPermissionEnabledStatus(newEnabledStatus);
      
      // Get enabled permissions for backwards compatibility
      const enabledPermissions = [];
      
      if (Array.isArray(rolePermsWithStatus)) {
        rolePermsWithStatus.forEach(item => {
          if (item && item.isEnabled) {
            if (item.permission) {
              enabledPermissions.push(item.permission);
            } else if (item.id) {
              // Fallback: nếu item chính là permission
              enabledPermissions.push(item);
            }
          }
        });
      }
      
      setRolePermissions(enabledPermissions);
      
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
    const permission = permissions.find(p => 
      p.module === module && 
      p.name === action
    );
    
    if (!permission) return false;
    
    // Check if this permission is in the enabled status map
    return permissionEnabledStatus[permission.id] === true;
  };

  const togglePermission = (module, action) => {
    const permission = permissions.find(p => 
      p.module === module && 
      p.name === action
    );
    
    if (!permission) {
      console.error('Permission not found:', module, action);
      return;
    }

    const isCurrentlyEnabled = permissionEnabledStatus[permission.id] === true;
    const newValue = !isCurrentlyEnabled;

    // Update changes object for API call
    setChanges(prev => ({
      ...prev,
      [permission.id]: newValue
    }));

    // Update local state for immediate feedback
    setPermissionEnabledStatus(prev => ({
      ...prev,
      [permission.id]: newValue
    }));
    
    // Update rolePermissions for backward compatibility
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
      // Convert changes to a permission map for the API
      const permissionUpdates = {};
      
      // Add all permissions with their enabled status
      for (const permissionId in changes) {
        // Đảm bảo permissionId là một số
        const numericPermissionId = parseInt(permissionId, 10);
        if (!isNaN(numericPermissionId)) {
          permissionUpdates[numericPermissionId] = changes[permissionId];
        } else {
          permissionUpdates[permissionId] = changes[permissionId];
        }
      }
      
      console.log('Sending permission updates:', permissionUpdates);
      
      // Make the API call to update role permissions
      const res = await fetchWithAuth(
        `${BASE_API_URL}/v1/projects/${projectId}/roles/${roleId}/permissions`,
        null,
        true,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(permissionUpdates)
        }
      );

      const status = res.status;
      let responseText = '';
      
      try {
        const responseBody = await res.text();
        responseText = responseBody;
        console.log('Response body:', responseBody);
      } catch (textError) {
        console.error('Error reading response text:', textError);
      }

      if (!res.ok) {
        throw new Error(`Failed to save permission changes: ${status} - ${responseText}`);
      }

      let response;
      try {
        response = JSON.parse(responseText);
        console.log('Save permissions response:', response);
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        response = { message: 'Permissions updated successfully' };
      }
      
      setSuccessMessage(response?.message || 'Permissions updated successfully');
      setChanges({});
      
      // Refresh permissions after save to ensure data consistency
      await fetchPermissionsData();
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

  if (permissionGroups.length === 0) {
    return <div className="p-6">Organizing permissions...</div>;
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
              : 'bg-emerald-500 text-white hover:bg-emerald-600'
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
                  const permission = permissions.find(p => 
                    p.module === group.name && 
                    p.name === action
                  );
                  
                  const isEnabled = isPermissionEnabled(group.name, action);

                  // Format action name for display (capitalize first letter of each word)
                  const displayName = action
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');

                  return (
                    <tr key={action}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {displayName}
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
                          <div 
                            className={`w-11 h-6 ${permission ? 'bg-gray-200' : 'bg-gray-100'} rounded-full 
                              peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                              after:bg-white after:border-gray-300 after:border after:rounded-full 
                              after:h-5 after:w-5 after:transition-all 
                              ${isEnabled ? 'bg-emerald-500 after:translate-x-full after:border-white' : ''}
                              ${!permission ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                              peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300`}
                          ></div>
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