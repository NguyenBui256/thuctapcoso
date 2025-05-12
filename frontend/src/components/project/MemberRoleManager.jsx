import React, { useState, useEffect } from 'react';
import { FiX, FiEdit, FiCheck, FiArrowDown } from 'react-icons/fi';
import { projectService } from '../../services/projectService';
import { getUserInitials } from '../../utils/helpers';
import { BASE_API_URL } from '../../common/constants';
import { fetchWithAuth } from '../../utils/AuthUtils';

const MemberRoleManager = ({ projectId, userId, onClose, onRoleUpdate }) => {
    const [members, setMembers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingMember, setEditingMember] = useState(null);
    const [selectedRole, setSelectedRole] = useState(null);
    const [updating, setUpdating] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);

    // Fetch members and roles when component mounts
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch project members
                const membersResponse = await fetchWithAuth(
                    `${BASE_API_URL}/v1/user/${userId}/project/${projectId}/members`,
                    `/projects/${projectId}`,
                    true
                );

                if (!membersResponse || !membersResponse.ok) {
                    throw new Error('Failed to fetch project members');
                }

                const membersData = await membersResponse.json();

                let membersArray;
                if (Array.isArray(membersData)) {
                    membersArray = membersData;
                } else if (membersData && Array.isArray(membersData.data)) {
                    membersArray = membersData.data;
                } else {
                    membersArray = [];
                }

                console.log('Fetched members:', membersArray);
                setMembers(membersArray);

                // Fetch project roles
                const rolesResponse = await fetchWithAuth(
                    `${BASE_API_URL}/v1/user/${userId}/project/${projectId}/roles`,
                    `/projects/${projectId}`,
                    true
                );

                if (!rolesResponse || !rolesResponse.ok) {
                    throw new Error('Failed to fetch project roles');
                }

                const rolesData = await rolesResponse.json();

                let rolesArray;
                if (Array.isArray(rolesData)) {
                    rolesArray = rolesData;
                } else if (rolesData && Array.isArray(rolesData.data)) {
                    rolesArray = rolesData.data;
                } else {
                    rolesArray = [];
                }

                console.log('Fetched roles:', rolesArray);
                setRoles(rolesArray);
            } catch (err) {
                console.error('Error loading data:', err);
                setError('Failed to load members or roles');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [projectId, userId]);

    // Start editing a member's role
    const handleEditRole = (member) => {
        setEditingMember(member);
        // Set current role as selected
        const currentRole = roles.find(role => role.roleName === member.roleName);
        setSelectedRole(currentRole?.id);
    };

    // Cancel editing
    const handleCancelEdit = () => {
        setEditingMember(null);
        setSelectedRole(null);
    };

    // Update member role
    const handleUpdateRole = async () => {
        if (!editingMember || !selectedRole) return;

        setUpdating(true);
        setError(null);

        try {
            const response = await fetchWithAuth(
                `${BASE_API_URL}/v1/user/${userId}/project/${projectId}/members/${editingMember.userId}`,
                `/projects/${projectId}`,
                true,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: editingMember.userId,
                        roleId: selectedRole,
                        isAdmin: editingMember.isAdmin || false
                    }),
                }
            );

            if (!response || !response.ok) {
                throw new Error('Failed to update member role');
            }

            const updatedMemberData = await response.json();
            console.log('Updated member:', updatedMemberData);

            // Update local members array with new role
            const updatedRole = roles.find(role => role.id === selectedRole);
            const updatedMembers = members.map(member => {
                if (member.userId === editingMember.userId) {
                    return {
                        ...member,
                        roleName: updatedRole.roleName
                    };
                }
                return member;
            });

            setMembers(updatedMembers);
            setEditingMember(null);
            setSelectedRole(null);

            // Show success message
            setSuccessMessage(`Updated ${editingMember.username || editingMember.userFullName}'s role successfully`);
            setTimeout(() => setSuccessMessage(null), 3000);

            // Notify parent component
            if (onRoleUpdate) {
                onRoleUpdate(updatedMembers);
            }
        } catch (err) {
            console.error('Error updating role:', err);
            setError(err.message || 'Failed to update role');
        } finally {
            setUpdating(false);
        }
    };

    // Handle image error for avatars
    const handleImageError = (e, member) => {
        e.target.style.display = 'none';
        e.target.parentElement.style.backgroundColor = 'rgb(153, 214, 220)';
        e.target.parentElement.innerHTML = `<span class="text-sm font-medium">${getUserInitials(member.username || member.userFullName)}</span>`;
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl p-6 max-w-md">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading team members and roles...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-900">Manage Team Roles</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                        <FiX className="h-5 w-5" />
                    </button>
                </div>

                {/* Error message */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success message */}
                {successMessage && (
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 m-4">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-green-700">{successMessage}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Body */}
                <div className="px-6 py-4 flex-1 overflow-y-auto">
                    <div className="space-y-4">
                        {members.length > 0 ? (
                            members.map((member) => (
                                <div
                                    key={member.userId}
                                    className={`p-4 border rounded-lg ${editingMember?.userId === member.userId ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 bg-taiga-primary flex items-center justify-center text-white rounded-full mr-3">
                                                {member?.avatar ? (
                                                    <img
                                                        src={member.avatar}
                                                        alt={member.username}
                                                        className="w-full h-full object-cover rounded-full"
                                                        onError={(e) => handleImageError(e, member)}
                                                    />
                                                ) : (
                                                    <span className="text-sm font-medium">{getUserInitials(member.username || member.userFullName)}</span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{member.userFullName || member.username}</div>
                                                <div className="text-sm text-gray-500">{member.roleName}</div>
                                            </div>
                                        </div>

                                        {/* Edit button or Actions */}
                                        {editingMember?.userId === member.userId ? (
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="text-gray-400 hover:text-gray-500"
                                                    disabled={updating}
                                                >
                                                    <FiX className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={handleUpdateRole}
                                                    className="text-green-500 hover:text-green-600"
                                                    disabled={updating}
                                                >
                                                    {updating ? (
                                                        <div className="h-5 w-5 border-t-2 border-b-2 border-green-500 rounded-full animate-spin"></div>
                                                    ) : (
                                                        <FiCheck className="h-5 w-5" />
                                                    )}
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleEditRole(member)}
                                                className="text-blue-500 hover:text-blue-600"
                                                disabled={updating}
                                            >
                                                <FiEdit className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Role selector (shown when editing) */}
                                    {editingMember?.userId === member.userId && (
                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Choose Role
                                            </label>
                                            <div className="relative">
                                                <select
                                                    value={selectedRole || ''}
                                                    onChange={(e) => setSelectedRole(parseInt(e.target.value))}
                                                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                                >
                                                    <option value="" disabled>Select a role</option>
                                                    {roles.map((role) => (
                                                        <option key={role.id} value={role.id}>
                                                            {role.roleName}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                                                    <FiArrowDown className="h-4 w-4" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                No team members found
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberRoleManager; 