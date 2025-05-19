import React, { useState, useEffect } from 'react';
import { FiX, FiUser, FiUserPlus, FiMail, FiTrash2, FiAward } from 'react-icons/fi';
import { getUserInitials } from '../../utils/helpers';
import { fetchWithAuth } from '../../utils/AuthUtils';
import { BASE_API_URL } from '../../common/constants';
import { useNavigate, Link } from 'react-router-dom';

const MemberContent = ({ members, currentUser, loading, error, onLeaveProject, projectId, sortOption, sortDirection }) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [projectRoles, setProjectRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [leavingProject, setLeavingProject] = useState(false);
  const navigate = useNavigate();

  // Check if current user is a project manager (has admin rights)
  const isProjectManager = currentUser?.isAdmin || currentUser?.roleName === "PROJECT_MANAGER" || false;

  // Mock badges for demonstration
  const mockBadges = ['Title 1', 'Title 2', 'Title 3'];

  // Fetch project roles when modal opens
  useEffect(() => {
    if (showInviteModal) {
      fetchProjectRoles();
    }
  }, [showInviteModal, projectId]);

  // Function to fetch project roles from the backend
  const fetchProjectRoles = async () => {
    if (!projectId || !currentUser) return;

    setRolesLoading(true);
    try {
      const response = await fetchWithAuth(
        `${BASE_API_URL}/v1/user/${currentUser.userId}/project/${projectId}/roles`,
        `/projects/${projectId}`, // redirect path if auth fails
        true, // auth is required
        { method: 'GET' }
      );

      if (!response) {
        throw new Error('Authentication failed');
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch project roles: ${response.statusText}`);
      }

      const data = await response.json();

      // Process response based on data structure
      let roles = [];
      if (Array.isArray(data)) {
        roles = data;
      } else if (data && Array.isArray(data.data)) {
        roles = data.data;
      } else {
        throw new Error('Invalid API response format for roles');
      }

      setProjectRoles(roles);

      // Set default role to the first one if available
      if (roles.length > 0) {
        setInviteRole(roles[0].id.toString());
      }
    } catch (error) {
      console.error('Error fetching project roles:', error);
      setInviteError('Failed to load project roles. Please try again.');
    } finally {
      setRolesLoading(false);
    }
  };

  // Function to get random badges for demonstration
  const getRandomBadges = (userId) => {
    if (!userId) return [];
    // Use userId to generate consistent "random" badges
    const num = parseInt(userId.toString().slice(-1)) % 3 + 1;
    return mockBadges.slice(0, num);
  };

  // Get sort status text for display
  const getSortStatusText = () => {
    if (sortOption === 'none') return null;

    const direction = sortDirection === 'asc' ? 'ascending' : 'descending';
    const type = sortOption === 'power' ? 'total power' : 'number of badges';

    return `Sorted by ${type} (${direction})`;
  };

  const handleImageError = (e, member) => {
    e.target.style.display = 'none';
    e.target.parentElement.style.backgroundColor = 'rgb(153, 214, 220)';
    e.target.parentElement.innerHTML = `<span class="text-sm font-medium">${getUserInitials(member.username)}</span>`;
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();

    // Validate email
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      setInviteError('Please enter a valid email address');
      return;
    }

    // Validate role
    if (!inviteRole) {
      setInviteError('Please select a role');
      return;
    }

    setInviting(true);
    setInviteError(null);

    try {
      // Prepare the invitation data
      const inviteData = {
        email: inviteEmail,
        roleId: Number(inviteRole), // Convert role selection to actual roleId
        isAdmin: false
      };

      // Call the API to invite the user using fetchWithAuth
      const response = await fetchWithAuth(
        `${BASE_API_URL}/v1/user/${currentUser.userId}/project/${projectId}/members/invite`,
        `/projects/${projectId}`, // redirect path if auth fails
        true, // auth is required
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(inviteData),
        }
      );

      if (!response) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();

      if (response.ok) {
        setInviteSuccess(true);
        setInviteEmail('');

        // Reset success message after 3 seconds
        setTimeout(() => {
          setInviteSuccess(false);
          setShowInviteModal(false); // Close modal after success message
        }, 3000);
      } else {
        setInviteError(data.message || 'Failed to send invitation. Please try again.');
      }
    } catch (err) {
      setInviteError('Failed to send invitation. Please try again.');
      console.error(err);
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = (memberId) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      // Mock successful removal
      console.log('Removing team member:', memberId);
      // In the future, this would call an API to remove the member
      alert('This functionality will be implemented in a future update.');
    }
  };

  // New function to handle leaving a project
  const handleLeaveProject = async () => {
    if (!window.confirm('Are you sure you want to leave this project?')) {
      return;
    }

    if (!projectId || !currentUser) {
      console.error('Missing project ID or user information');
      return;
    }

    setLeavingProject(true);

    try {
      const response = await fetchWithAuth(
        `${BASE_API_URL}/v1/user/${currentUser.userId}/project/${projectId}/members/leave`,
        '/projects',
        true,
        { method: 'POST' }
      );

      if (!response) {
        throw new Error('Authentication failed');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to leave project');
      }

      // Navigate back to projects list
      navigate('/projects');

      // If onLeaveProject is provided as a prop, call it
      if (onLeaveProject && typeof onLeaveProject === 'function') {
        onLeaveProject();
      }

    } catch (error) {
      console.error('Error leaving project:', error);
      alert(error.message || 'Failed to leave project. Please try again.');
    } finally {
      setLeavingProject(false);
    }
  };

  const MemberCard = ({ member, isCurrentUser }) => {
    const badges = getRandomBadges(member.userId);

    return (
      <div className={`bg-white rounded-lg shadow-sm p-4 mb-4 ${isCurrentUser ? 'border-2 border-blue-400' : ''}`}>
        <div className="flex items-start">
          <Link to={`/users/${member.userId}`} className="w-12 h-12 bg-taiga-primary flex items-center justify-center text-white rounded-full mr-4 hover:brightness-90">
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
          </Link>

          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  <Link to={`/users/${member.userId}`} className="hover:underline">
                    {member.userFullName || member.username}
                  </Link>
                  {member.isAdmin && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      Admin
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-600">{member.roleName || 'Team Member'}</p>
              </div>

              <div>
                {isCurrentUser ? (
                  <button
                    onClick={handleLeaveProject}
                    disabled={leavingProject}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {leavingProject ? (
                      <>
                        <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                        Leaving...
                      </>
                    ) : (
                      <>
                        <FiX className="mr-1" /> Leave Project
                      </>
                    )}
                  </button>
                ) : isProjectManager && (
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <FiTrash2 className="mr-1 text-red-500" /> Remove
                  </button>
                )}
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500 mr-2">Badges:</span>
                <div className="flex flex-wrap gap-1 items-center">
                  {badges.length > 0 ? (
                    <>
                      {badges.map((badge, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {badge}
                        </span>
                      ))}
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800 ml-1">
                        <FiAward className="mr-1" />
                        {badges.length}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-400">No badges yet</span>
                  )}
                </div>
              </div>

              <div className="mt-2 flex items-center">
                <span className="text-sm font-medium text-gray-500 mr-2">Total Power:</span>
                <span className="text-sm font-bold">{member.totalPoint || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Members</h2>
          {getSortStatusText() && (
            <div className="text-sm text-gray-500 mt-1">
              {getSortStatusText()}
            </div>
          )}
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-taiga-primary hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <FiUserPlus className="mr-2" /> Invite Member
        </button>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-taiga-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading team members...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div>
          {/* Current User Section */}
          {currentUser && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Your Profile</h3>
              <MemberCard member={currentUser} isCurrentUser={true} />
            </div>
          )}

          {/* Other Members Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">All Team Members</h3>
            {members.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {members.map((member) => (
                  (!currentUser || member.userId !== currentUser.userId) && (
                    <MemberCard key={member.id} member={member} isCurrentUser={false} />
                  )
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <FiUser className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No team members found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-taiga-primary sm:mx-0 sm:h-10 sm:w-10">
                  <FiUserPlus className="h-6 w-6 text-white" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Invite Team Member</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Enter the email address of the person you want to invite to this project.
                    </p>
                  </div>

                  {inviteSuccess && (
                    <div className="mt-2 p-2 bg-green-50 text-green-800 rounded-md">
                      Invitation sent successfully!
                    </div>
                  )}

                  {inviteError && (
                    <div className="mt-2 p-2 bg-red-50 text-red-800 rounded-md">
                      {inviteError}
                    </div>
                  )}

                  <form onSubmit={handleInviteSubmit} className="mt-4">
                    <div className="mb-4">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiMail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border border-gray-300 rounded-md p-2"
                          placeholder="team.member@example.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      {rolesLoading ? (
                        <div className="animate-pulse h-10 bg-gray-200 rounded-md"></div>
                      ) : (
                        <select
                          id="role"
                          name="role"
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                          value={inviteRole}
                          onChange={(e) => setInviteRole(e.target.value)}
                          disabled={projectRoles.length === 0}
                        >
                          {projectRoles.length === 0 ? (
                            <option value="">No roles available</option>
                          ) : (
                            projectRoles.map((role) => (
                              <option key={role.id} value={role.id.toString()}>
                                {role.roleName}
                              </option>
                            ))
                          )}
                        </select>
                      )}
                    </div>

                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                      <button
                        type="submit"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-taiga-primary text-base font-medium text-white hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                        disabled={inviting}
                      >
                        {inviting ? 'Sending...' : 'Send Invitation'}
                      </button>
                      <button
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                        onClick={() => setShowInviteModal(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberContent; 