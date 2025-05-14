import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../../utils/AuthUtils';
import { BASE_API_URL } from '../../../common/constants';
import { toast } from 'react-toastify';

function PermissionsTable({ projectId, roleId }) {
  const [permissions, setPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [permissionEnabledStatus, setPermissionEnabledStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [changes, setChanges] = useState({});
  const [userId, setUserId] = useState(null);
  const [permissionGroups, setPermissionGroups] = useState([]);
  const [rolePermissionsData, setRolePermissionsData] = useState([]);

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
      
      const permissionsList = Array.isArray(allPermissions) ? allPermissions : [];
      setPermissions(permissionsList);
      
      console.log('All permissions set:', permissionsList);
      
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
      
      // Trích xuất dữ liệu từ response đảm bảo lấy đúng cấu trúc data
      let rolePermsWithStatus = [];
      
      // Kiểm tra cấu trúc phản hồi API và trích xuất dữ liệu phù hợp
      rolePermsWithStatus = rolePermsResponse.data.data;
      console.log('PERMISSIONS:', rolePermsWithStatus);
      
      // Map permissions để matching dễ dàng hơn
      const permissionsMap = {};
      permissionsList.forEach(p => {
        permissionsMap[p.id] = p;
      });
      
      // Extract enabled status for each permission
      const newEnabledStatus = {};
      
      rolePermsWithStatus.forEach(item => {
        if (item && item.permission && item.permission.id) {
          // Force isEnabled to be a boolean
          const isEnabled = item.isEnabled === true;
          newEnabledStatus[item.permission.id] = isEnabled;
        } else if (item && item.permissionId) {
          // Fallback: nếu chỉ có permissionId
          const isEnabled = item.isEnabled === true;
          newEnabledStatus[item.permissionId] = isEnabled;
        }
      });
    
      setPermissionEnabledStatus(newEnabledStatus);
      
      // Get enabled permissions for backwards compatibility
      const enabledPermissions = [];
      
      rolePermsWithStatus.forEach(item => {
        if (item && item.isEnabled) {
          if (item.permission) {
            enabledPermissions.push(item.permission);
          } else if (item.permissionId && permissionsMap[item.permissionId]) {
            enabledPermissions.push(permissionsMap[item.permissionId]);
          }
        }
      });
      
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
    
    // Lấy trạng thái trực tiếp từ map
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

    const permissionId = permission.id;
    
    // Lấy trạng thái hiện tại từ map
    const isCurrentlyEnabled = permissionEnabledStatus[permissionId] === true;
    const newValue = !isCurrentlyEnabled;
    
    console.log(`Toggling permission ${permissionId} (${module}.${action}): ${isCurrentlyEnabled} -> ${newValue}`);

    // Tìm permission trong rolePermissionsData (nếu có)
    let permissionData = rolePermissionsData.find(p => 
      (p.permission && p.permission.id === permissionId) || 
      (p.permissionId === permissionId)
    );

    console.log('Found permission data:', permissionData);
    
    let prpId = null;
    
    if (permissionData) {
      prpId = permissionData.id;
      
      // Cập nhật rolePermissionsData để đồng bộ với UI
      setRolePermissionsData(prev => 
        prev.map(item => {
          if ((item.permission && item.permission.id === permissionId) ||
              (item.permissionId === permissionId)) {
            return {...item, isEnabled: newValue};
          }
          return item;
        })
      );
    }

    // Cập nhật UI ngay lập tức
    setPermissionEnabledStatus(prev => ({
      ...prev,
      [permissionId]: newValue
    }));
    
    // Save changes directly 
    saveSinglePermission(prpId, permissionId, newValue);
  };
  
  const saveSinglePermission = async (prpId, permissionId, isEnabled) => {
    if (!userId) return;

    setSaving(true);
    setError(null);

    try {
      const payload = { isEnabled };
      
      console.log(`Updating permission ${permissionId} to ${isEnabled ? 'enabled' : 'disabled'}`);
      
      // Sử dụng endpoint mới cập nhật từng permission
      const res = await fetchWithAuth(
        `${BASE_API_URL}/v1/projects/${projectId}/roles/${roleId}/permission/${permissionId}`,
        null,
        true,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
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
        throw new Error(`Failed to save permission change: ${status} - ${responseText}`);
      }

      let response;
      try {
        response = JSON.parse(responseText);
        console.log('Save permission response:', response);
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        response = { message: 'Permission updated successfully' };
      }
      
      // Thay thế hiển thị trong component bằng toast notification
      toast.success('Update Success', {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Refresh permissions after a short delay to ensure UI is consistent
      setTimeout(() => fetchPermissionsData(), 1000);
    } catch (err) {
      console.error('Error saving permission:', err);
      setError(err.message || 'An error occurred while saving permission');
      
      // Show error with toast
      toast.error(err.message || 'Failed to update permission', {
        position: "bottom-right",
        autoClose: 5000,
      });
      
      // Revert UI change on error
      setPermissionEnabledStatus(prev => ({
        ...prev,
        [permissionId]: !isEnabled
      }));
    } finally {
      setSaving(false);
    }
  };

  const initializePermissions = async () => {
    if (!userId) return;

    setSaving(true);
    setError(null);

    try {
      console.log(`Initializing all permissions for role ${roleId}`);
      
      // Gọi API để khởi tạo lại tất cả quyền
      const res = await fetchWithAuth(
        `${BASE_API_URL}/v1/projects/${projectId}/roles/${roleId}/permissions/init?defaultEnabled=true`,
        null,
        true,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
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
        throw new Error(`Failed to initialize permissions: ${status} - ${responseText}`);
      }

      let response;
      try {
        response = JSON.parse(responseText);
        console.log('Initialize permissions response:', response);
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        response = { message: 'Permissions initialized successfully' };
      }
      
      // Thay thế hiển thị message bằng toast
      toast.success('Permissions initialized successfully', {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Refresh permissions to show updated state
      await fetchPermissionsData();
    } catch (err) {
      console.error('Error initializing permissions:', err);
      setError(err.message || 'An error occurred while initializing permissions');
      
      // Show error with toast
      toast.error(err.message || 'Failed to initialize permissions', {
        position: "bottom-right",
        autoClose: 5000,
      });
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
      {error && (
        <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">
          {error}
        </div>
      )}

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

                  const toggleClasses = `w-11 h-6 ${isEnabled ? 'bg-emerald-500' : 'bg-gray-200'} rounded-full 
                    peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                    after:bg-white after:border-gray-300 after:border after:rounded-full 
                    after:h-5 after:w-5 after:transition-all 
                    ${isEnabled ? 'after:translate-x-full after:border-white' : ''}
                    ${!permission ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300`;

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
                          <div className={toggleClasses}></div>
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