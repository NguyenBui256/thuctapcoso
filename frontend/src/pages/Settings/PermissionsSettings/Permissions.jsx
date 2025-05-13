import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../../utils/AuthUtils';
import { BASE_API_URL } from '../../../common/constants';
import PermissionsTable from './PermissionsTable';

const Permissions = ({ projectId, roleId: initialRoleId, isNewRole = false }) => {
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(initialRoleId);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingRole, setIsAddingRole] = useState(isNewRole);
  const [newRoleName, setNewRoleName] = useState('');
  const [addingRoleLoading, setAddingRoleLoading] = useState(false);
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
        setError('Failed to get user information. Please try logging in again.');
      }
    }
  }, []);

  useEffect(() => {
    // Only fetch roles if we have both projectId and userId
    if (projectId && userId) {
      fetchRoles();
    }
  }, [projectId, userId]);

  useEffect(() => {
    if (projectId && selectedRoleId && userId) {
      fetchRoleDetails();
    }
  }, [projectId, selectedRoleId, userId]);

  // Update selectedRoleId when initialRoleId changes (from URL)
  useEffect(() => {
    if (initialRoleId) {
      setSelectedRoleId(initialRoleId);
    }
  }, [initialRoleId]);

  const fetchRoles = async () => {
    if (!userId) {
      setError('User ID not available. Please log in again.');
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
        throw new Error(`Failed to fetch roles: ${res.status} ${res.statusText}`);
      }

      const response = await res.json();
      console.log('Roles response:', response);
      
      // Extract roles from the response
      let rolesData = [];
      if (response && response.data && Array.isArray(response.data)) {
        rolesData = response.data;
      } else if (Array.isArray(response)) {
        rolesData = response;
      }
      
      setRoles(rolesData);

      // If no role is selected and we have roles, select the first one
      if (!selectedRoleId && rolesData.length > 0) {
        setSelectedRoleId(rolesData[0].id);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError(err.message || 'An error occurred while fetching roles');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoleDetails = async () => {
    if (!userId || !selectedRoleId) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetchWithAuth(
        `${BASE_API_URL}/v1/user/${userId}/project/${projectId}/roles/${selectedRoleId}`,
        null,
        true
      );
      
      if (!res.ok) {
        throw new Error(`Failed to fetch role details: ${res.status} ${res.statusText}`);
      }
      
      const response = await res.json();
      console.log('Role details response:', response);
      
      // Extract role data from the response
      let roleData = response;
      if (response && response.data) {
        roleData = response.data;
      }
      
      setRole(roleData);
    } catch (err) {
      console.error('Error fetching role details:', err);
      setError(err.message || 'An error occurred while fetching role details');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (roleId) => {
    // Use window.location to change the URL
    window.location.href = `/projects/${projectId}/settings?section=permissions&subsection=${roleId}`;
  };

  const handleAddRole = async () => {
    if (!userId) {
      setError('User ID not available. Please log in again.');
      return;
    }
    
    if (!newRoleName.trim()) {
      setError('Role name cannot be empty');
      return;
    }

    setAddingRoleLoading(true);
    setError(null);

    try {
      // Create a new role with empty permissions - they will be initialized on the backend
      const res = await fetchWithAuth(
        `${BASE_API_URL}/v1/user/${userId}/project/${projectId}/roles`,
        null,
        true,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            roleName: newRoleName,
            permissionIds: [] // Empty permissions - backend will initialize default ones
          })
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.message || `Failed to create role: ${res.status} ${res.statusText}`);
      }

      const response = await res.json();
      console.log('Create role response:', response);
      
      // Extract new role from response
      let newRole = response;
      if (response && response.data) {
        newRole = response.data;
      }
      
      // Show success message
      setError(null);
      
      // Refresh roles list
      await fetchRoles();
      
      // Select the newly created role
      if (newRole && newRole.id) {
        handleRoleChange(newRole.id);
      }
      
      // Reset form
      setNewRoleName('');
      setIsAddingRole(false);
    } catch (err) {
      console.error('Error creating role:', err);
      setError(err.message || 'An error occurred while creating the role');
    } finally {
      setAddingRoleLoading(false);
    }
  };

  if (loading && !role && !roles.length) {
    return <div className="p-6">Loading roles...</div>;
  }

  if (!userId) {
    return <div className="p-6 text-red-500">Error: User information not available. Please log in again.</div>;
  }

  return (
    <div className="max-w-full">
      {!selectedRoleId || isAddingRole ? (
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {isAddingRole ? 'Create New Role' : 'Select a Role'}
              </h2>
              {!isAddingRole && (
                <button
                  onClick={() => setIsAddingRole(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
                >
                  + New Role
                </button>
              )}
            </div>
          
            {isAddingRole ? (
              <div className="mb-6 p-4 bg-gray-50 rounded-md">
                <h3 className="text-lg font-medium mb-2">Role Details</h3>
                <div className="flex items-center">
                  <input 
                    type="text"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="Role Name"
                    className="flex-1 p-2 border rounded mr-2"
                  />
                  <button
                    onClick={handleAddRole}
                    disabled={addingRoleLoading || !newRoleName.trim()}
                    className={`px-4 py-2 rounded ${
                      addingRoleLoading || !newRoleName.trim()
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {addingRoleLoading ? 'Creating...' : 'Create'}
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingRole(false);
                      setNewRoleName('');
                      // Redirect back to the main settings page
                      window.location.href = `/projects/${projectId}/settings?section=permissions&subsection=roles`;
                    }}
                    className="px-4 py-2 ml-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                {error && (
                  <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">
                    {error}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {roles.map((roleItem) => (
                    <button
                      key={roleItem.id}
                      onClick={() => handleRoleChange(roleItem.id)}
                      className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                      {roleItem.roleName}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6 p-6 pb-0">
            <h1 className="text-2xl font-semibold text-gray-800">
              Permissions: {role ? role.roleName : ''}
            </h1>
          </div>
          
          <PermissionsTable projectId={projectId} roleId={selectedRoleId} />
        </>
      )}
    </div>
  );
};

export default Permissions; 